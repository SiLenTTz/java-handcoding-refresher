# Kapitel 20 – JPA & Transaktionen

## Mental Model

```text
            persist()                       flush / commit
 transient ───────────▶  managed  ─────────────────────────▶  DB-Zeile
    ▲                    │    ▲
    │ new X(...)  remove()│    │ merge(detached)
    │                    ▼    │
  (nur GC)            removed │
                              │
        detached ─────────────┘        (Transaktion / EntityManager beendet)

Persistence Context = Identity Map + Snapshots  (First-Level-Cache)
  find(User, 1L) → schon im Context?  ja  → dieselbe Instanz, KEIN SELECT
                                      nein → SELECT, Instanz + Snapshot merken
  flush()        → je managed Entity: Snapshot != aktueller Zustand? → UPDATE
```

- Innerhalb einer Transaktion ist der Persistence Context deine **Arbeitskopie** der Datenbank. Du rufst kein `update()` auf – du änderst Objekte, und Hibernate leitet beim Flush die SQL-Statements ab (**Dirty Checking**).
- `@Transactional` ist keine Eigenschaft der Methode, sondern ein **Proxy um die Bean**: Erst der Aufruf von außen öffnet, committet oder rollbackt die Transaktion.

## Syntax / API

### Entity und Lifecycle

```java
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)          // Default wäre EAGER – immer überschreiben!
    @JoinColumn(name = "team_id")
    private TeamEntity team;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AddressEntity> addresses = new ArrayList<>();

    protected UserEntity() { }                  // JPA braucht einen No-Arg-Konstruktor
}
```

| Zustand     | Bedeutung                                              | Änderungen werden gespeichert? |
|-------------|--------------------------------------------------------|--------------------------------|
| `transient` | frisch `new`, keine ID, dem Context unbekannt           | nein                           |
| `managed`   | im Persistence Context, an eine Zeile gebunden          | **ja** (Dirty Checking)        |
| `detached`  | war managed, Context ist zu / wurde `clear`/`detach`    | nein                           |
| `removed`   | `remove()` aufgerufen, DELETE folgt beim Flush          | –                              |

### Dirty Checking statt update()

```java
@Transactional
public void rename(Long id, String newName) {
    UserEntity user = repository.findById(id).orElseThrow();
    user.setName(newName);       // fertig – kein repository.save(user) nötig
}
```

Beim Commit vergleicht Hibernate den Snapshot vom Laden mit dem aktuellen Zustand und schreibt nur bei Unterschied ein `UPDATE`.

### flush, clear, detach

```java
entityManager.flush();    // SQL jetzt an die DB schicken (kein Commit!)
entityManager.clear();    // alle Entities detachen – Context leeren
entityManager.detach(user);
entityManager.refresh(user);   // Zustand aus der DB neu laden
```

Automatischer Flush passiert vor dem Commit und vor Queries, die betroffene Tabellen lesen (`FlushModeType.AUTO`).

### @Transactional

```java
@Service
public class OrderService {

    @Transactional                                  // Standard: REQUIRED, rollback bei RuntimeException
    public Order place(NewOrder command) { ... }

    @Transactional(readOnly = true)                 // Hibernate FlushMode.MANUAL, keine Dirty Checks
    public OrderDto get(Long id) { ... }

    @Transactional(rollbackFor = IOException.class, timeout = 5)
    public void export() throws IOException { ... }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void writeAuditLog(String message) { ... }   // committet unabhängig
}
```

### Propagation

| Wert            | Verhalten, wenn schon eine Transaktion läuft            |
|-----------------|----------------------------------------------------------|
| `REQUIRED`      | Default – nimmt die vorhandene teil                       |
| `REQUIRES_NEW`  | suspendiert die äußere, startet eine eigene (eigener Commit) |
| `SUPPORTS`      | nimmt teil, läuft sonst ohne Transaktion                   |
| `MANDATORY`     | Fehler, wenn keine läuft                                   |
| `NEVER`         | Fehler, wenn eine läuft                                    |
| `NOT_SUPPORTED` | suspendiert und läuft ohne Transaktion                     |
| `NESTED`        | Savepoint innerhalb der äußeren Transaktion                |

### Isolation

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
```

`READ_UNCOMMITTED` → Dirty Reads, `READ_COMMITTED` (Default bei Postgres/Oracle) → Non-Repeatable Reads,
`REPEATABLE_READ` (Default bei MySQL) → Phantom Reads, `SERIALIZABLE` → am striktesten, am teuersten.

### Rollback-Regeln

```java
@Transactional                                   // rollback nur bei RuntimeException und Error
@Transactional(rollbackFor = Exception.class)    // auch bei Checked Exceptions
@Transactional(noRollbackFor = NotFoundException.class)
```

Historischer Grund: Checked Exceptions gelten als **erwartete, fachlich behandelbare** Fälle, Runtime-Exceptions als Programmierfehler. Die Regel ist eine Konvention, keine JPA-Vorgabe.

### Self-Invocation

```java
@Service
public class ImportService {

