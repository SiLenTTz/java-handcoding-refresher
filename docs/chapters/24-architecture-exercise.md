# Kapitel 24 – Architekturübung

## Mental Model

Du baust eine **Order Management REST API** von Hand – genau das, was in Teil 3 der Abschlussprüfung verlangt wird. Jede Schicht hat genau eine Aufgabe:

```text
HTTP ──► Controller ──► Service ──► Repository ──► DB
          │ DTO rein      │ Entity       │ Entity
          │ DTO raus      │ Transaktion  │
          │ @Valid        │ Business-Regeln
          ▼               ▼
      Mapper (DTO ↔ Entity)     Exceptions ──► @RestControllerAdvice ──► HTTP Status
```

Funktionen: `createOrder`, `getOrder`, `getOrders` (paginiert, filterbar), `addItem`, `changeStatus` (Statusübergänge), `cancelOrder`.

## Paketstruktur

```text
com.example.orders
├── controller   OrderController
├── dto          CreateOrderRequest, OrderItemRequest, OrderResponse, OrderItemResponse, ChangeStatusRequest
├── mapper       OrderMapper
├── service      OrderService
├── repository   OrderRepository
├── entity       Order, OrderItem, OrderStatus
└── exception    OrderNotFoundException, InvalidStatusTransitionException, GlobalExceptionHandler
```

Alternative bei größeren Systemen: **package by feature** (`orders`, `customers`, ...) mit denselben Klassen darin.

## Schritt 1 – Entity

```java
@Entity
@Table(name = "orders")                      // "order" ist SQL-Keyword!
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String customerEmail;

    @Enumerated(EnumType.STRING)             // nie ORDINAL
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.NEW;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private Instant createdAt;

    protected Order() {}                     // für JPA

    public Order(String customerEmail, Instant createdAt) {
        this.customerEmail = customerEmail;
        this.createdAt = createdAt;
    }

    public void addItem(OrderItem item) {    // Helper hält beide Seiten konsistent
        items.add(item);
        item.setOrder(this);
    }

    public BigDecimal total() {
        return items.stream()
            .map(OrderItem::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void changeStatus(OrderStatus target) {
        if (!status.canTransitionTo(target)) {
            throw new InvalidStatusTransitionException(status, target);
        }
        this.status = target;
    }
    // Getter ...
}

@Entity
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Order order;
    private String productName;
    private int quantity;
    @Column(precision = 19, scale = 2) private BigDecimal unitPrice;

    public BigDecimal lineTotal() { return unitPrice.multiply(BigDecimal.valueOf(quantity)); }
}

public enum OrderStatus {
    NEW, PAID, SHIPPED, DELIVERED, CANCELLED;

    public boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case NEW -> target == PAID || target == CANCELLED;
            case PAID -> target == SHIPPED || target == CANCELLED;
            case SHIPPED -> target == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }
}
```

## Schritt 2 – Request/Response DTOs (Records + Validation)

```java
public record CreateOrderRequest(
    @NotBlank @Email String customerEmail,
    @NotEmpty List<@Valid OrderItemRequest> items
) {}

public record OrderItemRequest(
    @NotBlank String productName,
    @Positive int quantity,
    @NotNull @DecimalMin(value = "0.00", inclusive = false) BigDecimal unitPrice
) {}

public record ChangeStatusRequest(@NotNull OrderStatus status) {}

public record OrderResponse(Long id, String customerEmail, OrderStatus status,
                            List<OrderItemResponse> items, BigDecimal total, Instant createdAt) {}

public record OrderItemResponse(String productName, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
```

## Schritt 3 – Mapper

```java
@Component
public class OrderMapper {

    public Order toEntity(CreateOrderRequest request, Instant now) {
        Order order = new Order(request.customerEmail().trim().toLowerCase(), now);
        request.items().forEach(i -> order.addItem(new OrderItem(i.productName(), i.quantity(), i.unitPrice())));
        return order;
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
            .map(i -> new OrderItemResponse(i.getProductName(), i.getQuantity(), i.getUnitPrice(), i.lineTotal()))
            .toList();
        return new OrderResponse(order.getId(), order.getCustomerEmail(), order.getStatus(),
                                 items, order.total(), order.getCreatedAt());
    }
}
```

## Schritt 4 – Repository

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("select o from Order o left join fetch o.items where o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") Long id);
}
```

Achtung: `join fetch` + `Pageable` auf Collections → Hibernate paginiert im Speicher (Warnung HHH90003004). Für Listen daher ohne Fetch-Join paginieren und `@BatchSize`/`default_batch_fetch_size` nutzen.

## Schritt 5 – Service

```java
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
        order.changeStatus(target);          // Dirty Checking – kein save() nötig
        return mapper.toResponse(order);
    }

    private Order findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }
}
```

## Schritt 6 – Controller

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse created = service.create(request);
        URI location = URI.create("/api/orders/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable Long id) { return service.get(id); }

    @GetMapping
    public Page<OrderResponse> list(@RequestParam(required = false) OrderStatus status,
                                    @PageableDefault(size = 20, sort = "createdAt",
                                                     direction = Sort.Direction.DESC) Pageable pageable) {
        return service.list(status, pageable);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse changeStatus(@PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
        return service.changeStatus(id, request.status());
    }
}
```

