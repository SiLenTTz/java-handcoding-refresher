# Kapitel 12 – Lambdas & Functional Interfaces

## Lambda

```java
user -> user.getName()
```

## Method Reference

```java
User::getName
```

## Predicate

```java
Predicate<User> active =
    User::isActive;
```

```text
T → boolean
```

## Function

```java
Function<User, String> getName =
    User::getName;
```

```text
T → R
```

## Consumer

```java
Consumer<User> printUser =
    System.out::println;
```

```text
T → void
```

## Supplier

```java
Supplier<User> createUser =
    User::new;
```

```text
() → T
```
