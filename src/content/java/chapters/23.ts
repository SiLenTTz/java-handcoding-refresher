import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '23',
  flashcards: [
    { id: 'c1', front: 'Was ist **Refactoring** – und was nicht?', back: 'Struktur verbessern **ohne** beobachtbares Verhalten zu ändern. Ein Bugfix oder ein neues Feature ist kein Refactoring und gehört in einen eigenen, bewussten Schritt.' },
    { id: 'c2', front: 'Was macht man **vor** dem Refactoring von Legacy-Code ohne Tests?', back: '**Characterization Tests** schreiben, die das aktuelle Verhalten festnageln. Danach in kleinen Schritten umbauen und nach jedem Schritt Tests laufen lassen.' },
    { id: 'c3', front: 'Move **Guard Clause**?', back: 'Fehler-/Sonderfälle am Methodenanfang mit `return`/`throw` abhandeln, statt den Happy Path in verschachtelte `if`s zu packen. Ergebnis: flacher Code, Happy Path unten.' },
    { id: 'c4', front: 'Move **Extract Method**: wann?', back: 'Wenn ein Block einen Kommentar braucht, dupliziert ist oder die Methode zu lang ist. Der Methodenname ersetzt den Kommentar.' },
    { id: 'c5', front: 'Move **Replace Magic Number**?', back: 'Literal mit fachlicher Bedeutung durch `private static final` Konstante oder enum ersetzen: `0.19` → `VAT_RATE`, `status == 3` → `OrderStatus.SHIPPED`.' },
    { id: 'c6', front: 'Move **Replace Conditional with Polymorphism**?', back: '`if/switch` auf einen Typ-Code durch polymorphes Verhalten ersetzen: enum mit Feld/Methode oder Strategy-Interface mit einer Implementierung pro Fall.' },
    { id: 'c7', front: 'enum mit Verhalten vs **Strategy**?', back: 'enum: kleine, feste Menge, einfache Logik ohne Abhängigkeiten. Strategy: Logik braucht Abhängigkeiten (Beans), soll ohne Änderung erweiterbar sein (Open/Closed).' },
    { id: 'c8', front: 'Move **Introduce Parameter Object**?', back: 'Zusammengehörige Parameter (`from, to, status, customer`) zu einem Record bündeln: `record OrderSearchCriteria(...)`. Verringert lange Parameterlisten und gibt dem Konzept einen Namen.' },
    { id: 'c9', front: 'Smell **Null Abuse** – Alternativen?', back: '`Optional<T>` als Rückgabe für "kann fehlen", leere Collection statt `null`, Exception bei echtem Fehler, `Objects.requireNonNull` für Pflichtparameter.' },
    { id: 'c10', front: 'Typische **Optional Misuse**?', back: '`isPresent()` + `get()`, `Optional` als Feld/Parameter, `Optional.of(nullable)`, `return null` bei Rückgabetyp `Optional`, `orElse(teuer())` statt `orElseGet`.' },
    { id: 'c11', front: 'Smell **God Service** – wie aufteilen?', back: 'Nach Verantwortlichkeiten (Gründe für Änderungen): Orchestrierung im Use-Case-Service, reine Logik in Calculator/Policy-Klassen, Seiteneffekte (Mail, PDF, Events) in eigene Komponenten.' },
    { id: 'c12', front: 'Was ist falsch an Logik im Controller?', back: 'Controller soll nur HTTP übersetzen (DTO rein, Service-Aufruf, DTO raus, Status). Business-Logik dort ist nicht wiederverwendbar, schwer testbar und umgeht Transaktionen im Service.' },
    { id: 'c13', front: 'Warum keine **Entity** als Request/Response?', back: 'Mass Assignment (Client setzt `id`/`total`), API gekoppelt an DB-Schema, Lazy-Loading-Exceptions und Endlosrekursion bei JSON, sensible Felder werden exponiert.' },
    { id: 'c14', front: 'Smell **Feature Envy** → Move?', back: 'Eine Methode benutzt vor allem Daten einer anderen Klasse (`order.getItems()...` im Service) → **Move Method** in diese Klasse (`order.total()`).' },
    { id: 'c15', front: 'Risiko: `double` → `BigDecimal` refactoren?', back: 'Mit String-Konstruktor oder `valueOf` erzeugen, `compareTo` statt `equals`, `divide` immer mit Skala und `RoundingMode`, Rundung am Ende bewusst mit `setScale`.' },
    { id: 'c16', front: 'Wann ist eine Schleife besser als ein Stream?', back: 'Bei `break`/frühem Abbruch mit komplexer Bedingung, mehreren Akkumulatoren gleichzeitig, checked Exceptions oder wenn der Stream unlesbar würde.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welcher Refactoring-Move passt am besten?',
      code: `double fee(Account a) {
    if (a != null) {
        if (a.isActive()) {
            return a.balance() * 0.01;
        } else { throw new IllegalStateException(); }
    } else { throw new IllegalArgumentException(); }
}`,
      options: ['Introduce Parameter Object', 'Guard Clauses (plus Replace Magic Number)', 'Replace Conditional with Polymorphism', 'Inline Method'],
      correct: 1,
      explanation: 'Die Verschachtelung besteht nur aus Fehlerfällen. Guard Clauses holen sie nach oben (`if (!a.isActive()) throw ...`), der Happy Path steht dann flach unten. `0.01` wird zur Konstante `FEE_RATE`.',
    },
    {
      id: 'q2',
      prompt: 'Was ist hier der größte Smell?',
      code: `Optional<User> u = repo.findById(id);
if (u.isPresent()) {
    return u.get().getName();
}
return null;`,
      options: ['Magic Number', 'Long Parameter List', 'Duplicated Code', 'Optional Misuse + Null Abuse'],
      correct: 3,
      explanation: '`isPresent` + `get` ist nur ein umständlicher Null-Check, und am Ende kommt doch `null` zurück. Besser: `repo.findById(id).map(User::getName).orElseThrow(...)` oder `Optional<String>` zurückgeben.',
    },
    {
      id: 'q3',
      prompt: 'Ein Service berechnet Versandkosten mit einer `if/else`-Kaskade über `String type` ("STANDARD", "EXPRESS", ...). Was ist die sauberste Lösung, wenn die Logik pro Typ nur aus zwei Zahlen besteht?',
      options: [
        'Enum `ShippingType` mit Feldern (Grundgebühr, Preis pro kg) und Methode `costFor(weight)`',
        'Eine abstrakte Basisklasse `AbstractShippingService` mit Template Method',
        'Ein `Map<String, Double>` im Service',
        'Die Kaskade in eine private Methode extrahieren – fertig',
      ],
      correct: 0,
      explanation: 'Feste, kleine Menge ohne Abhängigkeiten → enum mit Verhalten. Typsicher, kein `String`-Tippfehler, neue Typen an einer Stelle. Strategy wäre Overkill; Vererbung erst recht.',
    },
    {
      id: 'q4',
      prompt: 'Welche Signatur zeigt **Introduce Parameter Object** korrekt angewendet?',
      options: [
        '`search(String customer, LocalDate from, LocalDate to, String status, int page, int size)`',
        '`search(Map<String, Object> params)`',
        '`search(OrderSearchCriteria criteria, Pageable pageable)`',
        '`search(Object... args)`',
      ],
      correct: 2,
      explanation: 'Zusammengehörige Filter werden zu einem typisierten Record, Paging-Infos zu `Pageable`. Eine `Map<String, Object>` verliert jede Typsicherheit.',
    },
    {
      id: 'q5',
      prompt: 'Du refactorst `double`-Preislogik auf `BigDecimal`. Welche Zeile führt zu einem **Bug**?',
      code: `BigDecimal a = new BigDecimal("10.00");
BigDecimal b = BigDecimal.valueOf(3);
BigDecimal c = a.divide(b);                 // (1)
boolean same = a.equals(new BigDecimal("10.0")); // (2)
BigDecimal d = new BigDecimal("0.1");       // (3)`,
      options: ['Nur (3)', '(1) und (2)', 'Nur (2)', 'Keine'],
      correct: 1,
      explanation: '(1) wirft `ArithmeticException` (nicht terminierende Dezimalzahl) – `divide(b, 2, RoundingMode.HALF_UP)`. (2) ist `false`, weil `equals` die Skala vergleicht – `compareTo`. (3) ist korrekt (String-Konstruktor).',
    },
    {
      id: 'q6',
      prompt: 'Welche Aussage über Refactoring ist **falsch**?',
      options: [
        'Refactoring ändert das beobachtbare Verhalten nicht',
        'Man sollte in kleinen Schritten vorgehen und zwischendurch testen',
        'Ein gefundener Bug wird am besten stillschweigend mitgefixt, das spart Zeit',
        'Characterization Tests helfen bei Legacy-Code ohne Tests',
      ],
      correct: 2,
      explanation: 'Bugfixes gehören bewusst getrennt (eigener Test, eigener Commit, ggf. Rücksprache) – sonst weiß niemand, ob eine Verhaltensänderung gewollt ist.',
    },
    {
      id: 'q7',
      prompt: 'Was ist das Hauptproblem dieses Controllers?',
      code: `@PostMapping("/orders")
public Order create(@RequestBody Order order) {
    order.setTotal(order.getItems().stream()
        .mapToDouble(i -> i.getPrice() * i.getQty()).sum());
    return orderRepository.save(order);
}`,
      options: [
        'Es fehlt nur `@ResponseStatus(HttpStatus.CREATED)`',
        '`mapToDouble` ist langsamer als eine Schleife',
        '`@RequestBody` darf nicht auf Entities angewendet werden – Compile-Fehler',
        'Entity als API-Vertrag, Business-Logik im Controller, `double` für Geld, keine Validation',
      ],
      correct: 3,
      explanation: 'Mehrere Smells: exposed Entity (Mass Assignment, Kopplung), Logik und Repository-Zugriff im Controller, `double` für Geld, kein `@Valid`. Refactoring: Request/Response-DTO, Service, BigDecimal.',
    },
    {
      id: 'q8',
      prompt: 'Welcher Smell liegt vor?',
      code: `class InvoiceService {
    BigDecimal total(Order order) {
        return order.getItems().stream()
            .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQty())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}`,
      options: ['Feature Envy → Move Method nach `Order`', 'Magic Number', 'Speculative Generality', 'Long Parameter List'],
      correct: 0,
      explanation: 'Die Methode arbeitet nur mit Daten von `Order`/`OrderItem`. Sie gehört als `order.total()` bzw. `item.lineTotal()` in die Domain (Rich Domain Model).',
    },
    {
      id: 'q9',
      prompt: 'Welche Refactoring-Variante verändert das Verhalten **nicht**?',
      code: `// Original
List<String> r = new ArrayList<>();
for (User u : users) {
    if (u.isActive()) r.add(u.getName());
}
return r;`,
      options: [
        '`return users.stream().filter(User::isActive).map(User::getName).toList();`',
        '`return users.stream().filter(User::isActive).map(User::getName).collect(Collectors.toCollection(ArrayList::new));`',
        '`return users.stream().map(User::getName).filter(Objects::nonNull).toList();`',
        '`return users.stream().filter(User::isActive).map(User::getName).collect(Collectors.toSet()).stream().toList();`',
      ],
      correct: 1,
      explanation: 'Das Original liefert eine **veränderbare** `ArrayList` mit Duplikaten in Originalreihenfolge. `toList()` ist unveränderlich – ruft ein Aufrufer `add`, bricht es. Variante 3 filtert nicht nach aktiv, Variante 4 entfernt Duplikate und verliert die Reihenfolge.',
    },
    {
      id: 'q10',
      prompt: 'Ein `OrderService` hat 1200 Zeilen: Validierung, Preisberechnung, Lagerbuchung, PDF-Rechnung, E-Mail. Welches Prinzip ist primär verletzt und was ist der erste sinnvolle Schritt?',
      options: [
        'Liskov – Service von einer Basisklasse erben lassen',
        'DRY – alle Methoden generisch machen',
        'Single Responsibility – reine Logik (z. B. `PriceCalculator`) und Seiteneffekte (Notifier, InvoiceRenderer) in eigene Klassen extrahieren',
        'Interface Segregation – ein Interface pro Methode anlegen',
      ],
      correct: 2,
      explanation: 'Der Service hat viele Gründe sich zu ändern. Extract Class nach Verantwortung; der `OrderService` bleibt als Orchestrierer des Use Cases.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Legacy PriceCalculator refactoren',
      level: 4,
      description: `Der Legacy-\`PriceCalculator\` ist schwer lesbar **und** fehlerhaft. Refactore ihn und behebe dabei die Bugs.

**Smells:** \`double\` für Geld, Magic Numbers (\`0.1\`, \`0.2\`, \`100\`, \`4.95\`), verschachtelte \`if\`s, Index-Schleife, Einbuchstaben-Namen, stilles Ignorieren ungültiger Eingaben (\`null\`, Menge ≤ 0).

**Spezifikation:**
- \`lines\` \`null\` oder leer → \`IllegalArgumentException\`; eine Zeile mit \`qty <= 0\` → \`IllegalArgumentException\`
- Zwischensumme = Σ \`qty * unitPrice\` (BigDecimal)
- Rabatt: \`STANDARD\` 0 %, \`PREMIUM\` 10 %, \`VIP\` 20 %
- Versand: kostenlos ab (**≥**) 100,00 nach Rabatt, sonst 4,95
- Ergebnis: \`setScale(2, RoundingMode.HALF_UP)\`

Ziel: Konstanten, Guard Clauses, kleine Methoden (\`subtotal\`, \`applyDiscount\`, \`shippingFor\`), \`switch\`-Ausdruck für den Rabatt.`,
      given: `record OrderLine(String sku, int qty, BigDecimal unitPrice) {}

enum CustomerType { STANDARD, PREMIUM, VIP }`,
      starter: `class PriceCalculator {
    static BigDecimal total(List<OrderLine> l, CustomerType t) {
        double s = 0;
        if (l != null) {
            for (int i = 0; i < l.size(); i++) {
                if (l.get(i).qty() > 0) {
                    s = s + l.get(i).qty() * l.get(i).unitPrice().doubleValue();
                }
            }
            if (t == CustomerType.PREMIUM) {
                s = s - s * 0.1;
            } else {
                if (t == CustomerType.VIP) {
                    s = s - s * 0.2;
                }
            }
            if (s > 100) {
                // free shipping
            } else {
                s = s + 4.95;
            }
        }
        return BigDecimal.valueOf(s).setScale(2, RoundingMode.HALF_UP);
    }
}`,
      solution: `class PriceCalculator {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("100.00");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("4.95");
    private static final BigDecimal PREMIUM_DISCOUNT = new BigDecimal("0.10");
    private static final BigDecimal VIP_DISCOUNT = new BigDecimal("0.20");

    static BigDecimal total(List<OrderLine> lines, CustomerType customerType) {
        requireValid(lines);
        Objects.requireNonNull(customerType, "customerType");

        BigDecimal discounted = applyDiscount(subtotal(lines), customerType);
        return discounted.add(shippingFor(discounted)).setScale(2, RoundingMode.HALF_UP);
    }

    private static void requireValid(List<OrderLine> lines) {
        if (lines == null || lines.isEmpty()) {
            throw new IllegalArgumentException("order must contain at least one line");
        }
        if (lines.stream().anyMatch(line -> line.qty() <= 0)) {
            throw new IllegalArgumentException("quantity must be positive");
        }
    }

    private static BigDecimal subtotal(List<OrderLine> lines) {
        return lines.stream()
            .map(line -> line.unitPrice().multiply(BigDecimal.valueOf(line.qty())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal applyDiscount(BigDecimal amount, CustomerType customerType) {
        BigDecimal rate = switch (customerType) {
            case STANDARD -> BigDecimal.ZERO;
            case PREMIUM -> PREMIUM_DISCOUNT;
            case VIP -> VIP_DISCOUNT;
        };
        return amount.subtract(amount.multiply(rate));
    }

    private static BigDecimal shippingFor(BigDecimal amount) {
        return amount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
    }
}`,
      hints: [
        'Erst die Spezifikation mit dem Code vergleichen: Wo weicht das Verhalten ab? (Tipp: Grenzwert 100 und ungültige Eingaben.)',
        'Guard Clauses zuerst: `null`/leer und `qty <= 0` werfen. Dann alle Beträge als `BigDecimal` – `multiply(BigDecimal.valueOf(qty))` und `reduce(BigDecimal.ZERO, BigDecimal::add)`.',
        'Rabattsatz per `switch`-Ausdruck über das enum; Versand mit `compareTo(THRESHOLD) >= 0`.',
        'Struktur: `total` ruft `requireValid`, `subtotal`, `applyDiscount`, `shippingFor` auf und rundet erst ganz am Ende.',
      ],
      tests: `var lines = List.of(new OrderLine("A", 2, new BigDecimal("19.99")), new OrderLine("B", 1, new BigDecimal("25.00")));
check("STANDARD mit Versand", new BigDecimal("69.93"), PriceCalculator.total(lines, CustomerType.STANDARD));
check("PREMIUM 10 % Rabatt", new BigDecimal("63.43"), PriceCalculator.total(lines, CustomerType.PREMIUM));
check("VIP 20 % Rabatt", new BigDecimal("56.93"), PriceCalculator.total(lines, CustomerType.VIP));
check("genau 100,00 ist versandkostenfrei", new BigDecimal("100.00"), PriceCalculator.total(List.of(new OrderLine("C", 4, new BigDecimal("25.00"))), CustomerType.STANDARD));
check("VIP: 125 -> 100,00 nach Rabatt, versandkostenfrei", new BigDecimal("100.00"), PriceCalculator.total(List.of(new OrderLine("D", 1, new BigDecimal("125.00"))), CustomerType.VIP));
check("knapp unter 100 zahlt Versand", new BigDecimal("104.94"), PriceCalculator.total(List.of(new OrderLine("E", 1, new BigDecimal("99.99"))), CustomerType.STANDARD));
checkThrows("null-Liste", IllegalArgumentException.class, () -> PriceCalculator.total(null, CustomerType.STANDARD));
checkThrows("leere Liste", IllegalArgumentException.class, () -> PriceCalculator.total(List.of(), CustomerType.STANDARD));
checkThrows("Menge 0", IllegalArgumentException.class, () -> PriceCalculator.total(List.of(new OrderLine("F", 0, BigDecimal.TEN)), CustomerType.STANDARD));`,
    },
    {
      id: 'k2',
      title: 'Null Abuse & Optional Misuse entfernen',
      level: 3,
      description: `Der \`CustomerService\` benutzt \`Optional\` wie einen Null-Check, gibt \`null\` zurück und stürzt bei fehlender E-Mail ab.

**Smells:** \`isPresent()\` + \`get()\`, \`== true\`/\`== false\`, tiefe Verschachtelung, Duplikation (\`"Customer #" + ...\` zweimal), \`return null\` bei Rückgabetyp \`Optional\`, \`Optional.of\` auf einem möglicherweise \`null\`-Wert, kryptische Namen.

**Spezifikation:**
- \`displayName(id)\`: unbekannte id → \`CustomerNotFoundException\`. Name getrimmt; ist er \`null\` oder blank → \`"Customer #<id>"\`.
- \`contactEmail(id)\`: nur für **aktive** Kunden mit nicht-leerer E-Mail → \`Optional\` mit getrimmter, kleingeschriebener Adresse. Sonst (auch bei unbekannter id) \`Optional.empty()\` – **nie** \`null\`.

Ziel: \`findOrThrow\`, \`Optional\`-Pipeline mit \`filter\`/\`map\`.`,
      given: `record Customer(Long id, String name, String email, boolean active) {}

interface CustomerRepository {
    Optional<Customer> findById(Long id);
}

class InMemoryCustomerRepository implements CustomerRepository {
    private final Map<Long, Customer> byId = new HashMap<>();
    InMemoryCustomerRepository(List<Customer> customers) {
        customers.forEach(c -> byId.put(c.id(), c));
    }
    public Optional<Customer> findById(Long id) { return Optional.ofNullable(byId.get(id)); }
}

class CustomerNotFoundException extends RuntimeException {
    CustomerNotFoundException(Long id) { super("Customer " + id + " not found"); }
}`,
      starter: `class CustomerService {
    CustomerRepository r;

    CustomerService(CustomerRepository r) {
        this.r = r;
    }

    String displayName(Long id) {
        Optional<Customer> o = r.findById(id);
        if (o.isPresent() == true) {
            if (o.get().name() != null) {
                if (o.get().name().isBlank() == false) {
                    return o.get().name().trim();
                } else {
                    return "Customer #" + o.get().id();
                }
            } else {
                return "Customer #" + o.get().id();
            }
        }
        return null;
    }

    Optional<String> contactEmail(Long id) {
        Optional<Customer> o = r.findById(id);
        if (!o.isPresent()) return null;
        if (o.get().active()) {
            return Optional.of(o.get().email().toLowerCase());
        }
        return Optional.empty();
    }
}`,
      solution: `class CustomerService {

    private final CustomerRepository repository;

    CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    String displayName(Long id) {
        Customer customer = findOrThrow(id);
        String name = customer.name();
        if (name == null || name.isBlank()) {
            return "Customer #" + customer.id();
        }
        return name.trim();
    }

    Optional<String> contactEmail(Long id) {
        return repository.findById(id)
            .filter(Customer::active)
            .map(Customer::email)
            .map(String::trim)
            .filter(email -> !email.isEmpty())
            .map(String::toLowerCase);
    }

    private Customer findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new CustomerNotFoundException(id));
    }
}`,
      hints: [
        'Zwei Bugs laut Spezifikation: unbekannte id bei `displayName` und fehlende E-Mail bei `contactEmail`. Welche Zeilen verletzen das?',
        '`findById(id).orElseThrow(() -> new CustomerNotFoundException(id))` ersetzt `isPresent`/`get` und `return null`.',
        'Für `contactEmail`: `Optional` ist eine Pipeline – `filter(Customer::active)`, `map(Customer::email)` (liefert bei `null` automatisch `empty`), dann trimmen, leere herausfiltern, lowercase.',
        'Der Name-Fallback ist ein einziges `if (name == null || name.isBlank())` – keine Verschachtelung nötig.',
      ],
      tests: `var repo = new InMemoryCustomerRepository(List.of(
    new Customer(1L, "  Ada Lovelace ", " Ada@Example.com ", true),
    new Customer(2L, null, "bob@x.de", false),
    new Customer(3L, "   ", null, true),
    new Customer(4L, "Dora", "  ", true)));
var service = new CustomerService(repo);
check("Name getrimmt", "Ada Lovelace", service.displayName(1L));
check("null-Name Fallback", "Customer #2", service.displayName(2L));
check("blank-Name Fallback", "Customer #3", service.displayName(3L));
checkThrows("unbekannte id bei displayName", CustomerNotFoundException.class, () -> service.displayName(99L));
check("aktive E-Mail normalisiert", Optional.of("ada@example.com"), service.contactEmail(1L));
check("inaktiver Kunde -> empty", Optional.empty(), service.contactEmail(2L));
check("unbekannte id -> empty statt null", Optional.empty(), service.contactEmail(99L));
check("blank E-Mail -> empty", Optional.empty(), service.contactEmail(4L));
check("null E-Mail -> empty statt NPE", Optional.empty(), service.contactEmail(3L));`,
    },
    {
      id: 'k3',
      title: 'Typ-Kaskade durch enum mit Verhalten ersetzen',
      level: 3,
      description: `\`ShippingCalculator.cost\` ist eine \`if/else\`-Kaskade über einen \`String\`.

**Smells:** String-Typcode, Magic Numbers, \`double\` für Geld, \`return null\` für unbekannte Typen, case-sensitiver Vergleich, keine Validierung des Gewichts.

**Refactoring:** Führe ein \`enum ShippingType\` mit Feldern \`baseFee\` und \`perKg\` und einer Methode \`costFor(BigDecimal weightKg)\` ein (Replace Conditional with Polymorphism). \`cost\` delegiert nur noch.

**Spezifikation:**
- \`STANDARD\`: 4,90 + 0,50/kg · \`EXPRESS\`: 9,90 + 1,20/kg · \`PICKUP\`: 0
- Typ case-insensitive und getrimmt (\`" express "\` ist gültig)
- unbekannter Typ oder \`null\` → \`IllegalArgumentException\`
- Gewicht \`null\` oder negativ → \`IllegalArgumentException\`
- Ergebnis mit \`setScale(2, RoundingMode.HALF_UP)\``,
      starter: `class ShippingCalculator {
    static BigDecimal cost(String t, BigDecimal w) {
        double c = 0;
        if (t.equals("STANDARD")) {
            c = 4.9 + w.doubleValue() * 0.5;
        } else if (t.equals("EXPRESS")) {
            c = 9.9 + w.doubleValue() * 1.2;
        } else if (t.equals("PICKUP")) {
            c = 0;
        } else {
            return null;
        }
        return BigDecimal.valueOf(c).setScale(2, RoundingMode.HALF_UP);
    }
}`,
      solution: `enum ShippingType {
    STANDARD("4.90", "0.50"),
    EXPRESS("9.90", "1.20"),
    PICKUP("0.00", "0.00");

    private final BigDecimal baseFee;
    private final BigDecimal perKg;

    ShippingType(String baseFee, String perKg) {
        this.baseFee = new BigDecimal(baseFee);
        this.perKg = new BigDecimal(perKg);
    }

    BigDecimal costFor(BigDecimal weightKg) {
        return baseFee.add(perKg.multiply(weightKg));
    }

    static ShippingType parse(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("shipping type is required");
        }
        try {
            return valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("unknown shipping type: " + raw);
        }
    }
}

class ShippingCalculator {
    static BigDecimal cost(String type, BigDecimal weightKg) {
        if (weightKg == null || weightKg.signum() < 0) {
            throw new IllegalArgumentException("weight must be >= 0");
        }
        return ShippingType.parse(type).costFor(weightKg).setScale(2, RoundingMode.HALF_UP);
    }
}`,
      hints: [
        'Jeder Zweig der Kaskade unterscheidet sich nur durch zwei Zahlen – das sind Felder eines enums.',
        'enum-Konstruktor mit `String`-Parametern → `new BigDecimal(...)` vermeidet `double`-Ungenauigkeit. `costFor` = `baseFee + perKg * weight`.',
        'Parsing: `valueOf(raw.trim().toUpperCase())` wirft bei unbekanntem Namen schon `IllegalArgumentException` – `null` musst du vorher selbst prüfen.',
        '`cost`: erst Guard Clause fürs Gewicht (`signum() < 0`), dann `ShippingType.parse(type).costFor(weight).setScale(...)`.',
      ],
      tests: `check("STANDARD 2 kg", new BigDecimal("5.90"), ShippingCalculator.cost("STANDARD", new BigDecimal("2")));
check("EXPRESS 2.5 kg", new BigDecimal("12.90"), ShippingCalculator.cost("EXPRESS", new BigDecimal("2.5")));
check("PICKUP kostet nichts", new BigDecimal("0.00"), ShippingCalculator.cost("PICKUP", new BigDecimal("10")));
check("0 kg nur Grundgebühr", new BigDecimal("4.90"), ShippingCalculator.cost("STANDARD", BigDecimal.ZERO));
check("case-insensitive + trim", new BigDecimal("10.50"), ShippingCalculator.cost(" express ", new BigDecimal("0.5")));
checkThrows("unbekannter Typ", IllegalArgumentException.class, () -> ShippingCalculator.cost("DRONE", BigDecimal.ONE));
checkThrows("null Typ", IllegalArgumentException.class, () -> ShippingCalculator.cost(null, BigDecimal.ONE));
checkThrows("negatives Gewicht", IllegalArgumentException.class, () -> ShippingCalculator.cost("STANDARD", new BigDecimal("-1")));`,
    },
    {
      id: 'k4',
      title: 'Validator: Duplikation und Grenzwert-Bugs',
      level: 3,
      description: `\`RegistrationValidator.validate\` liefert die Namen aller ungültigen Felder (Reihenfolge: \`username\`, \`email\`, \`password\`, \`age\`). Er ist verschachtelt, dupliziert und hat **Off-by-one-Bugs**.

**Smells:** verschachtelte \`if/else\` mit leeren Zweigen, dreifach wiederholte Null-Checks, Magic Numbers (\`3\`, \`20\`, \`8\`, \`18\`), Flag-Variable in Schleife, Einbuchstaben-Namen.

**Spezifikation:**
- \`username\`: nicht \`null\`, getrimmt 3–20 Zeichen (inklusive)
- \`email\`: nicht \`null\`, enthält \`@\`, beginnt und endet nicht mit \`@\`
- \`password\`: mindestens **8** Zeichen (8 ist gültig) und mindestens eine Ziffer
- \`age\`: mindestens **18** (18 ist gültig)
- Rückgabe: unveränderliche Liste

Ziel: Konstanten, je eine kleine Prüfmethode pro Feld (\`isValidUsername\`, ...), keine leeren Zweige, \`chars().anyMatch(Character::isDigit)\`.`,
      given: `record RegistrationRequest(String username, String email, String password, int age) {}`,
      starter: `class RegistrationValidator {
    static List<String> validate(RegistrationRequest r) {
        List<String> e = new ArrayList<>();
        if (r.username() != null) {
            if (r.username().trim().length() < 3 || r.username().trim().length() > 20) {
                e.add("username");
            }
        } else {
            e.add("username");
        }
        if (r.email() != null) {
            if (!r.email().contains("@")) {
                e.add("email");
            } else {
                if (r.email().startsWith("@") || r.email().endsWith("@")) {
                    e.add("email");
                }
            }
        } else {
            e.add("email");
        }
        if (r.password() != null) {
            if (r.password().length() > 8) {
                boolean d = false;
                for (char c : r.password().toCharArray()) {
                    if (Character.isDigit(c)) {
                        d = true;
                    }
                }
                if (!d) {
                    e.add("password");
                }
            } else {
                e.add("password");
            }
        } else {
            e.add("password");
        }
        if (r.age() > 18) {
        } else {
            e.add("age");
        }
        return e;
    }
}`,
      solution: `class RegistrationValidator {

    private static final int MIN_USERNAME_LENGTH = 3;
    private static final int MAX_USERNAME_LENGTH = 20;
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MIN_AGE = 18;

    static List<String> validate(RegistrationRequest request) {
        List<String> invalidFields = new ArrayList<>();
        if (!isValidUsername(request.username())) invalidFields.add("username");
        if (!isValidEmail(request.email())) invalidFields.add("email");
        if (!isValidPassword(request.password())) invalidFields.add("password");
        if (request.age() < MIN_AGE) invalidFields.add("age");
        return List.copyOf(invalidFields);
    }

    private static boolean isValidUsername(String username) {
        if (username == null) return false;
        int length = username.trim().length();
        return length >= MIN_USERNAME_LENGTH && length <= MAX_USERNAME_LENGTH;
    }

    private static boolean isValidEmail(String email) {
        return email != null
            && email.contains("@")
            && !email.startsWith("@")
            && !email.endsWith("@");
    }

    private static boolean isValidPassword(String password) {
        return password != null
            && password.length() >= MIN_PASSWORD_LENGTH
            && password.chars().anyMatch(Character::isDigit);
    }
}`,
      hints: [
        'Vergleiche jede Grenzbedingung mit der Spezifikation: "mindestens 8" heißt `>= 8`, nicht `> 8`. Gleiches bei `age`.',
        'Pro Feld eine `boolean isValidX(...)`-Methode – der Null-Check wird dort zum ersten Teil einer `&&`-Kette.',
        '`password.chars().anyMatch(Character::isDigit)` ersetzt Schleife und Flag.',
        'Am Ende `List.copyOf(invalidFields)` für eine unveränderliche Rückgabe.',
      ],
      tests: `check("alles gültig", List.of(), RegistrationValidator.validate(new RegistrationRequest("ada", "ada@x.de", "secret12", 30)));
check("Grenzwerte gültig (8 Zeichen, 18 Jahre)", List.of(), RegistrationValidator.validate(new RegistrationRequest("bob", "b@x.de", "abcdefg1", 18)));
check("alles null/ungültig", List.of("username", "email", "password", "age"), RegistrationValidator.validate(new RegistrationRequest(null, null, null, 17)));
check("username zu kurz nach trim", List.of("username"), RegistrationValidator.validate(new RegistrationRequest("  ab  ", "a@x.de", "password1", 20)));
check("username 20 Zeichen ok", List.of(), RegistrationValidator.validate(new RegistrationRequest("abcdefghijabcdefghij", "a@x.de", "password1", 20)));
check("email endet mit @", List.of("email"), RegistrationValidator.validate(new RegistrationRequest("ada", "ada@", "password1", 20)));
check("passwort ohne Ziffer", List.of("password"), RegistrationValidator.validate(new RegistrationRequest("ada", "a@x.de", "passwordlong", 20)));
checkThrows("Ergebnis unveränderlich", UnsupportedOperationException.class, () -> RegistrationValidator.validate(new RegistrationRequest("ada", "a@x.de", "password1", 20)).add("x"));`,
    },
  ],
}

export default chapter
