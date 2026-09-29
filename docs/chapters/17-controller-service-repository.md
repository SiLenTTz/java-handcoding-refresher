# Kapitel 17 – Controller / Service / Repository

## Mental Model

```text
HTTP ──> Controller ──> Service ──> Repository ──> DB
          (DTOs)      (Entities +     (Entities)
                       Business,
                       @Transactional)
       <── Response DTO <── Mapper <──
```

| Layer          | Verantwortung                                         | Kennt            |
|----------------|-------------------------------------------------------|------------------|
| Controller     | HTTP: Routing, Validierung, Status Codes, DTOs        | Service, DTOs    |
| Service        | Business-Regeln, Orchestrierung, Transaktionen        | Repository, Mapper, Entities |
| Repository     | Persistence, Queries                                  | Entities         |
| Mapper         | Entity ↔ DTO                                          | beide            |
| ControllerAdvice | Exception → HTTP-Response                           | Exceptions, Error-DTO |

Abhängigkeiten zeigen **nur nach innen/unten**. Das Repository kennt keine DTOs, der Controller kein Repository.

## Syntax / API

### DTOs & Entity

```java
public record CreateProductRequest(
        @NotBlank String name,
        @NotNull @Positive BigDecimal price) {}

public record ProductResponse(Long id, String name, BigDecimal price) {}

@Entity
@Table(name = "products")
public class ProductEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private BigDecimal price;
    protected ProductEntity() {}            // für JPA
    public ProductEntity(String name, BigDecimal price) { this.name = name; this.price = price; }
    // Getter, fachliche Methoden (changePrice ...)
}
```

### Repository

```java
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    boolean existsByNameIgnoreCase(String name);
}
```

### Mapper

```java
@Component
public class ProductMapper {
    public ProductResponse toResponse(ProductEntity e) {
        return new ProductResponse(e.getId(), e.getName(), e.getPrice());
    }
    public ProductEntity toEntity(CreateProductRequest r) {
        return new ProductEntity(r.name(), r.price());
    }
}
```

### Service

```java
@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository repository;
    private final ProductMapper mapper;

    public ProductService(ProductRepository repository, ProductMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ProductResponse getProduct(Long id) {
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (repository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateProductException(request.name());
        }
        ProductEntity saved = repository.save(mapper.toEntity(request));
        return mapper.toResponse(saved);
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) { this.service = service; }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.getProduct(id);                       // 200 OK
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse created = service.create(request);
        URI location = URI.create("/api/products/" + created.id());
        return ResponseEntity.created(location).body(created); // 201 + Location
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
```

Weitere Parameter: `@RequestParam(defaultValue = "0") int page`, `@RequestHeader`, `@PutMapping`, `@PatchMapping`.

### Globales Error Handling

```java
public record ApiError(int status, String message) {}

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiError handleNotFound(ProductNotFoundException ex) {
        return new ApiError(404, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new ApiError(400, msg));
    }
}
```

Alternative in Boot 3: `ProblemDetail` (RFC 7807/9457) als Response-Typ, `spring.mvc.problemdetails.enabled=true`.

## Typische Use Cases

- `GET /{id}` → `findById` + `orElseThrow(NotFound)` → 404 via Advice.
- `POST` → Validierung (`@Valid`) → Uniqueness-Check → `save` → 201 + `Location`.
- `PUT /{id}` → laden, Entity fachlich ändern (Dirty Checking speichert), DTO zurück.
- Listen → `Pageable`/`Slice` (Kapitel 19).

## Clean-Code-Empfehlungen

- **Thin Controller**: keine Business-Logik, kein Repository-Zugriff, kein try/catch für Fachfehler.
- **Entities nie direkt als API-Response** – eigene Request/Response-DTOs (Records).
- Getrennte DTOs pro Use Case: `CreateXRequest`, `UpdateXRequest`, `XResponse`.
- Fachliche Exceptions (`ProductNotFoundException extends RuntimeException`) im Service werfen, zentral mappen.
- `@Transactional` im Service, nicht im Controller oder Repository.
- Services geben DTOs zurück (dann bleibt Lazy Loading innerhalb der Transaktion).

## Häufige Fehler

```java
// falsch: Controller macht alles, Entity nach außen, Optional.get()
@GetMapping("/{id}")
public ProductEntity get(@PathVariable Long id) {
    return repository.findById(id).get();   // NoSuchElementException -> 500
}

// richtig
@GetMapping("/{id}")
public ProductResponse get(@PathVariable Long id) {
    return service.getProduct(id);          // NotFound -> 404 via Advice
}
```

```java
// falsch: Validierung wird ohne @Valid nie ausgeführt
public ResponseEntity<ProductResponse> create(@RequestBody CreateProductRequest r)

// richtig
public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest r)
```

```java
// falsch: 200 für "angelegt", null für "nicht gefunden"
return ResponseEntity.ok(service.create(request));
return service.find(id).orElse(null);

// richtig: 201 Created + Location; 404 über Exception
```

- `@Controller` statt `@RestController` → Spring sucht eine View statt JSON zu schreiben.
- `@PathVariable` / `@RequestParam` verwechselt: `/products/{id}` vs. `/products?id=1`.
- Repository wirft `EmptyResultDataAccessException` / Service gibt `Optional` bis zum Controller durch – Entscheidung „not found“ gehört in den Service.

## Interview-relevante Details

- **`@RestController`** = `@Controller` + `@ResponseBody` (Rückgabe wird per Jackson serialisiert).
- **Status Codes**: 200 OK, 201 Created (+ Location), 204 No Content, 400 Bad Request (Validierung), 404 Not Found, 409 Conflict (Duplikat/Version), 422 (fachlich ungültig, optional), 500.
- **`@Valid`** triggert Bean Validation (`jakarta.validation.constraints.*`); Fehler → `MethodArgumentNotValidException` → default 400.
- **`@RestControllerAdvice`** = `@ControllerAdvice` + `@ResponseBody`; `@ExceptionHandler` spezifischster Typ gewinnt.
- **Warum DTOs?** Entkopplung API ↔ DB-Schema, kein Overposting (Client setzt `id`/`role`), keine Lazy-Loading-Exceptions beim Serialisieren, keine Endlosrekursion bei bidirektionalen Beziehungen.
- **`ResponseEntity`** wenn Status/Header dynamisch sind; sonst direkt DTO + ggf. `@ResponseStatus`.

## Zusammenfassung

- Controller: HTTP ↔ DTO, dünn. Service: Regeln + Transaktion. Repository: Persistence. Mapper: Transformation.
- `findById(...).map(mapper::toResponse).orElseThrow(...)` ist das Standard-Muster.
- Fehler zentral in `@RestControllerAdvice` → saubere Status Codes.
- `@Valid @RequestBody` + Records mit Constraints für Eingaben.
