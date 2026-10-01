# Kapitel 08 – DTO / Entity / Mapper

## Mental Model

```text
HTTP  →  Controller  →  Service  →  Repository  →  DB
          │               │            │
     Request-DTO      Domain/Entity  Entity
     Response-DTO         ▲
          ▲               │
          └──── Mapper ───┘

DTO     = Transportformat der API      (stabil, öffentlich, versioniert)
Entity  = Persistenzformat der DB      (JPA-Annotationen, Lazy Proxies, veränderlich)
Mapper  = die einzige Stelle, die beide Welten kennt
```

Zwei Modelle, die sich **unterschiedlich schnell ändern dürfen**. Der Mapper ist die bewusste Naht
dazwischen: Ohne ihn zwingt jede Spaltenumbenennung in der DB deine API-Konsumenten zu einem Release.

## Syntax / API

### Entity

```java
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String firstName;
    private String lastName;
    private String passwordHash;        // darf NIE in einem Response-DTO landen
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    private CompanyEntity company;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<OrderEntity> orders = new ArrayList<>();

    protected UserEntity() { }          // JPA braucht einen No-Arg-Konstruktor

    // Getter/Setter bzw. fachliche Methoden wie activate()/deactivate()
}
```

Eine Entity ist per Definition veränderlich und an einen `EntityManager` gebunden – deshalb kein
Record und deshalb nichts für die API-Grenze.

### Request-DTO vs. Response-DTO

Ein DTO pro Richtung, nicht ein „Universal-DTO“:

```java
// Eingabe: nur Felder, die der Client setzen DARF
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(max = 100) String firstName,
    @NotBlank @Size(max = 100) String lastName,
    @NotBlank @Size(min = 12, max = 128) String password) {}

public record UpdateUserRequest(
    @NotBlank @Size(max = 100) String firstName,
    @NotBlank @Size(max = 100) String lastName) {}

// Ausgabe: nur Felder, die der Client sehen DARF
public record UserResponse(
    Long id,
    String email,
    String fullName,
    boolean active,
    CompanySummary company) {}

public record CompanySummary(Long id, String name) {}
```

Warum getrennt? Ein gemeinsames DTO hätte `id` (Client darf sie nicht setzen) **und** `password`
(Client darf ihn nie lesen). Getrennte Typen machen Mass Assignment strukturell unmöglich.

### Bean Validation

```java
public record CreateOrderRequest(
    @NotNull Long customerId,
    @NotEmpty List<@Valid OrderLineRequest> lines,       // @Valid = Nested Validation
    @Size(max = 500) String note) {}

public record OrderLineRequest(
    @NotBlank String sku,
    @Positive int quantity,
    @NotNull @DecimalMin("0.00") BigDecimal unitPrice) {}
```

```java
@PostMapping
ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) { ... }
```

Ohne `@Valid` am Parameter passiert **nichts**. Verletzungen werden zu
`MethodArgumentNotValidException` → in einem `@RestControllerAdvice` in eine saubere Fehlerantwort
übersetzen. Wichtig: Bean Validation prüft nur die Form (Syntax), fachliche Regeln
(„E-Mail bereits vergeben“) gehören in den Service.

### Mapper: Entity → DTO

```java
@Component
public class UserMapper {

    public UserResponse toResponse(UserEntity entity) {
        return new UserResponse(
            entity.getId(),
            entity.getEmail(),
            entity.getFirstName() + " " + entity.getLastName(),
            entity.isActive(),
            toSummary(entity.getCompany()));            // Nested Mapping
    }

    private CompanySummary toSummary(CompanyEntity company) {
        return company == null
            ? null
            : new CompanySummary(company.getId(), company.getName());
    }

    public List<UserResponse> toResponses(List<UserEntity> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
```

Alternativ als Klasse mit statischen Methoden – ohne Spring-Abhängigkeit und direkt testbar:

```java
public final class UserMapper {
    private UserMapper() { }

    public static UserResponse toResponse(UserEntity entity) { ... }
}
```

Faustregel: solange der Mapper keine Collaborators (andere Beans) braucht, reichen statische
Methoden. Sobald er z. B. einen `PasswordEncoder` oder einen anderen Mapper benötigt, wird er ein
`@Component` mit Constructor Injection.

