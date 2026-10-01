# Kapitel 16 – Spring Dependency Injection

## Mental Model

```text
Klasse sagt:   "Ich brauche ein UserRepository"   (Konstruktor-Parameter)
Container sagt: "Ich baue es und reiche es rein"   (Inversion of Control)
```

- **IoC Container** (`ApplicationContext`) erzeugt Objekte (**Beans**), verdrahtet sie und verwaltet ihren Lifecycle.
- Deine Klasse **erzeugt** ihre Abhängigkeiten nicht (`new`), sie **bekommt** sie.
- Abhängigkeiten sind idealerweise **Interfaces** → austauschbar, testbar (Fake/Mock).
- Default-Scope: **Singleton** – eine Instanz pro Container. Beans müssen daher **stateless** bzw. thread-safe sein.

Ohne Spring ist DI einfach „Konstruktor mit Parametern + jemand, der verdrahtet“:

```java
UserRepository repo = new JpaUserRepository(dataSource);
UserMapper mapper = new UserMapper();
UserService service = new UserService(repo, mapper); // manuelle DI
```

## Syntax / API

### Constructor Injection (Standard)

```java
@Service
public class UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    // Nur ein Konstruktor -> @Autowired ist optional (seit Spring 4.3)
    public UserService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
}
```

Mit Lombok häufig: `@RequiredArgsConstructor` + `private final`-Felder.

### Stereotype-Annotationen (Component Scan)

| Annotation        | Zweck                                                 |
|-------------------|-------------------------------------------------------|
| `@Component`      | generische Bean                                       |
| `@Service`        | Business-Logik (semantisch, technisch = `@Component`) |
| `@Repository`     | Persistence, + Exception Translation (`DataAccessException`) |
| `@Controller` / `@RestController` | Web Layer                             |
| `@Configuration`  | Klasse mit `@Bean`-Factory-Methoden                   |

`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` (ab dem Package der Klasse abwärts).

### @Configuration + @Bean (für fremde Klassen)

```java
@Configuration
public class AppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public RestClient githubClient(RestClient.Builder builder) {
        return builder.baseUrl("https://api.github.com").build();
    }
}
```

Parameter von `@Bean`-Methoden werden ebenfalls injiziert.

### Mehrere Kandidaten: @Primary, @Qualifier, List/Map

```java
public interface PaymentProvider { String name(); void pay(BigDecimal amount); }

@Component @Primary
class StripeProvider implements PaymentProvider { ... }

@Component("paypal")
class PaypalProvider implements PaymentProvider { ... }

@Service
class CheckoutService {
    CheckoutService(PaymentProvider defaultProvider,                 // -> Stripe (@Primary)
                    @Qualifier("paypal") PaymentProvider paypal,     // -> Paypal
                    List<PaymentProvider> all,                       // alle Beans
                    Map<String, PaymentProvider> byBeanName) { ... } // beanName -> Bean
}
```

### Konfiguration injizieren

```java
@ConfigurationProperties(prefix = "app.mail")
public record MailProperties(String from, Duration timeout) {}

// @EnableConfigurationProperties(MailProperties.class) oder @ConfigurationPropertiesScan
```

`@Value("${app.mail.from}")` geht auch, ist für mehrere Werte aber unübersichtlich.

### Scopes & Lifecycle

- `singleton` (Default), `prototype` (neue Instanz pro Injection), Web: `request`, `session`.
- `@PostConstruct` / `@PreDestroy` (`jakarta.annotation.*`) für Init/Cleanup.
- Optionale Abhängigkeit: `ObjectProvider<T>` oder `Optional<T>` als Parameter.

## Typische Use Cases

- Service bekommt Repository + Mapper + `Clock` injiziert → deterministisch testbar.
- Strategy Pattern: alle `PaymentProvider`-Beans als `List` injizieren und in eine `Map` nach Typ legen.
- Externe Clients (`RestClient`, `ObjectMapper`-Konfiguration) als `@Bean` bereitstellen.
- In Tests: Service direkt mit `new` und Fakes bauen – kein Spring-Context nötig.

