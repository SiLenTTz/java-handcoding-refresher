# Kapitel 15 – Design Patterns

## Mental Model

Ein Pattern ist eine **benannte Antwort auf ein wiederkehrendes Designproblem** – kein Feature, das man einbaut, weil man es kennt. Der Wert liegt zu 50 % in der Struktur und zu 50 % im gemeinsamen Vokabular („das machen wir per Strategy“).

```text
Problem  →  Pattern  →  Preis

Verhalten variiert         → Strategy / Template Method   (mehr Typen)
Erzeugung ist kompliziert  → Factory / Builder            (Indirektion)
Fremde API passt nicht     → Adapter                      (Mapping-Schicht)
Verhalten anreichern       → Decorator                    (Schichten im Stack)
Subsystem zu komplex       → Facade                       (weniger Feinsteuerung)
Lose Kopplung bei Ereignis → Observer / Events            (Ablauf schwerer lesbar)
```

Leitfrage vor jedem Pattern: **Welches konkrete Änderungsszenario wird dadurch billiger?** Gibt es keins, ist es Over-Engineering (YAGNI). In Spring Boot sind viele Patterns bereits eingebaut – Singleton, Factory, Proxy, Template, Repository liefert der Container.

## Verhaltensmuster

### Strategy

**Problem:** Eine Berechnung hat mehrere austauschbare Varianten; `if`/`switch`-Kaskaden wachsen mit jeder neuen Variante (Open/Closed verletzt).

**Lösung:** Variante hinter ein Interface, Auswahl zur Laufzeit.

```java
@FunctionalInterface
interface DiscountStrategy { BigDecimal apply(BigDecimal amount); }

private static final Map<CustomerType, DiscountStrategy> STRATEGIES = Map.of(
    CustomerType.STANDARD, amount -> amount,
    CustomerType.PREMIUM,  amount -> amount.multiply(new BigDecimal("0.90")),
    CustomerType.VIP,      amount -> amount.multiply(new BigDecimal("0.80")));

BigDecimal finalPrice(BigDecimal amount, CustomerType type) {
    return STRATEGIES.get(type).apply(amount).setScale(2, RoundingMode.HALF_UP);
}
```

Ist die Strategie zustandslos, genügt ein Lambda – keine eigene Klasse pro Variante.
**Spring:** Mehrere `@Component`-Implementierungen eines Interfaces lassen sich als `List<DiscountStrategy>` oder `Map<String, DiscountStrategy>` (Bean-Name als Key) injizieren.

### Template Method

**Problem:** Mehrere Abläufe sind bis auf einzelne Schritte identisch; das Gerüst würde dupliziert.

**Lösung:** Ablauf in einer `final`-Methode der Basisklasse, variable Schritte als `abstract`/`protected`.

```java
abstract class ImportJob {

    final ImportResult run(Path file) {                // final: der Ablauf ist fix
        var records = parse(read(file));
        validate(records);
        return store(records);
    }

    protected String read(Path file) { ... }           // Default, überschreibbar
    protected abstract List<Record> parse(String raw); // Variationspunkt
    protected void validate(List<Record> records) { }  // Hook, optional
    protected abstract ImportResult store(List<Record> records);
}
```

**Spring:** `JdbcTemplate`, `RestClient`, `TransactionTemplate` sind Template Method in Callback-Form – das Framework steuert den Ablauf, du lieferst den variablen Teil als Lambda.

### Observer / Events

**Problem:** Beim Auslösen eines Ereignisses sollen beliebig viele Empfänger reagieren, ohne dass der Sender sie kennt.

```java
record OrderPlaced(Long orderId, BigDecimal total) {}

@Transactional
public void place(Order order) {
    repository.save(order);
    events.publishEvent(new OrderPlaced(order.id(), order.total()));
}

@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
void on(OrderPlaced event) { invoices.create(event.orderId()); }
```

**Preis:** Der Ablauf ist nicht mehr linear lesbar. Für Kernlogik lieber ein direkter Methodenaufruf; Events für Nebeneffekte (Mail, Audit, Cache-Invalidierung).

## Erzeugungsmuster

### Static Factory Method

**Problem:** Konstruktoren haben keinen Namen, können nicht cachen und liefern immer den exakten Typ.

```java
static Money ofEuro(String amount) {
    return new Money(new BigDecimal(amount), Currency.getInstance("EUR"));
}
```

Bekannte Beispiele: `List.of`, `Optional.of`, `Integer.valueOf` (cacht −128..127), `Duration.ofSeconds`.

### Factory (Auswahl des Typs)

**Problem:** Der konkrete Typ hängt von einer Eingabe ab; Aufrufer sollen `new` nicht kennen.

