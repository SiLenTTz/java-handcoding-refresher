# Kapitel 01 – Java Core

## Mental Model

```text
Klasse   = Bauplan (State + Verhalten)
Objekt   = Instanz auf dem Heap, Variable hält eine Referenz
Primitive = Wert direkt (int, long, double, boolean, char, ...)
Java ist IMMER pass-by-value – bei Objekten wird die Referenz kopiert
```

Für Handcoding zählt: Klassen, Konstruktoren, `final`, `equals`/`hashCode`, Strings, `switch` Expressions, Pattern Matching und `var` blind und fehlerfrei schreiben können.

## Syntax / API

### Klasse mit Invarianten

```java
public class Product {

    private final Long id;          // unveränderlich
    private final String name;
    private BigDecimal price;       // veränderbar – nur über Methode

    public Product(Long id, String name, BigDecimal price) {
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
        changePrice(price);
    }

    public void changePrice(BigDecimal newPrice) {
        if (newPrice == null || newPrice.signum() < 0) {
            throw new IllegalArgumentException("price must be >= 0");
        }
        this.price = newPrice;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
}
```

- `private` Felder, Zustand nur über sprechende Methoden ändern (`changePrice` statt `setPrice`).
- `final` Feld = muss genau einmal im Konstruktor gesetzt werden.
- `static` gehört zur Klasse, nicht zur Instanz (Konstanten, Factory-Methoden, Utilities).

### Access Modifier

| Modifier | Sichtbar in |
|---|---|
| `private` | nur Klasse |
| (package-private) | Klasse + Package |
| `protected` | Package + Subklassen |
| `public` | überall |

### Primitive vs Wrapper

```java
int count = 0;          // Default 0, nie null
Integer boxed = null;   // Wrapper, kann null sein
long big = 3_000_000_000L;
double ratio = 7 / 2;   // 3.0 – Integer-Division passiert VOR der Zuweisung!
double ok = 7 / 2.0;    // 3.5
```

Autoboxing: `Integer x = 5;` / Unboxing: `int y = x;` → `NullPointerException`, wenn `x == null`.

### Strings

```java
"Jan".equals(name);                 // null-safe, weil Literal links
Objects.equals(a, b);               // null-safe für beide Seiten
name.isBlank();                     // "" oder nur Whitespace (Java 11)
name.strip();                       // Unicode-aware trim
String.join(", ", names);
"%s (%d)".formatted(name, age);     // Java 15
```

Strings sind **immutable**. In Schleifen `StringBuilder` verwenden:

```java
var sb = new StringBuilder();
for (String part : parts) {
    sb.append(part).append(';');
}
String result = sb.toString();
```

Text Blocks (Java 15):

```java
String json = """
    {"name": "Jan"}
    """;
```

### Switch Expression (Java 14+)

```java
String label = switch (status) {
    case NEW, PAID -> "offen";
    case SHIPPED -> "unterwegs";
    case CANCELLED -> {
        log("storniert");
        yield "storniert";      // yield im Block
    }
};
```

- Kein Fall-through, kein `break`.
- Bei Enums muss die Expression **exhaustive** sein – sonst Compile-Fehler (gut: neue Enum-Werte fallen auf).

### Pattern Matching (Java 16/21)

```java
if (obj instanceof String s && !s.isBlank()) {
    return s.length();
}

sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}

double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Square s -> s.side() * s.side();
    };                          // exhaustive dank sealed – kein default nötig
}

String describe(Object o) {
    return switch (o) {
        case null -> "null";
        case Integer i when i > 100 -> "große Zahl";
        case Integer i -> "Zahl " + i;
        case String s -> "Text " + s;
        default -> "unbekannt";
    };
}
```

### Enums mit Verhalten

```java
enum Status {
    ACTIVE("aktiv"), BLOCKED("gesperrt");

    private final String label;

    Status(String label) { this.label = label; }

    public String label() { return label; }
}

Status.valueOf("ACTIVE");   // IllegalArgumentException bei unbekanntem Namen
Status.values();            // alle Werte
```

