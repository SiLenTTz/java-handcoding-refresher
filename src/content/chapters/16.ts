import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '16',
  flashcards: [
    {
      id: 'f1',
      front: 'Was bedeutet **Inversion of Control** vs. **Dependency Injection**?',
      back: 'IoC = Prinzip: nicht deine Klasse, sondern das Framework steuert Objekterzeugung und -verdrahtung. DI = konkrete Technik dafür: Abhängigkeiten werden von außen hereingereicht (Konstruktor, Setter, Feld).',
    },
    {
      id: 'f2',
      front: 'Schreibe einen `UserService` mit Constructor Injection für `UserRepository` und `UserMapper`.',
      back: `\`\`\`java
@Service
public class UserService {
    private final UserRepository repository;
    private final UserMapper mapper;

    public UserService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
}
\`\`\``,
    },
    {
      id: 'f3',
      front: 'Nenne 4 Vorteile von Constructor Injection gegenüber Field Injection.',
      back: '1. Felder können `final` sein (immutable)\n2. Pflicht-Abhängigkeiten sind sichtbar\n3. Ohne Spring testbar: `new UserService(fakeRepo)`\n4. Objekt ist nie halb initialisiert; zirkuläre Abhängigkeiten fallen beim Start auf',
    },
    {
      id: 'f4',
      front: 'Wann ist `@Autowired` auf dem Konstruktor nötig?',
      back: 'Nur wenn die Klasse **mehrere** Konstruktoren hat. Bei genau einem Konstruktor injiziert Spring automatisch (seit 4.3).',
    },
    {
      id: 'f5',
      front: 'Unterschied `@Component` vs. `@Bean`?',
      back: '`@Component` (und `@Service`, `@Repository`, `@Controller`) kommt auf **eigene Klassen** und wird per Component Scan gefunden. `@Bean` steht auf einer **Factory-Methode** in einer `@Configuration`-Klasse – für Fremdklassen oder wenn Erzeugungslogik nötig ist.',
    },
    {
      id: 'f6',
      front: 'Was steckt in `@SpringBootApplication`?',
      back: '`@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` (Package der Klasse und alle Unterpackages).',
    },
    {
      id: 'f7',
      front: 'Was ist der Default-Scope einer Spring Bean und was folgt daraus?',
      back: '**Singleton** – eine Instanz pro ApplicationContext. Die Bean wird von allen Threads/Requests geteilt → **stateless** halten, keine request-spezifischen Daten in Feldern.',
    },
    {
      id: 'f8',
      front: 'Es gibt zwei Beans vom Typ `PaymentProvider`. Welche Möglichkeiten hast du, um Mehrdeutigkeit aufzulösen?',
      back: '- `@Primary` auf der Default-Implementierung\n- `@Qualifier("paypal")` am Injection Point\n- alle injizieren: `List<PaymentProvider>` oder `Map<String, PaymentProvider>` (Bean-Name → Bean)',
    },
    {
      id: 'f9',
      front: 'Welche Exception wirft Spring, wenn zwei passende Beans existieren und nichts disambiguiert?',
      back: '`NoUniqueBeanDefinitionException` (Unterklasse von `NoSuchBeanDefinitionException`). Fehlt eine Bean ganz: `NoSuchBeanDefinitionException`.',
    },
    {
      id: 'f10',
      front: 'Wie injizierst du mehrere Konfigurationswerte typsicher?',
      back: `\`\`\`java
@ConfigurationProperties(prefix = "app.mail")
public record MailProperties(String from, Duration timeout) {}
\`\`\`
Aktivieren über \`@EnableConfigurationProperties(MailProperties.class)\` oder \`@ConfigurationPropertiesScan\`.`,
    },
    {
      id: 'f11',
      front: 'Warum sollte man `Clock` injizieren statt `LocalDateTime.now()` aufzurufen?',
      back: 'Zeit ist eine versteckte Abhängigkeit. Mit injiziertem `Clock` (`LocalDateTime.now(clock)`) kann der Test `Clock.fixed(...)` übergeben → deterministische Tests.',
    },
    {
      id: 'f12',
      front: 'Was passiert bei einer zirkulären Abhängigkeit A → B → A mit Constructor Injection?',
      back: 'Der Context-Start schlägt fehl (`BeanCurrentlyInCreationException`; seit Boot 2.6 sind Zyklen standardmäßig verboten). Lösung: Design ändern – gemeinsame Logik in eine dritte Klasse extrahieren.',
    },
    {
      id: 'f13',
      front: 'Was macht `@Repository` zusätzlich zu `@Component`?',
      back: '**Exception Translation**: technische Persistence-Exceptions werden in Springs `DataAccessException`-Hierarchie übersetzt. Spring-Data-Repository-Interfaces brauchen die Annotation nicht.',
    },
    {
      id: 'f14',
      front: 'Warum bekommt ein anderer Service oft nicht deine Klasse, sondern einen **Proxy** injiziert?',
      back: 'Für Querschnittsfunktionen wie `@Transactional`, `@Async`, `@Cacheable` erzeugt Spring einen Proxy, der Aufrufe abfängt und dann an dein Objekt delegiert. Nur Aufrufe **über den Proxy** bekommen das Verhalten (→ Self-Invocation-Problem).',
    },
    {
      id: 'f15',
      front: 'Wie injizierst du eine **optionale** Abhängigkeit?',
      back: '`ObjectProvider<T>` (`getIfAvailable()`), `Optional<T>` als Konstruktor-Parameter oder Setter Injection. Pflicht-Abhängigkeiten immer über den Konstruktor.',
    },
    {
      id: 'f16',
      front: 'Code Smell: Dein Service-Konstruktor hat 9 Parameter. Was sagt das aus?',
      back: 'Die Klasse hat vermutlich zu viele Verantwortungen (SRP-Verletzung). Aufteilen in fachlich kohäsive Services statt auf Field Injection auszuweichen (das versteckt das Problem nur).',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Injection-Variante ist für Pflicht-Abhängigkeiten empfohlen?',
      options: ['Field Injection mit `@Autowired`', 'Setter Injection', 'Constructor Injection', 'Service Locator über `ApplicationContext.getBean`'],
      correct: 2,
      explanation: 'Constructor Injection erlaubt `final`-Felder, macht Abhängigkeiten explizit und die Klasse ohne Spring testbar. Setter Injection nur für optionale Abhängigkeiten; Service Locator versteckt Abhängigkeiten.',
    },
    {
      id: 'q2',
      prompt: 'Muss hier `@Autowired` stehen, damit Spring injiziert?',
      code: `@Service
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }
}`,
      options: ['Ja, sonst wird `repository` `null`', 'Nein, bei genau einem Konstruktor injiziert Spring automatisch', 'Nur wenn `OrderRepository` ein Interface ist', 'Nur wenn das Feld nicht `final` ist'],
      correct: 1,
      explanation: 'Seit Spring 4.3 wird ein einzelner Konstruktor automatisch für Injection verwendet. `@Autowired` braucht man nur, wenn es mehrere Konstruktoren gibt.',
    },
    {
      id: 'q3',
      prompt: 'Zwei Klassen implementieren `NotificationSender`, keine ist annotiert mit `@Primary`/`@Qualifier`. Ein Service verlangt `NotificationSender sender` im Konstruktor (Parametername passt auf keinen Bean-Namen). Was passiert?',
      options: ['Spring nimmt die zuerst gefundene Bean', 'Der Service bekommt `null`', 'Spring injiziert eine `List`', 'Start schlägt fehl mit `NoUniqueBeanDefinitionException`'],
      correct: 3,
      explanation: 'Bei mehreren Kandidaten ohne `@Primary`, `@Qualifier` oder passenden Parameternamen kann Spring nicht entscheiden und bricht den Context-Start ab.',
    },
    {
      id: 'q4',
      prompt: 'Was ist das Problem an diesem Service?',
      code: `@Service
public class ImportService {
    private final List<String> errors = new ArrayList<>();

    public ImportResult importFile(Path file) {
        errors.clear();
        // ... errors.add(...)
        return new ImportResult(errors);
    }
}`,
      options: ['`final` Listen dürfen nicht verändert werden', 'Singleton-Bean mit veränderlichem Zustand – parallele Requests teilen sich `errors`', '`@Service` darf keine Felder haben', 'Keins – `clear()` setzt den Zustand ja zurück'],
      correct: 1,
      explanation: 'Beans sind standardmäßig Singletons und werden von allen Threads geteilt. `errors` gehört als lokale Variable in die Methode.',
    },
    {
      id: 'q5',
      prompt: 'Du willst `java.time.Clock` als Bean bereitstellen. Wie?',
      options: ['`@Component` auf `Clock` setzen', '`@Bean`-Methode in einer `@Configuration`-Klasse', '`@Autowired Clock clock = Clock.systemUTC();`', '`@Value("clock")`'],
      correct: 1,
      explanation: 'Fremdklassen kannst du nicht annotieren. Dafür gibt es `@Bean`-Factory-Methoden: `@Bean Clock clock() { return Clock.systemUTC(); }`.',
    },
    {
      id: 'q6',
      prompt: 'Was injiziert Spring für diesen Parameter?',
      code: `public CheckoutService(Map<String, PaymentProvider> providers) { ... }`,
      options: ['Nichts, `Map` ist kein gültiger Injection-Typ', 'Eine leere Map, die man selbst füllen muss', 'Alle `PaymentProvider`-Beans, Key = Bean-Name', 'Nur die `@Primary`-Bean unter dem Key `"primary"`'],
      correct: 2,
      explanation: 'Spring kann alle Beans eines Typs als `List<T>` oder `Map<String, T>` (Bean-Name → Instanz) injizieren – ideal für Strategy-Pattern.',
    },
    {
      id: 'q7',
      prompt: 'Welche Aussage zu `@Service` ist korrekt?',
      options: ['Er startet automatisch eine Transaktion', 'Er ist technisch ein `@Component` mit semantischer Bedeutung', 'Er macht die Klasse zu einem Prototype-Scope', 'Er ist nötig, damit `@Transactional` funktioniert'],
      correct: 1,
      explanation: '`@Service` ist mit `@Component` meta-annotiert und hat keine eigene Technik – er dokumentiert die Rolle im Business Layer.',
    },
    {
      id: 'q8',
      prompt: 'Warum ist dieser Code problematisch?',
      code: `@RestController
public class UserController {
    private final UserService service = new UserService(new JpaUserRepository());
}`,
      options: ['`new` ist in Java 21 deprecated', 'Die Instanz ist keine Spring Bean: keine Proxies (`@Transactional`), keine Injection, nicht austauschbar im Test', 'Controller dürfen keine Services kennen', 'Nur ein Stilproblem, funktional identisch'],
      correct: 1,
      explanation: 'Mit `new` umgehst du den Container. Der Service bekommt keine Proxies und keine injizierten Abhängigkeiten, und der Controller ist fest an konkrete Implementierungen gekoppelt.',
    },
    {
      id: 'q9',
      prompt: 'Wie löst du die zirkuläre Abhängigkeit `OrderService ↔ InvoiceService` am saubersten?',
      options: ['Auf Field Injection wechseln', '`@Lazy` an einen Parameter setzen', 'Gemeinsame Logik in eine dritte Klasse extrahieren, von der beide abhängen', '`spring.main.allow-circular-references=true` setzen'],
      correct: 2,
      explanation: 'Zyklen sind ein Designproblem. `@Lazy` oder das Property verschieben das Problem nur. Die gemeinsame Verantwortung in eine eigene Komponente zu ziehen, bricht den Zyklus auf.',
    },
    {
      id: 'q10',
      prompt: 'Welche Annotation übersetzt Persistence-Exceptions in `DataAccessException`?',
      options: ['`@Service`', '`@Component`', '`@Configuration`', '`@Repository`'],
      correct: 3,
      explanation: '`@Repository` aktiviert Exception Translation über einen Post-Processor. Spring-Data-Repositories haben das bereits eingebaut.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Mini-DI-Container mit Singleton-Scope',
      level: 3,
      description: `Baue einen minimalen IoC-Container, um zu verstehen, was Spring beim Start tut.

\`MiniContainer\`:
- \`register(Class<T> type, Function<MiniContainer, ? extends T> factory)\` registriert eine Factory (noch **keine** Instanz erzeugen – lazy).
- \`get(Class<T> type)\` liefert die Bean. Beim ersten Aufruf wird die Factory ausgeführt (die Factory darf selbst \`container.get(...)\` für ihre Abhängigkeiten aufrufen), danach wird **immer dieselbe Instanz** zurückgegeben (Singleton).
- Unbekannter Typ → \`BeanNotFoundException\`.

Verdrahtet wird dann z. B. so:
\`\`\`java
container.register(GreetingService.class, c -> new GreetingService(c.get(GreetingRepository.class)));
\`\`\``,
      given: `interface GreetingRepository {
    String findGreeting(String lang);
}

class InMemoryGreetingRepository implements GreetingRepository {
    private final Map<String, String> greetings = Map.of("de", "Hallo", "en", "Hello");
    public String findGreeting(String lang) {
        return greetings.getOrDefault(lang, "Hi");
    }
}

class GreetingService {
    private final GreetingRepository repository;
    GreetingService(GreetingRepository repository) {
        this.repository = repository;
    }
    GreetingRepository repository() {
        return repository;
    }
    String greet(String name, String lang) {
        return repository.findGreeting(lang) + ", " + name + "!";
    }
}

class BeanNotFoundException extends RuntimeException {
    BeanNotFoundException(String message) {
        super(message);
    }
}`,
      starter: `class MiniContainer {

    <T> void register(Class<T> type, Function<MiniContainer, ? extends T> factory) {
        // TODO: Factory merken (noch nicht aufrufen!)
    }

    <T> T get(Class<T> type) {
        // TODO: Singleton aus Cache liefern oder per Factory erzeugen
        return null;
    }
}`,
      solution: `class MiniContainer {
    private final Map<Class<?>, Function<MiniContainer, ?>> factories = new HashMap<>();
    private final Map<Class<?>, Object> singletons = new HashMap<>();

    <T> void register(Class<T> type, Function<MiniContainer, ? extends T> factory) {
        factories.put(type, factory);
    }

    <T> T get(Class<T> type) {
        Object existing = singletons.get(type);
        if (existing != null) {
            return type.cast(existing);
        }
        Function<MiniContainer, ?> factory = factories.get(type);
        if (factory == null) {
            throw new BeanNotFoundException("No bean of type " + type.getSimpleName());
        }
        T bean = type.cast(factory.apply(this));
        singletons.put(type, bean);
        return bean;
    }
}`,
      hints: [
        'Du brauchst zwei Maps: eine für die registrierten Factories und eine als Cache für bereits erzeugte Singletons.',
        '`Map<Class<?>, Function<MiniContainer, ?>>` und `Map<Class<?>, Object>`. Für den typsicheren Rückgabewert: `type.cast(obj)`.',
        'get: Cache-Treffer → zurückgeben. Sonst Factory holen (fehlt → Exception), `factory.apply(this)` aufrufen, Ergebnis cachen, zurückgeben.',
        'Vorsicht mit `singletons.computeIfAbsent(...)`: Die Factory ruft rekursiv `get` auf und verändert dieselbe `HashMap` → `ConcurrentModificationException`. Lieber explizit `get` + `put`.',
      ],
      tests: `int[] repoCreations = {0};
MiniContainer c = new MiniContainer();
c.register(GreetingRepository.class, x -> { repoCreations[0]++; return new InMemoryGreetingRepository(); });
c.register(GreetingService.class, x -> new GreetingService(x.get(GreetingRepository.class)));
check("lazy: noch nichts erzeugt", 0, repoCreations[0]);
GreetingService service = c.get(GreetingService.class);
checkTrue("Service erzeugt", service != null);
check("Abhängigkeit verdrahtet", "Hallo, Ada!", service.greet("Ada", "de"));
checkTrue("Singleton: gleiche Instanz", service == c.get(GreetingService.class));
GreetingRepository repo = c.get(GreetingRepository.class);
checkTrue("Service nutzt die Singleton-Repository-Instanz", service.repository() == repo);
check("Factory genau einmal aufgerufen", 1, repoCreations[0]);
checkThrows("unbekannter Typ", BeanNotFoundException.class, () -> c.get(String.class));
MiniContainer empty = new MiniContainer();
checkThrows("leerer Container", BeanNotFoundException.class, () -> empty.get(GreetingService.class));`,
    },
    {
      id: 'k2',
      title: 'Constructor Injection mit Clock und Fail-Fast',
      level: 2,
      description: `Implementiere \`WelcomeService\` mit **Constructor Injection** für \`MailSender\` und \`java.time.Clock\`.

- Beide Felder \`private final\`. Ist eine Abhängigkeit \`null\` → sofort \`NullPointerException\` (Fail-Fast mit \`Objects.requireNonNull\`).
- \`sendWelcome(User user)\`:
  - E-Mail \`null\` oder blank → \`IllegalArgumentException\`, es wird nichts gesendet.
  - Betreff: \`"Willkommen, <name>"\`
  - Text: \`"Registriert am <yyyy-MM-dd>"\` – das Datum kommt aus der injizierten \`Clock\` (\`LocalDate.now(clock)\`), niemals aus der Systemzeit.`,
      given: `interface MailSender {
    void send(String to, String subject, String body);
}

class RecordingMailSender implements MailSender {
    final List<String> sent = new ArrayList<>();
    public void send(String to, String subject, String body) {
        sent.add(to + "|" + subject + "|" + body);
    }
}

record User(String email, String name) {}`,
      starter: `class WelcomeService {
    private final MailSender mailSender;
    private final Clock clock;

    WelcomeService(MailSender mailSender, Clock clock) {
        // TODO: Fail-Fast bei null
        this.mailSender = mailSender;
        this.clock = clock;
    }

    void sendWelcome(User user) {
        // TODO
    }
}`,
      solution: `class WelcomeService {
    private final MailSender mailSender;
    private final Clock clock;

    WelcomeService(MailSender mailSender, Clock clock) {
        this.mailSender = Objects.requireNonNull(mailSender, "mailSender");
        this.clock = Objects.requireNonNull(clock, "clock");
    }

    void sendWelcome(User user) {
        if (user.email() == null || user.email().isBlank()) {
            throw new IllegalArgumentException("email must not be blank");
        }
        String subject = "Willkommen, " + user.name();
        String body = "Registriert am " + LocalDate.now(clock);
        mailSender.send(user.email(), subject, body);
    }
}`,
      hints: [
        'Constructor Injection: Abhängigkeiten kommen als Parameter rein und werden in `final`-Feldern gespeichert. Fail-Fast heißt: ungültige Abhängigkeiten schon im Konstruktor ablehnen.',
        '`Objects.requireNonNull(value, "name")` gibt den Wert zurück oder wirft NPE. `LocalDate.now(clock)` liefert das Datum der übergebenen Clock; `LocalDate.toString()` ist ISO (`yyyy-MM-dd`).',
        'Guard Clause für die E-Mail zuerst, dann Betreff/Text bauen, dann `mailSender.send(...)`.',
        '`this.clock = Objects.requireNonNull(clock, "clock");`',
      ],
      tests: `Clock fixed = Clock.fixed(Instant.parse("2024-03-01T10:15:30Z"), ZoneOffset.UTC);
RecordingMailSender sender = new RecordingMailSender();
WelcomeService service = new WelcomeService(sender, fixed);
service.sendWelcome(new User("ada@example.com", "Ada"));
check("eine Mail gesendet", 1, sender.sent.size());
check("Mail-Inhalt mit Clock-Datum", "ada@example.com|Willkommen, Ada|Registriert am 2024-03-01", sender.sent.get(0));
checkThrows("blank email", IllegalArgumentException.class, () -> service.sendWelcome(new User("  ", "Bob")));
checkThrows("null email", IllegalArgumentException.class, () -> service.sendWelcome(new User(null, "Bob")));
check("bei ungültiger Mail nichts gesendet", 1, sender.sent.size());
checkThrows("null MailSender", NullPointerException.class, () -> new WelcomeService(null, fixed));
checkThrows("null Clock", NullPointerException.class, () -> new WelcomeService(sender, null));
Clock other = Clock.fixed(Instant.parse("2030-12-31T23:00:00Z"), ZoneOffset.UTC);
RecordingMailSender sender2 = new RecordingMailSender();
new WelcomeService(sender2, other).sendWelcome(new User("x@y.z", "X"));
checkTrue("Datum kommt aus der injizierten Clock", sender2.sent.get(0).endsWith("2030-12-31"));`,
    },
    {
      id: 'k3',
      title: 'Strategy per List-Injection',
      level: 3,
      description: `Spring kann alle Beans eines Typs als \`List<PaymentProvider>\` injizieren. Baue daraus einen \`PaymentService\`:

- Konstruktor bekommt \`List<PaymentProvider>\` und legt eine unveränderliche \`Map<String, PaymentProvider>\` nach \`type()\` an.
- Zwei Provider mit gleichem \`type()\` → \`IllegalStateException\` (Konfigurationsfehler soll beim Start auffallen).
- \`pay(String type, BigDecimal amount)\`: sucht den Provider **case-insensitive** (Provider-Typen sind groß geschrieben) und delegiert. Unbekannt oder \`null\` → \`UnsupportedPaymentException\`.
- \`supportedTypes()\` liefert die Typen als \`Set<String>\`.`,
      given: `interface PaymentProvider {
    String type();
    String pay(BigDecimal amount);
}

class CardProvider implements PaymentProvider {
    public String type() { return "CARD"; }
    public String pay(BigDecimal amount) { return "CARD:" + amount; }
}

class PaypalProvider implements PaymentProvider {
    public String type() { return "PAYPAL"; }
    public String pay(BigDecimal amount) { return "PAYPAL:" + amount; }
}

class UnsupportedPaymentException extends RuntimeException {
    UnsupportedPaymentException(String type) {
        super("Unsupported payment type: " + type);
    }
}`,
      starter: `class PaymentService {
    private final Map<String, PaymentProvider> providersByType;

    PaymentService(List<PaymentProvider> providers) {
        // TODO: Map nach type() aufbauen, Duplikate ablehnen
        this.providersByType = Map.of();
    }

    String pay(String type, BigDecimal amount) {
        // TODO
        return null;
    }

    Set<String> supportedTypes() {
        // TODO
        return Set.of();
    }
}`,
      solution: `class PaymentService {
    private final Map<String, PaymentProvider> providersByType;

    PaymentService(List<PaymentProvider> providers) {
        this.providersByType = providers.stream()
            .collect(Collectors.toUnmodifiableMap(
                PaymentProvider::type,
                Function.identity(),
                (a, b) -> {
                    throw new IllegalStateException("Duplicate payment type: " + a.type());
                }));
    }

    String pay(String type, BigDecimal amount) {
        if (type == null) {
            throw new UnsupportedPaymentException(null);
        }
        PaymentProvider provider = providersByType.get(type.toUpperCase(Locale.ROOT));
        if (provider == null) {
            throw new UnsupportedPaymentException(type);
        }
        return provider.pay(amount);
    }

    Set<String> supportedTypes() {
        return providersByType.keySet();
    }
}`,
      hints: [
        'Die Liste wird einmalig im Konstruktor in eine Lookup-Map umgewandelt – danach O(1)-Zugriff statt Suche in der Liste.',
        '`Collectors.toMap(keyMapper, valueMapper, mergeFunction)` bzw. `toUnmodifiableMap(...)`. Die Merge-Funktion wird bei doppeltem Key aufgerufen.',
        'Konstruktor: stream → toMap(type, identity, (a, b) -> throw). pay: null-Check → `toUpperCase(Locale.ROOT)` → `get` → null? Exception : delegieren.',
        '`providers.stream().collect(Collectors.toUnmodifiableMap(PaymentProvider::type, Function.identity(), (a, b) -> { throw new IllegalStateException(...); }))`',
      ],
      tests: `PaymentService service = new PaymentService(List.of(new CardProvider(), new PaypalProvider()));
check("CARD", "CARD:10.50", service.pay("CARD", new BigDecimal("10.50")));
check("case-insensitive", "PAYPAL:5", service.pay("paypal", new BigDecimal("5")));
check("supportedTypes", Set.of("CARD", "PAYPAL"), service.supportedTypes());
checkThrows("unbekannter Typ", UnsupportedPaymentException.class, () -> service.pay("BITCOIN", BigDecimal.ONE));
checkThrows("null Typ", UnsupportedPaymentException.class, () -> service.pay(null, BigDecimal.ONE));
checkThrows("doppelter Typ", IllegalStateException.class, () -> new PaymentService(List.of(new CardProvider(), new CardProvider())));
PaymentService none = new PaymentService(List.of());
check("keine Provider", Set.of(), none.supportedTypes());
checkThrows("keine Provider -> unsupported", UnsupportedPaymentException.class, () -> none.pay("CARD", BigDecimal.ONE));`,
    },
    {
      id: 'k4',
      title: 'Spring-Verdrahtung von Hand schreiben (write & compare)',
      level: 3,
      description: `Schreibe echten Spring-Boot-3-Code (ohne IDE):

1. \`MailProperties\` als \`@ConfigurationProperties\`-Record mit Prefix \`app.mail\` (\`from\`, \`timeout\` als \`Duration\`).
2. \`AppConfig\` (\`@Configuration\`): \`Clock\`-Bean (UTC) und Aktivierung der Properties.
3. Interface \`MailSender\` mit zwei Implementierungen: \`SmtpMailSender\` (\`@Primary\`) und \`LoggingMailSender\` (Bean-Name \`"logging"\`).
4. \`WelcomeService\` mit Constructor Injection: Default-\`MailSender\`, zusätzlich den \`"logging"\`-Sender per \`@Qualifier\`, \`Clock\` und \`MailProperties\`.

Vergleiche danach mit der Referenz.`,
      starter: `// MailProperties, AppConfig, MailSender + 2 Implementierungen, WelcomeService
`,
      solution: `import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@ConfigurationProperties(prefix = "app.mail")
record MailProperties(String from, Duration timeout) {}

@Configuration
@EnableConfigurationProperties(MailProperties.class)
class AppConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}

interface MailSender {
    void send(String from, String to, String subject);
}

@Component
@Primary
class SmtpMailSender implements MailSender {
    @Override
    public void send(String from, String to, String subject) {
        // SMTP ...
    }
}

@Component("logging")
class LoggingMailSender implements MailSender {
    @Override
    public void send(String from, String to, String subject) {
        System.out.println(from + " -> " + to + ": " + subject);
    }
}

@Service
class WelcomeService {
    private final MailSender mailSender;
    private final MailSender auditSender;
    private final Clock clock;
    private final MailProperties properties;

    WelcomeService(MailSender mailSender,
                   @Qualifier("logging") MailSender auditSender,
                   Clock clock,
                   MailProperties properties) {
        this.mailSender = mailSender;
        this.auditSender = auditSender;
        this.clock = clock;
        this.properties = properties;
    }

    void sendWelcome(String email) {
        String subject = "Willkommen (" + LocalDate.now(clock) + ")";
        mailSender.send(properties.from(), email, subject);
        auditSender.send(properties.from(), email, subject);
    }
}

// application.yml:
// app:
//   mail:
//     from: noreply@example.com
//     timeout: 5s`,
      hints: [
        'Fremdklassen (`Clock`) → `@Bean` in `@Configuration`. Eigene Klassen → `@Component`/`@Service`.',
        '`@ConfigurationProperties(prefix = ...)` auf einem Record + `@EnableConfigurationProperties(MailProperties.class)`.',
        'Zwei Beans desselben Typs: eine mit `@Primary`, die andere mit Bean-Namen `@Component("logging")` und am Injection Point `@Qualifier("logging")`.',
      ],
    },
  ],
}

export default chapter
