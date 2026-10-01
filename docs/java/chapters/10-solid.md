# Kapitel 10 – SOLID

## Mental Model

SOLID sind fünf Heuristiken gegen **Änderungsschmerz**. Jede beantwortet eine Frage:

| Prinzip | Frage | Symptom bei Verstoß |
|---|---|---|
| **S**ingle Responsibility | Aus wie vielen Gründen ändert sich diese Klasse? | „God Class“, `OrderService` mit 2000 Zeilen |
| **O**pen/Closed | Muss ich bestehenden Code ändern, um eine Variante hinzuzufügen? | wachsende `switch`/`if`-Ketten über Typen |
| **L**iskov Substitution | Kann ich jede Implementierung einsetzen, ohne dass der Aufrufer bricht? | `UnsupportedOperationException`, `instanceof`-Sonderfälle |
| **I**nterface Segregation | Muss der Client Methoden kennen, die er nicht nutzt? | leere Implementierungen, `throw new UnsupportedOperationException()` |
| **D**ependency Inversion | Hängt Fachlogik an Details (DB, HTTP, Mail-Provider)? | `new SmtpClient()` im Service, nicht testbar |

SOLID ist kein Selbstzweck: Ziel ist Code, der sich **lokal** ändern und **isoliert** testen lässt.

## S – Single Responsibility

*„A class should have one reason to change“* – ein Grund = ein Akteur / eine fachliche Achse.

```java
// Verstoß: Validierung, Preisberechnung, Persistenz, E-Mail in einer Klasse
class OrderService {
    void placeOrder(Order order) {
        if (order.items().isEmpty()) throw new IllegalArgumentException();
        BigDecimal total = ...;                         // Pricing
        jdbcTemplate.update("INSERT ...", ...);         // Persistenz
        smtp.send(order.email(), "Danke für ...");       // Notification
    }
}

// Besser: Orchestrierung + fokussierte Kollaborateure
class OrderService {
    private final OrderValidator validator;
    private final PriceCalculator calculator;
    private final OrderRepository repository;
    private final OrderNotifier notifier;

    void placeOrder(Order order) {
        validator.validate(order);
        var priced = calculator.price(order);
        repository.save(priced);
        notifier.orderPlaced(priced);
    }
}
```

SRP heißt **nicht** „eine Methode pro Klasse“. Zu feine Zerlegung ist ebenfalls schlecht.

## O – Open/Closed

Offen für Erweiterung, geschlossen für Modifikation: Neue Varianten = **neue Klasse**, nicht neuer `case`.

```java
// Verstoß: jede neue Kundenart ändert diese Methode
BigDecimal discount(Customer c, BigDecimal amount) {
    if (c.type().equals("VIP")) return amount.multiply(new BigDecimal("0.20"));
    if (c.type().equals("EMPLOYEE")) return amount.multiply(new BigDecimal("0.30"));
    return BigDecimal.ZERO;
}

// Besser: Strategy
interface DiscountPolicy {
    boolean appliesTo(Customer customer);
    BigDecimal discount(BigDecimal amount);
}

class DiscountService {
    private final List<DiscountPolicy> policies;     // Spring injiziert alle Beans
    DiscountService(List<DiscountPolicy> policies) { this.policies = policies; }

    BigDecimal discount(Customer c, BigDecimal amount) {
        return policies.stream()
                .filter(p -> p.appliesTo(c))
                .map(p -> p.discount(amount))
                .max(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO);
    }
}
```

Pragmatisch: Ein `switch` über ein **`sealed`**/Enum-Set, das sich selten ändert, ist okay – der Compiler meldet fehlende Fälle. OCP lohnt sich bei Achsen, die sich **tatsächlich** oft erweitern.

## L – Liskov Substitution

Ein Subtyp muss den **Vertrag** des Supertyps erfüllen: keine stärkeren Vorbedingungen, keine schwächeren Nachbedingungen, keine überraschenden Exceptions.

```java
// Klassiker: Square extends Rectangle
class Rectangle {
    protected int width, height;
    void setWidth(int w)  { width = w; }
    void setHeight(int h) { height = h; }
    int area() { return width * height; }
}
class Square extends Rectangle {
    @Override void setWidth(int w)  { width = w; height = w; }
    @Override void setHeight(int h) { width = h; height = h; }
}

void resize(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.area() == 20;   // bricht für Square (16)
}
```

```java
// Verstoß: Subtyp wirft bei geerbter Operation
class ReadOnlyRepository implements Repository {
    public void save(Entity e) { throw new UnsupportedOperationException(); }
}
```

Lösungen: Hierarchie aufteilen (`Shape` mit `area()`, unveränderliche Records), kleinere Interfaces (→ ISP).

## I – Interface Segregation

Clients sollen nicht von Methoden abhängen, die sie nicht nutzen.

```java
// Verstoß: fettes Interface
interface Worker {
    void work();
    void eat();
    void attendMeeting();
}
class Robot implements Worker {
    public void work() { ... }
    public void eat() { throw new UnsupportedOperationException(); }   // ISP + LSP verletzt
    public void attendMeeting() { }                                    // leer
}

// Besser: Rollen-Interfaces
interface Workable { void work(); }
interface Feedable { void eat(); }
class Robot implements Workable { public void work() { ... } }
class Human implements Workable, Feedable { ... }
```

