# Kapitel 18 – Spring Data

## Mental Model

```text
Du schreibst:   interface UserRepository extends JpaRepository<UserEntity, Long>
Spring erzeugt: zur Laufzeit eine Proxy-Implementierung (SimpleJpaRepository + Query-Ableitung)
```

- Du deklarierst **was** du willst (Methodenname, `@Query`), Spring generiert **wie** (JPQL/SQL).
- Rückgabetyp bestimmt die Semantik: `Optional<T>` (0..1), `List<T>` (0..n), `Page<T>`/`Slice<T>` (paginiert), `boolean`/`long` (exists/count), `Stream<T>` (lazy, in Transaktion).
- Spring Data ersetzt **nicht** das Verständnis von SQL, Indizes und JPA-Fetching.

## Syntax / API

### Repository-Hierarchie

```text
Repository<T, ID>                 Marker
 └─ CrudRepository<T, ID>         save, findById, existsById, findAll, deleteById, count
     └─ ListCrudRepository         findAll() liefert List statt Iterable (Boot 3)
 └─ PagingAndSortingRepository     findAll(Sort), findAll(Pageable)
      └─ JpaRepository<T, ID>     flush, saveAndFlush, deleteAllInBatch, getReferenceById ...
```

```java
public interface UserRepository extends JpaRepository<UserEntity, Long> {
}
```

### Wichtige Standardmethoden

```java
Optional<UserEntity> findById(Long id);
List<UserEntity> findAll();
List<UserEntity> findAllById(Iterable<Long> ids);   // 1 Query mit IN (...)
<S extends UserEntity> S save(S entity);           // persist oder merge
boolean existsById(Long id);
long count();
void deleteById(Long id);
UserEntity getReferenceById(Long id);               // Proxy ohne SELECT
```

### Derived Queries

```java
Optional<UserEntity> findByEmail(String email);
Optional<UserEntity> findByEmailIgnoreCase(String email);
List<UserEntity> findByActiveTrue();
List<UserEntity> findByLastNameOrderByFirstNameAsc(String lastName);
List<UserEntity> findByCreatedAtAfter(Instant since);
List<UserEntity> findByAgeBetween(int min, int max);
List<UserEntity> findByRoleIn(Collection<Role> roles);
List<UserEntity> findByNameContainingIgnoreCase(String part);
List<UserEntity> findTop10ByOrderByCreatedAtDesc();
Optional<UserEntity> findFirstByOrderByCreatedAtAsc();
boolean existsByEmail(String email);
long countByActiveTrue();
long deleteByActiveFalse();                    // braucht @Transactional
List<OrderEntity> findByCustomerId(Long customerId);   // Property-Traversal customer.id
```

Schlüsselwörter: `And`, `Or`, `Is/Equals`, `Not`, `LessThan`, `GreaterThanEqual`, `Between`, `IsNull`, `IsNotNull`, `Like`, `StartingWith`, `Containing`, `In`, `True/False`, `IgnoreCase`, `OrderBy...Asc/Desc`, `Top/First`, `Distinct`.

### @Query (JPQL und native)

```java
@Query("select u from UserEntity u where u.active = true and u.lastLogin < :before")
List<UserEntity> findInactiveSince(@Param("before") Instant before);

@Query(value = "select * from users where email like %:domain", nativeQuery = true)
List<UserEntity> findByDomainNative(@Param("domain") String domain);

@Modifying(clearAutomatically = true)
@Query("update UserEntity u set u.active = false where u.lastLogin < :before")
int deactivateInactiveSince(@Param("before") Instant before);   // im @Transactional Service aufrufen
```

JPQL arbeitet mit **Entity- und Feldnamen**, nicht mit Tabellen-/Spaltennamen.

### Sort & Pageable

```java
Sort sort = Sort.by("lastName").ascending().and(Sort.by("createdAt").descending());
List<UserEntity> users = repository.findByActiveTrue(sort);

Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
Page<UserEntity> page = repository.findAll(pageable);
```

### Projections

