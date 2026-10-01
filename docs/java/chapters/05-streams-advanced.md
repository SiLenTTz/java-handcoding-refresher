# Kapitel 05 – Streams Advanced

## Mental Model

```text
map       1 → 1        Stream<User>        → Stream<List<Role>>
flatMap   1 → 0..n     Stream<User>        → Stream<Role>
reduce    n → 1        Stream<BigDecimal>  → BigDecimal
collect   n → Container  Stream<T>         → Map / List / String / ...

groupingBy(classifier, downstream)
  = "für jede Gruppe sammle mit downstream"   (Default-downstream: toList())
```

Collectors sind **zusammensetzbar**: `groupingBy(Employee::dept, counting())` – der innere Collector arbeitet pro Gruppe.

## Syntax / API

### flatMap

```java
List<Role> roles = users.stream()
    .flatMap(user -> user.roles().stream())     // Stream<Role>
    .distinct()
    .toList();

List<String> words = lines.stream()
    .flatMap(line -> Arrays.stream(line.split(" ")))
    .toList();

Optional<Address> address = findUser(id).flatMap(User::address);  // Optional-Variante
```

### reduce

```java
int total = numbers.stream().reduce(0, Integer::sum);          // identity, accumulator

BigDecimal revenue = orders.stream()
    .map(Order::total)
    .reduce(BigDecimal.ZERO, BigDecimal::add);

Optional<Integer> max = numbers.stream().reduce(Integer::max); // ohne identity → Optional
```

Die Identity muss neutral sein (`0` für Summe, `1` für Produkt, `BigDecimal.ZERO`).

### groupingBy

```java
Map<String, List<User>> byCountry = users.stream()
    .collect(Collectors.groupingBy(User::country));

Map<String, Long> countByCountry = users.stream()
    .collect(Collectors.groupingBy(User::country, Collectors.counting()));

Map<String, Set<String>> namesByCountry = users.stream()
    .collect(Collectors.groupingBy(User::country,
        Collectors.mapping(User::name, Collectors.toSet())));

Map<String, Integer> ageSum = users.stream()
    .collect(Collectors.groupingBy(User::country, Collectors.summingInt(User::age)));

Map<String, BigDecimal> salaryByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department,
        Collectors.reducing(BigDecimal.ZERO, Employee::salary, BigDecimal::add)));

Map<String, Optional<Employee>> topPerDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department,
        Collectors.maxBy(Comparator.comparing(Employee::salary))));

TreeMap<String, List<User>> sorted = users.stream()
    .collect(Collectors.groupingBy(User::country, TreeMap::new, Collectors.toList()));
```

### partitioningBy

```java
Map<Boolean, List<User>> partition = users.stream()
    .collect(Collectors.partitioningBy(User::active));

List<User> active = partition.get(true);
List<User> inactive = partition.get(false);   // Key false existiert IMMER
```

### toMap

```java
Map<Long, User> byId = users.stream()
    .collect(Collectors.toMap(User::id, Function.identity()));

// Duplikate: Merge-Funktion, sonst IllegalStateException
Map<String, User> byEmail = users.stream()
    .collect(Collectors.toMap(User::email, Function.identity(), (first, second) -> first));

// Zählen per toMap
Map<String, Integer> counts = words.stream()
    .collect(Collectors.toMap(w -> w, w -> 1, Integer::sum));

// Reihenfolge erhalten
Map<Long, String> ordered = users.stream()
    .collect(Collectors.toMap(User::id, User::name, (a, b) -> a, LinkedHashMap::new));
```

### Weitere Collectors

```java
Collectors.joining(", ")
Collectors.collectingAndThen(Collectors.toList(), Collections::unmodifiableList)
Collectors.averagingInt(User::age)
Collectors.summarizingInt(User::age)          // count, min, max, avg, sum
Collectors.teeing(counting(), summingInt(User::age), (n, sum) -> ...)   // Java 12
```

### Über Map-Einträge streamen

```java
List<String> topThree = counts.entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
        .thenComparing(Map.Entry.comparingByKey()))
    .limit(3)
    .map(Map.Entry::getKey)
    .toList();
```

## Mental Shortcut

