# Kapitel 07 – Records & Immutability

## Mental Model

```text
record Money(BigDecimal amount, Currency currency) {}

erzeugt automatisch:
  private final BigDecimal amount;      ← Felder final, Klasse final
  private final Currency currency;
  Money(BigDecimal, Currency)           ← kanonischer Konstruktor
  amount() / currency()                 ← Accessors (KEIN getAmount())
  equals / hashCode                     ← komponentenweise
  toString                              ← Money[amount=10, currency=EUR]

Immutability = Zustand steht nach dem Konstruktor fest
             → Änderung erzeugt ein NEUES Objekt (withX / neuer Konstruktoraufruf)
```

Ein Record ist ein **transparenter Datenträger**: Der Zustand ist exakt die Komponentenliste. Alles,
was diese Transparenz bricht (Setter, veränderliche Felder, „berechnete Identität“), gehört nicht in
einen Record, sondern in eine normale Klasse.

## Syntax / API

### Kanonischer Konstruktor

Der Record-Header **ist** die Signatur des kanonischen Konstruktors. Man kann ihn ausschreiben:

```java
record Money(BigDecimal amount, Currency currency) {

    // kanonischer Konstruktor – ausgeschrieben, MUSS alle Felder zuweisen
    Money(BigDecimal amount, Currency currency) {
        Objects.requireNonNull(amount, "amount");
        this.amount = amount;
        this.currency = currency;
    }
}
```

### Kompakter Konstruktor

Meistens will man nur validieren oder normalisieren – dafür gibt es die kompakte Form ohne
Parameterliste und **ohne** `this.x = x`:

```java
record Money(BigDecimal amount, Currency currency) {

    Money {
        Objects.requireNonNull(amount, "amount");
        Objects.requireNonNull(currency, "currency");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("amount must not be negative: " + amount);
        }
        amount = amount.stripTrailingZeros();   // Normalisierung: Parameter neu zuweisen!
    }
}
```

Die Zuweisung `amount = …` verändert den **Parameter**; die Zuweisung an das Feld macht der Compiler
danach automatisch. `this.amount = …` im kompakten Konstruktor ist ein Compilefehler.

### Defensive Kopien

Records schützen **nicht** automatisch vor veränderlichen Komponenten:

```java
record Team(String name, List<String> members) {

    Team {
        members = List.copyOf(members);     // Kopie beim Rein
    }
}

var list = new ArrayList<>(List.of("Jan"));
var team = new Team("A", list);
list.add("Hacker");                         // team.members() bleibt ["Jan"]
team.members().add("Hacker");               // UnsupportedOperationException
```

`List.copyOf` erledigt beides: kopieren **und** unveränderlich machen. Achtung: `List.copyOf`
erlaubt keine `null`-Elemente. Für Arrays oder `Date` braucht es echte Kopien:

```java
record Snapshot(byte[] data) {
    Snapshot { data = data.clone(); }
    byte[] data() { return data.clone(); }   // Kopie beim Raus
}
```

### equals / hashCode / toString

```java
new Money(new BigDecimal("10"), EUR).equals(new Money(new BigDecimal("10"), EUR));  // true
```

Komponentenweise: primitive mit `==`, Referenzen mit `Objects.equals`. Wichtig:

```java
new BigDecimal("10.0").equals(new BigDecimal("10"));   // false (Skalierung!)
```

Darum bei `BigDecimal`-Komponenten im kompakten Konstruktor normalisieren (`stripTrailingZeros`
oder `setScale(2, RoundingMode.HALF_UP)`).

Arrays vergleichen per **Identität** – `record Snapshot(byte[] data)` hat kein sinnvolles `equals`,
es sei denn man überschreibt es selbst mit `Arrays.equals`.

### Statische Factory & Zusatzmethoden

```java
record Email(String value) {

    private static final Pattern PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+$");

    Email {
        if (value == null || !PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("invalid email: " + value);
        }
        value = value.toLowerCase(Locale.ROOT);
    }

    static Email of(String raw) {
        return new Email(raw.trim());
    }

    String domain() {
        return value.substring(value.indexOf('@') + 1);
    }
}
```

