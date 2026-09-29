# Kapitel 12 – Lambdas & Functional Interfaces

## Mental Model

Ein Lambda ist **kein** magischer Sprachbaustein, sondern eine **kompakte Implementierung eines Interfaces mit genau einer abstrakten Methode** (SAM – Single Abstract Method). Der Compiler leitet aus dem Zieltyp ab, welches Interface gemeint ist.

```text
Zieltyp entscheidet:
    Predicate<User> p      = u -> u.active();   →  boolean test(User)
    Function<User,String> f = u -> u.name();    →  String  apply(User)
    Runnable r             = () -> log("hi");   →  void    run()

Lambda = Parameterliste -> Body
         (keine eigene Identität, kein eigenes `this`)
```

Merksatz: **Verhalten wird zum Wert.** Du übergibst nicht mehr nur Daten an eine Methode, sondern Verhalten an eine Methode. Genau das macht Streams, `Comparator`, `Optional.map` und Spring-Callbacks (`TransactionTemplate`, `RestClient`, `JdbcClient`) möglich.

## Syntax / API

### Lambda-Syntax und effektiv finale Variablen

```java
(String a, String b) -> { return a + b; }   // voll ausgeschrieben
(a, b) -> a + b                             // Typen inferiert, Expression-Body
user -> user.name()                         // ein Parameter: Klammern optional
() -> System.currentTimeMillis()            // kein Parameter: Klammern Pflicht

int counter = 0;
Runnable bad = () -> System.out.println(counter);
counter++;                                  // ✘ counter ist nicht effektiv final

int limit = 10;                             // nie neu zugewiesen → effektiv final
Predicate<Integer> ok = n -> n < limit;     // ✔
```

Lambdas dürfen lokale Variablen nur lesen, wenn diese **effektiv final** sind. Grund: Das Lambda kann den Stackframe überleben (Thread, Callback), Java kopiert den Wert (Capture by Value). **Felder** (`this.counter`) sind davon nicht betroffen.

### Die `java.util.function`-Familie

| Interface | Methode | Signatur |
|---|---|---|
| `Function<T,R>` | `apply` | `T → R` |
| `BiFunction<T,U,R>` | `apply` | `(T,U) → R` |
| `Predicate<T>` | `test` | `T → boolean` |
| `BiPredicate<T,U>` | `test` | `(T,U) → boolean` |
| `Supplier<T>` | `get` | `() → T` |
| `Consumer<T>` | `accept` | `T → void` |
| `BiConsumer<T,U>` | `accept` | `(T,U) → void` |
| `UnaryOperator<T>` | `apply` | `T → T` (erbt `Function<T,T>`) |
| `BinaryOperator<T>` | `apply` | `(T,T) → T` (erbt `BiFunction<T,T,T>`) |

**Primitive Varianten** vermeiden Boxing – relevant in heißen Schleifen und bei `IntStream`:

```java
IntPredicate even             = n -> n % 2 == 0;
ToIntFunction<String> len     = String::length;      // T → int
IntFunction<String> pad       = n -> " ".repeat(n);  // int → T
```

Namensregel: `ToXxx…` = Rückgabe primitiv, `XxxFunction` = Parameter primitiv, `XxxPredicate` / `XxxUnaryOperator` / `XxxConsumer` = komplett primitiv.

### Default-Methoden: compose, andThen, negate, and, or

```java
plus2.andThen(times3).apply(1);   // (1+2)*3 = 9   – erst this, dann after
plus2.compose(times3).apply(1);   // (1*3)+2 = 5   – erst before, dann this

Predicate<String> notBlank = Predicate.not(String::isBlank);
Predicate<String> valid    = notBlank.and(s -> s.length() > 5).or(s -> s.startsWith("#"));
Predicate<String> invalid  = valid.negate();

Consumer<Order> both = ((Consumer<Order>) audit::write).andThen(mailer::send);
```

`Predicate.not(...)` (Java 11+) ist der saubere Weg, eine Methodenreferenz zu negieren – `!String::isBlank` gibt es nicht.

### Comparator als Functional Interface

