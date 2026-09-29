# Kapitel 21 – JPA Performance

## Mental Model

```text
Jeder Zugriff auf eine Lazy-Beziehung kann eine eigene Query auslösen.

  select * from orders                      -> 100 Orders          1 Query
  for (Order o : orders) o.getCustomer()... -> 100x select customer  N Queries
                                                                   ─────────
                                               N + 1 = 101 Statements

Ziel: die Anzahl der Statements ist eine Funktion der ABFRAGE, nicht der Ergebnismenge.

  JOIN FETCH / @EntityGraph   -> 1
  @BatchSize(size = 25)       -> 1 + ceil(N / 25)
  DTO-Projection              -> 1 (und weniger Spalten, keine Entities im Context)
```

Performance in JPA heißt fast immer: **wie viele Statements**, **wie viele Zeilen** und **wie viele Objekte im Persistence Context**. Alles drei kannst du messen – rate nie.

## Syntax / API

### N+1 erkennen

```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE

spring.jpa.properties.hibernate.generate_statistics=true
```

```java
Statistics stats = entityManager.getEntityManagerFactory()
        .unwrap(SessionFactory.class).getStatistics();
long queries = stats.getPrepareStatementCount();
```

Im Test lässt sich damit hart zusichern: „dieser Use Case darf höchstens 3 Statements erzeugen“.

### Lösung 1: JOIN FETCH

```java
@Query("select distinct o from OrderEntity o join fetch o.customer where o.status = :status")
List<OrderEntity> findByStatusWithCustomer(@Param("status") OrderStatus status);
```

`join fetch` lädt die Beziehung im selben Statement. `distinct` bzw. `hibernate.query.passDistinctThrough=false` verhindert Duplikate bei Collection-Joins (ab Hibernate 6 dedupliziert Hibernate selbst).

### Lösung 2: @EntityGraph

```java
@EntityGraph(attributePaths = { "customer", "items" })
List<OrderEntity> findByStatus(OrderStatus status);

@EntityGraph(attributePaths = "items")
Optional<OrderEntity> findWithItemsById(Long id);
```

Deklarativ, kombinierbar mit Derived Queries – und im Gegensatz zu `join fetch` änderst du die JPQL nicht.

### Lösung 3: Batch Fetching

```java
@Entity
public class OrderEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @BatchSize(size = 25)                      // org.hibernate.annotations.BatchSize
    private CustomerEntity customer;
}
```

```properties
spring.jpa.properties.hibernate.default_batch_fetch_size=25
```

Statt `N` Einzelselects lädt Hibernate `where id in (?, ?, ... )` in Blöcken → `1 + ceil(N / size)` Statements.

### Lösung 4: Projektionen statt Entities

```java
public record OrderListItem(Long id, String orderNumber, String customerName, BigDecimal total) {}

@Query("""
    select new com.example.order.OrderListItem(o.id, o.orderNumber, c.name, o.total)
      from OrderEntity o
      join o.customer c
     where o.status = :status
    """)
List<OrderListItem> findListItems(@Param("status") OrderStatus status);
```

Vorteile: nur benötigte Spalten, ein Join, keine Entities im Persistence Context (kein Dirty Checking, weniger Speicher).

### Pagination + Collection-Join

```java
// Warnung: HHH000104: firstResult/maxResults specified with collection fetch; applying in memory
@Query("select o from OrderEntity o join fetch o.items")
Page<OrderEntity> findAllWithItems(Pageable pageable);
```

Hibernate lädt **alle** Zeilen und paginiert im Speicher. Lösung: zwei Queries.

```java
// 1. Query: nur IDs paginieren (keine Collection im Fetch)
Page<Long> ids = repository.findIdsByStatus(status, pageable);

// 2. Query: die Entities zu diesen IDs mit Collection laden
List<OrderEntity> orders = repository.findAllWithItemsByIdIn(ids.getContent());

return new PageImpl<>(orders, pageable, ids.getTotalElements());
```

Alternative: Root paginiert laden und die Collections per `@BatchSize` bzw. `default_batch_fetch_size` nachladen.

### Cartesian Product bei mehreren Collections

