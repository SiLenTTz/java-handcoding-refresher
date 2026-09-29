# Kapitel 18 – Spring Data

## Repository

```java
public interface UserRepository
        extends JpaRepository<UserEntity, Long> {
}
```

## findById

```java
Optional<UserEntity> user =
    repository.findById(id);
```

## Derived Queries

```java
List<UserEntity> findByActiveTrue();

Optional<UserEntity> findByEmail(String email);
```

## Sort

```java
Sort sort =
    Sort.by("createdAt").descending();
```

## Pageable

```java
Pageable pageable =
    PageRequest.of(0, 20);
```

Spring Data reduziert Boilerplate, ersetzt aber nicht das Verständnis von SQL, Indizes und JPA.
