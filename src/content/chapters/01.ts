import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    { id: 'f1', front: 'Unterschied `int` vs. `Integer`?', back: '`int` ist primitiv (Default `0`, nie `null`), `Integer` ist ein Wrapper-Objekt (kann `null` sein, nötig für Generics wie `List<Integer>`). Unboxing von `null` → `NullPointerException`.' },
    { id: 'f2', front: 'Warum ist `name == "Jan"` problematisch?', back: '`==` vergleicht bei Objekten **Referenzen**, nicht Inhalte. Richtig: `"Jan".equals(name)` (null-safe) oder `Objects.equals(name, "Jan")`.' },
    { id: 'f3', front: 'Was bedeutet `final` bei einem Feld – und was nicht?', back: 'Die Referenz wird genau einmal gesetzt (im Konstruktor) und nie neu zugewiesen. Es macht das Objekt dahinter **nicht** immutable: `final List<String> l` kann weiter `l.add(..)`.' },
    { id: 'f4', front: 'Syntax einer Switch Expression mit mehreren Labels und Block?', back: '```java\nString s = switch (status) {\n    case NEW, PAID -> "offen";\n    case CANCELLED -> {\n        log();\n        yield "storniert";\n    }\n    default -> "?";\n};\n```' },
    { id: 'f5', front: 'Wann muss eine Switch Expression einen `default` haben?', back: 'Wenn die Fälle nicht **exhaustive** sind. Bei Enums (alle Konstanten abgedeckt) und sealed Types (alle Subtypen abgedeckt) ist kein `default` nötig – und besser keiner, damit neue Werte einen Compile-Fehler auslösen.' },
    { id: 'f6', front: 'Pattern Matching für `instanceof` (Java 16)?', back: '```java\nif (obj instanceof String s && !s.isBlank()) {\n    return s.length();\n}\n```\nKein expliziter Cast mehr; `s` ist nur im true-Zweig im Scope.' },
    { id: 'f7', front: 'Was ist ein Guard in einem Pattern-`switch`?', back: 'Eine Zusatzbedingung mit `when`: `case Integer i when i > 100 -> "groß";`. Speziellere Cases müssen **vor** allgemeineren stehen, sonst Compile-Fehler (dominated label).' },
    { id: 'f8', front: 'Der `equals`/`hashCode`-Vertrag in einem Satz?', back: 'Wenn `a.equals(b)` true ist, **muss** `a.hashCode() == b.hashCode()` gelten. Umgekehrt nicht (Kollisionen erlaubt). Immer beide zusammen überschreiben.' },
    { id: 'f9', front: 'Warum ist `Integer a = 1000, b = 1000; a == b` false?', back: 'Der Integer-Cache umfasst nur `-128..127`. Außerhalb sind es verschiedene Objekte → Referenzvergleich false. Immer `equals` verwenden.' },
    { id: 'f10', front: 'Was ergibt `double d = 7 / 2;`?', back: '`3.0` – beide Operanden sind `int`, also Integer-Division **vor** der Umwandlung. Fix: `7 / 2.0` oder `(double) 7 / 2`.' },
    { id: 'f11', front: 'Warum `BigDecimal` statt `double` für Geld – und wie konstruieren?', back: '`double` ist binäre Gleitkommazahl (`0.1 + 0.2 != 0.3`). `new BigDecimal("0.10")` bzw. `BigDecimal.valueOf(0.1)` – **nicht** `new BigDecimal(0.1)`. Vergleich mit `compareTo`, weil `equals` die Scale beachtet.' },
    { id: 'f12', front: 'Wann ist `var` gut, wann schlecht?', back: 'Gut, wenn der Typ rechts offensichtlich ist: `var users = new ArrayList<User>();`. Schlecht, wenn er versteckt wird: `var r = service.execute();`. Nur für lokale Variablen.' },
    { id: 'f13', front: 'Ist Java pass-by-reference?', back: 'Nein, immer **pass-by-value**. Bei Objekten wird die Referenz kopiert: Die Methode kann das Objekt mutieren, aber die Variable des Aufrufers nicht auf ein anderes Objekt umbiegen.' },
    { id: 'f14', front: 'Enum mit Feld und Konstruktor – Syntax?', back: '```java\nenum Status {\n    ACTIVE("aktiv"), BLOCKED("gesperrt");\n    private final String label;\n    Status(String label) { this.label = label; }\n    String label() { return label; }\n}\n```' },
    { id: 'f15', front: 'Warum String-Konkatenation mit `+=` nicht in Schleifen?', back: 'Strings sind immutable, jedes `+=` erzeugt einen neuen String → O(n²). Besser `StringBuilder`, `String.join` oder `Collectors.joining`.' },
    { id: 'f16', front: '`isBlank()` vs. `isEmpty()`?', back: '`isEmpty()`: Länge 0. `isBlank()` (Java 11): leer **oder** nur Whitespace. `"  ".isEmpty() == false`, `"  ".isBlank() == true`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was gibt der Code aus?',
      code: `Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println((a == b) + " " + (c == d));`,
      options: ['`true true`', '`false false`', '`true false`', '`false true`'],
      correct: 2,
      explanation: 'Der Integer-Cache umfasst `-128..127`. `a` und `b` sind dasselbe gecachte Objekt, `c` und `d` sind verschiedene Objekte. Deshalb Wrapper immer mit `equals` vergleichen.',
    },
    {
      id: 'q2',
      prompt: 'Welcher Wert steht in `avg`?',
      code: `int sum = 7;
int count = 2;
double avg = sum / count;`,
      options: ['`3.5`', '`3.0`', '`4.0`', 'Compile-Fehler'],
      correct: 1,
      explanation: '`sum / count` ist Integer-Division (`3`), erst danach wird zu `double` erweitert. Fix: `(double) sum / count`.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Bug?',
      code: `Map<String, Integer> stock = new HashMap<>();
int apples = stock.get("apple");`,
      options: [
        '`HashMap` erlaubt keine String-Keys',
        '`get` auf leerer Map wirft `NoSuchElementException`',
        'Kein Bug, `apples` ist `0`',
        '`get` liefert `null`, das Unboxing zu `int` wirft eine `NullPointerException`',
      ],
      correct: 3,
      explanation: 'Fehlender Key → `null`. Das automatische Unboxing zu `int` wirft NPE. Fix: `stock.getOrDefault("apple", 0)`.',
    },
    {
      id: 'q4',
      prompt: 'Warum kompiliert diese Switch Expression nicht?',
      code: `enum Status { NEW, PAID, SHIPPED }

String label = switch (status) {
    case NEW -> "neu";
    case PAID -> "bezahlt";
};`,
      options: [
        'Switch Expressions brauchen `break`',
        'Sie ist nicht exhaustive – `SHIPPED` fehlt',
        'Enums sind in `switch` nicht erlaubt',
        'Es fehlt `yield` in jedem Fall',
      ],
      correct: 1,
      explanation: 'Eine Switch Expression muss einen Wert für jede mögliche Eingabe liefern. Bei Enums reicht es, alle Konstanten abzudecken – hier fehlt `SHIPPED`.',
    },
    {
      id: 'q5',
      prompt: 'Was gibt der Code aus?',
      code: `static void rename(StringBuilder sb) {
    sb.append("!");
    sb = new StringBuilder("neu");
}

var sb = new StringBuilder("Hallo");
rename(sb);
System.out.println(sb);`,
      options: ['`Hallo!`', '`neu`', '`Hallo`', '`neu!`'],
      correct: 0,
      explanation: 'Pass-by-value der Referenz: `append` mutiert das gemeinsame Objekt, die Neuzuweisung ändert nur die lokale Kopie der Referenz.',
    },
    {
      id: 'q6',
      prompt: 'Eine Klasse überschreibt nur `equals`, nicht `hashCode`. Was passiert?',
      code: `Set<Email> set = new HashSet<>();
set.add(new Email("a@b.de"));
set.add(new Email("a@b.de"));
System.out.println(set.size());`,
      options: [
        'Immer `1`, weil `equals` überschrieben ist',
        'Compile-Fehler',
        'Sehr wahrscheinlich `2`, weil die Objekte unterschiedliche Hashcodes haben',
        '`HashSet` wirft `IllegalStateException`',
      ],
      correct: 2,
      explanation: '`HashSet` sucht erst über `hashCode` den Bucket. Ohne überschriebenes `hashCode` (Identity-Hash) landen gleiche Objekte in verschiedenen Buckets → Duplikate.',
    },
    {
      id: 'q7',
      prompt: 'Was gibt `describe(150)` zurück?',
      code: `static String describe(Object o) {
    return switch (o) {
        case Integer i when i > 100 -> "groß";
        case Integer i -> "klein";
        case String s -> "text";
        default -> "?";
    };
}`,
      options: ['`"klein"`', '`"groß"`', '`"?"`', 'Compile-Fehler wegen doppeltem `Integer`-Case'],
      correct: 1,
      explanation: 'Cases werden von oben geprüft. Der Guard `when i > 100` greift. Zwei `Integer`-Cases sind erlaubt, solange der speziellere (mit Guard) zuerst kommt.',
    },
    {
      id: 'q8',
      prompt: 'Welche Variante ist Clean Code für einen Preis, der sich ändern darf, aber nie negativ sein soll?',
      options: [
        '`public BigDecimal price;`',
        '`private double price;` + `setPrice(double p)`',
        '`private BigDecimal price;` + `changePrice(BigDecimal p)` mit Validierung',
        '`private final BigDecimal price;` + Setter',
      ],
      correct: 2,
      explanation: 'Kapselung (private), passender Typ (BigDecimal) und eine sprechende Methode, die die Invariante schützt. `final` + Setter kompiliert nicht, `double` ist für Geld ungeeignet.',
    },
    {
      id: 'q9',
      prompt: 'Was ergibt `new BigDecimal("2.0").equals(new BigDecimal("2.00"))`?',
      options: ['`true`', '`false`', 'Compile-Fehler', '`ArithmeticException`'],
      correct: 1,
      explanation: '`BigDecimal.equals` vergleicht Wert **und** Scale (1 vs. 2). Für numerischen Vergleich `compareTo(..) == 0` verwenden.',
    },
    {
      id: 'q10',
      prompt: 'Welche `var`-Verwendung kompiliert?',
      options: [
        '`var x = null;`',
        '`private var name = "Jan";` (Feld)',
        '`var list = new ArrayList<String>();`',
        '`var a = 1, b = 2;`',
      ],
      correct: 2,
      explanation: '`var` ist nur für lokale Variablen mit Initialisierer erlaubt, aus dem ein Typ ableitbar ist. `null` hat keinen Typ, Felder und Mehrfachdeklarationen sind verboten.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Product mit Invarianten',
      level: 1,
      description: `Implementiere die Klasse \`Product\`:

- Konstruktor \`Product(Long id, String name, BigDecimal price, boolean active)\`
- \`id\` und \`name\` sind unveränderlich, \`price\` und \`active\` veränderbar
- \`changePrice(BigDecimal newPrice)\` – wirft \`IllegalArgumentException\` bei \`null\` oder negativem Preis (gilt auch im Konstruktor)
- \`deactivate()\`
- \`isAvailable()\` – \`true\`, wenn aktiv **und** Preis > 0
- Getter \`getId()\`, \`getName()\`, \`getPrice()\``,
      starter: `class Product {

    // TODO Felder

    Product(Long id, String name, BigDecimal price, boolean active) {
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

    Long getId() { return null; }
    String getName() { return null; }
    BigDecimal getPrice() { return null; }
}`,
      solution: `class Product {

    private final Long id;
    private final String name;
    private BigDecimal price;
    private boolean active;

    Product(Long id, String name, BigDecimal price, boolean active) {
        this.id = Objects.requireNonNull(id, "id");
        this.name = Objects.requireNonNull(name, "name");
        this.active = active;
        changePrice(price);
    }

    void changePrice(BigDecimal newPrice) {
        if (newPrice == null || newPrice.signum() < 0) {
            throw new IllegalArgumentException("price must be >= 0");
        }
        this.price = newPrice;
    }

    void deactivate() {
        this.active = false;
    }

    boolean isAvailable() {
        return active && price.signum() > 0;
    }

    Long getId() { return id; }
    String getName() { return name; }
    BigDecimal getPrice() { return price; }
}`,
      hints: [
        'Unveränderliche Felder sind `private final`, veränderbare nur `private`. Die Validierung gehört an **eine** Stelle.',
        '`BigDecimal.signum()` liefert -1, 0 oder 1. `Objects.requireNonNull` für Pflichtfelder.',
        'Konstruktor: id/name setzen, active setzen, dann `changePrice(price)` aufrufen (Validierung wiederverwenden).',
        '`boolean isAvailable() { return active && price.signum() > 0; }`',
      ],
      tests: `var p = new Product(1L, "Laptop", new BigDecimal("999.00"), true);
check("id", 1L, p.getId());
check("name", "Laptop", p.getName());
checkTrue("verfügbar", p.isAvailable());
p.changePrice(new BigDecimal("899.00"));
check("neuer Preis", new BigDecimal("899.00"), p.getPrice());
checkThrows("negativer Preis", IllegalArgumentException.class, () -> p.changePrice(new BigDecimal("-1")));
checkThrows("null Preis", IllegalArgumentException.class, () -> p.changePrice(null));
check("Preis nach Fehler unverändert", new BigDecimal("899.00"), p.getPrice());
p.changePrice(BigDecimal.ZERO);
checkTrue("Preis 0 -> nicht verfügbar", !p.isAvailable());
var q = new Product(2L, "Maus", new BigDecimal("20"), true);
q.deactivate();
checkTrue("deaktiviert -> nicht verfügbar", !q.isAvailable());
checkThrows("Konstruktor validiert Preis", IllegalArgumentException.class, () -> new Product(3L, "X", new BigDecimal("-5"), true));`,
    },
    {
      id: 'k2',
      title: 'Switch Expression über Enum',
      level: 2,
      description: `Gegeben ist das Enum \`OrderStatus\`. Implementiere mit **Switch Expressions** (kein \`if\`):

- \`label(OrderStatus s)\`: \`NEW\` → \`"Neu"\`, \`PAID\` → \`"Bezahlt"\`, \`SHIPPED\` → \`"Versendet"\`, \`DELIVERED\` → \`"Zugestellt"\`, \`CANCELLED\` → \`"Storniert"\`
- \`isFinal(OrderStatus s)\`: \`true\` für \`DELIVERED\` und \`CANCELLED\`
- \`next(OrderStatus s)\`: \`NEW\` → \`PAID\` → \`SHIPPED\` → \`DELIVERED\`; für finale Status \`IllegalStateException\``,
      given: `enum OrderStatus { NEW, PAID, SHIPPED, DELIVERED, CANCELLED }`,
      starter: `class Solution {

    static String label(OrderStatus s) {
        // TODO
        return "";
    }

    static boolean isFinal(OrderStatus s) {
        // TODO
        return false;
    }

    static OrderStatus next(OrderStatus s) {
        // TODO
        return s;
    }
}`,
      solution: `class Solution {

    static String label(OrderStatus s) {
        return switch (s) {
            case NEW -> "Neu";
            case PAID -> "Bezahlt";
            case SHIPPED -> "Versendet";
            case DELIVERED -> "Zugestellt";
            case CANCELLED -> "Storniert";
        };
    }

    static boolean isFinal(OrderStatus s) {
        return switch (s) {
            case DELIVERED, CANCELLED -> true;
            case NEW, PAID, SHIPPED -> false;
        };
    }

    static OrderStatus next(OrderStatus s) {
        return switch (s) {
            case NEW -> OrderStatus.PAID;
            case PAID -> OrderStatus.SHIPPED;
            case SHIPPED -> OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> throw new IllegalStateException("final status: " + s);
        };
    }
}`,
      hints: [
        'Eine Switch Expression liefert einen Wert: `return switch (s) { ... };` – Semikolon am Ende nicht vergessen.',
        'Mehrere Labels mit Komma: `case DELIVERED, CANCELLED -> true;`. Ein `throw` ist als Case-Ergebnis erlaubt.',
        'Keinen `default` verwenden – wenn alle Konstanten abgedeckt sind, prüft der Compiler die Vollständigkeit.',
        '`case DELIVERED, CANCELLED -> throw new IllegalStateException("final status: " + s);`',
      ],
      tests: `check("label NEW", "Neu", Solution.label(OrderStatus.NEW));
check("label SHIPPED", "Versendet", Solution.label(OrderStatus.SHIPPED));
check("label CANCELLED", "Storniert", Solution.label(OrderStatus.CANCELLED));
checkTrue("DELIVERED ist final", Solution.isFinal(OrderStatus.DELIVERED));
checkTrue("CANCELLED ist final", Solution.isFinal(OrderStatus.CANCELLED));
checkTrue("PAID ist nicht final", !Solution.isFinal(OrderStatus.PAID));
check("next NEW", OrderStatus.PAID, Solution.next(OrderStatus.NEW));
check("next SHIPPED", OrderStatus.DELIVERED, Solution.next(OrderStatus.SHIPPED));
checkThrows("next DELIVERED", IllegalStateException.class, () -> Solution.next(OrderStatus.DELIVERED));
checkThrows("next CANCELLED", IllegalStateException.class, () -> Solution.next(OrderStatus.CANCELLED));`,
    },
    {
      id: 'k3',
      title: 'Initialen aus einem Namen',
      level: 2,
      description: `Implementiere \`initials(String fullName)\`:

- liefert die großgeschriebenen Anfangsbuchstaben aller Namensteile, z. B. \`"jan christoph pfrommer"\` → \`"JCP"\`
- mehrfache Leerzeichen und führende/abschließende Leerzeichen werden ignoriert
- \`null\` oder blank → \`""\`

Nutze \`StringBuilder\` oder Streams – keine String-Konkatenation in der Schleife.`,
      starter: `class Solution {

    static String initials(String fullName) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static String initials(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "";
        }
        var sb = new StringBuilder();
        for (String part : fullName.strip().split("\\\\s+")) {
            sb.append(Character.toUpperCase(part.charAt(0)));
        }
        return sb.toString();
    }
}`,
      hints: [
        'Erst Guard Clause für `null`/blank, dann in Wörter zerlegen.',
        '`strip()`, `split("\\\\s+")` (Regex für 1..n Whitespace), `charAt(0)`, `Character.toUpperCase`.',
        'if null oder blank → ""; für jedes Wort: ersten Buchstaben groß an StringBuilder hängen.',
        '`for (String part : fullName.strip().split("\\\\s+")) { sb.append(Character.toUpperCase(part.charAt(0))); }`',
      ],
      tests: `check("drei Teile", "JCP", Solution.initials("jan christoph pfrommer"));
check("schon groß", "AB", Solution.initials("Anna Berg"));
check("ein Name", "M", Solution.initials("madonna"));
check("viele Leerzeichen", "JD", Solution.initials("   john     doe  "));
check("null", "", Solution.initials(null));
check("leer", "", Solution.initials(""));
check("blank", "", Solution.initials("   "));`,
    },
    {
      id: 'k4',
      title: 'Value Object mit equals/hashCode',
      level: 3,
      description: `Implementiere die Klasse \`EmailAddress\` (bewusst **kein** Record):

- Konstruktor \`EmailAddress(String value)\`: wirft \`IllegalArgumentException\`, wenn \`value\` \`null\` ist oder kein \`@\` enthält
- der Wert wird getrimmt und in Kleinbuchstaben gespeichert
- \`value()\` liefert den normalisierten Wert, \`domain()\` den Teil nach dem \`@\`
- \`equals\`/\`hashCode\` basieren auf dem normalisierten Wert → \`"Jan@X.de"\` und \`" jan@x.de"\` sind gleich
- \`toString()\` liefert den normalisierten Wert`,
      starter: `class EmailAddress {

    EmailAddress(String value) {
        // TODO
    }

    String value() {
        // TODO
        return null;
    }

    String domain() {
        // TODO
        return null;
    }

    // TODO equals, hashCode, toString
}`,
      solution: `class EmailAddress {

    private final String value;

    EmailAddress(String value) {
        if (value == null || !value.contains("@")) {
            throw new IllegalArgumentException("invalid email: " + value);
        }
        this.value = value.strip().toLowerCase();
    }

    String value() {
        return value;
    }

    String domain() {
        return value.substring(value.indexOf('@') + 1);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof EmailAddress other)) return false;
        return value.equals(other.value);
    }

    @Override
    public int hashCode() {
        return value.hashCode();
    }

    @Override
    public String toString() {
        return value;
    }
}`,
      hints: [
        'Normalisiere im Konstruktor – dann müssen `equals` und `hashCode` nur noch das Feld vergleichen.',
        '`strip()`, `toLowerCase()`, `indexOf(\'@\')`, `substring`. In `equals`: `o instanceof EmailAddress other`.',
        'equals: gleiche Referenz → true; kein EmailAddress → false; sonst value vergleichen. hashCode: value.hashCode().',
        '`public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof EmailAddress other)) return false; return value.equals(other.value); }`',
      ],
      tests: `var a = new EmailAddress("Jan@Example.DE");
var b = new EmailAddress("  jan@example.de ");
check("normalisiert", "jan@example.de", a.value());
check("domain", "example.de", a.domain());
check("equals", a, b);
check("hashCode gleich", a.hashCode(), b.hashCode());
checkTrue("nicht gleich null", !a.equals(null));
checkTrue("nicht gleich String", !a.equals("jan@example.de"));
checkTrue("ungleich", !a.equals(new EmailAddress("anna@example.de")));
check("HashSet dedupliziert", 1, new HashSet<>(List.of(a, b)).size());
check("toString", "jan@example.de", b.toString());
checkThrows("ohne @", IllegalArgumentException.class, () -> new EmailAddress("jan.example.de"));
checkThrows("null", IllegalArgumentException.class, () -> new EmailAddress(null));`,
    },
    {
      id: 'k5',
      title: 'Sealed Shapes mit Pattern Matching',
      level: 4,
      description: `Gegeben ist die sealed Hierarchie \`Shape\`. Implementiere mit **Pattern-Matching-Switch** (kein \`instanceof\`-Cast-Kaskade):

- \`area(Shape s)\`: Kreis \`π·r²\`, Rechteck \`w·h\`, Quadrat \`side²\`
- \`classify(Shape s)\`: \`"klein"\` wenn Fläche < 10, \`"mittel"\` wenn < 100, sonst \`"groß"\`
- \`describe(Object o)\`: \`null\` → \`"nichts"\`, \`Shape\` → \`"Form: " + classify\`, \`String\` blank → \`"leerer Text"\`, sonstiger \`String\` → \`"Text: " + s\`, alles andere → \`"unbekannt"\``,
      given: `sealed interface Shape permits Circle, Rectangle, Square {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Square(double side) implements Shape {}`,
      starter: `class Solution {

    static double area(Shape s) {
        // TODO
        return 0;
    }

    static String classify(Shape s) {
        // TODO
        return "";
    }

    static String describe(Object o) {
        // TODO
        return "";
    }
}`,
      solution: `class Solution {

    static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Square sq -> sq.side() * sq.side();
        };
    }

    static String classify(Shape s) {
        double area = area(s);
        if (area < 10) return "klein";
        if (area < 100) return "mittel";
        return "groß";
    }

    static String describe(Object o) {
        return switch (o) {
            case null -> "nichts";
            case Shape shape -> "Form: " + classify(shape);
            case String text when text.isBlank() -> "leerer Text";
            case String text -> "Text: " + text;
            default -> "unbekannt";
        };
    }
}`,
      hints: [
        'Weil `Shape` sealed ist, kann ein `switch` über alle drei Records exhaustive sein – ohne `default`.',
        'Type Patterns: `case Circle c -> ...`, Guards: `case String t when t.isBlank() -> ...`, `case null -> ...` (Java 21).',
        'area: switch(s) { Circle → PI·r·r; Rectangle → w·h; Square → side·side }. describe: null, Shape, String mit Guard, String, default – in dieser Reihenfolge.',
        '`return switch (o) { case null -> "nichts"; case Shape shape -> "Form: " + classify(shape); ... default -> "unbekannt"; };`',
      ],
      tests: `checkTrue("Kreis r=1", Math.abs(Solution.area(new Circle(1)) - Math.PI) < 1e-9);
check("Rechteck", 12.0, Solution.area(new Rectangle(3, 4)));
check("Quadrat", 25.0, Solution.area(new Square(5)));
check("klein", "klein", Solution.classify(new Square(3)));
check("Grenze 10 ist mittel", "mittel", Solution.classify(new Rectangle(2, 5)));
check("groß", "groß", Solution.classify(new Circle(10)));
check("describe null", "nichts", Solution.describe(null));
check("describe Shape", "Form: mittel", Solution.describe(new Square(5)));
check("describe blank", "leerer Text", Solution.describe("  "));
check("describe Text", "Text: Hi", Solution.describe("Hi"));
check("describe Zahl", "unbekannt", Solution.describe(42));`,
    },
  ],
}

export default chapter