Statische Factories dürfen sprechende Namen haben (`Money.euro(10)`, `Email.of(..)`) und auch
Caching betreiben – der Konstruktor kann `private` sein, wenn nur über die Factory gebaut werden soll.

### „Wither“-Muster

Immutable heißt nicht „unveränderbar im Ablauf“, sondern „Änderung = neues Objekt“:

```java
record User(Long id, String name, String email, boolean active) {

    User withEmail(String newEmail) {
        return new User(id, name, newEmail, active);
    }

    User deactivated() {
        return new User(id, name, email, false);
    }
}

var updated = user.withEmail("neu@example.com").deactivated();
```

Ab ca. 5–6 Komponenten wird das mühsam – dann Builder oder ein Zwischenobjekt einsetzen.

### Nested Records

```java
record Address(String street, String city, String zip) {}
record Customer(Long id, String name, Address address, List<Order> orders) {

    Customer {
        orders = List.copyOf(orders);
    }
}
```

Records lassen sich beliebig schachteln – ideal für JSON-nahe API-Modelle.

### sealed interface + record = Sum Type

```java
sealed interface PaymentResult permits Success, Declined, Error {}

record Success(String transactionId, BigDecimal amount) implements PaymentResult {}
record Declined(String reason)                          implements PaymentResult {}
record Error(String code, String message)               implements PaymentResult {}

String describe(PaymentResult result) {
    return switch (result) {                       // exhaustiv, kein default nötig
        case Success s  -> "ok " + s.transactionId();
        case Declined d -> "abgelehnt: " + d.reason();
        case Error e    -> "fehler " + e.code();
    };
}
```

Mit Record Patterns lassen sich die Komponenten direkt dekonstruieren:

```java
String describe(PaymentResult result) {
    return switch (result) {
        case Success(String id, BigDecimal amount) -> "ok " + id + " " + amount;
        case Declined(String reason)               -> "abgelehnt: " + reason;
        case Error(String code, var message)       -> code + ": " + message;
    };
}
```

### Was ein Record nicht kann

```java
record X(int a) extends Base {}        // ✘ Records können nicht erben (sind implizit final)
record X(int a) { int b; }             // ✘ keine zusätzlichen Instanzfelder
record X(int a) { void setA(int a) {} } // technisch erlaubt, fachlich falsch – a ist final
```

Erlaubt sind: statische Felder, statische und Instanzmethoden, Interfaces implementieren,
verschachtelte Typen, Annotationen auf Komponenten.

## Typische Use Cases

- **DTOs**: Request/Response an der API-Grenze (`CreateUserRequest`, `UserResponse`).
- **Value Objects**: `Money`, `Email`, `Zip`, `UserId` – statt `String`/`BigDecimal` überall.
- **Zusammengesetzte Rückgabewerte** statt Out-Parametern oder `Object[]`.
- **Map-Keys**: `equals`/`hashCode` sind korrekt und kostenlos.
- **Sum Types** mit `sealed interface` für Ergebnis-/Zustandsmodelle.
- **Konfigurationsobjekte** (`@ConfigurationProperties` unterstützt Records).

Kein guter Use Case: JPA-Entities. Die brauchen einen No-Arg-Konstruktor, veränderliche Felder und
Proxies – ein Record kann das nicht.

## Clean-Code-Empfehlungen

- Validierung **immer** in den kompakten Konstruktor – dann kann es kein ungültiges Objekt geben.
- Veränderliche Komponenten (`List`, `Map`, Arrays, `Date`) defensiv kopieren, `List.copyOf` bevorzugen.
- Keine Setter, kein „wither“ für jedes Feld auf Verdacht – nur für fachlich sinnvolle Übergänge.
- Primitive Obsession vermeiden: `Email` statt `String`, `Money` statt `BigDecimal`.
- Accessors heißen `name()`, nicht `getName()` – nicht künstlich JavaBean-Namen nachbauen.
- `toString` von Records nicht für Logs mit Geheimnissen nutzen (`password`, Token) – dann selbst überschreiben.
- Immutability auch außerhalb von Records: Felder `final`, keine Setter, Collections unveränderlich zurückgeben.
- Records nicht zweckentfremden, wenn Identität ≠ Zustand ist (Entities haben ID-Identität).

