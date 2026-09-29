# Kapitel 19 – Page / Slice / Pageable

## Mental Model

```text
Pageable  = die Anfrage:   "Seite 2, 20 Stück, sortiert nach createdAt desc"
Slice<T>  = die Antwort:   Inhalt + "gibt es noch mehr?"                (1 Query, size + 1)
Page<T>   = die Antwort:   Inhalt + Gesamtzahl Elemente/Seiten          (Content-Query + COUNT-Query)
```

- `Page<T> extends Slice<T>` – eine Page **ist** eine Slice mit zusätzlichem Wissen über die Gesamtmenge.
- Seiten sind **0-basiert**: `PageRequest.of(0, 20)` = erste Seite.
- `offset = page * size`.
- **Slice-Trick**: Spring lädt `size + 1` Zeilen. Gibt es die `+1`-Zeile, ist `hasNext() == true`; sie wird abgeschnitten.
- **Page** braucht zusätzlich `select count(*)` → bei großen Tabellen/komplexen Joins teuer.

```text
Container<A>.map(A -> B) = Container<B>
Stream, Optional, Page, Slice – überall gleich: Metadaten bleiben, Inhalt wird transformiert.
```

## Syntax / API

### Pageable bauen

```java
Pageable pageable = PageRequest.of(0, 20);
Pageable sorted   = PageRequest.of(0, 20, Sort.by("createdAt").descending());
Pageable byDir    = PageRequest.of(2, 50, Sort.Direction.ASC, "lastName", "firstName");
Pageable next     = pageable.next();          // Seite + 1
Pageable all      = Pageable.unpaged();
```

### Repository

```java
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Page<UserEntity>  findByActiveTrue(Pageable pageable);     // + COUNT
    Slice<UserEntity> findByRole(Role role, Pageable pageable); // kein COUNT
    List<UserEntity>  findByLastName(String name, Pageable p);  // nur LIMIT/OFFSET, keine Metadaten
}

// findAll(Pageable) aus PagingAndSortingRepository liefert Page<T>
```

### API von Slice / Page

```java
Slice<T>: getContent(), getNumber(), getSize(), getNumberOfElements(),
          hasNext(), hasPrevious(), isFirst(), isLast(), hasContent(),
          nextPageable(), getSort(), map(Function<T, R>)

Page<T>:  + getTotalElements(), getTotalPages()
```

`totalPages = ceil(totalElements / size)` → in Integer-Arithmetik: `(total + size - 1) / size`.

### Service mit Mapping

```java
@Service
@Transactional(readOnly = true)
public class UserQueryService {
    private final UserRepository repository;
    private final UserMapper mapper;

    public UserQueryService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public Slice<UserDto> getUsers(Pageable pageable) {
        return repository.findByActiveTrue(pageable).map(mapper::toDto);
    }
}
```

### Controller

```java
@GetMapping("/api/users")
public Slice<UserDto> list(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return service.getUsers(pageable);
}
// GET /api/users?page=1&size=50&sort=lastName,asc&sort=firstName
```

Globale Grenze: `spring.data.web.pageable.max-page-size=100` (Default 2000).

Stabiles JSON: statt `PageImpl` direkt zu serialisieren eigenes DTO oder `PagedModel` (`@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)`, Boot 3.3+).

```java
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }
}
```

### Count-Query bei @Query

```java
@Query(value = "select o from OrderEntity o join o.customer c where c.country = :country",
       countQuery = "select count(o) from OrderEntity o join o.customer c where c.country = :country")
Page<OrderEntity> findByCountry(@Param("country") String country, Pageable pageable);
```

## Typische Use Cases

| Anforderung                                  | Wahl    |
|----------------------------------------------|---------|
| „Seite 3 von 17“, Seitenzahlen, Gesamtanzahl | `Page`  |
| Infinite Scroll, „Mehr laden“                | `Slice` |
| Batch-Verarbeitung großer Tabellen           | `Slice` (oder Keyset/Streaming) |
| Nur „die ersten N“                           | `List` + `Top N` / `Pageable`   |

## Clean-Code-Empfehlungen

- **Immer sortieren** beim Paginieren – ohne `ORDER BY` ist die Reihenfolge undefiniert, Elemente können doppelt/fehlend erscheinen.
- Eindeutiges Tie-Breaker-Feld (`id`) zur Sortierung hinzufügen.
- `Slice` als Default, wenn keine Gesamtzahl gebraucht wird.
- `map(mapper::toDto)` statt manuell `new PageImpl<>(content.stream().map(...).toList(), ...)`.
- Maximale Page-Size begrenzen (DoS-Schutz).
- Große Offsets sind langsam (DB muss übersprungene Zeilen lesen) → für tiefe Pagination **Keyset Pagination** (`where id > :lastId order by id limit :size`, Spring Data: `ScrollPosition`/`Window`).

## Häufige Fehler

```java
// falsch: ganze Tabelle laden, in Java paginieren
List<UserEntity> all = repository.findAll();
List<UserEntity> page = all.subList(page * size, page * size + size);

// richtig
repository.findAll(PageRequest.of(page, size, Sort.by("id")));
```

```java
// falsch: Page -> Liste -> neue PageImpl, Metadaten per Hand
Page<UserEntity> p = repository.findAll(pageable);
return new PageImpl<>(p.getContent().stream().map(mapper::toDto).toList());  // total & pageable verloren!

// richtig
return repository.findAll(pageable).map(mapper::toDto);
```

```java
// falsch: 1-basiert gedacht
PageRequest.of(1, 20);   // ist die ZWEITE Seite

// falsch: Page, obwohl die UI nur "Mehr laden" hat -> unnötiger COUNT(*)
Page<PostEntity> feed = repository.findByAuthorId(authorId, pageable);
```

- JOIN FETCH einer Collection + Pagination → Hibernate paginiert **im Speicher** (Warnung `HHH90003004` / „firstResult/maxResults specified with collection fetch“).

## Interview-relevante Details

- **Page vs. Slice**: Page = zusätzliche COUNT-Query, kennt `totalElements`/`totalPages`. Slice = nur `hasNext` über `size + 1`-Trick, billiger.
- **Wie weiß Slice `hasNext`?** Es werden `size + 1` Datensätze abgefragt.
- **`map` auf Page/Slice** behält Pageable, Sort, `hasNext` und `total` – nur der Inhalt wird transformiert (Functor).
- **Offset vs. Keyset**: Offset einfach, aber O(offset) und instabil bei Inserts; Keyset stabil und schnell, aber kein Springen zu Seite N.
- Letzte Seite: `isLast() == !hasNext()`. Leere Tabelle: `totalPages == 0`, `isLast() == true`.
- **Page-Optimierung**: Spring überspringt die COUNT-Query, wenn die erste Seite nicht voll ist (Total ist dann bekannt).

## Zusammenfassung

- `Pageable` = Anfrage (page, size, sort); `Slice` = Inhalt + hasNext; `Page` = Slice + Gesamtzahlen.
- Slice: 1 Query mit `size + 1`. Page: Content-Query + COUNT.
- `repository.findX(pageable).map(mapper::toDto)` ist das Standard-Muster.
- Immer deterministisch sortieren, Page-Size begrenzen, tiefe Pagination per Keyset.
