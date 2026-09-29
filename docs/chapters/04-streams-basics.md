# Kapitel 04 – Streams Basics

## Mental Model

```text
SOURCE
  ↓
FILTER
  ↓
MAP
  ↓
SORT
  ↓
COLLECT
```

## Beispiel

```java
List<String> names =
    users.stream()
        .filter(User::isActive)
        .map(User::getName)
        .sorted()
        .toList();
```

## filter

```java
users.stream()
    .filter(User::isActive)
    .toList();
```

## map

Transformation `A → B`:

```java
List<String> names =
    users.stream()
        .map(User::getName)
        .toList();
```

## distinct

```java
roles.stream()
    .distinct()
    .toList();
```

## sorted

```java
users.stream()
    .sorted(Comparator.comparing(User::getName))
    .toList();
```

Absteigend:

```java
users.stream()
    .sorted(Comparator.comparing(User::getName).reversed())
    .toList();
```

## findFirst

```java
Optional<User> user =
    users.stream()
        .filter(User::isActive)
        .findFirst();
```

## anyMatch / allMatch / noneMatch

```java
boolean hasAdmin =
    users.stream()
        .anyMatch(User::isAdmin);
```

```java
boolean allActive =
    users.stream()
        .allMatch(User::isActive);
```

```java
boolean noDeletedUsers =
    users.stream()
        .noneMatch(User::isDeleted);
```
