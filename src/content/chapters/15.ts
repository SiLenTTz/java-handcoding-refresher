import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '15',
  flashcards: [
    {
      id: 'f1',
      front: 'Wann setzt du überhaupt ein Pattern ein?',
      back: 'Nur wenn ein **konkretes Änderungsszenario** dadurch billiger wird. Jedes Pattern kostet Indirektion. Gibt es kein absehbares zweites Szenario, gewinnen KISS und YAGNI.',
    },
    {
      id: 'f2',
      front: '**Strategy** – Problem und Lösung?',
      back: 'Problem: `if`/`switch`-Kaskaden für austauschbare Varianten (Open/Closed verletzt).\nLösung: Variante hinter ein Interface, Auswahl zur Laufzeit.\n\n```java\nMap<CustomerType, UnaryOperator<BigDecimal>> RULES = Map.of(\n    CustomerType.VIP, amount -> amount.multiply(new BigDecimal("0.80")));\n```',
    },
    {
      id: 'f3',
      front: 'Strategy vs. Template Method?',
      back: 'Strategy tauscht per **Komposition** (zur Laufzeit, testbar, mehrere Varianten gleichzeitig). Template Method variiert per **Vererbung** (zur Compilezeit, ein Ablauf, feste Hooks). Komposition ist im Zweifel flexibler.',
    },
    {
      id: 'f4',
      front: 'Wann Enum-mit-Verhalten statt Strategy-Interface?',
      back: 'Enum: kleine, feste Menge, Logik einfach, keine Abhängigkeiten. Strategy: Implementierungen brauchen Beans/Abhängigkeiten oder sollen erweiterbar sein, ohne den Enum anzufassen.',
    },
    {
      id: 'f5',
      front: '**Template Method** – Struktur?',
      back: 'Der Ablauf steht in einer `final`-Methode der Basisklasse, die variablen Schritte sind `abstract` oder `protected` Hooks.\n\n```java\nfinal ImportResult run(Path file) {\n    var raw = read(file);\n    var records = parse(raw);   // abstract\n    return store(records);      // abstract\n}\n```',
    },
    {
      id: 'f6',
      front: 'Welche Spring-Klassen sind Template Method?',
      back: '`JdbcTemplate`, `TransactionTemplate`, `RestClient`: Das Framework steuert den Ablauf (Connection öffnen/schließen, Transaktion, Fehlerübersetzung), du lieferst nur den variablen Teil als Callback/Lambda.',
    },
    {
      id: 'f7',
      front: '**Factory** vs. **Builder** – Unterschied in einem Satz?',
      back: 'Die Factory entscheidet, **welcher Typ** erzeugt wird; der Builder, **wie** ein Objekt schrittweise zusammengesetzt wird.',
    },
    {
      id: 'f8',
      front: 'Warum eine **Static Factory Method** statt eines Konstruktors?',
      back: 'Sie hat einen **Namen** (`Money.ofEuro("9.99")`), kann Instanzen cachen (`Integer.valueOf`), kann einen Subtyp zurückgeben und braucht nicht bei jedem Aufruf ein neues Objekt.',
    },
    {
      id: 'f9',
      front: 'Wann lohnt sich ein **Builder**?',
      back: 'Bei vielen (teils optionalen) Parametern, die am Aufrufort sonst nicht unterscheidbar wären (`new Order(null, null, 3, true)`). Pflichtfelder in `builder(...)`, Optionales als Methoden, Validierung in `build()`. Für drei Pflichtfelder reicht ein Record.',
    },
    {
      id: 'f10',
      front: 'Warum gilt klassisches **Singleton** oft als Anti-Pattern – und was macht Spring anders?',
      back: 'Globaler Zustand, versteckte Abhängigkeit, kaum testbar. Spring gibt Beans den **Singleton-Scope**, injiziert sie aber – Einmaligkeit ohne globalen Zugriff. Achtung: Singleton-Beans müssen zustandslos oder thread-safe sein.',
    },
    {
      id: 'f11',
      front: '**Adapter** – wofür?',
      back: 'Eine fremde API an das eigene Interface anpassen, damit der Fremdtyp nur an einer Stelle vorkommt.\n\n```java\ninterface SmsSender { void send(String phone, String text); }\nclass TwilioAdapter implements SmsSender { ... }\n```\nAnbieterwechsel kostet dann eine Klasse.',
    },
    {
      id: 'f12',
      front: '**Decorator** vs. **Proxy**?',
      back: 'Beide wrappen dasselbe Interface. Der Decorator **ergänzt Funktionalität** (Caching, Logging), der Proxy **kontrolliert den Zugriff** oder Lebenszyklus. Spring AOP (`@Transactional`, `@Cacheable`) arbeitet mit Proxys.',
    },
    {
      id: 'f13',
      front: 'Warum wirkt `@Transactional` bei einem Selbstaufruf nicht?',
      back: 'Die Annotation wird über einen **Proxy** umgesetzt. `this.inner()` geht am Proxy vorbei, also greift kein Interceptor. Lösung: die Methode in eine eigene Bean verschieben.',
    },
    {
      id: 'f14',
      front: '**Facade** – Problem und Beispiel?',
      back: 'Ein Use Case braucht mehrere Subsysteme, jeder Aufrufer müsste die Reihenfolge kennen. Ein `CheckoutFacade` bündelt `inventory.reserve`, `payments.charge`, `orders.save`, `shipping.schedule` hinter **einer** Methode. Gefahr: Die Facade wird zur God-Class.',
    },
    {
      id: 'f15',
      front: 'Warum ist **DI** ein Pattern und warum Konstruktor-Injection?',
      back: 'DI setzt Inversion of Control um: Die Klasse bekommt Abhängigkeiten von außen statt sie per `new` zu erzeugen. Konstruktor-Injection erlaubt `final` Felder, macht fehlende Abhängigkeiten beim Start sichtbar und die Klasse ohne Container testbar.',
    },
    {
      id: 'f16',
      front: 'Wie ersetzt Java 21 den Visitor?',
      back: 'Durch `sealed interface` + `record` + `switch`-Pattern-Matching. Der Compiler prüft die Vollständigkeit, ein `default` ist unnötig – vergisst du später eine neue Variante, bricht der Build.\n\n```java\nreturn switch (shape) {\n    case Circle c -> Math.PI * c.r() * c.r();\n    case Rect r   -> r.w() * r.h();\n};\n```',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welches Pattern löst diesen Code am besten auf?',
      code: `BigDecimal shipping(String type, BigDecimal weight) {
    if (type.equals("EXPRESS")) return weight.multiply(new BigDecimal("2.5"));
    if (type.equals("STANDARD")) return weight;
    if (type.equals("PICKUP")) return BigDecimal.ZERO;
    return null;
}`,
      options: [
        'Builder',
        'Strategy bzw. Enum mit Verhalten',
        'Facade',
        'Singleton',
      ],
      correct: 1,
      explanation: 'Jede neue Versandart würde die Methode ändern (Open/Closed verletzt). Zusätzlich ist `String type` Primitive Obsession – ein Enum mit Verhalten oder eine `Map<Enum, Strategy>` löst beides.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert dieser `switch` **ohne** `default`?',
      code: `sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}

double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Rect r -> r.w() * r.h();
    };
}`,
      options: [
        'Weil `switch`-Ausdrücke nie einen `default` brauchen',
        'Weil `Shape` sealed ist – der Compiler kennt alle Varianten und prüft auf Vollständigkeit',
        'Weil Records automatisch einen `default`-Fall erzeugen',
        'Es kompiliert nicht',
      ],
      correct: 1,
      explanation: 'Bei einem `sealed` Typ ist die Menge der Implementierungen geschlossen. Kommt später eine dritte Variante dazu, bricht genau dieser `switch` – erwünschte Fehlermeldung statt stillem Laufzeitfehler.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Bug?',
      code: `@Service
class OrderService {
    public void placeAll(List<Order> orders) {
        orders.forEach(this::place);
    }

    @Transactional
    public void place(Order order) { repository.save(order); }
}`,
      options: [
        'Kein Bug – jede Bestellung läuft in einer eigenen Transaktion',
        '`@Transactional` greift beim Selbstaufruf nicht, weil der Spring-Proxy umgangen wird',
        '`@Transactional` darf nicht auf `public` Methoden stehen',
        '`forEach` darf keine Method Reference bekommen',
      ],
      correct: 1,
      explanation: 'Die Annotation wird per Proxy umgesetzt. `this::place` ruft die Methode direkt auf der Zielinstanz auf – kein Interceptor, keine Transaktion. Lösung: `place` in eine eigene Bean auslagern.',
    },
    {
      id: 'q4',
      prompt: 'Welcher Einsatz eines Builders ist gerechtfertigt?',
      options: [
        '`Point.builder().x(1).y(2).build()` für zwei Pflichtfelder',
        '`Order.builder("Anna").item("Buch").note("eilig").express().build()` – ein Pflichtfeld, mehrere optionale, Validierung in `build()`',
        'Immer – Builder sind grundsätzlich lesbarer als Konstruktoren',
        'Nur bei unveränderlichen Klassen, Records ausgenommen',
      ],
      correct: 1,
      explanation: 'Der Builder zahlt sich aus, wenn optionale Felder am Aufrufort sonst als `null`/`false` stehen würden. Für zwei Pflichtfelder ist `new Point(1, 2)` kürzer und klarer.',
    },
    {
      id: 'q5',
      prompt: 'Welche Aussage über Decorator und Proxy stimmt?',
      options: [
        'Decorator und Proxy sind dasselbe Pattern mit zwei Namen',
        'Beide implementieren dasselbe Interface wie das gewrappte Objekt; der Decorator ergänzt Funktionalität, der Proxy kontrolliert den Zugriff',
        'Der Decorator muss von der gewrappten Klasse erben',
        'Der Proxy ist nur im JDK verwendbar, nicht in Spring',
      ],
      correct: 1,
      explanation: 'Entscheidend ist in beiden Fällen: gleiches Interface, Delegation an ein `delegate`-Feld. JDK-Beispiel für Decorator: `new BufferedReader(new InputStreamReader(in))`.',
    },
    {
      id: 'q6',
      prompt: 'Welche Variante ist Clean Code für zwei zustandslose Rabattvarianten?',
      code: `// A
class TenPercentDiscount implements DiscountStrategy { ... }
class TwentyPercentDiscount implements DiscountStrategy { ... }

// B
Map<CustomerType, UnaryOperator<BigDecimal>> RULES = Map.of(
    CustomerType.PREMIUM, amount -> amount.multiply(new BigDecimal("0.90")),
    CustomerType.VIP,     amount -> amount.multiply(new BigDecimal("0.80")));`,
      options: [
        'A – je eine Klasse pro Strategie ist das „richtige“ Strategy-Pattern',
        'B – zustandslose Strategien sind Lambdas; die Klassenexplosion bringt keinen Mehrwert',
        'Beide gleichwertig',
        'Keine – hier gehört ein `if`/`else` hin',
      ],
      correct: 1,
      explanation: 'Strategy verlangt keine Klassen. Erst wenn eine Strategie Abhängigkeiten braucht oder selbst getestet werden soll, lohnt eine eigene (Spring-)Komponente.',
    },
    {
      id: 'q7',
      prompt: 'Welches Pattern beschreibt `UserRepository extends JpaRepository<UserEntity, Long>`?',
      options: [
        'Facade – es bündelt mehrere Subsysteme',
        'Repository – es abstrahiert den Datenzugriff; die Implementierung entsteht zur Laufzeit als Proxy',
        'Adapter – es passt JPA an SQL an',
        'Template Method – es definiert den Ablauf einer Abfrage',
      ],
      correct: 1,
      explanation: 'Das Interface gehört fachlich zur Domain, die Implementierung zur Infrastruktur. Rückgaben: `Optional` für Einzeltreffer, leere `List`/`Page` statt `null`.',
    },
    {
      id: 'q8',
      prompt: 'Warum ist diese Klasse in einem Spring-Backend problematisch?',
      code: `class PriceService {
    private static final PriceService INSTANCE = new PriceService();
    private BigDecimal lastPrice;
    static PriceService getInstance() { return INSTANCE; }
}`,
      options: [
        'Sie ist zu kurz',
        'Globaler Zustand über `getInstance()` (nicht ersetzbar, schlecht testbar) plus veränderliches Feld in einer geteilten Instanz',
        '`private static final` ist in Java nicht erlaubt',
        'Sie müsste `final` sein',
      ],
      correct: 1,
      explanation: 'Aufrufer holen die Instanz statt sie injiziert zu bekommen – im Test nicht austauschbar. Zusätzlich ist `lastPrice` veränderlicher Zustand in einer geteilten Instanz und damit nicht thread-safe.',
    },
    {
      id: 'q9',
      prompt: 'Welches Pattern passt zu dieser Anforderung: „Beim Anlegen einer Bestellung sollen Rechnung, Lagerbuchung und Bestätigungsmail ausgelöst werden – der Besteller-Code soll die Empfänger nicht kennen.“',
      options: [
        'Adapter',
        'Observer bzw. Domain Events (`ApplicationEventPublisher`)',
        'Builder',
        'Template Method',
      ],
      correct: 1,
      explanation: 'Der Sender veröffentlicht ein Ereignis, die Listener reagieren. Preis: Der Ablauf ist nicht mehr linear lesbar – deshalb Events für Nebeneffekte, nicht für die Kernlogik.',
    },
    {
      id: 'q10',
      prompt: 'Ein Service hat genau eine Implementierung. Der Kollege legt trotzdem ein Interface an, „falls wir mal wechseln“. Wie beurteilst du das?',
      options: [
        'Gut – so ist man auf alles vorbereitet',
        'Speculative Generality: Ohne zweite Implementierung kostet das Interface nur Navigation; einziehen kann man es später in Minuten',
        'Pflicht – ohne Interface funktioniert Dependency Injection nicht',
        'Pflicht – sonst kann Spring keine Transaktionen proxen',
      ],
      correct: 1,
      explanation: 'Spring nutzt bei Bedarf CGLIB-Proxys auf Klassen, ein Interface ist nicht nötig. Und moderne IDEs extrahieren ein Interface automatisch, sobald die zweite Implementierung wirklich existiert.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Strategy ohne Klassenexplosion',
      level: 1,
      description: `Ersetze eine \`if\`-Kaskade durch eine Strategy-Tabelle.

Implementiere in \`Solution\`:

- \`static UnaryOperator<BigDecimal> strategyFor(CustomerType type)\` – \`STANDARD\` unverändert, \`PREMIUM\` ×0.90, \`VIP\` ×0.80
- \`static BigDecimal finalPrice(BigDecimal amount, CustomerType type)\` – wendet die Strategie an und gibt das Ergebnis mit \`setScale(2, RoundingMode.HALF_UP)\` zurück

Nutze eine \`Map<CustomerType, UnaryOperator<BigDecimal>>\` oder einen \`switch\`-Ausdruck – aber **keine** \`if\`-Kette und keine eigene Klasse pro Variante.`,
      given: `enum CustomerType { STANDARD, PREMIUM, VIP }`,
      starter: `class Solution {

    static UnaryOperator<BigDecimal> strategyFor(CustomerType type) {
        // TODO
        return null;
    }

    static BigDecimal finalPrice(BigDecimal amount, CustomerType type) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    private static final Map<CustomerType, UnaryOperator<BigDecimal>> STRATEGIES = Map.of(
            CustomerType.STANDARD, amount -> amount,
            CustomerType.PREMIUM, amount -> amount.multiply(new BigDecimal("0.90")),
            CustomerType.VIP, amount -> amount.multiply(new BigDecimal("0.80")));

    static UnaryOperator<BigDecimal> strategyFor(CustomerType type) {
        return STRATEGIES.get(type);
    }

    static BigDecimal finalPrice(BigDecimal amount, CustomerType type) {
        return strategyFor(type).apply(amount).setScale(2, RoundingMode.HALF_UP);
    }
}`,
      hints: [
        'Eine Strategie ist hier nur ein Verhalten `BigDecimal -> BigDecimal`. Eine `Map` vom Enum auf das Verhalten ersetzt die komplette `if`-Kaskade.',
        'Bausteine: `Map.of(...)`, `UnaryOperator<BigDecimal>`, `BigDecimal.multiply(...)`, `setScale(2, RoundingMode.HALF_UP)`.',
        'Pseudocode: eine `private static final Map<CustomerType, UnaryOperator<BigDecimal>>` als Konstante anlegen; `strategyFor` schlägt darin nach; `finalPrice` ruft `strategyFor(type).apply(amount)` und skaliert.',
        '```java\nprivate static final Map<CustomerType, UnaryOperator<BigDecimal>> STRATEGIES = Map.of(\n        CustomerType.STANDARD, amount -> amount,\n        CustomerType.PREMIUM, amount -> amount.multiply(new BigDecimal("0.90")),\n        CustomerType.VIP, /* ... */);\n```',
      ],
      tests: `check("STANDARD", "100.00", Solution.finalPrice(new BigDecimal("100.00"), CustomerType.STANDARD).toPlainString());
check("PREMIUM", "90.00", Solution.finalPrice(new BigDecimal("100.00"), CustomerType.PREMIUM).toPlainString());
check("VIP", "80.00", Solution.finalPrice(new BigDecimal("100.00"), CustomerType.VIP).toPlainString());
check("Rundung auf zwei Stellen", "89.10", Solution.finalPrice(new BigDecimal("99.00"), CustomerType.PREMIUM).toPlainString());
check("Betrag 0", "0.00", Solution.finalPrice(BigDecimal.ZERO, CustomerType.VIP).toPlainString());
check("kaufmaennisch gerundet", "9.88", Solution.finalPrice(new BigDecimal("9.876"), CustomerType.STANDARD).toPlainString());
checkTrue("strategyFor liefert eine Strategie", Solution.strategyFor(CustomerType.VIP) != null);
check("strategyFor VIP rechnet", 0,
        Solution.strategyFor(CustomerType.VIP).apply(new BigDecimal("10.00")).compareTo(new BigDecimal("8.00")));
check("strategyFor STANDARD laesst den Wert stehen", 0,
        Solution.strategyFor(CustomerType.STANDARD).apply(new BigDecimal("7.25")).compareTo(new BigDecimal("7.25")));`,
    },
    {
      id: 'k2',
      title: 'Builder für unveränderliche Bestellungen',
      level: 2,
      description: `Vervollständige den Builder des Records \`Order\`:

- \`static Builder builder(String customer)\` – Pflichtfeld \`customer\` steht im Einstieg
- \`Builder item(String item)\` – fügt eine Position hinzu (fluent)
- \`Builder note(String note)\` – optional, Default \`""\`
- \`Builder express()\` – optional, Default \`false\`
- \`Order build()\` – ohne Position eine \`IllegalStateException\`; die Positionen im \`Order\` müssen eine **unveränderliche Kopie** sein (späteres \`item(...)\` am Builder darf das gebaute \`Order\` nicht verändern)`,
      starter: `record Order(String customer, List<String> items, String note, boolean express) {

    static Builder builder(String customer) {
        // TODO
        return null;
    }

    static final class Builder {
        // TODO: Felder fuer customer, items, note, express

        Builder item(String item) {
            // TODO
            return this;
        }

        Builder note(String note) {
            // TODO
            return this;
        }

        Builder express() {
            // TODO
            return this;
        }

        Order build() {
            // TODO
            return null;
        }
    }
}`,
      solution: `record Order(String customer, List<String> items, String note, boolean express) {

    static Builder builder(String customer) {
        return new Builder(customer);
    }

    static final class Builder {
        private final String customer;
        private final List<String> items = new ArrayList<>();
        private String note = "";
        private boolean express;

        private Builder(String customer) {
            this.customer = customer;
        }

        Builder item(String item) {
            items.add(item);
            return this;
        }

        Builder note(String note) {
            this.note = note;
            return this;
        }

        Builder express() {
            this.express = true;
            return this;
        }

        Order build() {
            if (items.isEmpty()) {
                throw new IllegalStateException("mindestens eine Position noetig");
            }
            return new Order(customer, List.copyOf(items), note, express);
        }
    }
}`,
      hints: [
        'Der Builder sammelt veränderlichen Zustand, das gebaute Objekt ist unveränderlich. Deshalb darf `build()` die interne Liste nicht direkt durchreichen.',
        'Bausteine: `private Builder(String customer)`, `new ArrayList<>()` als Sammelliste, `List.copyOf(items)` für die unveränderliche Kopie, `IllegalStateException` für Validierung in `build()`.',
        'Pseudocode: `builder(customer)` → `new Builder(customer)`. Jede Setter-artige Methode ändert ein Feld und gibt `this` zurück. `build()` prüft, ob Positionen vorhanden sind, und erzeugt `new Order(customer, List.copyOf(items), note, express)`.',
        '```java\nOrder build() {\n    if (items.isEmpty()) {\n        throw new IllegalStateException("mindestens eine Position noetig");\n    }\n    return new Order(customer, /* ... */, note, express);\n}\n```',
      ],
      tests: `Order order = Order.builder("Anna").item("Buch").item("Stift").express().build();
check("customer", "Anna", order.customer());
check("items in Reihenfolge", List.of("Buch", "Stift"), order.items());
check("note hat Default", "", order.note());
checkTrue("express gesetzt", order.express());

Order plain = Order.builder("Bo").item("X").note("bitte klingeln").build();
check("note gesetzt", "bitte klingeln", plain.note());
checkTrue("express hat Default false", !plain.express());

checkThrows("build ohne Position", IllegalStateException.class, () -> Order.builder("Cem").build());

Order.Builder builder = Order.builder("Dana").item("A");
Order first = builder.build();
builder.item("B");
check("gebautes Order bleibt unberuehrt", List.of("A"), first.items());
checkThrows("items sind unveraenderlich", UnsupportedOperationException.class, () -> first.items().add("Z"));`,
    },
    {
      id: 'k3',
      title: 'Factory mit sealed interface und Pattern Matching',
      level: 3,
      description: `\`Shape\` ist ein \`sealed interface\` mit drei Record-Varianten. Implementiere in \`Solution\`:

- \`static Shape create(String type, double a, double b)\` – Factory, Typname **ohne** Beachtung der Groß-/Kleinschreibung:
  \`"CIRCLE"\` → \`Circle(a)\`, \`"SQUARE"\` → \`Square(a)\`, \`"RECTANGLE"\` → \`Rectangle(a, b)\`, sonst \`IllegalArgumentException\`
- \`static double area(Shape shape)\` – mit \`switch\`-Pattern-Matching, **ohne** \`default\` und ohne \`instanceof\`-Kette
- \`static Shape largest(List<Shape> shapes)\` – größte Fläche; leere Liste → \`NoSuchElementException\``,
      given: `sealed interface Shape permits Circle, Square, Rectangle {}

record Circle(double radius) implements Shape {}

record Square(double side) implements Shape {}

record Rectangle(double width, double height) implements Shape {}`,
      starter: `class Solution {

    static Shape create(String type, double a, double b) {
        // TODO
        return null;
    }

    static double area(Shape shape) {
        // TODO
        return -1;
    }

    static Shape largest(List<Shape> shapes) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Shape create(String type, double a, double b) {
        if (type == null) {
            throw new IllegalArgumentException("type darf nicht null sein");
        }
        return switch (type.trim().toUpperCase()) {
            case "CIRCLE" -> new Circle(a);
            case "SQUARE" -> new Square(a);
            case "RECTANGLE" -> new Rectangle(a, b);
            default -> throw new IllegalArgumentException("unbekannter Typ: " + type);
        };
    }

    static double area(Shape shape) {
        return switch (shape) {
            case Circle circle -> Math.PI * circle.radius() * circle.radius();
            case Square square -> square.side() * square.side();
            case Rectangle rectangle -> rectangle.width() * rectangle.height();
        };
    }

    static Shape largest(List<Shape> shapes) {
        return shapes.stream()
                .max(Comparator.comparingDouble(Solution::area))
                .orElseThrow(() -> new NoSuchElementException("keine Shape vorhanden"));
    }
}`,
      hints: [
        'Zwei verschiedene `switch`-Arten: In `create` schaltest du über einen `String`, in `area` über den **Typ** (Pattern Matching). Weil `Shape` sealed ist, braucht `area` keinen `default`.',
        'Bausteine: `String.trim().toUpperCase()`, `switch`-Ausdruck mit `->`, `case Circle circle ->`, `Comparator.comparingDouble(...)`, `Stream.max`, `Optional.orElseThrow(Supplier)`.',
        'Pseudocode: create → `null`-Guard, `switch` über den normalisierten String, im `default` werfen. area → `switch (shape)` mit einem `case` je Record. largest → streamen, `max` mit `comparingDouble(Solution::area)`, `orElseThrow`.',
        '```java\nstatic double area(Shape shape) {\n    return switch (shape) {\n        case Circle circle -> Math.PI * circle.radius() * circle.radius();\n        case Square square -> /* ... */;\n        case Rectangle rectangle -> /* ... */;\n    };\n}\n```',
      ],
      tests: `check("create CIRCLE", new Circle(2.0), Solution.create("circle", 2, 0));
check("create SQUARE", new Square(3.0), Solution.create("SQUARE", 3, 0));
check("create RECTANGLE", new Rectangle(2.0, 5.0), Solution.create(" Rectangle ", 2, 5));
checkThrows("unbekannter Typ", IllegalArgumentException.class, () -> Solution.create("TRIANGLE", 1, 1));
checkThrows("null-Typ", IllegalArgumentException.class, () -> Solution.create(null, 1, 1));
check("area Square", 9.0, Solution.area(new Square(3)));
check("area Rectangle", 10.0, Solution.area(new Rectangle(2, 5)));
checkTrue("area Circle", Math.abs(Solution.area(new Circle(2)) - Math.PI * 4) < 1e-9);
check("largest", new Rectangle(2.0, 5.0),
        Solution.largest(List.of(new Square(3), new Rectangle(2, 5), new Circle(0.5))));
check("largest bei einem Element", new Square(1.0), Solution.largest(List.of(new Square(1))));
checkThrows("largest bei leerer Liste", NoSuchElementException.class, () -> Solution.largest(List.of()));`,
    },
    {
      id: 'k4',
      title: 'Decorator: Caching und Logging um einen Service legen',
      level: 4,
      description: `\`SlowPriceService\` fragt bei jedem Aufruf die (teure) Quelle und protokolliert das in \`calls\`. Ändere die Klasse **nicht** – lege stattdessen Decorators darum.

Implementiere in \`Solution\`:

- \`static PriceService caching(PriceService delegate)\` – merkt sich Ergebnisse pro SKU; der \`delegate\` wird je SKU **höchstens einmal** gefragt
- \`static PriceService logging(PriceService delegate, List<String> log)\` – schreibt vor dem Delegieren \`"call:" + sku\` in \`log\`
- \`static BigDecimal sum(PriceService service, List<String> skus)\` – Summe aller Preise mit \`setScale(2, RoundingMode.HALF_UP)\`, leere Liste → \`0.00\`

Beide Decorators implementieren dasselbe Interface wie der \`delegate\` und dürfen beliebig verschachtelt werden.`,
      given: `interface PriceService {
    BigDecimal priceOf(String sku);
}

class SlowPriceService implements PriceService {
    private final Map<String, BigDecimal> prices;
    private final List<String> calls;

    SlowPriceService(Map<String, BigDecimal> prices, List<String> calls) {
        this.prices = prices;
        this.calls = calls;
    }

    @Override
    public BigDecimal priceOf(String sku) {
        calls.add(sku);
        BigDecimal price = prices.get(sku);
        if (price == null) {
            throw new NoSuchElementException("unbekannte SKU: " + sku);
        }
        return price;
    }
}`,
      starter: `class Solution {

    static PriceService caching(PriceService delegate) {
        // TODO
        return null;
    }

    static PriceService logging(PriceService delegate, List<String> log) {
        // TODO
        return null;
    }

    static BigDecimal sum(PriceService service, List<String> skus) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static PriceService caching(PriceService delegate) {
        Map<String, BigDecimal> cache = new HashMap<>();
        return sku -> cache.computeIfAbsent(sku, delegate::priceOf);
    }

    static PriceService logging(PriceService delegate, List<String> log) {
        return sku -> {
            log.add("call:" + sku);
            return delegate.priceOf(sku);
        };
    }

    static BigDecimal sum(PriceService service, List<String> skus) {
        return skus.stream()
                .map(service::priceOf)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}`,
      hints: [
        'Ein Decorator implementiert dasselbe Interface und hält den `delegate`. Weil `PriceService` nur eine Methode hat, reicht ein Lambda – der Cache ist dann eine Closure über eine lokale `Map`.',
        'Bausteine: `Map.computeIfAbsent(key, function)`, Method Reference `delegate::priceOf`, `Stream.reduce(BigDecimal.ZERO, BigDecimal::add)`, `setScale(2, RoundingMode.HALF_UP)`.',
        'Pseudocode: caching → lokale `HashMap` anlegen, `sku -> cache.computeIfAbsent(sku, delegate::priceOf)` zurückgeben. logging → `sku -> { log.add("call:" + sku); return delegate.priceOf(sku); }`. sum → streamen, mappen, reduzieren, skalieren.',
        '```java\nstatic PriceService caching(PriceService delegate) {\n    Map<String, BigDecimal> cache = new HashMap<>();\n    return sku -> cache.computeIfAbsent(sku, /* ... */);\n}\n```',
      ],
      tests: `Map<String, BigDecimal> prices = Map.of("A", new BigDecimal("10.00"), "B", new BigDecimal("5.50"));
List<String> calls = new ArrayList<>();
PriceService cached = Solution.caching(new SlowPriceService(prices, calls));

check("erster Aufruf", "10.00", cached.priceOf("A").toPlainString());
check("zweiter Aufruf derselben SKU", "10.00", cached.priceOf("A").toPlainString());
check("Delegate nur einmal gefragt", 1, calls.size());
cached.priceOf("B");
check("neue SKU geht durch", 2, calls.size());

List<String> log = new ArrayList<>();
PriceService logged = Solution.logging(new SlowPriceService(prices, new ArrayList<>()), log);
logged.priceOf("A");
logged.priceOf("B");
check("Log-Eintraege", List.of("call:A", "call:B"), log);

check("sum", "25.50", Solution.sum(cached, List.of("A", "A", "B")).toPlainString());
check("sum bei leerer Liste", "0.00", Solution.sum(cached, List.of()).toPlainString());
check("Cache greift auch in sum", 2, calls.size());
checkThrows("unbekannte SKU", NoSuchElementException.class,
        () -> Solution.caching(new SlowPriceService(Map.of(), new ArrayList<>())).priceOf("X"));`,
    },
  ],
}

export default chapter