    public void importAll(List<Row> rows) {
        for (Row row : rows) {
            importOne(row);      // interner Aufruf -> Proxy wird umgangen -> KEINE Transaktion!
        }
    }

    @Transactional
    public void importOne(Row row) { ... }
}
```

Lösungen: Aufruf über eine **zweite Bean**, `TransactionTemplate`, oder `self`-Injection (`@Lazy ImportService self`). Zusätzlich greift `@Transactional` bei Proxys nur auf `public`-Methoden.

### LazyInitializationException und open-in-view

```java
@Transactional(readOnly = true)
public OrderDto load(Long id) {
    OrderEntity order = repository.findById(id).orElseThrow();
    return mapper.toDto(order);     // Mapping IN der Transaktion -> Lazy-Zugriffe sind ok
}
```

```properties
spring.jpa.open-in-view=false
```

`open-in-view=true` (Boot-Default) hält den Persistence Context bis zum Rendern der Response offen. Das versteckt N+1-Probleme und hält DB-Connections lange fest. Besser: abschalten und im Service vollständig laden bzw. auf DTOs mappen.

### Optimistisches Locking

```java
@Entity
public class DocumentEntity {
    @Id private Long id;
    @Version private long version;    // Hibernate hängt " and version = ?" an jedes UPDATE
}
```

Passt die Version nicht, kommt 0 zurück und Hibernate wirft `OptimisticLockingFailureException` – der Lost Update ist verhindert.

### Pessimistisches Locking

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)      // select ... for update
@Query("select a from AccountEntity a where a.id = :id")
Optional<AccountEntity> findByIdForUpdate(@Param("id") Long id);
```

Optimistisch = Konflikte sind selten, wir prüfen beim Schreiben. Pessimistisch = Konflikte sind wahrscheinlich, wir sperren vorher (Deadlock-Gefahr, Timeout setzen).

### Cascade und orphanRemoval

```java
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItemEntity> items = new ArrayList<>();

public void addItem(OrderItemEntity item) {   // beide Seiten synchron halten!
    items.add(item);
    item.setOrder(this);
}
```

`PERSIST`, `MERGE`, `REMOVE`, `REFRESH`, `DETACH`, `ALL`. `orphanRemoval = true` löscht Kinder, die aus der Collection entfernt werden – `CascadeType.REMOVE` löscht sie nur, wenn der Parent gelöscht wird.

### equals / hashCode bei Entities

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof UserEntity other)) return false;
    return id != null && id.equals(other.id);
}

@Override
public int hashCode() {
    return getClass().hashCode();     // konstant – überlebt das Setzen der generierten ID
}
```

## Typische Use Cases

- Mehrere Repository-Aufrufe, die gemeinsam gelten müssen (Bestellung + Lagerbestand) → eine `@Transactional`-Service-Methode.
- Lesen für die API → `@Transactional(readOnly = true)` + Mapping auf DTO im Service.
- Änderung an einer geladenen Entity → einfach Setter, Dirty Checking erledigt den Rest.
- Audit-Eintrag, der auch bei Rollback bestehen bleiben soll → `REQUIRES_NEW` in einer eigenen Bean.
- Konkurrierende Bearbeitung desselben Datensatzes durch Benutzer → `@Version`.
- Kontostand/Kontingent unter hoher Nebenläufigkeit → pessimistisches Locking.

## Clean-Code-Empfehlungen

- **Transaktionsgrenze = Service-Methode = fachlicher Anwendungsfall.** Nicht im Controller, nicht im Repository.
- Lesemethoden konsequent `readOnly = true` – dokumentiert die Absicht und spart Snapshots.
- Keine Remote-Calls, keine Mails, keine langen Berechnungen innerhalb der Transaktion – Connection so kurz wie möglich halten.
- `open-in-view=false` setzen und Lazy-Probleme dort lösen, wo sie entstehen.
- Entities verlassen den Service nicht – mappe auf DTOs, solange der Context offen ist.
- Bidirektionale Beziehungen über Hilfsmethoden (`addItem`/`removeItem`) pflegen.
- `@ManyToOne` und `@OneToOne` immer explizit auf `LAZY`.

## Häufige Fehler

```java
// falsch: save() im Glauben, ohne save werde nichts gespeichert – und dann außerhalb der Transaktion
public void rename(Long id, String name) {
    UserEntity user = repository.findById(id).orElseThrow();   // eigene Mini-Transaktion, danach detached
    user.setName(name);                                        // verpufft
    repository.save(user);                                     // merge + zusätzliches SELECT
}