## Schritt 7 – Exception Handling

```java
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long id) { super("Order " + id + " not found"); }
}

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail notFound(OrderNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidStatusTransitionException.class)
    ProblemDetail conflict(InvalidStatusTransitionException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField,
                                      fe -> String.valueOf(fe.getDefaultMessage()),
                                      (a, b) -> a));
        pd.setProperty("errors", errors);
        return pd;
    }
}
```

## Schritt 8 – Page vs Slice

- `Page<T>` → klassische Pagination mit Seitenzahlen, braucht `count`-Query (teurer).
- `Slice<T>` → "Load more"/Infinite Scroll, kennt nur `hasNext()`, lädt `size + 1` Elemente, keine Count-Query.

```java
Slice<Order> findByCustomerEmail(String email, Pageable pageable);
```

## Schritt 9 – Tests

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository repository;
    @Spy OrderMapper mapper = new OrderMapper();
    Clock clock = Clock.fixed(Instant.parse("2025-01-01T00:00:00Z"), ZoneOffset.UTC);
    OrderService service;

    @BeforeEach void setUp() { service = new OrderService(repository, mapper, clock); }

    @Test
    void shouldRejectInvalidTransition() {
        Order shipped = new Order("a@b.de", clock.instant());
        shipped.changeStatus(OrderStatus.PAID);
        shipped.changeStatus(OrderStatus.SHIPPED);
        when(repository.findById(1L)).thenReturn(Optional.of(shipped));

        assertThatThrownBy(() -> service.changeStatus(1L, OrderStatus.CANCELLED))
            .isInstanceOf(InvalidStatusTransitionException.class);
    }
}

@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean OrderService service;

    @Test
    void emptyItemsIsBadRequest() throws Exception {
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"customerEmail":"a@b.de","items":[]}
                    """))
           .andExpect(status().isBadRequest());
    }
}
```

## Häufige Fehler

- Entity direkt als `@RequestBody` / Response → Mass Assignment, Lazy-Probleme, Endlosrekursion.
- `@Transactional` im Controller oder auf `private` Methoden (Proxy greift nicht).
- `double` für Preise; `BigDecimal.equals` statt `compareTo`.
- `@Enumerated(ORDINAL)` → neue Enum-Konstante verschiebt DB-Werte.
- `findById(id).get()` → `NoSuchElementException` → 500 statt 404.
- Statusübergänge als `setStatus` von außen → Regeln umgangen. Besser: Methode in der Entity.
- Tabelle `order` (reserviertes Wort).
- `@Valid` fehlt bei verschachtelten Listen (`List<@Valid OrderItemRequest>`).
- `POST` gibt `200` statt `201 Created` + `Location`.

## Checkliste

```text
[ ] Paketstruktur: controller, dto, mapper, service, repository, entity, exception
[ ] Entity: protected No-Args-Konstruktor, @Enumerated(STRING), BigDecimal, Helper für Beziehungen
[ ] Request DTO als record mit Bean Validation (inkl. verschachteltes @Valid)
[ ] Response DTO als record, keine Entity nach außen
[ ] Mapper: toEntity / toResponse, keine Business-Logik
[ ] Repository: JpaRepository, derived Query, Page/Slice
[ ] Service: Constructor Injection, @Transactional(readOnly = true) + @Transactional für Writes
[ ] Service: findOrThrow → Custom Exception
[ ] Statusübergänge im Domain-Modell (enum/switch)
[ ] Controller: dünn, @Valid, 201 + Location, @PageableDefault
[ ] @RestControllerAdvice: 404, 400 (Validation), 409 (Konflikt), ProblemDetail
[ ] Tests: Service-Unit-Test (Mockito), @WebMvcTest für Status Codes
[ ] Zeit via Clock injiziert
```

## Interview-Details

- **Warum Mapper als eigene Klasse?** Single Responsibility, testbar, Entity bleibt API-unabhängig. Alternativ MapStruct.
- **Wo gehört die Statuslogik hin?** In die Domain (Entity/Enum) – "Rich Domain Model"; der Service orchestriert nur.
- **Warum `readOnly = true` am Service?** Hibernate spart Dirty Checking / Flush, Intention ist dokumentiert.
- **Warum kein `save()` nach `changeStatus`?** Managed Entity + Transaktion → Dirty Checking schreibt beim Commit.
- **Page oder Slice?** Page bei UI mit Seitenzahlen, Slice bei Infinite Scroll oder großen Tabellen (Count teuer).
- **409 vs 400 vs 422?** 400: syntaktisch/Validation, 409: Zustandskonflikt (Statusübergang), 422: semantisch ungültig (Team-Konvention).

## Zusammenfassung

```text
Controller dünn → Service orchestriert → Domain kennt Regeln → Repository persistiert
DTOs (records) an der Grenze, Entities innen
Validation am Rand (@Valid), Business-Regeln im Service/Domain
Exceptions → @RestControllerAdvice → sauberer HTTP-Status
Page für Seiten, Slice für "Load more"
```
