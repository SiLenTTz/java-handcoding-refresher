# Kapitel 23 – Refactoring

## Mental Model

Refactoring = **Struktur ändern, Verhalten beibehalten**. Deshalb gilt:

```text
1. Verhalten mit Tests festnageln (Characterization Tests)
2. kleiner Schritt (ein Move)
3. Tests grün?  → nächster Schritt
4. Bugfix ist KEIN Refactoring → separat, bewusst, mit Test
```

In der Prüfung: erst **Smells benennen**, dann **Moves anwenden**, dann **erklären warum**. Reihenfolge der Wirkung: Naming → Guard Clauses → Extract Method → Magic Numbers → Duplikation → Verantwortlichkeiten verschieben.

## Smell-Katalog mit Vorher/Nachher

### 1. Long Method + schlechtes Naming

```java
// vorher
public List<UserDto> get(List<User> l) {
    List<UserDto> r = new ArrayList<>();
    for (int i = 0; i < l.size(); i++) {
        if (l.get(i).isActive()) {
            r.add(new UserDto(l.get(i).getId(), l.get(i).getName()));
        }
    }
    return r;
}

// nachher
public List<UserDto> getActiveUsers(List<User> users) {
    return users.stream()
        .filter(User::isActive)
        .map(mapper::toDto)
        .toList();
}
```

### 2. Nested if → Guard Clauses

```java
// vorher
double fee(Account a) {
    if (a != null) {
        if (a.isActive()) {
            if (a.getBalance() > 0) {
                return a.getBalance() * 0.01;
            } else { return 0; }
        } else { throw new IllegalStateException(); }
    } else { throw new IllegalArgumentException(); }
}

// nachher
BigDecimal fee(Account account) {
    Objects.requireNonNull(account, "account");
    if (!account.isActive()) throw new IllegalStateException("inactive account");
    if (account.balance().signum() <= 0) return BigDecimal.ZERO;
    return account.balance().multiply(FEE_RATE);
}
```

### 3. Magic Numbers → Named Constants / Enum

```java
// vorher
if (order.getTotal() > 100) discount = order.getTotal() * 0.1;
if (status == 3) { ... }

// nachher
private static final BigDecimal FREE_DISCOUNT_THRESHOLD = new BigDecimal("100");
private static final BigDecimal DISCOUNT_RATE = new BigDecimal("0.10");
if (status == OrderStatus.SHIPPED) { ... }
```

### 4. Duplikation → Extract Method

```java
// vorher
if (email == null || email.isBlank() || !email.contains("@")) throw new IllegalArgumentException("email");
if (backup == null || backup.isBlank() || !backup.contains("@")) throw new IllegalArgumentException("backup");

// nachher
requireValidEmail(email, "email");
requireValidEmail(backup, "backup");

private static void requireValidEmail(String value, String field) {
    if (value == null || value.isBlank() || !value.contains("@"))
        throw new IllegalArgumentException("invalid " + field);
}
```

### 5. Null Abuse → Optional / leere Collection / Exception

```java
// vorher
User find(Long id) { ... return null; }
List<Order> orders() { return orders == null ? null : orders; }

// nachher
Optional<User> findById(Long id) { ... }
List<Order> orders() { return List.copyOf(orders); }   // nie null
```

### 6. Optional Misuse

```java
// vorher
Optional<User> u = repo.findById(id);
if (u.isPresent()) { return u.get().getName(); } else { return null; }
void update(Optional<String> name) { ... }        // Optional als Parameter
class User { Optional<String> nickname; }          // Optional als Feld

// nachher
return repo.findById(id)
    .map(User::getName)
    .orElseThrow(() -> new UserNotFoundException(id));
```

Optional = **Rückgabetyp** für "kann fehlen". Nicht als Feld, Parameter oder in Collections. Nie `get()` ohne Prüfung, nie `Optional.of(nullable)`.

### 7. Switch auf Typ → Polymorphismus / Strategy

```java
// vorher
BigDecimal shipping(String type, BigDecimal weight) {
    if (type.equals("EXPRESS")) return weight.multiply(new BigDecimal("2.5"));
    else if (type.equals("STANDARD")) return weight.multiply(new BigDecimal("1.0"));
    else if (type.equals("PICKUP")) return BigDecimal.ZERO;
    return null;
}

// nachher – enum mit Verhalten
enum ShippingType {
    EXPRESS(new BigDecimal("2.5")), STANDARD(BigDecimal.ONE), PICKUP(BigDecimal.ZERO);
    private final BigDecimal ratePerKg;
    ShippingType(BigDecimal ratePerKg) { this.ratePerKg = ratePerKg; }
    BigDecimal costFor(BigDecimal weightKg) { return weightKg.multiply(ratePerKg); }
}

// oder – Strategy, wenn Logik komplex / erweiterbar
interface ShippingStrategy { BigDecimal cost(Parcel parcel); }
Map<ShippingType, ShippingStrategy> strategies;
```