### `var` (Java 10)

```java
var users = new ArrayList<User>();      // gut: Typ steht rechts
var result = service.execute();        // schlecht: Typ unklar
```

Nur für lokale Variablen, nicht für Felder/Parameter/Return-Typen. `var x = null;` kompiliert nicht.

## equals / hashCode

Vertrag:

1. `a.equals(b)` ⇒ `a.hashCode() == b.hashCode()`
2. reflexiv, symmetrisch, transitiv, konsistent, `x.equals(null) == false`

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Email other)) return false;
    return value.equals(other.value);
}

@Override
public int hashCode() {
    return Objects.hash(value);
}
```

Wer nur `equals` überschreibt, bricht `HashSet`/`HashMap`: gleiche Objekte landen in verschiedenen Buckets.

## Typische Use Cases

- Domain-Klassen mit Invarianten (Konstruktor validiert, Methoden statt Setter)
- Value Objects (`Email`, `Money`) mit `equals`/`hashCode` oder gleich als `record`
- Status-Logik mit Enum + `switch` Expression
- Typ-Fallunterscheidung mit sealed interfaces + Pattern Matching

## Clean-Code-Empfehlungen

- Felder `private final`, wo immer möglich.
- Validierung im Konstruktor (fail fast): `Objects.requireNonNull`, `IllegalArgumentException`.
- Sprechende Methoden (`activate()`, `changePrice()`) statt generischer Setter.
- `switch` Expression statt `if`-Kaskade über Enums.
- Keine Magic Numbers: `private static final int MAX_RETRIES = 3;`
- Geld mit `BigDecimal`, nie mit `double`.

## Häufige Fehler

```java
// FALSCH: Referenzvergleich
if (name == "Jan") { }
// RICHTIG
if ("Jan".equals(name)) { }

// FALSCH: Integer-Cache-Falle (nur -128..127 gecacht)
Integer a = 1000, b = 1000;
a == b;               // false!
// RICHTIG
a.equals(b);          // true

// FALSCH: NPE durch Unboxing
Integer stock = map.get("x");   // null
int s = stock;                  // NPE
// RICHTIG
int s = map.getOrDefault("x", 0);

// FALSCH: Geld als double
double total = 0.1 + 0.2;       // 0.30000000000000004
// RICHTIG
BigDecimal total = new BigDecimal("0.1").add(new BigDecimal("0.2"));

// FALSCH: String-Konkatenation in Schleife (O(n²))
String s = "";
for (String p : parts) s += p;
// RICHTIG
String s = String.join("", parts);
```

## Interview-relevante Details

- **Pass-by-value**: Methode kann das übergebene Objekt verändern, aber nicht die Variable des Aufrufers umbiegen.
- **String Pool**: Literale werden interned, daher ist `"a" == "a"` zufällig `true` – nie darauf verlassen.
- **`final` ≠ immutable**: `final List<String> l` – Referenz fix, Inhalt änderbar.
- **Integer Overflow**: `Integer.MAX_VALUE + 1 == Integer.MIN_VALUE`; `Math.addExact` wirft stattdessen.
- **`BigDecimal.equals`** berücksichtigt die Scale: `new BigDecimal("1.0").equals(new BigDecimal("1.00"))` ist `false` → `compareTo` nutzen.
- **`switch` über Enum** ohne alle Fälle kompiliert als Expression nicht; als Statement schon.
- **Sealed** + Records = algebraische Datentypen; Compiler prüft Exhaustiveness.

## Zusammenfassung

- Klassen: `private final` Felder, validierender Konstruktor, Verhalten statt Setter.
- Primitive haben Defaults, Wrapper können `null` sein → Unboxing-NPE.
- Strings mit `equals` vergleichen, `StringBuilder`/`String.join` für Aufbau.
- `switch` Expression mit `->`, `yield`, Exhaustiveness; Pattern Matching mit `instanceof X x` und `case X x when ...`.
- `equals` und `hashCode` immer zusammen überschreiben.
- `var` nur, wenn der Typ offensichtlich ist.