Spring-Beispiel: `CrudRepository` vs. eigenes schmales `interface OrderReader { Optional<Order> findById(Long id); }`.

## D – Dependency Inversion

High-Level-Module (Fachlogik) und Low-Level-Module (Infrastruktur) hängen beide von **Abstraktionen** ab. Die Abstraktion gehört fachlich zur High-Level-Seite.

```java
// Verstoß
class InvoiceService {
    private final SmtpMailClient mail = new SmtpMailClient("smtp.example.com");
    void send(Invoice i) { mail.sendSmtp(i.email(), render(i)); }
}

// Besser
interface InvoiceNotifier { void invoiceCreated(Invoice invoice); }

class InvoiceService {
    private final InvoiceNotifier notifier;
    InvoiceService(InvoiceNotifier notifier) { this.notifier = notifier; }   // Constructor Injection
    void create(Invoice i) { ...; notifier.invoiceCreated(i); }
}

class SmtpInvoiceNotifier implements InvoiceNotifier { ... }   // Detail, austauschbar
```

**DIP ≠ DI**: Dependency *Inversion* ist ein Designprinzip (Richtung der Abhängigkeit), Dependency *Injection* ist eine Technik (Abhängigkeiten von außen übergeben). DI ist das übliche Mittel, um DIP umzusetzen.

## Typische Use Cases

- **SRP**: Service aufteilen in Validator / Calculator / Repository / Notifier.
- **OCP**: Rabatt-, Versand-, Steuerregeln als Strategy-Beans (`List<Policy>` injizieren).
- **LSP**: Prüfen, ob Vererbung wirklich passt; `UnsupportedOperationException` als Warnsignal.
- **ISP**: Reader/Writer-Interfaces trennen, Ports in Hexagonal Architecture schmal halten.
- **DIP**: `Clock`, `IdGenerator`, `PaymentGateway` injizieren → deterministisch testbar.

## Clean-Code-Empfehlungen

- Erst bei konkretem Änderungsdruck abstrahieren (*Rule of Three*), nicht spekulativ.
- Interface pro **Rolle**, nicht pro Klasse (`UserService` + `UserServiceImpl` ohne zweite Impl ist oft unnötig).
- `new` für Services/Infrastruktur nur im Composition Root (Spring-Konfiguration), nicht in Fachlogik.
- `LocalDateTime.now()` in Fachlogik → `Clock` injizieren.
- Klassen- und Methodennamen verraten die Verantwortung; „Manager“, „Helper“, „Util“ sind SRP-Warnsignale.

## Häufige Fehler

```java
// FALSCH: Interface ohne Zweck, 1:1-Spiegel der Klasse
interface UserService { ... 25 Methoden ... }
class UserServiceImpl implements UserService { ... }
// RICHTIG: konkrete Klasse, bis eine zweite Implementierung oder ein echter Port nötig ist
```

```java
// FALSCH: "OCP" durch Reflection/Konfiguration bis zur Unlesbarkeit
Class.forName(config.get("discount.class")).getDeclaredConstructor().newInstance();
// RICHTIG: einfache Strategy-Beans oder ein switch über sealed Typen
```

```java
// FALSCH: DIP "umgesetzt", aber Abstraktion leakt Details
interface Notifier { void sendSmtp(String host, int port, MimeMessage msg); }
// RICHTIG: fachliche Sprache
interface Notifier { void orderShipped(Order order); }
```

## Interview-relevante Details

- Beispiel für jeden Buchstaben **mit Code** parat haben (Rabatt-Strategy, Square/Rectangle, Worker/Robot, Mail-Notifier).
- **LSP** formal: Vorbedingungen dürfen nicht verschärft, Nachbedingungen nicht abgeschwächt, Invarianten müssen erhalten bleiben.
- `Collections.unmodifiableList(...)` / `List.of(...)` werfen bei `add` `UnsupportedOperationException` – ein bekannter, bewusster LSP-Kompromiss der JDK-Collections.
- **DIP vs. DI vs. IoC**: Prinzip vs. Technik vs. Framework übernimmt Kontrolle (Spring Container).
- SOLID und Testbarkeit: DIP ermöglicht Fakes/Mocks; SRP macht Tests klein.
- Übertreibung ist auch ein Fehler: YAGNI, KISS.

## Zusammenfassung

- **S**: ein Änderungsgrund pro Klasse – Services orchestrieren, Kollaborateure spezialisieren.
- **O**: neue Varianten als neue Klassen (Strategy), wo Erweiterung wirklich passiert.
- **L**: Subtypen halten den Vertrag – keine Überraschungen, keine `UnsupportedOperationException`.
- **I**: kleine Rollen-Interfaces statt fetter Allzweck-Interfaces.
- **D**: Fachlogik hängt an fachlichen Abstraktionen, Details werden injiziert.
