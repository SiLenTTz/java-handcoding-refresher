import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '20',
  flashcards: [
    {
      id: 'f1',
      front: 'Nenne die vier Zustände einer JPA-Entity.',
      back: '`transient` (frisch `new`, unbekannt), `managed` (im Persistence Context, Änderungen werden geschrieben), `detached` (war managed, Context ist zu), `removed` (zum Löschen vorgemerkt).',
    },
    {
      id: 'f2',
      front: 'Was ist der Persistence Context?',
      back: 'Der **First-Level-Cache** einer Transaktion: eine Identity Map `(Entity-Typ, id) -> Instanz` plus einen Snapshot jedes geladenen Objekts. Zweimal `findById(1L)` liefert dieselbe Instanz und nur **ein** SELECT.',
    },
    {
      id: 'f3',
      front: 'Warum brauchst du nach einer Änderung an einer geladenen Entity kein `save()`?',
      back: `**Dirty Checking**: Beim Commit/Flush vergleicht Hibernate den Snapshot vom Laden mit dem aktuellen Zustand und erzeugt bei Abweichung ein \`UPDATE\`.
\`\`\`java
@Transactional
void rename(Long id, String name) {
    repository.findById(id).orElseThrow().setName(name);
}
\`\`\``,
    },
    {
      id: 'f4',
      front: 'Unterschied zwischen `flush()` und `commit`?',
      back: '`flush()` schickt die gesammelten SQL-Statements an die Datenbank – die Transaktion läuft weiter und alles ist noch rollback-fähig. Der Commit beendet die Transaktion und macht die Änderungen dauerhaft sichtbar.',
    },
    {
      id: 'f5',
      front: 'Was macht `entityManager.clear()`?',
      back: 'Leert den Persistence Context – **alle** Entities werden detached. Danach werden Änderungen an ihnen nicht mehr synchronisiert, und ein erneutes `find` erzeugt ein neues SELECT und eine neue Instanz.',
    },
    {
      id: 'f6',
      front: 'Bei welchen Exceptions rollbackt Spring per Default?',
      back: 'Nur bei `RuntimeException` und `Error`. Checked Exceptions führen zum **Commit**. Anpassen mit `@Transactional(rollbackFor = ...)` bzw. `noRollbackFor = ...`.',
    },
    {
      id: 'f7',
      front: 'Was ist das Self-Invocation-Problem?',
      back: `\`@Transactional\` wird über einen **Proxy** umgesetzt. Ein interner Aufruf \`this.importOne(row)\` geht am Proxy vorbei – die Annotation wirkt nicht.
\`\`\`java
public void importAll(List<Row> rows) {
    rows.forEach(this::importOne);   // KEINE Transaktion
}
@Transactional public void importOne(Row row) { }
\`\`\`
Lösung: zweite Bean, \`TransactionTemplate\` oder Self-Injection.`,
    },
    {
      id: 'f8',
      front: 'Was bewirkt `@Transactional(readOnly = true)` technisch?',
      back: 'Hibernate-FlushMode auf `MANUAL` (kein Auto-Flush, keine Dirty-Check-Snapshots) und die JDBC-Connection wird als read-only markiert. Es ist eine Optimierung und Dokumentation, **keine** Schreibsperre.',
    },
    {
      id: 'f9',
      front: 'Was macht `Propagation.REQUIRES_NEW`?',
      back: 'Suspendiert eine laufende Transaktion und startet eine eigene mit eigenem Commit/Rollback. Typisch für Audit-Logs, die auch bei Rollback der Hauptoperation bestehen bleiben sollen.',
    },
    {
      id: 'f10',
      front: 'Wo gehören Transaktionsgrenzen hin und warum?',
      back: 'In den **Service** – dort liegt der fachliche Anwendungsfall. Im Repository wäre jede Einzeloperation eine eigene Transaktion (keine Atomarität), im Controller vermischt sich HTTP mit Persistenz und die Transaktion läuft unnötig lange.',
    },
    {
      id: 'f11',
      front: 'Wann bekommst du eine `LazyInitializationException`?',
      back: 'Beim Zugriff auf eine Lazy-Beziehung eines **detached** Objekts, also außerhalb der Transaktion. Lösung: innerhalb der Transaktion mappen, `join fetch`/`@EntityGraph` – nicht `EAGER` und nicht `open-in-view`.',
    },
    {
      id: 'f12',
      front: 'Was macht `spring.jpa.open-in-view=false`?',
      back: 'Der Persistence Context wird nicht bis zum Rendern der Response offengehalten. Lazy-Fehler treten sofort und sichtbar auf, statt still N+1-Queries im View-Layer zu erzeugen, und DB-Connections werden früher freigegeben.',
    },
    {
      id: 'f13',
      front: 'Wie funktioniert optimistisches Locking?',
      back: `Eine Versionsspalte, die Hibernate an jedes UPDATE anhängt:
\`\`\`java
@Version private long version;
// update ... set version = 4 where id = ? and version = 3
\`\`\`
Sind 0 Zeilen betroffen, hat jemand anders geändert → \`OptimisticLockingFailureException\`. Der Lost Update ist verhindert.`,
    },
    {
      id: 'f14',
      front: 'Optimistisch oder pessimistisch – wann was?',
      back: 'Optimistisch (`@Version`): Konflikte sind selten, Prüfung erst beim Schreiben, keine Sperren. Pessimistisch (`@Lock(PESSIMISTIC_WRITE)` → `select ... for update`): echte Hotspots, Konflikt ist wahrscheinlich – dafür Sperrzeiten und Deadlock-Risiko.',
    },
    {
      id: 'f15',
      front: '`CascadeType.REMOVE` vs. `orphanRemoval = true`?',
      back: '`REMOVE` löscht die Kinder, wenn der **Parent** gelöscht wird. `orphanRemoval = true` löscht ein Kind zusätzlich, sobald es aus der Collection **entfernt** wird (`items.remove(item)`).',
    },
    {
      id: 'f16',
      front: 'Wie implementierst du `equals`/`hashCode` bei Entities mit generierter ID?',
      back: '`equals` über die ID (mit `id != null`-Guard), `hashCode` **konstant** (z. B. `getClass().hashCode()`). Sonst ändert sich der Hash, sobald die ID beim Flush gesetzt wird, und die Entity ist im `HashSet` nicht mehr auffindbar.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was passiert zur Laufzeit?',
      code: `@Transactional
public void rename(Long id, String name) {
    UserEntity user = repository.findById(id).orElseThrow();
    user.setName(name);
}`,
      options: [
        'Nichts wird gespeichert, es fehlt `repository.save(user)`',
        'Beim Commit erzeugt Dirty Checking ein `UPDATE`',
        'Es wird eine `TransactionRequiredException` geworfen',
        'Die Entity ist detached, die Änderung verpufft',
      ],
      correct: 1,
      explanation: 'Die Entity ist innerhalb der Transaktion **managed**. Beim Commit vergleicht Hibernate Snapshot und aktuellen Zustand und schreibt nur die geänderten Spalten.',
    },
    {
      id: 'q2',
      prompt: 'Wie viele SELECT-Statements erzeugt dieser Code?',
      code: `@Transactional
public void check(Long id) {
    UserEntity a = repository.findById(id).orElseThrow();
    UserEntity b = repository.findById(id).orElseThrow();
    System.out.println(a == b);
}`,
      options: ['2, und `a == b` ist `false`', '1, und `a == b` ist `true`', '1, und `a == b` ist `false`', '2, und `a == b` ist `true`'],
      correct: 1,
      explanation: 'Der Persistence Context ist eine Identity Map: Die zweite Suche nach derselben ID wird aus dem First-Level-Cache bedient – kein zweites SELECT, dieselbe Instanz.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Bug?',
      code: `@Service
public class ImportService {
    public void importAll(List<Row> rows) {
        rows.forEach(this::importOne);
    }

    @Transactional
    public void importOne(Row row) { ... }
}`,
      options: [
        '`@Transactional` gehört auf die Klasse',
        'Self-Invocation: der interne Aufruf umgeht den Proxy, `importOne` läuft ohne Transaktion',
        '`forEach` darf keine Methodenreferenz auf `this` nehmen',
        'Kein Bug – Spring erkennt interne Aufrufe',
      ],
      correct: 1,
      explanation: 'Proxy-basiertes AOP greift nur bei Aufrufen von außen. Lösung: `importOne` in eine eigene Bean auslagern, `TransactionTemplate` nutzen oder die Bean per `@Lazy` in sich selbst injizieren.',
    },
    {
      id: 'q4',
      prompt: 'Was passiert bei einer `IOException` in dieser Methode?',
      code: `@Transactional
public void export(Long id) throws IOException {
    repository.findById(id).orElseThrow().setExported(true);
    writeFile();   // wirft IOException
}`,
      options: [
        'Rollback – die Änderung wird verworfen',
        '**Commit** – Checked Exceptions lösen per Default kein Rollback aus',
        'Die Methode kompiliert nicht mit `@Transactional`',
        'Die Transaktion bleibt offen',
      ],
      correct: 1,
      explanation: 'Default-Regel: Rollback nur bei `RuntimeException` und `Error`. Hier brauchst du `@Transactional(rollbackFor = IOException.class)`.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist Clean Code?',
      options: [
        '`@Transactional` auf jeder Repository-Methode',
        '`@Transactional` auf der Controller-Methode, damit die ganze Request-Verarbeitung atomar ist',
        '`@Transactional` auf der Service-Methode, die einen fachlichen Anwendungsfall kapselt',
        'Gar kein `@Transactional`, `save()` committet ohnehin',
      ],
      correct: 2,
      explanation: 'Die Transaktionsgrenze ist eine fachliche Entscheidung: „Bestellung anlegen und Lagerbestand reduzieren“ gehört zusammen. Repository = zu klein, Controller = zu lang und vermischt HTTP mit Persistenz.',
    },
    {
      id: 'q6',
      prompt: 'Was passiert hier zur Laufzeit?',
      code: `public List<String> itemNames(Long id) {          // keine @Transactional
    OrderEntity order = repository.findById(id).orElseThrow();
    return order.getItems().stream().map(OrderItemEntity::getName).toList();
}`,
      options: [
        'Es funktioniert, `items` wird lazy nachgeladen',
        '`LazyInitializationException` – die Entity ist nach `findById` detached (bei `open-in-view=false`)',
        '`NullPointerException`, weil `items` `null` ist',
        'Es wird ein `EAGER`-Fetch ausgeführt',
      ],
      correct: 1,
      explanation: 'Ohne umgebende Transaktion öffnet `findById` nur kurz einen Context. Danach ist die Entity detached und der Proxy der Collection kann nicht mehr initialisiert werden.',
    },
    {
      id: 'q7',
      prompt: 'Zwei Benutzer laden dasselbe Dokument (`version = 3`), beide speichern. Was passiert mit `@Version`?',
      options: [
        'Beide Updates gehen durch, der zweite gewinnt',
        'Das zweite Update trifft 0 Zeilen (`where version = 3` passt nicht mehr) → `OptimisticLockingFailureException`',
        'Das zweite Update blockiert, bis das erste committet',
        'Hibernate merged beide Änderungen automatisch',
      ],
      correct: 1,
      explanation: 'Das erste Update setzt `version = 4`. Das zweite sucht noch `version = 3`, trifft keine Zeile und schlägt fehl – genau das verhindert den Lost Update.',
    },
    {
      id: 'q8',
      prompt: 'Was ist der Unterschied zwischen `persist` und `merge`?',
      options: [
        'Kein Unterschied, `merge` ist nur der neuere Name',
        '`persist` macht ein transientes Objekt managed (dieselbe Instanz); `merge` kopiert den Zustand eines detached Objekts in eine managed Instanz und gibt **diese** zurück',
        '`persist` schreibt sofort in die DB, `merge` erst beim Commit',
        '`merge` funktioniert nur ohne Transaktion',
      ],
      correct: 1,
      explanation: 'Deshalb muss man mit dem **Rückgabewert** von `save()`/`merge()` weiterarbeiten – das übergebene Objekt bleibt detached.',
    },
    {
      id: 'q9',
      prompt: 'Was bewirkt `orphanRemoval = true` hier?',
      code: `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItemEntity> items = new ArrayList<>();

order.getItems().remove(item);`,
      options: [
        'Nichts, das Item bleibt in der DB und verliert nur die Referenz',
        'Das Item wird beim Flush per `DELETE` aus der Datenbank entfernt',
        'Die ganze Order wird gelöscht',
        'Es wird eine `ConstraintViolationException` geworfen',
      ],
      correct: 1,
      explanation: '`orphanRemoval` löscht Kinder, die aus der Collection entfernt werden. `CascadeType.REMOVE` allein würde sie nur beim Löschen des Parents entfernen.',
    },
    {
      id: 'q10',
      prompt: 'Warum ist dieses `hashCode` bei einer Entity mit `@GeneratedValue` gefährlich?',
      code: `@Override public int hashCode() {
    return Objects.hash(id);
}`,
      options: [
        'Es ist zu langsam',
        '`id` ist vor dem Flush `null` und danach gesetzt – der Hash ändert sich, die Entity ist im `HashSet` nicht mehr auffindbar',
        '`Objects.hash` funktioniert nicht mit `Long`',
        'Es fehlt `equals`, sonst wäre es korrekt',
      ],
      correct: 1,
      explanation: 'Ein Hash muss über die Lebensdauer stabil sein. Übliche Lösung: `equals` über die ID (mit Null-Guard), `hashCode` konstant über `getClass().hashCode()`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Rollback-Regeln nachbauen',
      level: 2,
      description: `Spring entscheidet anhand fester Regeln, ob eine Transaktion zurückgerollt wird. Implementiere \`TxRules\` mit zwei **statischen** Methoden:

\`\`\`java
static boolean rollsBack(Throwable ex)
static boolean rollsBack(Throwable ex,
                         List<Class<? extends Throwable>> rollbackFor,
                         List<Class<? extends Throwable>> noRollbackFor)
\`\`\`

Regeln:
1. **Default** (erste Methode): Rollback nur bei \`RuntimeException\` und \`Error\`. Checked Exceptions → Commit.
2. Mit Regeln: Passt \`ex\` zu einem Eintrag aus \`noRollbackFor\` (auch als Subklasse!) → \`false\`.
3. Sonst: Passt \`ex\` zu einem Eintrag aus \`rollbackFor\` → \`true\`.
4. Sonst: Default-Regel.

Tipp: \`Class.isInstance(ex)\` prüft „ist \`ex\` von diesem Typ oder einer Subklasse\`“.`,
      starter: `class TxRules {

    static boolean rollsBack(Throwable ex) {
        // TODO
        return false;
    }

    static boolean rollsBack(Throwable ex,
                             List<Class<? extends Throwable>> rollbackFor,
                             List<Class<? extends Throwable>> noRollbackFor) {
        // TODO
        return false;
    }
}`,
      solution: `class TxRules {

    static boolean rollsBack(Throwable ex) {
        return ex instanceof RuntimeException || ex instanceof Error;
    }

    static boolean rollsBack(Throwable ex,
                             List<Class<? extends Throwable>> rollbackFor,
                             List<Class<? extends Throwable>> noRollbackFor) {
        if (matches(ex, noRollbackFor)) {
            return false;
        }
        if (matches(ex, rollbackFor)) {
            return true;
        }
        return rollsBack(ex);
    }

    private static boolean matches(Throwable ex, List<Class<? extends Throwable>> types) {
        return types.stream().anyMatch(type -> type.isInstance(ex));
    }
}`,
      hints: [
        'Die Default-Regel ist ein einziger Ausdruck mit zwei `instanceof`-Prüfungen. Die zweite Methode ist eine Kette aus drei Fragen, die auf die erste zurückfällt.',
        '`ex instanceof RuntimeException`, `ex instanceof Error`, `Class::isInstance`, `Stream.anyMatch`.',
        'matches(noRollbackFor) → false; matches(rollbackFor) → true; sonst rollsBack(ex).',
        '`private static boolean matches(Throwable ex, List<Class<? extends Throwable>> types) { return types.stream().anyMatch(t -> t.isInstance(ex)); }`',
      ],
      tests: `checkTrue("RuntimeException -> rollback", TxRules.rollsBack(new IllegalStateException("x")));
checkTrue("Error -> rollback", TxRules.rollsBack(new StackOverflowError()));
checkTrue("checked Exception -> commit", !TxRules.rollsBack(new Exception("checked")));
checkTrue("IOException -> commit", !TxRules.rollsBack(new java.io.IOException("io")));

List<Class<? extends Throwable>> keine = List.of();
checkTrue("rollbackFor auf checked Exception",
    TxRules.rollsBack(new java.io.IOException("io"), List.of(java.io.IOException.class), keine));
checkTrue("rollbackFor greift auch fuer Subklassen",
    TxRules.rollsBack(new java.io.FileNotFoundException("f"), List.of(java.io.IOException.class), keine));
checkTrue("nicht getroffen -> Default-Regel",
    !TxRules.rollsBack(new Exception("x"), List.of(java.io.IOException.class), keine));

checkTrue("noRollbackFor verhindert Rollback",
    !TxRules.rollsBack(new IllegalArgumentException("x"), keine, List.of(IllegalArgumentException.class)));
checkTrue("noRollbackFor schlaegt rollbackFor",
    !TxRules.rollsBack(new IllegalStateException("x"), List.of(RuntimeException.class), List.of(IllegalStateException.class)));
checkTrue("Error bleibt Rollback, auch wenn nur Exception ausgenommen ist",
    TxRules.rollsBack(new OutOfMemoryError(), keine, List.of(Exception.class)));
checkTrue("ohne Regeln wie Default",
    TxRules.rollsBack(new NullPointerException(), keine, keine));`,
    },
    {
      id: 'k2',
      title: 'Persistence Context mit Dirty Checking simulieren',
      level: 3,
      description: `Baue den First-Level-Cache nach. \`PersistenceContext\` arbeitet gegen eine \`FakeDatabase\`, die SELECTs zählt und UPDATEs protokolliert.

- \`Customer find(Long id)\`
  - schon in der Identity Map → **dieselbe Instanz**, **kein** SELECT
  - sonst: \`database.selectById(id)\`, Instanz merken **und einen Snapshot (\`copy()\`) ablegen**
  - kein Treffer in der DB → \`NoSuchElementException\`
- \`void flush()\` – für jede managed Entity Snapshot mit aktuellem Zustand vergleichen; bei Abweichung \`database.update(entity)\` und **Snapshot aktualisieren** (ein zweiter Flush ohne Änderung erzeugt kein weiteres UPDATE)
- \`void clear()\` – Identity Map und Snapshots leeren (alles wird detached)
- \`boolean contains(Long id)\`

Achte darauf: Nach \`clear()\` darf eine Änderung an der alten Instanz **nichts** mehr auslösen – genau das ist der Unterschied zwischen *managed* und *detached*.`,
      given: `class Customer {
    private final Long id;
    private String name;
    private String email;

    Customer(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    Long getId() { return id; }
    String getName() { return name; }
    void setName(String name) { this.name = name; }
    String getEmail() { return email; }
    void setEmail(String email) { this.email = email; }

    Customer copy() { return new Customer(id, name, email); }

    boolean sameState(Customer other) {
        return Objects.equals(name, other.name) && Objects.equals(email, other.email);
    }
}

class FakeDatabase {
    private final Map<Long, Customer> rows = new LinkedHashMap<>();
    int selectCount = 0;
    final List<String> updates = new ArrayList<>();

    void insert(Customer customer) {
        rows.put(customer.getId(), customer.copy());
    }

    Customer selectById(Long id) {
        selectCount++;
        Customer row = rows.get(id);
        return row == null ? null : row.copy();
    }

    void update(Customer customer) {
        updates.add("update customer set name='" + customer.getName()
            + "', email='" + customer.getEmail() + "' where id=" + customer.getId());
        rows.put(customer.getId(), customer.copy());
    }
}`,
      starter: `class PersistenceContext {
    private final FakeDatabase database;
    private final Map<Long, Customer> identityMap = new LinkedHashMap<>();
    private final Map<Long, Customer> snapshots = new HashMap<>();

    PersistenceContext(FakeDatabase database) {
        this.database = database;
    }

    Customer find(Long id) {
        // TODO
        return null;
    }

    void flush() {
        // TODO
    }

    void clear() {
        // TODO
    }

    boolean contains(Long id) {
        // TODO
        return false;
    }
}`,
      solution: `class PersistenceContext {
    private final FakeDatabase database;
    private final Map<Long, Customer> identityMap = new LinkedHashMap<>();
    private final Map<Long, Customer> snapshots = new HashMap<>();

    PersistenceContext(FakeDatabase database) {
        this.database = database;
    }

    Customer find(Long id) {
        Customer managed = identityMap.get(id);
        if (managed != null) {
            return managed;              // First-Level-Cache: kein SELECT
        }
        Customer loaded = database.selectById(id);
        if (loaded == null) {
            throw new NoSuchElementException("no customer with id " + id);
        }
        identityMap.put(id, loaded);
        snapshots.put(id, loaded.copy()); // Snapshot fuer das Dirty Checking
        return loaded;
    }

    void flush() {
        for (Map.Entry<Long, Customer> entry : identityMap.entrySet()) {
            Customer managed = entry.getValue();
            Customer snapshot = snapshots.get(entry.getKey());
            if (!managed.sameState(snapshot)) {
                database.update(managed);
                snapshots.put(entry.getKey(), managed.copy());
            }
        }
    }

    void clear() {
        identityMap.clear();
        snapshots.clear();
    }

    boolean contains(Long id) {
        return identityMap.containsKey(id);
    }
}`,
      hints: [
        'Zwei Maps sind der ganze Trick: eine hält die managed Instanzen (Identity Map), die andere je einen unveränderlichen Snapshot vom Ladezeitpunkt.',
        '`Map.get`, `Map.put`, `Map.containsKey`, `customer.copy()`, `customer.sameState(snapshot)`, `NoSuchElementException`.',
        'find: in Map? → zurück. sonst select → null? → Exception. sonst Map + Snapshot füllen. flush: über die Identity Map laufen, `sameState` vergleichen, bei Unterschied update + Snapshot neu setzen.',
        '`if (!managed.sameState(snapshot)) { database.update(managed); snapshots.put(id, managed.copy()); }`',
      ],
      tests: `FakeDatabase db = new FakeDatabase();
db.insert(new Customer(1L, "Ada", "ada@example.com"));
db.insert(new Customer(2L, "Alan", "alan@example.com"));

PersistenceContext context = new PersistenceContext(db);
Customer first = context.find(1L);
Customer again = context.find(1L);
checkTrue("Identity Map liefert dieselbe Instanz", first == again);
check("nur ein SELECT", 1, db.selectCount);
checkTrue("ist managed", context.contains(1L));

context.flush();
check("ohne Aenderung kein UPDATE", 0, db.updates.size());

first.setEmail("ada@lovelace.org");
context.flush();
check("Dirty Checking erzeugt ein UPDATE", 1, db.updates.size());
checkTrue("UPDATE enthaelt den neuen Wert", db.updates.get(0).contains("ada@lovelace.org"));

context.flush();
check("zweiter flush ohne Aenderung", 1, db.updates.size());

context.find(2L);
check("zweite Entity: zweites SELECT", 2, db.selectCount);

context.clear();
checkTrue("nach clear nicht mehr managed", !context.contains(1L));
first.setName("Detached");
context.flush();
check("detached Objekt wird nicht synchronisiert", 1, db.updates.size());

Customer reloaded = context.find(1L);
checkTrue("nach clear neue Instanz", reloaded != first);
check("Wert aus dem ersten UPDATE ist in der DB", "ada@lovelace.org", reloaded.getEmail());
check("Name wurde nicht mitgeschrieben", "Ada", reloaded.getName());
check("drittes SELECT", 3, db.selectCount);

checkThrows("unbekannte id", NoSuchElementException.class, () -> context.find(99L));`,
    },
    {
      id: 'k3',
      title: 'Optimistisches Locking mit Versionsspalte',
      level: 4,
      description: `Simuliere \`@Version\`. Implementiere \`VersionedStore\`:

- \`void insert(Long id, String title)\` – legt die Zeile mit \`version = 0\` an. Existiert die ID schon → \`IllegalStateException\`.
- \`Row load(Long id)\` – liefert die Zeile, sonst \`NoSuchElementException\`.
- \`void update(Long id, String title, long expectedVersion)\` – schreibt nur, wenn die aktuelle Version **exakt** \`expectedVersion\` ist, und erhöht sie dann um 1. Sonst \`OptimisticLockException\`.

Das entspricht dem SQL, das Hibernate erzeugt:

\`\`\`sql
update document set title = ?, version = ? + 1 where id = ? and version = ?
-- 0 betroffene Zeilen  ->  OptimisticLockingFailureException
\`\`\`

Der Test spielt zwei Benutzer durch, die dieselbe Version geladen haben – der zweite darf den ersten **nicht** überschreiben (Lost Update).`,
      given: `record Row(String title, long version) {}

class OptimisticLockException extends RuntimeException {
    OptimisticLockException(String message) {
        super(message);
    }
}`,
      starter: `class VersionedStore {
    private final Map<Long, Row> rows = new HashMap<>();

    void insert(Long id, String title) {
        // TODO
    }

    Row load(Long id) {
        // TODO
        return null;
    }

    void update(Long id, String title, long expectedVersion) {
        // TODO
    }
}`,
      solution: `class VersionedStore {
    private final Map<Long, Row> rows = new HashMap<>();

    void insert(Long id, String title) {
        if (rows.containsKey(id)) {
            throw new IllegalStateException("row already exists: " + id);
        }
        rows.put(id, new Row(title, 0));
    }

    Row load(Long id) {
        Row row = rows.get(id);
        if (row == null) {
            throw new NoSuchElementException("no row with id " + id);
        }
        return row;
    }

    void update(Long id, String title, long expectedVersion) {
        Row current = load(id);
        if (current.version() != expectedVersion) {
            throw new OptimisticLockException(
                "row " + id + " was modified concurrently: expected version "
                    + expectedVersion + " but was " + current.version());
        }
        rows.put(id, new Row(title, current.version() + 1));
    }
}`,
      hints: [
        'Die Version ist Teil der WHERE-Bedingung, nicht nur ein Zähler. Erst prüfen, dann schreiben und hochzählen.',
        '`Map.containsKey`, `Map.get`, `Map.put`, `NoSuchElementException`, eigenes `OptimisticLockException` (ist eine `RuntimeException`).',
        'update: aktuelle Row laden (wirft bei unbekannter id) → version != expectedVersion? → OptimisticLockException → sonst neue Row mit version + 1 speichern.',
        '`if (current.version() != expectedVersion) { throw new OptimisticLockException(...); }\\nrows.put(id, new Row(title, current.version() + 1));`',
      ],
      tests: `VersionedStore store = new VersionedStore();
store.insert(1L, "Entwurf");
check("neue Zeile hat Version 0", new Row("Entwurf", 0L), store.load(1L));

Row sessionA = store.load(1L);
Row sessionB = store.load(1L);
check("beide Sessions sehen Version 0", 0L, sessionB.version());

store.update(1L, "Von A geaendert", sessionA.version());
check("Version wird hochgezaehlt", new Row("Von A geaendert", 1L), store.load(1L));

checkThrows("Lost Update wird verhindert", OptimisticLockException.class,
    () -> store.update(1L, "Von B geaendert", sessionB.version()));
check("B hat nichts ueberschrieben", new Row("Von A geaendert", 1L), store.load(1L));

store.update(1L, "B nach Neuladen", store.load(1L).version());
check("nach Neuladen klappt der Update", new Row("B nach Neuladen", 2L), store.load(1L));

store.insert(2L, "Zweites Dokument");
check("zweites Dokument unabhaengig", new Row("Zweites Dokument", 0L), store.load(2L));

checkThrows("unbekannte id beim Laden", NoSuchElementException.class, () -> store.load(99L));
checkThrows("unbekannte id beim Update", NoSuchElementException.class, () -> store.update(99L, "x", 0L));
checkThrows("doppelte id", IllegalStateException.class, () -> store.insert(1L, "nochmal"));
checkThrows("zu hohe erwartete Version", OptimisticLockException.class, () -> store.update(1L, "x", 99L));`,
    },
    {
      id: 'k4',
      title: 'Transaktionaler Service mit Spring (write & compare)',
      level: 5,
      description: `Schreibe von Hand einen Service, der die typischen Transaktions-Fallstricke richtig löst.

1. \`OrderEntity\` mit \`@Version\`, \`@ManyToOne(fetch = LAZY)\` auf \`customer\` und \`@OneToMany(cascade = ALL, orphanRemoval = true)\` auf \`items\` – inklusive Hilfsmethode \`addItem\`, die **beide** Seiten synchron hält, sowie \`equals\`/\`hashCode\` nach dem ID-Muster.
2. \`OrderService\`
   - \`place(...)\`: \`@Transactional\`, legt die Order an und reduziert den Lagerbestand – beides atomar
   - \`cancel(Long id, String reason)\`: wirft bei ungültigem Status eine **Checked** \`InvalidStateException\` und muss trotzdem rollbacken
   - \`findDto(Long id)\`: \`readOnly = true\`, mappt **innerhalb** der Transaktion auf ein DTO (keine \`LazyInitializationException\`)
   - \`importAll(List<NewOrder>)\`: jede Zeile in einer **eigenen** Transaktion, damit ein Fehler nicht alles zurückrollt – ohne in die Self-Invocation-Falle zu laufen
3. Notiere darunter als Kommentar, welche Properties du setzen würdest.

Diese Kata wird **nicht** ausgeführt – schreibe sie von Hand und vergleiche danach mit der Musterlösung.`,
      starter: `@Service
public class OrderService {
    // TODO
}`,
      solution: `import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Version;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Entity
public class OrderEntity {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    private long version;                      // optimistisches Locking

    private OrderStatus status;

    @ManyToOne(fetch = FetchType.LAZY)         // Default waere EAGER
    @JoinColumn(name = "customer_id")
    private CustomerEntity customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItemEntity> items = new ArrayList<>();

    protected OrderEntity() { }                // JPA braucht einen No-Arg-Konstruktor

    public void addItem(OrderItemEntity item) {   // beide Seiten synchron halten
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItemEntity item) {
        items.remove(item);                       // orphanRemoval loescht die Zeile
        item.setOrder(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderEntity other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();          // konstant: ueberlebt das Setzen der ID
    }
}

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockService stockService;
    private final OrderMapper mapper;
    private final SingleOrderImporter importer;   // eigene Bean gegen Self-Invocation

    public OrderService(OrderRepository orderRepository,
                        StockService stockService,
                        OrderMapper mapper,
                        SingleOrderImporter importer) {
        this.orderRepository = orderRepository;
        this.stockService = stockService;
        this.mapper = mapper;
        this.importer = importer;
    }

    /** Anlegen und Lagerbestand reduzieren muessen gemeinsam gelten. */
    @Transactional
    public Long place(NewOrder command) {
        OrderEntity order = OrderEntity.from(command);
        stockService.reserve(command.items());     // nimmt an derselben Transaktion teil (REQUIRED)
        return orderRepository.save(order).getId();
    }

    /** Checked Exception -> rollbackFor noetig, sonst wuerde committet. */
    @Transactional(rollbackFor = InvalidStateException.class)
    public void cancel(Long id, String reason) throws InvalidStateException {
        OrderEntity order = orderRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(id));
        if (order.getStatus() != OrderStatus.NEW) {
            throw new InvalidStateException("order " + id + " is " + order.getStatus());
        }
        order.cancel(reason);                      // Dirty Checking - kein save() noetig
    }

    /** Mapping passiert IN der Transaktion, deshalb sind Lazy-Zugriffe erlaubt. */
    @Transactional(readOnly = true)
    public OrderDto findDto(Long id) {
        return orderRepository.findById(id)
            .map(mapper::toDto)
            .orElseThrow(() -> new OrderNotFoundException(id));
    }

    /**
     * KEIN @Transactional hier: jede Zeile bekommt ueber eine zweite Bean
     * ihre eigene Transaktion. this.importOne(...) wuerde am Proxy vorbeigehen.
     */
    public ImportReport importAll(List<NewOrder> commands) {
        int ok = 0;
        List<String> failures = new ArrayList<>();
        for (NewOrder command : commands) {
            try {
                importer.importOne(command);
                ok++;
            } catch (RuntimeException e) {
                failures.add(command.reference() + ": " + e.getMessage());
            }
        }
        return new ImportReport(ok, failures);
    }
}

@Service
public class SingleOrderImporter {

    private final OrderRepository orderRepository;

    public SingleOrderImporter(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 10)
    public void importOne(NewOrder command) {
        orderRepository.save(OrderEntity.from(command));
    }
}

// application.properties
// spring.jpa.open-in-view=false                     Lazy-Fehler frueh und laut
// spring.jpa.properties.hibernate.jdbc.batch_size=50
// logging.level.org.springframework.transaction.interceptor=TRACE   zeigt Tx-Grenzen im Log
//
// Merksaetze:
// - Transaktionsgrenze = fachlicher Use Case im Service.
// - Keine Remote-Calls/Mails innerhalb der Transaktion.
// - Entities verlassen den Service nicht; Mapping auf DTOs solange der Context offen ist.`,
      hints: [
        'Vier verschiedene Fallen: Checked Exception + Rollback, Lazy + Mapping, Self-Invocation, Atomarität mehrerer Repository-Aufrufe. Jede hat eine eigene Antwort.',
        '`@Transactional(rollbackFor = ...)`, `@Transactional(readOnly = true)`, `Propagation.REQUIRES_NEW`, `@Version`, `orphanRemoval`, `fetch = FetchType.LAZY`.',
        'Für „jede Zeile eigene Transaktion“ brauchst du eine zweite Bean, deren Methode mit `REQUIRES_NEW` annotiert ist – die äußere Schleifenmethode bleibt ohne `@Transactional`.',
        '`@Override public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof OrderEntity other)) return false; return id != null && id.equals(other.id); }\\n@Override public int hashCode() { return getClass().hashCode(); }`',
      ],
    },
  ],
}

export default chapter
