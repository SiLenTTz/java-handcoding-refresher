import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '05',
  flashcards: [
    { id: 'f1', front: 'Wann `map`, wann `flatMap`?', back: '`map` ist 1 → 1 (`Stream<User>` → `Stream<String>`). `flatMap` ist 1 → 0..n und glättet: `Stream<User>` → `Stream<Role>` via `flatMap(u -> u.roles().stream())`.' },
    { id: 'f2', front: 'Woran erkennst du, dass du `flatMap` brauchst?', back: 'Wenn der Ergebnistyp mit `map` doppelt verschachtelt wäre: `List<List<Role>>` bzw. `Optional<Optional<T>>`.' },
    { id: 'f3', front: 'Signatur und Bedeutung von `reduce(identity, accumulator)`?', back: '```java\nT reduce(T identity, BinaryOperator<T> op)\n```\nDie Identity muss **neutral** sein (`0` für Summe, `1` für Produkt, `BigDecimal.ZERO`) – sonst verfälscht sie das Ergebnis.' },
    { id: 'f4', front: 'Was liefert `reduce(op)` ohne Identity?', back: '`Optional<T>` – der leere Stream hat kein Ergebnis. Beispiel: `numbers.stream().reduce(Integer::max)`.' },
    { id: 'f5', front: 'Anzahl User pro Land?', back: '```java\nMap<String, Long> n = users.stream()\n    .collect(Collectors.groupingBy(User::country, Collectors.counting()));\n```\n`counting()` liefert `Long`, nicht `Integer`.' },
    { id: 'f6', front: 'Nur die Namen pro Land sammeln, nicht die ganzen User?', back: '`groupingBy(User::country, Collectors.mapping(User::name, Collectors.toList()))` – `mapping` transformiert innerhalb der Gruppe.' },
    { id: 'f7', front: 'Welchen Map-Typ liefert `groupingBy` – und wie änderst du das?', back: 'Standard: `HashMap` mit `ArrayList`-Werten (keine Ordnung). Mit 3-Argument-Variante: `groupingBy(User::country, TreeMap::new, Collectors.toList())`.' },
    { id: 'f8', front: 'Unterschied `groupingBy` und `partitioningBy`?', back: '`groupingBy` erzeugt nur Gruppen, die vorkommen. `partitioningBy(Predicate)` liefert **immer** beide Keys `true` und `false` – auch bei leerem Stream.' },
    { id: 'f9', front: 'Was passiert bei `toMap` mit doppelten Keys?', back: '`IllegalStateException: Duplicate key`. Lösung: Merge-Funktion als drittes Argument, z. B. `(first, second) -> first` oder `Integer::sum`.' },
    { id: 'f10', front: 'Lookup-Map `id -> User` bauen?', back: '```java\nMap<Long, User> byId = users.stream()\n    .collect(Collectors.toMap(User::id, Function.identity()));\n```' },
    { id: 'f11', front: 'Warum wirft `toMap` bei `null`-Werten eine NPE?', back: '`toMap` nutzt intern `map.merge(..)`, und `merge` verbietet `null`-Values. Vorher filtern oder `groupingBy` nutzen.' },
    { id: 'f12', front: 'Summe von `BigDecimal` über einen Stream?', back: '```java\norders.stream().map(Order::total)\n    .reduce(BigDecimal.ZERO, BigDecimal::add);\n```\nNiemals über `mapToDouble` – Rundungsfehler bei Geld.' },
    { id: 'f13', front: 'Was macht `Collectors.collectingAndThen`?', back: 'Führt nach dem Sammeln eine Finisher-Funktion aus, z. B. `collectingAndThen(toList(), Collections::unmodifiableList)` oder `maxBy(..)` + `Optional::orElseThrow`.' },
    { id: 'f14', front: 'Top 3 häufigste Wörter – welche Pipeline?', back: 'Zählen mit `groupingBy(w -> w, counting())`, dann `entrySet().stream().sorted(comparingByValue().reversed()).limit(3).map(Map.Entry::getKey).toList()`.' },
    { id: 'f15', front: 'Was liefert `Collectors.summarizingInt(User::age)`?', back: 'Ein `IntSummaryStatistics` mit `getCount`, `getSum`, `getMin`, `getMax`, `getAverage` – eine Pipeline statt fünf.' },
    { id: 'f16', front: 'Wofür ist der Combiner in `reduce(identity, acc, combiner)`?', back: 'Nur für **parallele** Streams: Er führt die Teilergebnisse der Threads zusammen. Sequentiell wird er nie aufgerufen.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Typ hat `result`?',
      code: `var result = users.stream()
    .map(User::roles)
    .toList();`,
      options: ['`List<Role>`', '`List<List<Role>>`', '`Stream<Role>`', '`Set<Role>`'],
      correct: 1,
      explanation: '`User::roles` liefert pro User eine `List<Role>` – `map` glättet nicht. Für `List<Role>` braucht es `flatMap(u -> u.roles().stream())`.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `List<Integer> nums = List.of(1, 2, 3);
System.out.println(nums.stream().reduce(10, Integer::sum));`,
      options: ['`6`', '`16`', '`10`', '`Optional[6]`'],
      correct: 1,
      explanation: 'Die Identity wird in die Akkumulation eingerechnet: 10 + 1 + 2 + 3 = 16. Für eine Summe muss die Identity neutral sein, also `0`.',
    },
    {
      id: 'q3',
      prompt: 'Welchen Typ hat der Wert in der Map?',
      code: `var byCountry = users.stream()
    .collect(Collectors.groupingBy(User::country, Collectors.counting()));`,
      options: ['`Map<String, Integer>`', '`Map<String, Long>`', '`Map<String, List<User>>`', '`Map<String, OptionalLong>`'],
      correct: 1,
      explanation: '`Collectors.counting()` liefert immer `Long`. Ein `Map<String, Integer>` als Zieltyp würde nicht kompilieren.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Bug?',
      code: `Map<String, String> byCountry = users.stream()
    .collect(Collectors.toMap(User::country, User::name));`,
      options: [
        '`toMap` braucht immer vier Argumente',
        'Bei mehreren Usern pro Land knallt es mit `IllegalStateException: Duplicate key`',
        '`User::country` ist kein gültiger Key-Typ',
        'Das Ergebnis ist immer leer',
      ],
      correct: 1,
      explanation: 'Das Land ist kein eindeutiger Key. Entweder Merge-Funktion `(a, b) -> a` ergänzen oder `groupingBy` mit `mapping(User::name, toList())` nutzen.',
    },
    {
      id: 'q5',
      prompt: 'Was liefert der Code bei einer **leeren** Liste?',
      code: `var p = List.<User>of().stream()
    .collect(Collectors.partitioningBy(User::active));`,
      options: ['`{}`', '`{false=[], true=[]}`', '`null`', '`NoSuchElementException`'],
      correct: 1,
      explanation: '`partitioningBy` legt immer beide Keys an – im Gegensatz zu `groupingBy`, das nur tatsächlich vorkommende Gruppen erzeugt.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `var words = List.of("a", "bb", "a", "ccc");
var m = words.stream()
    .collect(Collectors.toMap(w -> w, String::length, Integer::sum));
System.out.println(m.get("a"));`,
      options: ['`1`', '`2`', '`IllegalStateException`', '`null`'],
      correct: 1,
      explanation: '"a" kommt zweimal vor. Die Merge-Funktion `Integer::sum` addiert die beiden Längen: 1 + 1 = 2. Ohne Merge-Funktion gäbe es eine `IllegalStateException`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist Clean Code für „Umsatz aller Bestellungen"?',
      options: [
        '`double sum = orders.stream().mapToDouble(o -> o.total().doubleValue()).sum();`',
        '`BigDecimal sum = orders.stream().map(Order::total).reduce(BigDecimal.ZERO, BigDecimal::add);`',
        '`BigDecimal sum = BigDecimal.ZERO; orders.forEach(o -> sum.add(o.total()));`',
        '`BigDecimal sum = orders.stream().reduce(BigDecimal.ZERO, (a, o) -> a.add(o.total()), (a, b) -> a);`',
      ],
      correct: 1,
      explanation: 'Geld nie über `double`. Variante 3 kompiliert nicht (`sum` nicht effectively final) und wäre zudem wirkungslos, weil `BigDecimal` immutable ist. Variante 4 hat einen falschen Combiner.',
    },
    {
      id: 'q8',
      prompt: 'Warum kompiliert das nicht?',
      code: `List<String> top = counts.entrySet().stream()
    .sorted(Map.Entry.comparingByValue().reversed()
        .thenComparing(Map.Entry.comparingByKey()))
    .map(Map.Entry::getKey)
    .toList();`,
      options: [
        '`Map.Entry` hat keine Methode `comparingByValue`',
        'Die Typinferenz scheitert – es braucht einen Typzeugen: `Map.Entry.<String, Long>comparingByValue()`',
        '`sorted` akzeptiert keinen zusammengesetzten Comparator',
        '`entrySet()` liefert keinen Stream',
      ],
      correct: 1,
      explanation: 'Bei verketteten statischen Comparator-Factories kann der Compiler `K`/`V` nicht mehr ableiten. Typzeuge setzen oder das Ergebnis vorher in einer typisierten Variable ablegen.',
    },
    {
      id: 'q9',
      prompt: 'Was steht in `m`?',
      code: `record E(String dept, int salary) {}
var list = List.of(new E("IT", 50), new E("HR", 30), new E("IT", 70));
var m = list.stream().collect(
    Collectors.groupingBy(E::dept, Collectors.summingInt(E::salary)));`,
      options: ['`{IT=120, HR=30}`', '`{IT=2, HR=1}`', '`{IT=[50, 70], HR=[30]}`', '`{IT=70, HR=30}`'],
      correct: 0,
      explanation: '`summingInt` summiert innerhalb jeder Gruppe und liefert `Integer`. Ergebnis: IT = 50 + 70 = 120, HR = 30.',
    },
    {
      id: 'q10',
      prompt: 'Welche Aussage über `Collectors.toMap` stimmt?',
      options: [
        'Es behält die Reihenfolge des Streams bei',
        'Bei `null` als Value wirft es eine `NullPointerException`',
        'Bei doppelten Keys gewinnt automatisch der letzte Wert',
        'Es liefert immer eine `TreeMap`',
      ],
      correct: 1,
      explanation: '`toMap` arbeitet intern mit `Map.merge`, das keine `null`-Values erlaubt. Reihenfolge nur mit `LinkedHashMap::new` als Map-Factory; Duplikate ohne Merge-Funktion knallen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Gruppieren und zählen',
      level: 1,
      description: `Implementiere mit \`Collectors\`:

- \`countByCountry(List<User> users)\` → \`Map<String, Long>\`: Anzahl User pro Land
- \`namesByCountry(List<User> users)\` → \`Map<String, List<String>>\`: nur die **Namen** pro Land (Reihenfolge wie in der Eingabe)`,
      given: `record User(Long id, String name, String country, int age, boolean active) {}`,
      starter: `class Solution {

    static Map<String, Long> countByCountry(List<User> users) {
        // TODO
        return Map.of();
    }

    static Map<String, List<String>> namesByCountry(List<User> users) {
        // TODO
        return Map.of();
    }
}`,
      solution: `class Solution {

    static Map<String, Long> countByCountry(List<User> users) {
        return users.stream()
            .collect(Collectors.groupingBy(User::country, Collectors.counting()));
    }

    static Map<String, List<String>> namesByCountry(List<User> users) {
        return users.stream()
            .collect(Collectors.groupingBy(User::country,
                Collectors.mapping(User::name, Collectors.toList())));
    }
}`,
      hints: [
        '`groupingBy` nimmt optional einen zweiten Collector, der **pro Gruppe** sammelt.',
        '`Collectors.groupingBy`, `Collectors.counting()`, `Collectors.mapping(mapper, downstream)`.',
        'stream → collect(groupingBy(country, counting())) bzw. groupingBy(country, mapping(name, toList()))',
        '`Collectors.groupingBy(User::country, Collectors.mapping(User::name, Collectors.toList()))`',
      ],
      tests: `var users = List.of(
    new User(1L, "Jan", "DE", 30, true),
    new User(2L, "Anna", "AT", 25, false),
    new User(3L, "Ben", "DE", 40, true),
    new User(4L, "Lea", "DE", 22, true));
check("Anzahl pro Land", Map.of("DE", 3L, "AT", 1L), Solution.countByCountry(users));
check("Namen pro Land", Map.of("DE", List.of("Jan", "Ben", "Lea"), "AT", List.of("Anna")), Solution.namesByCountry(users));
check("leer zählt", Map.of(), Solution.countByCountry(List.of()));
check("leer mappt", Map.of(), Solution.namesByCountry(List.of()));
check("ein Land", Map.of("CH", 1L), Solution.countByCountry(List.of(new User(9L, "Ueli", "CH", 50, true))));`,
    },
    {
      id: 'k2',
      title: 'flatMap über verschachtelte Listen',
      level: 2,
      description: `Jeder User hat eine Liste von Rollen. Implementiere:

- \`allRoleNames(List<User> users)\` → \`List<String>\`: alle Rollennamen, **ohne Duplikate**, alphabetisch sortiert
- \`userCountPerRole(List<User> users)\` → \`Map<String, Long>\`: wie viele User haben die jeweilige Rolle?`,
      given: `record Role(String name) {}
record User(Long id, String name, List<Role> roles) {}`,
      starter: `class Solution {

    static List<String> allRoleNames(List<User> users) {
        // TODO
        return List.of();
    }

    static Map<String, Long> userCountPerRole(List<User> users) {
        // TODO
        return Map.of();
    }
}`,
      solution: `class Solution {

    static List<String> allRoleNames(List<User> users) {
        return users.stream()
            .flatMap(user -> user.roles().stream())
            .map(Role::name)
            .distinct()
            .sorted()
            .toList();
    }

    static Map<String, Long> userCountPerRole(List<User> users) {
        return users.stream()
            .flatMap(user -> user.roles().stream())
            .collect(Collectors.groupingBy(Role::name, Collectors.counting()));
    }
}`,
      hints: [
        'Aus einem Stream von Usern soll ein Stream von Rollen werden – das ist eine 1 → n Abbildung.',
        '`flatMap(user -> user.roles().stream())`, danach `map`, `distinct`, `sorted` bzw. `groupingBy` + `counting`.',
        'stream → flatMap(roles) → map(name) → distinct → sorted → toList',
        '`users.stream().flatMap(user -> user.roles().stream())...`',
      ],
      tests: `var admin = new Role("ADMIN");
var user = new Role("USER");
var audit = new Role("AUDIT");
var users = List.of(
    new User(1L, "Jan", List.of(admin, user)),
    new User(2L, "Anna", List.of(user)),
    new User(3L, "Ben", List.of(user, audit)),
    new User(4L, "Lea", List.of()));
check("alle Rollen sortiert", List.of("ADMIN", "AUDIT", "USER"), Solution.allRoleNames(users));
check("User pro Rolle", Map.of("ADMIN", 1L, "USER", 3L, "AUDIT", 1L), Solution.userCountPerRole(users));
check("leere Eingabe", List.of(), Solution.allRoleNames(List.of()));
check("nur User ohne Rollen", List.of(), Solution.allRoleNames(List.of(new User(5L, "X", List.of()))));
check("leere Zählung", Map.of(), Solution.userCountPerRole(List.of()));`,
    },
    {
      id: 'k3',
      title: 'toMap mit Merge und reduce',
      level: 2,
      description: `Implementiere:

- \`revenueByCustomer(List<Order> orders)\` → \`Map<String, BigDecimal>\`: Umsatz pro Kunde. Ein Kunde kann mehrere Orders haben – Beträge addieren.
- \`totalRevenue(List<Order> orders)\` → \`BigDecimal\`: Gesamtumsatz, \`BigDecimal.ZERO\` bei leerer Liste.

Nutze für die erste Methode \`Collectors.toMap\` mit Merge-Funktion, für die zweite \`reduce\`.`,
      given: `record Order(Long id, String customer, BigDecimal amount) {}`,
      starter: `class Solution {

    static Map<String, BigDecimal> revenueByCustomer(List<Order> orders) {
        // TODO
        return Map.of();
    }

    static BigDecimal totalRevenue(List<Order> orders) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Map<String, BigDecimal> revenueByCustomer(List<Order> orders) {
        return orders.stream()
            .collect(Collectors.toMap(Order::customer, Order::amount, BigDecimal::add));
    }

    static BigDecimal totalRevenue(List<Order> orders) {
        return orders.stream()
            .map(Order::amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}`,
      hints: [
        'Doppelte Keys sind hier fachlich normal – `toMap` braucht deshalb zwingend eine Merge-Funktion.',
        '`Collectors.toMap(keyMapper, valueMapper, mergeFunction)` und `reduce(identity, BinaryOperator)`.',
        'toMap(customer, amount, BigDecimal::add) – reduce(BigDecimal.ZERO, BigDecimal::add) nach map(amount).',
        '`.collect(Collectors.toMap(Order::customer, Order::amount, BigDecimal::add))`',
      ],
      tests: `var orders = List.of(
    new Order(1L, "Jan", new BigDecimal("150.00")),
    new Order(2L, "Anna", new BigDecimal("200.00")),
    new Order(3L, "Jan", new BigDecimal("100.00")));
check("Umsatz pro Kunde", Map.of("Jan", new BigDecimal("250.00"), "Anna", new BigDecimal("200.00")), Solution.revenueByCustomer(orders));
check("Gesamtumsatz", new BigDecimal("450.00"), Solution.totalRevenue(orders));
check("leer: Map", Map.of(), Solution.revenueByCustomer(List.of()));
check("leer: Summe ist ZERO", BigDecimal.ZERO, Solution.totalRevenue(List.of()));
check("eine Order", new BigDecimal("9.99"), Solution.totalRevenue(List.of(new Order(4L, "X", new BigDecimal("9.99")))));`,
    },
    {
      id: 'k4',
      title: 'Report je Abteilung',
      level: 3,
      description: `Implementiere drei Auswertungen über \`List<Employee>\`:

- \`payrollByDepartment\` → \`Map<String, BigDecimal>\`: Gehaltssumme pro Abteilung (\`Collectors.reducing\`)
- \`topEarnerByDepartment\` → \`Map<String, String>\`: Name des Bestverdieners pro Abteilung (\`maxBy\` + \`collectingAndThen\`)
- \`countBySenior\` → \`Map<Boolean, Long>\`: Anzahl Mitarbeiter mit Alter \`>= 50\` (Key \`true\`) und darunter (\`partitioningBy\`)`,
      given: `record Employee(String name, String department, BigDecimal salary, int age) {}`,
      starter: `class Solution {

    static Map<String, BigDecimal> payrollByDepartment(List<Employee> employees) {
        // TODO
        return Map.of();
    }

    static Map<String, String> topEarnerByDepartment(List<Employee> employees) {
        // TODO
        return Map.of();
    }

    static Map<Boolean, Long> countBySenior(List<Employee> employees) {
        // TODO
        return Map.of();
    }
}`,
      solution: `class Solution {

    static Map<String, BigDecimal> payrollByDepartment(List<Employee> employees) {
        return employees.stream()
            .collect(Collectors.groupingBy(Employee::department,
                Collectors.reducing(BigDecimal.ZERO, Employee::salary, BigDecimal::add)));
    }

    static Map<String, String> topEarnerByDepartment(List<Employee> employees) {
        return employees.stream()
            .collect(Collectors.groupingBy(Employee::department,
                Collectors.collectingAndThen(
                    Collectors.maxBy(Comparator.comparing(Employee::salary)),
                    best -> best.map(Employee::name).orElseThrow())));
    }

    static Map<Boolean, Long> countBySenior(List<Employee> employees) {
        return employees.stream()
            .collect(Collectors.partitioningBy(employee -> employee.age() >= 50,
                Collectors.counting()));
    }
}`,
      hints: [
        'Alle drei Aufgaben sind „gruppieren + pro Gruppe weitersammeln". Der zweite Parameter von `groupingBy`/`partitioningBy` ist der Downstream-Collector.',
        '`Collectors.reducing(identity, mapper, op)`, `Collectors.maxBy(Comparator)`, `Collectors.collectingAndThen(collector, finisher)`, `Collectors.partitioningBy(predicate, downstream)`.',
        'payroll: groupingBy(dept, reducing(ZERO, salary, add)). topEarner: groupingBy(dept, collectingAndThen(maxBy(comparing(salary)), opt -> opt.map(name).orElseThrow())). countBySenior: partitioningBy(age >= 50, counting()).',
        '`Collectors.collectingAndThen(Collectors.maxBy(Comparator.comparing(Employee::salary)), best -> best.map(Employee::name).orElseThrow())`',
      ],
      tests: `var emps = List.of(
    new Employee("Tom", "IT", new BigDecimal("60000.00"), 30),
    new Employee("Anna", "HR", new BigDecimal("50000.00"), 45),
    new Employee("Ben", "IT", new BigDecimal("80000.00"), 52),
    new Employee("Cleo", "IT", new BigDecimal("60000.00"), 60),
    new Employee("Dan", "HR", new BigDecimal("70000.00"), 40));
check("Gehaltssumme", Map.of("IT", new BigDecimal("200000.00"), "HR", new BigDecimal("120000.00")), Solution.payrollByDepartment(emps));
check("Bestverdiener", Map.of("IT", "Ben", "HR", "Dan"), Solution.topEarnerByDepartment(emps));
check("Senioren-Split", Map.of(false, 3L, true, 2L), Solution.countBySenior(emps));
check("leer: keine Gruppen", Map.of(), Solution.payrollByDepartment(List.of()));
check("leer: Partition hat beide Keys", Map.of(false, 0L, true, 0L), Solution.countBySenior(List.of()));`,
    },
    {
      id: 'k5',
      title: 'Top-N Wörter',
      level: 4,
      description: `Implementiere \`topWords(String text, int n)\` → \`List<String>\`:

1. Text in Wörter zerlegen (Trenner: alles, was kein Buchstabe ist – Regex \`[^a-zA-Z]+\`)
2. leere Teile verwerfen, alles in Kleinbuchstaben
3. Häufigkeiten zählen
4. sortieren: Häufigkeit **absteigend**, bei Gleichstand Wort **alphabetisch aufsteigend**
5. die ersten \`n\` Wörter zurückgeben

\`n <= 0\` oder leerer Text → leere Liste.`,
      starter: `class Solution {

    static List<String> topWords(String text, int n) {
        // TODO
        return List.of();
    }
}`,
      solution: `class Solution {

    static List<String> topWords(String text, int n) {
        if (n <= 0) {
            return List.of();
        }
        Map<String, Long> counts = Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-zA-Z]+"))
            .filter(word -> !word.isBlank())
            .collect(Collectors.groupingBy(word -> word, Collectors.counting()));

        return counts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()))
            .limit(n)
            .map(Map.Entry::getKey)
            .toList();
    }
}`,
      hints: [
        'Zwei Phasen: erst zählen (Map), dann über die Map-Einträge streamen und sortieren.',
        '`Arrays.stream(text.split(regex))`, `groupingBy(w -> w, counting())`, `Map.Entry.comparingByValue()`, `comparingByKey()`, `limit`.',
        'split → filter(!isBlank) → groupingBy/counting → entrySet().stream() → sorted(byValue desc, dann byKey asc) → limit(n) → map(getKey) → toList',
        '`.sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))`',
      ],
      tests: `String text = "Der Hund und die Katze und der Vogel und die Maus";
check("Top 3", List.of("und", "der", "die"), Solution.topWords(text, 3));
check("Top 1", List.of("und"), Solution.topWords(text, 1));
check("n groesser als Wortschatz", List.of("und", "der", "die", "hund", "katze", "maus", "vogel"), Solution.topWords(text, 99));
check("leerer Text", List.of(), Solution.topWords("", 3));
check("n = 0", List.of(), Solution.topWords(text, 0));
check("nur Satzzeichen", List.of(), Solution.topWords("... --- !!!", 5));
check("Gleichstand alphabetisch", List.of("aa", "bb"), Solution.topWords("bb aa", 2));`,
    },
  ],
}

export default chapter
