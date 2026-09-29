# Kapitel 06 – Optional

## Erzeugen

```java
Optional.of(user);
Optional.ofNullable(user);
Optional.empty();
```

## map

```java
Optional<String> name =
    user.map(User::getName);
```

## orElse

```java
String name =
    user.map(User::getName)
        .orElse("Unknown");
```

## orElseGet

```java
User user =
    repository.findById(id)
        .orElseGet(this::createDefaultUser);
```

## orElseThrow

```java
User user =
    repository.findById(id)
        .orElseThrow(() ->
            new UserNotFoundException(id)
        );
```

## Nicht ideal

```java
if (user.isPresent()) {
    User value = user.get();
}
```

Besser häufig:

```java
user.ifPresent(this::processUser);
```

## Faustregel

Gut:

```java
Optional<User> findById(...)
```

Meist nicht ideal:

```java
class User {
    Optional<String> name;
}
```

und:

```java
void create(Optional<User> user)
```
