import type { ChapterContent } from '../../types'

const EMPLOYEE = `record Employee(Long id, String name, String department, BigDecimal salary, boolean active) {}`

const SALE = `record Sale(String product, String category, int quantity, BigDecimal revenue) {}`

const BOOKING_DOMAIN = `// Legacy-Entities: veränderlich, Getter, keine Validierung.
class Customer {
    private final String email;
    private final String city;

    Customer(String email, String city) {
        this.email = email;
        this.city = city;
    }
    String getEmail() { return email; }
    String getCity() { return city; }
}

class Booking {
    private final Long id;
    private final Customer customer;
    private final List<String> tags;
    private final BigDecimal price;

    Booking(Long id, Customer customer, List<String> tags, BigDecimal price) {
        this.id = id;
        this.customer = customer;
        this.tags = tags;
        this.price = price;
    }
    Long getId() { return id; }
    Customer getCustomer() { return customer; }
    List<String> getTags() { return tags; }
    BigDecimal getPrice() { return price; }
}`

const ACCOUNT_DOMAIN = `class Account {
    private final Long id;
    private final String owner;
    private BigDecimal balance;

    Account(Long id, String owner, BigDecimal balance) {
        this.id = id;
        this.owner = owner;
        this.balance = balance;
    }
    Long getId() { return id; }
    String getOwner() { return owner; }
    BigDecimal getBalance() { return balance; }
    void setBalance(BigDecimal balance) { this.balance = balance; }
}

interface AccountRepository {
    Optional<Account> findById(Long id);
    Account save(Account account);
}

class InMemoryAccountRepository implements AccountRepository {
    private final Map<Long, Account> store = new LinkedHashMap<>();

    InMemoryAccountRepository(List<Account> accounts) {
        accounts.forEach(account -> store.put(account.getId(), account));
    }
    public Optional<Account> findById(Long id) { return Optional.ofNullable(store.get(id)); }
    public Account save(Account account) { store.put(account.getId(), account); return account; }
}

class AccountNotFoundException extends RuntimeException {
    AccountNotFoundException(Long id) { super("Account " + id + " nicht gefunden"); }
}

class InsufficientFundsException extends RuntimeException {
    InsufficientFundsException(Long id, BigDecimal balance, BigDecimal amount) {
        super("Account " + id + ": Saldo " + balance + " reicht nicht fuer " + amount);
    }
}`

const PAGING_DOMAIN = `record Product(Long id, String name, String category, BigDecimal price, int stock) {}

record PageRequest(int page, int size, String sortBy, boolean descending) {}

record PageResult<T>(List<T> content, int page, int size, long totalElements) {
    int totalPages() { return size < 1 ? 0 : (int) Math.ceil((double) totalElements / size); }
    boolean hasNext() { return page + 1 < totalPages(); }
    boolean isEmpty() { return content.isEmpty(); }
}`

