# Kapitel 11 – Generics

## Mental Model

Generics = **Typparameter zur Compilezeit**. Der Compiler prüft Typen und fügt Casts ein; zur Laufzeit sind die Typargumente weg (**Type Erasure**). Ziel: Typsicherheit ohne Casts, wiederverwendbarer Code für viele Typen.

```text
List<String>   → zur Laufzeit nur List
T              → zur Laufzeit Object (bzw. die erste Bound, z. B. Comparable)
```

Wichtigste Einsicht: **Generics sind invariant.** `List<Integer>` ist **kein** `List<Number>`, obwohl `Integer` ein `Number` ist. Wildcards (`?`) schaffen kontrollierte Flexibilität.

## Generische Klasse / Record

```java
class Box<T> {
    private final T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
    <R> Box<R> map(Function<? super T, ? extends R> mapper) {
        return new Box<>(mapper.apply(value));
    }
}

record Pair<A, B>(A first, B second) {}

var box = new Box<>("java");           // Diamond: Box<String>
Box<Integer> len = box.map(String::length);
```

Namenskonvention: `T` (Type), `E` (Element), `K`/`V` (Key/Value), `R` (Result), `A`/`B`.

## Generische Methode

Typparameter steht **vor** dem Rückgabetyp:

```java
static <T> T firstOrDefault(List<T> values, T fallback) {
    return values.isEmpty() ? fallback : values.getFirst();
}

static <K, V> Map<V, K> invert(Map<K, V> map) { ... }

String s = firstOrDefault(List.of("a"), "x");        // T wird inferiert
var e = Collections.<String>emptyList();             // explizites Typargument (selten nötig)
```

## Bounded Type Parameters

```java
static <T extends Comparable<T>> T max(List<T> values) { ... }        // Upper Bound
static <T extends Number & Comparable<T>> T clamp(T v, T lo, T hi)   // Mehrfach-Bound: Klasse zuerst
```

Die robusteste Form für Vergleiche:

```java
static <T extends Comparable<? super T>> T max(Collection<? extends T> values) {
    Iterator<? extends T> it = values.iterator();
    if (!it.hasNext()) throw new NoSuchElementException("empty");
    T best = it.next();
    while (it.hasNext()) {
        T candidate = it.next();
        if (candidate.compareTo(best) > 0) best = candidate;
    }
    return best;
}
```

`Comparable<? super T>` erlaubt Typen, die `Comparable` über eine Superklasse erben (z. B. `java.sql.Date extends java.util.Date implements Comparable<java.util.Date>`).

## Wildcards & PECS

| Syntax | Bedeutung | Lesen | Schreiben |
|---|---|---|---|
| `List<?>` | irgendein Typ | als `Object` | nur `null` |
| `List<? extends Number>` | Number oder Subtyp | als `Number` ✔ | ✘ (nur `null`) |
| `List<? super Integer>` | Integer oder Supertyp | nur als `Object` | `Integer` ✔ |

**PECS – Producer Extends, Consumer Super** (aus Sicht der Collection):

```java
static double sum(Collection<? extends Number> numbers) {      // Producer: liefert Werte
    double total = 0;
    for (Number n : numbers) total += n.doubleValue();
    return total;
}

static void fillWithOnes(List<? super Integer> target, int n) {  // Consumer: nimmt Werte auf
    for (int i = 0; i < n; i++) target.add(1);
}

static <T> void copy(List<? super T> dest, List<? extends T> src) {   // wie Collections.copy
    for (T item : src) dest.add(item);
}

sum(List.of(1, 2.5, 3L));                    // List<Number>, List<Integer>, List<Double> ...
fillWithOnes(new ArrayList<Number>(), 3);    // List<Integer>, List<Number>, List<Object>
```

JDK-Signaturen, die man lesen können sollte:

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper)
static <T> void sort(List<T> list, Comparator<? super T> c)
boolean addAll(Collection<? extends E> c)
```

## Type Erasure – Konsequenzen

```java
new T();                         // ✘ Compilefehler
new T[10];                       // ✘ Compilefehler
x instanceof List<String>        // ✘ (nur List<?> bzw. seit 16 bei sicherer Ableitung)
static T field;                  // ✘ static kennt kein T der Instanz
List<int>                        // ✘ keine Primitives → List<Integer>