```text
"nur die ..."                  → filter
"wandle jedes ... um"          → map
"Liste in Elementen"           → flatMap
"gruppiere nach ..."           → groupingBy
"wie viele pro ..."            → groupingBy + counting
"Summe pro ..."                → groupingBy + summingX / reducing
"in zwei Töpfe (ja/nein)"      → partitioningBy
"Lookup nach ID"               → toMap
"kombiniere / summiere alles"  → reduce
"Top N nach Häufigkeit"        → groupingBy/counting → entrySet().stream().sorted().limit()
```

## Typische Use Cases

- Alle Produkte aller Bestellungen: `flatMap(o -> o.items().stream())`
- Umsatz: `map(..).reduce(BigDecimal.ZERO, BigDecimal::add)`
- Report "Mitarbeiter je Abteilung": `groupingBy` + `counting`/`mapping`
- Validierung "gültig / ungültig": `partitioningBy`
- Index / Lookup-Tabelle: `toMap` mit Merge-Funktion

## Clean-Code-Empfehlungen

- Verschachtelte Collectors ab der 2. Ebene mit Zeilenumbrüchen und statischem Import (`groupingBy`, `counting`) lesbar halten.
- Wird es zu tief: Zwischenergebnis benennen oder eine Methode extrahieren.
- `toMap` **immer** mit Merge-Funktion, wenn Duplikate fachlich möglich sind – oder bewusst ohne, damit Duplikate knallen.
- `reduce` für Aggregation, nicht für "sammeln in Liste" (`collect` nutzen).
- Für einfache Summen `mapToInt(..).sum()` statt `reduce`.

## Häufige Fehler

```java
// FALSCH: map statt flatMap
List<List<Role>> nested = users.stream().map(User::roles).toList();
// RICHTIG
List<Role> roles = users.stream().flatMap(u -> u.roles().stream()).toList();

// FALSCH: toMap mit doppelten Keys
Collectors.toMap(User::country, User::name);    // IllegalStateException: Duplicate key
// RICHTIG
Collectors.groupingBy(User::country, Collectors.mapping(User::name, Collectors.toList()));

// FALSCH: nicht-neutrale Identity
numbers.stream().reduce(10, Integer::sum);       // addiert 10 (parallel sogar mehrfach!)

// FALSCH: reduce, um eine Liste zu bauen
stream.reduce(new ArrayList<>(), (l, x) -> { l.add(x); return l; }, ...);
// RICHTIG
stream.toList();

// FALSCH: Summe mit double
double sum = orders.stream().mapToDouble(o -> o.total().doubleValue()).sum();
// RICHTIG
BigDecimal sum = orders.stream().map(Order::total).reduce(BigDecimal.ZERO, BigDecimal::add);

// FALSCH: toMap mit null-Value
Collectors.toMap(User::id, User::nickname);      // NPE, wenn nickname null ist
```

## Interview-relevante Details

- `groupingBy` liefert standardmäßig eine `HashMap` (keine Ordnung) mit `ArrayList`s – Map-Factory als 2. Argument für `TreeMap`/`LinkedHashMap`.
- `groupingBy` erzeugt **keine** leeren Gruppen; `partitioningBy` hat **immer** beide Keys.
- `counting()` liefert `Long`, nicht `Integer`.
- `toMap` wirft `IllegalStateException` bei Duplikaten und `NullPointerException` bei `null`-Values.
- `reduce(identity, accumulator, combiner)` – der Combiner ist nur für parallele Streams relevant.
- `flatMap` auf `Optional` verhindert `Optional<Optional<T>>`.
- `Map.Entry.comparingByValue()` braucht bei Verkettung oft einen Typzeugen: `Map.Entry.<String, Long>comparingByValue()`.

## Zusammenfassung

- `flatMap` glättet verschachtelte Strukturen (1 → n).
- `reduce(identity, op)` aggregiert zu einem Wert; Identity muss neutral sein.
- `groupingBy(key, downstream)`: `counting`, `mapping`, `summingInt`, `reducing`, `maxBy`, Map-Factory.
- `partitioningBy` für boolesche Aufteilung, immer beide Keys.
- `toMap(key, value, merge, mapFactory)` – Duplikate bewusst behandeln.
- Top-N nach Häufigkeit: zählen → `entrySet().stream()` → sortieren → `limit`.
