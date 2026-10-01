import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '08',
  flashcards: [
    { id: 'f1', front: 'Warum gibt man Entities nicht direkt aus dem Controller zurück?', back: 'API und DB-Schema werden gekoppelt, sensible Felder leaken (`passwordHash`), Lazy-Proxys knallen beim Serialisieren (`LazyInitializationException`), Mass Assignment beim Deserialisieren, und Versionierung wird unmöglich.' },
    { id: 'f2', front: 'Was ist Mass Assignment – und wie verhinderst du es?', back: 'Der Client schickt Felder mit, die er nicht setzen darf (`{"admin": true}`). Verhindert durch ein **Request-DTO**, das nur erlaubte Felder enthält – nicht durch nachträgliches Prüfen.' },
    { id: 'f3', front: 'Warum Request-DTO und Response-DTO trennen?', back: 'Ein gemeinsames DTO bräuchte `id` (darf der Client nicht setzen) **und** `password` (darf der Client nicht lesen). Getrennte Typen machen beides strukturell unmöglich.' },
    { id: 'f4', front: 'Wann entsteht eine `LazyInitializationException`?', back: 'Wenn eine Lazy-Beziehung angefasst wird, nachdem Transaktion/Session beendet sind – typisch beim Mapping **außerhalb** des Service. Lösung: `@Transactional(readOnly = true)`, `@EntityGraph`, `join fetch` oder DTO-Projection.' },
    { id: 'f5', front: 'Wie mappst du eine Liste von Entities auf DTOs?', back: '```java\nreturn entities.stream()\n    .map(this::toResponse)\n    .toList();\n```' },
    { id: 'f6', front: 'Warum darf ein Update die Entity nicht neu erzeugen?', back: 'Nur die **gemanagte** Instanz unterliegt dem Dirty Checking. Ein neues Objekt mit gesetzter ID überschreibt beim `save` alle nicht befüllten Felder mit `null` – stiller Datenverlust.' },
    { id: 'f7', front: 'Wie sieht die Update-Methode eines Mappers aus?', back: '```java\nvoid applyUpdate(UserEntity target, UpdateUserRequest request) {\n    target.setFirstName(request.firstName());\n    target.setLastName(request.lastName());\n}\n```\nSie ändert das Ziel, sie erzeugt nichts.' },
    { id: 'f8', front: 'Welche Bean-Validation-Annotationen brauchst du am häufigsten?', back: '`@NotNull`, `@NotBlank` (String), `@NotEmpty` (Collection), `@Size(min, max)`, `@Email`, `@Positive`, `@DecimalMin`, `@Past`/`@Future`, `@Valid` für verschachtelte Objekte.' },
    { id: 'f9', front: 'Was passiert ohne `@Valid` am Controller-Parameter?', back: 'Nichts – die Constraints am DTO werden ignoriert. Erst `@Valid @RequestBody CreateUserRequest request` löst die Validierung aus (`MethodArgumentNotValidException` bei Verstößen).' },
    { id: 'f10', front: 'Wie validierst du eine verschachtelte Liste von DTOs?', back: '```java\n@NotEmpty List<@Valid OrderLineRequest> lines\n```\nOhne das innere `@Valid` werden die Constraints der Elemente nicht geprüft.' },
    { id: 'f11', front: 'Was gehört **nicht** in einen Mapper?', back: 'Fachliche Logik, Repository-Aufrufe, Berechtigungsprüfungen. Nur Feldzuordnung und triviale Ableitungen wie `fullName = firstName + " " + lastName`.' },
    { id: 'f12', front: 'Wann Mapper als `@Component`, wann als statische Klasse?', back: 'Ohne Abhängigkeiten reichen `static`-Methoden (einfach testbar, kein Spring nötig). Sobald er Collaborators braucht (anderer Mapper, `PasswordEncoder`), wird er ein `@Component` mit Constructor Injection.' },
    { id: 'f13', front: 'Was ist MapStruct – und was ist der Vorteil gegenüber `BeanUtils.copyProperties`?', back: 'MapStruct generiert den Mapper zur **Compilezeit** (`@Mapper(componentModel = "spring")`): typsicher, ohne Reflection, fehlende Felder fallen beim Build auf. `BeanUtils` arbeitet per Reflection und bricht bei Umbenennungen still.' },
    { id: 'f14', front: 'Was ist eine DTO-Projection in Spring Data?', back: 'Die Query liefert direkt das DTO: Interface-Projection (`interface OrderSummary { Long getId(); }`) oder Constructor Expression `select new com.x.UserResponse(u.id, u.email) from UserEntity u` – kein Nachladen, kein Mapping nötig.' },
    { id: 'f15', front: 'Warum entsteht beim Listen-Mapping oft ein N+1-Problem?', back: 'Der Mapper greift pro Entity auf eine Lazy-Beziehung zu → eine zusätzliche Query pro Zeile. Lösung: `@EntityGraph` oder `join fetch` in der Repository-Query.' },
    { id: 'f16', front: 'Warum sind DTOs als `record` eine gute Wahl?', back: 'Immutable, knapp, mit korrektem `equals`/`hashCode` (macht Mapper-Tests trivial) und ohne Setter, die ein Framework versehentlich nutzen könnte.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wo ist der Bug?',
      code: `@RestController
class UserController {

    @GetMapping("/users/{id}")
    UserEntity get(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow();
    }
}`,
      options: [
        '`@PathVariable` fehlt der Name',
        'Die Entity wird direkt zurückgegeben: DB-Kopplung, Leaks sensibler Felder und Lazy-Probleme',
        '`findById` gibt es nicht',
        'Der Controller braucht `@ResponseBody`',
      ],
      correct: 1,
      explanation: 'Der Controller darf nur DTOs kennen. Sonst ändert jede Spaltenumbenennung die öffentliche API, und `passwordHash` landet im JSON.',
    },
    {
      id: 'q2',
      prompt: 'Warum wird hier nichts validiert?',
      code: `record CreateUserRequest(@NotBlank String email) {}

@PostMapping("/users")
ResponseEntity<Void> create(@RequestBody CreateUserRequest request) { ... }`,
      options: [
        '`@NotBlank` funktioniert nicht auf Record-Komponenten',
        'Am Parameter fehlt `@Valid`',
        'Es fehlt `@Validated` an der Record-Deklaration',
        'Bean Validation greift nur bei `@ModelAttribute`',
      ],
      correct: 1,
      explanation: 'Ohne `@Valid` (oder `@Validated`) am Parameter wird der Validator gar nicht aufgerufen. Korrekt: `create(@Valid @RequestBody CreateUserRequest request)`.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Bug?',
      code: `@Transactional
public void update(Long id, UpdateUserRequest request) {
    UserEntity entity = new UserEntity();
    entity.setId(id);
    entity.setFirstName(request.firstName());
    entity.setLastName(request.lastName());
    userRepository.save(entity);
}`,
      options: [
        '`save` braucht ein `flush`',
        'Die Entity wird neu erzeugt – alle nicht gesetzten Felder (E-Mail, Passwort, Status) werden auf `null` überschrieben',
        '`@Transactional` fehlt `readOnly = true`',
        'Kein Bug',
      ],
      correct: 1,
      explanation: 'Richtig ist: laden, ändern, fertig. `findById(id).orElseThrow()` und dann die geladene Instanz über den Mapper aktualisieren – Dirty Checking erledigt den Rest.',
    },
    {
      id: 'q4',
      prompt: 'Was passiert zur Laufzeit?',
      code: `public UserResponse get(Long id) {          // KEIN @Transactional
    UserEntity entity = repository.findById(id).orElseThrow();
    return mapper.toResponse(entity);       // greift auf lazy orders zu
}`,
      options: [
        '`NullPointerException`',
        '`LazyInitializationException`',
        'Die Orders werden nachgeladen, alles funktioniert',
        '`IllegalStateException`',
      ],
      correct: 1,
      explanation: 'Die Transaktion endet mit `findById`. Der Zugriff auf die Lazy-Collection danach schlägt fehl. Abhilfe: `@Transactional(readOnly = true)`, `@EntityGraph` oder eine DTO-Projection.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist Clean Code für ein Listen-Mapping?',
      options: [
        '`List<UserResponse> r = new ArrayList<>(); for (var e : entities) r.add(toResponse(e)); return r;`',
        '`return entities.stream().map(this::toResponse).toList();`',
        '`return (List<UserResponse>) (List<?>) entities;`',
        '`return entities.stream().map(e -> { var d = new UserResponse(); d.setId(e.getId()); return d; }).toList();`',
      ],
      correct: 1,
      explanation: 'Eine Pipeline, eine Method Reference, unveränderliches Ergebnis. Variante 3 ist ein unsicherer Cast, Variante 4 setzt Setter voraus – DTOs sollten Records sein.',
    },
    {
      id: 'q6',
      prompt: 'Welches DTO-Design ist sicher?',
      code: `record UserDto(Long id, String email, String password, boolean admin) {}
// wird für POST /users UND GET /users/{id} verwendet`,
      options: [
        'Passt – ein DTO pro Ressource ist am einfachsten',
        'Unsicher: Der Client kann `id` und `admin` setzen und liest das Passwort mit – Request- und Response-DTO trennen',
        'Unsicher, weil `record` statt `class` verwendet wird',
        'Passt, solange man `password` im Service ignoriert',
      ],
      correct: 1,
      explanation: 'Sicherheit gehört in die Struktur, nicht in die Disziplin: `CreateUserRequest` (ohne `id`/`admin`) und `UserResponse` (ohne `password`).',
    },
    {
      id: 'q7',
      prompt: 'Was ist das Problem?',
      code: `List<UserResponse> all() {
    return userRepository.findAll().stream()
        .map(mapper::toResponse)     // toResponse liest entity.getCompany().getName()
        .toList();
}`,
      options: [
        'Der Stream ist nicht parallel',
        'N+1: pro User wird eine zusätzliche Query für die Company abgesetzt',
        '`findAll` gibt keinen Stream zurück',
        '`toList()` ist zu langsam',
      ],
      correct: 1,
      explanation: 'Die Lazy-Beziehung wird pro Zeile nachgeladen. Lösung: `@EntityGraph(attributePaths = "company")` an der Query oder `join fetch`.',
    },
    {
      id: 'q8',
      prompt: 'Warum kompiliert das nicht?',
      code: `@Entity
public record UserEntity(@Id Long id, String email) {}`,
      options: [
        '`@Id` ist auf Record-Komponenten nicht erlaubt',
        'JPA-Entities brauchen einen No-Arg-Konstruktor und nicht-finale Felder – ein Record ist final und immutable',
        '`@Entity` muss auf einem Interface stehen',
        'Records dürfen keine Annotationen tragen',
      ],
      correct: 1,
      explanation: 'Records sind die DTO-Seite. Die Entity bleibt eine normale Klasse mit (mindestens `protected`) No-Arg-Konstruktor.',
    },
    {
      id: 'q9',
      prompt: 'Welches Mapping-Werkzeug ist refactoring-sicher?',
      options: [
        '`BeanUtils.copyProperties(request, entity)`',
        'ModelMapper mit Standardkonfiguration',
        'MapStruct – generiert den Mapper zur Compilezeit',
        'Manuelles Kopieren per Reflection',
      ],
      correct: 2,
      explanation: 'MapStruct erzeugt echten Java-Code beim Build: Umbenennungen und fehlende Zielfelder werden zu Compilefehlern. Reflection-basierte Ansätze scheitern erst zur Laufzeit – oder gar nicht sichtbar.',
    },
    {
      id: 'q10',
      prompt: 'Welche Aussage über Bean Validation stimmt?',
      options: [
        'Sie ersetzt fachliche Prüfungen wie „E-Mail bereits vergeben"',
        'Sie prüft die **Form** der Eingabe; fachliche Regeln gehören in den Service',
        '`@NotNull` und `@NotBlank` sind identisch',
        'Constraints an verschachtelten Objekten werden automatisch mitgeprüft',
      ],
      correct: 1,
      explanation: '`@NotNull` erlaubt `""`, `@NotBlank` nicht. Verschachtelte Objekte brauchen `@Valid`. Und alles, was einen DB-Zugriff braucht, ist Service-Logik.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Entity → Response-DTO',
      level: 1,
      description: `Implementiere den Mapper von der Entity zum Response-DTO:

- \`toResponse(UserEntity entity)\` → \`UserResponse\`. \`fullName\` ist \`firstName + " " + lastName\`. Der \`passwordHash\` darf **nicht** im DTO landen.
- \`toResponses(List<UserEntity> entities)\` → \`List<UserResponse>\` per Stream.`,
      given: `class UserEntity {
    private final Long id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String passwordHash;
    private final boolean active;

    UserEntity(Long id, String email, String firstName, String lastName, String passwordHash, boolean active) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.passwordHash = passwordHash;
        this.active = active;
    }

    Long getId() { return id; }
    String getEmail() { return email; }
    String getFirstName() { return firstName; }
    String getLastName() { return lastName; }
    String getPasswordHash() { return passwordHash; }
    boolean isActive() { return active; }
}

record UserResponse(Long id, String email, String fullName, boolean active) {}`,
      starter: `class UserMapper {

    static UserResponse toResponse(UserEntity entity) {
        // TODO
        return null;
    }

    static List<UserResponse> toResponses(List<UserEntity> entities) {
        // TODO
        return List.of();
    }
}`,
      solution: `class UserMapper {

    static UserResponse toResponse(UserEntity entity) {
        return new UserResponse(
            entity.getId(),
            entity.getEmail(),
            entity.getFirstName() + " " + entity.getLastName(),
            entity.isActive());
    }

    static List<UserResponse> toResponses(List<UserEntity> entities) {
        return entities.stream()
            .map(UserMapper::toResponse)
            .toList();
    }
}`,
      hints: [
        'Das DTO enthält bewusst weniger Felder als die Entity – nur das, was die API zeigen darf.',
        'Record-Konstruktor `new UserResponse(..)`, für die Liste `stream().map(..).toList()`.',
        'toResponse: alle vier Werte aus den Gettern zusammensetzen. toResponses: entities.stream().map(UserMapper::toResponse).toList()',
        '`return entities.stream().map(UserMapper::toResponse).toList();`',
      ],
      tests: `var jan = new UserEntity(1L, "jan@example.com", "Jan", "Pfrommer", "$2a$secret", true);
var anna = new UserEntity(2L, "anna@example.com", "Anna", "Klein", "$2a$other", false);
check("einzelnes DTO", new UserResponse(1L, "jan@example.com", "Jan Pfrommer", true), UserMapper.toResponse(jan));
check("Passwort-Hash leakt nicht", false, UserMapper.toResponse(jan).toString().contains("secret"));
check("Liste", List.of(
    new UserResponse(1L, "jan@example.com", "Jan Pfrommer", true),
    new UserResponse(2L, "anna@example.com", "Anna Klein", false)), UserMapper.toResponses(List.of(jan, anna)));
check("leere Liste", List.of(), UserMapper.toResponses(List.of()));
check("inaktiv wird durchgereicht", false, UserMapper.toResponse(anna).active());`,
    },
    {
      id: 'k2',
      title: 'Request-DTO → Entity: create vs. update',
      level: 2,
      description: `Zwei Mapping-Richtungen, zwei unterschiedliche Regeln:

- \`toEntity(CreateUserRequest request, String passwordHash)\` → neue \`UserEntity\`. Die E-Mail wird getrimmt und kleingeschrieben, \`active\` ist \`true\`, die \`id\` bleibt \`null\` (die vergibt die DB).
- \`applyUpdate(UserEntity target, UpdateUserRequest request)\` → \`void\`. Sie **ändert die übergebene Instanz** und fasst \`id\`, \`email\`, \`passwordHash\` und \`active\` nicht an.`,
      given: `class UserEntity {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String passwordHash;
    private boolean active;

    Long getId() { return id; }
    void setId(Long id) { this.id = id; }
    String getEmail() { return email; }
    void setEmail(String email) { this.email = email; }
    String getFirstName() { return firstName; }
    void setFirstName(String firstName) { this.firstName = firstName; }
    String getLastName() { return lastName; }
    void setLastName(String lastName) { this.lastName = lastName; }
    String getPasswordHash() { return passwordHash; }
    void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    boolean isActive() { return active; }
    void setActive(boolean active) { this.active = active; }
}

record CreateUserRequest(String email, String firstName, String lastName, String password) {}
record UpdateUserRequest(String firstName, String lastName) {}`,
      starter: `class UserMapper {

    static UserEntity toEntity(CreateUserRequest request, String passwordHash) {
        // TODO
        return new UserEntity();
    }

    static void applyUpdate(UserEntity target, UpdateUserRequest request) {
        // TODO
    }
}`,
      solution: `class UserMapper {

    static UserEntity toEntity(CreateUserRequest request, String passwordHash) {
        UserEntity entity = new UserEntity();
        entity.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        entity.setFirstName(request.firstName());
        entity.setLastName(request.lastName());
        entity.setPasswordHash(passwordHash);
        entity.setActive(true);
        return entity;
    }

    static void applyUpdate(UserEntity target, UpdateUserRequest request) {
        target.setFirstName(request.firstName());
        target.setLastName(request.lastName());
    }
}`,
      hints: [
        'Beim Anlegen erzeugst du ein neues Objekt. Beim Update darfst du **keins** erzeugen – sonst würden die nicht befüllten Felder verloren gehen.',
        '`new UserEntity()` + Setter, `String.trim()`, `toLowerCase(Locale.ROOT)`. `applyUpdate` setzt nur die beiden Namensfelder auf `target`.',
        'toEntity: Entity anlegen, email normalisiert setzen, Namen setzen, passwordHash setzen, active = true, zurückgeben. applyUpdate: nur setFirstName/setLastName auf target.',
        '`entity.setEmail(request.email().trim().toLowerCase(Locale.ROOT));`',
      ],
      tests: `var created = UserMapper.toEntity(new CreateUserRequest("  Jan@Example.COM ", "Jan", "Pfrommer", "geheim"), "hash-1");
check("email normalisiert", "jan@example.com", created.getEmail());
check("id bleibt null", null, created.getId());
check("aktiv per Default", true, created.isActive());
check("hash uebernommen", "hash-1", created.getPasswordHash());
check("Klartext-Passwort landet nicht in der Entity", false, "geheim".equals(created.getPasswordHash()));
created.setId(42L);
UserMapper.applyUpdate(created, new UpdateUserRequest("Jan Christoph", "Pfrommer-Neu"));
check("Vorname geaendert", "Jan Christoph", created.getFirstName());
check("Nachname geaendert", "Pfrommer-Neu", created.getLastName());
check("id unveraendert", 42L, created.getId());
check("email unveraendert", "jan@example.com", created.getEmail());
check("hash unveraendert", "hash-1", created.getPasswordHash());
check("active unveraendert", true, created.isActive());`,
    },
    {
      id: 'k3',
      title: 'Nested Mapping mit Berechnung',
      level: 3,
      description: `Eine \`OrderEntity\` hat einen (optionalen!) Kunden und mehrere Positionen. Implementiere:

- \`toLineResponse(OrderLineEntity line)\`: \`lineTotal\` ist \`unitPrice * quantity\`
- \`toSummary(CustomerEntity customer)\`: \`null\` bleibt \`null\`
- \`toResponse(OrderEntity entity)\`: Positionen mappen, \`total\` als Summe aller \`lineTotal\` (\`BigDecimal.ZERO\` bei keiner Position)

Für \`quantity\` brauchst du \`BigDecimal.valueOf(..)\` – niemals \`double\`.`,
      given: `class OrderLineEntity {
    private final String sku;
    private final int quantity;
    private final BigDecimal unitPrice;

    OrderLineEntity(String sku, int quantity, BigDecimal unitPrice) {
        this.sku = sku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    String getSku() { return sku; }
    int getQuantity() { return quantity; }
    BigDecimal getUnitPrice() { return unitPrice; }
}

class CustomerEntity {
    private final Long id;
    private final String name;

    CustomerEntity(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    Long getId() { return id; }
    String getName() { return name; }
}

class OrderEntity {
    private final Long id;
    private final String orderNumber;
    private final CustomerEntity customer;
    private final List<OrderLineEntity> lines;

    OrderEntity(Long id, String orderNumber, CustomerEntity customer, List<OrderLineEntity> lines) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.customer = customer;
        this.lines = lines;
    }

    Long getId() { return id; }
    String getOrderNumber() { return orderNumber; }
    CustomerEntity getCustomer() { return customer; }
    List<OrderLineEntity> getLines() { return lines; }
}

record CustomerSummary(Long id, String name) {}
record OrderLineResponse(String sku, int quantity, BigDecimal lineTotal) {}
record OrderResponse(Long id, String orderNumber, CustomerSummary customer, List<OrderLineResponse> lines, BigDecimal total) {}`,
      starter: `class OrderMapper {

    static OrderLineResponse toLineResponse(OrderLineEntity line) {
        // TODO
        return null;
    }

    static CustomerSummary toSummary(CustomerEntity customer) {
        // TODO
        return null;
    }

    static OrderResponse toResponse(OrderEntity entity) {
        // TODO
        return null;
    }
}`,
      solution: `class OrderMapper {

    static OrderLineResponse toLineResponse(OrderLineEntity line) {
        return new OrderLineResponse(
            line.getSku(),
            line.getQuantity(),
            line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
    }

    static CustomerSummary toSummary(CustomerEntity customer) {
        return customer == null
            ? null
            : new CustomerSummary(customer.getId(), customer.getName());
    }

    static OrderResponse toResponse(OrderEntity entity) {
        List<OrderLineResponse> lines = entity.getLines().stream()
            .map(OrderMapper::toLineResponse)
            .toList();

        BigDecimal total = lines.stream()
            .map(OrderLineResponse::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderResponse(
            entity.getId(),
            entity.getOrderNumber(),
            toSummary(entity.getCustomer()),
            lines,
            total);
    }
}`,
      hints: [
        'Baue von innen nach außen: erst die Positionen, dann daraus die Summe, zuletzt das äußere DTO.',
        '`BigDecimal.multiply`, `BigDecimal.valueOf(int)`, `stream().map(..).toList()`, `reduce(BigDecimal.ZERO, BigDecimal::add)`.',
        'toResponse: lines = entity.getLines().stream().map(OrderMapper::toLineResponse).toList(); total = lines.stream().map(lineTotal).reduce(ZERO, add); dann new OrderResponse(...).',
        '`line.getUnitPrice().multiply(BigDecimal.valueOf(line.getQuantity()))`',
      ],
      tests: `var customer = new CustomerEntity(7L, "ACME GmbH");
var order = new OrderEntity(1L, "ORD-1", customer, List.of(
    new OrderLineEntity("SKU-1", 3, new BigDecimal("10.00")),
    new OrderLineEntity("SKU-2", 2, new BigDecimal("2.50"))));
var response = OrderMapper.toResponse(order);
check("Kopfdaten", "ORD-1", response.orderNumber());
check("Kunde gemappt", new CustomerSummary(7L, "ACME GmbH"), response.customer());
check("Positionen", List.of(
    new OrderLineResponse("SKU-1", 3, new BigDecimal("30.00")),
    new OrderLineResponse("SKU-2", 2, new BigDecimal("5.00"))), response.lines());
check("Gesamtsumme", new BigDecimal("35.00"), response.total());
check("Kunde null bleibt null", null, OrderMapper.toSummary(null));
var empty = OrderMapper.toResponse(new OrderEntity(2L, "ORD-2", null, List.of()));
check("ohne Positionen: Summe ZERO", BigDecimal.ZERO, empty.total());
check("ohne Positionen: leere Liste", List.of(), empty.lines());
check("ohne Kunde", null, empty.customer());
check("einzelne Position", new OrderLineResponse("X", 1, new BigDecimal("9.99")),
    OrderMapper.toLineResponse(new OrderLineEntity("X", 1, new BigDecimal("9.99"))));`,
    },
    {
      id: 'k4',
      title: 'Validierung von Hand (was Bean Validation für dich tut)',
      level: 4,
      description: `Baue nach, was \`@NotBlank\`, \`@Email\` und \`@Min/@Max\` im Hintergrund leisten.

\`validate(CreateUserRequest request)\` → \`List<String>\` mit den Verstößen **in genau dieser Reihenfolge**:

1. \`"email: darf nicht leer sein"\` – wenn \`null\`/leer/nur Whitespace
2. \`"email: ungueltiges Format"\` – sonst, wenn kein \`@\` enthalten ist
3. \`"firstName: darf nicht leer sein"\`
4. \`"lastName: darf nicht leer sein"\`
5. \`"age: darf nicht null sein"\` – wenn \`null\`
6. \`"age: muss zwischen 18 und 120 liegen"\` – sonst, wenn außerhalb

\`toUserOrThrow(request)\` → \`User\`: bei Verstößen \`IllegalArgumentException\` mit allen Meldungen per \`"; "\` verbunden. Sonst ein \`User\` mit \`id = null\`, normalisierter E-Mail (trimmen + Kleinschreibung) und \`fullName = firstName + " " + lastName\`.`,
      given: `record CreateUserRequest(String email, String firstName, String lastName, Integer age) {}
record User(Long id, String email, String fullName, int age) {}`,
      starter: `class RequestValidator {

    static List<String> validate(CreateUserRequest request) {
        // TODO
        return List.of();
    }

    static User toUserOrThrow(CreateUserRequest request) {
        // TODO
        return null;
    }
}`,
      solution: `class RequestValidator {

    static List<String> validate(CreateUserRequest request) {
        List<String> violations = new ArrayList<>();

        if (isBlank(request.email())) {

            violations.add("email: darf nicht leer sein");
        } else if (!request.email().contains("@")) {
            violations.add("email: ungueltiges Format");
        }
        if (isBlank(request.firstName())) {
            violations.add("firstName: darf nicht leer sein");
        }
        if (isBlank(request.lastName())) {
            violations.add("lastName: darf nicht leer sein");
        }
        if (request.age() == null) {
            violations.add("age: darf nicht null sein");
        } else if (request.age() < 18 || request.age() > 120) {
            violations.add("age: muss zwischen 18 und 120 liegen");
        }
        return List.copyOf(violations);
    }

    static User toUserOrThrow(CreateUserRequest request) {
        List<String> violations = validate(request);
        if (!violations.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", violations));
        }
        return new User(
            null,
            request.email().trim().toLowerCase(Locale.ROOT),
            request.firstName() + " " + request.lastName(),
            request.age());
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}`,
      hints: [
        'Sammle die Verstöße in einer Liste, statt beim ersten Fehler abzubrechen – genau so verhält sich Bean Validation auch.',
        '`String.isBlank()`, `String.contains("@")`, `List.copyOf(..)`, `String.join("; ", list)`, `new ArrayList<>()`.',
        'validate: ArrayList anlegen; pro Feld prüfen (bei email erst leer, sonst Format; bei age erst null, sonst Bereich); unveränderlich zurückgeben. toUserOrThrow: validate, bei Verstößen werfen, sonst mappen.',
        '`if (!violations.isEmpty()) { throw new IllegalArgumentException(String.join("; ", violations)); }`',
      ],
      tests: `check("alles gueltig", List.of(), RequestValidator.validate(new CreateUserRequest("jan@example.com", "Jan", "P", 30)));
check("alles leer", List.of(
    "email: darf nicht leer sein",
    "firstName: darf nicht leer sein",
    "lastName: darf nicht leer sein",
    "age: darf nicht null sein"), RequestValidator.validate(new CreateUserRequest("   ", "", null, null)));
check("email-Format", List.of("email: ungueltiges Format"), RequestValidator.validate(new CreateUserRequest("jan.example.com", "Jan", "P", 30)));
check("zu jung", List.of("age: muss zwischen 18 und 120 liegen"), RequestValidator.validate(new CreateUserRequest("a@b.de", "Jan", "P", 17)));
check("zu alt", List.of("age: muss zwischen 18 und 120 liegen"), RequestValidator.validate(new CreateUserRequest("a@b.de", "Jan", "P", 121)));
check("Grenzwert 18", List.of(), RequestValidator.validate(new CreateUserRequest("a@b.de", "Jan", "P", 18)));
check("Grenzwert 120", List.of(), RequestValidator.validate(new CreateUserRequest("a@b.de", "Jan", "P", 120)));
check("Mapping", new User(null, "jan@example.com", "Jan Pfrommer", 30),
    RequestValidator.toUserOrThrow(new CreateUserRequest(" Jan@Example.COM ", "Jan", "Pfrommer", 30)));
checkThrows("ungueltig wirft", IllegalArgumentException.class,
    () -> RequestValidator.toUserOrThrow(new CreateUserRequest("", "", "", null)));`,
    },
    {
      id: 'k5',
      title: 'Kompletter Schnitt: Controller, DTOs, Mapper (write & compare)',
      level: 4,
      description: `Schreibe von Hand einen sauberen REST-Schnitt für \`User\` – hier gibt es keine automatischen Tests, du vergleichst mit der Musterlösung.

1. \`CreateUserRequest\` als Record mit Bean Validation (\`@NotBlank\`, \`@Email\`, \`@Size\`)
2. \`UpdateUserRequest\` als Record (nur Vor- und Nachname)
3. \`UserResponse\` als Record – **ohne** Passwort
4. \`UserMapper\` als \`@Component\` mit \`toResponse\`, \`toResponses\`, \`toEntity\` und \`applyUpdate\`
5. \`UserController\` mit \`GET /api/users\`, \`GET /api/users/{id}\`, \`POST /api/users\` (201 + \`Location\`) und \`PUT /api/users/{id}\`
6. \`UserService\` mit \`@Transactional(readOnly = true)\` beim Lesen und \`@Transactional\` beim Schreiben

Achte darauf: Der Controller sieht **nie** eine Entity, \`@Valid\` steht an jedem Request-Body, und das Update lädt die Entity und verändert sie.`,
      starter: `// TODO: CreateUserRequest, UpdateUserRequest, UserResponse, UserMapper, UserService, UserController`,
      solution: `import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

// ---------- DTOs ----------

public record CreateUserRequest(
    @NotBlank @Email @Size(max = 255) String email,
    @NotBlank @Size(max = 100) String firstName,
    @NotBlank @Size(max = 100) String lastName,
    @NotBlank @Size(min = 12, max = 128) String password) {}

public record UpdateUserRequest(
    @NotBlank @Size(max = 100) String firstName,
    @NotBlank @Size(max = 100) String lastName) {}

public record UserResponse(Long id, String email, String fullName, boolean active) {}

// ---------- Mapper ----------

@Component
public class UserMapper {

    public UserResponse toResponse(UserEntity entity) {
        return new UserResponse(
            entity.getId(),
            entity.getEmail(),
            entity.getFirstName() + " " + entity.getLastName(),
            entity.isActive());
    }

    public List<UserResponse> toResponses(List<UserEntity> entities) {
        return entities.stream().map(this::toResponse).toList();
    }

    /** Anlegen: neue Instanz, id vergibt die DB. */
    public UserEntity toEntity(CreateUserRequest request, String passwordHash) {
        UserEntity entity = new UserEntity();
        entity.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        entity.setFirstName(request.firstName());
        entity.setLastName(request.lastName());
        entity.setPasswordHash(passwordHash);
        entity.setActive(true);
        return entity;
    }

    /** Update: verändert die geladene Instanz, erzeugt KEINE neue. */
    public void applyUpdate(UserEntity target, UpdateUserRequest request) {
        target.setFirstName(request.firstName());
        target.setLastName(request.lastName());
    }
}

// ---------- Service ----------

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper mapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return mapper.toResponses(userRepository.findAll());
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userRepository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        UserEntity entity = mapper.toEntity(request, passwordEncoder.encode(request.password()));
        return mapper.toResponse(userRepository.save(entity));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        UserEntity entity = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        mapper.applyUpdate(entity, request);        // Dirty Checking, kein save() nötig
        return mapper.toResponse(entity);
    }
}

// ---------- Controller ----------

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> list() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        UserResponse created = userService.create(request);
        return ResponseEntity
            .created(URI.create("/api/users/" + created.id()))
            .body(created);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }
}`,
      hints: [
        'Drei Typen an der API-Grenze: eine Eingabe pro Use Case, eine Ausgabe. Die Entity bleibt hinter dem Service.',
        '`@Valid @RequestBody`, `@NotBlank`, `@Email`, `@Size`, `ResponseEntity.created(URI)`, `@Transactional(readOnly = true)`, Constructor Injection.',
        'Controller → Service (DTO rein, DTO raus) → Repository (Entity). Beim Update: findById → orElseThrow → applyUpdate auf der geladenen Instanz → toResponse.',
        '`mapper.applyUpdate(entity, request);` statt `repository.save(new UserEntity(...))` – die geladene Instanz wird durch Dirty Checking gespeichert.',
      ],
    },
  ],
}

export default chapter
