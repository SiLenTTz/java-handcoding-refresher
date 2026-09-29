# Kapitel 05 – Streams Advanced

## flatMap

Gegeben:

```java
List<User>
```

und:

```java
user.getRoles() -> List<Role>
```

Mit `map`:

```text
Stream<List<Role>>
```

Mit `flatMap`:

```text
Stream<Role>
```

```java
List<Role> roles =
    users.stream()
        .flatMap(user -> user.getRoles().stream())
        .toList();
```

## reduce

```java
int total =
    numbers.stream()
        .reduce(0, Integer::sum);
```

Für Geld:

```java
BigDecimal total =
    products.stream()
        .map(Product::getPrice)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
```

## groupingBy

```java
Map<String, List<User>> usersByCountry =
    users.stream()
        .collect(Collectors.groupingBy(User::getCountry));
```

## partitioningBy

```java
Map<Boolean, List<User>> result =
    users.stream()
        .collect(Collectors.partitioningBy(User::isActive));
```

## toMap

```java
Map<Long, User> usersById =
    users.stream()
        .collect(Collectors.toMap(
            User::getId,
            Function.identity()
        ));
```

## Mental Shortcut

```text
"nur die ..."                → filter
"wandle jedes ... um"        → map
"Liste in Elementen"         → flatMap
"gruppiere nach ..."         → groupingBy
"Lookup nach ID"             → toMap
"existiert mindestens eins?" → anyMatch
"gilt für alle?"             → allMatch
"finde eins"                 → findFirst
"kombiniere / summiere"      → reduce
```
