# Kapitel 02 – Collections

## Wichtigste Interfaces

```java
List<T>
Set<T>
Map<K, V>
Queue<T>
```

## List

```java
List<String> names = new ArrayList<>();
names.add("Jan");
```

Immutable:

```java
List<String> names = List.of("Jan", "Anna", "Peter");
```

## Set

Keine Duplikate:

```java
Set<String> roles = new HashSet<>();
roles.add("ADMIN");
roles.add("USER");
```

## Map

```java
Map<Long, User> users = new HashMap<>();
users.put(user.getId(), user);
```

## Iteration

```java
for (User user : users) {
    System.out.println(user.getName());
}
```

Map:

```java
for (Map.Entry<Long, User> entry : users.entrySet()) {
    System.out.println(entry.getKey());
    System.out.println(entry.getValue());
}
```

oder:

```java
users.forEach((id, user) ->
    System.out.println(id + ": " + user.getName())
);
```

## Wann welche Struktur?

| Struktur | Use Case |
|---|---|
| `ArrayList` | Standardliste |
| `HashSet` | eindeutige Werte |
| `HashMap` | Key/Value-Lookup |
| `LinkedHashMap` | Map + Einfügereihenfolge |
| `TreeMap` | sortierte Keys |
| `TreeSet` | sortierte eindeutige Werte |
| `ArrayDeque` | Queue / Stack |