```java
users.sort(Comparator.comparing(User::lastName).thenComparing(User::firstName));
Comparator<Order> byQty = Comparator.comparingInt(Order::qty);   // kein Boxing
```

Achtung: `.reversed()` dreht die **gesamte** bis dahin gebaute Kette um, nicht nur den letzten `thenComparing`-Schritt.

### @FunctionalInterface und eigene Functional Interfaces

```java
@FunctionalInterface
interface PriceRule {
    BigDecimal apply(Order order);                 // genau eine abstrakte Methode

    default PriceRule andThen(PriceRule next) {    // default zählt nicht mit
        return order -> apply(order).add(next.apply(order));
    }
}
```

Die Annotation ist optional, lässt den Compiler aber prüfen, dass das Interface SAM bleibt. Ein eigenes Functional Interface lohnt sich, wenn der Name fachlich etwas trägt (`PriceRule` statt `Function<Order, BigDecimal>`) oder wenn eine checked Exception in der Signatur stehen muss.

### Method References – alle vier Arten

```java
Function<String, Integer> parse   = Integer::parseInt;     // 1. statische Methode
Consumer<String> print            = System.out::println;   // 2. Methode eines Objekts
Function<String, String> upper    = String::toUpperCase;   // 3. s -> s.toUpperCase()
BiPredicate<String, String> start = String::startsWith;    // 3. (a,b) -> a.startsWith(b)
Supplier<ArrayList<String>> list  = ArrayList::new;        // 4. Konstruktor
IntFunction<String[]> array       = String[]::new;         // 4. toArray(String[]::new)
```

Typ 3 ist die verwirrende Form: Der erste Lambda-Parameter wird zum **Empfänger** des Aufrufs.

### Closures, Higher-Order-Methoden und Strategy im Service

```java
// Higher-Order: liefert Verhalten zurück (Closure über rate)
static UnaryOperator<BigDecimal> discountOf(BigDecimal rate) {
    return price -> price.subtract(price.multiply(rate));
}

// Higher-Order: nimmt Verhalten entgegen
<T, R> List<R> mapAll(List<T> source, Function<? super T, ? extends R> mapper) {
    return source.stream().map(mapper).toList();
}
```

Strategy per Lambda statt Klassenhierarchie:

```java
private static final Map<ShippingType, UnaryOperator<BigDecimal>> RULES = Map.of(
    ShippingType.STANDARD, weight -> weight,
    ShippingType.EXPRESS,  weight -> weight.multiply(new BigDecimal("2.5")),
    ShippingType.PICKUP,   weight -> BigDecimal.ZERO);

BigDecimal cost(ShippingType type, BigDecimal weightKg) {
    return RULES.get(type).apply(weightKg);
}
```

### Lambdas vs. anonyme Klassen (`this`-Semantik)

```java
Runnable asLambda() {
    return () -> System.out.println(this.title);      // this = die äußere Instanz ✔
}

Runnable asAnonymous() {
    return new Runnable() {
        @Override public void run() {
            System.out.println(this);                 // this = die Runnable-Instanz!
            System.out.println(Report.this.title);    // qualifizieren nötig
        }
    };
}
```

| | Lambda | Anonyme Klasse |
|---|---|---|
| `this` | umschließende Instanz | die anonyme Instanz |
| Zustand | kein eigener | eigene Felder erlaubt |
| Interface | nur SAM | beliebig viele Methoden |
| Shadowing | Parameter dürfen lokale Variablen **nicht** verdecken | dürfen sie |

## Typische Use Cases

- Stream-Pipelines: `filter`, `map`, `sorted`, `collect`.
- `Optional`-Verkettung und Lazy Evaluation: `orElseGet(() -> teuerBerechnen())` statt `orElse(...)`.
- `Map`-Bulk-Operationen: `computeIfAbsent`, `merge`, `forEach`.
- Strategy/Policy als `Map<Enum, Function<…>>` oder als injiziertes Lambda.
- Spring-Callbacks: `TransactionTemplate.execute`, `RowMapper`, `RestClient`-Konfiguration.
- Validierung als komponierbare `Predicate`-Kette.

## Clean-Code-Empfehlungen