```java
// zwei Collection-Joins: 10 items x 4 payments = 40 Zeilen pro Order
@Query("select o from OrderEntity o join fetch o.items join fetch o.payments")
```

Regel: **höchstens eine Collection pro Fetch-Join**. Die zweite über eine separate Query oder `@BatchSize` laden. Hibernate wirft bei zwei `Bag`-Fetches sogar `MultipleBagFetchException`.

### readOnly-Transaktionen

```java
@Transactional(readOnly = true)
public Page<OrderListItem> search(SearchQuery query, Pageable pageable) { ... }
```

Kein automatischer Flush, keine Dirty-Check-Snapshots → weniger CPU und Speicher bei großen Leselisten.

### Bulk Updates

```java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("update OrderEntity o set o.status = :status where o.createdAt < :before")
int bulkUpdateStatus(@Param("status") OrderStatus status, @Param("before") Instant before);
```

Bulk-Statements gehen **am Persistence Context vorbei**: bereits geladene Entities behalten ihre alten Werte, `@PreUpdate`-Callbacks und `@Version` greifen nicht. Deshalb `flushAutomatically` (Änderungen vorher rausschreiben) und `clearAutomatically` (Context danach leeren).

### Second-Level-Cache (kurz)

```java
@Entity
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class CountryEntity { ... }
```

```properties
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
spring.jpa.properties.hibernate.cache.use_query_cache=true
```

Lohnt sich nur für kleine, selten geänderte Referenzdaten. Erst Queries reparieren, dann cachen.

### Indizes

```java
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_orders_status_created", columnList = "status, created_at"),
    @Index(name = "idx_orders_customer", columnList = "customer_id")
})
public class OrderEntity { ... }
```

Jede Fremdschlüsselspalte und jede häufige `where`/`order by`-Kombination braucht einen Index. Mit `EXPLAIN ANALYZE` prüfen, ob er benutzt wird.

### open-in-view

```properties
spring.jpa.open-in-view=false
```

Damit knallt ein Lazy-Zugriff außerhalb der Transaktion sofort als `LazyInitializationException`, statt still im View-Layer N+1-Queries zu erzeugen.

## Typische Use Cases

| Situation                                        | Mittel                                          |
|--------------------------------------------------|-------------------------------------------------|
| Listen-Endpoint mit wenigen Feldern              | DTO-Projection                                   |
| Detailseite mit einem Objektgraphen              | `@EntityGraph` / `join fetch`                    |
| Viele `@ManyToOne` in einer Liste                | `@BatchSize` / `default_batch_fetch_size`        |
| Paginierte Liste mit Kindern                     | IDs paginieren + zweite Query, oder `@BatchSize` |
| Massenänderung über tausende Zeilen              | `@Modifying`-Bulk-Update                         |
| Kleine, statische Stammdaten                     | Second-Level-Cache                               |

## Clean-Code-Empfehlungen

- `FetchType.LAZY` für **alle** Beziehungen; `EAGER` nie als Reparatur für N+1.
- Fetch-Strategie am **Use Case** entscheiden, nicht am Entity-Mapping.
- Lese-Endpoints liefern DTOs, nicht Entities – das verhindert N+1 bereits beim Design.
- Eine Query-Zähl-Assertion im Integrationstest ist billiger als jede spätere Analyse.
- Erst messen (SQL-Log/Statistics), dann optimieren; danach erneut messen.
- Keine Schleife um `repository.findById(...)` – `findAllById(...)` oder ein Join.
- Fachlich gleiche Queries nicht mehrfach in Varianten kopieren, sondern `@EntityGraph` auf einer Query wiederverwenden.

## Häufige Fehler

```java
// falsch: klassisches N+1 (1 + 100 Statements)
List<OrderEntity> orders = repository.findAll();
orders.forEach(o -> System.out.println(o.getCustomer().getName()));

// richtig: eine Query
List<OrderEntity> orders = repository.findAllWithCustomer();   // @EntityGraph oder join fetch
```

