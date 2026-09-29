# Kapitel 01 – Java Core

## Klassen

```java
public class User {

    private final Long id;
    private String name;

    public User(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void rename(String name) {
        this.name = name;
    }
}
```

## `final`

Bevorzuge:

```java
private final String name;
```

wenn sich der Wert nicht ändern muss.

## Primitive vs Wrapper

Primitive:

```java
int number = 10;
long timestamp = 123L;
double price = 19.99;
boolean active = true;
```

Wrapper:

```java
Integer
Long
Double
Boolean
```

Wrapper können `null` sein.

## String-Vergleich

Falsch:

```java
if (name == "Jan") {
}
```

Richtig:

```java
if ("Jan".equals(name)) {
}
```

oder:

```java
Objects.equals(name, "Jan");
```

## Moderne Switch Expression

```java
String result = switch (status) {
    case ACTIVE -> "Active";
    case BLOCKED -> "Blocked";
    case DELETED -> "Deleted";
};
```

## `var`

Gut:

```java
var users = new ArrayList<User>();
```

wenn der Typ klar erkennbar ist.

Weniger gut:

```java
var result = service.execute();
```

wenn dadurch die Lesbarkeit sinkt.

## Wiederholungsfragen

1. Unterschied `int` / `Integer`?
2. Warum ist `==` bei Strings problematisch?
3. Wann sollte ein Feld `final` sein?
4. Was ist eine Switch Expression?
5. Wann verschlechtert `var` die Lesbarkeit?
