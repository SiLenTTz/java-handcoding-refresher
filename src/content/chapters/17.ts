import type { ChapterContent } from '../types'

const userGiven = `class UserEntity {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private boolean active = true;

    UserEntity(String email, String firstName, String lastName) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    Long getId() { return id; }
    void setId(Long id) { this.id = id; }
    String getEmail() { return email; }
    String getFirstName() { return firstName; }
    String getLastName() { return lastName; }
    boolean isActive() { return active; }

    void rename(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

record UserDto(Long id, String email, String fullName) {}

interface UserRepository {
    Optional<UserEntity> findById(Long id);
    boolean existsByEmail(String email);
    UserEntity save(UserEntity entity);
}

class InMemoryUserRepository implements UserRepository {
    private final Map<Long, UserEntity> store = new HashMap<>();
    private long nextId = 1;
    int saveCalls = 0;

    public Optional<UserEntity> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }
    public boolean existsByEmail(String email) {
        return store.values().stream().anyMatch(u -> u.getEmail().equals(email));
    }
    public UserEntity save(UserEntity entity) {
        saveCalls++;
        if (entity.getId() == null) {
            entity.setId(nextId++);
        }
        store.put(entity.getId(), entity);
        return entity;
    }
}

class UserNotFoundException extends RuntimeException {
    UserNotFoundException(Long id) {
        super("User " + id + " not found");
    }
}`