## Häufige Fehler

```java
// FALSCH: this.x im kompakten Konstruktor
record Money(BigDecimal amount) {
    Money { this.amount = amount.abs(); }        // ✘ Compilefehler
}
// RICHTIG
record Money(BigDecimal amount) {
    Money { amount = amount.abs(); }             // Parameter zuweisen
}

// FALSCH: keine defensive Kopie → Record ist nur scheinbar immutable
record Team(List<String> members) {}
// RICHTIG
record Team(List<String> members) {
    Team { members = List.copyOf(members); }
}

// FALSCH: Validierung im Service statt im Typ
if (email.contains("@")) { repo.save(new User(email)); }
// RICHTIG
record Email(String value) {
    Email { if (!value.contains("@")) throw new IllegalArgumentException(value); }
}

// FALSCH: Record als JPA-Entity
@Entity record UserEntity(@Id Long id, String name) {}   // ✘ kein No-Arg-Ctor, final
// RICHTIG: Entity als Klasse, Record als DTO

// FALSCH: BigDecimal ohne Normalisierung als Komponente
new Money(new BigDecimal("10.00")).equals(new Money(new BigDecimal("10")));   // false
// RICHTIG: im kompakten Konstruktor setScale/stripTrailingZeros

// FALSCH: Getter-Namen nachbauen
record UserDto(Long id, String name) {
    Long getId() { return id; }                  // redundant
}

// FALSCH: mutable Feld über Umweg
record Config(Map<String, String> values) {
    Config { values = new HashMap<>(values); }   // Kopie, aber weiterhin veränderbar
}
// RICHTIG
record Config(Map<String, String> values) {
    Config { values = Map.copyOf(values); }
}
```

## Interview-relevante Details

- Records sind implizit `final` und erben von `java.lang.Record` – deshalb **kein** `extends`.
- Interfaces implementieren geht; `sealed interface` + Records ergibt einen algebraischen Datentyp.
- Der kompakte Konstruktor weist die Felder **nicht** zu, das macht der Compiler danach.
- `equals` vergleicht Komponenten; bei Arrays ist das Referenzvergleich (typische Falle).
- Records sind `Serializable`, wenn alle Komponenten es sind – Deserialisierung läuft über den
  kanonischen Konstruktor, Validierung greift also auch dort.
- Record Patterns (`case Point(int x, int y)`) und exhaustive `switch` über `sealed` ab Java 21.
- Immutability bringt Thread-Safety geschenkt: Kein sichtbarer Zustandswechsel, keine Synchronisation.
- Unterschied Record vs. Lombok `@Value`: Records sind Sprachfeature, kein Bytecode-Generator, und
  liefern Pattern Matching mit.
- Unveränderliche Collections: `List.of`/`Map.of` erlauben keine `null`, `Collections.unmodifiableList`
  ist nur eine **View** auf eine weiterhin veränderbare Liste.

## Zusammenfassung

- Record = final, Felder final, Accessor/`equals`/`hashCode`/`toString` automatisch.
- Kompakter Konstruktor für Validierung und Normalisierung (Parameter zuweisen, nicht `this.x`).
- Veränderliche Komponenten defensiv kopieren – `List.copyOf`, `Map.copyOf`, `clone()`.
- Statt Setter: neues Objekt über „wither“-Methoden oder statische Factories.
- `sealed interface` + Records + `switch` mit Record Patterns = typsichere Sum Types.
- Perfekt für DTOs und Value Objects, ungeeignet für JPA-Entities.
- Immutable Objekte sind einfacher testbar, sicher als Map-Key und ohne Zusatzaufwand threadsicher.