void f(List<String> a) {}        // ✘ gleiche Erasure → Name Clash
void f(List<Integer> a) {}
```

Workaround für Instanziierung: `Supplier<T>` oder `Class<T>` übergeben.

```java
static <T> List<T> create(int n, Supplier<T> factory) {
    return Stream.generate(factory).limit(n).toList();
}
```

## Raw Types

```java
List raw = new ArrayList();      // Raw Type: keine Typprüfung
raw.add("x"); raw.add(42);       // kompiliert (Warnung)
List<String> strings = raw;      // unchecked – ClassCastException erst später beim Lesen
```

Nie Raw Types in neuem Code. `List<?>` ist die typsichere Variante für „beliebige Liste“.

## Typische Use Cases

- Wrapper/Ergebnis-Typen: `Result<T>`, `Page<T>`, `ApiResponse<T>`.
- Generische Repositories: `interface Repository<T, ID> { Optional<T> findById(ID id); }` (wie Spring Data).
- Utilities: `max`, `groupBy`, `partition`, `firstOrDefault`.
- Typsichere Heterogene Container: `Map<Class<?>, Object>` + `type.cast(...)`.

## Clean-Code-Empfehlungen

- Wildcards in **Parametern** von APIs (flexibel für Aufrufer), **nicht** in Rückgabetypen (`List<? extends X>` zurückzugeben zwingt Aufrufer zu Wildcards).
- Typparameter nur einführen, wenn er mindestens zwei Stellen verbindet (Parameter ↔ Rückgabe). Sonst reicht `?`.
- Diamond `<>` und `var` nutzen, explizite Typargumente meiden.
- `@SuppressWarnings("unchecked")` nur auf kleinstem Scope und mit Begründung.
- Nicht übertreiben: `<T extends Comparable<? super T>>` nur, wo nötig; Lesbarkeit zählt.

## Häufige Fehler

```java
// FALSCH: Invarianz ignoriert
List<Number> nums = new ArrayList<Integer>();          // ✘ Compilefehler
// RICHTIG
List<? extends Number> nums = new ArrayList<Integer>();
```

```java
// FALSCH: in extends-Liste schreiben
List<? extends Number> nums = new ArrayList<Integer>();
nums.add(1);                                           // ✘ Compilefehler
// RICHTIG: Consumer → super
List<? super Integer> sink = new ArrayList<Number>();
sink.add(1);
```

```java
// FALSCH: T schattiert Klassen-T
class Box<T> { <T> T convert(T x) { ... } }            // zweites T ist ein neuer Typ!
// RICHTIG
class Box<T> { <R> R convert(Function<T, R> f) { ... } }
```

```java
// FALSCH: Arrays sind kovariant → Laufzeitfehler
Object[] arr = new String[1];
arr[0] = 1;                                            // ArrayStoreException
```

## Interview-relevante Details

- **Type Erasure**: Warum? Rückwärtskompatibilität mit Pre-Java-5-Bytecode. Folge: keine `new T()`, kein `instanceof List<String>`, Overload-Konflikte.
- **Arrays kovariant, Generics invariant**: Arrays prüfen zur Laufzeit (`ArrayStoreException`), Generics zur Compilezeit.
- **PECS** mit `Collections.copy(List<? super T> dest, List<? extends T> src)` erklären können.
- `List<Object>` vs. `List<?>`: In `List<Object>` darf man alles schreiben, aber `List<String>` ist kein `List<Object>`. `List<?>` akzeptiert jede Liste, schreibt nichts.
- **Bridge Methods**: Compiler erzeugt sie, damit Overriding mit Generics nach Erasure funktioniert.
- **Heap Pollution** bei generischen Varargs → `@SafeVarargs`.

## Zusammenfassung

- Generics prüfen Typen zur Compilezeit; zur Laufzeit gelöscht (Erasure).
- Invarianz: `List<Integer>` ≠ `List<Number>` → Wildcards.
- **PECS**: lesen → `? extends T`, schreiben → `? super T`, beides → exakt `T`.
- Bounds: `<T extends Comparable<? super T>>` für vergleichbare Typen.
- Keine Raw Types, keine Wildcards in Rückgabetypen, Typparameter nur wenn sie etwas verbinden.
