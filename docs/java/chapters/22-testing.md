# Kapitel 22 – Testing

## Mental Model

Ein Test ist eine **ausführbare Spezifikation von Verhalten**. Er beantwortet: "Wenn ich X mache, passiert Y" – nicht: "Die Methode ruft intern A, dann B auf".

```text
Unit Test         → eine Klasse, Abhängigkeiten ersetzt (Mock/Stub/Fake), schnell
Slice Test        → ein Spring-Layer (@WebMvcTest, @DataJpaTest), mittel
Integration Test  → ganzer Context (@SpringBootTest), langsam, realistisch
```

Testpyramide: viele Unit Tests, einige Slice Tests, wenige End-to-End Tests.

Jeder Test folgt **Arrange / Act / Assert** (Given / When / Then):

```java
@Test
void shouldApplyDiscountForPremiumCustomer() {
    // Arrange
    var customer = new Customer("Ada", Tier.PREMIUM);
    var calculator = new PriceCalculator();

    // Act
    BigDecimal price = calculator.priceFor(customer, new BigDecimal("100.00"));

    // Assert
    assertThat(price).isEqualByComparingTo("90.00");
}
```

Regel: **ein Verhalten pro Test**, Name beschreibt das Verhalten (`shouldThrowWhenEmailAlreadyExists`).

## Test Doubles – Mock vs Stub vs Fake vs Spy

| Double | Zweck | Beispiel |
|---|---|---|
| **Dummy** | wird nur übergeben, nie benutzt | `null`-Logger, leeres Objekt |
| **Stub** | liefert vorbereitete Antworten | `when(repo.findById(1L)).thenReturn(Optional.of(user))` |
| **Fake** | funktionierende, vereinfachte Implementierung | `InMemoryUserRepository` mit `HashMap` |
| **Spy** | zeichnet Aufrufe auf (oft echtes Objekt drunter) | zählender `EmailSender` |
| **Mock** | Erwartungen an Interaktionen werden verifiziert | `verify(sender).send(any())` |

Faustregel:
- **Queries** (liefern Daten) → stubben, nicht verifizieren.
- **Commands** (Seiteneffekte: E-Mail, Event, Save) → verifizieren.
- Fakes sind oft robuster als Mocks, weil sie Verhalten statt Aufrufe prüfen.

## JUnit 5 – Grundgerüst

```java
import org.junit.jupiter.api.*;
import static org.assertj.core.api.Assertions.*;

class PriceCalculatorTest {

    private PriceCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new PriceCalculator();
    }

    @Test
    @DisplayName("Standardkunde zahlt vollen Preis")
    void standardCustomerPaysFullPrice() { ... }

    @Test
    void shouldRejectNegativeAmount() {
        assertThatThrownBy(() -> calculator.priceFor(customer, new BigDecimal("-1")))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("negative");
    }
}
```

Testklassen und -methoden brauchen in JUnit 5 **kein** `public`.

## Parametrisierte Tests

```java
@ParameterizedTest
@CsvSource({
    "STANDARD, 100.00, 100.00",
    "PREMIUM,  100.00,  90.00",
    "VIP,      100.00,  80.00"
})
void priceDependsOnTier(Tier tier, BigDecimal input, BigDecimal expected) {
    var price = calculator.priceFor(new Customer("x", tier), input);
    assertThat(price).isEqualByComparingTo(expected);
}

@ParameterizedTest
@ValueSource(strings = {"", " ", "no-at-sign"})
void rejectsInvalidEmails(String email) {
    assertThat(validator.isValid(email)).isFalse();
}

@ParameterizedTest
@EnumSource(Tier.class)
void everyTierHasADiscount(Tier tier) { ... }

@ParameterizedTest
@MethodSource("orders")
void totals(Order order, BigDecimal expected) { ... }

static Stream<Arguments> orders() {
    return Stream.of(Arguments.of(order1, new BigDecimal("10.00")));
}
```

## AssertJ – die wichtigsten Assertions

```java
assertThat(name).isEqualTo("Ada").startsWith("A");
assertThat(list).hasSize(3).contains("a").doesNotContain("z");
assertThat(list).containsExactly("a", "b", "c");            // Reihenfolge!
assertThat(list).containsExactlyInAnyOrder("c", "a", "b");
assertThat(users).extracting(User::name).containsExactly("Ada", "Bob");
assertThat(optional).isPresent().contains(user);
assertThat(optional).isEmpty();
assertThat(amount).isEqualByComparingTo("10.00");            // BigDecimal!
assertThat(map).containsEntry("java", 2).hasSize(1);
assertThatThrownBy(() -> service.get(99L))
    .isInstanceOf(UserNotFoundException.class)
    .hasMessage("User 99 not found");
```

