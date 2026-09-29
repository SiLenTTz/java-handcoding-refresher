import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '18',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie deklarierst du ein Spring-Data-JPA-Repository für `UserEntity` mit `Long`-ID?',
      back: `\`\`\`java
public interface UserRepository extends JpaRepository<UserEntity, Long> {
}
\`\`\`
Keine Implementierung, kein \`@Repository\` nötig – Spring erzeugt einen Proxy.`,
    },
    {
      id: 'f2',
      front: 'Welchen Rückgabetyp hat `findById`?',
      back: '`Optional<T>` – 0 oder 1 Treffer. Niemals `null`.',
    },
    {
      id: 'f3',
      front: 'Derived Query: aktive User, nach Nachname gefiltert, nach Vorname aufsteigend sortiert.',
      back: '`List<UserEntity> findByLastNameAndActiveTrueOrderByFirstNameAsc(String lastName);`',
    },
    {
      id: 'f4',
      front: 'Wie prüfst du effizient, ob eine E-Mail schon existiert?',
      back: '`boolean existsByEmail(String email);` – erzeugt ein schlankes `select ... limit 1`/`count` statt die ganze Entity zu laden wie `findByEmail(...).isPresent()`.',
    },
    {
      id: 'f5',
      front: 'Was ist der Unterschied zwischen `findById` und `getReferenceById`?',
      back: '`findById`: sofortiges SELECT, liefert `Optional`. `getReferenceById`: liefert einen Lazy-**Proxy** ohne SELECT – ideal, um nur einen Fremdschlüssel zu setzen (`order.setCustomer(repo.getReferenceById(id))`). Existiert die ID nicht, knallt es erst beim Zugriff (`EntityNotFoundException`).',
    },
    {
      id: 'f6',
      front: 'Was macht `save()` bei neuer vs. existierender Entity?',
      back: 'Neu (`id == null` bzw. `isNew()`): `EntityManager.persist` – dieselbe Instanz wird managed. Sonst `merge` – liefert eine **andere** managed Instanz zurück. Daher immer den Rückgabewert verwenden.',
    },
    {
      id: 'f7',
      front: 'JPQL-Query mit benanntem Parameter für User mit Login vor einem Zeitpunkt.',
      back: `\`\`\`java
@Query("select u from UserEntity u where u.lastLogin < :before")
List<UserEntity> findInactiveSince(@Param("before") Instant before);
\`\`\`
JPQL nutzt Entity- und Feldnamen, keine Tabellennamen.`,
    },
    {
      id: 'f8',
      front: 'Was brauchst du für ein Bulk-Update per `@Query`?',
      back: '`@Modifying` (optional `clearAutomatically = true`) + eine laufende Transaktion (`@Transactional` im Service). Rückgabe `int` = Anzahl betroffener Zeilen. Achtung: umgeht den Persistence Context und Entity-Callbacks.',
    },
    {
      id: 'f9',
      front: 'Was ist eine Interface-Projection?',
      back: `Ein Interface mit Gettern für die gewünschten Felder als Rückgabetyp – Spring selektiert nur diese Spalten:
\`\`\`java
interface UserSummary { Long getId(); String getEmail(); }
List<UserSummary> findByActiveTrue();
\`\`\``,
    },
    {
      id: 'f10',
      front: 'DTO-Projection mit Record per JPQL?',
      back: `\`\`\`java
@Query("select new com.example.UserNameDto(u.id, u.lastName) from UserEntity u")
List<UserNameDto> findAllNames();
\`\`\`
Constructor Expression braucht den **voll qualifizierten** Klassennamen.`,
    },
    {
      id: 'f11',
      front: 'Wie baust du ein `Sort` nach `lastName` aufsteigend, dann `createdAt` absteigend?',
      back: '`Sort.by("lastName").ascending().and(Sort.by("createdAt").descending())` oder `Sort.by(Sort.Order.asc("lastName"), Sort.Order.desc("createdAt"))`.',
    },
    {
      id: 'f12',
      front: 'Was passiert bei `findByMail(String mail)`, wenn das Feld `email` heißt?',
      back: 'Der Context-Start schlägt fehl (`PropertyReferenceException: No property mail found`). Derived Queries werden beim Start validiert.',
    },
    {
      id: 'f13',
      front: 'Die Derived Query `UserEntity findByLastName(String n)` findet 2 Treffer. Was passiert?',
      back: '`IncorrectResultSizeDataAccessException`. Für potenziell mehrere Treffer `List<T>` verwenden; einzelnes Ergebnis nur bei eindeutigen Kriterien, dann als `Optional<T>`.',
    },
    {
      id: 'f14',
      front: 'Nenne 6 Schlüsselwörter für Derived Queries.',
      back: '`And`, `Or`, `Between`, `LessThan`/`GreaterThanEqual`, `In`, `IsNull`, `Containing`/`StartingWith`, `IgnoreCase`, `True`/`False`, `OrderBy…Desc`, `Top10`/`First`, `Distinct`.',
    },
    {
      id: 'f15',
      front: '`deleteAll()` vs. `deleteAllInBatch()`?',
      back: '`deleteAll()` lädt alle Entities und löscht einzeln (Cascade/Callbacks greifen, N Statements). `deleteAllInBatch()` = ein `DELETE FROM`-Statement, ohne Persistence Context.',
    },
    {
      id: 'f16',
      front: '`orElse(repository.save(x))` vs. `orElseGet(() -> repository.save(x))`?',
      back: '`orElse` wertet das Argument **immer** aus → `save` wird auch bei vorhandenem Treffer ausgeführt! `orElseGet` ruft den Supplier nur bei leerem Optional auf.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Signatur ist für einen eindeutigen Lookup per E-Mail richtig?',
      options: [
        '`UserEntity findByEmail(String email);` (liefert `null`, wenn nicht gefunden)',
        '`List<UserEntity> getEmail(String email);`',
        '`Optional<UserEntity> findByEmail(String email);`',
        '`Optional<List<UserEntity>> findByEmail(String email);`',
      ],
      correct: 2,
      explanation: '0 oder 1 Treffer → `Optional<T>`. `null`-Rückgaben vermeiden, `Optional<List<…>>` ist ein Anti-Pattern (leere Liste reicht). `getEmail` ist kein gültiges Derived-Query-Präfix mit dieser Semantik.',
    },
    {
      id: 'q2',
      prompt: 'Welches SQL erzeugt `findByAgeBetween(18, 30)` sinngemäß?',
      options: ['`where age > 18 and age < 30`', '`where age >= 18 and age <= 30`', '`where age in (18, 30)`', '`where age between 18 and 30 order by age`'],
      correct: 1,
      explanation: '`Between` bildet auf SQL `BETWEEN` ab – beide Grenzen inklusive. Eine Sortierung gibt es nur mit `OrderBy`.',
    },
    {
      id: 'q3',
      prompt: 'Was fehlt hier?',
      code: `@Query("update UserEntity u set u.active = false where u.lastLogin < :before")
int deactivateInactive(@Param("before") Instant before);`,
      options: ['`nativeQuery = true`', '`@Modifying` (und eine Transaktion beim Aufruf)', '`@Transactional(readOnly = true)`', 'Nichts'],
      correct: 1,
      explanation: 'Schreibende `@Query`-Methoden brauchen `@Modifying`, sonst `InvalidDataAccessApiUsageException`. Außerdem muss eine schreibende Transaktion aktiv sein.',
    },
    {
      id: 'q4',
      prompt: 'Warum ist diese Query falsch?',
      code: `@Query("select u from users u where u.last_name = :name")
List<UserEntity> findByName(@Param("name") String name);`,
      options: ['Parameter müssen mit `?1` referenziert werden', 'JPQL verwendet Entity- und Feldnamen: `UserEntity u`, `u.lastName`', '`select u` muss `select *` heißen', 'Derived Queries dürfen kein `@Query` haben'],
      correct: 1,
      explanation: 'JPQL arbeitet auf dem Objektmodell. Tabellen-/Spaltennamen gehen nur mit `nativeQuery = true`.',
    },
    {
      id: 'q5',
      prompt: 'Wie viele SQL-Statements erzeugt `repository.findAllById(List.of(1L, 2L, 3L))` typischerweise?',
      options: ['3 (ein SELECT pro ID)', '1 (`where id in (1, 2, 3)`)', '4 (3 SELECTs + COUNT)', '0 bis zum ersten Zugriff'],
      correct: 1,
      explanation: '`findAllById` erzeugt eine einzige Query mit `IN`-Klausel – das Mittel der Wahl statt `findById` in einer Schleife.',
    },
    {
      id: 'q6',
      prompt: 'Was ist das Problem?',
      code: `List<UserEntity> active = userRepository.findAll().stream()
    .filter(UserEntity::isActive)
    .toList();`,
      options: ['`toList()` gibt es nicht auf Streams', 'Alle User werden aus der DB geladen und in Java gefiltert – `findByActiveTrue()` filtert in der DB', 'Streams sind in Repositories verboten', 'Kein Problem'],
      correct: 1,
      explanation: 'Filtern gehört in die Datenbank (Index, weniger Datenübertragung, weniger Entities im Persistence Context).',
    },
    {
      id: 'q7',
      prompt: 'Du willst nur einem neuen `OrderEntity` den Kunden mit ID 42 zuordnen, ohne ihn zu laden. Was nutzt du?',
      options: ['`customerRepository.findById(42L).get()`', '`customerRepository.getReferenceById(42L)`', '`new CustomerEntity(42L)`', '`customerRepository.existsById(42L)`'],
      correct: 1,
      explanation: '`getReferenceById` liefert einen managed Proxy ohne SELECT – genug, um den Fremdschlüssel zu setzen. `new CustomerEntity(42L)` wäre detached/transient und führt je nach Cascade zu Fehlern.',
    },
    {
      id: 'q8',
      prompt: 'Welche Aussage zu `save()` ist richtig?',
      code: `UserEntity detached = new UserEntity(5L, "ada@example.com");
repository.save(detached);
detached.setEmail("new@example.com");`,
      options: [
        'Die neue E-Mail wird beim Commit gespeichert',
        '`save` hat `merge` aufgerufen – `detached` ist weiterhin nicht managed, die Änderung geht verloren',
        '`save` wirft eine Exception, weil die ID gesetzt ist',
        '`save` gibt `void` zurück',
      ],
      correct: 1,
      explanation: 'Bei gesetzter ID ruft Spring Data `merge` auf; das liefert eine neue managed Kopie. Man muss mit dem **Rückgabewert** weiterarbeiten.',
    },
    {
      id: 'q9',
      prompt: 'Welcher Rückgabetyp lädt nur die Spalten `id` und `email`?',
      options: ['`List<UserEntity>`', '`List<Object>`', 'Ein Interface `UserSummary { Long getId(); String getEmail(); }`', '`Page<UserEntity>`'],
      correct: 2,
      explanation: 'Interface- oder DTO-Projections selektieren nur die benötigten Spalten. Entities laden immer alle gemappten Basis-Spalten.',
    },
    {
      id: 'q10',
      prompt: 'Wann bemerkst du einen Tippfehler in einer Derived Query wie `findByEmial`?',
      options: ['Beim Kompilieren', 'Beim Start des Application Context', 'Erst beim ersten Aufruf', 'Gar nicht, die Methode liefert immer leer'],
      correct: 1,
      explanation: 'Spring Data parst und validiert Derived Queries beim Erzeugen des Repository-Proxys → der Start schlägt mit `PropertyReferenceException` fehl.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Derived Queries als In-Memory-Fake implementieren',
      level: 3,
      description: `Implementiere das Repository-Interface so, wie Spring Data die Methodennamen interpretieren würde. So lernst du Semantik **und** Rückgabetypen.

- \`findByEmailIgnoreCase\` → \`Optional\`
- \`findByActiveTrue\` → alle aktiven (Einfügereihenfolge beibehalten)
- \`findByLastNameOrderByFirstNameAsc\`
- \`findByAgeBetween(min, max)\` → **beide Grenzen inklusive**
- \`countByActiveTrue\`, \`existsByEmailIgnoreCase\`
- \`findTop2ByOrderByAgeDesc\` → die zwei ältesten`,
      given: `record UserEntity(Long id, String email, String firstName, String lastName, boolean active, int age) {}

interface UserRepository {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    List<UserEntity> findByActiveTrue();
    List<UserEntity> findByLastNameOrderByFirstNameAsc(String lastName);
    List<UserEntity> findByAgeBetween(int min, int max);
    long countByActiveTrue();
    boolean existsByEmailIgnoreCase(String email);
    List<UserEntity> findTop2ByOrderByAgeDesc();
}`,
      starter: `class InMemoryUserRepository implements UserRepository {
    private final List<UserEntity> users;

    InMemoryUserRepository(List<UserEntity> users) {
        this.users = List.copyOf(users);
    }

    public Optional<UserEntity> findByEmailIgnoreCase(String email) {
        // TODO
        return Optional.empty();
    }

    public List<UserEntity> findByActiveTrue() {
        // TODO
        return List.of();
    }

    public List<UserEntity> findByLastNameOrderByFirstNameAsc(String lastName) {
        // TODO
        return List.of();
    }

    public List<UserEntity> findByAgeBetween(int min, int max) {
        // TODO
        return List.of();
    }

    public long countByActiveTrue() {
        // TODO
        return 0;
    }

    public boolean existsByEmailIgnoreCase(String email) {
        // TODO
        return false;
    }

    public List<UserEntity> findTop2ByOrderByAgeDesc() {
        // TODO
        return List.of();
    }
}`,
      solution: `class InMemoryUserRepository implements UserRepository {
    private final List<UserEntity> users;

    InMemoryUserRepository(List<UserEntity> users) {
        this.users = List.copyOf(users);
    }

    public Optional<UserEntity> findByEmailIgnoreCase(String email) {
        return users.stream()
            .filter(u -> u.email().equalsIgnoreCase(email))
            .findFirst();
    }

    public List<UserEntity> findByActiveTrue() {
        return users.stream().filter(UserEntity::active).toList();
    }

    public List<UserEntity> findByLastNameOrderByFirstNameAsc(String lastName) {
        return users.stream()
            .filter(u -> u.lastName().equals(lastName))
            .sorted(Comparator.comparing(UserEntity::firstName))
            .toList();
    }

    public List<UserEntity> findByAgeBetween(int min, int max) {
        return users.stream()
            .filter(u -> u.age() >= min && u.age() <= max)
            .toList();
    }

    public long countByActiveTrue() {
        return users.stream().filter(UserEntity::active).count();
    }

    public boolean existsByEmailIgnoreCase(String email) {
        return users.stream().anyMatch(u -> u.email().equalsIgnoreCase(email));
    }

    public List<UserEntity> findTop2ByOrderByAgeDesc() {
        return users.stream()
            .sorted(Comparator.comparingInt(UserEntity::age).reversed())
            .limit(2)
            .toList();
    }
}`,
      hints: [
        'Jede Methode ist ein Stream über `users`: der Teil nach `By` wird zu `filter`, `OrderBy` zu `sorted`, `TopN` zu `limit`, `count`/`exists` zu Terminal-Operationen.',
        '`filter`, `findFirst()` (liefert `Optional`), `sorted(Comparator.comparing(...))`, `limit(2)`, `count()`, `anyMatch(...)`, `equalsIgnoreCase`.',
        'Between: `age >= min && age <= max`. Top2 absteigend: `Comparator.comparingInt(UserEntity::age).reversed()` + `limit(2)`.',
        '`return users.stream().filter(u -> u.email().equalsIgnoreCase(email)).findFirst();`',
      ],
      tests: `List<UserEntity> data = List.of(
    new UserEntity(1L, "ada@example.com", "Ada", "Lovelace", true, 36),
    new UserEntity(2L, "alan@example.com", "Alan", "Turing", false, 41),
    new UserEntity(3L, "grace@example.com", "Grace", "Hopper", true, 85),
    new UserEntity(4L, "byron@example.com", "Byron", "Lovelace", true, 18),
    new UserEntity(5L, "anna@example.com", "Anna", "Lovelace", false, 30));
UserRepository repo = new InMemoryUserRepository(data);
check("findByEmailIgnoreCase", Optional.of(data.get(2)), repo.findByEmailIgnoreCase("GRACE@example.com"));
check("findByEmailIgnoreCase leer", Optional.empty(), repo.findByEmailIgnoreCase("nobody@example.com"));
check("findByActiveTrue", List.of(1L, 3L, 4L), repo.findByActiveTrue().stream().map(UserEntity::id).toList());
check("OrderByFirstNameAsc", List.of("Ada", "Anna", "Byron"), repo.findByLastNameOrderByFirstNameAsc("Lovelace").stream().map(UserEntity::firstName).toList());
check("Between inklusive", List.of(1L, 4L, 5L), repo.findByAgeBetween(18, 36).stream().map(UserEntity::id).toList());
check("countByActiveTrue", 3L, repo.countByActiveTrue());
checkTrue("existsByEmailIgnoreCase", repo.existsByEmailIgnoreCase("ALAN@EXAMPLE.COM"));
checkTrue("exists false", !repo.existsByEmailIgnoreCase("x@y.z"));
check("Top2 nach Alter desc", List.of(3L, 2L), repo.findTop2ByOrderByAgeDesc().stream().map(UserEntity::id).toList());
check("leeres Repo Top2", List.of(), new InMemoryUserRepository(List.of()).findTop2ByOrderByAgeDesc());`,
    },
    {
      id: 'k2',
      title: 'Sort-Parameter parsen und whitelisten',
      level: 3,
      description: `Spring bindet \`?sort=price,desc&sort=name\` an ein \`Sort\`. Baue das nach – inklusive **Whitelist**, damit Clients nur erlaubte Properties sortieren können.

\`SortSupport\`:
- \`static Sort parse(List<String> params)\`: jedes Element ist \`"property"\` oder \`"property,asc|desc"\` (Richtung case-insensitive, Default \`ASC\`). Ungültige Richtung → \`IllegalArgumentException\`.
- \`static Comparator<Product> toComparator(Sort sort)\`: erlaubte Properties sind nur \`name\`, \`price\`, \`createdAt\`. Unbekannt → \`IllegalArgumentException\`. Mehrere Orders werden nacheinander angewandt (\`thenComparing\`). Leeres \`Sort\` → Reihenfolge bleibt unverändert.`,
      given: `enum Direction { ASC, DESC }

record Order(String property, Direction direction) {}

record Sort(List<Order> orders) {
    static Sort unsorted() {
        return new Sort(List.of());
    }
}

record Product(String name, BigDecimal price, LocalDate createdAt) {}`,
      starter: `class SortSupport {

    static Sort parse(List<String> params) {
        // TODO
        return Sort.unsorted();
    }

    static Comparator<Product> toComparator(Sort sort) {
        // TODO
        return (a, b) -> 0;
    }
}`,
      solution: `class SortSupport {
    private static final Map<String, Comparator<Product>> ALLOWED = Map.of(
        "name", Comparator.comparing(Product::name),
        "price", Comparator.comparing(Product::price),
        "createdAt", Comparator.comparing(Product::createdAt));

    static Sort parse(List<String> params) {
        List<Order> orders = params.stream()
            .map(SortSupport::parseOrder)
            .toList();
        return new Sort(orders);
    }

    private static Order parseOrder(String param) {
        String[] parts = param.split(",");
        String property = parts[0].trim();
        Direction direction = parts.length > 1
            ? Direction.valueOf(parts[1].trim().toUpperCase(Locale.ROOT))
            : Direction.ASC;
        return new Order(property, direction);
    }

    static Comparator<Product> toComparator(Sort sort) {
        Comparator<Product> result = (a, b) -> 0;
        for (Order order : sort.orders()) {
            Comparator<Product> comparator = ALLOWED.get(order.property());
            if (comparator == null) {
                throw new IllegalArgumentException("Sorting by '" + order.property() + "' is not allowed");
            }
            result = result.thenComparing(order.direction() == Direction.DESC ? comparator.reversed() : comparator);
        }
        return result;
    }
}`,
      hints: [
        'Zwei Schritte: String → `Order` (parsen) und `Order` → `Comparator` (über eine Whitelist-Map).',
        '`String.split(",")`, `Direction.valueOf(...)` wirft bei ungültigem Namen bereits eine `IllegalArgumentException`. `Comparator.thenComparing(...)`, `reversed()`.',
        'Starte mit einem neutralen Comparator `(a, b) -> 0` und hänge für jede Order `thenComparing(asc ? c : c.reversed())` an. Unbekannte Property → Exception.',
        '`Map<String, Comparator<Product>> ALLOWED = Map.of("name", Comparator.comparing(Product::name), ...);`',
      ],
      tests: `check("parse", new Sort(List.of(new Order("price", Direction.DESC), new Order("name", Direction.ASC))), SortSupport.parse(List.of("price,desc", "name")));
check("parse Richtung case-insensitive", new Sort(List.of(new Order("name", Direction.DESC))), SortSupport.parse(List.of("name,DESC")));
check("parse leer", Sort.unsorted(), SortSupport.parse(List.of()));
checkThrows("ungültige Richtung", IllegalArgumentException.class, () -> SortSupport.parse(List.of("name,up")));

Product a = new Product("Mouse", new BigDecimal("20"), LocalDate.of(2024, 1, 3));
Product b = new Product("Keyboard", new BigDecimal("50"), LocalDate.of(2024, 1, 1));
Product c = new Product("Cable", new BigDecimal("20"), LocalDate.of(2024, 1, 2));
List<Product> products = new ArrayList<>(List.of(a, b, c));

products.sort(SortSupport.toComparator(SortSupport.parse(List.of("price,desc", "name"))));
check("price desc, dann name asc", List.of(b, c, a), products);

products.sort(SortSupport.toComparator(SortSupport.parse(List.of("createdAt"))));
check("createdAt asc", List.of(b, c, a), products);

List<Product> unchanged = new ArrayList<>(List.of(a, b, c));
unchanged.sort(SortSupport.toComparator(Sort.unsorted()));
check("unsorted behält Reihenfolge", List.of(a, b, c), unchanged);

checkThrows("Property nicht erlaubt", IllegalArgumentException.class,
    () -> SortSupport.toComparator(SortSupport.parse(List.of("passwordHash"))));`,
    },
    {
      id: 'k3',
      title: 'findOrCreate: orElse vs. orElseGet',
      level: 2,
      description: `Implementiere \`TagService.findOrCreate(String name)\`:
- Name normalisieren: \`trim()\` + lower case (\`Locale.ROOT\`). Blank → \`IllegalArgumentException\`.
- Existiert ein Tag (\`findByName\`), wird er zurückgegeben – **ohne** \`save\`.
- Sonst neuen Tag speichern und zurückgeben.

Der Test zählt die \`save\`-Aufrufe. Genau hier unterscheidet sich \`orElse(...)\` von \`orElseGet(...)\`.`,
      given: `record Tag(Long id, String name) {}

interface TagRepository {
    Optional<Tag> findByName(String name);
    Tag save(Tag tag);
}

class InMemoryTagRepository implements TagRepository {
    private final Map<String, Tag> byName = new HashMap<>();
    private long nextId = 1;
    int saveCalls = 0;

    public Optional<Tag> findByName(String name) {
        return Optional.ofNullable(byName.get(name));
    }

    public Tag save(Tag tag) {
        saveCalls++;
        Tag saved = tag.id() == null ? new Tag(nextId++, tag.name()) : tag;
        byName.put(saved.name(), saved);
        return saved;
    }
}`,
      starter: `class TagService {
    private final TagRepository repository;

    TagService(TagRepository repository) {
        this.repository = repository;
    }

    Tag findOrCreate(String name) {
        // TODO
        return null;
    }
}`,
      solution: `class TagService {
    private final TagRepository repository;

    TagService(TagRepository repository) {
        this.repository = repository;
    }

    Tag findOrCreate(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("tag name must not be blank");
        }
        String normalized = name.trim().toLowerCase(Locale.ROOT);
        return repository.findByName(normalized)
            .orElseGet(() -> repository.save(new Tag(null, normalized)));
    }
}`,
      hints: [
        'Das Muster ist „lookup, sonst anlegen“. Das Anlegen darf nur passieren, wenn das Optional leer ist.',
        '`Optional.orElse(T)` wertet das Argument **immer** aus. `Optional.orElseGet(Supplier<T>)` nur bei Bedarf.',
        'guard(blank) → normalize → findByName(n).orElseGet(() -> save(new Tag(null, n)))',
      ],
      tests: `InMemoryTagRepository repo = new InMemoryTagRepository();
TagService service = new TagService(repo);
Tag java = service.findOrCreate("  Java ");
check("neu angelegt + normalisiert", new Tag(1L, "java"), java);
check("ein save", 1, repo.saveCalls);
Tag again = service.findOrCreate("JAVA");
check("vorhandener Tag", java, again);
check("kein weiterer save (orElseGet!)", 1, repo.saveCalls);
check("zweiter Tag", new Tag(2L, "spring"), service.findOrCreate("Spring"));
checkThrows("blank", IllegalArgumentException.class, () -> service.findOrCreate("   "));
checkThrows("null", IllegalArgumentException.class, () -> service.findOrCreate(null));
check("insgesamt 2 saves", 2, repo.saveCalls);`,
    },
    {
      id: 'k4',
      title: 'OrderRepository mit Derived Queries, @Query und Projection (write & compare)',
      level: 3,
      description: `Schreibe ein \`OrderRepository extends JpaRepository<OrderEntity, Long>\` mit:

1. alle Orders eines Kunden (\`customer.id\`), neueste zuerst
2. Orders mit Status aus einer Menge, erstellt nach einem Zeitpunkt
3. existiert eine Order mit dieser Bestellnummer?
4. Anzahl Orders pro Status
5. JPQL: Summe der Beträge eines Kunden (\`BigDecimal\`)
6. Bulk-Update: alle \`PENDING\`-Orders älter als X auf \`CANCELLED\` setzen
7. Interface-Projection \`OrderSummary\` (id, orderNumber, total) für die Top 10 größten Orders
8. DTO-Projection mit Record \`CustomerRevenue(Long customerId, BigDecimal revenue)\` gruppiert nach Kunde`,
      starter: `public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    // TODO
}`,
      solution: `import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    // 1. Property-Traversal customer.id
    List<OrderEntity> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // 2.
    List<OrderEntity> findByStatusInAndCreatedAtAfter(Collection<OrderStatus> statuses, Instant after);

    // 3.
    boolean existsByOrderNumber(String orderNumber);

    // 4.
    long countByStatus(OrderStatus status);

    // 5.
    @Query("select coalesce(sum(o.total), 0) from OrderEntity o where o.customer.id = :customerId")
    BigDecimal sumTotalByCustomer(@Param("customerId") Long customerId);

    // 6.
    @Modifying(clearAutomatically = true)
    @Query("""
        update OrderEntity o
           set o.status = com.example.order.OrderStatus.CANCELLED
         where o.status = com.example.order.OrderStatus.PENDING
           and o.createdAt < :before
        """)
    int cancelPendingOlderThan(@Param("before") Instant before);

    // 7.
    List<OrderSummary> findTop10ByOrderByTotalDesc();

    // 8.
    @Query("""
        select new com.example.order.CustomerRevenue(o.customer.id, sum(o.total))
          from OrderEntity o
         group by o.customer.id
        """)
    List<CustomerRevenue> revenuePerCustomer();
}

public interface OrderSummary {
    Long getId();
    String getOrderNumber();
    BigDecimal getTotal();
}

public record CustomerRevenue(Long customerId, BigDecimal revenue) {}

// Service:
// @Transactional
// public int cancelStaleOrders() {
//     return orderRepository.cancelPendingOlderThan(clock.instant().minus(Duration.ofDays(7)));
// }`,
      hints: [
        'Einfache Filter → Derived Queries; Aggregationen, Bulk-Updates und Constructor Expressions → `@Query`.',
        'Traversal über Beziehungen: `findByCustomerId` greift auf `customer.id` zu. `In` erwartet eine `Collection`.',
        'Bulk-Update: `@Modifying` + `@Query("update ...")` + Rückgabe `int`; im Service mit `@Transactional` aufrufen. Constructor Expression: `select new voll.qualifizierter.Name(...)`.',
      ],
    },
  ],
}

export default chapter
