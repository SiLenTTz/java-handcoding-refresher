import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    { id: 'f1', front: 'Die drei Teile einer Stream-Pipeline?', back: '**Source** (`list.stream()`), **Intermediate Operations** (lazy: `filter`, `map`, `sorted` …), **genau eine Terminal Operation** (`toList`, `count`, `findFirst` …).' },
    { id: 'f2', front: 'Was bedeutet "Streams sind lazy"?', back: 'Intermediate Operations werden erst ausgeführt, wenn eine Terminal Operation läuft – und nur so weit wie nötig (z. B. stoppt `findFirst` nach dem ersten Treffer).' },
    { id: 'f3', front: 'Unterschied `filter` und `map`?', back: '`filter(Predicate<T>)` behält oder verwirft Elemente (Typ bleibt `T`). `map(Function<T, R>)` wandelt jedes Element in ein `R` um (Anzahl bleibt gleich).' },
    { id: 'f4', front: 'Was liefert `findFirst()` – und wie packt man es sauber aus?', back: '`Optional<T>`. Auspacken mit `orElse`, `orElseGet`, `orElseThrow(() -> new XyzException(..))` – nicht mit `get()`.' },
    { id: 'f5', front: '`anyMatch`, `allMatch`, `noneMatch` auf einem **leeren** Stream?', back: '`anyMatch` → `false`, `allMatch` → `true`, `noneMatch` → `true` (vacuous truth).' },
    { id: 'f6', front: 'Sortieren nach Abteilung aufsteigend, dann Gehalt absteigend?', back: '```java\n.sorted(Comparator.comparing(Employee::department)\n    .thenComparing(Employee::salary, Comparator.reverseOrder()))\n```' },
    { id: 'f7', front: 'Was ist das Problem mit `...thenComparing(X::b).reversed()`?', back: '`reversed()` dreht den **gesamten** zusammengesetzten Comparator um, nicht nur das letzte Kriterium. Für ein einzelnes Kriterium: `thenComparing(X::b, Comparator.reverseOrder())`.' },
    { id: 'f8', front: '`toList()` vs. `collect(Collectors.toList())`?', back: '`Stream.toList()` (Java 16): garantiert unveränderlich. `Collectors.toList()`: keine Garantie zur Mutabilität (praktisch `ArrayList`). Für garantiert veränderbar: `Collectors.toCollection(ArrayList::new)`.' },
    { id: 'f9', front: 'Summe und Durchschnitt eines `int`-Felds?', back: '```java\nint sum = users.stream().mapToInt(User::age).sum();\nOptionalDouble avg = users.stream().mapToInt(User::age).average();\n```' },
    { id: 'f10', front: 'Seite 3 bei Seitengröße 10 aus einer sortierten Liste?', back: '`list.stream().skip(20).limit(10).toList()` – `skip(page * size)` bei 0-basierter Seite.' },
    { id: 'f11', front: 'Was passiert, wenn man einen Stream zweimal konsumiert?', back: '`IllegalStateException: stream has already been operated upon or closed`. Neuen Stream aus der Quelle erzeugen.' },
    { id: 'f12', front: 'Die 4 Arten von Method References?', back: 'Statisch `Integer::parseInt`, Instanz eines beliebigen Objekts `User::name`, Instanz eines bestimmten Objekts `System.out::println`, Konstruktor `ArrayList::new`.' },
    { id: 'f13', front: 'Strings mit Komma verbinden, in eckigen Klammern?', back: '`names.stream().collect(Collectors.joining(", ", "[", "]"))` – oder ohne Stream `String.join(", ", names)`.' },
    { id: 'f14', front: 'Warum `anyMatch` statt `filter(..).count() > 0`?', back: '`anyMatch` bricht beim ersten Treffer ab (short-circuit) und drückt die Absicht direkt aus. `count` läuft immer über alles.' },
    { id: 'f15', front: 'Welche Stream-Operation ist stateful und muss alle Elemente puffern?', back: '`sorted()` (und `distinct()` merkt sich gesehene Elemente). Beide beeinflussen Speicher und Laufzeit.' },
    { id: 'f16', front: 'Wie negiert man eine Method Reference im `filter`?', back: '`filter(Predicate.not(User::active))` (Java 11) – statt `u -> !u.active()`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Typ hat `names`?',
      code: `var names = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .toList();`,
      options: ['`List<User>`', '`Stream<String>`', '`List<String>`', '`ArrayList<String>`'],
      correct: 2,
      explanation: '`filter` behält `Stream<User>`, `map(User::getName)` macht `Stream<String>`, `toList()` sammelt in eine (unveränderliche) `List<String>`.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `users.stream()
    .map(User::getName)
    .filter(User::isActive)
    .toList();`,
      options: [
        '`toList()` gibt es erst ab Java 21',
        'Nach `map` ist es ein `Stream<String>` – `String` hat kein `isActive()`',
        '`filter` muss immer als Erstes kommen',
        'Method References sind in `filter` nicht erlaubt',
      ],
      correct: 1,
      explanation: 'Jede Stufe ändert ggf. den Elementtyp. `User::isActive` erwartet einen `User`, bekommt aber `String`. Reihenfolge: erst filtern, dann mappen.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `Stream.of("a", "bb", "ccc")
    .filter(s -> {
        System.out.print("f" + s + " ");
        return s.length() > 1;
    })
    .findFirst();`,
      options: ['`fa fbb fccc `', '`fa fbb `', 'nichts', '`fbb `'],
      correct: 1,
      explanation: 'Elemente laufen einzeln durch die Pipeline; `findFirst` bricht nach dem ersten Treffer (`bb`) ab. `ccc` wird nie geprüft.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `List<String> names = List.of("Jan", "Anna");
names.stream()
    .map(String::toUpperCase)
    .peek(System.out::println);`,
      options: ['`JAN` und `ANNA`', '`Jan` und `Anna`', 'nichts', '`IllegalStateException`'],
      correct: 2,
      explanation: 'Keine Terminal Operation → die lazy Pipeline wird nie ausgeführt.',
    },
    {
      id: 'q5',
      prompt: 'Was liefert `Stream.<User>empty().allMatch(User::isActive)`?',
      options: ['`false`', '`true`', '`NoSuchElementException`', '`Optional.empty()`'],
      correct: 1,
      explanation: 'Für die leere Menge gilt jede Aussage "für alle" – `allMatch` ist `true`. `anyMatch` wäre `false`.',
    },
    {
      id: 'q6',
      prompt: 'Welche Reihenfolge entsteht?',
      code: `record P(String name, int age) {}
Stream.of(new P("Bo", 30), new P("Al", 30), new P("Cy", 20))
    .sorted(Comparator.comparing(P::age).thenComparing(P::name).reversed())
    .map(P::name)
    .toList();`,
      options: ['`[Cy, Al, Bo]`', '`[Al, Bo, Cy]`', '`[Bo, Al, Cy]`', '`[Cy, Bo, Al]`'],
      correct: 2,
      explanation: '`reversed()` dreht den ganzen Comparator: Alter absteigend, bei Gleichstand Name absteigend → Bo(30), Al(30), Cy(20).',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist Clean Code?',
      options: [
        '`List<String> r = new ArrayList<>(); users.stream().forEach(u -> r.add(u.name()));`',
        '`List<String> r = users.stream().map(User::name).toList();`',
        '`List<String> r = users.stream().map(u -> { return u.name(); }).collect(Collectors.toList());`',
        '`List<String> r = users.stream().peek(u -> r.add(u.name())).toList();`',
      ],
      correct: 1,
      explanation: 'Keine Seiteneffekte, Method Reference, `toList()`. Das Befüllen externer Listen aus Lambdas ist fehleranfällig und nicht parallel-sicher.',
    },
    {
      id: 'q8',
      prompt: 'Wo ist der Bug?',
      code: `User admin = users.stream()
    .filter(User::isAdmin)
    .findFirst()
    .get();`,
      options: [
        '`findFirst` gibt es nicht',
        '`get()` wirft `NoSuchElementException`, wenn es keinen Admin gibt – Fall wird nicht explizit behandelt',
        '`filter` braucht ein Lambda',
        'Kein Bug, `get()` liefert `null`, wenn leer',
      ],
      correct: 1,
      explanation: '`Optional.get()` auf leerem Optional wirft. Besser: `.orElseThrow(() -> new IllegalStateException("no admin"))` oder bewusst `orElse(..)`.',
    },
    {
      id: 'q9',
      prompt: 'Was ergibt der Code?',
      code: `long n = Stream.of(3, 1, 3, 2, 1)
    .distinct()
    .sorted()
    .skip(1)
    .count();`,
      options: ['`4`', '`3`', '`2`', '`1`'],
      correct: 2,
      explanation: '`distinct` → 3, 1, 2; `sorted` → 1, 2, 3; `skip(1)` → 2, 3; `count` → 2.',
    },
    {
      id: 'q10',
      prompt: 'Welcher Typ hat `avg`?',
      code: `var avg = users.stream().mapToInt(User::age).average();`,
      options: ['`double`', '`Double`', '`Optional<Double>`', '`OptionalDouble`'],
      correct: 3,
      explanation: '`IntStream.average()` liefert `OptionalDouble` (leer bei leerem Stream). Auspacken z. B. mit `orElse(0)`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Aktive Namen sortiert',
      level: 1,
      description: 'Implementiere `activeNames(List<User> users)`: die Namen aller **aktiven** User, alphabetisch sortiert, ohne Duplikate. Nutze einen Stream.',
      given: `record User(Long id, String name, int age, boolean active, boolean admin) {}`,
      starter: `class Solution {

    static List<String> activeNames(List<User> users) {
        // TODO
        return List.of();
    }
}`,
      solution: `class Solution {

    static List<String> activeNames(List<User> users) {
        return users.stream()
            .filter(User::active)
            .map(User::name)
            .distinct()
            .sorted()
            .toList();
    }
}`,
      hints: [
        'Reihenfolge überlegen: erst filtern (braucht den User), dann auf den Namen mappen.',
        '`filter`, `map`, `distinct`, `sorted`, `toList` – mit Method References auf die Record-Accessors.',
        'stream → filter(active) → map(name) → distinct → sorted → toList',
        '`return users.stream().filter(User::active).map(User::name)...`',
      ],
      tests: `var users = List.of(
    new User(1L, "Tom", 30, true, false),
    new User(2L, "Anna", 25, false, false),
    new User(3L, "Ben", 40, true, true),
    new User(4L, "Tom", 22, true, false));
check("aktiv, sortiert, eindeutig", List.of("Ben", "Tom"), Solution.activeNames(users));
check("leer", List.of(), Solution.activeNames(List.of()));
check("keiner aktiv", List.of(), Solution.activeNames(List.of(new User(5L, "X", 1, false, false))));
check("einer", List.of("Zoe"), Solution.activeNames(List.of(new User(6L, "Zoe", 1, true, false))));`,
    },
    {
      id: 'k2',
      title: 'Filter + Sort + Mapping zu DTOs',
      level: 2,
      description: `Gegeben eine Liste von Orders. Implementiere \`bigPaidOrders(List<Order> orders)\`:

- nur Orders mit Status \`PAID\`
- Betrag **über** 100 (\`> 100\`, nicht \`>=\`)
- nach Betrag **absteigend** sortiert
- Ergebnis als \`List<OrderDto>\`

Beträge sind \`BigDecimal\` – vergleiche mit \`compareTo\`.`,
      given: `enum OrderStatus { NEW, PAID, CANCELLED }
record Order(Long id, String customer, BigDecimal amount, OrderStatus status) {}
record OrderDto(Long id, String customer, BigDecimal amount) {}`,
      starter: `class Solution {

    static List<OrderDto> bigPaidOrders(List<Order> orders) {
        // TODO
        return List.of();
    }
}`,
      solution: `class Solution {

    private static final BigDecimal THRESHOLD = new BigDecimal("100");

    static List<OrderDto> bigPaidOrders(List<Order> orders) {
        return orders.stream()
            .filter(order -> order.status() == OrderStatus.PAID)
            .filter(order -> order.amount().compareTo(THRESHOLD) > 0)
            .sorted(Comparator.comparing(Order::amount).reversed())
            .map(order -> new OrderDto(order.id(), order.customer(), order.amount()))
            .toList();
    }
}`,
      hints: [
        'Erst alles filtern, dann sortieren (weniger Elemente), zuletzt in DTOs umwandeln.',
        'Enums mit `==` vergleichen, `BigDecimal` mit `compareTo(..) > 0`, `Comparator.comparing(Order::amount).reversed()`.',
        'stream → filter(status == PAID) → filter(amount > 100) → sorted(amount desc) → map(new OrderDto(..)) → toList',
        '`.sorted(Comparator.comparing(Order::amount).reversed())`',
      ],
      tests: `var orders = List.of(
    new Order(1L, "Jan", new BigDecimal("150.00"), OrderStatus.PAID),
    new Order(2L, "Anna", new BigDecimal("500.00"), OrderStatus.NEW),
    new Order(3L, "Tom", new BigDecimal("100.00"), OrderStatus.PAID),
    new Order(4L, "Lea", new BigDecimal("300.00"), OrderStatus.PAID),
    new Order(5L, "Ben", new BigDecimal("99.99"), OrderStatus.PAID),
    new Order(6L, "Max", new BigDecimal("1000.00"), OrderStatus.CANCELLED));
var result = Solution.bigPaidOrders(orders);
check("Anzahl", 2, result.size());
check("teuerste zuerst", new OrderDto(4L, "Lea", new BigDecimal("300.00")), result.get(0));
check("komplett", List.of(new OrderDto(4L, "Lea", new BigDecimal("300.00")), new OrderDto(1L, "Jan", new BigDecimal("150.00"))), result);
checkTrue("genau 100 nicht enthalten", result.stream().noneMatch(d -> d.id() == 3L));
check("leer", List.of(), Solution.bigPaidOrders(List.of()));`,
    },
    {
      id: 'k3',
      title: 'Suchen, Prüfen, Zählen',
      level: 2,
      description: `Implementiere mit Streams (jeweils eine Pipeline):

- \`hasAdmin(users)\`: gibt es mindestens einen Admin?
- \`allAdults(users)\`: sind alle mindestens 18?
- \`countActive(users)\`: Anzahl aktiver User
- \`firstAdminName(users)\`: Name des ersten Admins oder \`"none"\`
- \`averageAge(users)\`: Durchschnittsalter, \`0.0\` bei leerer Liste`,
      given: `record User(Long id, String name, int age, boolean active, boolean admin) {}`,
      starter: `class Solution {

    static boolean hasAdmin(List<User> users) {
        // TODO
        return false;
    }

    static boolean allAdults(List<User> users) {
        // TODO
        return false;
    }

    static long countActive(List<User> users) {
        // TODO
        return -1;
    }

    static String firstAdminName(List<User> users) {
        // TODO
        return null;
    }

    static double averageAge(List<User> users) {
        // TODO
        return -1;
    }
}`,
      solution: `class Solution {

    static boolean hasAdmin(List<User> users) {
        return users.stream().anyMatch(User::admin);
    }

    static boolean allAdults(List<User> users) {
        return users.stream().allMatch(user -> user.age() >= 18);
    }

    static long countActive(List<User> users) {
        return users.stream().filter(User::active).count();
    }

    static String firstAdminName(List<User> users) {
        return users.stream()
            .filter(User::admin)
            .map(User::name)
            .findFirst()
            .orElse("none");
    }

    static double averageAge(List<User> users) {
        return users.stream()
            .mapToInt(User::age)
            .average()
            .orElse(0.0);
    }
}`,
      hints: [
        'Für Ja/Nein-Fragen gibt es eigene Terminal Operations mit Short-Circuit.',
        '`anyMatch`, `allMatch`, `count`, `findFirst` + `orElse`, `mapToInt(..).average()` (liefert `OptionalDouble`).',
        'firstAdminName: filter(admin) → map(name) → findFirst → orElse("none").',
        '`return users.stream().mapToInt(User::age).average().orElse(0.0);`',
      ],
      tests: `var users = List.of(
    new User(1L, "Tom", 30, true, false),
    new User(2L, "Anna", 16, false, false),
    new User(3L, "Ben", 44, true, true),
    new User(4L, "Lea", 50, true, true));
checkTrue("hasAdmin", Solution.hasAdmin(users));
checkTrue("hasAdmin leer", !Solution.hasAdmin(List.of()));
checkTrue("nicht alle erwachsen", !Solution.allAdults(users));
checkTrue("allAdults leer = true", Solution.allAdults(List.of()));
check("countActive", 3L, Solution.countActive(users));
check("erster Admin", "Ben", Solution.firstAdminName(users));
check("kein Admin", "none", Solution.firstAdminName(List.of(users.get(0))));
check("Durchschnitt", 35.0, Solution.averageAge(users));
check("Durchschnitt leer", 0.0, Solution.averageAge(List.of()));`,
    },
    {
      id: 'k4',
      title: 'Mehrstufig sortieren und paginieren',
      level: 3,
      description: `Implementiere:

- \`sortedForDisplay(List<Employee> employees)\`: Namen sortiert nach Abteilung **aufsteigend**, dann Gehalt **absteigend**, dann Name aufsteigend
- \`page(List<String> items, int page, int size)\`: 0-basierte Seite, z. B. \`page(items, 1, 2)\` → Elemente 3 und 4. Seite außerhalb → leere Liste. \`page < 0\` oder \`size < 1\` → \`IllegalArgumentException\`
- \`topEarners(List<Employee> employees, int n)\`: Namen der \`n\` bestbezahlten, kommagetrennt (\`"Anna, Ben"\`)`,
      given: `record Employee(String name, String department, BigDecimal salary) {}`,
      starter: `class Solution {

    static List<String> sortedForDisplay(List<Employee> employees) {
        // TODO
        return List.of();
    }

    static List<String> page(List<String> items, int page, int size) {
        // TODO
        return items;
    }

    static String topEarners(List<Employee> employees, int n) {
        // TODO
        return "";
    }
}`,
      solution: `class Solution {

    static List<String> sortedForDisplay(List<Employee> employees) {
        return employees.stream()
            .sorted(Comparator.comparing(Employee::department)
                .thenComparing(Employee::salary, Comparator.reverseOrder())
                .thenComparing(Employee::name))
            .map(Employee::name)
            .toList();
    }

    static List<String> page(List<String> items, int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("invalid page/size");
        }
        return items.stream()
            .skip((long) page * size)
            .limit(size)
            .toList();
    }

    static String topEarners(List<Employee> employees, int n) {
        return employees.stream()
            .sorted(Comparator.comparing(Employee::salary).reversed())
            .limit(n)
            .map(Employee::name)
            .collect(Collectors.joining(", "));
    }
}`,
      hints: [
        'Mehrere Sortierkriterien werden mit `thenComparing` verkettet. Achtung: `reversed()` am Ende dreht alles um.',
        '`thenComparing(Employee::salary, Comparator.reverseOrder())`, `skip`, `limit`, `Collectors.joining(", ")`.',
        'page: validieren → skip(page * size) → limit(size) → toList. topEarners: sort desc → limit(n) → map(name) → joining.',
        '`Comparator.comparing(Employee::department).thenComparing(Employee::salary, Comparator.reverseOrder()).thenComparing(Employee::name)`',
      ],
      tests: `var emps = List.of(
    new Employee("Tom", "IT", new BigDecimal("60000")),
    new Employee("Anna", "HR", new BigDecimal("50000")),
    new Employee("Ben", "IT", new BigDecimal("80000")),
    new Employee("Cleo", "IT", new BigDecimal("60000")),
    new Employee("Dan", "HR", new BigDecimal("70000")));
check("sortiert", List.of("Dan", "Anna", "Ben", "Cleo", "Tom"), Solution.sortedForDisplay(emps));
var items = List.of("a", "b", "c", "d", "e");
check("Seite 0", List.of("a", "b"), Solution.page(items, 0, 2));
check("Seite 1", List.of("c", "d"), Solution.page(items, 1, 2));
check("letzte Seite unvollständig", List.of("e"), Solution.page(items, 2, 2));
check("Seite außerhalb", List.of(), Solution.page(items, 5, 2));
checkThrows("size 0", IllegalArgumentException.class, () -> Solution.page(items, 0, 0));
checkThrows("page negativ", IllegalArgumentException.class, () -> Solution.page(items, -1, 2));
check("Top 2", "Ben, Dan", Solution.topEarners(emps, 2));
check("Top 0", "", Solution.topEarners(emps, 0));
check("Top leer", "", Solution.topEarners(List.of(), 3));`,
    },
  ],
}

export default chapter