### 8. Long Parameter List → Introduce Parameter Object

```java
// vorher
List<Order> search(String customer, LocalDate from, LocalDate to, String status, int page, int size)

// nachher
record OrderSearchCriteria(String customer, LocalDate from, LocalDate to, OrderStatus status) {}
Page<Order> search(OrderSearchCriteria criteria, Pageable pageable)
```

### 9. God Service → nach Verantwortlichkeiten schneiden

```text
OrderService (1200 Zeilen): Validierung, Preisberechnung, PDF, E-Mail, Lagerbestand

→ OrderService         orchestriert den Use Case
→ PriceCalculator      reine Logik, leicht testbar
→ InventoryService     Lager
→ OrderNotifier        E-Mail / Events
→ InvoiceRenderer      PDF
```

### 10. Logic in Controller + Exposed Entity

```java
// vorher
@PostMapping("/orders")
public Order create(@RequestBody Order order) {        // Entity als API-Vertrag!
    if (order.getItems().isEmpty()) return null;
    order.setTotal(order.getItems().stream().mapToDouble(i -> i.getPrice() * i.getQty()).sum());
    return orderRepository.save(order);                  // Controller → Repository
}

// nachher
@PostMapping("/orders")
@ResponseStatus(HttpStatus.CREATED)
public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
    return orderService.create(request);
}
```

Probleme vorher: Mass Assignment (Client setzt `id`, `total`), Lazy-Loading-/Rekursionsprobleme bei JSON, API an DB-Schema gekoppelt, keine Validation, `double` für Geld, `null` statt 400.

### 11. Unnötige Vererbung → Komposition

```java
// vorher
class OrderService extends BaseCrudService<Order> { ... }   // erbt 20 Methoden, die keiner braucht

// nachher
class OrderService {
    private final OrderRepository repository;
    private final PriceCalculator calculator;
}
```

## Refactoring-Moves (Werkzeugkasten)

| Move | Wann |
|---|---|
| Rename | Name sagt nicht, was es tut |
| Extract Method | Block mit Kommentar darüber, Duplikation, lange Methode |
| Inline Variable/Method | Indirektion ohne Mehrwert |
| Guard Clause | tiefe Verschachtelung, Fehlerfälle zuerst |
| Replace Magic Number with Constant | Literale mit Bedeutung |
| Replace Conditional with Polymorphism / Strategy | `switch`/`if`-Kaskade auf Typ |
| Introduce Parameter Object | > 3 zusammengehörige Parameter |
| Replace Loop with Pipeline | filter/map/sum-Schleifen |
| Move Method | Logik gehört zu den Daten (Feature Envy) |
| Extract Class | Klasse hat mehrere Gründe sich zu ändern |
| Replace Primitive with Value Object / Enum | `String status`, `double price` |

## Häufige Fehler beim Refactoring

- Verhalten nebenbei ändern, ohne es zu merken (z. B. Reihenfolge, Rundung, Umgang mit `null`).
- Alles auf einmal umbauen statt kleiner Schritte.
- Streams erzwingen, wo eine Schleife lesbarer ist (z. B. mit `break` / komplexem Zustand).
- `double` → `BigDecimal` ohne `RoundingMode` bei `divide` → `ArithmeticException`.
- `BigDecimal.equals` statt `compareTo` (Skala!).
- Neue Abstraktion für genau einen Fall ("speculative generality").
- Exceptions schlucken (`catch (Exception e) {}`) beim "Aufräumen".

## Interview-Details

- **Wie gehst du mit Legacy-Code ohne Tests um?** Characterization Tests schreiben, Seams schaffen (Abhängigkeit injizieren), dann kleinschrittig refactoren.
- **Wann Strategy statt enum mit Methode?** Enum: feste, kleine Menge, Logik einfach. Strategy: Logik braucht Abhängigkeiten (Beans), soll erweiterbar sein (Open/Closed).
- **Boy Scout Rule**: Code etwas sauberer hinterlassen, als man ihn vorgefunden hat – aber nicht den ganzen Wald umgraben.
- **Refactoring vs Rewrite**: Refactoring ist inkrementell und jederzeit auslieferbar; Rewrite ist riskant.
- **Code Smell ≠ Bug**: Smell ist ein Hinweis auf schlechtes Design, das Bugs begünstigt.

## Zusammenfassung

```text
Erst Tests, dann kleine Schritte
Naming → Guard Clauses → Extract Method → Konstanten → Duplikation → Verantwortung
Optional nur als Rückgabe, nie null für Collections
Typ-Switch → enum mit Verhalten oder Strategy
Controller dünn, DTO statt Entity, Logik im Service/Domain
Geld = BigDecimal, Vergleich mit compareTo
```
