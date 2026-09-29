# Kapitel 04 – Streams Basics

## Mental Model

```text
SOURCE              list.stream(), Stream.of(..), Arrays.stream(..)
  ↓
INTERMEDIATE (lazy) filter, map, distinct, sorted, limit, skip, peek
  ↓
TERMINAL (eager)    toList, collect, count, findFirst, anyMatch, forEach, reduce
```

- Ein Stream ist eine **Pipeline**, keine Datenstruktur. Er speichert nichts und verändert die Quelle nicht.
- Intermediate Operations sind **lazy**: Ohne Terminal Operation passiert nichts.
- Elemente laufen **einzeln** durch die ganze Pipeline (vertikal), nicht Stufe für Stufe – außer bei `sorted` (braucht alle Elemente).
- Ein Stream ist **einmal** verwendbar.

## Syntax / API

### Das Standardmuster

```java
List<String> names = users.stream()
    .filter(User::active)          // Predicate<User>
    .map(User::name)               // Function<User, String>
    .sorted()                      // natürliche Ordnung
    .toList();                     // unveränderliche List<String>
```

Lesen von oben nach unten: *"Von den Usern nur die aktiven, davon die Namen, sortiert, als Liste."*

### filter / map

```java
users.stream().filter(u -> u.age() >= 18)
users.stream().filter(Predicate.not(User::active))    // negieren ohne Lambda
users.stream().map(User::email)                        // A → B
users.stream().map(String::toUpperCase)
```

### distinct / sorted / limit / skip

```java
tags.stream().distinct()                               // über equals/hashCode
users.stream().sorted(Comparator.comparing(User::name))
users.stream().sorted(Comparator.comparing(User::age).reversed())
users.stream().sorted(Comparator
        .comparing(User::department)
        .thenComparing(User::salary, Comparator.reverseOrder())
        .thenComparing(User::name))
users.stream().skip(20).limit(10)                      // "Seite 3 à 10"
```

### Suchen und Prüfen (short-circuiting)

```java
Optional<User> first = users.stream().filter(User::admin).findFirst();
Optional<User> any   = users.stream().filter(User::admin).findAny();   // parallel schneller

boolean hasAdmin   = users.stream().anyMatch(User::admin);
boolean allActive  = users.stream().allMatch(User::active);
boolean noneBanned = users.stream().noneMatch(User::banned);
```

Leerer Stream: `anyMatch` → `false`, `allMatch` → `true`, `noneMatch` → `true`.

### Zählen, Min/Max, Primitive Streams

```java
long count = users.stream().filter(User::active).count();

Optional<User> oldest = users.stream().max(Comparator.comparingInt(User::age));

int totalAge = users.stream().mapToInt(User::age).sum();
OptionalDouble avg = users.stream().mapToInt(User::age).average();
IntSummaryStatistics stats = users.stream().mapToInt(User::age).summaryStatistics();

IntStream.range(0, 5)          // 0,1,2,3,4
IntStream.rangeClosed(1, 5)    // 1..5
```

`IntStream` vermeidet Boxing und hat `sum`, `average`, `max`, `boxed()`.

### Einfache Collectors

```java
String csv = names.stream().collect(Collectors.joining(", "));
String list = names.stream().collect(Collectors.joining(", ", "[", "]"));
Set<String> set = names.stream().collect(Collectors.toSet());
List<String> mutable = names.stream().collect(Collectors.toCollection(ArrayList::new));
```

### Method References

| Form | Beispiel | Entspricht |
|---|---|---|
| statisch | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| Instanz eines beliebigen Objekts | `User::name` | `u -> u.name()` |
| Instanz eines bestimmten Objekts | `System.out::println` | `x -> System.out.println(x)` |
| Konstruktor | `ArrayList::new` | `() -> new ArrayList<>()` |

## Typische Use Cases