// richtig
@Transactional
public void rename(Long id, String name) {
    repository.findById(id).orElseThrow().setName(name);
}
```

```java
// falsch: Self-Invocation – der interne Aufruf geht am Proxy vorbei
public void importAll(List<Row> rows) {
    rows.forEach(this::importOne);
}
@Transactional
public void importOne(Row row) { ... }

// richtig: über eine zweite Bean, die der Proxy sieht
public void importAll(List<Row> rows) {
    rows.forEach(rowImporter::importOne);
}
```

```java
// falsch: Checked Exception -> COMMIT, obwohl fachlich alles schiefging
@Transactional
public void transfer(...) throws InsufficientFundsException { ... }

// richtig
@Transactional(rollbackFor = InsufficientFundsException.class)
public void transfer(...) throws InsufficientFundsException { ... }
```

```java
// falsch: Exception fangen und schlucken -> Transaktion committet
@Transactional
public void process() {
    try {
        repository.save(entity);
        validate(entity);              // wirft
    } catch (RuntimeException e) {
        log.warn("ignoriert", e);      // Rollback findet trotzdem statt, wenn eine innere @Transactional betroffen war
    }
}
```

```java
// falsch: Lazy-Zugriff außerhalb der Transaktion -> LazyInitializationException
public List<String> itemNames(Long id) {
    OrderEntity order = repository.findById(id).orElseThrow();
    return order.getItems().stream().map(OrderItemEntity::getName).toList();
}

// richtig: in der Transaktion mappen (oder JOIN FETCH / @EntityGraph)
@Transactional(readOnly = true)
public List<String> itemNames(Long id) { ... }
```

```java
// falsch: equals/hashCode über alle Felder oder über die generierte ID mit Standard-hashCode
// -> Entity "verschwindet" aus einem HashSet, sobald die ID beim Flush gesetzt wird
```

## Interview-relevante Details

- **Warum rollbackt Spring nicht bei Checked Exceptions?** Konvention aus EJB-Zeiten: Checked = erwarteter, behandelbarer Fall; Unchecked = Fehler. Über `rollbackFor` anpassbar.
- **Wie funktioniert Dirty Checking?** Beim Laden wird ein Snapshot der Feldwerte abgelegt; beim Flush wird Feld für Feld verglichen und nur bei Abweichung ein `UPDATE` erzeugt.
- **Was macht `readOnly = true` wirklich?** Setzt den Hibernate-FlushMode auf `MANUAL` (kein automatischer Flush, keine Dirty Checks) und markiert die JDBC-Connection als read-only. Es ist **keine** Garantie gegen Schreibzugriffe.
- **`persist` vs. `merge`**: `persist` macht ein transientes Objekt managed (dieselbe Instanz). `merge` kopiert den Zustand eines detached Objekts in eine managed Instanz und gibt **diese** zurück.
- **Self-Invocation**: Proxy-basiertes AOP fängt nur Aufrufe von außen ab; `this.method()` umgeht den Interceptor.
- **`@Transactional` auf `private`/`final`-Methoden** wirkt beim JDK-/CGLIB-Proxy nicht.
- **First-Level-Cache** ist pro Persistence Context und nicht abschaltbar; der Second-Level-Cache ist optional und SessionFactory-weit.
- **Optimistic vs. Pessimistic Locking**: Versionsspalte und Fehler beim Commit vs. DB-Sperre beim Lesen.
- **`orphanRemoval` vs. `CascadeType.REMOVE`**: Entfernen aus der Collection löscht das Kind vs. nur Löschen des Parents löscht die Kinder.
- **Transaktion ohne Spring**: `entityManager.getTransaction().begin()/commit()/rollback()` – `@Transactional` ist nur der deklarative Weg dorthin.

## Zusammenfassung

- Persistence Context = Identity Map + Snapshots: gleiche ID → gleiche Instanz, kein zweites SELECT.
- Managed Entities brauchen kein `save()` – Dirty Checking erzeugt das `UPDATE` beim Flush.
- `@Transactional` gehört in den Service, ist proxy-basiert (Self-Invocation!) und rollbackt per Default nur bei `RuntimeException`/`Error`.
- `readOnly = true` für Lesefälle, `open-in-view=false`, Mapping auf DTOs innerhalb der Transaktion.
- Nebenläufigkeit: `@Version` (optimistisch) als Default, pessimistische Sperren nur bei echten Hotspots.
- Cascade und `orphanRemoval` bewusst wählen, beide Seiten bidirektionaler Beziehungen synchron halten.