### Mapper: DTO → Entity (create vs. update)

```java
public UserEntity toEntity(CreateUserRequest request, String passwordHash) {
    UserEntity entity = new UserEntity();
    entity.setEmail(request.email());
    entity.setFirstName(request.firstName());
    entity.setLastName(request.lastName());
    entity.setPasswordHash(passwordHash);
    entity.setActive(true);                 // Default fachlich im Mapper/Service, nicht vom Client
    return entity;
}

/** Update: bestehende Instanz ändern – NICHT neu erzeugen. */
public void applyUpdate(UserEntity target, UpdateUserRequest request) {
    target.setFirstName(request.firstName());
    target.setLastName(request.lastName());
}
```

Beim Update muss die **gemanagte** Instanz verändert werden, damit Dirty Checking greift. Ein neues
`UserEntity` mit gesetzter ID zu bauen und zu speichern, überschreibt alle nicht befüllten Felder
mit `null` bzw. erzeugt einen Detached-Merge – ein klassischer Datenverlust-Bug.

```java
@Transactional
public UserResponse update(Long id, UpdateUserRequest request) {
    UserEntity entity = userRepository.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));
    mapper.applyUpdate(entity, request);        // kein save() nötig: Dirty Checking
    return mapper.toResponse(entity);
}
```

### Listen- und Nested-Mapping mit Streams

```java
public OrderResponse toResponse(OrderEntity entity) {
    return new OrderResponse(
        entity.getId(),
        entity.getOrderNumber(),
        entity.getLines().stream()
            .map(this::toLineResponse)
            .toList(),
        entity.getLines().stream()
            .map(line -> line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add));
}
```

Achtung: `entity.getLines()` ist lazy. Das Mapping muss **innerhalb** der Transaktion laufen – oder
das Repository lädt die Collection gezielt mit `@EntityGraph` / `join fetch`.

### MapStruct (kurz)

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(entity.getFirstName() + \" \" + entity.getLastName())")
    UserResponse toResponse(UserEntity entity);

    List<UserResponse> toResponses(List<UserEntity> entities);

    @Mapping(target = "id", ignore = true)
    void applyUpdate(@MappingTarget UserEntity target, UpdateUserRequest request);
}
```

MapStruct generiert den Mapper-Code zur **Compilezeit** – kein Reflection-Overhead, und fehlende
Zielfelder fallen beim Build auf. Für große Projekte sinnvoll; handgeschriebene Mapper sind aber
explizit und ohne Build-Magie. Finger weg von reflection-basiertem `BeanUtils.copyProperties`: keine
Typsicherheit, keine Compilerprüfung, still fehlschlagende Umbenennungen.

## Typische Use Cases

- REST-API: `CreateXRequest` / `UpdateXRequest` / `XResponse` pro Ressource.
- Listenendpunkte mit schlanker Summary-Projektion statt vollem Detail-DTO.
- Externe Integration: eigenes DTO pro Fremdsystem, damit deren Änderungen nicht durchschlagen.
- Event-Payloads: Record-DTOs statt Entities in Kafka/RabbitMQ-Nachrichten.
- API-Versionierung: `v1.UserResponse` und `v2.UserResponse` mappen auf dieselbe Entity.

## Clean-Code-Empfehlungen

- Entities verlassen niemals den Service – der Controller kennt nur DTOs.
- DTOs als `record` (immutable, knapp, mit `equals` für Tests).
- Ein DTO pro Richtung und Use Case; lieber drei kleine als ein aufgeblähtes.
- Mapping an **einer** Stelle bündeln, nicht verteilt in Controller und Service.
- Mapper enthalten keine fachliche Logik und keine Repository-Aufrufe – nur Feldzuordnung und
  triviale Ableitungen (`fullName`).
- Null-Handling bewusst entscheiden: `null` durchreichen oder auf leere Liste/`Optional` normalisieren.
- Mapper-Tests sind billig und fangen genau die Fehler, die niemand sieht (vertauschte Felder).
- DTO-Felder nach Domänensprache benennen, nicht nach Spaltennamen.

## Häufige Fehler

```java
// FALSCH: Entity direkt als Response
@GetMapping("/{id}")
UserEntity get(@PathVariable Long id) { return repository.findById(id).orElseThrow(); }
// RICHTIG
@GetMapping("/{id}")
UserResponse get(@PathVariable Long id) {
    return repository.findById(id).map(mapper::toResponse).orElseThrow(() -> new UserNotFoundException(id));
}