## Mockito – Service-Unit-Test

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository repository;
    @Mock EmailSender emailSender;
    @InjectMocks UserService service;   // Constructor Injection mit den Mocks

    @Test
    void shouldRegisterUserAndSendWelcomeMail() {
        // Arrange
        var request = new CreateUserRequest("ada@example.com", "Ada");
        when(repository.existsByEmail("ada@example.com")).thenReturn(false);
        when(repository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponse response = service.register(request);

        // Assert
        assertThat(response.email()).isEqualTo("ada@example.com");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Ada");
        verify(emailSender).sendWelcome("ada@example.com");
    }

    @Test
    void shouldRejectDuplicateEmail() {
        when(repository.existsByEmail("ada@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(new CreateUserRequest("ada@example.com", "Ada")))
            .isInstanceOf(DuplicateEmailException.class);

        verify(repository, never()).save(any());
        verifyNoInteractions(emailSender);
    }
}
```

Wichtige Mockito-APIs:

```java
when(mock.call(arg)).thenReturn(value);
when(mock.call(arg)).thenThrow(new RuntimeException());
doThrow(new X()).when(mock).voidMethod();      // für void-Methoden
verify(mock).call(arg);
verify(mock, times(2)).call(any());
verify(mock, never()).call(any());
verifyNoMoreInteractions(mock);
any(), anyLong(), eq(5L), argThat(u -> u.isActive())
```

Achtung: Wenn **ein** Argument ein Matcher ist, müssen **alle** Matcher sein: `verify(repo).find(eq(1L), any())`.

## Testbares Design: Zeit und Zufall injizieren

```java
// schwer testbar
boolean isExpired() { return expiresAt.isBefore(LocalDate.now()); }

// testbar
class SubscriptionService {
    private final Clock clock;
    SubscriptionService(Clock clock) { this.clock = clock; }
    boolean isExpired(Subscription s) { return s.expiresAt().isBefore(LocalDate.now(clock)); }
}

// im Test
var clock = Clock.fixed(Instant.parse("2025-01-15T10:00:00Z"), ZoneOffset.UTC);
var service = new SubscriptionService(clock);
```

Gleiches gilt für `UUID.randomUUID()` → `Supplier<UUID>`, `Random` → injizieren.

## Spring Test Slices

| Annotation | Lädt | Typischer Einsatz |
|---|---|---|
| `@WebMvcTest(UserController.class)` | nur Web-Layer (Controller, Advice, Jackson, Validation) | Status Codes, JSON, Validation; Service als `@MockitoBean` |
| `@DataJpaTest` | nur JPA (Entities, Repositories, embedded DB), transaktional mit Rollback | Custom Queries, Mappings |
| `@SpringBootTest` | kompletter ApplicationContext | Integrationstest, End-to-End mit `MockMvc`/`TestRestTemplate` |

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean UserService userService;   // vor Boot 3.4: @MockBean

    @Test
    void shouldReturn404WhenUserMissing() throws Exception {
        when(userService.get(99L)).thenThrow(new UserNotFoundException(99L));

        mockMvc.perform(get("/api/users/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturn400ForInvalidRequest() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email": "", "name": "Ada"}
                    """))
            .andExpect(status().isBadRequest());
    }
}

@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository repository;

    @Test
    void findsActiveUsersByDomain() {
        repository.save(new User("ada@acme.com", true));
        repository.save(new User("bob@other.com", true));

        assertThat(repository.findActiveByDomain("acme.com"))
            .extracting(User::getEmail)
            .containsExactly("ada@acme.com");
    }
}
```

## Verhalten statt Implementierung testen

```java
// schlecht: testet Implementierung, bricht bei jedem Refactoring
verify(repository).findAll();
verify(mapper, times(3)).toDto(any());

// gut: testet beobachtbares Ergebnis
assertThat(service.getActiveUsers())
    .extracting(UserDto::name)
    .containsExactly("Ada", "Bob");
```

Was testen? Business Logic, Edge Cases (leer, null, Grenzwerte), Validation, Error Handling, relevante Mappings. Nicht: triviale Getter, Framework-Code, private Methoden direkt.

## Häufige Fehler

- `assertEquals(new BigDecimal("10.0"), new BigDecimal("10.00"))` schlägt fehl → `isEqualByComparingTo`.
- Mocks für Value Objects / Records / Entities – einfach echte Objekte bauen.
- Alles verifizieren ("Over-Mocking") → Tests spiegeln die Implementierung.
- Queries verifizieren statt Ergebnis prüfen.
- Unnötige Stubbings → `UnnecessaryStubbingException` bei `MockitoExtension` (strict stubs).
- `@SpringBootTest` für alles → langsame Suite.
- `LocalDate.now()` im Produktivcode → nicht deterministisch.
- Mehrere Verhalten in einem Test → unklar, was kaputt ist.
- Matcher und Rohwerte mischen: `verify(repo).find(1L, any())` → `InvalidUseOfMatchersException`.
- `@InjectMocks` mit Feld-Injection statt Konstruktor → versteckte Abhängigkeiten.

## Interview-Details

- **Mock vs Stub**: Stub liefert Daten (State Verification), Mock prüft Interaktionen (Behavior Verification).
- **Warum Fakes?** Keine Kopplung an Aufrufreihenfolge, wiederverwendbar, prüfen echtes Verhalten (z. B. InMemoryRepository).
- **`@Mock` vs `@MockitoBean`**: `@Mock` ist reines Mockito (kein Spring), `@MockitoBean`/`@MockBean` ersetzt ein Bean im Spring Context.
- **`@DataJpaTest`** ist standardmäßig `@Transactional` → Rollback nach jedem Test.
- **`@WebMvcTest`** lädt keine Services/Repositories → diese müssen gemockt werden.
- **`ArgumentCaptor`** nutzen, wenn das Objekt im Service erzeugt wird und man dessen Inhalt prüfen will.
- **Testbarkeit** ist ein Design-Signal: schwer zu testen = zu viele Abhängigkeiten oder versteckte (statische) Abhängigkeiten.
- **Given/When/Then** = AAA mit BDD-Vokabular (`BDDMockito.given(...).willReturn(...)`, `then(mock).should()`).

## Zusammenfassung

```text
AAA, ein Verhalten pro Test, sprechender Name
Queries stubben, Commands verifizieren
Fakes > Mocks, wenn es einfach geht
Clock/Supplier injizieren statt now()/random
BigDecimal → isEqualByComparingTo
@WebMvcTest = Web, @DataJpaTest = JPA, @SpringBootTest = alles
Verhalten testen, nicht Implementierung
```
