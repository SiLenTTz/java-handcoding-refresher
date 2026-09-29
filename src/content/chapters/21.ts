import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '21',
  flashcards: [
    {
      id: 'f1',
      front: 'Was ist das N+1-Problem?',
      back: 'Eine Query lädt N Wurzelobjekte, danach löst jeder Zugriff auf eine Lazy-Beziehung eine eigene Query aus → `1 + N` Statements. Bei 100 Orders mit `order.getCustomer()` sind das 101 Statements.',
    },
    {
      id: 'f2',
      front: 'Wie machst du N+1 sichtbar?',
      back: `\`\`\`properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
spring.jpa.properties.hibernate.generate_statistics=true
\`\`\`
Im Test hart zusichern: \`Statistics.getPrepareStatementCount()\` vor/nach dem Use Case vergleichen.`,
    },
    {
      id: 'f3',
      front: 'Wie löst du N+1 mit JPQL?',
      back: `\`\`\`java
@Query("select o from OrderEntity o join fetch o.customer where o.status = :s")
List<OrderEntity> findByStatusWithCustomer(@Param("s") OrderStatus status);
\`\`\`
\`join fetch\` lädt die Beziehung im selben Statement.`,
    },
    {
      id: 'f4',
      front: 'Was macht `@EntityGraph`?',
      back: `Deklariert, welche Beziehungen mitgeladen werden – ohne die Query selbst anzufassen:
\`\`\`java
@EntityGraph(attributePaths = { "customer", "items" })
List<OrderEntity> findByStatus(OrderStatus status);
\`\`\`
Kombinierbar mit Derived Queries.`,
    },
    {
      id: 'f5',
      front: 'Warum ist `FetchType.EAGER` keine Lösung für N+1?',
      back: 'Es verlagert das Problem nur: Der Graph wird bei **jeder** Query geladen, auch wo er nicht gebraucht wird – und bei JPQL-Queries erzeugt Hibernate für EAGER-Beziehungen trotzdem Einzelselects. Fetching ist eine Entscheidung pro **Use Case**, nicht pro Mapping.',
    },
    {
      id: 'f6',
      front: 'Welcher Default gilt für `@ManyToOne` und `@OneToOne` – und was solltest du setzen?',
      back: 'Default ist `EAGER`. Immer explizit auf `fetch = FetchType.LAZY` setzen. `@OneToMany`/`@ManyToMany` sind bereits `LAZY`.',
    },
    {
      id: 'f7',
      front: 'Wie viele Statements erzeugt `@BatchSize(size = 25)` bei 100 Parents?',
      back: '`1 + ceil(100 / 25) = 5`. Hibernate lädt die fehlenden Beziehungen in Blöcken per `where id in (?, ?, …)`. Global: `spring.jpa.properties.hibernate.default_batch_fetch_size=25`.',
    },
    {
      id: 'f8',
      front: 'Warum sind DTO-Projektionen schneller als Entities?',
      back: 'Weniger Spalten, ein Join statt Nachladen, keine Entities im Persistence Context → keine Snapshots, kein Dirty Checking, kein Proxy-Overhead, weniger Speicher.',
    },
    {
      id: 'f9',
      front: 'Was bedeutet die Warnung `HHH000104` bzw. „firstResult/maxResults specified with collection fetch“?',
      back: 'Du hast Pagination mit einem `join fetch` auf eine **Collection** kombiniert. Eine SQL-Zeile entspricht dann nicht einer Entity, also kann Hibernate kein LIMIT verwenden – es lädt **alles** und paginiert im Speicher.',
    },
    {
      id: 'f10',
      front: 'Wie paginierst du korrekt über Entities mit Collections?',
      back: `Zwei Queries:
\`\`\`java
Page<Long> ids = repository.findIdsByStatus(status, pageable);      // ohne Fetch
List<OrderEntity> orders = repository.findAllWithItemsByIdIn(ids.getContent());
return new PageImpl<>(orders, pageable, ids.getTotalElements());
\`\`\`
Alternative: Root paginiert laden und Collections per \`@BatchSize\` nachziehen.`,
    },
    {
      id: 'f11',
      front: 'Was ist ein Cartesian Product bei Fetch-Joins?',
      back: 'Zwei Collection-Joins multiplizieren die Zeilenzahl: 10 `items` × 4 `payments` = 40 Zeilen pro Order. Regel: **höchstens eine Collection pro Fetch-Join**. Bei zwei `List`-Fetches wirft Hibernate `MultipleBagFetchException`.',
    },
    {
      id: 'f12',
      front: 'Warum `@Transactional(readOnly = true)` für Leselisten?',
      back: 'Kein Auto-Flush und keine Dirty-Check-Snapshots – bei 5000 geladenen Entities spart das spürbar CPU und Speicher. Zusätzlich wird die JDBC-Connection als read-only markiert.',
    },
    {
      id: 'f13',
      front: 'Welches Problem haben Bulk Updates mit dem Cache?',
      back: `Sie gehen **am Persistence Context vorbei**: bereits geladene Entities behalten alte Werte, \`@PreUpdate\` und \`@Version\` greifen nicht.
\`\`\`java
@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("update OrderEntity o set o.status = :s where o.createdAt < :d")
int bulkUpdate(...);
\`\`\``,
    },
    {
      id: 'f14',
      front: 'Wann lohnt sich der Second-Level-Cache?',
      back: 'Nur für kleine, selten geänderte Referenzdaten (Länder, Währungen, Konfiguration). Er ist SessionFactory-weit und muss invalidiert werden – erst die Queries reparieren, dann cachen.',
    },
    {
      id: 'f15',
      front: 'Welche Spalten brauchen in einer JPA-Anwendung fast immer einen Index?',
      back: 'Jede **Fremdschlüsselspalte** (`customer_id`) und jede häufige `where`/`order by`-Kombination – am besten als zusammengesetzter Index in der Reihenfolge der Selektivität. Mit `EXPLAIN ANALYZE` prüfen, ob er genutzt wird.',
    },
    {
      id: 'f16',
      front: 'Warum `spring.jpa.open-in-view=false` auch eine Performance-Einstellung ist?',
      back: 'Mit `true` bleibt der Context bis zum Rendern offen: Lazy-Zugriffe im View-Layer erzeugen unbemerkt N+1-Queries und die DB-Connection bleibt für die gesamte Request-Dauer belegt.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wie viele SQL-Statements erzeugt dieser Code bei 100 Orders von 60 verschiedenen Kunden (Lazy, kein Batching)?',
      code: `List<OrderEntity> orders = repository.findAll();
orders.forEach(o -> System.out.println(o.getCustomer().getName()));`,
      options: ['1', '61', '101', '2'],
      correct: 2,
      explanation: '1 Query für die Orders + 1 Query pro **Order** beim ersten Zugriff auf den Proxy = 101. Dass sich Kunden wiederholen, hilft nur, wenn sie schon im Persistence Context sind – der Klassiker ist `1 + N`.',
    },
    {
      id: 'q2',
      prompt: 'Wie viele Statements nach dem Umbau auf `@EntityGraph(attributePaths = "customer")`?',
      options: ['1', '2', '101', 'Abhängig von der Batch-Größe'],
      correct: 0,
      explanation: '`@EntityGraph` erzeugt einen Join im selben Statement – die Kunden sind sofort initialisiert.',
    },
    {
      id: 'q3',
      prompt: 'Wie viele Statements bei 100 Parents und `hibernate.default_batch_fetch_size=25`?',
      options: ['1', '4', '5', '101'],
      correct: 2,
      explanation: '`1` für die Wurzeln + `ceil(100 / 25) = 4` IN-Queries = **5**.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Bug?',
      code: `@Query("select o from OrderEntity o join fetch o.items")
Page<OrderEntity> findAllWithItems(Pageable pageable);`,
      options: [
        '`join fetch` braucht immer `distinct`',
        'Pagination auf einem Collection-Fetch: Hibernate lädt alle Zeilen und paginiert im Speicher (`HHH000104`)',
        '`Page` funktioniert nicht mit `@Query`',
        'Es fehlt `@Modifying`',
      ],
      correct: 1,
      explanation: 'Eine SQL-Zeile entspricht hier nicht einer Entity, LIMIT wäre falsch. Lösung: IDs paginieren und in einer zweiten Query mit Fetch laden – oder `@BatchSize`.',
    },
    {
      id: 'q5',
      prompt: 'Was passiert zur Laufzeit?',
      code: `@Query("select o from OrderEntity o join fetch o.items join fetch o.payments")
List<OrderEntity> findAllFull();`,
      options: [
        'Ein sauberes Statement mit allen Daten',
        'Kartesisches Produkt (items × payments) – bei zwei `List`-Collections zusätzlich `MultipleBagFetchException`',
        'Hibernate ignoriert den zweiten `join fetch`',
        'Es entsteht wieder N+1',
      ],
      correct: 1,
      explanation: 'Höchstens **eine** Collection pro Fetch-Join. Die zweite über eine separate Query, `@BatchSize` oder – wenn fachlich passend – `Set` statt `List`.',
    },
    {
      id: 'q6',
      prompt: 'Welche Variante ist Clean Code für einen Listen-Endpoint, der nur `id`, `orderNumber` und `customerName` anzeigt?',
      options: [
        '`findAll()` und im Controller mappen',
        '`@EntityGraph(attributePaths = "customer")` und die vollen Entities mappen',
        'Eine DTO-Projection per Constructor Expression, die nur die drei Spalten selektiert',
        '`FetchType.EAGER` auf `customer` setzen',
      ],
      correct: 2,
      explanation: 'Weniger Spalten, ein Join, keine Entities im Persistence Context. `@EntityGraph` wäre besser als nichts, lädt aber weiterhin den kompletten Entity-Zustand.',
    },
    {
      id: 'q7',
      prompt: 'Was ist das Problem?',
      code: `@Modifying
@Query("update OrderEntity o set o.status = 'CANCELLED' where o.id in :ids")
int cancelAll(@Param("ids") List<Long> ids);`,
      options: [
        '`@Modifying` ist überflüssig',
        'Bereits geladene Entities im Persistence Context behalten den alten Status – es fehlt `clearAutomatically = true` (und `flushAutomatically = true`)',
        '`in :ids` ist in JPQL nicht erlaubt',
        'Der Rückgabetyp müsste `void` sein',
      ],
      correct: 1,
      explanation: 'Bulk-Statements umgehen den First-Level-Cache, Entity-Callbacks und `@Version`. Ohne `clearAutomatically` arbeitest du danach mit veralteten Objekten weiter.',
    },
    {
      id: 'q8',
      prompt: 'Wie viele Statements erzeugt diese Schleife bei 50 IDs?',
      code: `List<UserEntity> users = ids.stream()
        .map(id -> repository.findById(id).orElseThrow())
        .toList();`,
      options: ['1', '50', '51', '2'],
      correct: 1,
      explanation: 'Ein SELECT pro ID. Richtig ist `repository.findAllById(ids)` – eine Query mit `IN`-Klausel.',
    },
    {
      id: 'q9',
      prompt: 'Was bewirkt `@Transactional(readOnly = true)` bei einer Liste mit 5000 Entities?',
      options: [
        'Die Query wird parallelisiert',
        'Kein Auto-Flush und keine Dirty-Check-Snapshots → weniger CPU und Speicher',
        'Die Entities werden automatisch zu DTOs',
        'Es wird ein Second-Level-Cache aktiviert',
      ],
      correct: 1,
      explanation: 'Hibernate setzt den FlushMode auf `MANUAL` und legt keine Snapshot-Kopien für das Dirty Checking an. Eine Schreibsperre ist es nicht.',
    },
    {
      id: 'q10',
      prompt: 'Du hast den Verdacht auf N+1. Was ist der erste Schritt?',
      options: [
        'Alle Beziehungen auf `EAGER` stellen und messen, ob es schneller wird',
        'SQL-Logging bzw. `hibernate.generate_statistics` aktivieren und die Statements zählen',
        'Den Second-Level-Cache einschalten',
        'Indizes auf allen Spalten anlegen',
      ],
      correct: 1,
      explanation: 'Erst messen, dann optimieren, dann erneut messen. Ohne Zahlen optimierst du an der falschen Stelle – und `EAGER` macht es typischerweise schlimmer.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Statements zählen: N+1 vs. JOIN FETCH vs. Batch',
      level: 2,
      description: `Bevor du optimierst, musst du die Statement-Anzahl **vorhersagen** können. Implementiere \`QueryCounter\` mit statischen Methoden:

- \`static int naive(int rootCount)\` – Lazy ohne Fetch: \`1 + rootCount\`
- \`static int joinFetch(int rootCount)\` – \`join fetch\` / \`@EntityGraph\`: immer \`1\`
- \`static int batched(int rootCount, int batchSize)\` – \`@BatchSize\`: \`1 + ceil(rootCount / batchSize)\`

Validierung: \`rootCount < 0\` → \`IllegalArgumentException\`, \`batchSize <= 0\` → \`IllegalArgumentException\`.

Denk an den Sonderfall \`rootCount == 0\`: Es bleibt bei der einen Wurzel-Query, es gibt nichts nachzuladen.`,
      starter: `class QueryCounter {

    static int naive(int rootCount) {
        // TODO
        return -1;
    }

    static int joinFetch(int rootCount) {
        // TODO
        return -1;
    }

    static int batched(int rootCount, int batchSize) {
        // TODO
        return -1;
    }
}`,
      solution: `class QueryCounter {

    static int naive(int rootCount) {
        validateRootCount(rootCount);
        return 1 + rootCount;
    }

    static int joinFetch(int rootCount) {
        validateRootCount(rootCount);
        return 1;
    }

    static int batched(int rootCount, int batchSize) {
        validateRootCount(rootCount);
        if (batchSize <= 0) {
            throw new IllegalArgumentException("batchSize must be > 0 but was " + batchSize);
        }
        return 1 + (rootCount + batchSize - 1) / batchSize;
    }

    private static void validateRootCount(int rootCount) {
        if (rootCount < 0) {
            throw new IllegalArgumentException("rootCount must be >= 0 but was " + rootCount);
        }
    }
}`,
      hints: [
        'Alle drei Formeln beginnen mit der einen Query für die Wurzelobjekte. Der Unterschied ist nur, wie oft die Beziehung nachgeladen wird.',
        'Aufrunden ohne `double`: `(rootCount + batchSize - 1) / batchSize`.',
        'naive = 1 + n; joinFetch = 1; batched = 1 + ceil(n / size). Validierung jeweils zuerst.',
        '`return 1 + (rootCount + batchSize - 1) / batchSize;`',
      ],
      tests: `check("N+1 bei 100 Orders", 101, QueryCounter.naive(100));
check("N+1 bei einer Order", 2, QueryCounter.naive(1));
check("keine Wurzeln", 1, QueryCounter.naive(0));
check("JOIN FETCH bleibt 1", 1, QueryCounter.joinFetch(100));
check("JOIN FETCH auch bei 0", 1, QueryCounter.joinFetch(0));
check("Batch 100/25", 5, QueryCounter.batched(100, 25));
check("Batch 100/10", 11, QueryCounter.batched(100, 10));
check("Batch 101/10 rundet auf", 12, QueryCounter.batched(101, 10));
check("Batch groesser als Menge", 2, QueryCounter.batched(5, 50));
check("Batch ohne Wurzeln", 1, QueryCounter.batched(0, 25));
check("Batch 1 entspricht N+1", QueryCounter.naive(30), QueryCounter.batched(30, 1));
checkThrows("batchSize 0", IllegalArgumentException.class, () -> QueryCounter.batched(10, 0));
checkThrows("negative batchSize", IllegalArgumentException.class, () -> QueryCounter.batched(10, -5));
checkThrows("negative rootCount", IllegalArgumentException.class, () -> QueryCounter.naive(-1));`,
    },
    {
      id: 'k2',
      title: 'Batch Fetching: IDs in IN-Queries aufteilen',
      level: 3,
      description: `Genau das macht Hibernate bei \`@BatchSize\`. Implementiere \`BatchLoader\`:

- \`static List<List<Long>> partition(List<Long> ids, int batchSize)\`
  - entfernt **Duplikate** und behält die Reihenfolge des ersten Auftretens
  - schneidet in Blöcke der Größe \`batchSize\` (der letzte Block darf kleiner sein)
  - leere Eingabe → leere Liste
  - \`batchSize <= 0\` → \`IllegalArgumentException\`
- \`static List<String> toInQueries(List<Long> ids, int batchSize)\`
  - pro Block eine Query der Form
    \`select c from Customer c where c.id in (1, 2, 3)\`
  - keine IDs → keine Query`,
      starter: `class BatchLoader {

    static List<List<Long>> partition(List<Long> ids, int batchSize) {
        // TODO
        return List.of();
    }

    static List<String> toInQueries(List<Long> ids, int batchSize) {
        // TODO
        return List.of();
    }
}`,
      solution: `class BatchLoader {

    static List<List<Long>> partition(List<Long> ids, int batchSize) {
        if (batchSize <= 0) {
            throw new IllegalArgumentException("batchSize must be > 0 but was " + batchSize);
        }
        List<Long> distinct = new ArrayList<>(new LinkedHashSet<>(ids));
        List<List<Long>> batches = new ArrayList<>();
        for (int from = 0; from < distinct.size(); from += batchSize) {
            int to = Math.min(from + batchSize, distinct.size());
            batches.add(List.copyOf(distinct.subList(from, to)));
        }
        return List.copyOf(batches);
    }

    static List<String> toInQueries(List<Long> ids, int batchSize) {
        return partition(ids, batchSize).stream()
            .map(BatchLoader::toInQuery)
            .toList();
    }

    private static String toInQuery(List<Long> batch) {
        String values = batch.stream()
            .map(String::valueOf)
            .collect(Collectors.joining(", "));
        return "select c from Customer c where c.id in (" + values + ")";
    }
}`,
      hints: [
        'Zwei Teilprobleme: Duplikate reihenfolgetreu entfernen und dann in Fenster fester Größe schneiden.',
        '`new LinkedHashSet<>(ids)` dedupliziert und behält die Reihenfolge. `List.subList(from, to)` + `Math.min` für den letzten Block. `Collectors.joining(", ")` für die IN-Liste.',
        'for (int from = 0; from < distinct.size(); from += batchSize) { int to = min(from + batchSize, size); batches.add(subList(from, to)); }',
        '`List<Long> distinct = new ArrayList<>(new LinkedHashSet<>(ids));`',
      ],
      tests: `check("3er-Bloecke", List.of(List.of(1L, 2L, 3L), List.of(4L, 5L)),
    BatchLoader.partition(List.of(1L, 2L, 3L, 4L, 5L), 3));
check("exakt aufgehend", List.of(List.of(1L, 2L), List.of(3L, 4L)),
    BatchLoader.partition(List.of(1L, 2L, 3L, 4L), 2));
check("Duplikate entfernt, Reihenfolge bleibt", List.of(List.of(3L, 1L), List.of(2L)),
    BatchLoader.partition(List.of(3L, 1L, 3L, 2L, 1L), 2));
check("leere Eingabe", List.of(), BatchLoader.partition(List.of(), 10));
check("batchSize groesser als Menge", List.of(List.of(1L, 2L)),
    BatchLoader.partition(List.of(1L, 2L), 50));
check("Blockanzahl = ceil(7/3)", 3, BatchLoader.partition(List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L), 3).size());

check("IN-Queries", List.of(
        "select c from Customer c where c.id in (1, 2)",
        "select c from Customer c where c.id in (3)"),
    BatchLoader.toInQueries(List.of(1L, 2L, 3L), 2));
check("keine Query ohne IDs", List.of(), BatchLoader.toInQueries(List.of(), 5));
check("eine Query wenn alles passt", 1, BatchLoader.toInQueries(List.of(1L, 2L, 3L), 25).size());

checkThrows("batchSize 0", IllegalArgumentException.class, () -> BatchLoader.partition(List.of(1L), 0));
checkThrows("negative batchSize", IllegalArgumentException.class, () -> BatchLoader.toInQueries(List.of(1L), -3));`,
    },
    {
      id: 'k3',
      title: 'N+1 beseitigen: von Einzelselects zu einer IN-Query',
      level: 4,
      description: `\`CustomerGateway\` zählt jede „Query“. Implementiere \`OrderViewService\` mit zwei Varianten, die **dasselbe Ergebnis** liefern, aber unterschiedlich viele Queries brauchen:

\`\`\`java
static List<OrderView> naive(List<OrderRow> orders, CustomerGateway gateway)
static List<OrderView> batched(List<OrderRow> orders, CustomerGateway gateway)
\`\`\`

- \`naive\` ruft pro Order \`gateway.findById(...)\` auf → N Queries (so entsteht N+1).
- \`batched\` sammelt die **eindeutigen** \`customerId\`-Werte und ruft **genau einmal** \`gateway.findAllById(...)\` auf. Bei leerer Order-Liste darf das Gateway gar nicht angefasst werden (0 Queries).
- Fehlt ein Kunde, werfen **beide** eine \`NoSuchElementException\`.
- Die Reihenfolge der Orders bleibt in beiden Varianten erhalten.`,
      given: `record OrderRow(Long id, Long customerId, BigDecimal total) {}

record CustomerRow(Long id, String name) {}

record OrderView(Long orderId, String customerName, BigDecimal total) {}

class CustomerGateway {
    private final Map<Long, CustomerRow> customers = new LinkedHashMap<>();
    int queryCount = 0;

    CustomerGateway(List<CustomerRow> rows) {
        rows.forEach(row -> customers.put(row.id(), row));
    }

    CustomerRow findById(Long id) {
        queryCount++;
        return customers.get(id);
    }

    List<CustomerRow> findAllById(Collection<Long> ids) {
        queryCount++;
        return ids.stream().map(customers::get).filter(Objects::nonNull).toList();
    }
}`,
      starter: `class OrderViewService {

    static List<OrderView> naive(List<OrderRow> orders, CustomerGateway gateway) {
        // TODO
        return List.of();
    }

    static List<OrderView> batched(List<OrderRow> orders, CustomerGateway gateway) {
        // TODO
        return List.of();
    }
}`,
      solution: `class OrderViewService {

    /** So entsteht N+1: eine Query pro Order. */
    static List<OrderView> naive(List<OrderRow> orders, CustomerGateway gateway) {
        return orders.stream()
            .map(order -> toView(order, gateway.findById(order.customerId())))
            .toList();
    }

    /** Eine einzige IN-Query fuer alle benoetigten Kunden. */
    static List<OrderView> batched(List<OrderRow> orders, CustomerGateway gateway) {
        if (orders.isEmpty()) {
            return List.of();                    // nichts zu laden -> keine Query
        }
        Set<Long> customerIds = orders.stream()
            .map(OrderRow::customerId)
            .collect(Collectors.toCollection(LinkedHashSet::new));

        Map<Long, CustomerRow> byId = gateway.findAllById(customerIds).stream()
            .collect(Collectors.toMap(CustomerRow::id, Function.identity()));

        return orders.stream()
            .map(order -> toView(order, byId.get(order.customerId())))
            .toList();
    }

    private static OrderView toView(OrderRow order, CustomerRow customer) {
        if (customer == null) {
            throw new NoSuchElementException("no customer with id " + order.customerId());
        }
        return new OrderView(order.id(), customer.name(), order.total());
    }
}`,
      hints: [
        'Das Muster gegen N+1 ist immer gleich: erst alle benötigten Schlüssel einsammeln, dann **einmal** laden, dann im Speicher zuordnen.',
        '`stream().map(OrderRow::customerId)`, `Collectors.toCollection(LinkedHashSet::new)`, `Collectors.toMap(CustomerRow::id, Function.identity())`, danach `map.get(...)`.',
        'batched: leer? → List.of(). ids sammeln → findAllById(ids) → Map<Long, CustomerRow> bauen → orders erneut durchlaufen und aus der Map auflösen.',
        '`Map<Long, CustomerRow> byId = gateway.findAllById(customerIds).stream().collect(Collectors.toMap(CustomerRow::id, Function.identity()));`',
      ],
      tests: `List<CustomerRow> customers = List.of(new CustomerRow(1L, "Ada"), new CustomerRow(2L, "Alan"));
List<OrderRow> orders = List.of(
    new OrderRow(10L, 1L, new BigDecimal("20.00")),
    new OrderRow(11L, 2L, new BigDecimal("30.00")),
    new OrderRow(12L, 1L, new BigDecimal("40.00")));
List<OrderView> expected = List.of(
    new OrderView(10L, "Ada", new BigDecimal("20.00")),
    new OrderView(11L, "Alan", new BigDecimal("30.00")),
    new OrderView(12L, "Ada", new BigDecimal("40.00")));

CustomerGateway g1 = new CustomerGateway(customers);
check("naive liefert das richtige Ergebnis", expected, OrderViewService.naive(orders, g1));
check("naive braucht N Queries", 3, g1.queryCount);

CustomerGateway g2 = new CustomerGateway(customers);
check("batched liefert dasselbe Ergebnis", expected, OrderViewService.batched(orders, g2));
check("batched braucht genau 1 Query", 1, g2.queryCount);

CustomerGateway g3 = new CustomerGateway(customers);
check("leere Order-Liste", List.<OrderView>of(), OrderViewService.batched(List.of(), g3));
check("leere Order-Liste erzeugt keine Query", 0, g3.queryCount);

CustomerGateway g4 = new CustomerGateway(customers);
check("eine Order", List.of(new OrderView(10L, "Ada", new BigDecimal("20.00"))),
    OrderViewService.batched(List.of(orders.get(0)), g4));
check("eine Order = 1 Query", 1, g4.queryCount);

CustomerGateway g5 = new CustomerGateway(customers);
checkThrows("unbekannter Kunde (batched)", NoSuchElementException.class,
    () -> OrderViewService.batched(List.of(new OrderRow(13L, 99L, BigDecimal.ONE)), g5));

CustomerGateway g6 = new CustomerGateway(customers);
checkThrows("unbekannter Kunde (naive)", NoSuchElementException.class,
    () -> OrderViewService.naive(List.of(new OrderRow(13L, 99L, BigDecimal.ONE)), g6));`,
    },
    {
      id: 'k4',
      title: 'Performance-Repository mit Spring (write & compare)',
      level: 5,
      description: `Schreibe von Hand ein Repository plus Service, das die vier wichtigsten Werkzeuge gegen N+1 zeigt.

1. \`@EntityGraph\` auf einer Derived Query für die Detailansicht (\`customer\` + \`items\`)
2. \`join fetch\` in einer \`@Query\` für eine gefilterte Liste
3. Eine **DTO-Projection** (Constructor Expression) für den Listen-Endpoint mit nur vier Spalten
4. Paginierung über Entities **mit** Collection: zuerst IDs paginieren, dann in einer zweiten Query nachladen und selbst zu einer \`Page\` zusammensetzen
5. Ein Bulk-Update mit \`@Modifying(clearAutomatically = true, flushAutomatically = true)\`
6. Die passenden \`@Index\`-Definitionen auf der Entity und die Properties, mit denen du das Ganze misst

Diese Kata wird **nicht** ausgeführt – schreibe sie von Hand und vergleiche danach mit der Musterlösung.`,
      starter: `public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    // TODO
}

// TODO: OrderQueryService`,
      solution: `import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // 1. Detailansicht: ein Statement statt N+1
    @EntityGraph(attributePaths = { "customer", "items" })
    Optional<OrderEntity> findWithDetailsById(Long id);

    // 2. gefilterte Liste mit join fetch (nur EINE Collection!)
    @Query("select o from OrderEntity o join fetch o.customer where o.status = :status")
    List<OrderEntity> findByStatusWithCustomer(@Param("status") OrderStatus status);

    // 3. DTO-Projection: nur die Spalten, die die Liste wirklich anzeigt
    @Query("""
        select new com.example.order.OrderListItem(o.id, o.orderNumber, c.name, o.total)
          from OrderEntity o
          join o.customer c
         where o.status = :status
        """)
    Page<OrderListItem> findListItems(@Param("status") OrderStatus status, Pageable pageable);

    // 4a. Pagination OHNE Collection-Fetch -> LIMIT/OFFSET funktioniert
    @Query(value = "select o.id from OrderEntity o where o.status = :status",
           countQuery = "select count(o) from OrderEntity o where o.status = :status")
    Page<Long> findIdsByStatus(@Param("status") OrderStatus status, Pageable pageable);

    // 4b. zweite Query: die Collection zu genau diesen IDs
    @Query("select distinct o from OrderEntity o join fetch o.items where o.id in :ids")
    List<OrderEntity> findAllWithItemsByIdIn(@Param("ids") List<Long> ids);

    // 5. Bulk-Update: umgeht den Persistence Context -> vorher flushen, danach clearen
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update OrderEntity o set o.status = :target where o.status = :source and o.createdAt < :before")
    int bulkUpdateStatus(@Param("source") OrderStatus source,
                         @Param("target") OrderStatus target,
                         @Param("before") Instant before);
}

@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository repository;

    public OrderQueryService(OrderRepository repository) {
        this.repository = repository;
    }

    /** Listen-Endpoint: DTOs, kein Entity-Graph, keine Snapshots. */
    public Page<OrderListItem> list(OrderStatus status, Pageable pageable) {
        return repository.findListItems(status, pageable);
    }

    /**
     * Pagination + Collection: NICHT "join fetch o.items" mit Pageable kombinieren
     * (HHH000104 - Hibernate wuerde alles laden und im Speicher paginieren).
     */
    public Page<OrderEntity> pageWithItems(OrderStatus status, Pageable pageable) {
        Page<Long> ids = repository.findIdsByStatus(status, pageable);
        if (ids.isEmpty()) {
            return Page.empty(pageable);
        }
        List<OrderEntity> orders = repository.findAllWithItemsByIdIn(ids.getContent());
        // Reihenfolge der paginierten IDs wiederherstellen
        Map<Long, OrderEntity> byId = orders.stream()
            .collect(Collectors.toMap(OrderEntity::getId, Function.identity()));
        List<OrderEntity> ordered = ids.getContent().stream().map(byId::get).toList();
        return new PageImpl<>(ordered, pageable, ids.getTotalElements());
    }
}

// Entity-Ausschnitt
// @Entity
// @Table(name = "orders", indexes = {
//     @Index(name = "idx_orders_status_created", columnList = "status, created_at"),
//     @Index(name = "idx_orders_customer", columnList = "customer_id")   // FK immer indizieren
// })
// public class OrderEntity {
//     @ManyToOne(fetch = FetchType.LAZY)          // Default waere EAGER
//     @BatchSize(size = 25)                       // org.hibernate.annotations.BatchSize
//     private CustomerEntity customer;
// }

// application.properties
// spring.jpa.open-in-view=false
// spring.jpa.properties.hibernate.default_batch_fetch_size=25
// spring.jpa.properties.hibernate.generate_statistics=true
// logging.level.org.hibernate.SQL=DEBUG
//
// Im Integrationstest hart zusichern:
// long before = statistics.getPrepareStatementCount();
// service.list(OrderStatus.NEW, PageRequest.of(0, 20));
// assertThat(statistics.getPrepareStatementCount() - before).isEqualTo(2);`,
      hints: [
        'Vier Werkzeuge, vier Situationen: Detailansicht → `@EntityGraph`, gefilterte Liste → `join fetch`, Listen-Endpoint → DTO-Projection, Pagination mit Collection → zwei Queries.',
        '`@EntityGraph(attributePaths = ...)`, `join fetch`, Constructor Expression `select new com.example.Dto(...)`, `@Query(value = ..., countQuery = ...)`, `@Modifying(clearAutomatically = true, flushAutomatically = true)`, `@Index`.',
        'Für 4: erst `Page<Long> findIdsByStatus(status, pageable)` (kein Fetch, LIMIT funktioniert), dann `findAllWithItemsByIdIn(ids.getContent())`, danach `new PageImpl<>(ordered, pageable, ids.getTotalElements())`.',
        '`@EntityGraph(attributePaths = { "customer", "items" })\\nOptional<OrderEntity> findWithDetailsById(Long id);`',
      ],
    },
  ],
}

export default chapter
