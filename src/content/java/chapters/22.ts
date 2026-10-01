import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '22',
  flashcards: [
    { id: 'c1', front: 'Wofür steht **AAA** in Tests?', back: '**Arrange** (Testdaten/Doubles vorbereiten), **Act** (genau eine Aktion ausführen), **Assert** (Ergebnis prüfen). BDD-Variante: Given / When / Then.' },
    { id: 'c2', front: 'Unterschied **Stub** vs **Mock**?', back: 'Ein **Stub** liefert vorbereitete Antworten (State Verification: man prüft das Ergebnis). Ein **Mock** prüft Interaktionen (Behavior Verification: `verify(...)`).' },
    { id: 'c3', front: 'Was ist ein **Fake**?', back: 'Eine funktionierende, vereinfachte Implementierung, z. B. `InMemoryUserRepository` mit `HashMap`. Prüft echtes Verhalten, nicht Aufrufreihenfolge.' },
    { id: 'c4', front: 'Was ist ein **Spy** (handgeschrieben)?', back: 'Ein Test Double, das Aufrufe aufzeichnet (z. B. Liste gesendeter E-Mails), damit der Test sie danach prüfen kann.' },
    { id: 'c5', front: 'Faustregel: Was stubben, was verifizieren?', back: '**Queries** (liefern Daten) stubben, nicht verifizieren. **Commands** (Seiteneffekte wie save, send, publish) verifizieren.' },
    { id: 'c6', front: 'Minimales Mockito-Setup mit JUnit 5?', back: '`@ExtendWith(MockitoExtension.class)` an der Klasse, Abhängigkeiten mit `@Mock`, die zu testende Klasse mit `@InjectMocks`.' },
    { id: 'c7', front: 'Wofür `ArgumentCaptor`?', back: 'Um ein Argument abzufangen, das **im** Service erzeugt wird: `verify(repo).save(captor.capture()); assertThat(captor.getValue().getName()).isEqualTo("Ada");`' },
    { id: 'c8', front: 'Wie stubbt man eine `void`-Methode, damit sie wirft?', back: '`doThrow(new MailException()).when(sender).send(any());` – `when(...)` funktioniert bei `void` nicht.' },
    { id: 'c9', front: 'Matcher-Regel bei Mockito?', back: 'Sobald **ein** Argument ein Matcher ist, müssen **alle** Matcher sein: `verify(repo).find(eq(1L), any())`. Sonst `InvalidUseOfMatchersException`.' },
    { id: 'c10', front: 'Wie vergleicht man `BigDecimal` in AssertJ?', back: '`assertThat(total).isEqualByComparingTo("10.00")` – nutzt `compareTo`, ignoriert die Skala. `isEqualTo` würde `10.0` ≠ `10.00` melden.' },
    { id: 'c11', front: 'AssertJ: Liste mit Reihenfolge vs ohne?', back: '`containsExactly(...)` prüft Inhalt **und** Reihenfolge, `containsExactlyInAnyOrder(...)` nur den Inhalt. `contains(...)` erlaubt weitere Elemente.' },
    { id: 'c12', front: 'Exception mit AssertJ prüfen?', back: '`assertThatThrownBy(() -> service.get(99L)).isInstanceOf(NotFoundException.class).hasMessageContaining("99");`' },
    { id: 'c13', front: '`@WebMvcTest` vs `@DataJpaTest` vs `@SpringBootTest`?', back: '`@WebMvcTest`: nur Web-Layer (Controller, Advice, Validation), Services mocken. `@DataJpaTest`: nur JPA + Repositories, transaktional mit Rollback. `@SpringBootTest`: kompletter Context.' },
    { id: 'c14', front: '`@Mock` vs `@MockitoBean` (`@MockBean`)?', back: '`@Mock` ist reines Mockito ohne Spring. `@MockitoBean` (ab Boot 3.4, vorher `@MockBean`) ersetzt ein Bean im Spring ApplicationContext, z. B. in `@WebMvcTest`.' },
    { id: 'c15', front: 'Wie macht man Code mit `LocalDate.now()` testbar?', back: '`Clock` injizieren und `LocalDate.now(clock)` nutzen. Im Test `Clock.fixed(Instant.parse("2025-01-15T10:00:00Z"), ZoneOffset.UTC)`.' },
    { id: 'c16', front: 'Welche Quellen gibt es für `@ParameterizedTest`?', back: '`@ValueSource`, `@CsvSource`, `@EnumSource`, `@MethodSource` (liefert `Stream<Arguments>`), `@NullAndEmptySource`.' },
    { id: 'c17', front: 'Was bedeutet "Verhalten statt Implementierung testen"?', back: 'Beobachtbares Ergebnis prüfen (Rückgabewert, Zustand, relevante Seiteneffekte), nicht interne Aufrufe. Solche Tests überleben Refactorings.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welches Test Double ist `InMemoryOrderRepository` mit einer internen `HashMap`?',
      options: ['Mock', 'Dummy', 'Fake', 'Stub'],
      correct: 2,
      explanation: 'Ein **Fake** ist eine funktionierende, vereinfachte Implementierung. Ein Stub liefert nur fest vorbereitete Antworten, ein Mock verifiziert Interaktionen.',
    },
    {
      id: 'q2',
      prompt: 'Warum schlägt dieser Test fehl?',
      code: `assertEquals(new BigDecimal("10.0"), order.total()); // total() liefert 10.00`,
      options: [
        '`BigDecimal.equals` vergleicht auch die Skala, `10.0` und `10.00` sind nicht equal',
        '`assertEquals` kann keine Objekte vergleichen',
        '`new BigDecimal("10.0")` ist ungenau wie `double`',
        'Die Reihenfolge expected/actual ist vertauscht',
      ],
      correct: 0,
      explanation: '`BigDecimal.equals` berücksichtigt die Skala. Richtig: `assertThat(total).isEqualByComparingTo("10.0")` bzw. `compareTo(...) == 0`.',
    },
    {
      id: 'q3',
      prompt: 'Welche Exception wirft Mockito hier?',
      code: `verify(repository).findByNameAndActive("Ada", anyBoolean());`,
      options: ['`UnnecessaryStubbingException`', '`WantedButNotInvoked`', '`NullPointerException`', '`InvalidUseOfMatchersException`'],
      correct: 3,
      explanation: 'Rohwert `"Ada"` und Matcher `anyBoolean()` sind gemischt. Entweder alle Matcher (`eq("Ada"), anyBoolean()`) oder keine.',
    },
    {
      id: 'q4',
      prompt: 'Du willst prüfen, dass der Service beim Registrieren einen `User` mit normalisierter E-Mail speichert. Der `User` wird im Service erzeugt. Was nutzt du?',
      options: [
        '`when(repo.save(any())).thenReturn(null)`',
        '`ArgumentCaptor<User>` mit `verify(repo).save(captor.capture())`',
        '`verifyNoInteractions(repo)`',
        '`@Spy` auf den Service',
      ],
      correct: 1,
      explanation: 'Mit einem `ArgumentCaptor` fängst du das übergebene Objekt ab und prüfst dessen Felder mit AssertJ.',
    },
    {
      id: 'q5',
      prompt: 'Welcher Test-Slice passt, um zu prüfen, dass `POST /api/users` mit leerem Namen `400 Bad Request` liefert?',
      options: ['`@DataJpaTest`', '`@SpringBootTest` mit echter Datenbank', '`@WebMvcTest(UserController.class)` mit `@MockitoBean UserService`', 'Reiner Mockito-Unit-Test des Controllers ohne Spring'],
      correct: 2,
      explanation: 'Validation, Jackson und `@RestControllerAdvice` laufen im Web-Layer. `@WebMvcTest` lädt genau diesen Slice; der Service wird gemockt. Ein reiner Mockito-Test würde `@Valid` gar nicht auswerten.',
    },
    {
      id: 'q6',
      prompt: 'Was ist das Hauptproblem dieses Tests?',
      code: `@Test
void getActiveUsers() {
    when(repo.findAll()).thenReturn(users);
    service.getActiveUsers();
    verify(repo).findAll();
    verify(mapper, times(2)).toDto(any());
}`,
      options: [
        'Er verwendet `times(2)` statt `atLeastOnce()`',
        'Er fehlt `@ExtendWith`',
        'Er verifiziert eine Query, statt das Ergebnis zu prüfen – testet Implementierung statt Verhalten',
        'Er müsste `@SpringBootTest` sein',
      ],
      correct: 2,
      explanation: 'Das Ergebnis wird nicht einmal angeschaut. Besser: `assertThat(service.getActiveUsers()).extracting(UserDto::name).containsExactly(...)`. Queries stubben, nicht verifizieren.',
    },
    {
      id: 'q7',
      prompt: 'Was macht `@DataJpaTest` standardmäßig nach jedem Test?',
      options: ['Rollback der Transaktion', 'Commit der Transaktion', 'Löscht das Schema komplett und legt es neu an', 'Nichts – Daten bleiben erhalten'],
      correct: 0,
      explanation: '`@DataJpaTest` ist mit `@Transactional` annotiert; jede Testmethode läuft in einer Transaktion, die am Ende zurückgerollt wird.',
    },
    {
      id: 'q8',
      prompt: 'Welche Assertion ist korrekt, wenn die Reihenfolge der Namen egal ist, aber keine weiteren vorkommen dürfen?',
      options: ['`contains("Ada", "Bob")`', '`containsExactly("Ada", "Bob")`', '`hasSize(2)`', '`containsExactlyInAnyOrder("Ada", "Bob")`'],
      correct: 3,
      explanation: '`containsExactlyInAnyOrder` prüft genau diese Elemente in beliebiger Reihenfolge. `contains` erlaubt weitere, `containsExactly` verlangt die Reihenfolge.',
    },
    {
      id: 'q9',
      prompt: 'Warum ist diese Klasse schwer zu testen?',
      code: `class InvoiceService {
    boolean isOverdue(Invoice invoice) {
        return invoice.dueDate().isBefore(LocalDate.now());
    }
}`,
      options: [
        '`isBefore` ist nicht deterministisch',
        '`LocalDate.now()` ist eine versteckte Abhängigkeit zur Systemzeit – Ergebnis hängt vom Ausführungstag ab',
        'Records können nicht in Tests verwendet werden',
        'Die Methode ist nicht `public`',
      ],
      correct: 1,
      explanation: 'Lösung: `Clock` per Konstruktor injizieren und `LocalDate.now(clock)` nutzen; im Test `Clock.fixed(...)`.',
    },
    {
      id: 'q10',
      prompt: 'Du nutzt `MockitoExtension` (strict stubs) und stubbst im Test `when(repo.findById(1L))...`, aber der getestete Pfad ruft `findById` nie auf. Was passiert?',
      options: [
        'Nichts, das Stubbing wird ignoriert',
        'Der Test wird übersprungen',
        '`UnnecessaryStubbingException` – der Test schlägt fehl',
        '`NullPointerException` beim Stubbing',
      ],
      correct: 2,
      explanation: 'Strict Stubs melden ungenutzte Stubbings, weil sie auf toten oder falsch verstandenen Testcode hinweisen. Entfernen oder (selten) `lenient()` verwenden.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Fake: InMemoryUserRepository',
      level: 3,
      description: `Statt Mockito schreibst du einen **Fake**: eine funktionierende In-Memory-Implementierung von \`UserRepository\`. Der gegebene \`UserService\` wird damit getestet.

Anforderungen an \`InMemoryUserRepository\`:
- \`save(user)\`: hat der User **keine** id (\`null\`), vergib fortlaufend \`1, 2, 3, ...\` und gib den User **mit** id zurück. Hat er eine id, wird der bestehende Eintrag überschrieben.
- \`findById\` / \`findByEmail\` liefern \`Optional\`; \`findByEmail\` vergleicht **case-insensitive**.
- \`findAll()\` liefert alle User **sortiert nach id** als Kopie (Änderungen an der Liste dürfen den Fake nicht verändern).
- \`count()\` liefert die Anzahl gespeicherter User.`,
      given: `record User(Long id, String email, String name) {
    User withId(Long newId) { return new User(newId, email, name); }
}

interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    List<User> findAll();
    int count();
}

class DuplicateEmailException extends RuntimeException {
    DuplicateEmailException(String email) { super("Email already registered: " + email); }
}

class UserService {
    private final UserRepository repository;
    UserService(UserRepository repository) { this.repository = repository; }

    User register(String email, String name) {
        if (repository.findByEmail(email).isPresent()) {
            throw new DuplicateEmailException(email);
        }
        return repository.save(new User(null, email, name));
    }

    User rename(Long id, String newName) {
        User user = repository.findById(id).orElseThrow(() -> new NoSuchElementException("User " + id));
        return repository.save(new User(user.id(), user.email(), newName));
    }
}`,
      starter: `class InMemoryUserRepository implements UserRepository {

    @Override
    public User save(User user) {
        // TODO: id vergeben, falls null; speichern
        return user;
    }

    @Override
    public Optional<User> findById(Long id) {
        // TODO
        return Optional.empty();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        // TODO: case-insensitive
        return Optional.empty();
    }

    @Override
    public List<User> findAll() {
        // TODO: sortiert nach id, als Kopie
        return new ArrayList<>();
    }

    @Override
    public int count() {
        // TODO
        return 0;
    }
}`,
      solution: `class InMemoryUserRepository implements UserRepository {

    private final Map<Long, User> store = new HashMap<>();
    private long nextId = 1;

    @Override
    public User save(User user) {
        User toStore = user.id() == null ? user.withId(nextId++) : user;
        store.put(toStore.id(), toStore);
        return toStore;
    }

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return store.values().stream()
            .filter(u -> u.email().equalsIgnoreCase(email))
            .findFirst();
    }

    @Override
    public List<User> findAll() {
        return store.values().stream()
            .sorted(Comparator.comparing(User::id))
            .collect(Collectors.toCollection(ArrayList::new));
    }

    @Override
    public int count() {
        return store.size();
    }
}`,
      hints: [
        'Ein Fake braucht echten Zustand: eine `Map<Long, User>` und einen Zähler für die nächste id.',
        'Records sind immutable – für die neue id brauchst du ein neues Objekt (`withId`). `Optional.ofNullable(map.get(id))` für `findById`.',
        '`findByEmail`: über `values()` streamen, mit `equalsIgnoreCase` filtern, `findFirst()`. `findAll`: `sorted(Comparator.comparing(User::id))` und in eine neue Liste sammeln.',
        'save: `User toStore = user.id() == null ? user.withId(nextId++) : user; store.put(toStore.id(), toStore); return toStore;`',
      ],
      tests: `var repo = new InMemoryUserRepository();
var service = new UserService(repo);
User ada = service.register("ada@example.com", "Ada");
User bob = service.register("bob@example.com", "Bob");
check("erste id ist 1", 1L, ada.id());
check("zweite id ist 2", 2L, bob.id());
check("count nach 2 Registrierungen", 2, repo.count());
check("findById liefert gespeicherten User", Optional.of(bob), repo.findById(2L));
check("findById unbekannt", Optional.empty(), repo.findById(99L));
check("findByEmail case-insensitive", Optional.of(ada), repo.findByEmail("ADA@Example.com"));
checkThrows("Duplikat (andere Schreibweise) wird abgelehnt", DuplicateEmailException.class, () -> service.register("Ada@example.com", "Ada 2"));
User renamed = service.rename(1L, "Ada Lovelace");
check("rename behält id", 1L, renamed.id());
check("rename überschreibt statt neu anzulegen", 2, repo.count());
check("findAll sortiert nach id", List.of("Ada Lovelace", "Bob"), repo.findAll().stream().map(User::name).toList());
List<User> copy = repo.findAll();
copy.clear();
check("findAll liefert Kopie", 2, repo.findAll().size());
checkThrows("rename unbekannter User", NoSuchElementException.class, () -> service.rename(42L, "X"));`,
    },
    {
      id: 'k2',
      title: 'Testbares Design: Clock injizieren',
      level: 3,
      description: `Implementiere \`SubscriptionService\` so, dass er **ohne** \`LocalDate.now()\` auskommt, sondern eine injizierte \`Clock\` nutzt. Die Tests verwenden \`Clock.fixed(...)\`.

- \`isExpired(sub)\`: \`true\`, wenn \`expiresAt\` **vor** heute liegt (am Ablauftag selbst ist sie noch gültig).
- \`daysLeft(sub)\`: Tage von heute bis \`expiresAt\`; bei abgelaufenen Abos \`0\` (nie negativ).
- \`renew(sub, days)\`: verlängert um \`days\` Tage – ab \`expiresAt\`, falls noch gültig, sonst **ab heute**. \`days <= 0\` → \`IllegalArgumentException\`.`,
      given: `record Subscription(String customer, LocalDate expiresAt) {}`,
      starter: `class SubscriptionService {

    private final Clock clock;

    SubscriptionService(Clock clock) {
        this.clock = clock;
    }

    boolean isExpired(Subscription sub) {
        // TODO: LocalDate.now(clock) nutzen
        return false;
    }

    long daysLeft(Subscription sub) {
        // TODO
        return -1;
    }

    Subscription renew(Subscription sub, int days) {
        // TODO
        return sub;
    }
}`,
      solution: `class SubscriptionService {

    private final Clock clock;

    SubscriptionService(Clock clock) {
        this.clock = clock;
    }

    boolean isExpired(Subscription sub) {
        return sub.expiresAt().isBefore(today());
    }

    long daysLeft(Subscription sub) {
        if (isExpired(sub)) {
            return 0;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(today(), sub.expiresAt());
    }

    Subscription renew(Subscription sub, int days) {
        if (days <= 0) {
            throw new IllegalArgumentException("days must be positive");
        }
        LocalDate base = isExpired(sub) ? today() : sub.expiresAt();
        return new Subscription(sub.customer(), base.plusDays(days));
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}`,
      hints: [
        'Die Zeitquelle ist eine Abhängigkeit wie jede andere – eine private Hilfsmethode `today()` mit `LocalDate.now(clock)` hält alles zentral.',
        '`isBefore` ist exklusiv: am Ablauftag selbst ist `expiresAt.isBefore(today)` `false`. Für Tage: `ChronoUnit.DAYS.between(from, to)` (Paket `java.time.temporal`).',
        'renew: erst Guard Clause für `days <= 0`, dann Basisdatum wählen (abgelaufen → heute, sonst expiresAt), dann `plusDays`.',
      ],
      tests: `Clock clock = Clock.fixed(Instant.parse("2025-03-10T12:00:00Z"), ZoneOffset.UTC);
var service = new SubscriptionService(clock);
var valid = new Subscription("ada", LocalDate.of(2025, 3, 20));
var expired = new Subscription("bob", LocalDate.of(2025, 3, 1));
var lastDay = new Subscription("cy", LocalDate.of(2025, 3, 10));
check("gültiges Abo nicht abgelaufen", false, service.isExpired(valid));
check("vergangenes Abo abgelaufen", true, service.isExpired(expired));
check("am Ablauftag noch gültig", false, service.isExpired(lastDay));
check("daysLeft gültig", 10L, service.daysLeft(valid));
check("daysLeft am Ablauftag", 0L, service.daysLeft(lastDay));
check("daysLeft abgelaufen nie negativ", 0L, service.daysLeft(expired));
check("renew gültig ab expiresAt", LocalDate.of(2025, 4, 19), service.renew(valid, 30).expiresAt());
check("renew abgelaufen ab heute", LocalDate.of(2025, 4, 9), service.renew(expired, 30).expiresAt());
check("renew behält customer", "bob", service.renew(expired, 1).customer());
checkThrows("renew mit 0 Tagen", IllegalArgumentException.class, () -> service.renew(valid, 0));
var otherDay = new SubscriptionService(Clock.fixed(Instant.parse("2025-03-25T00:00:00Z"), ZoneOffset.UTC));
check("andere Clock, anderes Ergebnis", true, otherDay.isExpired(valid));`,
    },
    {
      id: 'k3',
      title: 'Spy: RecordingEmailSender',
      level: 3,
      description: `Der gegebene \`NewsletterService\` verschickt einen Newsletter an alle **aktiven** Abonnenten (jede Adresse nur einmal, case-insensitive) und zählt Fehlschläge, ohne abzubrechen.

Schreibe den handgeschriebenen **Spy** \`RecordingEmailSender implements EmailSender\`:
- zeichnet jede **erfolgreiche** Sendung auf: \`sentTo()\` liefert die Empfänger in Aufrufreihenfolge (unveränderliche Kopie), \`count()\` die Anzahl.
- \`wasSentTo(email)\` → \`true\`, falls an diese Adresse gesendet wurde.
- \`failFor(email)\` konfiguriert eine Adresse, bei der \`send\` eine \`MailException\` wirft (simuliert einen kaputten Mailserver). Fehlgeschlagene Sendungen werden **nicht** aufgezeichnet.`,
      given: `record Subscriber(String email, boolean active) {}

class MailException extends RuntimeException {
    MailException(String msg) { super(msg); }
}

interface EmailSender {
    void send(String to, String subject);
}

record NewsletterResult(int sent, int failed) {}

class NewsletterService {
    private final EmailSender sender;
    NewsletterService(EmailSender sender) { this.sender = sender; }

    NewsletterResult publish(List<Subscriber> subscribers, String subject) {
        int sent = 0;
        int failed = 0;
        Set<String> seen = new HashSet<>();
        for (Subscriber s : subscribers) {
            if (!s.active() || !seen.add(s.email().toLowerCase())) {
                continue;
            }
            try {
                sender.send(s.email(), subject);
                sent++;
            } catch (MailException e) {
                failed++;
            }
        }
        return new NewsletterResult(sent, failed);
    }
}`,
      starter: `class RecordingEmailSender implements EmailSender {

    void failFor(String email) {
        // TODO
    }

    @Override
    public void send(String to, String subject) {
        // TODO: aufzeichnen oder MailException werfen
    }

    List<String> sentTo() {
        // TODO
        return List.of();
    }

    int count() {
        // TODO
        return 0;
    }

    boolean wasSentTo(String email) {
        // TODO
        return false;
    }
}`,
      solution: `class RecordingEmailSender implements EmailSender {

    private final List<String> recipients = new ArrayList<>();
    private final Set<String> failing = new HashSet<>();

    void failFor(String email) {
        failing.add(email);
    }

    @Override
    public void send(String to, String subject) {
        if (failing.contains(to)) {
            throw new MailException("cannot send to " + to);
        }
        recipients.add(to);
    }

    List<String> sentTo() {
        return List.copyOf(recipients);
    }

    int count() {
        return recipients.size();
    }

    boolean wasSentTo(String email) {
        return recipients.contains(email);
    }
}`,
      hints: [
        'Ein Spy braucht Zustand: eine Liste der Empfänger und eine Menge der Adressen, die fehlschlagen sollen.',
        'In `send` zuerst prüfen, ob die Adresse fehlschlagen soll (Guard Clause mit `throw`), erst danach aufzeichnen.',
        '`sentTo()` sollte `List.copyOf(...)` zurückgeben, damit der Test den internen Zustand nicht verändern kann.',
      ],
      tests: `var spy = new RecordingEmailSender();
var service = new NewsletterService(spy);
var subs = List.of(
    new Subscriber("ada@x.de", true),
    new Subscriber("bob@x.de", false),
    new Subscriber("cy@x.de", true),
    new Subscriber("ADA@x.de", true));
NewsletterResult r = service.publish(subs, "News");
check("nur aktive, ohne Duplikate", List.of("ada@x.de", "cy@x.de"), spy.sentTo());
check("count", 2, spy.count());
check("Ergebnis sent", 2, r.sent());
check("inaktiver bekommt nichts", false, spy.wasSentTo("bob@x.de"));
check("wasSentTo positiv", true, spy.wasSentTo("cy@x.de"));
var failing = new RecordingEmailSender();
failing.failFor("cy@x.de");
NewsletterResult r2 = new NewsletterService(failing).publish(subs, "News");
check("Fehlschlag wird gezählt", new NewsletterResult(1, 1), r2);
check("Fehlschlag nicht aufgezeichnet", List.of("ada@x.de"), failing.sentTo());
checkThrows("send wirft direkt MailException", MailException.class, () -> failing.send("cy@x.de", "x"));
checkThrows("sentTo ist unveränderlich", UnsupportedOperationException.class, () -> spy.sentTo().add("hack"));
check("leere Liste", new NewsletterResult(0, 0), new NewsletterService(new RecordingEmailSender()).publish(List.of(), "x"));`,
    },
    {
      id: 'k4',
      title: 'Write & Compare: UserService-Test mit JUnit 5, Mockito, AssertJ',
      level: 4,
      description: `Schreibe von Hand eine vollständige Testklasse \`UserServiceTest\` für den folgenden Service (Code steht im Editor als Kommentar). Anforderungen:

- \`@ExtendWith(MockitoExtension.class)\`, \`@Mock\` für \`UserRepository\` und \`EmailSender\`, \`@InjectMocks\` für den Service
- Test 1: erfolgreiche Registrierung → Response geprüft, gespeicherter User per \`ArgumentCaptor\` geprüft (E-Mail normalisiert auf lowercase), Welcome-Mail verifiziert
- Test 2: doppelte E-Mail → \`DuplicateEmailException\`, **kein** \`save\`, **keine** Mail
- Test 3: \`getById\` für unbekannte id → \`UserNotFoundException\` mit id in der Message
- Test 4: parametrisierter Test für ungültige E-Mails (\`""\`, \`" "\`, \`"no-at"\`) → \`IllegalArgumentException\`
- AAA-Struktur, sprechende Testnamen, AssertJ statt \`assertEquals\`

Dieser Kata wird nicht automatisch geprüft – vergleiche mit der Referenzlösung.`,
      starter: `// Zu testender Code:
//
// @Service
// public class UserService {
//     private final UserRepository repository;
//     private final EmailSender emailSender;
//
//     public UserService(UserRepository repository, EmailSender emailSender) { ... }
//
//     public UserResponse register(CreateUserRequest request) {
//         String email = request.email() == null ? "" : request.email().trim().toLowerCase();
//         if (email.isBlank() || !email.contains("@")) throw new IllegalArgumentException("invalid email");
//         if (repository.existsByEmail(email)) throw new DuplicateEmailException(email);
//         User saved = repository.save(new User(email, request.name()));
//         emailSender.sendWelcome(saved.getEmail());
//         return new UserResponse(saved.getId(), saved.getEmail(), saved.getName());
//     }
//
//     public UserResponse getById(Long id) {
//         User user = repository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
//         return new UserResponse(user.getId(), user.getEmail(), user.getName());
//     }
// }

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    // TODO: @Mock, @InjectMocks

    // TODO: Tests
}`,
      solution: `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository repository;

    @Mock
    EmailSender emailSender;

    @InjectMocks
    UserService service;

    @Test
    void shouldRegisterUserWithNormalizedEmailAndSendWelcomeMail() {
        // Arrange
        var request = new CreateUserRequest("  Ada@Example.COM ", "Ada");
        when(repository.existsByEmail("ada@example.com")).thenReturn(false);
        when(repository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        // Act
        UserResponse response = service.register(request);

        // Assert
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("ada@example.com");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("ada@example.com");
        assertThat(captor.getValue().getName()).isEqualTo("Ada");

        verify(emailSender).sendWelcome("ada@example.com");
    }

    @Test
    void shouldRejectDuplicateEmailWithoutSavingOrMailing() {
        // Arrange
        when(repository.existsByEmail("ada@example.com")).thenReturn(true);

        // Act + Assert
        assertThatThrownBy(() -> service.register(new CreateUserRequest("ada@example.com", "Ada")))
            .isInstanceOf(DuplicateEmailException.class);

        verify(repository, never()).save(any());
        verifyNoInteractions(emailSender);
    }

    @Test
    void shouldThrowNotFoundForUnknownId() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining("99");
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "no-at"})
    void shouldRejectInvalidEmails(String email) {
        assertThatThrownBy(() -> service.register(new CreateUserRequest(email, "Ada")))
            .isInstanceOf(IllegalArgumentException.class);

        verifyNoInteractions(repository, emailSender);
    }
}`,
      hints: [
        'Gerüst: drei Felder (`@Mock` Repository, `@Mock` EmailSender, `@InjectMocks` Service), dann ein Test pro Verhalten.',
        '`save` muss etwas zurückgeben: `thenAnswer(inv -> inv.getArgument(0))` gibt das übergebene Objekt zurück (optional id setzen).',
        'Für den gespeicherten User: `ArgumentCaptor.forClass(User.class)` + `verify(repository).save(captor.capture())`. Für "nichts passiert": `never()` bzw. `verifyNoInteractions`.',
        'Parametrisiert: `@ParameterizedTest` + `@ValueSource(strings = {...})`, Methode bekommt `String email` als Parameter. Kein Stubbing nötig – sonst `UnnecessaryStubbingException`.',
      ],
    },
  ],
}

export default chapter
