import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '10',
  flashcards: [
    {
      id: 'f1',
      front: 'Wofür stehen die fünf Buchstaben von **SOLID**?',
      back: '**S**ingle Responsibility · **O**pen/Closed · **L**iskov Substitution · **I**nterface Segregation · **D**ependency Inversion',
    },
    {
      id: 'f2',
      front: 'SRP in einem Satz – und was bedeutet „ein Grund“?',
      back: '*Eine Klasse hat genau einen Grund, sich zu ändern.* Ein Grund = ein Akteur / eine fachliche Achse (z. B. Preisregeln, Persistenz, Benachrichtigung) – **nicht** „nur eine Methode“.',
    },
    {
      id: 'f3',
      front: 'Typisches Code-Symptom für einen **OCP**-Verstoß?',
      back: 'Eine wachsende `if/else`- oder `switch`-Kette über Typen/Strings, die bei jeder neuen Variante geändert werden muss. Lösung: Strategy/Polymorphie – neue Variante = neue Klasse.',
    },
    {
      id: 'f4',
      front: 'LSP – formale Regeln für einen Subtyp?',
      back: '- Vorbedingungen **nicht verschärfen**\n- Nachbedingungen **nicht abschwächen**\n- Invarianten erhalten\n- keine unerwarteten Exceptions (z. B. `UnsupportedOperationException`)',
    },
    {
      id: 'f5',
      front: 'Warum verletzt `Square extends Rectangle` (mit Settern) LSP?',
      back: 'Code, der `setWidth(5); setHeight(4)` aufruft, erwartet `area() == 20`. Ein `Square` koppelt Breite und Höhe → `16`. Der Subtyp bricht den Vertrag des Supertyps.',
    },
    {
      id: 'f6',
      front: 'ISP – Symptom und Lösung?',
      back: 'Symptom: Implementierungen mit leeren Methoden oder `throw new UnsupportedOperationException()`. Lösung: fettes Interface in kleine **Rollen-Interfaces** aufteilen (`Reader`, `Writer`).',
    },
    {
      id: 'f7',
      front: 'DIP – was genau wird „invertiert“?',
      back: 'Die Richtung der Abhängigkeit: Fachlogik hängt nicht mehr an der Infrastruktur, sondern **beide** an einer Abstraktion, die fachlich zur High-Level-Seite gehört (`InvoiceNotifier`, nicht `SmtpClient`).',
    },
    {
      id: 'f8',
      front: 'DIP vs. DI vs. IoC?',
      back: '**DIP**: Designprinzip (Abhängigkeitsrichtung). **DI**: Technik (Abhängigkeiten von außen übergeben, z. B. Constructor Injection). **IoC**: Framework übernimmt die Kontrolle über Objekterzeugung (Spring Container).',
    },
    {
      id: 'f9',
      front: 'Wie machst du Code mit `LocalDateTime.now()` testbar (DIP)?',
      back: '`Clock` injizieren und `LocalDateTime.now(clock)` nutzen. Im Test: `Clock.fixed(Instant.parse("2024-01-01T08:00:00Z"), ZoneOffset.UTC)`.',
    },
    {
      id: 'f10',
      front: 'OCP mit Spring – wie injizierst du alle Strategien?',
      back: '```java\nDiscountService(List<DiscountPolicy> policies) {\n    this.policies = policies;\n}\n```\nSpring injiziert alle Beans des Typs. Neue Regel = neue `@Component`.',
    },
    {
      id: 'f11',
      front: 'Wann ist ein `switch` über Typen **kein** OCP-Problem?',
      back: 'Bei einer geschlossenen, selten wachsenden Menge (`sealed` Interface, Enum) mit exhaustive `switch`: Der Compiler meldet jede Stelle, die einen neuen Fall braucht.',
    },
    {
      id: 'f12',
      front: 'Ist `interface UserService` + `class UserServiceImpl` automatisch „gutes DIP“?',
      back: 'Nein. Ohne zweite Implementierung oder echten Port ist es nur Zeremonie. DIP geht um die **Richtung** der Abhängigkeit zu fachlichen Abstraktionen, nicht um Interfaces für jede Klasse.',
    },
    {
      id: 'f13',
      front: 'Namens-Warnsignale für SRP-Verstöße?',
      back: '`Manager`, `Helper`, `Util`, `Processor`, `Handler` ohne Präzisierung, `and` im Methodennamen (`validateAndSave`), Klassen mit sehr vielen Abhängigkeiten im Konstruktor.',
    },
    {
      id: 'f14',
      front: 'Welcher bewusste LSP-Kompromiss steckt in den JDK-Collections?',
      back: '`List.of(...)` und `Collections.unmodifiableList(...)` implementieren `List`, werfen aber bei `add`/`remove` `UnsupportedOperationException` („optional operations“).',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welches SOLID-Prinzip wird hier **hauptsächlich** verletzt?',
      code: `class InvoiceReport {
    String render(Invoice invoice) { ... }
    void saveToFile(String content, Path path) { ... }
    void sendByEmail(String content, String to) { ... }
    BigDecimal calculateVat(Invoice invoice) { ... }
}`,
      options: ['Liskov Substitution', 'Interface Segregation', 'Single Responsibility', 'Dependency Inversion'],
      correct: 2,
      explanation: 'Rendering, Dateiablage, Versand und Steuerberechnung sind vier verschiedene Änderungsgründe in einer Klasse → SRP.',
    },
    {
      id: 'q2',
      prompt: 'Welches Prinzip wird verletzt?',
      code: `double area(Object shape) {
    if (shape instanceof Circle c) return Math.PI * c.r() * c.r();
    if (shape instanceof Square s) return s.side() * s.side();
    // neue Form? hier ergänzen ...
    throw new IllegalArgumentException();
}`,
      options: ['Open/Closed', 'Single Responsibility', 'Interface Segregation', 'Liskov Substitution'],
      correct: 0,
      explanation: 'Jede neue Form erfordert eine Änderung dieser Methode, und fehlende Fälle fallen erst zur Laufzeit auf → OCP. Lösung: Polymorphie (`shape.area()`) oder `sealed` + exhaustive `switch`.',
    },
    {
      id: 'q3',
      prompt: 'Welches Prinzip wird verletzt?',
      code: `class Bird { void fly() { ... } }
class Penguin extends Bird {
    @Override void fly() { throw new UnsupportedOperationException("Penguins can't fly"); }
}

void migrate(List<Bird> birds) { birds.forEach(Bird::fly); }`,
      options: ['Dependency Inversion', 'Open/Closed', 'Interface Segregation', 'Liskov Substitution'],
      correct: 3,
      explanation: '`Penguin` ist nicht substituierbar: Code, der mit `Bird` arbeitet, bricht mit einer Exception. Klassischer LSP-Verstoß – `fly()` gehört nicht in die Basisklasse.',
    },
    {
      id: 'q4',
      prompt: 'Welches Prinzip wird **primär** verletzt?',
      code: `interface MultiFunctionDevice {
    void print(Document d);
    void scan(Document d);
    void fax(Document d);
}
class SimplePrinter implements MultiFunctionDevice {
    public void print(Document d) { ... }
    public void scan(Document d) { throw new UnsupportedOperationException(); }
    public void fax(Document d)  { throw new UnsupportedOperationException(); }
}`,
      options: ['Single Responsibility', 'Interface Segregation', 'Open/Closed', 'Dependency Inversion'],
      correct: 1,
      explanation: 'Die Ursache ist das fette Interface: `SimplePrinter` wird gezwungen, Methoden zu implementieren, die es nicht unterstützt → ISP. (Die Exceptions sind dann als Folge auch ein LSP-Problem.)',
    },
    {
      id: 'q5',
      prompt: 'Welches Prinzip wird verletzt?',
      code: `class OrderService {
    private final MySqlOrderDao dao = new MySqlOrderDao("jdbc:mysql://prod/db");
    private final StripeClient stripe = new StripeClient(System.getenv("STRIPE_KEY"));

    void checkout(Order order) { ... }
}`,
      options: ['Liskov Substitution', 'Interface Segregation', 'Dependency Inversion', 'Open/Closed'],
      correct: 2,
      explanation: 'Fachlogik erzeugt und hängt direkt an konkreten Infrastruktur-Klassen → DIP-Verstoß, nicht testbar. Besser: `OrderRepository` und `PaymentGateway` als Abstraktionen per Konstruktor injizieren.',
    },
    {
      id: 'q6',
      prompt: 'Welche Aussage ist korrekt?',
      options: [
        'Dependency Injection und Dependency Inversion sind Synonyme',
        'DIP ist ein Designprinzip; Dependency Injection ist eine Technik, mit der man es typischerweise umsetzt',
        'DIP verlangt, dass jede Klasse ein Interface hat',
        'DIP ist nur mit einem DI-Framework wie Spring möglich',
      ],
      correct: 1,
      explanation: 'DIP beschreibt die Richtung der Abhängigkeiten (zu Abstraktionen). DI (z. B. per Konstruktor) ist ein Mittel dazu – funktioniert auch ganz ohne Framework.',
    },
    {
      id: 'q7',
      prompt: 'Ein Subtyp überschreibt `void setAge(int age)` (Basis: `age >= 0` erlaubt) und wirft nun bei `age < 18` eine Exception. Was ist das?',
      options: [
        'Erlaubt – Subtypen dürfen strenger validieren',
        'OCP-Verstoß',
        'ISP-Verstoß',
        'LSP-Verstoß – die Vorbedingung wurde verschärft',
      ],
      correct: 3,
      explanation: 'Aufrufer, die gegen den Basistyp programmiert sind, dürfen `age = 10` übergeben. Der Subtyp verschärft die Vorbedingung und ist damit nicht substituierbar.',
    },
    {
      id: 'q8',
      prompt: 'Wie bewertest du diesen Code in Bezug auf OCP?',
      code: `sealed interface Payment permits Card, Paypal {}

static BigDecimal fee(Payment p) {
    return switch (p) {
        case Card c   -> new BigDecimal("0.30");
        case Paypal pp -> new BigDecimal("0.35");
    };
}`,
      options: [
        'Pragmatisch okay: geschlossene Menge, exhaustive `switch` – der Compiler meldet fehlende Fälle',
        'Schwerer OCP-Verstoß, muss sofort in Strategies umgebaut werden',
        'LSP-Verstoß, weil `switch` auf Subtypen prüft',
        'Kompiliert nicht ohne `default`',
      ],
      correct: 0,
      explanation: 'Bei `sealed`-Typen ist der `switch` exhaustive: Ein neuer Subtyp erzeugt Compilefehler statt stiller Fehler. Für kleine, stabile Mengen ist das einfacher als eine Strategy-Hierarchie.',
    },
    {
      id: 'q9',
      prompt: 'Clean-Code-Urteil: `interface ProductService` mit 20 Methoden und genau einer Implementierung `ProductServiceImpl`, die nirgends ausgetauscht wird.',
      options: [
        'Pflicht nach DIP – jede Service-Klasse braucht ein Interface',
        'Nötig, damit Spring die Klasse als Bean erkennt',
        'Meist unnötige Zeremonie; eine konkrete Klasse reicht, bis ein echter zweiter Anwendungsfall entsteht',
        'Verstößt gegen LSP',
      ],
      correct: 2,
      explanation: 'Spring kann konkrete Klassen injizieren und Mockito kann sie mocken. Interfaces lohnen sich für echte Rollen/Ports oder mehrere Implementierungen (YAGNI).',
    },
    {
      id: 'q10',
      prompt: 'Welche Änderung behebt den DIP-Verstoß am besten?',
      code: `class TrialService {
    boolean isExpired(Trial trial) {
        return LocalDate.now().isAfter(trial.endDate());
    }
}`,
      options: [
        '`LocalDate.now()` in eine `static` Utility-Methode auslagern',
        '`Clock` per Konstruktor injizieren und `LocalDate.now(clock)` verwenden',
        'Das aktuelle Datum als globale Variable halten',
        'Im Test die Systemzeit des Rechners umstellen',
      ],
      correct: 1,
      explanation: 'Die Systemuhr ist ein Infrastruktur-Detail. Mit injiziertem `Clock` ist die Fachlogik deterministisch testbar (`Clock.fixed(...)`).',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'OCP: Rabatt-Strategien statt if-Kette',
      level: 2,
      description: `Der Starter berechnet Rabatte in einer \`if\`-Kette und **ignoriert** die injizierten Policies. Baue auf Strategies um:

- \`VipDiscount\`: Kundentyp \`VIP\` → 20 %
- \`EmployeeDiscount\`: Kundentyp \`EMPLOYEE\` → 30 %
- \`LoyaltyDiscount\`: \`yearsActive >= 5\` → 10 %
- \`DiscountService.discount(customer, amount)\`: Es gilt der **höchste** anwendbare Rabatt (nicht kumulativ), Ergebnis mit \`setScale(2, RoundingMode.HALF_UP)\`, kein Rabatt → \`0.00\`.

Die Tests fügen außerdem eine **eigene** Policy hinzu – ohne \`DiscountService\` zu ändern.`,
      given: `enum CustomerType { REGULAR, VIP, EMPLOYEE }

record Customer(String name, CustomerType type, int yearsActive) {}

interface DiscountPolicy {
    boolean appliesTo(Customer customer);
    BigDecimal discount(BigDecimal amount);
}`,
      starter: `class VipDiscount implements DiscountPolicy {
    public boolean appliesTo(Customer customer) { return false; } // TODO
    public BigDecimal discount(BigDecimal amount) { return BigDecimal.ZERO; } // TODO
}

class EmployeeDiscount implements DiscountPolicy {
    public boolean appliesTo(Customer customer) { return false; } // TODO
    public BigDecimal discount(BigDecimal amount) { return BigDecimal.ZERO; } // TODO
}

class LoyaltyDiscount implements DiscountPolicy {
    public boolean appliesTo(Customer customer) { return false; } // TODO
    public BigDecimal discount(BigDecimal amount) { return BigDecimal.ZERO; } // TODO
}

class DiscountService {
    DiscountService(List<DiscountPolicy> policies) {
        // TODO policies werden ignoriert
    }

    BigDecimal discount(Customer customer, BigDecimal amount) {
        // TODO: if-Kette durch Policies ersetzen
        if (customer.type() == CustomerType.VIP) {
            return amount.multiply(new BigDecimal("0.20")).setScale(2, RoundingMode.HALF_UP);
        } else if (customer.type() == CustomerType.EMPLOYEE) {
            return amount.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}`,
      solution: `class VipDiscount implements DiscountPolicy {
    private static final BigDecimal RATE = new BigDecimal("0.20");

    public boolean appliesTo(Customer customer) {
        return customer.type() == CustomerType.VIP;
    }

    public BigDecimal discount(BigDecimal amount) {
        return amount.multiply(RATE);
    }
}

class EmployeeDiscount implements DiscountPolicy {
    private static final BigDecimal RATE = new BigDecimal("0.30");

    public boolean appliesTo(Customer customer) {
        return customer.type() == CustomerType.EMPLOYEE;
    }

    public BigDecimal discount(BigDecimal amount) {
        return amount.multiply(RATE);
    }
}

class LoyaltyDiscount implements DiscountPolicy {
    private static final int MIN_YEARS = 5;
    private static final BigDecimal RATE = new BigDecimal("0.10");

    public boolean appliesTo(Customer customer) {
        return customer.yearsActive() >= MIN_YEARS;
    }

    public BigDecimal discount(BigDecimal amount) {
        return amount.multiply(RATE);
    }
}

class DiscountService {
    private final List<DiscountPolicy> policies;

    DiscountService(List<DiscountPolicy> policies) {
        this.policies = List.copyOf(policies);
    }

    BigDecimal discount(Customer customer, BigDecimal amount) {
        return policies.stream()
                .filter(policy -> policy.appliesTo(customer))
                .map(policy -> policy.discount(amount))
                .max(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }
}`,
      hints: [
        'Jede Rabattregel wird eine eigene Klasse (Strategy). `DiscountService` kennt nur das Interface und iteriert über alle Policies.',
        '`stream().filter(p -> p.appliesTo(c)).map(p -> p.discount(amount)).max(Comparator.naturalOrder())` – `BigDecimal` ist `Comparable`.',
        'Pseudocode: anwendbare Policies filtern → Rabattbeträge berechnen → Maximum nehmen → sonst 0 → auf 2 Nachkommastellen runden.',
        '```java\nreturn policies.stream()\n        .filter(policy -> policy.appliesTo(customer))\n        .map(policy -> policy.discount(amount))\n        // ...\n```',
      ],
      tests: `var service = new DiscountService(List.of(new VipDiscount(), new EmployeeDiscount(), new LoyaltyDiscount()));
var amount = new BigDecimal("100.00");
check("VIP 20%", new BigDecimal("20.00"), service.discount(new Customer("A", CustomerType.VIP, 1), amount));
check("Employee 30%", new BigDecimal("30.00"), service.discount(new Customer("B", CustomerType.EMPLOYEE, 0), amount));
check("Loyalty 10%", new BigDecimal("10.00"), service.discount(new Customer("C", CustomerType.REGULAR, 5), amount));
check("VIP + Loyalty: höchster gewinnt", new BigDecimal("20.00"), service.discount(new Customer("D", CustomerType.VIP, 10), amount));
check("kein Rabatt", new BigDecimal("0.00"), service.discount(new Customer("E", CustomerType.REGULAR, 4), amount));
check("Rundung", new BigDecimal("3.33"), service.discount(new Customer("F", CustomerType.REGULAR, 7), new BigDecimal("33.33")));
DiscountPolicy half = new DiscountPolicy() {
    public boolean appliesTo(Customer c) { return c.name().equals("Jan"); }
    public BigDecimal discount(BigDecimal a) { return a.multiply(new BigDecimal("0.5")); }
};
var extended = new DiscountService(List.of(new VipDiscount(), half));
check("neue Policy ohne Änderung", new BigDecimal("50.00"), extended.discount(new Customer("Jan", CustomerType.VIP, 0), amount));
check("keine Policies", new BigDecimal("0.00"), new DiscountService(List.of()).discount(new Customer("X", CustomerType.VIP, 9), amount));`,
    },
    {
      id: 'k2',
      title: 'DIP: Clock injizieren',
      level: 3,
      description: `\`GreetingService\` bekommt eine \`Clock\` injiziert, benutzt sie aber nicht – dadurch ist er nicht testbar. Implementiere \`greet(String name)\` **mit der injizierten Clock**:

- vor 12:00 → \`Guten Morgen, <name>\`
- 12:00 bis vor 18:00 → \`Guten Tag, <name>\`
- ab 18:00 → \`Guten Abend, <name>\`
- \`name\` null oder blank → \`IllegalArgumentException\`
- Konstruktor: \`clock\` null → \`NullPointerException\``,
      starter: `class GreetingService {

    GreetingService(Clock clock) {
        // TODO
    }

    String greet(String name) {
        // TODO: nicht testbar – nutzt die Systemuhr
        LocalTime now = LocalTime.now();
        if (now.getHour() < 12) {
            return "Guten Morgen, " + name;
        }
        return "Guten Tag, " + name;
    }
}`,
      solution: `class GreetingService {
    private static final LocalTime NOON = LocalTime.NOON;
    private static final LocalTime EVENING = LocalTime.of(18, 0);

    private final Clock clock;

    GreetingService(Clock clock) {
        this.clock = Objects.requireNonNull(clock, "clock");
    }

    String greet(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name must not be blank");
        }
        return salutation(LocalTime.now(clock)) + ", " + name;
    }

    private static String salutation(LocalTime time) {
        if (time.isBefore(NOON)) {
            return "Guten Morgen";
        }
        if (time.isBefore(EVENING)) {
            return "Guten Tag";
        }
        return "Guten Abend";
    }
}`,
      hints: [
        'Die Systemzeit ist eine Abhängigkeit wie eine Datenbank. Wird sie injiziert, kann der Test sie kontrollieren.',
        '`LocalTime.now(clock)` statt `LocalTime.now()`. `time.isBefore(LocalTime.NOON)`, `LocalTime.of(18, 0)`.',
        'Konstruktor: `this.clock = Objects.requireNonNull(clock)`. greet: Guard Clause für name → Uhrzeit aus clock → Anrede per Zeitbereich → zusammensetzen.',
        '```java\nprivate static String salutation(LocalTime time) {\n    if (time.isBefore(LocalTime.NOON)) return "Guten Morgen";\n    // ...\n}\n```',
      ],
      tests: `Function<String, Clock> at = t -> Clock.fixed(Instant.parse("2024-03-01T" + t + "Z"), ZoneOffset.UTC);
check("Morgen", "Guten Morgen, Jan", new GreetingService(at.apply("08:00:00")).greet("Jan"));
check("11:59", "Guten Morgen, Jan", new GreetingService(at.apply("11:59:59")).greet("Jan"));
check("Mittag", "Guten Tag, Jan", new GreetingService(at.apply("12:00:00")).greet("Jan"));
check("17:59", "Guten Tag, Ana", new GreetingService(at.apply("17:59:00")).greet("Ana"));
check("Abend", "Guten Abend, Jan", new GreetingService(at.apply("18:00:00")).greet("Jan"));
check("Nacht", "Guten Abend, Jan", new GreetingService(at.apply("23:30:00")).greet("Jan"));
var service = new GreetingService(at.apply("09:00:00"));
checkThrows("name blank", IllegalArgumentException.class, () -> service.greet(" "));
checkThrows("name null", IllegalArgumentException.class, () -> service.greet(null));
checkThrows("clock null", NullPointerException.class, () -> new GreetingService(null));`,
    },
    {
      id: 'k3',
      title: 'ISP: fettes Store-Interface aufteilen',
      level: 3,
      description: `Im Starter erben \`KeyValueReader\` und \`KeyValueWriter\` beide vom fetten \`KeyValueStore\`. Dadurch muss die schreibgeschützte \`EnvConfig\` ein \`write\` anbieten, das eine \`UnsupportedOperationException\` wirft (ISP- und LSP-Verstoß).

Refaktoriere:

- \`KeyValueReader\` hat **nur** \`Optional<String> read(String key)\`
- \`KeyValueWriter\` hat **nur** \`void write(String key, String value)\`
- \`EnvConfig(Map<String, String> values)\` implementiert **nur** \`KeyValueReader\` (defensive Kopie!)
- \`InMemoryStore\` implementiert beide
- \`KeyValueStore\` darfst du löschen`,
      starter: `interface KeyValueStore {
    Optional<String> read(String key);
    void write(String key, String value);
}

interface KeyValueReader extends KeyValueStore {}   // TODO aufteilen
interface KeyValueWriter extends KeyValueStore {}   // TODO aufteilen

class EnvConfig implements KeyValueReader {
    private final Map<String, String> values;

    EnvConfig(Map<String, String> values) {
        this.values = values;
    }

    public Optional<String> read(String key) {
        return Optional.ofNullable(values.get(key));
    }

    public void write(String key, String value) {
        throw new UnsupportedOperationException("read only");
    }
}

class InMemoryStore implements KeyValueWriter {
    private final Map<String, String> values = new HashMap<>();

    public Optional<String> read(String key) {
        return Optional.ofNullable(values.get(key));
    }

    public void write(String key, String value) {
        values.put(key, value);
    }
}`,
      solution: `interface KeyValueReader {
    Optional<String> read(String key);
}

interface KeyValueWriter {
    void write(String key, String value);
}

class EnvConfig implements KeyValueReader {
    private final Map<String, String> values;

    EnvConfig(Map<String, String> values) {
        this.values = Map.copyOf(values);
    }

    public Optional<String> read(String key) {
        return Optional.ofNullable(values.get(key));
    }
}

class InMemoryStore implements KeyValueReader, KeyValueWriter {
    private final Map<String, String> values = new HashMap<>();

    public Optional<String> read(String key) {
        return Optional.ofNullable(values.get(key));
    }

    public void write(String key, String value) {
        values.put(key, value);
    }
}`,
      hints: [
        'Ein Client, der nur liest, soll kein `write` sehen. Schneide Interfaces nach **Rollen** der Clients.',
        'Zwei unabhängige Interfaces mit je einer Methode. Eine Klasse kann mehrere Interfaces implementieren: `implements KeyValueReader, KeyValueWriter`.',
        'Entferne `extends KeyValueStore`, verschiebe die Methoden in die Rollen-Interfaces, lösche das `write` aus `EnvConfig`, kopiere die Map im Konstruktor mit `Map.copyOf`.',
        '```java\ninterface KeyValueReader {\n    Optional<String> read(String key);\n}\n```',
      ],
      tests: `var source = new HashMap<String, String>();
source.put("port", "8080");
KeyValueReader config = new EnvConfig(source);
source.put("port", "9999");
check("read vorhanden", Optional.of("8080"), config.read("port"));
check("defensive Kopie", Optional.of("8080"), config.read("port"));
check("read fehlend", Optional.empty(), config.read("host"));
checkTrue("EnvConfig ist kein Writer", !(((Object) config) instanceof KeyValueWriter));
checkTrue("Reader-Interface kennt kein write", Arrays.stream(KeyValueReader.class.getMethods()).noneMatch(m -> m.getName().equals("write")));
checkTrue("Writer-Interface kennt kein read", Arrays.stream(KeyValueWriter.class.getMethods()).noneMatch(m -> m.getName().equals("read")));
checkTrue("EnvConfig hat kein write", Arrays.stream(EnvConfig.class.getMethods()).noneMatch(m -> m.getName().equals("write")));
var store = new InMemoryStore();
store.write("a", "1");
store.write("a", "2");
check("InMemoryStore überschreibt", Optional.of("2"), store.read("a"));
checkTrue("InMemoryStore ist Reader", ((Object) store) instanceof KeyValueReader);`,
    },
    {
      id: 'k4',
      title: 'SRP: God Method zerlegen',
      level: 4,
      description: `\`SalesReport.create\` im Starter macht alles selbst: CSV parsen, summieren, formatieren. Zerlege in drei Klassen mit **je einer Verantwortung** und lass \`SalesReport\` nur orchestrieren:

- \`CsvSaleParser.parse(List<String> lines)\` → \`List<Sale>\`. Format \`region;amount\`, Leerzeichen trimmen, **leere Zeilen überspringen**, Zeile ohne genau 2 Teile → \`IllegalArgumentException\`
- \`SalesCalculator.totalsByRegion(List<Sale>)\` → \`Map<String, BigDecimal>\`, **alphabetisch sortiert** nach Region
- \`ReportFormatter.format(Map<String, BigDecimal>)\` → Zeilen \`REGION: BETRAG\`, getrennt mit \`\\n\` (leere Map → \`""\`)
- \`SalesReport(parser, calculator, formatter).create(lines)\` verbindet die drei`,
      given: `record Sale(String region, BigDecimal amount) {}`,
      starter: `class CsvSaleParser {
    List<Sale> parse(List<String> lines) {
        // TODO
        return List.of();
    }
}

class SalesCalculator {
    Map<String, BigDecimal> totalsByRegion(List<Sale> sales) {
        // TODO
        return Map.of();
    }
}

class ReportFormatter {
    String format(Map<String, BigDecimal> totals) {
        // TODO
        return "";
    }
}

class SalesReport {
    SalesReport(CsvSaleParser parser, SalesCalculator calculator, ReportFormatter formatter) {
        // TODO
    }

    // God Method: macht alles selbst
    String create(List<String> lines) {
        Map<String, BigDecimal> m = new TreeMap<>();
        for (String l : lines) {
            if (!l.isBlank()) {
                String[] p = l.split(";");
                if (p.length == 2) {
                    String r = p[0].trim();
                    BigDecimal a = new BigDecimal(p[1].trim());
                    if (m.containsKey(r)) {
                        m.put(r, m.get(r).add(a));
                    } else {
                        m.put(r, a);
                    }
                } else {
                    throw new IllegalArgumentException("bad line " + l);
                }
            }
        }
        String s = "";
        for (String r : m.keySet()) {
            if (!s.isEmpty()) s += "\\n";
            s += r + ": " + m.get(r);
        }
        return s;
    }
}`,
      solution: `class CsvSaleParser {
    private static final String SEPARATOR = ";";

    List<Sale> parse(List<String> lines) {
        return lines.stream()
                .filter(line -> !line.isBlank())
                .map(this::parseLine)
                .toList();
    }

    private Sale parseLine(String line) {
        String[] parts = line.split(SEPARATOR);
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid line: " + line);
        }
        return new Sale(parts[0].trim(), new BigDecimal(parts[1].trim()));
    }
}

class SalesCalculator {
    Map<String, BigDecimal> totalsByRegion(List<Sale> sales) {
        return sales.stream()
                .collect(Collectors.groupingBy(
                        Sale::region,
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Sale::amount, BigDecimal::add)));
    }
}

class ReportFormatter {
    String format(Map<String, BigDecimal> totals) {
        return totals.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\\n"));
    }
}

class SalesReport {
    private final CsvSaleParser parser;
    private final SalesCalculator calculator;
    private final ReportFormatter formatter;

    SalesReport(CsvSaleParser parser, SalesCalculator calculator, ReportFormatter formatter) {
        this.parser = parser;
        this.calculator = calculator;
        this.formatter = formatter;
    }

    String create(List<String> lines) {
        List<Sale> sales = parser.parse(lines);
        Map<String, BigDecimal> totals = calculator.totalsByRegion(sales);
        return formatter.format(totals);
    }
}`,
      hints: [
        'Drei Änderungsgründe: Eingabeformat, Rechenregel, Ausgabeformat. Jeder bekommt eine Klasse; `SalesReport` ruft sie nur nacheinander auf.',
        'Parser: `filter(line -> !line.isBlank())`, `split(";")`, `trim()`. Calculator: `groupingBy(Sale::region, TreeMap::new, reducing(BigDecimal.ZERO, Sale::amount, BigDecimal::add))`. Formatter: `Collectors.joining("\\n")`.',
        'create: `sales = parser.parse(lines)` → `totals = calculator.totalsByRegion(sales)` → `return formatter.format(totals)`.',
        '```java\nprivate Sale parseLine(String line) {\n    String[] parts = line.split(";");\n    if (parts.length != 2) throw new IllegalArgumentException(...);\n    // ...\n}\n```',
      ],
      tests: `var parser = new CsvSaleParser();
var calculator = new SalesCalculator();
var formatter = new ReportFormatter();
check("parse", List.of(new Sale("EU", new BigDecimal("100.50")), new Sale("US", new BigDecimal("20"))),
        parser.parse(List.of(" EU ; 100.50", "", "US;20")));
checkThrows("parse ungültige Zeile", IllegalArgumentException.class, () -> parser.parse(List.of("EU;1;2")));
var totals = calculator.totalsByRegion(List.of(
        new Sale("US", new BigDecimal("5.00")),
        new Sale("EU", new BigDecimal("100.50")),
        new Sale("EU", new BigDecimal("49.50"))));
check("totals", Map.of("EU", new BigDecimal("150.00"), "US", new BigDecimal("5.00")), totals);
check("totals sortiert", List.of("EU", "US"), new ArrayList<>(totals.keySet()));
check("totals leer", Map.of(), calculator.totalsByRegion(List.of()));
var ordered = new LinkedHashMap<String, BigDecimal>();
ordered.put("APAC", new BigDecimal("1.00"));
ordered.put("EU", new BigDecimal("2.50"));
check("format", "APAC: 1.00\\nEU: 2.50", formatter.format(ordered));
check("format leer", "", formatter.format(Map.of()));
var report = new SalesReport(parser, calculator, formatter);
check("create", "EU: 150.00\\nUS: 5.00", report.create(List.of("US;5.00", "EU;100.50", "EU;49.50")));`,
    },
  ],
}

export default chapter