## Clean-Code-Empfehlungen

- **Constructor Injection** + `final` Felder. Keine Field Injection in Produktionscode.
- Viele Konstruktor-Parameter (> 5–6) = Code Smell: Klasse hat zu viele Verantwortungen (SRP).
- Gegen **Interfaces** injizieren, wenn es mehrere Implementierungen oder Test-Fakes gibt – nicht reflexartig für alles.
- Beans **stateless** halten: keine request-spezifischen Daten in Feldern von Singletons.
- `Clock`, `UUID`-Generatoren, Zufall injizieren statt `LocalDateTime.now()` im Code.
- `@Configuration`-Klassen für Verdrahtung, Domain-Klassen möglichst frei von Framework-Annotationen.

## Häufige Fehler

**Field Injection**

```java
// falsch
@Service
public class UserService {
    @Autowired
    private UserRepository repository; // nicht final, versteckt, nur via Reflection testbar
}

// richtig
@Service
public class UserService {
    private final UserRepository repository;
    public UserService(UserRepository repository) { this.repository = repository; }
}
```

**`new` statt Injection**

```java
// falsch – Spring kennt diese Instanz nicht (kein @Transactional-Proxy, keine Injection)
private final UserService service = new UserService(new UserRepositoryImpl());

// richtig – als Konstruktor-Parameter anfordern
```

**Zustand in Singleton-Beans**

```java
// falsch – wird von allen Requests/Threads geteilt
@Service
class ReportService {
    private List<String> currentLines = new ArrayList<>();
}

// richtig – lokale Variablen, Rückgabewerte, oder request-spezifisches Objekt
```

**Mehrdeutige Beans:** `NoUniqueBeanDefinitionException` → `@Primary` oder `@Qualifier` setzen.

**Zirkuläre Abhängigkeiten** (A → B → A): mit Constructor Injection schlägt der Start fehl (seit Boot 2.6 standardmäßig verboten). Lösung: Design ändern (gemeinsame Logik in dritte Klasse), nicht `@Lazy` draufkleben.

## Interview-relevante Details

- **Warum Constructor Injection?** Pflicht-Abhängigkeiten sichtbar, `final`/immutable, Objekt nie halb initialisiert, ohne Spring testbar (`new UserService(fakeRepo)`), zirkuläre Abhängigkeiten fallen sofort auf.
- **Setter Injection**: nur für optionale Abhängigkeiten.
- **IoC vs DI**: IoC = Prinzip (Framework steuert Objekterzeugung), DI = konkrete Technik dafür.
- **Bean-Auflösung**: nach Typ; bei mehreren Kandidaten `@Primary` → `@Qualifier` → Parametername als Fallback.
- **Proxies**: Spring injiziert oft einen Proxy (z. B. für `@Transactional`, `@Async`) statt des Originalobjekts – wichtig für das Self-Invocation-Problem (Kapitel 20).
- **`@Component` vs `@Bean`**: `@Component` auf eigenen Klassen (Scan), `@Bean` für Fremdklassen oder wenn Erzeugungslogik nötig ist.
- **`@Repository`**: übersetzt Persistence-Exceptions in Springs `DataAccessException`-Hierarchie. Spring-Data-Interfaces brauchen die Annotation nicht.
- **Singleton-Scope ≠ Singleton-Pattern**: eine Instanz pro Container, nicht pro JVM/Classloader.

## Zusammenfassung

- DI = Abhängigkeiten reinreichen statt selbst erzeugen; Spring-Container übernimmt Erzeugung und Verdrahtung.
- Standard: `@Service` + `private final` Felder + ein Konstruktor.
- Mehrere Implementierungen: `@Primary`, `@Qualifier`, `List<T>` / `Map<String, T>`.
- Beans sind Singletons → stateless halten.
- Gute DI zeigt sich im Test: Klasse ist mit `new` und Fakes baubar.