- Lambda mit mehr als **drei Zeilen** → Methode extrahieren und per Method Reference referenzieren.
- Sprechende Parameternamen: `user -> user.active()` statt `u -> u.active()`.
- Eigenes Functional Interface, wenn der Typ fachlich etwas bedeutet (`PriceRule`, `RetryPolicy`).
- Keine Seiteneffekte in `map`/`filter`; `forEach` ist der Ort für Effekte.
- Method Reference bevorzugen, wenn sie **ohne Umformung** möglich ist; nicht erzwingen (`x -> foo(x, 1)` bleibt Lambda).
- Kein `null` als „kein Verhalten“ – lieber ein neutrales Lambda (`x -> x`, `x -> {}`).

## Häufige Fehler

```java
// FALSCH: nicht effektiv final
int total = 0;
orders.forEach(o -> total += o.qty());       // ✘ Compilefehler
// RICHTIG
int total = orders.stream().mapToInt(Order::qty).sum();
```

```java
// FALSCH: orElse wertet immer aus
String name = optional.orElse(loadDefaultFromDb());   // DB-Call auch bei Treffer
// RICHTIG: Supplier ist lazy
String name = optional.orElseGet(this::loadDefaultFromDb);
```

```java
// FALSCH: reversed() dreht die ganze Kette
users.sort(Comparator.comparing(User::lastName).thenComparing(User::age).reversed());
// RICHTIG: nur den gewünschten Schlüssel umdrehen
users.sort(Comparator.comparing(User::lastName)
                     .thenComparing(User::age, Comparator.reverseOrder()));
```

```java
// FALSCH: Negation einer Method Reference gibt es nicht
names.stream().filter(!String::isBlank);              // ✘ Compilefehler
// RICHTIG
names.stream().filter(Predicate.not(String::isBlank));
```

```java
// FALSCH: checked Exception im Lambda
paths.forEach(path -> Files.readString(path));        // ✘ IOException nicht deklarierbar
// RICHTIG: kapseln und in unchecked übersetzen
paths.forEach(path -> {
    try { Files.readString(path); }
    catch (IOException e) { throw new UncheckedIOException(e); }
});
```

## Interview-relevante Details

- **Was ist ein Functional Interface?** Interface mit genau einer abstrakten Methode; `default`, `static`, `private` Methoden sowie re-deklarierte `Object`-Methoden (`equals`, `toString`) zählen nicht mit.
- **Wie werden Lambdas kompiliert?** Nicht als anonyme Klasse, sondern über `invokedynamic` + `LambdaMetafactory`. Zustandslose Lambdas dürfen wiederverwendet werden – auf Identität (`==`) nie verlassen.
- **Effektiv final** erklären: Capture by Value, deshalb muss die Variable stabil sein. Feldzugriffe sind nicht beschränkt.
- **Lambda vs. anonyme Klasse**: `this`-Semantik, kein eigener Zustand, kein Shadowing, keine eigene Class-Datei.
- **`compose` vs. `andThen`** an einem Zahlenbeispiel vorrechnen können.
- **Target Typing**: Derselbe Lambda-Ausdruck kann je nach Zieltyp `Runnable`, `Callable` oder ein eigenes Interface sein. Deshalb ist `var f = x -> x;` nicht erlaubt.
- **Warum keine checked Exceptions?** `java.util.function` deklariert keine – entweder eigenes Interface mit `throws` oder Wrapping in eine unchecked Exception.

## Zusammenfassung

- Lambda = Implementierung einer SAM; der **Zieltyp** bestimmt das Interface.
- `Function`, `Predicate`, `Supplier`, `Consumer` + Bi-/Unary-/Binary-/primitive Varianten decken fast alles ab.
- Komposition über `andThen`, `compose`, `and`, `or`, `negate`, `Predicate.not`.
- Method References in vier Formen: `Class::static`, `obj::methode`, `Class::instanzMethode`, `Class::new`.
- Captured Variablen müssen **effektiv final** sein; `this` im Lambda ist die umschließende Instanz.
- Verhalten als Parameter = Strategy ohne Klassenexplosion – aber lange Lambdas in benannte Methoden extrahieren.