```java
// Interface-Projection: nur benötigte Spalten
public interface UserSummary {
    Long getId();
    String getEmail();
}
List<UserSummary> findByActiveTrue();

// DTO-Projection mit Record
public record UserNameDto(Long id, String fullName) {}

@Query("select new com.example.user.UserNameDto(u.id, concat(u.firstName, ' ', u.lastName)) from UserEntity u")
List<UserNameDto> findAllNames();
```

## Typische Use Cases

- Lookup nach fachlichem Schlüssel: `findByEmail` → `Optional`.
- Uniqueness-Check vor dem Anlegen: `existsByEmail`.
- Filter + Sortierung: Derived Query mit `Sort`- oder `Pageable`-Parameter.
- Komplexe Joins, Aggregationen, Reports: `@Query` / DTO-Projection.
- Bulk-Updates: `@Modifying @Query`.

## Clean-Code-Empfehlungen

- Derived Queries für **einfache** Bedingungen; ab ~3 Kriterien oder langen Namen → `@Query` mit sprechendem Methodennamen.
- `Optional<T>` für „0 oder 1“, niemals `null` zurückgeben.
- Repository gibt Entities oder Projections zurück – **keine** API-DTOs aus dem Web-Layer.
- Sortier-Properties aus Requests **whitelisten** (sonst Fehler/Info-Leak bei unbekannten Feldern).
- Keine Business-Logik als `default`-Methoden im Repository.
- Für Leselisten Projections statt ganzer Entity-Graphen.

## Häufige Fehler

```java
// falsch: Rückgabetyp passt nicht zur Semantik – bei 2 Treffern IncorrectResultSizeDataAccessException
UserEntity findByLastName(String lastName);

// richtig
List<UserEntity> findByLastName(String lastName);
Optional<UserEntity> findByEmail(String email);   // Email ist unique
```

```java
// falsch: Property existiert nicht -> Context-Start schlägt fehl (PropertyReferenceException)
List<UserEntity> findByMail(String mail);   // Feld heißt "email"
```

```java
// falsch: Tabellen-/Spaltennamen in JPQL
@Query("select * from users u where u.last_name = :name")

// richtig: Entity-/Feldnamen
@Query("select u from UserEntity u where u.lastName = :name")
```

```java
// falsch: findAll() + Filtern in Java
repository.findAll().stream().filter(UserEntity::isActive).toList();

// richtig: Filter in der DB
repository.findByActiveTrue();
```

- `@Modifying` vergessen → `InvalidDataAccessApiUsageException`; ohne Transaktion → `TransactionRequiredException`.
- `existsBy...` statt `findBy...().isPresent()` – lädt keine Entity.
- `getReferenceById` bei nicht existierender ID → Fehler erst beim Zugriff (`EntityNotFoundException`).

## Interview-relevante Details

- **`save()`**: neue Entity (ID `null` bzw. `isNew()`) → `persist`, sonst `merge`. Rückgabewert verwenden – bei `merge` ist es eine andere Instanz.
- **`findById` vs. `getReferenceById`**: SELECT sofort + `Optional` vs. Lazy-Proxy ohne SELECT (nützlich, um nur eine FK-Referenz zu setzen).
- **`CrudRepository` vs. `JpaRepository`**: letzteres hat JPA-spezifisches (`flush`, Batch-Deletes, `List`-Rückgaben).
- **`deleteAll()` vs. `deleteAllInBatch()`**: lädt jede Entity und löscht einzeln (Callbacks, Cascade) vs. ein `DELETE`-Statement.
- **Query-Ableitung wird beim Start validiert** → Tippfehler brechen den Start, nicht erst die Laufzeit.
- **`Stream<T>`-Rückgabe** braucht offene Transaktion und `try-with-resources`.
- **Specifications / Querydsl** für dynamische Filter mit vielen optionalen Kriterien.

## Zusammenfassung

- Interface deklarieren, Spring implementiert – Methodenname oder `@Query` definiert die Abfrage.
- Rückgabetyp = Vertrag: `Optional`, `List`, `Page`, `Slice`, `boolean`, `long`.
- Filtern, Sortieren und Paginieren in der DB, nicht in Java.
- Projections für schlanke Lese-Queries; `@Modifying` für Bulk-Updates.