const chapter: ChapterContent = {
  id: '25',
  flashcards: [
    {
      id: 'f1',
      front: 'Welche Fragen klärst du, **bevor** du bei einer Handcoding-Aufgabe die erste Zeile schreibst?',
      back: '1. Input-Typ? 2. Output-Typ? 3. Edge Cases (leer, `null`, Duplikate, Grenzwerte)? 4. Passende Datenstruktur? 5. Transformieren / filtern / gruppieren / sortieren / deduplizieren? 6. Fehlerfälle?\n\nSignatur zuerst hinschreiben – `List<Order> → Map<String, BigDecimal>` beantwortet die halbe Aufgabe.',
    },
    {
      id: 'f2',
      front: 'Wie ist die Abschlussprüfung aufgebaut (Teile, Punkte, Zeit)?',
      back: '90 min, 100 Punkte, 5 Teile:\n\n1. Fundamentals, 20 Fragen – 20 P / 15 min\n2. Streams, 10 Aufgaben – 20 P / 25 min\n3. Backend-Architektur (Order-API) – 15 P / 25 min\n4. Refactoring 80–150 Zeilen – 10 P / 15 min\n5. Debugging – 10 P / 10 min',
    },
    {
      id: 'f3',
      front: 'Welche Zeitregeln gelten in der Prüfung?',
      back: 'Erst 2 min **alles überfliegen**, dann leichte Punkte zuerst. **Timebox**: hängst du > 5 min, schreibst du Pseudocode hin und gehst weiter. Teil 3 nicht perfektionieren – alle Schichten solide schlägt eine Schicht brillant. **5 min Puffer** am Ende für Compile-Check und Edge Cases.',
    },
    {
      id: 'f4',
      front: 'Was bringt im Interview Punkte, auch wenn der Code nicht perfekt ist?',
      back: '**Laut denken** ("ich nehme `groupingBy` mit `reducing`, weil ..."), **Trade-offs** benennen (Stream vs. Schleife, `Page` vs. `Slice`, Fake vs. Mock), **Lücken offen zugeben** ("die genaue Signatur weiß ich nicht, ich brauche einen Collector, der ..."). Erst korrekt, dann schön.',
    },
    {
      id: 'f5',
      front: 'Vorgehen bei Refactoring- und Debugging-Aufgaben?',
      back: '**Refactoring**: Smells und Bugs **getrennt** auflisten (mit Zeilenbezug), dann kleine Moves – Rename, Guard Clause, Extract Method, Konstante, enum/Strategy – und jeweils begründen, welches Prinzip besser wird. Verhalten ändern nur, wenn du es explizit sagst.\n\n**Debugging**: Was erwarte ich? Was passiert? Welche Zeile erklärt die Differenz?',
    },
    {
      id: 'f6',
      front: 'Collections – die vier Klassiker im Bug-Radar?',
      back: '`List.of(...)` ist unveränderlich → `add` wirft `UnsupportedOperationException`. Entfernen in der for-each-Schleife → `ConcurrentModificationException` (Lösung: `removeIf`). `Arrays.asList` hat feste Größe. `TreeMap`/`TreeSet` nutzen `compareTo`, nicht `equals`.',
    },
    {
      id: 'f7',
      front: 'Welche `Map`-Idiome ersetzen die typischen `if`-Kaskaden?',
      back: '`getOrDefault(k, 0)`, `merge(k, 1, Integer::sum)` (Zähler), `computeIfAbsent(k, x -> new ArrayList<>()).add(v)` (Multi-Map), `putIfAbsent`. Und: `Collectors.toMap` **ohne Merge-Funktion** wirft bei doppeltem Key `IllegalStateException`.',
    },
    {
      id: 'f8',
      front: 'Wie übersetzt du Aufgabentext in Stream-Operationen?',
      back: '"nur die" → `filter`, "wandle um" → `map`, "verschachtelte Liste" → `flatMap`, "pro/gruppiert nach" → `groupingBy(k, downstream)`, "Lookup-Map" → `toMap(k, v, merge)`, "mindestens eins" → `anyMatch`, "finde eins" → `findFirst`, "summiere" → `reduce`/`summingInt`. Ein Stream ist **einmal** verwendbar.',
    },
    {
      id: 'f9',
      front: '`Optional` – die drei Regeln für die Prüfung?',
      back: '1. Kein `get()` ohne Prüfung → `orElseThrow(() -> new XNotFoundException(id))`.\n2. `orElse(teuer())` wird **immer** ausgewertet → `orElseGet(() -> teuer())`.\n3. `Optional` ist Rückgabetyp, **kein** Parameter- oder Feldtyp. `Optional.of(null)` wirft NPE, `ofNullable` nicht.',
    },
    {
      id: 'f10',
      front: 'Records, `equals`/`hashCode`, `BigDecimal` – was wird am häufigsten abgefragt?',
      back: '`equals` ohne `hashCode` → `HashSet`/`HashMap` finden das Objekt nicht. Record mit `List`-Feld ist nicht wirklich immutable → `List.copyOf(...)` im **kompakten Konstruktor**. Geld: `new BigDecimal("0.1")` statt `new BigDecimal(0.1)`, Vergleich mit `compareTo` (`2.0`.equals(`2.00`) ist `false`), `divide` immer mit `RoundingMode`.',
    },
    {
      id: 'f11',
      front: 'Welche Regeln gelten für DTO ↔ Entity-Mapping?',
      back: 'Nie eine Entity an der API-Grenze (Lazy-Loading, Endlosrekursion, ungewollte Felder). Getrennte **Request-** und **Response-DTOs** als Records. Der Mapper enthält **nur** Umwandlung – keine Business-Regeln, keine Repository-Zugriffe. Abgeleitete Werte (`lineTotal`, `total`) im Response-DTO, berechnet beim Mappen.',
    },
    {
      id: 'f12',
      front: 'SOLID in je einem Satz?',
      back: '**S**RP: ein Grund zur Änderung pro Klasse. **O**CP: neue Fälle durch neue Typen, nicht durch neue `if`-Zweige. **L**SP: Subtyp darf den Vertrag nicht verschärfen. **I**SP: kleine, rollenbezogene Interfaces. **D**IP: Service hängt am Interface, nicht an der Implementierung (Konstruktorinjektion).',
    },
    {
      id: 'f13',
      front: 'Generics – `? extends` vs. `? super`?',
      back: '**PECS**: Producer `extends` (nur **lesen**: `List<? extends Number>`), Consumer `super` (nur **schreiben**: `List<? super Integer>`). Und: `List<String>` ist **kein** `List<Object>` – Generics sind invariant.',
    },
    {
      id: 'f14',
      front: 'Exceptions – was musst du begründen können?',
      back: 'Unchecked (`RuntimeException`) für Programmier-/Domänenfehler, checked nur, wenn der Aufrufer sinnvoll reagieren kann. Eigene, sprechende Exceptions pro Fehlerfall, zentral gemappt: `NotFound` → 404, Validierung → 400, Zustandskonflikt → 409. Nie `catch (Exception e) {}` und nie die Ursache verlieren (`cause` durchreichen).',
    },
    {
      id: 'f15',
      front: 'Spring: Schichten, DI und `@Transactional` – die Kurzfassung?',
      back: 'Reihenfolge beim Bauen: Entity → DTOs → Mapper → Repository → Service → Controller → `@RestControllerAdvice`. **Konstruktorinjektion** (final, testbar). `@Transactional` gehört auf die **public** Service-Methode: auf `private` Methoden und bei Selbstaufruf greift der Proxy nicht. Klasse `readOnly = true`, schreibende Methoden überschreiben.',
    },
    {
      id: 'f16',
      front: 'Spring Data & Testing – was solltest du parat haben?',
      back: '`Page` = Inhalt + `totalElements` (teure Count-Query), `Slice` = nur `hasNext()` (für "Mehr laden"), `Pageable` aus dem Controller mit `@PageableDefault`. Ableitungs-Queries wie `findByStatusAndCreatedAtAfter(...)`. Testing: Service mit **Mockito** (Repository mocken), Repository mit `@DataJpaTest`, Web-Schicht mit `@WebMvcTest` + `MockMvc`, Assertions mit AssertJ. N+1 durch `join fetch`/EntityGraph vermeiden.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was ist das Ergebnis von `summe`?',
      code: `List<Integer> zahlen = List.of(5, 3, 5, 1, 3);
int summe = zahlen.stream()
    .distinct()
    .filter(n -> n > 2)
    .mapToInt(Integer::intValue)
    .sum();`,
      options: ['`8`', '`11`', '`17`', '`9`'],
      correct: 0,
      explanation: '`distinct` → 5, 3, 1. `filter(n > 2)` → 5, 3. Summe = 8. Wichtig: `distinct` läuft vor `filter`, die Reihenfolge der Operationen ändert das Ergebnis.',
    },
    {
      id: 'q2',
      prompt: 'Die Liste enthält zwei Benutzer mit derselben E-Mail. Was passiert zur Laufzeit?',
      code: `Map<String, User> byEmail = users.stream()
    .collect(Collectors.toMap(User::email, u -> u));`,
      options: [
        'Der letzte Eintrag gewinnt stillschweigend',
        'Der erste Eintrag gewinnt stillschweigend',
        '`IllegalStateException: Duplicate key`',
        '`ConcurrentModificationException`',
      ],
      correct: 2,
      explanation: '`toMap` ohne Merge-Funktion wirft bei doppeltem Key `IllegalStateException`. Bewusst entscheiden: `toMap(User::email, u -> u, (a, b) -> b)` oder gleich `groupingBy`.',
    },
    {
      id: 'q3',
      prompt: 'Warum ist diese Zeile problematisch, obwohl `name` gefüllt ist?',
      code: `Optional<String> name = repository.findName(id);
String wert = name.orElse(teuerBerechnen());`,
      options: [
        '`orElse` wirft eine `NoSuchElementException`, wenn das Optional gefüllt ist',
        '`teuerBerechnen()` wird als Argument **immer** ausgewertet – auch wenn der Wert vorhanden ist; `orElseGet(() -> teuerBerechnen())` wertet nur bei Bedarf aus',
        '`orElse` funktioniert nur mit `null`-Werten',
        '`orElse` erzeugt ein neues `Optional` und ist deshalb langsam',
      ],
      correct: 1,
      explanation: 'Java wertet Argumente vor dem Methodenaufruf aus. Teure oder seiteneffektbehaftete Defaults gehören in `orElseGet`, Exceptions in `orElseThrow`.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat `gefunden`?',
      code: `class Punkt {
    final int x, y;
    Punkt(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        return o instanceof Punkt p && p.x == x && p.y == y;
    }
}

Set<Punkt> set = new HashSet<>();
set.add(new Punkt(1, 2));
boolean gefunden = set.contains(new Punkt(1, 2));`,
      options: [
        '`true`, weil `equals` überschrieben ist',
        '`false`, weil `hashCode` fehlt und beide Objekte in verschiedenen Buckets landen',
        'Compile-Fehler: `equals` darf nicht `instanceof` nutzen',
        '`false`, weil `final`-Felder in `equals` verboten sind',
      ],
      correct: 1,
      explanation: '`HashSet` sucht zuerst über `hashCode`. Ohne passendes `hashCode` wird `equals` nie erreicht. Regel: `equals` und `hashCode` immer gemeinsam – oder gleich ein `record`.',
    },
    {
      id: 'q5',
      prompt: 'Was gibt dieser Code aus?',
      code: `BigDecimal a = new BigDecimal("2.0");
BigDecimal b = new BigDecimal("2.00");
System.out.println(a.equals(b) + " " + (a.compareTo(b) == 0));`,
      options: ['`true true`', '`false true`', '`true false`', '`false false`'],
      correct: 1,
      explanation: '`BigDecimal.equals` vergleicht auch die **Skala**, `compareTo` nur den Wert. Für Geldvergleiche daher immer `compareTo(...) == 0` (bzw. `signum()`).',
    },
    {
      id: 'q6',
      prompt: 'Warum ist dieser Record trotz `record` nicht wirklich unveränderlich – und was fehlt?',
      code: `record Team(String name, List<String> mitglieder) {}`,
      options: [
        'Records sind nie unveränderlich, man braucht eine Klasse mit `final`-Feldern',
        'Die Referenz auf die übergebene Liste wird geteilt – im kompakten Konstruktor `mitglieder = List.copyOf(mitglieder);` kopieren',
        'Es fehlt `@Override equals`',
        'Es fehlt ein `private` vor `List<String>`',
      ],
      correct: 1,
      explanation: 'Der Record schützt nur die Referenz, nicht den Inhalt. Wer die übergebene Liste noch hält, kann sie weiter ändern. `List.copyOf` im kompakten Konstruktor löst das (und wirft bei `null`-Elementen).',
    },
    {
      id: 'q7',
      prompt: 'Welche Signatur erlaubt es, `List<Integer>`, `List<Double>` und `List<Number>` zu summieren?',
      options: [
        '`double summe(List<Number> zahlen)`',
        '`double summe(List<? super Number> zahlen)`',
        '`double summe(List<? extends Number> zahlen)`',
        '`double summe(List<Object> zahlen)`',
      ],
      correct: 2,
      explanation: 'PECS: Wir **lesen** aus der Liste (Producer) → `? extends Number`. `List<Integer>` ist kein `List<Number>`, Generics sind invariant. `? super Number` wäre die Schreib-Richtung.',
    },
    {
      id: 'q8',
      prompt: 'Was passiert hier?',
      code: `List<String> namen = new ArrayList<>(List.of("Ada", "", "Ben"));
for (String n : namen) {
    if (n.isBlank()) {
        namen.remove(n);
    }
}`,
      options: [
        '`UnsupportedOperationException`, weil `List.of` unveränderlich ist',
        'Der Code läuft korrekt durch',
        '`ConcurrentModificationException` beim nächsten `next()` – korrekt ist `namen.removeIf(String::isBlank)`',
        '`NullPointerException`',
      ],
      correct: 2,
      explanation: 'Der Iterator merkt die strukturelle Änderung (`modCount`) und wirft `ConcurrentModificationException`. Der Wrapper `new ArrayList<>(...)` ist veränderlich, das ist hier nicht das Problem.',
    },
    {
      id: 'q9',
      prompt: 'Warum wird beim Aufruf von `importAll` **keine** Transaktion pro Zeile geöffnet?',
      code: `@Service
class ImportService {
    public void importAll(List<Row> rows) {
        rows.forEach(this::importOne);
    }

    @Transactional
    public void importOne(Row row) { /* ... */ }
}`,
      options: [
        'Selbstaufruf über `this` umgeht den Spring-Proxy – die Annotation wirkt nicht',
        '`@Transactional` gilt nur auf Klassenebene',
        '`forEach` ist nicht transaktionsfähig',
        'Es fehlt `@EnableTransactionManagement`, sonst würde es funktionieren',
      ],
      correct: 0,
      explanation: 'Spring legt einen Proxy um die Bean. Interne Aufrufe (`this.importOne(...)`) und `private`-Methoden laufen am Proxy vorbei. Lösung: Aufruf von außen, eigene Bean oder Transaktion auf `importAll` ziehen.',
    },
    {
      id: 'q10',
      prompt: 'Du testest `OrderService.changeStatus(...)`, der ein `OrderRepository` benutzt. Welcher Testaufbau ist für einen schnellen Unit-Test am passendsten?',
      options: [
        '`@SpringBootTest` mit echter Datenbank, damit alles realistisch ist',
        '`@DataJpaTest`, weil ein Repository beteiligt ist',
        'Repository als Mock/Fake, Service direkt per Konstruktor bauen, Verhalten und Exceptions mit AssertJ prüfen',
        'Gar nicht testen – das deckt der Integrationstest des Controllers ab',
      ],
      correct: 2,
      explanation: 'Business-Logik testet man ohne Spring-Kontext: Repository mocken (Mockito) oder eine In-Memory-Fake-Implementierung nutzen. `@DataJpaTest` ist für Queries, `@SpringBootTest` für wenige End-to-End-Pfade.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Prüfungs-Kata: Report mit Streams, Optional und Comparator',
      level: 3,
      description: `Klassische Teil-2-Aufgabe: aus einer Entity-Liste einen Report bauen. Nur **aktive** Mitarbeiter zählen.

\`\`\`java
static Optional<Employee> topEarner(List<Employee> employees)
static List<String> activeReport(List<Employee> employees)
static String topEarnerLabel(List<Employee> employees)
\`\`\`

- \`topEarner\`: aktiver Mitarbeiter mit dem **höchsten** Gehalt; bei Gleichstand der alphabetisch erste Name. Leere/nur inaktive Liste → \`Optional.empty()\`.
- \`activeReport\`: alle aktiven als \`"department: name"\`, sortiert nach **Abteilung aufsteigend**, dann **Gehalt absteigend**, dann **Name aufsteigend**.
- \`topEarnerLabel\`: \`"Name (Gehalt)"\` des Topverdieners, sonst \`"kein aktiver Mitarbeiter"\`.

Gehälter sind \`BigDecimal\` – vergleiche nie mit \`equals\`.`,
      given: EMPLOYEE,
      starter: `class Solution {

    static Optional<Employee> topEarner(List<Employee> employees) {
        // TODO: filtern, sortieren, erstes Element
        return Optional.empty();
    }

    static List<String> activeReport(List<Employee> employees) {
        // TODO: Comparator mit drei Stufen
        return List.of();
    }

    static String topEarnerLabel(List<Employee> employees) {
        // TODO: Optional auspacken statt if/else
        return "";
    }
}`,
      solution: `class Solution {

    static Optional<Employee> topEarner(List<Employee> employees) {
        return employees.stream()
            .filter(Employee::active)
            .sorted(Comparator.comparing(Employee::salary).reversed()
                .thenComparing(Employee::name))
            .findFirst();
    }

    static List<String> activeReport(List<Employee> employees) {
        Comparator<Employee> reihenfolge = Comparator.comparing(Employee::department)
            .thenComparing(Employee::salary, Comparator.reverseOrder())
            .thenComparing(Employee::name);

        return employees.stream()
            .filter(Employee::active)
            .sorted(reihenfolge)
            .map(employee -> employee.department() + ": " + employee.name())
            .toList();
    }

    static String topEarnerLabel(List<Employee> employees) {
        return topEarner(employees)
            .map(employee -> employee.name() + " (" + employee.salary() + ")")
            .orElse("kein aktiver Mitarbeiter");
    }
}`,
      hints: [
        'Immer dieselbe Reihenfolge: erst `filter` (braucht das ganze Objekt), dann sortieren, dann auf die Ausgabe mappen. Den Tie-Break musst du explizit angeben, sonst ist die Ausgabe zufällig.',
        'Du brauchst `Comparator.comparing`, `reversed()`, `thenComparing(...)` sowie `findFirst()`, `map(...)` und `orElse(...)` auf dem `Optional`.',
        'topEarner: stream → filter(active) → sorted(Gehalt absteigend, dann Name) → findFirst.\nactiveReport: stream → filter(active) → sorted(Abteilung, Gehalt absteigend, Name) → map("dept: name") → toList.',
        'Zieh den Comparator in eine eigene Variable, das macht die dreistufige Sortierung lesbar:\n\n```java\nComparator<Employee> reihenfolge = Comparator.comparing(Employee::department)\n    .thenComparing(Employee::salary, Comparator.reverseOrder())\n    .thenComparing(Employee::name);\n```',
      ],
      tests: `var employees = List.of(
    new Employee(1L, "Ada", "IT", new BigDecimal("6000.00"), true),
    new Employee(2L, "Ben", "IT", new BigDecimal("6000.00"), true),
    new Employee(3L, "Cleo", "HR", new BigDecimal("7200.00"), false),
    new Employee(4L, "Dan", "HR", new BigDecimal("4500.00"), true),
    new Employee(5L, "Eve", "IT", new BigDecimal("8000.00"), true));

check("topEarner", "Eve", Solution.topEarner(employees).map(Employee::name).orElse("-"));
check("topEarner leere Liste", Optional.empty(), Solution.topEarner(List.of()));
check("topEarner nur inaktive", Optional.empty(),
    Solution.topEarner(List.of(new Employee(9L, "Zoe", "IT", new BigDecimal("9000.00"), false))));
check("Gleichstand alphabetisch", "Ada",
    Solution.topEarner(employees.subList(0, 4)).map(Employee::name).orElse("-"));
check("activeReport", List.of("HR: Dan", "IT: Eve", "IT: Ada", "IT: Ben"), Solution.activeReport(employees));
check("activeReport leer", List.of(), Solution.activeReport(List.of()));
checkTrue("inaktive fehlen im Report", !Solution.activeReport(employees).contains("HR: Cleo"));
check("topEarnerLabel", "Eve (8000.00)", Solution.topEarnerLabel(employees));
check("topEarnerLabel ohne Treffer", "kein aktiver Mitarbeiter", Solution.topEarnerLabel(List.of()));`,
    },
    {
      id: 'k2',
      title: 'Prüfungs-Kata: groupingBy und Top-N-Auswertung',
      level: 3,
      description: `Auswertung über Verkäufe – typische Collector-Aufgabe.

\`\`\`java
static Map<String, Long> salesCountByCategory(List<Sale> sales)
static Map<String, BigDecimal> revenueByCategory(List<Sale> sales)
static List<String> topProducts(List<Sale> sales, int limit)
\`\`\`

- \`salesCountByCategory\`: Anzahl der Verkäufe je Kategorie.
- \`revenueByCategory\`: Summe von \`revenue\` je Kategorie, jeweils mit \`setScale(2, RoundingMode.HALF_UP)\` (sonst hängt \`equals\` an der Skala).
- \`topProducts\`: Produktnamen nach **Gesamtumsatz absteigend**, bei Gleichstand alphabetisch, maximal \`limit\` Stück. \`limit <= 0\` → leere Liste.

Leere Eingabe → leere Map bzw. leere Liste.`,
      given: SALE,
      starter: `class Solution {

    static Map<String, Long> salesCountByCategory(List<Sale> sales) {
        // TODO: groupingBy + counting
        return Map.of();
    }

    static Map<String, BigDecimal> revenueByCategory(List<Sale> sales) {
        // TODO: groupingBy + reducing, danach auf 2 Nachkommastellen bringen
        return Map.of();
    }

    static List<String> topProducts(List<Sale> sales, int limit) {
        // TODO: je Produkt summieren, sortieren, begrenzen
        return List.of();
    }
}`,
      solution: `class Solution {

    static Map<String, Long> salesCountByCategory(List<Sale> sales) {
        return sales.stream()
            .collect(Collectors.groupingBy(Sale::category, Collectors.counting()));
    }

    static Map<String, BigDecimal> revenueByCategory(List<Sale> sales) {
        Map<String, BigDecimal> summen = sumBy(sales, Sale::category);
        summen.replaceAll((category, summe) -> summe.setScale(2, RoundingMode.HALF_UP));
        return summen;
    }

    static List<String> topProducts(List<Sale> sales, int limit) {
        if (limit <= 0) {
            return List.of();
        }
        Comparator<Map.Entry<String, BigDecimal>> nachUmsatz = Comparator.comparing(Map.Entry::getValue);
        return sumBy(sales, Sale::product).entrySet().stream()
            .sorted(nachUmsatz.reversed().thenComparing(Map.Entry::getKey))
            .limit(limit)
            .map(Map.Entry::getKey)
            .toList();
    }

    private static Map<String, BigDecimal> sumBy(List<Sale> sales, Function<Sale, String> schluessel) {
        return sales.stream()
            .collect(Collectors.groupingBy(schluessel,
                Collectors.reducing(BigDecimal.ZERO, Sale::revenue, BigDecimal::add)));
    }
}`,
      hints: [
        'Gruppieren heißt `Collectors.groupingBy(klassifikator, downstream)`. Für Summen von `BigDecimal` gibt es kein `summingBigDecimal` – du brauchst `reducing` mit Startwert `BigDecimal.ZERO`.',
        '`Collectors.counting()` liefert `Long`. Für Top-N: `entrySet().stream()`, `Comparator.comparing(Map.Entry::getValue)`, `reversed()`, `thenComparing(Map.Entry::getKey)`, `limit(n)`, `map(Map.Entry::getKey)`.',
        'Umsatz je Schlüssel: groupingBy(key, reducing(ZERO, Sale::revenue, BigDecimal::add)).\nSkala danach mit `map.replaceAll((k, v) -> v.setScale(2, RoundingMode.HALF_UP))` vereinheitlichen.\nTop-N: dieselbe Summenmap nach Produkt, dann sortieren und begrenzen.',
        'Die Summenlogik kommt zweimal vor – zieh sie in eine private Hilfsmethode:\n\n```java\nprivate static Map<String, BigDecimal> sumBy(List<Sale> sales, Function<Sale, String> schluessel) {\n    return sales.stream().collect(Collectors.groupingBy(schluessel,\n        Collectors.reducing(BigDecimal.ZERO, Sale::revenue, BigDecimal::add)));\n}\n```',
      ],
      tests: `var sales = List.of(
    new Sale("Laptop", "IT", 2, new BigDecimal("1200.00")),
    new Sale("Maus", "IT", 10, new BigDecimal("150.50")),
    new Sale("Laptop", "IT", 1, new BigDecimal("600.00")),
    new Sale("Stuhl", "Moebel", 4, new BigDecimal("800.00")),
    new Sale("Tisch", "Moebel", 1, new BigDecimal("1800.00")),
    new Sale("Lampe", "Moebel", 3, new BigDecimal("150.50")));

check("Anzahl je Kategorie", Map.of("IT", 3L, "Moebel", 3L), Solution.salesCountByCategory(sales));
check("Anzahl leere Liste", Map.of(), Solution.salesCountByCategory(List.of()));
check("Umsatz IT", new BigDecimal("1950.50"), Solution.revenueByCategory(sales).get("IT"));
check("Umsatz Moebel", new BigDecimal("2750.50"), Solution.revenueByCategory(sales).get("Moebel"));
check("Umsatzmap komplett",
    Map.of("IT", new BigDecimal("1950.50"), "Moebel", new BigDecimal("2750.50")),
    Solution.revenueByCategory(sales));
check("Skala immer 2", new BigDecimal("5.00"),
    Solution.revenueByCategory(List.of(new Sale("X", "A", 1, new BigDecimal("5")))).get("A"));
check("Top 3", List.of("Laptop", "Tisch", "Stuhl"), Solution.topProducts(sales, 3));
check("Limit groesser als Datenmenge",
    List.of("Laptop", "Tisch", "Stuhl", "Lampe", "Maus"), Solution.topProducts(sales, 10));
check("Limit 0", List.of(), Solution.topProducts(sales, 0));
check("Top-N leere Liste", List.of(), Solution.topProducts(List.of(), 3));`,
    },
    {
      id: 'k3',
      title: 'Prüfungs-Kata: Entity auf verschachtelte DTOs mappen',
      level: 4,
      description: `Die Legacy-Entities \`Booking\` und \`Customer\` sollen an die API-Grenze – aber nur als **unveränderliche DTOs**, die sich selbst validieren.

Schreibe zwei Records und den Mapper:

\`\`\`java
record CustomerDto(String email, String city) { /* kompakter Konstruktor */ }
record BookingDto(Long id, CustomerDto customer, List<String> tags, BigDecimal price) { /* kompakter Konstruktor */ }

class Solution {
    static BookingDto toDto(Booking booking)
    static List<BookingDto> toDtos(List<Booking> bookings)
}
\`\`\`

**\`CustomerDto\`**
- \`email\` \`null\` oder ohne \`@\` → \`IllegalArgumentException\`; sonst getrimmt und in Kleinbuchstaben.
- \`city\` \`null\` oder blank → \`"unbekannt"\`, sonst getrimmt.

**\`BookingDto\`**
- \`id\` und \`customer\` dürfen nicht \`null\` sein (\`Objects.requireNonNull\` → \`NullPointerException\`).
- \`price\` \`null\` oder negativ → \`IllegalArgumentException\`; sonst \`setScale(2, RoundingMode.HALF_UP)\`.
- \`tags\`: \`null\` → leere Liste; sonst \`null\`/blanke Einträge raus, trimmen, Duplikate entfernen, alphabetisch sortieren. Das Ergebnis muss eine **unveränderliche Kopie** sein.`,
      given: BOOKING_DOMAIN,
      starter: `record CustomerDto(String email, String city) {
    // TODO: kompakter Konstruktor mit Validierung und Normalisierung
}

record BookingDto(Long id, CustomerDto customer, List<String> tags, BigDecimal price) {
    // TODO: kompakter Konstruktor mit Validierung, Skala und Defensivkopie
}

class Solution {

    static BookingDto toDto(Booking booking) {
        // TODO
        return null;
    }

    static List<BookingDto> toDtos(List<Booking> bookings) {
        // TODO
        return List.of();
    }
}`,
      solution: `record CustomerDto(String email, String city) {

    CustomerDto {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Ungueltige E-Mail: " + email);
        }
        email = email.trim().toLowerCase();
        city = (city == null || city.isBlank()) ? "unbekannt" : city.trim();
    }
}

record BookingDto(Long id, CustomerDto customer, List<String> tags, BigDecimal price) {

    BookingDto {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(customer, "customer");
        if (price == null || price.signum() < 0) {
            throw new IllegalArgumentException("Ungueltiger Preis: " + price);
        }
        price = price.setScale(2, RoundingMode.HALF_UP);
        tags = tags == null ? List.of() : tags.stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(String::trim)
            .distinct()
            .sorted()
            .toList();
    }
}

class Solution {

    static BookingDto toDto(Booking booking) {
        Customer customer = booking.getCustomer();
        return new BookingDto(
            booking.getId(),
            new CustomerDto(customer.getEmail(), customer.getCity()),
            booking.getTags(),
            booking.getPrice());
    }

    static List<BookingDto> toDtos(List<Booking> bookings) {
        return bookings.stream()
            .map(Solution::toDto)
            .toList();
    }
}`,
      hints: [
        'Der kompakte Konstruktor (`CustomerDto { ... }` – ohne Parameterliste) läuft vor der Feldzuweisung. Du darfst die Parameter dort **überschreiben**: erst prüfen, dann normalisieren. Der Mapper selbst bleibt dumm.',
        'Du brauchst `Objects.requireNonNull`, `String::isBlank`, `String::trim`, `BigDecimal.signum()`, `setScale(2, RoundingMode.HALF_UP)` sowie `filter`/`map`/`distinct`/`sorted`/`toList` für die Tags.',
        'CustomerDto: if (email == null || kein "@") → throw; email = trim + lowercase; city = blank ? "unbekannt" : trim.\nBookingDto: requireNonNull(id, customer); Preis prüfen und skalieren; tags null → List.of(), sonst filtern/trimmen/distinct/sorted/toList.\ntoDto: Felder der Entity einsammeln, verschachteltes CustomerDto bauen.',
        'Die Tag-Normalisierung liefert mit `toList()` automatisch eine unveränderliche Kopie:\n\n```java\ntags = tags == null ? List.of() : tags.stream()\n    .filter(tag -> tag != null && !tag.isBlank())\n    .map(String::trim)\n    .distinct()\n    .sorted()\n    .toList();\n```',
      ],
      tests: `var mutableTags = new ArrayList<>(Arrays.asList("Strand", " Strand ", "  ", null, "Bio"));
var booking = new Booking(1L, new Customer("  Ada@Example.COM ", "  "), mutableTags, new BigDecimal("199.5"));
var dto = Solution.toDto(booking);

check("E-Mail normalisiert", "ada@example.com", dto.customer().email());
check("Stadt-Default", "unbekannt", dto.customer().city());
check("Preis auf 2 Stellen", new BigDecimal("199.50"), dto.price());
check("Tags normalisiert", List.of("Bio", "Strand"), dto.tags());
checkThrows("Tags unveraenderlich", UnsupportedOperationException.class, () -> dto.tags().add("Neu"));
mutableTags.add("Nachtraeglich");
check("Defensivkopie", List.of("Bio", "Strand"), dto.tags());

checkThrows("E-Mail ohne @", IllegalArgumentException.class, () -> new CustomerDto("ada.example.com", "Berlin"));
checkThrows("negativer Preis", IllegalArgumentException.class,
    () -> new BookingDto(1L, new CustomerDto("a@b.de", "Berlin"), List.of(), new BigDecimal("-1")));
checkThrows("id null", NullPointerException.class,
    () -> new BookingDto(null, new CustomerDto("a@b.de", "Berlin"), List.of(), BigDecimal.ONE));

var zweite = new Booking(2L, new Customer("Ben@Test.de", "Berlin"), null, new BigDecimal("10"));
check("Stadt uebernommen", "Berlin", Solution.toDto(zweite).customer().city());
check("Tags null wird leer", List.of(), Solution.toDto(zweite).tags());
check("toDtos mappt alle", List.of(1L, 2L),
    Solution.toDtos(List.of(booking, zweite)).stream().map(BookingDto::id).toList());`,
    },
    {
      id: 'k4',
      title: 'Prüfungs-Kata: Service mit Guard Clauses und Fehlerfällen',
      level: 4,
      description: `Teil-3-Aufgabe in klein: ein \`TransferService\` über einem Repository. In Spring wäre die Klasse ein \`@Service\` und \`transfer\` \`@Transactional\`.

\`\`\`java
class TransferService {
    TransferService(AccountRepository repository)

    void transfer(Long fromId, Long toId, BigDecimal amount)
    BigDecimal balanceOf(Long id)
    Optional<String> ownerOf(Long id)
}
\`\`\`

**\`transfer\`** – Guard Clauses in dieser Reihenfolge:
1. \`amount\` \`null\` oder \`<= 0\` → \`IllegalArgumentException\`
2. \`fromId\` gleich \`toId\` → \`IllegalArgumentException\`
3. Quell- oder Zielkonto unbekannt → \`AccountNotFoundException\`
4. Saldo reicht nicht → \`InsufficientFundsException\`

Im Fehlerfall darf **kein** Saldo verändert sein. Sonst: abbuchen, gutschreiben, beide Konten speichern.

**\`balanceOf\`**: Saldo oder \`AccountNotFoundException\`.
**\`ownerOf\`**: \`Optional\` mit dem Inhabernamen, leer bei unbekannter id – hier **keine** Exception.`,
      given: ACCOUNT_DOMAIN,
      starter: `class TransferService {

    private final AccountRepository repository;

    TransferService(AccountRepository repository) {
        this.repository = repository;
    }

    void transfer(Long fromId, Long toId, BigDecimal amount) {
        // TODO: Guard Clauses, dann buchen
    }

    BigDecimal balanceOf(Long id) {
        // TODO
        return null;
    }

    Optional<String> ownerOf(Long id) {
        // TODO
        return Optional.empty();
    }
}`,
      solution: `class TransferService {

    private final AccountRepository repository;

    TransferService(AccountRepository repository) {
        this.repository = repository;
    }

    void transfer(Long fromId, Long toId, BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Betrag muss groesser 0 sein: " + amount);
        }
        if (Objects.equals(fromId, toId)) {
            throw new IllegalArgumentException("Quelle und Ziel sind identisch: " + fromId);
        }

        Account from = findOrThrow(fromId);
        Account to = findOrThrow(toId);
        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(fromId, from.getBalance(), amount);
        }

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        repository.save(from);
        repository.save(to);
    }

    BigDecimal balanceOf(Long id) {
        return findOrThrow(id).getBalance();
    }

    Optional<String> ownerOf(Long id) {
        return repository.findById(id).map(Account::getOwner);
    }

    private Account findOrThrow(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new AccountNotFoundException(id));
    }
}`,
      hints: [
        'Guard Clauses zuerst, Happy Path ohne Einrückung am Ende. Alle Prüfungen müssen **vor** der ersten Zustandsänderung laufen, sonst bleibt ein halb gebuchter Transfer zurück.',
        'Du brauchst `Objects.equals` (Long-Vergleich ohne `==`-Falle), `BigDecimal.signum()`, `compareTo`, `subtract`/`add` sowie `orElseThrow(() -> ...)` und `map(...)` auf dem `Optional`.',
        'transfer: Betrag prüfen → gleiche id prüfen → beide Konten per Hilfsmethode laden → Deckung prüfen → abbuchen, gutschreiben, speichern.\nbalanceOf: dieselbe Hilfsmethode, dann `getBalance()`.\nownerOf: `repository.findById(id).map(Account::getOwner)`.',
        'Das Laden mit Fehlerfall gehört in eine private Hilfsmethode, die du überall wiederverwendest:\n\n```java\nprivate Account findOrThrow(Long id) {\n    return repository.findById(id)\n        .orElseThrow(() -> new AccountNotFoundException(id));\n}\n```',
      ],
      tests: `var repository = new InMemoryAccountRepository(List.of(
    new Account(1L, "Ada", new BigDecimal("100.00")),
    new Account(2L, "Ben", new BigDecimal("50.00"))));
var service = new TransferService(repository);

service.transfer(1L, 2L, new BigDecimal("30.00"));
check("Quelle belastet", new BigDecimal("70.00"), service.balanceOf(1L));
check("Ziel gutgeschrieben", new BigDecimal("80.00"), service.balanceOf(2L));

checkThrows("Betrag 0", IllegalArgumentException.class, () -> service.transfer(1L, 2L, BigDecimal.ZERO));
checkThrows("Betrag null", IllegalArgumentException.class, () -> service.transfer(1L, 2L, null));
checkThrows("gleiches Konto", IllegalArgumentException.class,
    () -> service.transfer(1L, 1L, new BigDecimal("5.00")));
checkThrows("Quelle unbekannt", AccountNotFoundException.class,
    () -> service.transfer(99L, 2L, new BigDecimal("5.00")));
checkThrows("Ziel unbekannt", AccountNotFoundException.class,
    () -> service.transfer(1L, 99L, new BigDecimal("5.00")));
checkThrows("Deckung fehlt", InsufficientFundsException.class,
    () -> service.transfer(1L, 2L, new BigDecimal("1000.00")));

check("Salden nach Fehlern unveraendert", new BigDecimal("70.00"), service.balanceOf(1L));
check("Ziel nach Fehlern unveraendert", new BigDecimal("80.00"), service.balanceOf(2L));
check("ownerOf vorhanden", Optional.of("Ben"), service.ownerOf(2L));
check("ownerOf unbekannt", Optional.empty(), service.ownerOf(99L));
checkThrows("balanceOf unbekannt", AccountNotFoundException.class, () -> service.balanceOf(99L));`,
    },
    {
      id: 'k5',
      title: 'Prüfungs-Kata: Filtern, Sortieren, Paginieren',
      level: 5,
      description: `Die Abschlussaufgabe: Repository-Verhalten von Hand nachbauen. Gegeben sind \`Product\`, \`PageRequest\` und \`PageResult<T>\` (mit \`totalPages()\`, \`hasNext()\`, \`isEmpty()\`).

\`\`\`java
static PageResult<Product> findPage(List<Product> products, String category, PageRequest request)
\`\`\`

- \`request.page() < 0\` oder \`request.size() < 1\` → \`IllegalArgumentException\`.
- \`category == null\` → alle Produkte, sonst Filter auf die Kategorie **ohne Groß-/Kleinschreibung**.
- \`request.sortBy()\`: \`"name"\`, \`"price"\` oder \`"stock"\`; alles andere (auch \`null\`) → \`IllegalArgumentException\`.
- \`request.descending()\` dreht die Sortierung um. Danach immer stabil nach \`id\` aufsteigend nachsortieren.
- \`page\` ist **0-basiert**; eine zu große Seitenzahl liefert leeren Inhalt, aber weiterhin die korrekte \`totalElements\` (Anzahl **aller** Treffer, nicht nur der Seite).

Nutze einen \`switch\`-Ausdruck für die Sortierfelder.`,
      given: PAGING_DOMAIN,
      starter: `class Solution {

    static PageResult<Product> findPage(List<Product> products, String category, PageRequest request) {
        // TODO: validieren, filtern, sortieren, Seite ausschneiden
        return new PageResult<>(List.of(), request.page(), request.size(), 0);
    }
}`,
      solution: `class Solution {

    static PageResult<Product> findPage(List<Product> products, String category, PageRequest request) {
        if (request.page() < 0) {
            throw new IllegalArgumentException("page darf nicht negativ sein: " + request.page());
        }
        if (request.size() < 1) {
            throw new IllegalArgumentException("size muss mindestens 1 sein: " + request.size());
        }

        List<Product> treffer = products.stream()
            .filter(product -> category == null || product.category().equalsIgnoreCase(category))
            .sorted(sortierung(request))
            .toList();

        List<Product> seite = treffer.stream()
            .skip((long) request.page() * request.size())
            .limit(request.size())
            .toList();

        return new PageResult<>(seite, request.page(), request.size(), treffer.size());
    }

    private static Comparator<Product> sortierung(PageRequest request) {
        Comparator<Product> basis = switch (request.sortBy()) {
            case "name" -> Comparator.comparing(Product::name);
            case "price" -> Comparator.comparing(Product::price);
            case "stock" -> Comparator.comparingInt(Product::stock);
            case null, default -> throw new IllegalArgumentException("Unbekanntes Sortierfeld: " + request.sortBy());
        };
        Comparator<Product> gerichtet = request.descending() ? basis.reversed() : basis;
        return gerichtet.thenComparing(Product::id);
    }
}`,
      hints: [
        'Reihenfolge wie im echten Repository: erst validieren, dann filtern, dann sortieren, **zuletzt** die Seite ausschneiden. `totalElements` zählt die gefilterte Gesamtmenge, nicht die Seite.',
        'Du brauchst `equalsIgnoreCase`, einen `switch`-Ausdruck mit `case null, default ->`, `Comparator.comparing`/`comparingInt`, `reversed()`, `thenComparing(Product::id)` sowie `skip(...)` und `limit(...)`.',
        'offset = page * size (als `long` rechnen, sonst Überlauf).\ntreffer = stream → filter(category) → sorted(comparator) → toList.\nseite = treffer.stream() → skip(offset) → limit(size) → toList.\nErgebnis: new PageResult<>(seite, page, size, treffer.size()).',
        'Die Sortierung gehört in eine eigene Methode – der `switch`-Ausdruck macht unbekannte Felder sofort sichtbar:\n\n```java\nComparator<Product> basis = switch (request.sortBy()) {\n    case "name" -> Comparator.comparing(Product::name);\n    case "price" -> Comparator.comparing(Product::price);\n    case "stock" -> Comparator.comparingInt(Product::stock);\n    case null, default -> throw new IllegalArgumentException("Unbekanntes Sortierfeld: " + request.sortBy());\n};\n```',
      ],
      tests: `var products = List.of(
    new Product(1L, "Laptop", "IT", new BigDecimal("1200.00"), 5),
    new Product(2L, "Maus", "IT", new BigDecimal("25.00"), 80),
    new Product(3L, "Monitor", "IT", new BigDecimal("300.00"), 12),
    new Product(4L, "Stuhl", "Moebel", new BigDecimal("150.00"), 30),
    new Product(5L, "Tisch", "Moebel", new BigDecimal("450.00"), 7),
    new Product(6L, "Lampe", "Moebel", new BigDecimal("40.00"), 60),
    new Product(7L, "Tastatur", "IT", new BigDecimal("60.00"), 25));

Function<PageResult<Product>, List<String>> namen =
    ergebnis -> ergebnis.content().stream().map(Product::name).toList();

var seite0 = Solution.findPage(products, "it", new PageRequest(0, 2, "price", true));
check("Seite 0: teuerste IT-Produkte", List.of("Laptop", "Monitor"), namen.apply(seite0));
check("totalElements zaehlt alle Treffer", 4L, seite0.totalElements());
check("totalPages", 2, seite0.totalPages());
checkTrue("hasNext auf Seite 0", seite0.hasNext());

var seite1 = Solution.findPage(products, "IT", new PageRequest(1, 2, "price", true));
check("Seite 1", List.of("Tastatur", "Maus"), namen.apply(seite1));
checkTrue("kein hasNext auf letzter Seite", !seite1.hasNext());

var zuWeit = Solution.findPage(products, "IT", new PageRequest(5, 2, "price", true));
checkTrue("Seite hinter dem Ende ist leer", zuWeit.isEmpty());
check("totalElements bleibt korrekt", 4L, zuWeit.totalElements());

check("ohne Kategorie nach Name", List.of("Lampe", "Laptop", "Maus"),
    namen.apply(Solution.findPage(products, null, new PageRequest(0, 3, "name", false))));
check("nach Bestand absteigend", List.of("Maus", "Lampe", "Stuhl"),
    namen.apply(Solution.findPage(products, null, new PageRequest(0, 3, "stock", true))));
check("unbekannte Kategorie", 0L,
    Solution.findPage(products, "Deko", new PageRequest(0, 5, "name", false)).totalElements());

checkThrows("unbekanntes Sortierfeld", IllegalArgumentException.class,
    () -> Solution.findPage(products, null, new PageRequest(0, 5, "farbe", false)));
checkThrows("negative Seite", IllegalArgumentException.class,
    () -> Solution.findPage(products, null, new PageRequest(-1, 5, "name", false)));
checkThrows("size 0", IllegalArgumentException.class,
    () -> Solution.findPage(products, null, new PageRequest(0, 0, "name", false)));`,
    },
  ],
}

export default chapter