- Liste filtern und transformieren → `filter` + `map` + `toList`
- DTO-Liste aus Entities → `map(mapper::toDto).toList()`
- "Gibt es …?" → `anyMatch`; "Finde den ersten …" → `filter` + `findFirst`
- Top-N → `sorted(comparator).limit(n)`
- Summen → `mapToInt(..).sum()`; Geld → `map(..).reduce(BigDecimal.ZERO, BigDecimal::add)` (Kapitel 05)
- Strings zusammenbauen → `Collectors.joining`

## Clean-Code-Empfehlungen

- Eine Operation pro Zeile, Punkte untereinander.
- Method References, wenn sie lesbarer sind als Lambdas (`User::name` statt `u -> u.name()`).
- Komplexe Prädikate benennen: `.filter(this::isEligibleForDiscount)`.
- Keine Seiteneffekte in `map`/`filter` (keine externen Listen befüllen, kein Logging-Missbrauch).
- `toList()` (Java 16) statt `collect(Collectors.toList())`, wenn Unveränderlichkeit ok ist.
- Kein Stream um jeden Preis: Eine einfache Schleife mit `break`/Index ist manchmal klarer.

## Häufige Fehler

```java
// FALSCH: map vor filter – nach map sind es Strings, kein User mehr
users.stream().map(User::name).filter(User::active).toList();   // Compile-Fehler
// RICHTIG
users.stream().filter(User::active).map(User::name).toList();

// FALSCH: keine Terminal Operation → nichts passiert
users.stream().peek(System.out::println).filter(User::active);

// FALSCH: Stream zweimal benutzen
Stream<User> s = users.stream();
s.count();
s.toList();                         // IllegalStateException

// FALSCH: Seiteneffekt statt collect
List<String> names = new ArrayList<>();
users.stream().forEach(u -> names.add(u.name()));
// RICHTIG
List<String> names = users.stream().map(User::name).toList();

// FALSCH: Optional sofort mit get() öffnen
User u = users.stream().filter(User::admin).findFirst().get();   // NoSuchElementException
// RICHTIG
User u = users.stream().filter(User::admin).findFirst()
    .orElseThrow(() -> new IllegalStateException("no admin"));

// FALSCH: reversed() an der falschen Stelle
Comparator.comparing(User::dept).thenComparing(User::age).reversed(); // dreht ALLES um
// RICHTIG
Comparator.comparing(User::dept).thenComparing(User::age, Comparator.reverseOrder());

// FALSCH: count() > 0 für Existenz
users.stream().filter(User::admin).count() > 0;
// RICHTIG (short-circuit)
users.stream().anyMatch(User::admin);
```

## Interview-relevante Details

- **Laziness + Short-Circuiting**: `filter(..).findFirst()` bricht nach dem ersten Treffer ab; `limit(n)` ebenso.
- `sorted` ist eine **stateful** Operation (puffert alles, O(n log n)).
- `toList()` → unveränderlich und erlaubt `null`s; `Collectors.toList()` → in der Praxis `ArrayList`, keine Garantie.
- `findFirst` respektiert die Encounter Order; `findAny` darf bei parallelen Streams irgendein Element liefern.
- `Stream.of(array)` bei `int[]` liefert `Stream<int[]>` – für primitive Arrays `Arrays.stream(ints)`.
- `peek` ist fürs Debuggen gedacht; bei `count()` auf sized Streams kann es sogar übersprungen werden.
- Parallel Streams nur bei großen, CPU-lastigen, unabhängigen Workloads – nie mit geteiltem mutable State.

## Zusammenfassung

- Pipeline: Quelle → lazy Intermediate Ops → eine Terminal Op.
- `filter` reduziert, `map` transformiert, `sorted`/`distinct`/`limit`/`skip` formen.
- `findFirst`/`max`/`min` liefern `Optional`; `anyMatch`/`allMatch`/`noneMatch` liefern `boolean`.
- `mapToInt` für Summen/Durchschnitt ohne Boxing.
- `Comparator.comparing(..).thenComparing(..)`, `reversed()` vorsichtig einsetzen.
- Keine Seiteneffekte, Stream nur einmal verwenden, `toList()` ist unveränderlich.
