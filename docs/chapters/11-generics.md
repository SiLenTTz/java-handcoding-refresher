# Kapitel 11 – Generics

## Generische Klasse

```java
public class Result<T> {

    private final T value;

    public Result(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }
}
```

## Generische Methode

```java
public <T> T first(List<T> values) {
    return values.getFirst();
}
```

## Wildcards

```java
List<? extends Number>
```

## PECS

```text
Producer Extends
Consumer Super
```

Faustregel:

- liest du Werte aus einer Struktur: `? extends T`
- schreibst du Werte hinein: `? super T`
