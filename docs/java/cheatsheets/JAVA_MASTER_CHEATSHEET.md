# Java Handcoding – Master Cheatsheet

## Collections

```java
List<T>
Set<T>
Map<K, V>
Queue<T>
```

## Map

```java
map.get(key);
map.put(key, value);
map.putIfAbsent(key, value);
map.getOrDefault(key, defaultValue);
map.computeIfAbsent(key, k -> new ArrayList<>());
map.merge(key, 1, Integer::sum);
```

## Streams

```java
stream.filter(...)
stream.map(...)
stream.flatMap(...)
stream.distinct()
stream.sorted(...)
stream.findFirst()
stream.anyMatch(...)
stream.allMatch(...)
stream.noneMatch(...)
stream.count()
stream.reduce(...)
stream.collect(...)
```

## Collectors

```java
Collectors.toMap(...)
Collectors.groupingBy(...)
Collectors.partitioningBy(...)
Collectors.joining(...)
```

## Optional

```java
Optional.of(...)
Optional.ofNullable(...)
Optional.empty()

optional.map(...)
optional.flatMap(...)
optional.filter(...)
optional.orElse(...)
optional.orElseGet(...)
optional.orElseThrow(...)
```

## Functional Interfaces

```text
Predicate<T>      T → boolean
Function<T,R>     T → R
Consumer<T>       T → void
Supplier<T>       () → T
```

## Spring Data

```java
Optional<T>
List<T>
Page<T>
Slice<T>
Pageable
Sort
```

## Pageable

```java
PageRequest.of(
    0,
    20,
    Sort.by("createdAt").descending()
);
```

## BigDecimal

```java
BigDecimal value = new BigDecimal("19.99");

value.add(other);
value.subtract(other);
value.multiply(other);
value.compareTo(other);
value.signum();
```

## Clean Code

Bevorzuge:

- `final`
- klare Namen
- kleine Methoden
- Constructor Injection
- Immutability
- Composition
- DTOs an API-Grenzen
- Guard Clauses
- Enums statt String-Status
- `BigDecimal` für Geld

Vermeide:

- `Optional.get()`
- `return null` für Collections
- Field Injection
- riesige Services
- leere `catch`
- Business Logic im Controller
- Entity direkt als REST Response
