# Coding Katas

## Kata 1 – Product

Schreibe:

```text
Product
- id
- name
- price
- active
```

Anforderungen:

- `id` unveränderlich
- `name` unveränderlich
- `price` veränderbar
- Methode `changePrice`
- Methode `isAvailable`

---

## Kata 2 – List zu Map

Gegeben:

```java
List<User> users;
```

Erstelle:

```java
Map<Long, User>
```

mit User-ID als Key.

---

## Kata 3 – Filter + Sort + Mapping

Gegeben:

```java
List<Order> orders;
```

Finde:

- nur bezahlte Bestellungen
- über 100 €
- nach Preis absteigend
- Ergebnis als `List<OrderDto>`

---

## Kata 4 – Grouping

Gegeben:

```java
record Employee(
    Long id,
    String department,
    BigDecimal salary,
    boolean active
) {}
```

Erzeuge:

```java
Map<String, List<Employee>>
```

aber nur:

- aktive Mitarbeiter
- Gehalt > 50.000

---

## Kata 5 – flatMap

Gegeben:

```java
List<Order>
```

und jede Order enthält:

```java
List<OrderItem>
```

Extrahiere alle eindeutigen Produkte.

---

## Kata 6 – Spring Data Slice

Implementiere:

```java
public Slice<UserDto> getUsers(Pageable pageable)
```

mit:

```java
repository.findByActiveTrue(pageable)
```

und Mapper.

---

## Kata 7 – Optional

Implementiere:

```java
public UserDto getUser(Long id)
```

mit:

- `repository.findById`
- Mapper
- `UserNotFoundException`

---

## Kata 8 – Map Frequency Counter

Gegeben:

```java
List<String> technologies;
```

Erzeuge:

```java
Map<String, Integer>
```

mit Anzahl pro Technologie.

Löse es:

1. mit Loop
2. mit `merge`
3. mit Streams

---

## Kata 9 – DTO Architecture

Erstelle:

```text
ProductEntity
CreateProductRequest
UpdateProductRequest
ProductResponse
ProductMapper
ProductService
ProductRepository
ProductController
```

---

## Kata 10 – Refactoring

Nimm eine Methode mit:

- verschachtelten ifs
- Magic Numbers
- `null`
- schlechtem Naming
- mehreren Verantwortlichkeiten

und refactore sie auf:

- Guard Clauses
- sprechende Namen
- kleine Methoden
- saubere Fehlerbehandlung