```java
// falsch: EAGER als "Lösung" – lädt den Graphen bei JEDER Query, auch wenn er nicht gebraucht wird
@ManyToOne(fetch = FetchType.EAGER)
private CustomerEntity customer;

// richtig
@ManyToOne(fetch = FetchType.LAZY)
private CustomerEntity customer;
```

```java
// falsch: N Einzelselects in einer Schleife
List<UserEntity> users = ids.stream().map(id -> repository.findById(id).orElseThrow()).toList();

// richtig: eine IN-Query
List<UserEntity> users = repository.findAllById(ids);
```

```java
// falsch: Pagination auf einem Collection-Fetch -> HHH000104, alles im Speicher
@Query("select o from OrderEntity o join fetch o.items")
Page<OrderEntity> findAll(Pageable pageable);

// richtig: erst IDs paginieren, dann die Collection zu diesen IDs laden
Page<Long> ids = repository.findIdsBy(pageable);
List<OrderEntity> orders = repository.findAllWithItemsByIdIn(ids.getContent());
```

```java
// falsch: Bulk-Update ohne clearAutomatically -> geladene Entities zeigen veraltete Werte
@Modifying
@Query("update OrderEntity o set o.status = 'CANCELLED' where o.id in :ids")
int cancel(@Param("ids") List<Long> ids);

// richtig
@Modifying(clearAutomatically = true, flushAutomatically = true)
```

```java
// falsch: in Java filtern und aggregieren
BigDecimal sum = repository.findAll().stream()
        .filter(o -> o.getStatus() == PAID)
        .map(OrderEntity::getTotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

// richtig: in der DB aggregieren
BigDecimal sum = repository.sumTotalByStatus(PAID);
```

## Interview-relevante Details

- **Was ist N+1?** Eine Query für die Wurzelobjekte plus je eine Query pro Objekt für eine Beziehung. Erkennbar im SQL-Log oder über `Statistics.getPrepareStatementCount()`.
- **`join fetch` vs. `@EntityGraph`**: gleiches Ergebnis (ein Statement), aber Graph ist deklarativ und ohne eigene JPQL kombinierbar.
- **Warum löst `EAGER` das Problem nicht?** Es verlagert es nur: der Graph wird immer geladen, auch dort, wo er nicht gebraucht wird – und bei Queries erzeugt Hibernate trotzdem Einzelselects.
- **Wie viele Statements bei `@BatchSize(25)` und 100 Parents?** `1 + ceil(100 / 25) = 5`.
- **HHH000104** bedeutet: Pagination plus Collection-Fetch – Hibernate paginiert im Speicher. Zwei-Query-Ansatz oder Batch Fetching.
- **`MultipleBagFetchException`**: zwei `List`-Collections gleichzeitig per Fetch-Join. Lösung: `Set` verwenden oder getrennt laden.
- **Bulk-Update und Cache**: umgeht den First-Level-Cache und den Second-Level-Cache, Callbacks und `@Version`.
- **`open-in-view`**: Default `true` in Spring Boot – abschalten, damit Lazy-Fehler früh und laut auftreten.
- **Warum DTO-Projection schneller ist**: weniger Spalten, keine Snapshots, kein Dirty Checking, kein Proxy-Overhead.
- **Was ist ein Cartesian Product?** Zwei Collection-Joins multiplizieren die Zeilenzahl (`items × payments`) – der Speicherverbrauch explodiert, obwohl das Objektergebnis gleich aussieht.

## Zusammenfassung

- N+1 ist der Standardfehler: 1 Query für die Wurzeln, N für die Beziehung.
- Werkzeugkasten: `join fetch`, `@EntityGraph`, `@BatchSize`/`default_batch_fetch_size`, DTO-Projection, gezielte Query.
- `LAZY` überall, Fetching pro Use Case entscheiden – `EAGER` ist keine Lösung.
- Pagination und Collection-Fetch vertragen sich nicht: IDs paginieren und in einer zweiten Query nachladen.
- Bulk-Updates sind schnell, umgehen aber den Persistence Context → `flushAutomatically` + `clearAutomatically`.
- Messen mit SQL-Log und `generate_statistics`, `open-in-view=false`, Indizes auf Fremdschlüssel und Filterspalten.
