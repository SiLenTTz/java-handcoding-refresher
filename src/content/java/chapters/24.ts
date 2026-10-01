import type { ChapterContent } from '../../types'

const STATUS_PLAIN = `enum OrderStatus { NEW, PAID, SHIPPED, DELIVERED, CANCELLED }
`

const STATUS_WITH_RULES = `enum OrderStatus {
    NEW, PAID, SHIPPED, DELIVERED, CANCELLED;

    boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case NEW -> target == PAID || target == CANCELLED;
            case PAID -> target == SHIPPED || target == CANCELLED;
            case SHIPPED -> target == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }
}
`

const DOMAIN = `
// ---- Entities (plain Java, in Spring: @Entity) ----
class OrderItem {
    private final String productName;
    private final int quantity;
    private final BigDecimal unitPrice;

    OrderItem(String productName, int quantity, BigDecimal unitPrice) {
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
    String getProductName() { return productName; }
    int getQuantity() { return quantity; }
    BigDecimal getUnitPrice() { return unitPrice; }
}

class Order {
    private Long id;
    private final String customerEmail;
    private final Instant createdAt;
    private OrderStatus status = OrderStatus.NEW;
    private final List<OrderItem> items = new ArrayList<>();

    Order(String customerEmail, Instant createdAt) {
        this.customerEmail = customerEmail;
        this.createdAt = createdAt;
    }
    Long getId() { return id; }
    void setId(Long id) { this.id = id; }
    String getCustomerEmail() { return customerEmail; }
    Instant getCreatedAt() { return createdAt; }
    OrderStatus getStatus() { return status; }
    void setStatus(OrderStatus status) { this.status = status; }
    List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
    void addItem(OrderItem item) { items.add(item); }
}

// ---- DTOs ----
record OrderItemRequest(String productName, int quantity, BigDecimal unitPrice) {}
record CreateOrderRequest(String customerEmail, List<OrderItemRequest> items) {}
record OrderItemResponse(String productName, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
record OrderResponse(Long id, String customerEmail, OrderStatus status,
                     List<OrderItemResponse> items, BigDecimal total, Instant createdAt) {}
`

const MAPPER_SOLUTION = `class OrderMapper {

    Order toEntity(CreateOrderRequest request, Instant now) {
        Order order = new Order(request.customerEmail().trim().toLowerCase(), now);
        request.items().forEach(item ->
            order.addItem(new OrderItem(item.productName().trim(), item.quantity(), item.unitPrice())));
        return order;
    }

    OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
            .map(this::toItemResponse)
            .toList();
        BigDecimal total = items.stream()
            .map(OrderItemResponse::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
        return new OrderResponse(order.getId(), order.getCustomerEmail(), order.getStatus(),
                                 items, total, order.getCreatedAt());
    }

    List<OrderResponse> toResponses(List<Order> orders) {
        return orders.stream().map(this::toResponse).toList();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice()
            .multiply(BigDecimal.valueOf(item.getQuantity()))
            .setScale(2, RoundingMode.HALF_UP);
        return new OrderItemResponse(item.getProductName(), item.getQuantity(), item.getUnitPrice(), lineTotal);
    }
}`

const INFRA = `
// ---- Repository ----
interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findAll();
}

class InMemoryOrderRepository implements OrderRepository {
    private final Map<Long, Order> store = new LinkedHashMap<>();
    private long nextId = 1;

    public Order save(Order order) {
        if (order.getId() == null) {
            order.setId(nextId++);
        }
        store.put(order.getId(), order);
        return order;
    }
    public Optional<Order> findById(Long id) { return Optional.ofNullable(store.get(id)); }
    public List<Order> findAll() { return new ArrayList<>(store.values()); }
}

// ---- Exceptions ----
class OrderNotFoundException extends RuntimeException {
    OrderNotFoundException(Long id) { super("Order " + id + " not found"); }
}

class ValidationException extends RuntimeException {
    private final String field;
    ValidationException(String field, String message) {
        super(field + ": " + message);
        this.field = field;
    }
    String field() { return field; }
}

class InvalidStatusTransitionException extends RuntimeException {
    InvalidStatusTransitionException(OrderStatus from, OrderStatus to) {
        super("Cannot change status from " + from + " to " + to);
    }
}

// ---- Pagination ----
record PageResult<T>(List<T> content, int page, int size, long totalElements) {
    int totalPages() { return (int) Math.ceil((double) totalElements / size); }
    boolean hasNext() { return page + 1 < totalPages(); }
}
`

