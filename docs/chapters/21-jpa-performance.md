# Kapitel 21 – JPA Performance

## N+1 Problem

Beispiel:

```text
1 Query für Orders
+
100 Queries für Customers
```

Kann entstehen bei:

```java
List<Order> orders = repository.findAll();

for (Order order : orders) {
    order.getCustomer().getName();
}
```

## Mögliche Lösungen

- Fetch Join
- EntityGraph
- DTO Projection
- gezielte Query
- Batch Fetching

## Vorsicht

`EAGER` ist keine Universal-Lösung.

## Weitere Themen

- Indizes
- Query-Anzahl
- Pagination
- unnötige Entity Loads
- Projection
- Transaktionsgrenzen