```java
sealed interface PaymentProcessor permits CardProcessor, PaypalProcessor, InvoiceProcessor {
    PaymentResult pay(Order order);
}

PaymentProcessor create(PaymentType type) {
    return switch (type) {                       // erschöpfend, kein default nötig
        case CARD    -> new CardProcessor();
        case PAYPAL  -> new PaypalProcessor();
        case INVOICE -> new InvoiceProcessor();
    };
}

static double area(Shape shape) {                // Pattern Matching auf den Typ
    return switch (shape) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Rect r   -> r.w() * r.h();
    };
}
```

Vergisst du später eine neue Variante, bricht der Build statt der Produktion.
**Spring:** `@Configuration` + `@Bean`-Methoden sind Factories; `ObjectProvider` für dynamische Fälle.

### Builder

**Problem:** Viele (teils optionale) Parameter → Teleskop-Konstruktoren und `new Order(null, null, 3, true)` am Aufrufort.

```java
// in record Order(String customer, List<String> items, String note, boolean express):
static Builder builder(String customer) { return new Builder(customer); }

static final class Builder {
    private final String customer;
    private final List<String> items = new ArrayList<>();
    private String note = "";
    private boolean express;

    Builder item(String item) { items.add(item); return this; }
    Builder note(String note) { this.note = note; return this; }
    Builder express()         { this.express = true; return this; }

    Order build() {
        if (items.isEmpty()) throw new IllegalStateException("mindestens eine Position");
        return new Order(customer, List.copyOf(items), note, express);
    }
}

var order = Order.builder("Anna").item("Buch").item("Stift").express().build();
```

Pflichtfelder in den `builder(...)`-Aufruf, Optionales als Methoden, Validierung in `build()`.
Verwandte Beispiele: `Stream.builder()`, `HttpRequest.newBuilder()`, Lomboks `@Builder`.

### Singleton – und warum das in Spring der Container macht

```java
enum Config { INSTANCE;                       // sicherste klassische Variante
    private final Properties properties = load();
}
```

Klassische Singletons sind schwer testbar (globaler Zustand, keine Ersetzbarkeit). In Spring haben Beans **per Default Singleton-Scope**, werden aber **injiziert** statt global geholt – Einmaligkeit ohne Testbarkeitsprobleme. Achtung: Singleton-Beans müssen **zustandslos** (oder thread-safe) sein.

## Strukturmuster

### Adapter

**Problem:** Eine fremde API hat die falsche Form; du willst sie nicht in deine Domain lassen.

```java
interface SmsSender { void send(String phone, String text); }   // unsere Sprache

class TwilioAdapter implements SmsSender {                      // fremde Sprache gekapselt
    private final TwilioClient client;

    @Override public void send(String phone, String text) {
        client.messages().create(new TwilioMessage("+49" + phone, text, "SHOP"));
    }
}
```

So bleibt der Fremd-Typ an genau einer Stelle; ein Anbieterwechsel kostet eine Klasse.

### Decorator

**Problem:** Verhalten soll ergänzt werden (Logging, Caching, Retry), ohne die Originalklasse zu ändern.

```java
class CachingPriceService implements PriceService {
    private final PriceService delegate;                        // gleiches Interface
    private final Map<Long, BigDecimal> cache = new HashMap<>();

    @Override public BigDecimal priceOf(Long productId) {
        return cache.computeIfAbsent(productId, delegate::priceOf);
    }
}
```

JDK-Beispiel: `new BufferedReader(new InputStreamReader(in))`. In Spring sind `@Transactional`, `@Cacheable` und `@Async` Decorators als **Proxy** – deshalb wirken sie nicht bei Selbstaufrufen innerhalb derselben Bean.

### Facade

**Problem:** Ein Use Case braucht fünf Subsysteme; jeder Aufrufer müsste die Reihenfolge kennen.

```java
@Transactional
public OrderConfirmation checkout(CheckoutRequest request) {
    inventory.reserve(request.items());
    var payment = payments.charge(request.payment());
    var order = orders.save(Order.from(request, payment));
    shipping.schedule(order);
    return OrderConfirmation.from(order);
}
```

Ein Application-Service ist im Kern eine Facade über die Domain. Gefahr: Sie wird zur God-Class – lieber eine Facade pro Use-Case-Gruppe.

### Repository

**Problem:** Fachlogik soll nicht wissen, ob die Daten aus SQL, einem REST-Service oder dem Speicher kommen.

```java
interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    Page<UserEntity> findByActiveTrue(Pageable pageable);
}
```

