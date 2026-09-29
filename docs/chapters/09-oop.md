# Kapitel 09 – OOP

## Vier Kernkonzepte

- Encapsulation
- Abstraction
- Inheritance
- Polymorphism

## Encapsulation

Nicht:

```java
public BigDecimal balance;
```

Besser:

```java
private BigDecimal balance;
```

Mutation kontrollieren:

```java
public void deposit(BigDecimal amount) {
    if (amount.signum() <= 0) {
        throw new IllegalArgumentException("Amount must be positive");
    }

    balance = balance.add(amount);
}
```

## Interface

```java
public interface PaymentService {
    void pay(Payment payment);
}
```

## Composition over Inheritance

```java
class CheckoutService {

    private final PaymentService paymentService;

    CheckoutService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

Bevorzuge Komposition, wenn Vererbung keine echte `is-a`-Beziehung abbildet.
