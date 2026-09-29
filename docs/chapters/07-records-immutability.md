# Kapitel 07 – Records & Immutability

## Record

```java
public record UserDto(
    Long id,
    String name,
    String email
) {}
```

Records erzeugen automatisch:

- Konstruktor
- Accessors
- `equals`
- `hashCode`
- `toString`

## Gute Use Cases

- DTOs
- Value Objects
- API Responses
- immutable Datencontainer

## Immutability

```java
public record Money(
    BigDecimal amount,
    Currency currency
) {}
```

Collections ggf. kopieren:

```java
this.roles = List.copyOf(roles);
```

## Vorteile

- weniger Seiteneffekte
- besser testbar
- leichter verständlich
- threadsicherer