// FALSCH: Mapping außerhalb der Transaktion → LazyInitializationException
public UserResponse get(Long id) {
    UserEntity entity = repository.findById(id).orElseThrow();   // Transaktion endet hier
    return mapper.toResponse(entity);                            // greift auf lazy orders zu → 💥
}
// RICHTIG: @Transactional(readOnly = true) auf der Service-Methode oder @EntityGraph im Repository

// FALSCH: Update durch Neuerzeugung → nicht gesetzte Felder werden null
UserEntity updated = new UserEntity();
updated.setId(id);
updated.setFirstName(request.firstName());
repository.save(updated);                    // email, passwordHash, active weg
// RICHTIG
UserEntity entity = repository.findById(id).orElseThrow();
mapper.applyUpdate(entity, request);

// FALSCH: ein DTO für Ein- und Ausgabe
record UserDto(Long id, String email, String password, boolean admin) {}
// → Client kann id und admin setzen (Mass Assignment) und liest den Passwort-Hash mit
// RICHTIG: CreateUserRequest (ohne id/admin) und UserResponse (ohne password)

// FALSCH: @Valid vergessen
ResponseEntity<?> create(@RequestBody CreateUserRequest request)   // Validierung läuft NICHT
// RICHTIG
ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest request)

// FALSCH: N+1 beim Listen-Mapping
repository.findAll().stream().map(mapper::toResponse).toList();    // pro User eine Company-Query
// RICHTIG: Repository-Query mit join fetch / @EntityGraph("user.company")

// FALSCH: reflection-basiertes Kopieren
BeanUtils.copyProperties(request, entity);   // still kaputt bei Umbenennung, keine Typprüfung
```

## Interview-relevante Details

- **LazyInitializationException**: Lazy-Beziehung wird nach Ende der Session/Transaktion angefasst.
  Lösungen: `@Transactional(readOnly = true)` um das Mapping, `@EntityGraph`, `join fetch`, oder
  eine DTO-Projection direkt in der Query. `spring.jpa.open-in-view=false` und stattdessen sauber mappen.
- **Warum keine Entity nach außen**: API-/DB-Kopplung, Leaks (`passwordHash`), Lazy-Proxys im
  JSON-Serializer, Mass Assignment beim Deserialisieren, unmögliche Versionierung.
- **Mass Assignment**: Client schickt `{"admin": true}` – ohne Request-DTO landet das direkt in der Entity.
- **DTO-Projection** in Spring Data: Interface-Projection oder Constructor Expression
  (`select new com.x.UserResponse(u.id, u.email) from UserEntity u`) – spart das Nachladen ganz.
- **Bean Validation** greift bei `@Valid` am Controller-Parameter; `@Validated` auf der Klasse
  aktiviert Method Validation im Service.
- **MapStruct** generiert zur Compilezeit, `BeanUtils`/ModelMapper arbeiten per Reflection – nur
  Ersteres ist refactoring-sicher.
- **equals/hashCode bei Entities**: nicht auf allen Feldern, sondern auf einem stabilen
  Business Key – bei DTOs übernimmt das der Record.

## Zusammenfassung

- Drei Schichten, drei Modelle: DTO an der API, Entity an der DB, Mapper dazwischen.
- Request-DTO und Response-DTO trennen – verhindert Leaks und Mass Assignment.
- DTOs als Records + Bean Validation (`@NotBlank`, `@Email`, `@Valid` für Nested).
- Entity → DTO im Mapper, DTO → Entity beim Create; beim Update die **geladene** Instanz ändern.
- Listen-/Nested-Mapping mit `stream().map(..).toList()`, Lazy-Beziehungen vorher laden.
- Mapper ohne fachliche Logik, an einer Stelle, gut testbar; MapStruct als Compile-Time-Alternative.
- Niemals Entities aus dem Controller zurückgeben – sonst Kopplung, Security-Leaks und
  `LazyInitializationException`.
