# Kapitel 23 – Refactoring

## Vorher

```java
public List<UserDto> get(List<User> users) {

    List<UserDto> result =
        new ArrayList<>();

    for (int i = 0; i < users.size(); i++) {

        if (users.get(i).isActive()) {

            UserDto dto =
                new UserDto(
                    users.get(i).getId(),
                    users.get(i).getName()
                );

            result.add(dto);
        }
    }

    return result;
}
```

## Nachher

```java
public List<UserDto> getActiveUsers(
        List<User> users) {

    return users.stream()
        .filter(User::isActive)
        .map(mapper::toDto)
        .toList();
}
```

## Typische Refactoring-Ziele

- lange Methoden
- tief verschachtelte `if`
- Magic Numbers
- Duplikation
- schlechte Namen
- falsche Verantwortlichkeiten
- Null-Missbrauch
- zu große Services
- Business Logic im Controller
