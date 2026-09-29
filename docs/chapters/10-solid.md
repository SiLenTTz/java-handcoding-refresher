# Kapitel 10 – SOLID

## S – Single Responsibility

Eine Klasse sollte einen klaren Verantwortungsbereich haben.

## O – Open/Closed

Offen für Erweiterung, geschlossen für Modifikation.

```java
interface DiscountStrategy {
    BigDecimal calculate(Order order);
}
```

Implementierungen:

```text
VipDiscountStrategy
ChristmasDiscountStrategy
EmployeeDiscountStrategy
```

## L – Liskov Substitution

Implementierungen eines Interfaces sollten erwartungsgemäß austauschbar sein.

## I – Interface Segregation

Bevorzuge kleine, fokussierte Interfaces.

## D – Dependency Inversion

Abhängig von Abstraktionen:

```java
private final EmailSender emailSender;
```

statt:

```java
private final GmailEmailSender emailSender;
```