const chapter: ChapterContent = {
  id: '17',
  flashcards: [
    {
      id: 'f1',
      front: 'Welche Verantwortung hat der **Controller**, welche der **Service**?',
      back: '**Controller**: HTTP – Routing, Request-DTO annehmen, `@Valid`, Status Codes, Response-DTO. **Service**: Business-Regeln, Orchestrierung, Transaktionsgrenzen.',
    },
    {
      id: 'f2',
      front: 'Standard-Muster: Service-Methode `getUser(Long id)` mit Repository, Mapper und NotFound-Exception.',
      back: `\`\`\`java
public UserDto getUser(Long id) {
    return repository.findById(id)
        .map(mapper::toDto)
        .orElseThrow(() -> new UserNotFoundException(id));
}
\`\`\``,
    },
    {
      id: 'f3',
      front: 'Was ist `@RestController`?',
      back: '`@Controller` + `@ResponseBody`: Rückgabewerte werden direkt (per Jackson als JSON) in den Response Body geschrieben statt als View-Name interpretiert.',
    },
    {
      id: 'f4',
      front: 'POST legt eine Ressource an. Wie sieht die Controller-Rückgabe aus?',
      back: `\`\`\`java
ProductResponse created = service.create(request);
return ResponseEntity
    .created(URI.create("/api/products/" + created.id()))
    .body(created);   // 201 + Location-Header
\`\`\``,
    },
    {
      id: 'f5',
      front: 'Warum gibt man Entities nicht direkt als API-Response zurück?',
      back: '- API wird an DB-Schema gekoppelt\n- Overposting / Datenlecks (z. B. `passwordHash`)\n- `LazyInitializationException` beim Serialisieren\n- Endlosrekursion bei bidirektionalen Beziehungen\n- keine Versionierung der API möglich',
    },
    {
      id: 'f6',
      front: 'Was bewirkt `@Valid` vor `@RequestBody`?',
      back: 'Bean Validation (`@NotBlank`, `@Positive`, `@Email` …) wird auf dem Request-DTO ausgeführt. Bei Verstößen: `MethodArgumentNotValidException` → standardmäßig **400 Bad Request**. Ohne `@Valid` werden die Constraints ignoriert.',
    },
    {
      id: 'f7',
      front: 'Globales Exception Handling: Skelett schreiben (NotFound → 404).',
      back: `\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiError handle(UserNotFoundException ex) {
        return new ApiError(404, ex.getMessage());
    }
}
\`\`\``,
    },
    {
      id: 'f8',
      front: '`@PathVariable` vs. `@RequestParam`?',
      back: '`@PathVariable` liest Segmente aus dem Pfad: `/users/{id}` → `/users/42`. `@RequestParam` liest Query-Parameter: `/users?active=true` (optional mit `required = false` / `defaultValue`).',
    },
    {
      id: 'f9',
      front: 'Welcher Status Code für: Anlegen, Löschen ohne Body, Validierungsfehler, Duplikat, nicht gefunden?',
      back: '201 Created, 204 No Content, 400 Bad Request, 409 Conflict, 404 Not Found.',
    },
    {
      id: 'f10',
      front: 'Welche DTOs brauchst du typischerweise für eine CRUD-Ressource `Product`?',
      back: '`CreateProductRequest`, `UpdateProductRequest`, `ProductResponse` (alles Records) – plus `ProductEntity` und `ProductMapper`. Request-DTOs enthalten keine `id`, die der Client setzen könnte.',
    },
    {
      id: 'f11',
      front: 'Wo gehört die Entscheidung „nicht gefunden → Exception“ hin – Repository, Service oder Controller?',
      back: 'In den **Service**. Das Repository liefert `Optional<T>` (neutral), der Service entscheidet fachlich (`orElseThrow`), der Advice übersetzt in HTTP 404.',
    },
    {
      id: 'f12',
      front: 'Warum sollte ein Controller kein Repository injizieren?',
      back: 'Umgeht Business-Regeln und Transaktionsgrenzen des Service, koppelt HTTP direkt an Persistence und verführt zu Logik im Controller. Controller → Service → Repository.',
    },
    {
      id: 'f13',
      front: 'Was ist `ProblemDetail` in Spring Boot 3?',
      back: 'Standardisiertes Error-Format nach RFC 9457 (`type`, `title`, `status`, `detail`, `instance`). Kann aus `@ExceptionHandler` zurückgegeben werden: `ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage())`.',
    },
    {
      id: 'f14',
      front: 'Wann `ResponseEntity<T>` statt direkt `T` zurückgeben?',
      back: 'Wenn Status oder Header dynamisch sind (201 + Location, 404 bedingt, ETag, Cache-Header). Für den statischen 200-Fall reicht das DTO; für statische andere Codes `@ResponseStatus`.',
    },
    {
      id: 'f15',
      front: 'Update-Use-Case mit JPA: Muss man nach dem Ändern der Entity `save()` aufrufen?',
      back: 'Innerhalb einer `@Transactional`-Methode nicht: die geladene Entity ist **managed**, Dirty Checking schreibt die Änderung beim Commit. `save()` schadet aber nicht (bei managed Entities ein No-Op-Merge).',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Methodensignatur passt am besten für „Produkt anlegen“ im Controller?',
      options: [
        '`public ProductEntity create(@RequestBody ProductEntity product)`',
        '`public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request)`',
        '`public void create(@PathVariable CreateProductRequest request)`',
        '`public ProductResponse create(@RequestParam CreateProductRequest request)`',
      ],
      correct: 1,
      explanation: 'Request-DTO mit `@Valid @RequestBody`, Response-DTO in `ResponseEntity`, um 201 + Location zu setzen. Entities gehören nicht in die API; `@PathVariable`/`@RequestParam` lesen keine JSON-Bodies.',
    },
    {
      id: 'q2',
      prompt: 'Was passiert hier, wenn es die ID nicht gibt?',
      code: `@GetMapping("/{id}")
public UserDto get(@PathVariable Long id) {
    return mapper.toDto(repository.findById(id).get());
}`,
      options: ['404 Not Found', '`null` wird als leerer Body zurückgegeben', '`NoSuchElementException` → 500 Internal Server Error', '204 No Content'],
      correct: 2,
      explanation: '`Optional.get()` auf leerem Optional wirft `NoSuchElementException`. Ohne Handler wird das zu 500. Richtig: `orElseThrow(() -> new UserNotFoundException(id))` + Advice → 404.',
    },
    {
      id: 'q3',
      prompt: 'Ein Request-DTO hat `@NotBlank String name`, der Controller-Parameter ist `@RequestBody CreateUserRequest request`. Ein Client schickt `{"name": ""}`. Was passiert?',
      options: ['400 Bad Request', 'Der Request wird normal verarbeitet', '422 Unprocessable Entity', 'Jackson wirft beim Deserialisieren einen Fehler'],
      correct: 1,
      explanation: 'Ohne `@Valid` (oder `@Validated`) wird Bean Validation nicht ausgeführt. Die Constraints stehen nur als Metadaten da.',
    },
    {
      id: 'q4',
      prompt: 'Wo gehört `@Transactional` typischerweise hin?',
      options: ['An den Controller', 'An die Service-Methoden', 'An das Request-DTO', 'An jede Repository-Methode einzeln'],
      correct: 1,
      explanation: 'Eine Transaktion kapselt eine fachliche Operation – die definiert der Service. Spring-Data-Repository-Methoden sind bereits einzeln transaktional; mehrere Aufrufe gehören gemeinsam in eine Service-Transaktion.',
    },
    {
      id: 'q5',
      prompt: 'Welcher HTTP-Status ist für „E-Mail existiert bereits“ beim Registrieren am üblichsten?',
      options: ['400 Bad Request', '404 Not Found', '500 Internal Server Error', '409 Conflict'],
      correct: 3,
      explanation: '409 Conflict signalisiert, dass der Request mit dem aktuellen Zustand der Ressource kollidiert (Duplikat, Versionskonflikt).',
    },
    {
      id: 'q6',
      prompt: 'Was ist der Unterschied zwischen `@ControllerAdvice` und `@RestControllerAdvice`?',
      options: [
        '`@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`',
        '`@RestControllerAdvice` funktioniert nur für `GET`',
        '`@ControllerAdvice` fängt nur checked Exceptions',
        'Es gibt keinen, beides sind Aliase',
      ],
      correct: 0,
      explanation: 'Wie bei `@RestController`: Rückgabewerte der `@ExceptionHandler`-Methoden werden als Body serialisiert.',
    },
    {
      id: 'q7',
      prompt: 'Was ist an diesem Controller aus Clean-Code-Sicht am problematischsten?',
      code: `@PostMapping("/orders")
public OrderResponse place(@Valid @RequestBody PlaceOrderRequest req) {
    var customer = customerRepository.findById(req.customerId()).orElseThrow();
    if (customer.isBlocked()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    var order = new OrderEntity(customer, req.items());
    order.applyDiscount(customer.loyaltyLevel());
    return mapper.toResponse(orderRepository.save(order));
}`,
      options: ['`@Valid` ist überflüssig', 'Business-Logik und Repository-Zugriffe im Controller – keine Transaktionsgrenze, nicht wiederverwendbar', 'Records dürfen nicht als Request-Body genutzt werden', '`@PostMapping` braucht `consumes`'],
      correct: 1,
      explanation: 'Sperrprüfung, Rabatt und zwei Repository-Zugriffe sind Business-Logik und gehören in einen `@Transactional` Service. Der Controller sollte nur `service.place(req)` aufrufen.',
    },
    {
      id: 'q8',
      prompt: 'Welche Rückgabe liefert 204 No Content?',
      options: ['`ResponseEntity.ok().build()`', '`ResponseEntity.noContent().build()`', '`ResponseEntity.ok(null)`', '`ResponseEntity.accepted().build()`'],
      correct: 1,
      explanation: '`noContent()` → 204. `ok()` → 200, `accepted()` → 202. Alternativ: `void`-Methode mit `@ResponseStatus(HttpStatus.NO_CONTENT)`.',
    },
    {
      id: 'q9',
      prompt: 'Welche Aussage über `@ExceptionHandler` in einem `@RestControllerAdvice` ist richtig?',
      options: [
        'Es wird immer der zuerst deklarierte Handler genommen',
        'Handler funktionieren nur für checked Exceptions',
        'Der Handler mit dem spezifischsten passenden Exception-Typ gewinnt',
        'Man braucht pro Controller eine eigene Advice-Klasse',
      ],
      correct: 2,
      explanation: 'Spring wählt den Handler mit dem nächstgelegenen Typ in der Exception-Hierarchie. Ein Fallback-Handler für `Exception.class` greift nur, wenn nichts Spezifischeres passt.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'getUser: Optional + Mapper + NotFound',
      level: 2,
      description: `Kata 7 aus dem Katalog – als Plain-Java-Simulation.

1. \`UserMapper.toDto(UserEntity)\` → \`UserDto(id, email, fullName)\`, wobei \`fullName = firstName + " " + lastName\`.
2. \`UserService\` mit **Constructor Injection** (\`UserRepository\`, \`UserMapper\` als \`private final\` Felder).
3. \`UserDto getUser(Long id)\`: über \`repository.findById\`, Mapper per Method Reference, bei fehlendem User \`UserNotFoundException\`. Kein \`Optional.get()\`, kein \`isPresent()\`.`,
      given: userGiven,
      starter: `class UserMapper {
    UserDto toDto(UserEntity entity) {
        // TODO
        return null;
    }
}

class UserService {
    // TODO: final Felder + Konstruktor

    UserService(UserRepository repository, UserMapper mapper) {
        // TODO
    }

    UserDto getUser(Long id) {
        // TODO
        return null;
    }
}`,
      solution: `class UserMapper {
    UserDto toDto(UserEntity entity) {
        return new UserDto(
            entity.getId(),
            entity.getEmail(),
            entity.getFirstName() + " " + entity.getLastName());
    }
}

class UserService {
    private final UserRepository repository;
    private final UserMapper mapper;

    UserService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    UserDto getUser(Long id) {
        return repository.findById(id)
            .map(mapper::toDto)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
}`,
      hints: [
        'Das Repository liefert ein `Optional<UserEntity>`. Transformiere **im** Optional und entscheide erst am Ende, was bei „leer“ passiert.',
        '`Optional.map(mapper::toDto)` und `orElseThrow(Supplier<Exception>)`.',
        'findById(id) → map(toDto) → orElseThrow(() -> new UserNotFoundException(id))',
        '`return repository.findById(id).map(mapper::toDto).orElseThrow(() -> ...);`',
      ],
      tests: `InMemoryUserRepository repo = new InMemoryUserRepository();
UserEntity ada = repo.save(new UserEntity("ada@example.com", "Ada", "Lovelace"));
repo.save(new UserEntity("alan@example.com", "Alan", "Turing"));
UserMapper mapper = new UserMapper();
check("Mapper", new UserDto(1L, "ada@example.com", "Ada Lovelace"), mapper.toDto(ada));
UserService service = new UserService(repo, mapper);
check("getUser 1", new UserDto(1L, "ada@example.com", "Ada Lovelace"), service.getUser(1L));
check("getUser 2", "Alan Turing", service.getUser(2L).fullName());
checkThrows("unbekannte ID", UserNotFoundException.class, () -> service.getUser(99L));
try {
    service.getUser(42L);
} catch (UserNotFoundException e) {
    check("Exception-Message enthält ID", "User 42 not found", e.getMessage());
}
checkThrows("null-ID -> NotFound", UserNotFoundException.class, () -> service.getUser(null));`,
    },
    {
      id: 'k2',
      title: 'create & rename mit Business-Regeln',
      level: 3,
      description: `Erweitere den Service um Schreib-Use-Cases.

\`UserCommandService(UserRepository repository, UserMapper mapper)\` (Mapper ist gegeben):
- \`UserDto create(CreateUserRequest request)\`:
  - E-Mail normalisieren: \`trim()\` + lower case (\`Locale.ROOT\`).
  - Existiert die E-Mail schon → \`DuplicateEmailException\`, **kein** \`save\`.
  - Sonst Entity anlegen, speichern, gespeicherte Entity als DTO zurückgeben (mit vergebener ID).
- \`UserDto rename(Long id, RenameUserRequest request)\`:
  - User laden oder \`UserNotFoundException\`.
  - Fachliche Methode \`entity.rename(...)\` aufrufen (kein Setter-Gefrickel), DTO zurückgeben.
  - Hinweis: Wie bei JPA-Dirty-Checking ist die geladene Entity „managed“ – ein erneutes \`save\` ist hier nicht nötig.`,
      given: `${userGiven}

record CreateUserRequest(String email, String firstName, String lastName) {}

record RenameUserRequest(String firstName, String lastName) {}

class DuplicateEmailException extends RuntimeException {
    DuplicateEmailException(String email) {
        super("Email already registered: " + email);
    }
}

class UserMapper {
    UserDto toDto(UserEntity e) {
        return new UserDto(e.getId(), e.getEmail(), e.getFirstName() + " " + e.getLastName());
    }
}`,
      starter: `class UserCommandService {
    private final UserRepository repository;
    private final UserMapper mapper;

    UserCommandService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    UserDto create(CreateUserRequest request) {
        // TODO
        return null;
    }

    UserDto rename(Long id, RenameUserRequest request) {
        // TODO
        return null;
    }
}`,
      solution: `class UserCommandService {
    private final UserRepository repository;
    private final UserMapper mapper;

    UserCommandService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    UserDto create(CreateUserRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (repository.existsByEmail(email)) {
            throw new DuplicateEmailException(email);
        }
        UserEntity saved = repository.save(new UserEntity(email, request.firstName(), request.lastName()));
        return mapper.toDto(saved);
    }

    UserDto rename(Long id, RenameUserRequest request) {
        UserEntity user = repository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        user.rename(request.firstName(), request.lastName());
        return mapper.toDto(user);
    }
}`,
      hints: [
        'Reihenfolge im Service: Eingabe normalisieren → Regel prüfen (Guard Clause) → Entity bauen → speichern → mappen.',
        '`String.trim()`, `toLowerCase(Locale.ROOT)`, `repository.existsByEmail(...)`, `repository.save(...)` liefert die gespeicherte Entity (mit ID).',
        'rename: `findById(id).orElseThrow(...)` → `user.rename(first, last)` → `mapper.toDto(user)`.',
        '`if (repository.existsByEmail(email)) { throw new DuplicateEmailException(email); }`',
      ],
      tests: `InMemoryUserRepository repo = new InMemoryUserRepository();
UserCommandService service = new UserCommandService(repo, new UserMapper());
UserDto created = service.create(new CreateUserRequest("  Ada@Example.COM ", "Ada", "Lovelace"));
check("create liefert DTO mit ID", new UserDto(1L, "ada@example.com", "Ada Lovelace"), created);
check("genau ein save", 1, repo.saveCalls);
checkThrows("Duplikat (anders geschrieben)", DuplicateEmailException.class,
    () -> service.create(new CreateUserRequest("ADA@example.com", "A", "L")));
check("kein save bei Duplikat", 1, repo.saveCalls);
UserDto second = service.create(new CreateUserRequest("alan@example.com", "Alan", "Turing"));
check("zweite ID", 2L, second.id());
UserDto renamed = service.rename(1L, new RenameUserRequest("Augusta Ada", "King"));
check("rename DTO", "Augusta Ada King", renamed.fullName());
check("rename persistiert (managed entity)", "King", repo.findById(1L).orElseThrow().getLastName());
checkThrows("rename unbekannt", UserNotFoundException.class, () -> service.rename(7L, new RenameUserRequest("X", "Y")));`,
    },
    {
      id: 'k3',
      title: 'Thin Controller + zentrales Exception-Mapping',
      level: 3,
      description: `Simuliere Spring MVC ohne Spring. Gegeben sind ein vereinfachtes \`ResponseEntity\`, ein fertiger \`ProductService\` und ein \`Dispatcher\`, der wie Spring Exceptions an den Handler weiterreicht.

1. \`ProductController(ProductService service)\` – **dünn**, nur Delegation + HTTP:
   - \`get(long id)\` → 200 + Body
   - \`create(CreateProductRequest r)\` → 201, Header \`Location\` = \`/api/products/<id>\`, Body
   - \`delete(long id)\` → 204, Body \`null\`
2. \`GlobalExceptionHandler.handle(RuntimeException ex)\` → \`ResponseEntity<ApiError>\`:
   - \`ProductNotFoundException\` → 404, Message der Exception
   - \`DuplicateProductException\` → 409, Message der Exception
   - \`IllegalArgumentException\` → 400, Message der Exception
   - alles andere → 500 mit Message \`"Internal server error"\` (keine internen Details leaken!)

Tipp: Pattern Matching \`switch\` (Java 21).`,
      given: `record ResponseEntity<T>(int status, Map<String, String> headers, T body) {
    static <T> ResponseEntity<T> ok(T body) {
        return new ResponseEntity<>(200, Map.of(), body);
    }
    static <T> ResponseEntity<T> created(String location, T body) {
        return new ResponseEntity<>(201, Map.of("Location", location), body);
    }
    static <T> ResponseEntity<T> noContent() {
        return new ResponseEntity<>(204, Map.of(), null);
    }
    static <T> ResponseEntity<T> status(int status, T body) {
        return new ResponseEntity<>(status, Map.of(), body);
    }
}

record ApiError(int status, String message) {}
record CreateProductRequest(String name, BigDecimal price) {}
record ProductResponse(Long id, String name, BigDecimal price) {}

class ProductNotFoundException extends RuntimeException {
    ProductNotFoundException(long id) { super("Product " + id + " not found"); }
}
class DuplicateProductException extends RuntimeException {
    DuplicateProductException(String name) { super("Product already exists: " + name); }
}

class ProductService {
    private final Map<Long, ProductResponse> store = new LinkedHashMap<>();
    private long nextId = 1;

    ProductResponse get(long id) {
        ProductResponse p = store.get(id);
        if (p == null) throw new ProductNotFoundException(id);
        return p;
    }
    ProductResponse create(CreateProductRequest r) {
        if (r.price() == null || r.price().signum() <= 0) throw new IllegalArgumentException("price must be positive");
        boolean exists = store.values().stream().anyMatch(p -> p.name().equalsIgnoreCase(r.name()));
        if (exists) throw new DuplicateProductException(r.name());
        ProductResponse p = new ProductResponse(nextId++, r.name(), r.price());
        store.put(p.id(), p);
        return p;
    }
    void delete(long id) {
        if (store.remove(id) == null) throw new ProductNotFoundException(id);
    }
    void crash() {
        throw new IllegalStateException("DB connection pool exhausted at 10.0.0.12");
    }
}

class Dispatcher {
    static ResponseEntity<?> dispatch(Supplier<? extends ResponseEntity<?>> call,
                                      Function<RuntimeException, ResponseEntity<ApiError>> handler) {
        try {
            return call.get();
        } catch (RuntimeException ex) {
            return handler.apply(ex);
        }
    }
}`,
      starter: `class ProductController {
    private final ProductService service;

    ProductController(ProductService service) {
        this.service = service;
    }

    ResponseEntity<ProductResponse> get(long id) {
        // TODO
        return null;
    }

    ResponseEntity<ProductResponse> create(CreateProductRequest request) {
        // TODO
        return null;
    }

    ResponseEntity<Void> delete(long id) {
        // TODO
        return null;
    }
}

class GlobalExceptionHandler {
    ResponseEntity<ApiError> handle(RuntimeException ex) {
        // TODO
        return null;
    }
}`,
      solution: `class ProductController {
    private final ProductService service;

    ProductController(ProductService service) {
        this.service = service;
    }

    ResponseEntity<ProductResponse> get(long id) {
        return ResponseEntity.ok(service.get(id));
    }

    ResponseEntity<ProductResponse> create(CreateProductRequest request) {
        ProductResponse created = service.create(request);
        return ResponseEntity.created("/api/products/" + created.id(), created);
    }

    ResponseEntity<Void> delete(long id) {
        service.delete(id);
        return ResponseEntity.noContent();
    }
}

class GlobalExceptionHandler {
    ResponseEntity<ApiError> handle(RuntimeException ex) {
        return switch (ex) {
            case ProductNotFoundException e -> error(404, e.getMessage());
            case DuplicateProductException e -> error(409, e.getMessage());
            case IllegalArgumentException e -> error(400, e.getMessage());
            default -> error(500, "Internal server error");
        };
    }

    private static ResponseEntity<ApiError> error(int status, String message) {
        return ResponseEntity.status(status, new ApiError(status, message));
    }
}`,
      hints: [
        'Der Controller fängt **keine** Exceptions – er delegiert nur und wählt den Erfolgs-Status. Fehler behandelt der zentrale Handler (wie `@RestControllerAdvice`).',
        '`ResponseEntity.ok(...)`, `ResponseEntity.created(location, body)`, `ResponseEntity.noContent()`, `ResponseEntity.status(code, body)`.',
        'Handler: `switch (ex) { case ProductNotFoundException e -> ...; ...; default -> 500 }` – spezifische Typen zuerst.',
        '`case ProductNotFoundException e -> ResponseEntity.status(404, new ApiError(404, e.getMessage()));`',
      ],
      tests: `ProductService service = new ProductService();
ProductController controller = new ProductController(service);
GlobalExceptionHandler handler = new GlobalExceptionHandler();

ResponseEntity<?> created = Dispatcher.dispatch(() -> controller.create(new CreateProductRequest("Keyboard", new BigDecimal("49.90"))), handler::handle);
check("create -> 201", 201, created.status());
check("Location-Header", "/api/products/1", created.headers().get("Location"));
check("create Body", new ProductResponse(1L, "Keyboard", new BigDecimal("49.90")), created.body());

ResponseEntity<?> found = Dispatcher.dispatch(() -> controller.get(1), handler::handle);
check("get -> 200", 200, found.status());

ResponseEntity<?> missing = Dispatcher.dispatch(() -> controller.get(99), handler::handle);
check("not found -> 404", new ApiError(404, "Product 99 not found"), missing.body());
check("not found Status", 404, missing.status());

ResponseEntity<?> dup = Dispatcher.dispatch(() -> controller.create(new CreateProductRequest("keyboard", BigDecimal.TEN)), handler::handle);
check("Duplikat -> 409", 409, dup.status());

ResponseEntity<?> invalid = Dispatcher.dispatch(() -> controller.create(new CreateProductRequest("Mouse", BigDecimal.ZERO)), handler::handle);
check("ungültig -> 400", new ApiError(400, "price must be positive"), invalid.body());

ResponseEntity<?> deleted = Dispatcher.dispatch(() -> controller.delete(1), handler::handle);
check("delete -> 204", 204, deleted.status());
checkTrue("delete ohne Body", deleted.body() == null);
check("delete erneut -> 404", 404, Dispatcher.dispatch(() -> controller.delete(1), handler::handle).status());

ResponseEntity<?> crash = Dispatcher.dispatch(() -> { service.crash(); return null; }, handler::handle);
check("unerwartet -> 500 ohne Details", new ApiError(500, "Internal server error"), crash.body());`,
    },
    {
      id: 'k4',
      title: 'Komplette Product-API in Spring Boot 3 (write & compare)',
      level: 4,
      description: `Kata 9 aus dem Katalog: Schreibe von Hand die komplette Schichtenarchitektur für \`Product\`:

\`ProductEntity\`, \`CreateProductRequest\`, \`UpdateProductRequest\`, \`ProductResponse\`, \`ProductMapper\`, \`ProductRepository\`, \`ProductService\`, \`ProductController\`, \`GlobalExceptionHandler\`.

Anforderungen:
- \`GET /api/products/{id}\`, \`POST /api/products\` (201 + Location), \`PUT /api/products/{id}\`, \`DELETE /api/products/{id}\` (204)
- Validierung mit \`@Valid\` (Name nicht leer, Preis positiv)
- Name eindeutig (case-insensitive) → 409
- Constructor Injection, \`@Transactional\` im Service, \`readOnly\` für Lesezugriffe
- \`jakarta.*\`-Imports`,
      starter: `// ProductEntity, DTOs, Mapper, Repository, Service, Controller, GlobalExceptionHandler
`,
      solution: `// ---- Entity ----
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    protected ProductEntity() {}

    public ProductEntity(String name, BigDecimal price) {
        this.name = name;
        this.price = price;
    }

    public void update(String name, BigDecimal price) {
        this.name = name;
        this.price = price;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
}

// ---- DTOs ----
import jakarta.validation.constraints.*;

public record CreateProductRequest(@NotBlank String name, @NotNull @Positive BigDecimal price) {}
public record UpdateProductRequest(@NotBlank String name, @NotNull @Positive BigDecimal price) {}
public record ProductResponse(Long id, String name, BigDecimal price) {}
public record ApiError(int status, String message) {}

// ---- Exceptions ----
public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Long id) { super("Product " + id + " not found"); }
}
public class DuplicateProductException extends RuntimeException {
    public DuplicateProductException(String name) { super("Product already exists: " + name); }
}

// ---- Mapper ----
@Component
public class ProductMapper {
    public ProductEntity toEntity(CreateProductRequest r) {
        return new ProductEntity(r.name(), r.price());
    }
    public ProductResponse toResponse(ProductEntity e) {
        return new ProductResponse(e.getId(), e.getName(), e.getPrice());
    }
}

// ---- Repository ----
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}

// ---- Service ----
@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository repository;
    private final ProductMapper mapper;

    public ProductService(ProductRepository repository, ProductMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ProductResponse get(Long id) {
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ProductNotFoundException(id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (repository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateProductException(request.name());
        }
        return mapper.toResponse(repository.save(mapper.toEntity(request)));
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        ProductEntity product = repository.findById(id)
            .orElseThrow(() -> new ProductNotFoundException(id));
        if (repository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new DuplicateProductException(request.name());
        }
        product.update(request.name(), request.price()); // Dirty Checking
        return mapper.toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        repository.deleteById(id);
    }
}

// ---- Controller ----
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/products/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

// ---- Error Handling ----
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiError notFound(ProductNotFoundException ex) {
        return new ApiError(404, ex.getMessage());
    }

    @ExceptionHandler(DuplicateProductException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiError conflict(DuplicateProductException ex) {
        return new ApiError(409, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return new ApiError(400, message);
    }
}`,
      hints: [
        'Arbeite von innen nach außen: Entity → Repository → DTOs → Mapper → Service → Controller → Advice.',
        'Entity braucht einen `protected` No-Args-Konstruktor für JPA; fachliche Änderungen über Methoden (`update(...)`) statt Setter.',
        'Service: Klassenweit `@Transactional(readOnly = true)`, schreibende Methoden mit `@Transactional` überschreiben. Update ohne `save` dank Dirty Checking.',
      ],
    },
  ],
}

export default chapter
