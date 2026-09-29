import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '09',
  flashcards: [
    {
      id: 'f1',
      front: 'Was bedeutet **Encapsulation** konkret im Code?',
      back: 'Felder `private` (möglichst `final`), Zustand nur über fachliche Methoden ändern, die Invarianten prüfen (`deposit`, `withdraw` statt `setBalance`). Interne Collections nur als Kopie herausgeben.',
    },
    {
      id: 'f2',
      front: 'Overloading vs. Overriding – wann wird jeweils entschieden, welche Methode läuft?',
      back: '**Overloading**: Compilezeit, nach dem *statischen* Typ der Argumente.\n\n**Overriding**: Laufzeit (Dynamic Dispatch), nach dem *dynamischen* Typ des Empfängerobjekts.',
    },
    {
      id: 'f3',
      front: 'Interface vs. abstract class – drei Unterschiede?',
      back: '- Klasse kann **viele** Interfaces implementieren, aber nur **eine** Klasse erweitern\n- abstract class darf **Instanzfelder** und **Konstruktoren** haben\n- Interface = Rolle/Vertrag, abstract class = gemeinsame Basis mit Zustand',
    },
    {
      id: 'f4',
      front: 'Was bedeutet *Composition over Inheritance* und warum?',
      back: 'Verhalten durch **has-a** (Feld + Delegation) statt **is-a** (`extends`) wiederverwenden. Vererbung koppelt an Implementierungsdetails der Basisklasse (Fragile Base Class), Komposition ist austauschbar und testbar.',
    },
    {
      id: 'f5',
      front: 'Welche Regeln gelten beim Überschreiben einer Methode?',
      back: 'Gleiche Signatur, Sichtbarkeit **nicht einschränken**, keine neuen/breiteren **checked** Exceptions, Rückgabetyp darf **kovariant** (spezieller) sein. Immer `@Override` annotieren.',
    },
    {
      id: 'f6',
      front: 'Was ist ein `sealed interface` und was bringt es?',
      back: 'Eine Hierarchie mit abschließend bekannten Subtypen (`permits`). Der Compiler prüft `switch` auf **Exhaustiveness** – kein `default` nötig, neue Subtypen erzeugen Compilefehler an allen Stellen.\n\n```java\nsealed interface Shape permits Circle, Square {}\n```',
    },
    {
      id: 'f7',
      front: 'Was müssen permitted Subtypes einer `sealed`-Hierarchie sein?',
      back: '`final`, `sealed` oder `non-sealed`. Records und Enums sind implizit `final`.',
    },
    {
      id: 'f8',
      front: 'Der `equals`/`hashCode`-Vertrag?',
      back: 'Sind zwei Objekte `equals`, **müssen** sie denselben `hashCode` haben. Umgekehrt nicht nötig. Wer `equals` überschreibt, überschreibt `hashCode` – sonst brechen `HashSet`/`HashMap`.',
    },
    {
      id: 'f9',
      front: 'Idiomatisches `equals` in Java 21?',
      back: '```java\n@Override\npublic boolean equals(Object o) {\n    if (this == o) return true;\n    if (!(o instanceof Point other)) return false;\n    return x == other.x && y == other.y;\n}\n```',
    },
    {
      id: 'f10',
      front: 'Was bedeuten die vier Access Modifier?',
      back: '`private`: nur Klasse · *package-private* (kein Modifier): Package · `protected`: Package + Subklassen · `public`: alle.',
    },
    {
      id: 'f11',
      front: 'Warum keine überschreibbaren Methoden im Konstruktor aufrufen?',
      back: 'Der Basiskonstruktor läuft **vor** der Feldinitialisierung der Subklasse. Die überschriebene Methode sieht dann `null`/`0` in den Subklassen-Feldern.',
    },
    {
      id: 'f12',
      front: 'Zwei Interfaces haben dieselbe `default`-Methode `hello()`. Was muss die implementierende Klasse tun?',
      back: 'Sie **muss** `hello()` überschreiben (sonst Compilefehler) und kann gezielt delegieren:\n\n```java\n@Override public String hello() { return A.super.hello(); }\n```',
    },
    {
      id: 'f13',
      front: 'Was heißt *Tell, don\'t ask*?',
      back: 'Dem Objekt sagen, was es tun soll (`account.withdraw(x)`), statt seine Daten abzufragen und außerhalb zu entscheiden (`if (account.getBalance() ...) account.setBalance(...)`). Logik bleibt bei den Daten.',
    },
    {
      id: 'f14',
      front: 'Sind Felder polymorph?',
      back: 'Nein. Felder werden nach dem **statischen** Typ aufgelöst (Field Hiding). Nur Instanzmethoden werden dynamisch gebunden. Auch `static`-Methoden werden nur verdeckt, nicht überschrieben.',
    },
    {
      id: 'f15',
      front: 'Wie machst du eine Klasse unveränderlich (ohne Record)?',
      back: '`final class`, alle Felder `private final`, keine Setter, Validierung im Konstruktor, defensive Kopien von mutablen Parametern/Rückgaben (`List.copyOf`).',
    },
    {
      id: 'f16',
      front: 'Record Pattern im `switch` – Syntax?',
      back: '```java\nreturn switch (shape) {\n    case Circle c -> Math.PI * c.radius() * c.radius();\n    case Rectangle(double w, double h) -> w * h;\n};\n```',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `static String print(Object o) { return "Object"; }
static String print(String s) { return "String"; }

Object x = "hello";
System.out.println(print(x));`,
      options: ['`String`', '`Object`', 'Compilefehler: mehrdeutiger Aufruf', 'ClassCastException'],
      correct: 1,
      explanation: 'Overloading wird zur **Compilezeit** nach dem *statischen* Typ entschieden. `x` ist statisch `Object` → `print(Object)`.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `class A { String name = "A"; String who() { return "A"; } }
class B extends A { String name = "B"; @Override String who() { return "B"; } }

A a = new B();
System.out.println(a.name + a.who());`,
      options: ['`BB`', '`AA`', '`AB`', '`BA`'],
      correct: 2,
      explanation: 'Felder sind nicht polymorph: `a.name` nutzt den statischen Typ `A` → `"A"`. Methoden werden dynamisch gebunden: `who()` von `B` → `"B"`.',
    },
    {
      id: 'q3',
      prompt: 'Kompiliert dieser Code?',
      code: `sealed interface Payment permits Card, Paypal, Invoice {}
record Card(String number) implements Payment {}
record Paypal(String email) implements Payment {}
record Invoice(String iban) implements Payment {}

static String label(Payment p) {
    return switch (p) {
        case Card c -> "Card";
        case Paypal pp -> "PayPal";
    };
}`,
      options: [
        'Ja, `Invoice` liefert zur Laufzeit `null`',
        'Ja, aber zur Laufzeit fliegt bei `Invoice` eine `MatchException`',
        'Nein, der `switch` ist nicht exhaustive',
        'Nein, Records dürfen keine Interfaces implementieren',
      ],
      correct: 2,
      explanation: 'Ein `switch`-Ausdruck über einen `sealed`-Typ muss alle permitted Subtypen abdecken (oder `default` haben). `Invoice` fehlt → Compilefehler. Genau das ist der Vorteil von `sealed`.',
    },
    {
      id: 'q4',
      prompt: 'Welche Größe hat das Set?',
      code: `class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    public boolean equals(Point other) { return x == other.x && y == other.y; }
    @Override public int hashCode() { return Objects.hash(x, y); }
}

Set<Point> set = new HashSet<>();
set.add(new Point(1, 2));
set.add(new Point(1, 2));
System.out.println(set.size());`,
      options: ['`1`', '`0`', 'Compilefehler', '`2`'],
      correct: 3,
      explanation: '`equals(Point)` **überlädt** statt zu überschreiben (Parameter muss `Object` sein). `HashSet` ruft `equals(Object)` von `Object` auf → Identität → 2 Elemente. `@Override` hätte den Fehler zur Compilezeit gezeigt.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `abstract class Base {
    Base() { System.out.println(describe()); }
    abstract String describe();
}
class Child extends Base {
    private final String name = "child";
    private String label;
    Child() { label = "set"; }
    @Override String describe() { return label; }
}

new Child();`,
      options: ['`set`', '`null`', '`child`', 'NullPointerException'],
      correct: 1,
      explanation: 'Der `Base`-Konstruktor läuft vor dem Rumpf von `Child()`. `label` ist dann noch `null` → Ausgabe `null`. Deshalb keine überschreibbaren Methoden im Konstruktor aufrufen.',
    },
    {
      id: 'q6',
      prompt: 'Welche Aussage über `protected` ist korrekt?',
      options: [
        'Sichtbar im selben Package **und** in Subklassen (auch in anderen Packages)',
        'Sichtbar nur in Subklassen, nicht im Package',
        'Sichtbar nur in der Klasse selbst und inneren Klassen',
        'Wie `public`, aber nicht über Reflection zugreifbar',
      ],
      correct: 0,
      explanation: '`protected` ist *weiter* als package-private: Package-Zugriff plus Zugriff aus Subklassen in anderen Packages.',
    },
    {
      id: 'q7',
      prompt: 'Eine Klasse implementiert `interface A { default String hi() { return "A"; } }` und `interface B { default String hi() { return "B"; } }` ohne `hi()` zu überschreiben. Was passiert?',
      options: [
        'Es gewinnt das zuerst in `implements` genannte Interface',
        'Compilefehler – die Klasse muss `hi()` überschreiben',
        'Laufzeitfehler beim Aufruf von `hi()`',
        'Es gewinnt das zuletzt genannte Interface',
      ],
      correct: 1,
      explanation: 'Konflikt zweier Default-Methoden muss explizit aufgelöst werden: `@Override public String hi() { return A.super.hi(); }`.',
    },
    {
      id: 'q8',
      prompt: 'Welche Variante ist aus OOP-Sicht die beste?',
      code: `// (a)
if (account.getBalance().compareTo(amount) >= 0) {
    account.setBalance(account.getBalance().subtract(amount));
}
// (b)
account.withdraw(amount);  // prüft intern und wirft IllegalStateException
// (c)
AccountUtils.withdraw(account, amount);
// (d)
account.balance = account.balance.subtract(amount);`,
      options: ['(a) – explizit und lesbar', '(c) – Logik zentral in einer Utility', '(b) – Tell, don\'t ask', '(d) – am kürzesten'],
      correct: 2,
      explanation: '(b) hält die Invariante im Objekt (Encapsulation, Tell don\'t ask). (a) und (c) erzeugen ein Anemic Domain Model, (d) bricht die Kapselung komplett.',
    },
    {
      id: 'q9',
      prompt: '`class Stack<E> extends ArrayList<E>` – was ist das Hauptproblem?',
      options: [
        'Generics sind bei `extends` nicht erlaubt',
        '`ArrayList` ist `final`',
        'Es gibt keins – Wiederverwendung ist der Sinn von Vererbung',
        'Stack erbt `add(int, E)`, `remove(int)` usw. und kann seine LIFO-Invariante nicht schützen – Komposition wäre richtig',
      ],
      correct: 3,
      explanation: 'Ein Stack *ist keine* Liste mit beliebigem Zugriff. Durch Vererbung wird die gesamte List-API öffentlich. Besser: privates `Deque<E>`-Feld und nur `push`/`pop`/`peek` anbieten.',
    },
    {
      id: 'q10',
      prompt: 'Welcher Rückgabetyp ist beim Überschreiben von `Animal create()` in `class Dog extends Animal` erlaubt?',
      options: ['Nur `Animal`', '`Dog` (kovariant) oder `Animal`', '`Object`', 'Jeder Typ, solange die Parameter gleich sind'],
      correct: 1,
      explanation: 'Kovariante Rückgabetypen sind erlaubt: ein Subtyp des ursprünglichen Rückgabetyps. Ein Supertyp wie `Object` ist nicht erlaubt.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'BankAccount mit Invarianten',
      level: 1,
      description: `Implementiere \`BankAccount\` mit sauberer Kapselung:

- Konstruktor \`BankAccount(String iban)\`: \`null\` → \`NullPointerException\` (nutze \`Objects.requireNonNull\`)
- \`deposit(BigDecimal amount)\` und \`withdraw(BigDecimal amount)\`: \`null\` oder \`<= 0\` → \`IllegalArgumentException\`
- \`withdraw\` bei zu wenig Guthaben → \`IllegalStateException\`, Kontostand bleibt unverändert
- \`balance()\` und \`iban()\` als Getter, **keine** Setter`,
      starter: `class BankAccount {
    private BigDecimal balance = BigDecimal.ZERO;

    BankAccount(String iban) {
        // TODO
    }

    void deposit(BigDecimal amount) {
        // TODO
    }

    void withdraw(BigDecimal amount) {
        // TODO
    }

    BigDecimal balance() {
        return balance;
    }

    String iban() {
        // TODO
        return null;
    }
}`,
      solution: `class BankAccount {
    private final String iban;
    private BigDecimal balance = BigDecimal.ZERO;

    BankAccount(String iban) {
        this.iban = Objects.requireNonNull(iban, "iban");
    }

    void deposit(BigDecimal amount) {
        requirePositive(amount);
        balance = balance.add(amount);
    }

    void withdraw(BigDecimal amount) {
        requirePositive(amount);
        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }
        balance = balance.subtract(amount);
    }

    BigDecimal balance() {
        return balance;
    }

    String iban() {
        return iban;
    }

    private static void requirePositive(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}`,
      hints: [
        'Jede zustandsändernde Methode prüft zuerst ihre Vorbedingungen (Guard Clause) und ändert erst dann den Zustand.',
        '`BigDecimal.signum()` liefert -1/0/1, `compareTo` vergleicht Beträge. `Objects.requireNonNull(x, "msg")` wirft NPE.',
        'Extrahiere eine private Hilfsmethode `requirePositive(amount)`, die du in `deposit` und `withdraw` nutzt. In `withdraw` danach: wenn `balance < amount` → IllegalStateException.',
        '```java\nif (amount == null || amount.signum() <= 0) {\n    throw new IllegalArgumentException("Amount must be positive");\n}\n```',
      ],
      tests: `var acc = new BankAccount("DE123");
check("iban", "DE123", acc.iban());
acc.deposit(new BigDecimal("100"));
check("deposit", new BigDecimal("100"), acc.balance());
acc.withdraw(new BigDecimal("30"));
check("withdraw", new BigDecimal("70"), acc.balance());
checkThrows("negativer deposit", IllegalArgumentException.class, () -> acc.deposit(new BigDecimal("-1")));
checkThrows("withdraw 0", IllegalArgumentException.class, () -> acc.withdraw(BigDecimal.ZERO));
checkThrows("deposit null", IllegalArgumentException.class, () -> acc.deposit(null));
checkThrows("überziehen", IllegalStateException.class, () -> acc.withdraw(new BigDecimal("70.01")));
check("Kontostand nach fehlgeschlagenem withdraw unverändert", new BigDecimal("70"), acc.balance());
acc.withdraw(new BigDecimal("70"));
check("komplett abheben erlaubt", 0, acc.balance().signum());
checkThrows("iban null", NullPointerException.class, () -> new BankAccount(null));`,
    },
    {
      id: 'k2',
      title: 'Product: unveränderliche Identität, veränderlicher Preis',
      level: 2,
      description: `Implementiere \`Product\` (Kata aus KATAS.md):

- Felder \`id\` (long), \`name\` (String), \`price\` (BigDecimal), \`active\` (boolean) – **\`id\` und \`name\` müssen \`final\` sein**
- Konstruktor \`Product(long id, String name, BigDecimal price, boolean active)\`: \`name\` null/blank → \`IllegalArgumentException\`; Preis wie bei \`changePrice\` validieren
- \`changePrice(BigDecimal newPrice)\`: \`null\` oder negativ → \`IllegalArgumentException\` (0 ist erlaubt)
- \`deactivate()\`
- \`isAvailable()\`: aktiv **und** Preis > 0
- Getter \`id()\`, \`name()\`, \`price()\` – **keine** \`set...\`-Methoden`,
      starter: `class Product {
    private long id;
    private String name;
    private BigDecimal price;
    private boolean active;

    Product(long id, String name, BigDecimal price, boolean active) {
        // TODO
    }

    void changePrice(BigDecimal newPrice) {
        // TODO
    }

    void deactivate() {
        // TODO
    }

    boolean isAvailable() {
        // TODO
        return false;
    }

    long id() { return id; }
    String name() { return name; }
    BigDecimal price() { return price; }
}`,
      solution: `class Product {
    private final long id;
    private final String name;
    private BigDecimal price;
    private boolean active;

    Product(long id, String name, BigDecimal price, boolean active) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name must not be blank");
        }
        this.id = id;
        this.name = name;
        this.price = validPrice(price);
        this.active = active;
    }

    void changePrice(BigDecimal newPrice) {
        this.price = validPrice(newPrice);
    }

    void deactivate() {
        this.active = false;
    }

    boolean isAvailable() {
        return active && price.signum() > 0;
    }

    long id() { return id; }
    String name() { return name; }
    BigDecimal price() { return price; }

    private static BigDecimal validPrice(BigDecimal price) {
        if (price == null || price.signum() < 0) {
            throw new IllegalArgumentException("Price must be >= 0");
        }
        return price;
    }
}`,
      hints: [
        'Identität (`id`, `name`) wird einmal im Konstruktor gesetzt → `final`. Nur der Preis und der Status ändern sich – über fachliche Methoden.',
        'Konstruktor und `changePrice` haben dieselbe Preisregel → eine private statische Methode `validPrice(BigDecimal)`, die validiert und den Wert zurückgibt.',
        'Pseudocode: Konstruktor: Name prüfen → Felder setzen → `price = validPrice(price)`. `isAvailable`: `active && price > 0`.',
        '```java\nboolean isAvailable() {\n    return active && price.signum() > 0;\n}\n```',
      ],
      tests: `var p = new Product(1L, "Book", new BigDecimal("10"), true);
check("id", 1L, p.id());
check("name", "Book", p.name());
checkTrue("verfügbar", p.isAvailable());
p.changePrice(new BigDecimal("12.50"));
check("neuer Preis", new BigDecimal("12.50"), p.price());
p.changePrice(BigDecimal.ZERO);
checkTrue("Preis 0 -> nicht verfügbar", !p.isAvailable());
p.changePrice(BigDecimal.ONE);
p.deactivate();
checkTrue("deaktiviert -> nicht verfügbar", !p.isAvailable());
checkThrows("negativer Preis", IllegalArgumentException.class, () -> p.changePrice(new BigDecimal("-0.01")));
checkThrows("Preis null", IllegalArgumentException.class, () -> p.changePrice(null));
checkThrows("blank name", IllegalArgumentException.class, () -> new Product(2L, " ", BigDecimal.ONE, true));
checkThrows("negativer Preis im Konstruktor", IllegalArgumentException.class, () -> new Product(3L, "X", new BigDecimal("-1"), true));
checkTrue("id ist final", java.lang.reflect.Modifier.isFinal(Product.class.getDeclaredField("id").getModifiers()));
checkTrue("name ist final", java.lang.reflect.Modifier.isFinal(Product.class.getDeclaredField("name").getModifiers()));
checkTrue("keine Setter", Arrays.stream(Product.class.getDeclaredMethods()).noneMatch(m -> m.getName().startsWith("set")));`,
    },
    {
      id: 'k3',
      title: 'Sealed Shapes mit Pattern Matching',
      level: 3,
      description: `Gegeben ist eine \`sealed\`-Hierarchie \`Shape\`. Implementiere in \`Geometry\`:

- \`static double area(Shape shape)\` mit einem **\`switch\`-Ausdruck** (ohne \`default\`)
- \`static double totalArea(List<Shape> shapes)\` – Summe aller Flächen (leere Liste → 0)
- \`static Optional<Shape> largest(List<Shape> shapes)\` – Form mit größter Fläche`,
      given: `sealed interface Shape permits Circle, Rectangle, Square {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Square(double side) implements Shape {}`,
      starter: `class Geometry {
    static double area(Shape shape) {
        // TODO switch expression
        return 0;
    }

    static double totalArea(List<Shape> shapes) {
        // TODO
        return 0;
    }

    static Optional<Shape> largest(List<Shape> shapes) {
        // TODO
        return Optional.empty();
    }
}`,
      solution: `class Geometry {
    static double area(Shape shape) {
        return switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle(double width, double height) -> width * height;
            case Square s -> s.side() * s.side();
        };
    }

    static double totalArea(List<Shape> shapes) {
        return shapes.stream()
                .mapToDouble(Geometry::area)
                .sum();
    }

    static Optional<Shape> largest(List<Shape> shapes) {
        return shapes.stream()
                .max(Comparator.comparingDouble(Geometry::area));
    }
}`,
      hints: [
        'Polymorphie ohne Methoden in den Records: der `switch` über einen `sealed`-Typ ist exhaustive – jeder permitted Subtyp braucht einen `case`.',
        'Type Pattern `case Circle c ->` oder Record Pattern `case Rectangle(double w, double h) ->`. Für Summe: `mapToDouble(...).sum()`, für Maximum: `max(Comparator.comparingDouble(...))`.',
        'area: switch → Kreis πr², Rechteck w·h, Quadrat s². totalArea: stream → mapToDouble(area) → sum. largest: stream → max nach area.',
        '```java\nreturn switch (shape) {\n    case Circle c -> Math.PI * c.radius() * c.radius();\n    case Rectangle(double w, double h) -> w * h;\n    // Square ...\n};\n```',
      ],
      tests: `check("Rechteck", 6.0, Geometry.area(new Rectangle(2, 3)));
check("Quadrat", 16.0, Geometry.area(new Square(4)));
checkTrue("Kreis", Math.abs(Geometry.area(new Circle(1)) - Math.PI) < 1e-9);
check("totalArea leer", 0.0, Geometry.totalArea(List.of()));
check("totalArea", 22.0, Geometry.totalArea(List.of(new Rectangle(2, 3), new Square(4))));
check("largest", Optional.of(new Circle(3)), Geometry.largest(List.of(new Square(2), new Circle(3), new Rectangle(4, 5))));
check("largest leer", Optional.empty(), Geometry.largest(List.of()));`,
    },
    {
      id: 'k4',
      title: 'Money: equals & hashCode korrekt',
      level: 4,
      description: `Implementiere \`Money\` als unveränderliche Klasse (**kein Record**, zur Übung):

- Konstruktor \`Money(BigDecimal amount, String currency)\` – beide nicht \`null\` (\`NullPointerException\`)
- \`add(Money other)\`: gleiche Währung → neues \`Money\`, sonst \`IllegalArgumentException\`
- \`equals\`: gleiche Währung **und** betragsgleich **unabhängig von der Skalierung** (\`10.0 EUR\` equals \`10.00 EUR\`)
- \`hashCode\` konsistent zu \`equals\`
- \`toString()\` z. B. \`10.00 EUR\` (Betrag via \`toPlainString()\`)`,
      starter: `final class Money {
    private final BigDecimal amount;
    private final String currency;

    Money(BigDecimal amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    Money add(Money other) {
        // TODO
        return this;
    }

    // TODO equals, hashCode, toString
}`,
      solution: `final class Money {
    private final BigDecimal amount;
    private final String currency;

    Money(BigDecimal amount, String currency) {
        this.amount = Objects.requireNonNull(amount, "amount");
        this.currency = Objects.requireNonNull(currency, "currency");
    }

    Money add(Money other) {
        if (!currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch: " + currency + " vs " + other.currency);
        }
        return new Money(amount.add(other.amount), currency);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money other)) return false;
        return amount.compareTo(other.amount) == 0 && currency.equals(other.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount.stripTrailingZeros(), currency);
    }

    @Override
    public String toString() {
        return amount.toPlainString() + " " + currency;
    }
}`,
      hints: [
        '`BigDecimal.equals` berücksichtigt die Skalierung (`10.0` ≠ `10.00`), `compareTo` nicht. `hashCode` muss dieselbe Gleichheit abbilden.',
        '`o instanceof Money other` (Pattern Matching), `amount.compareTo(other.amount) == 0`, `amount.stripTrailingZeros()` normalisiert die Skalierung für den Hash.',
        'equals: identisch → true; kein Money → false; sonst compareTo == 0 && currency gleich. hashCode: `Objects.hash(normalisierter Betrag, currency)`.',
        '```java\n@Override\npublic int hashCode() {\n    return Objects.hash(amount.stripTrailingZeros(), currency);\n}\n```',
      ],
      tests: `var a = new Money(new BigDecimal("10.0"), "EUR");
var b = new Money(new BigDecimal("10.00"), "EUR");
checkTrue("equals ignoriert Skalierung", a.equals(b));
check("hashCode konsistent", a.hashCode(), b.hashCode());
check("HashSet dedupliziert", 1, new HashSet<>(List.of(a, b)).size());
checkTrue("andere Währung ungleich", !a.equals(new Money(new BigDecimal("10"), "USD")));
checkTrue("equals(null) false", !a.equals(null));
checkTrue("equals(String) false", !a.equals("10 EUR"));
check("add", new Money(new BigDecimal("15.5"), "EUR"), a.add(new Money(new BigDecimal("5.50"), "EUR")));
checkThrows("add mit anderer Währung", IllegalArgumentException.class, () -> a.add(new Money(BigDecimal.ONE, "USD")));
checkThrows("amount null", NullPointerException.class, () -> new Money(null, "EUR"));
check("toString", "10.00 EUR", b.toString());`,
    },
    {
      id: 'k5',
      title: 'Composition over Inheritance: CountingSet',
      level: 4,
      description: `Der Starter ist die klassische *Fragile Base Class*: \`CountingSet extends HashSet\` zählt bei \`addAll\` **doppelt**, weil \`HashSet.addAll\` intern \`add\` aufruft.

Baue \`CountingSet<E>\` per **Komposition** um (privates \`Set<E>\`-Feld, Delegation, **nicht** von \`HashSet\` erben):

- \`boolean add(E e)\`, \`boolean addAll(Collection<? extends E> c)\`, \`boolean contains(Object o)\`, \`int size()\`
- \`int addCount()\` – Anzahl aller **Einfügeversuche** (auch Duplikate zählen)`,
      starter: `class CountingSet<E> extends HashSet<E> {
    private int addCount = 0;

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);   // BUG: HashSet.addAll ruft add() auf
    }

    int addCount() {
        return addCount;
    }
}`,
      solution: `class CountingSet<E> {
    private final Set<E> delegate = new HashSet<>();
    private int addCount = 0;

    boolean add(E e) {
        addCount++;
        return delegate.add(e);
    }

    boolean addAll(Collection<? extends E> c) {
        addCount += c.size();
        return delegate.addAll(c);
    }

    boolean contains(Object o) {
        return delegate.contains(o);
    }

    int size() {
        return delegate.size();
    }

    int addCount() {
        return addCount;
    }
}`,
      hints: [
        'Vererbung koppelt dich an Implementierungsdetails der Basisklasse (welche Methode ruft welche intern auf). Komposition macht dich davon unabhängig.',
        'Ersetze `extends HashSet<E>` durch ein Feld `private final Set<E> delegate = new HashSet<>();` und leite jede Methode an `delegate` weiter.',
        'Pro Methode: Zähler anpassen (nur in `add`/`addAll`), dann `return delegate.xyz(...)`. `@Override` entfällt – es gibt keine Basisklasse mehr.',
        '```java\nboolean addAll(Collection<? extends E> c) {\n    addCount += c.size();\n    return delegate.addAll(c);\n}\n```',
      ],
      tests: `var set = new CountingSet<String>();
set.addAll(List.of("a", "b", "c"));
check("addAll zählt einfach", 3, set.addCount());
check("size", 3, set.size());
set.add("a");
check("Duplikat zählt als Versuch", 4, set.addCount());
check("Duplikat ändert size nicht", 3, set.size());
checkTrue("contains", set.contains("b"));
checkTrue("contains nicht", !set.contains("z"));
check("add Rückgabe bei Duplikat", false, set.add("a"));
checkTrue("keine Vererbung von HashSet", !(((Object) set) instanceof HashSet));`,
    },
  ],
}

export default chapter