Das Interface gehört fachlich zur Domain, die Implementierung zur Infrastruktur – bei Spring Data wird sie zur Laufzeit als Proxy generiert. Rückgabe: `Optional` für Einzeltreffer, leere `List`/`Page` statt `null`.

### Dependency Injection als Pattern

**Problem:** `new` im Inneren einer Klasse verdrahtet sie fest mit einer Implementierung – nicht ersetzbar, nicht testbar.

```java
class OrderService {
    private final MailSender mailer = new SmtpMailSender();    // FALSCH: fest verdrahtet
}

@Service
class OrderService {                                           // RICHTIG
    private final MailSender mailer;
    OrderService(MailSender mailer) { this.mailer = mailer; }
}
```

DI setzt **Inversion of Control** um und ist die Grundlage für Strategy, Decorator und Adapter im Spring-Kontext. Konstruktor-Injection > Field-Injection: Felder können `final` sein, fehlende Abhängigkeiten fallen beim Start auf, und die Klasse bleibt ohne Container testbar.

## Häufige Fehler

```java
// FALSCH: Strategy-Klassenexplosion für zustandslose Einzeiler
class TenPercentDiscount implements DiscountStrategy { ... }
class TwentyPercentDiscount implements DiscountStrategy { ... }
// RICHTIG: Lambda oder Enum mit Verhalten
enum Discount { PREMIUM(new BigDecimal("0.90")), VIP(new BigDecimal("0.80")); ... }
```

```java
// FALSCH: Singleton mit globalem Zugriff → untestbar
var service = PriceService.getInstance();
// RICHTIG: Bean injizieren lassen
OrderService(PriceService priceService) { this.priceService = priceService; }
```

```java
// FALSCH: @Transactional greift bei Selbstaufruf nicht (Proxy wird umgangen)
public void outer() { this.inner(); }
@Transactional public void inner() { ... }
// RICHTIG: inner in eine eigene Bean verschieben
```

Weitere Klassiker: ein Builder für drei Pflichtfelder (Record-Konstruktor reicht), eine Factory, die nichts entscheidet, und eine Facade mit 40 Methoden über alle Domänen.

## Interview-relevante Details

- **Strategy vs. Template Method**: Strategy tauscht per **Komposition** (zur Laufzeit), Template Method per **Vererbung** (zur Compilezeit). Komposition ist flexibler und testbarer.
- **Strategy vs. Enum mit Verhalten**: Enum bei kleiner, fixer Menge ohne Abhängigkeiten; Strategy, wenn Implementierungen Beans brauchen oder erweiterbar sein sollen.
- **Factory vs. Builder**: Factory entscheidet **welcher Typ**, Builder **wie zusammengesetzt**.
- **Decorator vs. Proxy**: Beide wrappen. Decorator ergänzt Funktionalität, Proxy kontrolliert Zugriff/Lebenszyklus (Spring AOP).
- **Warum ist Singleton oft ein Anti-Pattern?** Globaler Zustand, versteckte Abhängigkeit, schwer testbar, Thread-Safety-Fallen. Spring löst Einmaligkeit über Scope + Injection.
- **Welche Patterns steckt Spring an?** Singleton (Bean-Scope), Factory (`@Bean`), Proxy/Decorator (`@Transactional`, `@Cacheable`), Template (`JdbcTemplate`), Observer (`ApplicationEvent`), Repository, DI/IoC.
- **Sealed + Pattern Matching** als moderne Alternative zum Visitor: erschöpfende `switch`-Ausdrücke statt `accept(visitor)`.
- **Wann kein Pattern?** Wenn es nur eine Variante gibt und keine zweite absehbar ist – KISS und YAGNI schlagen Symmetrie.

## Zusammenfassung

```text
Strategy        Verhalten austauschbar     → Interface/Lambda, Map<Enum, Strategy>
Template Method Ablauf fix, Schritte offen → final run() + abstract Schritte
Observer        entkoppelte Reaktion       → ApplicationEventPublisher
Static Factory  benannte Erzeugung         → Money.ofEuro(...)
Factory         Typ hängt von Eingabe ab   → sealed + switch (erschöpfend)
Builder         viele optionale Felder     → fluent + Validierung in build()
Singleton       genau eine Instanz         → in Spring: Bean-Scope + Injection
Adapter         fremde API übersetzen      → eigenes Interface, Fremdtyp gekapselt
Decorator       Verhalten ergänzen         → gleiches Interface + delegate
Facade          Subsysteme bündeln         → Application-Service
Repository      Persistenz abstrahieren    → Optional/Page, kein null
DI              Abhängigkeit von außen     → Konstruktor-Injection, final

Pattern nur einsetzen, wenn ein konkretes Änderungsszenario dadurch billiger wird.
```
