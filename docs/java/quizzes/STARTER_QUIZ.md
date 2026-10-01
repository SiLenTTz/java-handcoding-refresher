# Starter Quiz – Java Refresher

## Recall

1. Unterschied zwischen `List` und `Set`?
2. Wann benutzt du eine `Map`?
3. Was macht `computeIfAbsent()`?
4. Unterschied `map()` vs `flatMap()`?
5. Was liefert `findFirst()`?
6. Wann benutzt du `Optional`?
7. Warum sollte eine Entity nicht direkt als REST Response dienen?
8. Unterschied `Page` und `Slice`?
9. Was bedeutet PECS?
10. Warum ist Constructor Injection besser als Field Injection?

## Code Reading

### Aufgabe 1

```java
List<String> names =
    users.stream()
        .filter(User::isActive)
        .map(User::getName)
        .toList();
```

Fragen:

- Welcher Typ ist `names`?
- Was passiert in welcher Reihenfolge?

### Aufgabe 2

```java
users.stream()
    .map(User::getName)
    .filter(User::isActive)
    .toList();
```

Frage:

Warum kompiliert das nicht?

### Aufgabe 3

```java
Map<String, Integer> counts = new HashMap<>();
counts.merge("Java", 1, Integer::sum);
```

Was passiert bei erstem und zweitem Aufruf?
