# Kapitel 15 – Design Patterns

## Repository

Abstraktion für Datenzugriff.

```java
public interface UserRepository
        extends JpaRepository<UserEntity, Long> {
}
```

## Strategy

```java
interface PricingStrategy {
    BigDecimal calculate(Order order);
}
```

## Factory

```java
public PaymentProcessor create(PaymentType type) {
    return switch (type) {
        case CREDIT_CARD -> new CreditCardProcessor();
        case PAYPAL -> new PaypalProcessor();
    };
}
```

## Builder

Nützlich bei komplexen Objekten.

## Adapter

Externes Interface an internes Interface anpassen.

## Facade

Mehrere Subsysteme hinter einer einfachen API verstecken.

## Observer / Event

Komponenten über Events entkoppeln.

## Template Method

Gemeinsamen Ablauf definieren, einzelne Schritte überschreiben.

## Wichtig

Patterns nicht anwenden, nur weil man sie kennt.

Nutze ein Pattern nur, wenn es ein reales Designproblem vereinfacht.
