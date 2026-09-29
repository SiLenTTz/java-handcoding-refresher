# Kapitel 14 – Clean Code

## Kleine Methoden

Besser:

```java
public void processOrder(Order order) {

    validate(order);
    calculatePrice(order);
    reserveInventory(order);
    persist(order);
    notifyCustomer(order);
}
```

## Gute Namen

```java
calculateInvoiceTotal()
```

statt:

```java
doIt()
```

## Boolean-Namen

```java
isActive()
hasPermission()
canDelete()
shouldRetry()
```

## Guard Clauses

```java
if (user == null) {
    return;
}

if (!user.isActive()) {
    return;
}

if (!user.hasPermission()) {
    return;
}

execute();
```

## Keine Magic Numbers

```java
private static final int MAX_RETRIES = 5;
```

## Kommentare

Kommentare sollten bevorzugt erklären:

```text
WARUM
```

nicht:

```text
WAS
```

## Grundregel

Clean Code bedeutet:

> geringe kognitive Last.

Nicht:

> möglichst wenige Zeichen.