const chapter: ChapterContent = {
  id: '24',
  flashcards: [
    { id: 'c1', front: 'Welche Pakete hat eine klassische Layered Spring API?', back: '`controller`, `dto`, `mapper`, `service`, `repository`, `entity`, `exception` – alternativ package by feature mit denselben Rollen darin.' },
    { id: 'c2', front: 'Aufgabe des **Controllers**?', back: 'HTTP übersetzen: Request-DTO annehmen (`@Valid @RequestBody`), Service aufrufen, Response-DTO + Status zurückgeben. Keine Business-Logik, kein Repository-Zugriff.' },
    { id: 'c3', front: 'Aufgabe des **Service**?', back: 'Use Case orchestrieren, Transaktionsgrenze (`@Transactional`), Business-Regeln durchsetzen, Entities laden (`findOrThrow`), Mapper aufrufen.' },
    { id: 'c4', front: 'Aufgabe des **Mappers**?', back: 'DTO ↔ Entity umwandeln (`toEntity`, `toResponse`). Keine Business-Regeln, keine Repository-Zugriffe. Einfach testbar, alternativ MapStruct.' },
    { id: 'c5', front: 'Warum `@Table(name = "orders")`?', back: '`ORDER` ist ein reserviertes SQL-Keyword (`ORDER BY`). Die Tabelle `order` führt zu SQL-Syntaxfehlern.' },
    { id: 'c6', front: 'Warum `@Enumerated(EnumType.STRING)`?', back: 'Default `ORDINAL` speichert die Position. Eine neu eingefügte Konstante verschiebt alle Werte – bestehende Daten werden falsch interpretiert.' },
    { id: 'c7', front: 'Wo gehören Statusübergänge hin?', back: 'In die Domain: `OrderStatus.canTransitionTo(target)` mit `switch` bzw. `order.changeStatus(target)`. Kein freies `setStatus` von außen – sonst werden Regeln umgangen.' },
    { id: 'c8', front: 'Validation für eine Liste verschachtelter Request-Objekte?', back: '`@NotEmpty List<@Valid OrderItemRequest> items` – ohne `@Valid` werden die Constraints der Elemente nicht geprüft.' },
    { id: 'c9', front: 'Korrekte Antwort auf `POST /api/orders`?', back: '`201 Created` mit `Location: /api/orders/{id}` und dem Response-DTO: `ResponseEntity.created(uri).body(response)`.' },
    { id: 'c10', front: 'Exception → HTTP-Status in der Order-API?', back: '`OrderNotFoundException` → 404, `MethodArgumentNotValidException` → 400, `InvalidStatusTransitionException` → 409 Conflict. Zentral in `@RestControllerAdvice`, gern als `ProblemDetail`.' },
    { id: 'c11', front: 'Warum `@Transactional(readOnly = true)` auf Klassenebene im Service?', back: 'Default für Lesemethoden: Hibernate spart Dirty Checking/Flush. Schreibende Methoden überschreiben mit `@Transactional`.' },
    { id: 'c12', front: 'Warum braucht `changeStatus` im Service kein `save()`?', back: 'Die per `findById` geladene Entity ist innerhalb der Transaktion **managed**. Dirty Checking schreibt Änderungen beim Commit automatisch.' },
    { id: 'c13', front: '`Page` vs `Slice` in der Order-Liste?', back: '`Page`: Seitenzahlen + Gesamtanzahl, braucht Count-Query. `Slice`: nur `hasNext()`, lädt `size + 1`, keine Count-Query – ideal für "Load more".' },
    { id: 'c14', front: 'Wie Pagination-Defaults im Controller setzen?', back: '`@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable`' },
    { id: 'c15', front: 'Wie berechnet man den Order-Total korrekt?', back: '`items.stream().map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity()))).reduce(BigDecimal.ZERO, BigDecimal::add)` – `BigDecimal`, Startwert `ZERO`, Rundung bewusst mit `setScale`.' },
    { id: 'c16', front: 'Warum `Clock` in den `OrderService` injizieren?', back: '`createdAt = clock.instant()` wird deterministisch testbar (`Clock.fixed`). Als Bean: `@Bean Clock clock() { return Clock.systemUTC(); }`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Schicht sollte prüfen, ob eine Order von `SHIPPED` nach `CANCELLED` wechseln darf?',
      options: ['Controller', 'Domain (Enum/Entity), aufgerufen vom Service', 'Mapper', 'Repository per `@Query`'],
      correct: 1,
      explanation: 'Statusregeln sind Business-Logik. Sie gehören ins Domain-Modell (`canTransitionTo`), der Service lädt die Order und löst den Übergang aus.',
    },
    {
      id: 'q2',
      prompt: 'Was ist hier falsch?',
      code: `@Entity
public class Order {
    @Id @GeneratedValue Long id;
    @Enumerated
    OrderStatus status;
}`,
      options: [
        '`@Id` braucht immer `@Column`',
        'Enums können nicht persistiert werden',
        'Tabellenname `order` (SQL-Keyword) und `@Enumerated` ohne `STRING` (Default ORDINAL)',
        '`@GeneratedValue` muss `strategy = AUTO` haben',
      ],
      correct: 2,
      explanation: 'Ohne `@Table(name = "orders")` heißt die Tabelle `order` → SQL-Fehler. `@Enumerated` ohne Argument speichert ORDINAL → fragil bei neuen Konstanten.',
    },
    {
      id: 'q3',
      prompt: 'Die Items eines `CreateOrderRequest` werden trotz `@Positive int quantity` im `OrderItemRequest` nicht validiert. Warum?',
      code: `public record CreateOrderRequest(
    @NotBlank @Email String customerEmail,
    @NotEmpty List<OrderItemRequest> items) {}`,
      options: [
        'Es fehlt `@Valid` an den Listenelementen: `List<@Valid OrderItemRequest>`',
        'Records unterstützen keine Bean Validation',
        '`@Positive` funktioniert nur mit `Integer`, nicht `int`',
        'Der Controller braucht `@Validated` statt `@Valid`',
      ],
      correct: 0,
      explanation: 'Bean Validation kaskadiert nur mit `@Valid`. Für Listenelemente: `List<@Valid OrderItemRequest>` (oder `@Valid` am Feld).',
    },
    {
      id: 'q4',
      prompt: 'Welche Antwort ist für `POST /api/orders` (erfolgreich angelegt) am saubersten?',
      options: [
        '`200 OK` mit der Entity',
        '`204 No Content`',
        '`202 Accepted` mit der id als String',
        '`201 Created` mit `Location`-Header und `OrderResponse`',
      ],
      correct: 3,
      explanation: 'Ressource wurde erzeugt → 201 + Location auf die neue Ressource. Body ist das Response-DTO, nie die Entity.',
    },
    {
      id: 'q5',
      prompt: 'Welcher Status passt zu `InvalidStatusTransitionException` (Order ist schon `DELIVERED`, Client will `CANCELLED`)?',
      options: ['404 Not Found', '409 Conflict', '500 Internal Server Error', '401 Unauthorized'],
      correct: 1,
      explanation: 'Der Request ist syntaktisch korrekt, kollidiert aber mit dem aktuellen Zustand der Ressource → 409 Conflict (manche Teams nutzen 422).',
    },
    {
      id: 'q6',
      prompt: 'Was ist das Problem?',
      code: `@Transactional(readOnly = true)
public OrderResponse get(Long id) {
    return mapper.toResponse(repository.findById(id).get());
}`,
      options: [
        '`readOnly` verhindert das Lesen',
        '`mapper.toResponse` darf nicht in einer Transaktion laufen',
        'Unbekannte id → `NoSuchElementException` → 500 statt 404; besser `orElseThrow(() -> new OrderNotFoundException(id))`',
        '`findById` gibt `null` zurück, `.get()` ist korrekt',
      ],
      correct: 2,
      explanation: '`Optional.get()` auf leerem Optional wirft `NoSuchElementException`, die der Advice nicht kennt → 500. Mit eigener Exception sauber auf 404 mappen.',
    },
    {
      id: 'q7',
      prompt: 'Eine mobile App lädt Bestellungen per Infinite Scroll ("Mehr laden"). Die Tabelle hat 50 Mio. Zeilen. Welcher Rückgabetyp im Repository?',
      options: ['`Slice<Order>`', '`Page<Order>`', '`List<Order>` mit `findAll()`', '`Stream<Order>` ohne Limit'],
      correct: 0,
      explanation: '`Slice` lädt `size + 1` Elemente, um `hasNext()` zu bestimmen, und spart die teure Count-Query, die `Page` benötigt.',
    },
    {
      id: 'q8',
      prompt: 'Welche Warnung/Problem entsteht hier?',
      code: `@Query("select o from Order o join fetch o.items")
Page<Order> findAllWithItems(Pageable pageable);`,
      options: [
        'Compile-Fehler: `Page` ist mit `@Query` nicht erlaubt',
        'Hibernate kann nicht in SQL paginieren und paginiert im Speicher (lädt alle Zeilen) – HHH90003004',
        'Der Fetch Join wird ignoriert',
        'Es entsteht ein N+1-Problem',
      ],
      correct: 1,
      explanation: 'Fetch Join auf eine Collection multipliziert Zeilen; `LIMIT` würde Orders abschneiden. Hibernate lädt deshalb alles und paginiert im RAM. Lösung: IDs paginieren oder ohne Fetch Join + `@BatchSize`.',
    },
    {
      id: 'q9',
      prompt: 'Warum ist `order.getItems()` in der Entity als `Collections.unmodifiableList(items)` + `addItem(...)` modelliert?',
      options: [
        'Weil JPA sonst die Liste nicht laden kann',
        'Aus Performance-Gründen',
        'Weil Records das verlangen',
        'Kapselung: Änderungen laufen über eine Methode, die Invarianten (z. B. Rückreferenz `item.setOrder(this)`, nur im Status NEW) sicherstellt',
      ],
      correct: 3,
      explanation: 'Die Entity kontrolliert ihre Invarianten selbst. Bei bidirektionalen Beziehungen setzt der Helper beide Seiten konsistent.',
    },
    {
      id: 'q10',
      prompt: 'Wo sollte `@Transactional` für `createOrder` stehen?',
      options: [
        'Auf der Service-Methode (public), die den Use Case umsetzt',
        'Auf der Controller-Methode',
        'Auf einer `private` Hilfsmethode im Service',
        'Auf dem Repository-Interface, sonst gibt es keine Transaktion',
      ],
      correct: 0,
      explanation: 'Der Service definiert die Transaktionsgrenze des Use Cases. Auf `private` Methoden greift der Proxy nicht; im Controller vermischt es HTTP mit Persistenz.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'OrderMapper mit BigDecimal-Totals',
      level: 3,
      description: `Schreibe den \`OrderMapper\` (plain Java – in Spring wäre er ein \`@Component\`).

- \`toEntity(request, now)\`: E-Mail **getrimmt und lowercase**, \`createdAt = now\`, Status bleibt \`NEW\`, Items übernehmen (\`productName\` getrimmt).
- \`toResponse(order)\`: alle Felder übernehmen; pro Item \`lineTotal = unitPrice * quantity\`, \`total = Σ lineTotal\`. Beide mit \`setScale(2, RoundingMode.HALF_UP)\`. Leere Order → \`total = 0.00\`.
- \`toResponses(orders)\`: Liste mappen.

Keine Business-Logik im Mapper.`,
      given: STATUS_PLAIN + DOMAIN,
      starter: `class OrderMapper {

    Order toEntity(CreateOrderRequest request, Instant now) {
        // TODO: E-Mail normalisieren, Items übernehmen
        return new Order(request.customerEmail(), now);
    }

    OrderResponse toResponse(Order order) {
        // TODO: lineTotal und total mit BigDecimal
        return null;
    }

    List<OrderResponse> toResponses(List<Order> orders) {
        // TODO
        return List.of();
    }
}`,
      solution: MAPPER_SOLUTION,
      hints: [
        '`toEntity`: erst `Order` mit normalisierter E-Mail erzeugen, dann über `request.items()` iterieren und `order.addItem(new OrderItem(...))`.',
        'Für `toResponse` zuerst die Items mappen (private Methode `toItemResponse`), dort `unitPrice.multiply(BigDecimal.valueOf(quantity))`.',
        'Total: `items.stream().map(OrderItemResponse::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP)` – `ZERO` als Startwert deckt die leere Order ab.',
      ],
      tests: `Instant now = Instant.parse("2025-05-01T10:00:00Z");
var mapper = new OrderMapper();
var request = new CreateOrderRequest("  Ada@Example.COM ", List.of(
    new OrderItemRequest("Book", 2, new BigDecimal("12.50")),
    new OrderItemRequest(" Pen ", 3, new BigDecimal("1.99"))));
Order order = mapper.toEntity(request, now);
check("E-Mail normalisiert", "ada@example.com", order.getCustomerEmail());
check("createdAt aus Parameter", now, order.getCreatedAt());
check("Status NEW", OrderStatus.NEW, order.getStatus());
check("Items übernommen", 2, order.getItems().size());
check("productName getrimmt", "Pen", order.getItems().get(1).getProductName());
order.setId(7L);
OrderResponse response = mapper.toResponse(order);
check("id übernommen", 7L, response.id());
check("lineTotal Book", new BigDecimal("25.00"), response.items().get(0).lineTotal());
check("lineTotal Pen", new BigDecimal("5.97"), response.items().get(1).lineTotal());
check("total", new BigDecimal("30.97"), response.total());
check("leere Order: total 0.00", new BigDecimal("0.00"), mapper.toResponse(new Order("x@y.de", now)).total());
check("toResponses", List.of(7L), mapper.toResponses(List.of(order)).stream().map(OrderResponse::id).toList());`,
    },
    {
      id: 'k2',
      title: 'Statusübergänge mit switch',
      level: 3,
      description: `Implementiere die Statusmaschine einer Order in \`OrderTransitions\`:

\`\`\`text
NEW      → PAID, CANCELLED
PAID     → SHIPPED, CANCELLED
SHIPPED  → DELIVERED
DELIVERED, CANCELLED → (Endzustände)
\`\`\`

- \`canTransition(from, to)\`: \`true\` nur für erlaubte Übergänge (gleicher Status → \`false\`).
- \`allowedTargets(from)\`: Menge der erlaubten Zielstatus (Endzustand → leere Menge).
- \`apply(from, to)\`: liefert \`to\` oder wirft \`InvalidStatusTransitionException\`.

Nutze einen \`switch\`-Ausdruck, damit der Compiler bei einer neuen Enum-Konstante meckert.`,
      given: STATUS_PLAIN + `
class InvalidStatusTransitionException extends RuntimeException {
    InvalidStatusTransitionException(OrderStatus from, OrderStatus to) {
        super("Cannot change status from " + from + " to " + to);
    }
}`,
      starter: `class OrderTransitions {

    static Set<OrderStatus> allowedTargets(OrderStatus from) {
        // TODO: switch-Ausdruck
        return Set.of();
    }

    static boolean canTransition(OrderStatus from, OrderStatus to) {
        // TODO
        return false;
    }

    static OrderStatus apply(OrderStatus from, OrderStatus to) {
        // TODO
        return from;
    }
}`,
      solution: `class OrderTransitions {

    static Set<OrderStatus> allowedTargets(OrderStatus from) {
        return switch (from) {
            case NEW -> EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED);
            case PAID -> EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED);
            case SHIPPED -> EnumSet.of(OrderStatus.DELIVERED);
            case DELIVERED, CANCELLED -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    static boolean canTransition(OrderStatus from, OrderStatus to) {
        return allowedTargets(from).contains(to);
    }

    static OrderStatus apply(OrderStatus from, OrderStatus to) {
        if (!canTransition(from, to)) {
            throw new InvalidStatusTransitionException(from, to);
        }
        return to;
    }
}`,
      hints: [
        'Eine Methode als "Single Source of Truth" (z. B. `allowedTargets`), die anderen beiden bauen darauf auf.',
        '`switch (from) { case NEW -> ...; case DELIVERED, CANCELLED -> ...; }` – als Ausdruck ohne `default`, dann ist er exhaustiv.',
        '`EnumSet.of(...)` bzw. `EnumSet.noneOf(OrderStatus.class)` für die Mengen; `canTransition` = `allowedTargets(from).contains(to)`.',
      ],
      tests: `check("NEW -> PAID", true, OrderTransitions.canTransition(OrderStatus.NEW, OrderStatus.PAID));
check("NEW -> SHIPPED verboten", false, OrderTransitions.canTransition(OrderStatus.NEW, OrderStatus.SHIPPED));
check("PAID -> CANCELLED", true, OrderTransitions.canTransition(OrderStatus.PAID, OrderStatus.CANCELLED));
check("SHIPPED -> CANCELLED verboten", false, OrderTransitions.canTransition(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
check("gleicher Status verboten", false, OrderTransitions.canTransition(OrderStatus.PAID, OrderStatus.PAID));
check("allowedTargets NEW", Set.of(OrderStatus.PAID, OrderStatus.CANCELLED), OrderTransitions.allowedTargets(OrderStatus.NEW));
check("allowedTargets SHIPPED", Set.of(OrderStatus.DELIVERED), OrderTransitions.allowedTargets(OrderStatus.SHIPPED));
check("Endzustand DELIVERED", Set.of(), OrderTransitions.allowedTargets(OrderStatus.DELIVERED));
check("Endzustand CANCELLED", Set.of(), OrderTransitions.allowedTargets(OrderStatus.CANCELLED));
check("apply erlaubt", OrderStatus.SHIPPED, OrderTransitions.apply(OrderStatus.PAID, OrderStatus.SHIPPED));
checkThrows("apply verboten", InvalidStatusTransitionException.class, () -> OrderTransitions.apply(OrderStatus.DELIVERED, OrderStatus.CANCELLED));`,
    },
    {
      id: 'k3',
      title: 'OrderService: Validierung, Status, Pagination',
      level: 5,
      description: `Implementiere den \`OrderService\` der Mini-Order-API (plain Java – in Spring: \`@Service\` + \`@Transactional\`). Gegeben sind Entity, DTOs, \`OrderStatus.canTransitionTo\`, Repository (In-Memory), Mapper, Exceptions und \`PageResult\`.

**create(request)**
- \`request == null\` → \`ValidationException("request", ...)\`
- \`customerEmail\` \`null\`/blank/ohne \`@\` → Feld \`"customerEmail"\`
- \`items\` \`null\`/leer → \`"items"\`; pro Item: \`productName\` \`null\`/blank → \`"productName"\`, \`quantity <= 0\` → \`"quantity"\`, \`unitPrice\` \`null\` oder \`<= 0\` → \`"unitPrice"\`
- \`createdAt\` aus der injizierten \`Clock\`; speichern und als \`OrderResponse\` zurückgeben. Ungültige Orders werden **nicht** gespeichert.

**get(id)** → \`OrderNotFoundException\` bei unbekannter id.

**changeStatus(id, target)** → nur erlaubte Übergänge, sonst \`InvalidStatusTransitionException\` (Status bleibt unverändert).

**addItem(id, item)** → Item validieren (wie oben), nur im Status \`NEW\`, sonst \`IllegalStateException\`.

**list(status, page, size)** → \`status == null\` = alle; **neueste zuerst** (höchste id zuerst); \`page\` 0-basiert; \`page < 0\` → Feld \`"page"\`, \`size < 1\` → Feld \`"size"\`; \`totalElements\` = Anzahl aller Treffer.`,
      given: STATUS_WITH_RULES + DOMAIN + INFRA + '\n// ---- Mapper ----\n' + MAPPER_SOLUTION,
      starter: `class OrderService {

    private final OrderRepository repository;
    private final OrderMapper mapper;
    private final Clock clock;

    OrderService(OrderRepository repository, OrderMapper mapper, Clock clock) {
        this.repository = repository;
        this.mapper = mapper;
        this.clock = clock;
    }

    OrderResponse create(CreateOrderRequest request) {
        // TODO: validieren, mappen, speichern
        return null;
    }

    OrderResponse get(Long id) {
        // TODO
        return null;
    }

    OrderResponse changeStatus(Long id, OrderStatus target) {
        // TODO
        return null;
    }

    OrderResponse addItem(Long id, OrderItemRequest item) {
        // TODO
        return null;
    }

    PageResult<OrderResponse> list(OrderStatus status, int page, int size) {
        // TODO
        return new PageResult<>(List.of(), page, size, 0);
    }
}`,
      solution: `class OrderService {

    private final OrderRepository repository;
    private final OrderMapper mapper;
    private final Clock clock;

    OrderService(OrderRepository repository, OrderMapper mapper, Clock clock) {
        this.repository = repository;
        this.mapper = mapper;
        this.clock = clock;
    }

    OrderResponse create(CreateOrderRequest request) {
        validate(request);
        Order order = mapper.toEntity(request, clock.instant());
        return mapper.toResponse(repository.save(order));
    }

    OrderResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    OrderResponse changeStatus(Long id, OrderStatus target) {
        Order order = findOrThrow(id);
        if (!order.getStatus().canTransitionTo(target)) {
            throw new InvalidStatusTransitionException(order.getStatus(), target);
        }
        order.setStatus(target);
        return mapper.toResponse(repository.save(order));
    }

    OrderResponse addItem(Long id, OrderItemRequest item) {
        validateItem(item);
        Order order = findOrThrow(id);
        if (order.getStatus() != OrderStatus.NEW) {
            throw new IllegalStateException("Order " + id + " is " + order.getStatus() + " and cannot be modified");
        }
        order.addItem(new OrderItem(item.productName().trim(), item.quantity(), item.unitPrice()));
        return mapper.toResponse(repository.save(order));
    }

    PageResult<OrderResponse> list(OrderStatus status, int page, int size) {
        if (page < 0) throw new ValidationException("page", "must be >= 0");
        if (size < 1) throw new ValidationException("size", "must be >= 1");

        List<Order> matching = repository.findAll().stream()
            .filter(order -> status == null || order.getStatus() == status)
            .sorted(Comparator.comparing(Order::getId).reversed())
            .toList();

        List<OrderResponse> content = matching.stream()
            .skip((long) page * size)
            .limit(size)
            .map(mapper::toResponse)
            .toList();

        return new PageResult<>(content, page, size, matching.size());
    }

    private Order findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }

    private void validate(CreateOrderRequest request) {
        if (request == null) {
            throw new ValidationException("request", "must not be null");
        }
        String email = request.customerEmail();
        if (email == null || email.isBlank() || !email.contains("@")) {
            throw new ValidationException("customerEmail", "must be a valid email");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new ValidationException("items", "must not be empty");
        }
        request.items().forEach(this::validateItem);
    }

    private void validateItem(OrderItemRequest item) {
        if (item == null) {
            throw new ValidationException("item", "must not be null");
        }
        if (item.productName() == null || item.productName().isBlank()) {
            throw new ValidationException("productName", "must not be blank");
        }
        if (item.quantity() <= 0) {
            throw new ValidationException("quantity", "must be positive");
        }
        if (item.unitPrice() == null || item.unitPrice().signum() <= 0) {
            throw new ValidationException("unitPrice", "must be positive");
        }
    }
}`,
      hints: [
        'Struktur wie in Spring: öffentliche Use-Case-Methoden, private Helfer `findOrThrow`, `validate`, `validateItem`. Validierung **vor** dem Speichern.',
        'Validierung als Guard Clauses: je Regel ein `if (...) throw new ValidationException("feld", "...")`. `unitPrice.signum() <= 0` prüft "nicht positiv".',
        '`changeStatus`: `order.getStatus().canTransitionTo(target)` prüfen, erst dann `setStatus`. `addItem`: Status `NEW` als Guard.',
        '`list`: `findAll().stream().filter(status == null || ...).sorted(Comparator.comparing(Order::getId).reversed()).toList()`, dann `skip((long) page * size).limit(size).map(mapper::toResponse)`.',
      ],
      tests: `Clock clock = Clock.fixed(Instant.parse("2025-05-01T10:00:00Z"), ZoneOffset.UTC);
var repo = new InMemoryOrderRepository();
var service = new OrderService(repo, new OrderMapper(), clock);
Function<Runnable, String> fieldOf = action -> {
    try { action.run(); return "keine ValidationException"; }
    catch (ValidationException e) { return e.field(); }
};
var book = new OrderItemRequest("Book", 2, new BigDecimal("12.50"));

OrderResponse created = service.create(new CreateOrderRequest("Ada@x.de", List.of(book)));
check("create vergibt id", 1L, created.id());
check("create Status NEW", OrderStatus.NEW, created.status());
check("create total", new BigDecimal("25.00"), created.total());
check("createdAt aus Clock", clock.instant(), created.createdAt());
check("get liefert dieselbe Order", created, service.get(1L));
checkThrows("get unbekannte id", OrderNotFoundException.class, () -> service.get(99L));

check("Validation: request null", "request", fieldOf.apply(() -> service.create(null)));
check("Validation: E-Mail blank", "customerEmail", fieldOf.apply(() -> service.create(new CreateOrderRequest("  ", List.of(book)))));
check("Validation: E-Mail ohne @", "customerEmail", fieldOf.apply(() -> service.create(new CreateOrderRequest("ada.x.de", List.of(book)))));
check("Validation: items leer", "items", fieldOf.apply(() -> service.create(new CreateOrderRequest("a@x.de", List.of()))));
check("Validation: items null", "items", fieldOf.apply(() -> service.create(new CreateOrderRequest("a@x.de", null))));
check("Validation: quantity 0", "quantity", fieldOf.apply(() -> service.create(new CreateOrderRequest("a@x.de", List.of(new OrderItemRequest("Pen", 0, BigDecimal.ONE))))));
check("Validation: Preis 0", "unitPrice", fieldOf.apply(() -> service.create(new CreateOrderRequest("a@x.de", List.of(new OrderItemRequest("Pen", 1, BigDecimal.ZERO))))));
check("Validation: productName blank", "productName", fieldOf.apply(() -> service.create(new CreateOrderRequest("a@x.de", List.of(new OrderItemRequest(" ", 1, BigDecimal.ONE))))));
check("ungültige Orders nicht gespeichert", 1, repo.findAll().size());

OrderResponse withPen = service.addItem(1L, new OrderItemRequest("Pen", 3, new BigDecimal("1.99")));
check("addItem erhöht total", new BigDecimal("30.97"), withPen.total());
check("addItem validiert", "quantity", fieldOf.apply(() -> service.addItem(1L, new OrderItemRequest("Pen", -1, BigDecimal.ONE))));

check("changeStatus NEW -> PAID", OrderStatus.PAID, service.changeStatus(1L, OrderStatus.PAID).status());
checkThrows("PAID -> DELIVERED verboten", InvalidStatusTransitionException.class, () -> service.changeStatus(1L, OrderStatus.DELIVERED));
check("Status nach Fehler unverändert", OrderStatus.PAID, service.get(1L).status());
checkThrows("addItem nur im Status NEW", IllegalStateException.class, () -> service.addItem(1L, book));
checkThrows("changeStatus unbekannte id", OrderNotFoundException.class, () -> service.changeStatus(42L, OrderStatus.PAID));

for (int i = 0; i < 4; i++) {
    service.create(new CreateOrderRequest("c" + i + "@x.de", List.of(book)));
}
PageResult<OrderResponse> first = service.list(null, 0, 2);
check("list: neueste zuerst", List.of(5L, 4L), first.content().stream().map(OrderResponse::id).toList());
check("list: totalElements", 5L, first.totalElements());
check("list: Seite 2", List.of(1L), service.list(null, 2, 2).content().stream().map(OrderResponse::id).toList());
check("list: Filter PAID", List.of(1L), service.list(OrderStatus.PAID, 0, 10).content().stream().map(OrderResponse::id).toList());
check("list: Seite hinter dem Ende leer", List.of(), service.list(null, 9, 2).content());
check("list: size 0 ungültig", "size", fieldOf.apply(() -> service.list(null, 0, 0)));
check("list: page -1 ungültig", "page", fieldOf.apply(() -> service.list(null, -1, 5)));`,
    },
    {
      id: 'k4',
      title: 'Write & Compare: Spring Order API (Controller, Service, Advice)',
      level: 5,
      description: `Schreibe die Spring-Boot-3-Version der Order-API von Hand:

1. \`OrderRepository extends JpaRepository<Order, Long>\` mit \`Page<Order> findByStatus(OrderStatus status, Pageable pageable)\`
2. \`OrderService\` (\`@Service\`, Constructor Injection, \`@Transactional(readOnly = true)\` auf Klasse, \`@Transactional\` für Writes) mit \`create\`, \`get\`, \`list(status, pageable)\`, \`changeStatus\`
3. \`OrderController\` unter \`/api/orders\`: \`POST\` (201 + Location), \`GET /{id}\`, \`GET\` mit optionalem \`status\`-Filter und \`@PageableDefault(size = 20, sort = "createdAt", direction = DESC)\`, \`PATCH /{id}/status\`
4. \`GlobalExceptionHandler\` (\`@RestControllerAdvice\`): 404, 409, 400 mit Feldfehlern als \`ProblemDetail\`

Request-DTOs mit Bean Validation (inkl. \`List<@Valid OrderItemRequest>\`). Wird nicht automatisch geprüft – vergleiche mit der Referenzlösung.`,
      starter: `// Annahmen: Entity Order/OrderItem, OrderStatus (mit canTransitionTo), OrderMapper,
// DTO-Records und OrderNotFoundException / InvalidStatusTransitionException existieren.

public interface OrderRepository /* TODO */ {
}

@Service
public class OrderService {
    // TODO
}

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    // TODO
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    // TODO
}`,
      solution: `public record CreateOrderRequest(
    @NotBlank @Email String customerEmail,
    @NotEmpty List<@Valid OrderItemRequest> items) {}

public record OrderItemRequest(
    @NotBlank String productName,
    @Positive int quantity,
    @NotNull @DecimalMin(value = "0.00", inclusive = false) BigDecimal unitPrice) {}

public record ChangeStatusRequest(@NotNull OrderStatus status) {}

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}

@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository repository;
    private final OrderMapper mapper;
    private final Clock clock;

    public OrderService(OrderRepository repository, OrderMapper mapper, Clock clock) {
        this.repository = repository;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        Order order = mapper.toEntity(request, clock.instant());
        return mapper.toResponse(repository.save(order));
    }

    public OrderResponse get(Long id) {
        return mapper.toResponse(findOrThrow(id));
    }

    public Page<OrderResponse> list(OrderStatus status, Pageable pageable) {
        Page<Order> page = status == null
            ? repository.findAll(pageable)
            : repository.findByStatus(status, pageable);
        return page.map(mapper::toResponse);
    }

    @Transactional
    public OrderResponse changeStatus(Long id, OrderStatus target) {
        Order order = findOrThrow(id);
        order.changeStatus(target);   // wirft InvalidStatusTransitionException; Dirty Checking speichert
        return mapper.toResponse(order);
    }

    private Order findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }
}

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/orders/" + created.id())).body(created);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public Page<OrderResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return service.list(status, pageable);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse changeStatus(@PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
        return service.changeStatus(id, request.status());
    }
}

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ProblemDetail handleNotFound(OrderNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ProblemDetail handleConflict(InvalidStatusTransitionException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> String.valueOf(fe.getDefaultMessage()),
                (first, second) -> first));
        problem.setProperty("errors", errors);
        return problem;
    }
}`,
      hints: [
        'Reihenfolge wie in der Prüfung: DTOs → Repository → Service → Controller → Advice. Jede Klasse bekommt ihre Abhängigkeiten per Konstruktor.',
        'Repository: derived Query `findByStatus(OrderStatus status, Pageable pageable)` mit Rückgabe `Page<Order>`. Im Service `page.map(mapper::toResponse)`.',
        'Controller-POST: `ResponseEntity.created(URI.create("/api/orders/" + id)).body(response)`. Liste: `@RequestParam(required = false)` + `@PageableDefault(...)`.',
        'Advice: je Exception ein `@ExceptionHandler`, der `ProblemDetail.forStatusAndDetail(HttpStatus.X, message)` liefert. Bei Validation die `FieldError`s mit `toMap` inkl. Merge-Funktion sammeln.',
      ],
    },
  ],
}

export default chapter
