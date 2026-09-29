# Kapitel 03 – Map

## Grundmodell

```text
KEY → VALUE
```

Beispiel:

```java
Map<Long, User> usersById = new HashMap<>();
```

## put

```java
usersById.put(user.getId(), user);
```

## get

```java
User user = usersById.get(1L);
```

## getOrDefault

```java
int count = counts.getOrDefault("Java", 0);
```

## putIfAbsent

```java
usersById.putIfAbsent(user.getId(), user);
```

## computeIfAbsent

Sehr wichtig:

```java
Map<String, List<User>> usersByCountry = new HashMap<>();

usersByCountry
    .computeIfAbsent("DE", key -> new ArrayList<>())
    .add(user);
```

## merge

Sehr nützlich für Counter:

```java
Map<String, Integer> counts = new HashMap<>();

counts.merge("Java", 1, Integer::sum);
```

## entrySet

```java
for (Map.Entry<Long, User> entry : usersById.entrySet()) {
    Long id = entry.getKey();
    User user = entry.getValue();
}
```

## Stream zu Map

```java
Map<Long, User> usersById =
    users.stream()
        .collect(Collectors.toMap(
            User::getId,
            Function.identity()
        ));
```

## Typische Aufgaben

- Lookup nach ID
- Frequency Counter
- Gruppierung
- Cache
- Index
