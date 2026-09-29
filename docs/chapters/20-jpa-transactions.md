# Kapitel 20 – JPA & Transactions

## Typische Annotationen

```java
@Entity
@Id
@GeneratedValue
@OneToMany
@ManyToOne
@OneToOne
@ManyToMany
```

## Lazy Loading

Beziehungen häufig lieber:

```java
FetchType.LAZY
```

Nicht reflexartig alles auf:

```java
FetchType.EAGER
```

stellen.

## Transaction

```java
@Transactional
public void updateUser(...) {
}
```

Read-only:

```java
@Transactional(readOnly = true)
public UserDto getUser(...) {
}
```

## Faustregel

Transaktionsgrenzen gehören meistens in den Service Layer.

Eine Transaktion sollte eine fachliche Operation sinnvoll kapseln.
