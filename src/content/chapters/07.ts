import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '07',
  flashcards: [
    { id: 'f1', front: 'Was generiert der Compiler für `record Money(BigDecimal amount, String currency) {}`?', back: 'Zwei `private final` Felder, den kanonischen Konstruktor, die Accessoren `amount()`/`currency()`, sowie `equals`, `hashCode` und `toString` – komponentenweise. Die Klasse ist implizit `final`.' },
    { id: 'f2', front: 'Wie heißen die Accessoren eines Records?', back: 'Wie die Komponente: `amount()`, **nicht** `getAmount()`. JavaBean-Namen künstlich nachzubauen ist unnötig.' },
    { id: 'f3', front: 'Was ist der kompakte Konstruktor?', back: '```java\nrecord Money(BigDecimal amount) {\n    Money {\n        if (amount.signum() < 0) throw new IllegalArgumentException();\n        amount = amount.abs();   // Parameter, nicht this.amount!\n    }\n}\n```\nDie Feldzuweisung macht der Compiler danach automatisch.' },
    { id: 'f4', front: 'Warum ist `this.amount = ...` im kompakten Konstruktor ein Compilefehler?', back: 'Der kompakte Konstruktor arbeitet ausschließlich auf den **Parametern**. Die Zuweisung an die Felder wird am Ende automatisch ergänzt – eine eigene Zuweisung wäre doppelt.' },
    { id: 'f5', front: 'Sind Records automatisch immutable?', back: 'Nein – nur die **Referenzen** sind final. Eine `List`-Komponente bleibt veränderbar, wenn du nicht defensiv kopierst: `members = List.copyOf(members);` im kompakten Konstruktor.' },
    { id: 'f6', front: 'Was macht `List.copyOf` besser als `new ArrayList<>(..)`?', back: '`copyOf` kopiert **und** liefert eine unveränderliche Liste. `new ArrayList<>(..)` kopiert nur – der Inhalt bleibt danach veränderbar.' },
    { id: 'f7', front: 'Warum ist `record Money(BigDecimal amount)` bei `equals` heikel?', back: '`new BigDecimal("10.0").equals(new BigDecimal("10"))` ist `false` (unterschiedliche Skalierung). Im kompakten Konstruktor normalisieren: `setScale(2, RoundingMode.HALF_UP)` oder `stripTrailingZeros()`.' },
    { id: 'f8', front: 'Warum vergleicht `record Snapshot(byte[] data)` falsch?', back: 'Das generierte `equals` nutzt bei Arrays den **Referenzvergleich**. Entweder `equals`/`hashCode` mit `Arrays.equals` selbst überschreiben oder eine `List<Byte>`/einen Wrapper verwenden.' },
    { id: 'f9', front: 'Was ist das "wither"-Muster?', back: 'Statt Setter eine Methode, die ein **neues** Objekt mit einem geänderten Feld liefert:\n```java\nUser withEmail(String email) {\n    return new User(id, name, email, active);\n}\n```' },
    { id: 'f10', front: 'Wofür eine statische Factory statt `new`?', back: 'Sprechender Name (`Money.euro(10)`, `Email.of(raw)`), Vorverarbeitung (trimmen), Caching, und der Konstruktor kann `private` bleiben.' },
    { id: 'f11', front: 'Wie modellierst du „Erfolg, Abgelehnt oder Fehler" typsicher?', back: '```java\nsealed interface PaymentResult permits Success, Declined, Failed {}\nrecord Success(String id) implements PaymentResult {}\n```\nDann `switch` über den Typ – exhaustiv, ohne `default`.' },
    { id: 'f12', front: 'Was sind Record Patterns?', back: 'Dekonstruktion im `switch`/`instanceof`:\n```java\ncase Success(String id, BigDecimal amount) -> id + amount;\n```\nDie Komponenten werden direkt an Variablen gebunden (Java 21).' },
    { id: 'f13', front: 'Was darf ein Record **nicht**?', back: 'Erben (`extends`) – er ist implizit `final` und erbt von `java.lang.Record`. Und keine zusätzlichen **Instanz**felder. Interfaces implementieren, statische Felder und Methoden sind erlaubt.' },
    { id: 'f14', front: 'Warum ist ein Record keine gute JPA-Entity?', back: 'JPA braucht einen No-Arg-Konstruktor, veränderliche Felder und muss Proxies ableiten können. Records sind final und immutable – sie sind die **DTO**-Seite, nicht die Persistenzseite.' },
    { id: 'f15', front: 'Warum sind immutable Objekte threadsicher?', back: 'Der Zustand steht nach dem Konstruktor fest. Es gibt keinen sichtbaren Zustandswechsel, also keine Race Conditions und keine Synchronisation.' },
    { id: 'f16', front: 'Unterschied `List.of(..)` und `Collections.unmodifiableList(list)`?', back: '`List.of` ist eine eigenständige unveränderliche Liste (keine `null`-Elemente erlaubt). `unmodifiableList` ist nur eine **View** – Änderungen an der Originalliste schlagen durch.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Warum kompiliert das nicht?',
      code: `record Money(BigDecimal amount) {
    Money {
        this.amount = amount.abs();
    }
}`,
      options: [
        'Records dürfen keinen Konstruktor haben',
        'Im kompakten Konstruktor wird der **Parameter** zugewiesen, nicht das Feld – `this.amount = ..` ist verboten',
        '`abs()` gibt es auf `BigDecimal` nicht',
        'Der Konstruktor muss `public` sein',
      ],
      correct: 1,
      explanation: 'Der kompakte Konstruktor arbeitet auf den Parametern; die Feldzuweisung ergänzt der Compiler. Korrekt ist `amount = amount.abs();`.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `record Team(String name, List<String> members) {}

var list = new ArrayList<>(List.of("Jan"));
var team = new Team("A", list);
list.add("Hacker");
System.out.println(team.members());`,
      options: ['`[Jan]`', '`[Jan, Hacker]`', '`UnsupportedOperationException`', '`[]`'],
      correct: 1,
      explanation: 'Der Record speichert nur die **Referenz**. Ohne `members = List.copyOf(members);` im kompakten Konstruktor ist er nur scheinbar immutable.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `record Money(BigDecimal amount) {}
System.out.println(new Money(new BigDecimal("10.0"))
    .equals(new Money(new BigDecimal("10"))));`,
      options: ['`true`', '`false`', 'Compilefehler', '`NullPointerException`'],
      correct: 1,
      explanation: '`BigDecimal.equals` berücksichtigt die Skalierung: `10.0` ≠ `10`. Deshalb im kompakten Konstruktor normalisieren (`setScale` oder `stripTrailingZeros`).',
    },
    {
      id: 'q4',
      prompt: 'Warum kompiliert das nicht?',
      code: `record Point(int x, int y) {
    private int cachedDistance;
}`,
      options: [
        'Records dürfen keine `private` Member haben',
        'Records dürfen keine zusätzlichen **Instanz**felder deklarieren – nur statische',
        '`int` ist als Komponententyp nicht erlaubt',
        'Es fehlt der kanonische Konstruktor',
      ],
      correct: 1,
      explanation: 'Der Zustand eines Records ist exakt seine Komponentenliste. Zusätzliche Instanzfelder würden diese Transparenz brechen – `static final` ist dagegen erlaubt.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Bug?',
      code: `record Snapshot(byte[] data) {}

var a = new Snapshot(new byte[] {1, 2});
var b = new Snapshot(new byte[] {1, 2});
System.out.println(a.equals(b));`,
      options: [
        'Nichts – Ausgabe ist `true`',
        'Ausgabe ist `false`: das generierte `equals` vergleicht Arrays per Referenz',
        'Es kompiliert nicht, Arrays sind keine gültigen Komponenten',
        'Es wirft eine `ArrayStoreException`',
      ],
      correct: 1,
      explanation: 'Für Referenztypen nutzt das generierte `equals` `Objects.equals` – bei Arrays ist das Identitätsvergleich. Entweder `equals`/`hashCode` selbst mit `Arrays.equals` schreiben oder keinen Array als Komponente verwenden.',
    },
    {
      id: 'q6',
      prompt: 'Welche Variante ist Clean Code?',
      options: [
        '`record User(Long id, String email) { void setEmail(String e) { } }`',
        '`record User(Long id, String email) { User withEmail(String e) { return new User(id, e); } }`',
        '`class User { public Long id; public String email; }`',
        '`record User(Long id, String email) { String getEmail() { return email; } }`',
      ],
      correct: 1,
      explanation: 'Immutable heißt: Änderung erzeugt ein neues Objekt. Ein Setter kann die finalen Felder gar nicht ändern, und `getEmail()` dupliziert nur den vorhandenen Accessor `email()`.',
    },
    {
      id: 'q7',
      prompt: 'Warum kompiliert das nicht?',
      code: `abstract class Base {}
record Point(int x, int y) extends Base {}`,
      options: [
        'Records können nicht erben – sie sind implizit `final` und erben von `java.lang.Record`',
        '`abstract class` darf nicht Basisklasse sein',
        'Der Record braucht einen expliziten Konstruktor',
        '`extends` muss vor der Komponentenliste stehen',
      ],
      correct: 0,
      explanation: 'Records können nur Interfaces implementieren (`implements`). Für gemeinsame Obertypen nimmt man ein `sealed interface`.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double a) implements Shape {}

Shape s = new Circle(2);
System.out.println(switch (s) {
    case Circle(double r) -> "kreis " + r;
    case Square(double a) -> "quadrat " + a;
});`,
      options: ['`kreis 2.0`', '`kreis 2`', 'Compilefehler – `default` fehlt', '`Circle[r=2.0]`'],
      correct: 0,
      explanation: 'Bei einem `sealed` Typ mit allen abgedeckten Fällen ist das `switch` exhaustiv – kein `default` nötig. Das Record Pattern bindet `r` als `double`, die Konkatenation ergibt `2.0`.',
    },
    {
      id: 'q9',
      prompt: 'Was passiert hier?',
      code: `record Config(Map<String, String> values) {
    Config { values = Map.copyOf(values); }
}
var c = new Config(new HashMap<>(Map.of("a", "1")));
c.values().put("b", "2");`,
      options: [
        'Die Map enthält danach zwei Einträge',
        '`UnsupportedOperationException`',
        'Compilefehler',
        'Die Änderung wirkt nur auf die Originalmap',
      ],
      correct: 1,
      explanation: '`Map.copyOf` liefert eine unveränderliche Kopie. Jeder Schreibversuch wirft `UnsupportedOperationException` – genau das ist der Sinn der defensiven Kopie.',
    },
    {
      id: 'q10',
      prompt: 'Welche Aussage über Records stimmt?',
      options: [
        'Ein Record eignet sich gut als JPA-`@Entity`',
        'Die Validierung im kompakten Konstruktor greift auch bei der Deserialisierung, weil diese über den kanonischen Konstruktor läuft',
        'Records generieren automatisch Setter',
        '`toString` eines Records muss man immer selbst schreiben',
      ],
      correct: 1,
      explanation: 'Record-Deserialisierung geht zwingend durch den kanonischen Konstruktor – ungültige Objekte können also auch von außen nicht entstehen. Für JPA fehlen No-Arg-Konstruktor und veränderbare Felder.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Value Object Money',
      level: 1,
      description: `Vervollständige den Record \`Money\`:

- kompakter Konstruktor: \`amount\` und \`currency\` dürfen nicht \`null\` sein (\`NullPointerException\`), \`amount\` nicht negativ und \`currency\` genau 3 Zeichen lang (sonst \`IllegalArgumentException\`)
- normalisiere: \`currency\` in Großbuchstaben, \`amount\` auf 2 Nachkommastellen (\`RoundingMode.HALF_UP\`)
- \`static Money euro(String amount)\`: erzeugt Betrag in \`"EUR"\`
- \`Money plus(Money other)\`: addiert; bei unterschiedlicher Währung \`IllegalArgumentException\``,
      starter: `record Money(BigDecimal amount, String currency) {

    // TODO: kompakter Konstruktor mit Validierung und Normalisierung

    static Money euro(String amount) {
        // TODO
        return new Money(new BigDecimal(amount), "EUR");
    }

    Money plus(Money other) {
        // TODO
        return this;
    }
}`,
      solution: `record Money(BigDecimal amount, String currency) {

    Money {
        Objects.requireNonNull(amount, "amount");
        Objects.requireNonNull(currency, "currency");
        if (amount.signum() < 0) {
            throw new IllegalArgumentException("amount must not be negative: " + amount);
        }
        if (currency.length() != 3) {
            throw new IllegalArgumentException("currency must be an ISO code: " + currency);
        }
        currency = currency.toUpperCase(Locale.ROOT);
        amount = amount.setScale(2, RoundingMode.HALF_UP);
    }

    static Money euro(String amount) {
        return new Money(new BigDecimal(amount), "EUR");
    }

    Money plus(Money other) {
        if (!currency.equals(other.currency())) {
            throw new IllegalArgumentException("currency mismatch: " + currency + " vs " + other.currency());
        }
        return new Money(amount.add(other.amount()), currency);
    }
}`,
      hints: [
        'Validierung und Normalisierung gehören in den kompakten Konstruktor – dann kann es kein ungültiges `Money` geben.',
        '`Objects.requireNonNull(x, "name")`, `BigDecimal.signum()`, `setScale(2, RoundingMode.HALF_UP)`, `String.toUpperCase(Locale.ROOT)`, `BigDecimal.add`.',
        'Money { requireNonNull...; if (signum < 0) throw; if (currency.length() != 3) throw; currency = uppercase; amount = setScale(2, HALF_UP); }',
        '`Money { ... amount = amount.setScale(2, RoundingMode.HALF_UP); }` – Parameter zuweisen, nie `this.amount`.',
      ],
      tests: `check("Betrag normalisiert", new BigDecimal("10.00"), Money.euro("10").amount());
check("Rundung", new BigDecimal("1.24"), Money.euro("1.235").amount());
check("Waehrung gross", "EUR", new Money(BigDecimal.ONE, "eur").currency());
check("equals trotz Skalierung", Money.euro("10"), Money.euro("10.000"));
check("plus", Money.euro("12.50"), Money.euro("10").plus(Money.euro("2.50")));
checkThrows("negativ", IllegalArgumentException.class, () -> Money.euro("-1"));
checkThrows("Waehrung zu lang", IllegalArgumentException.class, () -> new Money(BigDecimal.ONE, "EURO"));
checkThrows("amount null", NullPointerException.class, () -> new Money(null, "EUR"));
checkThrows("currency null", NullPointerException.class, () -> new Money(BigDecimal.ONE, null));
checkThrows("Waehrungen gemischt", IllegalArgumentException.class, () -> Money.euro("1").plus(new Money(BigDecimal.ONE, "USD")));`,
    },
    {
      id: 'k2',
      title: 'Defensive Kopien',
      level: 2,
      description: `Vervollständige \`Team\` so, dass es **wirklich** immutable ist:

- der Name darf nicht \`null\` sein
- \`members\` wird beim Erzeugen defensiv kopiert und ist von außen nicht veränderbar
- \`withMember(String member)\` liefert ein **neues** \`Team\` mit dem zusätzlichen Mitglied; das Original bleibt unverändert`,
      starter: `record Team(String name, List<String> members) {

    // TODO: kompakter Konstruktor mit defensiver Kopie

    Team withMember(String member) {
        // TODO
        return this;
    }

    int size() {
        return members.size();
    }
}`,
      solution: `record Team(String name, List<String> members) {

    Team {
        Objects.requireNonNull(name, "name");
        members = List.copyOf(members);
    }

    Team withMember(String member) {
        List<String> updated = new ArrayList<>(members);
        updated.add(member);
        return new Team(name, updated);
    }

    int size() {
        return members.size();
    }
}`,
      hints: [
        'Ein Record speichert nur die Referenz auf die übergebene Liste – wer sie außerhalb noch hält, kann den Record verändern.',
        '`List.copyOf(..)` kopiert und macht unveränderlich. Für `withMember` brauchst du eine temporäre `ArrayList`.',
        'Team { requireNonNull(name); members = List.copyOf(members); } – withMember: neue ArrayList aus members, add, neues Team zurückgeben.',
        '`Team { members = List.copyOf(members); }`',
      ],
      tests: `var mutable = new ArrayList<>(List.of("Jan"));
var team = new Team("Backend", mutable);
mutable.add("Hacker");
check("externe Aenderung wirkt nicht", List.of("Jan"), team.members());
checkThrows("Liste unveraenderlich", UnsupportedOperationException.class, () -> team.members().add("X"));
var bigger = team.withMember("Anna");
check("neues Team hat beide", List.of("Jan", "Anna"), bigger.members());
check("Original unveraendert", List.of("Jan"), team.members());
checkTrue("wirklich neues Objekt", team != bigger);
check("size", 2, bigger.size());
check("leeres Team", List.of(), new Team("Leer", List.of()).members());
check("equals komponentenweise", new Team("A", List.of("x")), new Team("A", List.of("x")));`,
    },
    {
      id: 'k3',
      title: 'Email als Value Object',
      level: 2,
      description: `Ersetze den "Primitive Obsession"-\`String\` durch einen echten Typ.

- kompakter Konstruktor: \`null\` → \`NullPointerException\`; ungültig → \`IllegalArgumentException\`. Ungültig heißt: nicht genau ein \`@\`, \`@\` ganz am Anfang oder Ende, oder ein Leerzeichen enthalten.
- normalisiere den Wert in Kleinbuchstaben
- \`static Email of(String raw)\`: trimmt zuerst und erzeugt dann
- \`localPart()\` → alles vor dem \`@\`, \`domain()\` → alles danach`,
      starter: `record Email(String value) {

    // TODO: kompakter Konstruktor mit Validierung und Kleinschreibung

    static Email of(String raw) {
        // TODO: trimmen
        return new Email(raw);
    }

    String localPart() {
        // TODO
        return "";
    }

    String domain() {
        // TODO
        return "";
    }
}`,
      solution: `record Email(String value) {

    Email {
        Objects.requireNonNull(value, "value");
        long at = value.chars().filter(c -> c == '@').count();
        if (at != 1 || value.startsWith("@") || value.endsWith("@") || value.contains(" ")) {
            throw new IllegalArgumentException("invalid email: " + value);
        }
        value = value.toLowerCase(Locale.ROOT);
    }

    static Email of(String raw) {
        return new Email(raw.trim());
    }

    String localPart() {
        return value.substring(0, value.indexOf('@'));
    }

    String domain() {
        return value.substring(value.indexOf('@') + 1);
    }
}`,
      hints: [
        'Die Regel „ein gültiges Objekt kann gar nicht erst entstehen" setzt du im kompakten Konstruktor um. Die Factory macht davor nur das Aufräumen (trimmen).',
        '`value.chars().filter(c -> c == \'@\').count()`, `startsWith`, `endsWith`, `contains`, `indexOf(\'@\')`, `substring`, `toLowerCase(Locale.ROOT)`.',
        'Email { requireNonNull; zähle @; if (count != 1 || startsWith("@") || endsWith("@") || contains(" ")) throw; value = lowercase; }',
        '`static Email of(String raw) { return new Email(raw.trim()); }`',
      ],
      tests: `check("normalisiert", "jan@example.com", Email.of("  Jan@Example.COM ").value());
check("localPart", "jan", Email.of("Jan@example.com").localPart());
check("domain", "example.com", Email.of("Jan@example.com").domain());
check("equals ignoriert Schreibweise", Email.of("A@B.de"), Email.of("a@b.de"));
checkThrows("kein @", IllegalArgumentException.class, () -> Email.of("jan.example.com"));
checkThrows("zwei @", IllegalArgumentException.class, () -> Email.of("a@b@c.de"));
checkThrows("@ am Anfang", IllegalArgumentException.class, () -> Email.of("@example.com"));
checkThrows("@ am Ende", IllegalArgumentException.class, () -> Email.of("jan@"));
checkThrows("Leerzeichen innen", IllegalArgumentException.class, () -> Email.of("a b@c.de"));
checkThrows("null", NullPointerException.class, () -> new Email(null));`,
    },
    {
      id: 'k4',
      title: 'Sum Type mit sealed interface',
      level: 3,
      description: `\`PaymentResult\` ist bereits als \`sealed interface\` mit drei Records vorgegeben. Implementiere in \`Solution\`:

- \`describe(PaymentResult result)\` → \`String\`:
  - \`Success\` → \`"ok <transactionId> <amount>"\`
  - \`Declined\` → \`"abgelehnt: <reason>"\`
  - \`Failed\` → \`"fehler <code>: <message>"\`
- \`totalSuccess(List<PaymentResult> results)\` → \`BigDecimal\`: Summe aller erfolgreichen Beträge, \`BigDecimal.ZERO\` bei keinem Erfolg
- \`isRetryable(PaymentResult result)\` → nur \`Failed\` ist wiederholbar

Nutze ein \`switch\` über den Typ – **ohne** \`default\`, damit der Compiler dich bei neuen Fällen zwingt.`,
      given: `sealed interface PaymentResult permits Success, Declined, Failed {}

record Success(String transactionId, BigDecimal amount) implements PaymentResult {}
record Declined(String reason) implements PaymentResult {}
record Failed(String code, String message) implements PaymentResult {}`,
      starter: `class Solution {

    static String describe(PaymentResult result) {
        // TODO
        return "";
    }

    static BigDecimal totalSuccess(List<PaymentResult> results) {
        // TODO
        return null;
    }

    static boolean isRetryable(PaymentResult result) {
        // TODO
        return false;
    }
}`,
      solution: `class Solution {

    static String describe(PaymentResult result) {
        return switch (result) {
            case Success(String id, BigDecimal amount) -> "ok " + id + " " + amount;
            case Declined(String reason) -> "abgelehnt: " + reason;
            case Failed(String code, String message) -> "fehler " + code + ": " + message;
        };
    }

    static BigDecimal totalSuccess(List<PaymentResult> results) {
        return results.stream()
            .filter(Success.class::isInstance)
            .map(Success.class::cast)
            .map(Success::amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    static boolean isRetryable(PaymentResult result) {
        return switch (result) {
            case Failed failed -> true;
            case Success success -> false;
            case Declined declined -> false;
        };
    }
}`,
      hints: [
        'Bei einem `sealed` Typ kennt der Compiler alle Implementierungen – das `switch` wird exhaustiv und braucht kein `default`.',
        'Record Patterns: `case Success(String id, BigDecimal amount) -> ...`. Für den Stream: `Success.class::isInstance` + `Success.class::cast` und `reduce(BigDecimal.ZERO, BigDecimal::add)`.',
        'describe: switch (result) { case Success(...) -> ...; case Declined(...) -> ...; case Failed(...) -> ...; }. totalSuccess: filter auf Success, cast, map(amount), reduce.',
        '`case Success(String id, BigDecimal amount) -> "ok " + id + " " + amount;`',
      ],
      tests: `PaymentResult ok = new Success("tx-1", new BigDecimal("10.00"));
PaymentResult declined = new Declined("limit erreicht");
PaymentResult failed = new Failed("E42", "timeout");
check("success", "ok tx-1 10.00", Solution.describe(ok));
check("declined", "abgelehnt: limit erreicht", Solution.describe(declined));
check("failed", "fehler E42: timeout", Solution.describe(failed));
check("summe", new BigDecimal("25.00"), Solution.totalSuccess(List.of(ok, declined, new Success("tx-2", new BigDecimal("15.00")), failed)));
check("summe ohne Erfolg", BigDecimal.ZERO, Solution.totalSuccess(List.of(declined, failed)));
check("summe leer", BigDecimal.ZERO, Solution.totalSuccess(List.of()));
checkTrue("failed ist retryable", Solution.isRetryable(failed));
checkTrue("success nicht retryable", !Solution.isRetryable(ok));
checkTrue("declined nicht retryable", !Solution.isRetryable(declined));`,
    },
    {
      id: 'k5',
      title: 'Immutable Order mit wither-Methoden',
      level: 4,
      description: `Baue ein vollständig immutables Bestellobjekt aus geschachtelten Records.

- kompakter Konstruktor: \`id\`, \`customer\` und \`status\` nicht \`null\` (\`NullPointerException\`), \`items\` defensiv kopieren
- \`static Order create(Long id, String customer, Address address)\`: leere Item-Liste, Status \`NEW\`
- \`withItem(String item)\`: neues \`Order\` mit einem zusätzlichen Item
- \`withStatus(OrderStatus newStatus)\`: neues \`Order\` mit geändertem Status
- \`movedTo(String street, String city, String zip)\`: neues \`Order\` mit neuer \`Address\`

Kein Aufruf darf das ursprüngliche Objekt verändern.`,
      given: `record Address(String street, String city, String zip) {}
enum OrderStatus { NEW, PAID, CANCELLED }`,
      starter: `record Order(Long id, String customer, Address address, List<String> items, OrderStatus status) {

    // TODO: kompakter Konstruktor

    static Order create(Long id, String customer, Address address) {
        // TODO
        return new Order(id, customer, address, new ArrayList<>(), OrderStatus.NEW);
    }

    Order withItem(String item) {
        // TODO
        return this;
    }

    Order withStatus(OrderStatus newStatus) {
        // TODO
        return this;
    }

    Order movedTo(String street, String city, String zip) {
        // TODO
        return this;
    }
}`,
      solution: `record Order(Long id, String customer, Address address, List<String> items, OrderStatus status) {

    Order {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(customer, "customer");
        Objects.requireNonNull(status, "status");
        items = List.copyOf(items);
    }

    static Order create(Long id, String customer, Address address) {
        return new Order(id, customer, address, List.of(), OrderStatus.NEW);
    }

    Order withItem(String item) {
        List<String> updated = new ArrayList<>(items);
        updated.add(item);
        return new Order(id, customer, address, updated, status);
    }

    Order withStatus(OrderStatus newStatus) {
        return new Order(id, customer, address, items, newStatus);
    }

    Order movedTo(String street, String city, String zip) {
        return new Order(id, customer, new Address(street, city, zip), items, status);
    }
}`,
      hints: [
        'Jede „Änderung" ist ein Aufruf des kanonischen Konstruktors mit genau einer ausgetauschten Komponente – alle anderen Felder reichst du unverändert durch.',
        '`Objects.requireNonNull`, `List.copyOf`, `new ArrayList<>(items)` als Zwischenschritt für `withItem`.',
        'Order { requireNonNull(id/customer/status); items = List.copyOf(items); } – withStatus: return new Order(id, customer, address, items, newStatus);',
        '`Order withItem(String item) { var updated = new ArrayList<>(items); updated.add(item); return new Order(id, customer, address, updated, status); }`',
      ],
      tests: `var address = new Address("Hauptstr. 1", "Dortmund", "44135");
var order = Order.create(1L, "Jan", address);
check("Startstatus", OrderStatus.NEW, order.status());
check("keine Items", List.of(), order.items());
var withItems = order.withItem("Buch").withItem("Stift");
check("Items ergaenzt", List.of("Buch", "Stift"), withItems.items());
check("Original unveraendert", List.of(), order.items());
checkThrows("Items unveraenderlich", UnsupportedOperationException.class, () -> withItems.items().add("X"));
var paid = withItems.withStatus(OrderStatus.PAID);
check("Status geaendert", OrderStatus.PAID, paid.status());
check("Items bleiben erhalten", List.of("Buch", "Stift"), paid.items());
check("alter Status unveraendert", OrderStatus.NEW, withItems.status());
var moved = paid.movedTo("Ring 5", "Essen", "45127");
check("neue Adresse", new Address("Ring 5", "Essen", "45127"), moved.address());
check("alte Adresse unveraendert", address, paid.address());
checkThrows("id null", NullPointerException.class, () -> new Order(null, "X", address, List.of(), OrderStatus.NEW));
checkThrows("status null", NullPointerException.class, () -> new Order(1L, "X", address, List.of(), null));`,
    },
  ],
}

export default chapter
