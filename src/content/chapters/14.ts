import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '14',
  flashcards: [
    {
      id: 'f1',
      front: 'Was ist das eigentliche Ziel von Clean Code?',
      back: '**Geringe kognitive Last** beim Lesen – nicht möglichst wenige Zeichen. Code wird ungefähr zehnmal öfter gelesen als geschrieben; der Leser ist die Zielgruppe, nicht der Compiler.',
    },
    {
      id: 'f2',
      front: 'Namensregeln für Klassen, Methoden und Booleans?',
      back: 'Klassen = **Substantive** (`PriceCalculator`), Methoden = **Verben** (`calculateTotal`), Booleans als Frage (`isActive`, `hasPermission`, `canDelete`, `shouldRetry`). Namenslänge ∝ Scope-Größe.',
    },
    {
      id: 'f3',
      front: 'Was bedeutet **Single Level of Abstraction**?',
      back: 'Alle Anweisungen einer Methode liegen auf derselben Abstraktionsebene. Nicht `validate(order)` (Use-Case-Ebene) neben `buffer.append(row.get(i))` (Byte-Ebene) mischen – das zwingt den Leser zum Zoomen.',
    },
    {
      id: 'f4',
      front: 'Was besagt **Command-Query-Separation**?',
      back: 'Eine Methode **tut etwas** (Command, `void`, mit Seiteneffekt) oder **beantwortet etwas** (Query, ohne Seiteneffekt) – nie beides. `boolean setIfValid(...)` ist der klassische Verstoß.',
    },
    {
      id: 'f5',
      front: 'Warum sind Boolean-Parameter ein Smell?',
      back: 'Am Aufrufort verliert das Argument jede Bedeutung: `report.render(true, false)`. Meist stecken zwei Methoden darin – oder es braucht ein Enum (`RenderMode.DETAILED`).',
    },
    {
      id: 'f6',
      front: 'Was ist eine **Guard Clause** und was bringt sie?',
      back: 'Sonderfälle am Methodenanfang prüfen und sofort raus. Ergebnis: Der Normalfall steht auf Einrückungsebene 1 statt in einer `if`-Pyramide.\n\n```java\nif (!user.isActive()) return;\nif (!user.hasPermission(DELETE)) return;\nexecute();\n```',
    },
    {
      id: 'f7',
      front: 'Wann ist ein Kommentar gut?',
      back: 'Wenn er das **WARUM** erklärt, das aus dem Code nicht hervorgeht (Fachregel, Ticket, Fallstrick). Schlecht: das WAS wiederholen, auskommentierter Code, Changelogs im Header.',
    },
    {
      id: 'f8',
      front: 'Wie gehst du mit `null` um?',
      back: '- Collections: **leere** Collection statt `null`\n- „kann fehlen“: `Optional` als **Rückgabetyp** (nicht Feld, nicht Parameter, nicht in Collections)\n- Eingaben: früh prüfen mit `Objects.requireNonNull(x, "x")`',
    },
    {
      id: 'f9',
      front: 'Warum `private final` Felder und Konstruktor-Injection?',
      back: 'Weniger veränderliche Zustände = weniger Fälle im Kopf, thread-safe ohne Synchronisation, Pflichtabhängigkeiten fallen beim Start auf, und die Klasse ist ohne Container testbar.',
    },
    {
      id: 'f10',
      front: 'Wie schneidest du Packages?',
      back: 'Nach **Fachlichkeit** (`order`, `payment`, `shipping`), nicht nach technischen Schichten über die ganze App (`controller/`, `service/`, `dto/`). Sonst streut jedes Feature über fünf Pakete.',
    },
    {
      id: 'f11',
      front: 'Was ist die **Boy-Scout-Rule**?',
      back: 'Die Stelle, die du ohnehin anfasst, etwas sauberer hinterlassen als du sie vorgefunden hast. Nicht: den ganzen Wald umgraben – das macht Reviews und Merges unmöglich.',
    },
    {
      id: 'f12',
      front: 'DRY vs. voreilige Abstraktion – was gilt?',
      back: 'DRY meint **Wissen**, nicht Zeichenfolgen. Zwei ähnlich aussehende Stellen mit verschiedenen Änderungsgründen sind keine Duplikation. Rule of Three: erst beim dritten echten Vorkommen abstrahieren – die falsche Abstraktion ist teurer als Duplikation.',
    },
    {
      id: 'f13',
      front: 'Was bedeuten **YAGNI** und **KISS** konkret?',
      back: 'YAGNI: keine Flexibilität für hypothetische Anforderungen (kein Interface mit einer Implementierung „für später“). KISS: die einfachste Lösung, die das Problem löst – manchmal ist eine Schleife lesbarer als drei verschachtelte `flatMap`.',
    },
    {
      id: 'f14',
      front: 'Was ist **Primitive Obsession** und was hilft dagegen?',
      back: '`String status`, `double price`, `String currency` statt eigener Typen. Gegenmittel: Enum (`OrderStatus`), Value Object / Record (`Money`), `BigDecimal` für Geld. Der Compiler prüft dann mit.',
    },
    {
      id: 'f15',
      front: 'Nenne fünf Code Smells mit Gegenmittel.',
      back: '| Smell | Gegenmittel |\n|---|---|\n| Long Method | Extract Method |\n| Long Parameter List | Parameter Object (Record) |\n| God Class | Extract Class nach Verantwortung |\n| Feature Envy | Move Method |\n| Magic Number | benannte Konstante / Enum |',
    },
    {
      id: 'f16',
      front: 'Woran erkennst du, dass eine Methode zu groß ist?',
      back: 'Du willst einen Kommentar über einen Block schreiben („// Preis berechnen“), es gibt mehr als zwei Einrückungsebenen, oder sie passt nicht auf den Bildschirm. Jeder dieser Punkte ist eine Einladung zu **Extract Method**.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Variante ist Clean Code?',
      code: `// A
if (u.getR() == 2 && u.getS()) { ... }

// B
// prüft, ob der User löschen darf
if (u.getR() == 2 && u.getS()) { ... }

// C
if (user.canDelete()) { ... }`,
      options: ['A', 'B – der Kommentar erklärt die Bedingung', 'C – die Bedingung bekommt einen sprechenden Namen', 'A und B sind gleichwertig'],
      correct: 2,
      explanation: 'Ein Kommentar, der eine Bedingung erklärt, ist meist der Name einer fehlenden Methode. C macht den Kommentar überflüssig und ist testbar.',
    },
    {
      id: 'q2',
      prompt: 'Wo ist der Bug bzw. der Designfehler?',
      code: `boolean isValid(Order order) {
    order.setChecked(true);
    return order.total() != null;
}`,
      options: [
        'Kein Fehler – die Prüfung merkt sich das Ergebnis',
        'Command-Query-Separation verletzt: Die Query hat einen Seiteneffekt',
        '`isValid` müsste `checkValid` heißen',
        '`order.total()` kann nicht `null` sein',
      ],
      correct: 1,
      explanation: 'Eine Abfrage darf den Zustand nicht ändern – sonst verhält sich `if (isValid(o))` anders als `if (isValid(o) && isValid(o))`. Prüfen und Markieren gehören in zwei Methoden.',
    },
    {
      id: 'q3',
      prompt: 'Welche Signatur ist am Aufrufort am besten lesbar?',
      options: [
        '`report.render(true, false)`',
        '`report.render(RenderMode.DETAILED)`',
        '`report.render(1, 0)`',
        '`report.render(Boolean.TRUE, Boolean.FALSE)`',
      ],
      correct: 1,
      explanation: 'Boolean-Trap: `true, false` sagt am Aufrufort nichts. Ein Enum benennt die Absicht und lässt sich später um einen dritten Fall erweitern, ohne die Signatur zu sprengen.',
    },
    {
      id: 'q4',
      prompt: 'Was ist an dieser Methode zuerst zu verbessern?',
      code: `List<Order> search(String customer, LocalDate from, LocalDate to,
                   String status, boolean onlyPaid, int page, int size) { ... }`,
      options: [
        'Die Methode in `find` umbenennen',
        '`List` durch `Set` ersetzen',
        'Parameter Object einführen (`OrderSearchCriteria`) und `status` als Enum typisieren',
        'Alle Parameter zu `Optional` machen',
      ],
      correct: 2,
      explanation: 'Sieben Parameter sind am Aufrufort nicht mehr unterscheidbar. Zusammengehörige Werte bündelt ein Record; `String status` ist zusätzlich Primitive Obsession.',
    },
    {
      id: 'q5',
      prompt: 'Welche Rückgabe ist sauber, wenn nichts gefunden wurde?',
      code: `List<Order> findByCustomer(String customer) { ... }`,
      options: ['`null`', '`List.of()`', '`Optional.empty()`', '`new ArrayList<>(0)` mit einem Kommentar'],
      correct: 1,
      explanation: 'Collections geben nie `null` zurück – der Aufrufer soll ohne Null-Check iterieren können. `Optional<List<…>>` ist doppelt gemoppelt; `Optional` ist für Einzeltreffer.',
    },
    {
      id: 'q6',
      prompt: 'Zwei Methoden sehen fast gleich aus: eine berechnet den Rechnungsbetrag, die andere den Lieferwert. Was tun?',
      options: [
        'Sofort eine gemeinsame generische Methode extrahieren – DRY',
        'Erst prüfen, ob sich beide aus **demselben Grund** ändern; sonst Duplikation stehen lassen (Rule of Three)',
        'Beide in eine Util-Klasse verschieben',
        'Eine Basisklasse einführen und beide erben lassen',
      ],
      correct: 1,
      explanation: 'DRY bezieht sich auf Wissen, nicht auf Zeichenfolgen. Ändern sich Rechnungs- und Lieferlogik unabhängig, koppelt eine gemeinsame Methode zwei Fachbereiche – die falsche Abstraktion ist teurer als Duplikation.',
    },
    {
      id: 'q7',
      prompt: 'Welcher Kommentar ist der einzig sinnvolle?',
      code: `// A: erhöhe counter um 1
counter++;

// B: TODO: aufräumen (seit 2019)
// C: Fachbereich verlangt kaufmännische Rundung (TICKET-4711), nicht HALF_EVEN
return amount.setScale(2, RoundingMode.HALF_UP);

// D: public class OrderService – Service für Orders`,
      options: ['A', 'B', 'C', 'D'],
      correct: 2,
      explanation: 'C erklärt ein **WARUM**, das im Code nicht steht, und verweist auf die Quelle der Regel. A und D wiederholen den Code, B ist Müll, den Git besser verwaltet.',
    },
    {
      id: 'q8',
      prompt: 'Welche Umstrukturierung passt zu diesem Smell?',
      code: `class OrderService {   // 1200 Zeilen
    void place(Order o) { validate(o); price(o); reserveStock(o); renderPdf(o); sendMail(o); }
    // + 40 weitere Methoden für PDF-Layout, SMTP, Lagerlogik
}`,
      options: [
        'Interface Segregation: ein Interface pro Methode',
        'Liskov: von einer `BaseCrudService`-Klasse erben',
        'Single Responsibility: Extract Class nach Verantwortung (`PriceCalculator`, `InvoiceRenderer`, `OrderNotifier`)',
        'Die Klasse in mehrere Dateien mit `partial` aufteilen',
      ],
      correct: 2,
      explanation: 'Die Klasse hat viele Gründe, sich zu ändern. Nach dem Schnitt bleibt `OrderService` der Orchestrierer des Use Cases, die Details werden einzeln testbar.',
    },
    {
      id: 'q9',
      prompt: 'Welche Variante ist Clean Code?',
      code: `// A
public BigDecimal t(User u) {
    return u.getO().stream().filter(o -> o.getS() == 1)
        .map(o -> o.getT()).reduce(BigDecimal.ZERO, BigDecimal::add);
}

// B
public BigDecimal openTotal(User user) {
    return user.orders().stream()
        .filter(Order::isOpen)
        .map(Order::total)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
}`,
      options: [
        'A – kompakter',
        'B – sprechende Namen, `isOpen` statt Magic Number, Method References',
        'Beide gleich – nur Formatierung',
        'Keine – beide sollten eine `for`-Schleife nutzen',
      ],
      correct: 1,
      explanation: 'A versteckt eine Fachregel (`getS() == 1`) hinter einer Zahl und benennt nichts. B ist gleich lang, aber ohne Rückfragen lesbar.',
    },
    {
      id: 'q10',
      prompt: 'Ein Kollege legt „für später“ ein Interface mit genau einer Implementierung an. Wie heißt der Smell?',
      options: [
        'Feature Envy',
        'Shotgun Surgery',
        'Speculative Generality – YAGNI verletzt',
        'Data Clump',
      ],
      correct: 2,
      explanation: 'Flexibilität auf Vorrat kostet sofort Lesbarkeit und Navigationsaufwand, während der erwartete Fall oft nie eintritt. Das Interface einzuziehen, sobald die zweite Implementierung wirklich kommt, ist eine Minute Arbeit.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Guard Clauses & sprechende Namen',
      level: 1,
      description: `Im Starter steht die Legacy-Methode \`d(...)\`: Einbuchstaben-Namen, vierfach verschachtelte \`if\`s, Magic Number \`2\`, stilles \`null\` als Ergebnis.

Schreibe die saubere Variante \`describeAccess(String username, boolean active, int roleLevel)\` **neu** (die Legacy-Methode darfst du stehen lassen):

- \`username\` \`null\` oder blank → \`IllegalArgumentException\`
- \`active == false\` → \`"INACTIVE"\`
- \`roleLevel >= 2\` (als benannte Konstante!) → \`"ADMIN:" + getrimmter Name\`
- sonst → \`"USER:" + getrimmter Name\`

Ziel: Guard Clauses statt Verschachtelung, keine Magic Number, keine Einbuchstaben-Namen.`,
      starter: `class Solution {

    // Legacy – nicht Vorbild, sondern Ausgangspunkt
    static String d(String u, boolean a, int r) {
        String x = null;
        if (u != null) {
            if (!u.isBlank()) {
                if (a) {
                    if (r >= 2) {
                        x = "ADMIN:" + u.trim();
                    } else {
                        x = "USER:" + u.trim();
                    }
                }
            }
        }
        return x;
    }

    static String describeAccess(String username, boolean active, int roleLevel) {
        // TODO: saubere Variante mit Guard Clauses und benannter Konstante
        return null;
    }
}`,
      solution: `class Solution {

    private static final int ADMIN_ROLE_LEVEL = 2;
    private static final String INACTIVE = "INACTIVE";

    // Legacy – nicht Vorbild, sondern Ausgangspunkt
    static String d(String u, boolean a, int r) {
        String x = null;
        if (u != null) {
            if (!u.isBlank()) {
                if (a) {
                    if (r >= 2) {
                        x = "ADMIN:" + u.trim();
                    } else {
                        x = "USER:" + u.trim();
                    }
                }
            }
        }
        return x;
    }

    static String describeAccess(String username, boolean active, int roleLevel) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("username darf nicht leer sein");
        }
        if (!active) {
            return INACTIVE;
        }
        String name = username.trim();
        return roleLevel >= ADMIN_ROLE_LEVEL ? "ADMIN:" + name : "USER:" + name;
    }
}`,
      hints: [
        'Guard Clauses drehen die Logik um: Erst alle Sonderfälle abfrühstücken und verlassen, danach steht der Normalfall ohne Einrückung da.',
        'Bausteine: `String.isBlank()`, `String.trim()`, `IllegalArgumentException(String)`, `private static final int ADMIN_ROLE_LEVEL = 2;`.',
        'Pseudocode: ungültiger Name → werfen. Nicht aktiv → `"INACTIVE"`. Name trimmen. Rolle >= Konstante → `"ADMIN:" + name`, sonst `"USER:" + name`.',
        '```java\nprivate static final int ADMIN_ROLE_LEVEL = 2;\n\nstatic String describeAccess(String username, boolean active, int roleLevel) {\n    if (username == null || username.isBlank()) {\n        throw new IllegalArgumentException("username darf nicht leer sein");\n    }\n    if (!active) {\n        return "INACTIVE";\n    }\n    // ...\n}\n```',
      ],
      tests: `check("aktiver Admin", "ADMIN:anna", Solution.describeAccess(" anna ", true, 2));
check("aktiver User", "USER:bo", Solution.describeAccess("bo", true, 1));
check("hoehere Rolle bleibt Admin", "ADMIN:cem", Solution.describeAccess("cem", true, 5));
check("Rollenstufe 0", "USER:eve", Solution.describeAccess("eve", true, 0));
check("inaktiv", "INACTIVE", Solution.describeAccess("dana", false, 3));
check("inaktiv schlaegt Rolle", "INACTIVE", Solution.describeAccess(" dana ", false, 9));
checkThrows("null-Username", IllegalArgumentException.class, () -> Solution.describeAccess(null, true, 1));
checkThrows("leerer Username", IllegalArgumentException.class, () -> Solution.describeAccess("   ", true, 1));`,
    },
    {
      id: 'k2',
      title: 'Boolean-Trap und Seiteneffekte entfernen',
      level: 2,
      description: `Die Legacy-Methode \`render(Report, boolean, boolean)\` hat zwei Probleme: eine **Boolean-Trap** am Aufrufort und einen **Seiteneffekt** (sie verändert die übergebene Liste).

Implementiere zwei saubere Methoden:

\`static List<String> normalizedRows(Report report)\`
- trimmt jede Zeile, entfernt leere/blanke Zeilen
- **verändert die Eingabe nicht** (keine Seiteneffekte)

\`static String render(Report report, RenderMode mode)\` – arbeitet auf den normalisierten Zeilen:
- \`report\` oder \`mode\` \`null\` → \`IllegalArgumentException\`
- \`SUMMARY\` → \`"Titel (N Zeilen)"\`
- \`DETAILED\` → Titel, danach jede Zeile durch \`"\\n"\` getrennt
- \`DETAILED\` ohne Zeilen → nur der Titel`,
      given: `enum RenderMode { SUMMARY, DETAILED }

record Report(String title, List<String> rows) {}`,
      starter: `class Solution {

    // Legacy: Boolean-Trap + Seiteneffekt auf der uebergebenen Liste
    static String render(Report r, boolean detailed, boolean upper) {
        r.rows().removeIf(String::isBlank);
        String t = upper ? r.title().toUpperCase() : r.title();
        if (detailed) {
            return t + "\\n" + String.join("\\n", r.rows());
        }
        return t + " (" + r.rows().size() + " Zeilen)";
    }

    static List<String> normalizedRows(Report report) {
        // TODO
        return null;
    }

    static String render(Report report, RenderMode mode) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    // Legacy: Boolean-Trap + Seiteneffekt auf der uebergebenen Liste
    static String render(Report r, boolean detailed, boolean upper) {
        r.rows().removeIf(String::isBlank);
        String t = upper ? r.title().toUpperCase() : r.title();
        if (detailed) {
            return t + "\\n" + String.join("\\n", r.rows());
        }
        return t + " (" + r.rows().size() + " Zeilen)";
    }

    static List<String> normalizedRows(Report report) {
        if (report == null) {
            throw new IllegalArgumentException("report darf nicht null sein");
        }
        return report.rows().stream()
                .map(String::trim)
                .filter(row -> !row.isEmpty())
                .toList();
    }

    static String render(Report report, RenderMode mode) {
        if (report == null) {
            throw new IllegalArgumentException("report darf nicht null sein");
        }
        if (mode == null) {
            throw new IllegalArgumentException("mode darf nicht null sein");
        }
        List<String> rows = normalizedRows(report);
        return switch (mode) {
            case SUMMARY -> report.title() + " (" + rows.size() + " Zeilen)";
            case DETAILED -> rows.isEmpty()
                    ? report.title()
                    : report.title() + "\\n" + String.join("\\n", rows);
        };
    }
}`,
      hints: [
        'Keine Seiteneffekte heißt: nicht `removeIf` auf der übergebenen Liste, sondern eine neue Liste erzeugen. Und statt zweier `boolean`-Flags entscheidet ein `switch` über das Enum.',
        'Bausteine: `Stream.map(String::trim)`, `Stream.filter`, `Stream.toList()` (liefert eine unveränderliche Liste), `String.join("\\n", rows)`, `switch`-Ausdruck über das Enum.',
        'Pseudocode: normalizedRows → streamen, trimmen, Leere rausfiltern, `toList()`. render → Guards, dann `normalizedRows(report)` aufrufen und je nach Modus zusammenbauen.',
        '```java\nstatic String render(Report report, RenderMode mode) {\n    // Guards ...\n    List<String> rows = normalizedRows(report);\n    return switch (mode) {\n        case SUMMARY -> report.title() + " (" + rows.size() + " Zeilen)";\n        case DETAILED -> /* ... */;\n    };\n}\n```',
      ],
      tests: `Report report = new Report("Monat", new ArrayList<>(List.of(" a ", "   ", "b")));

check("normalizedRows trimmt und filtert", List.of("a", "b"), Solution.normalizedRows(report));
check("Eingabe bleibt unveraendert", 3, report.rows().size());
check("normalizedRows bei leerer Liste", List.of(), Solution.normalizedRows(new Report("X", List.of())));
check("normalizedRows bei nur blanken Zeilen", List.of(), Solution.normalizedRows(new Report("X", List.of(" ", ""))));
check("SUMMARY", "Monat (2 Zeilen)", Solution.render(report, RenderMode.SUMMARY));
check("SUMMARY ohne Zeilen", "X (0 Zeilen)", Solution.render(new Report("X", List.of()), RenderMode.SUMMARY));
check("DETAILED", "Monat\\na\\nb", Solution.render(report, RenderMode.DETAILED));
check("DETAILED ohne Zeilen", "X", Solution.render(new Report("X", List.of(" ")), RenderMode.DETAILED));
check("render veraendert die Eingabe nicht", 3, report.rows().size());
checkThrows("null-Report", IllegalArgumentException.class, () -> Solution.render(null, RenderMode.SUMMARY));
checkThrows("null-Mode", IllegalArgumentException.class, () -> Solution.render(report, null));`,
    },
    {
      id: 'k3',
      title: 'Magic Numbers und Primitive Obsession',
      level: 3,
      description: `Die Legacy-Methode \`p(...)\` rechnet mit \`double\` für Geld, vergleicht Kundengruppen als \`String\` und ist voller Magic Numbers.

Implementiere \`static int loyaltyPoints(List<Purchase> purchases, Tier tier)\` sauber:

- \`purchases\` \`null\` oder leer → \`IllegalArgumentException\`
- eine Position mit \`quantity <= 0\` → \`IllegalArgumentException\`
- Umsatz = Σ \`quantity * unitPrice\` (\`BigDecimal\`)
- Basispunkte = **1 Punkt je volle 10,00 €** (abrunden)
- Multiplikator: \`BRONZE\` ×1, \`SILVER\` ×2, \`GOLD\` ×3 (\`switch\`-Ausdruck)
- Bonus: **+50 Punkte**, wenn der Umsatz ≥ 500,00 € ist (Bonus wird *nicht* multipliziert)

Alle Schwellen und Faktoren als benannte Konstanten bzw. über das Enum.`,
      given: `enum Tier { BRONZE, SILVER, GOLD }

record Purchase(String sku, int quantity, BigDecimal unitPrice) {}`,
      starter: `class Solution {

    // Legacy – double fuer Geld, String-Vergleiche, Magic Numbers
    static int p(List<Purchase> l, String t) {
        double s = 0;
        for (int i = 0; i < l.size(); i++) {
            s = s + l.get(i).quantity() * l.get(i).unitPrice().doubleValue();
        }
        int pts = (int) (s / 10);
        if (t.equals("SILVER")) {
            pts = pts * 2;
        } else if (t.equals("GOLD")) {
            pts = pts * 3;
        }
        if (s > 500) {
            pts = pts + 50;
        }
        return pts;
    }

    static int loyaltyPoints(List<Purchase> purchases, Tier tier) {
        // TODO
        return -1;
    }
}`,
      solution: `class Solution {

    private static final BigDecimal EURO_PER_POINT = new BigDecimal("10.00");
    private static final BigDecimal BONUS_THRESHOLD = new BigDecimal("500.00");
    private static final int BONUS_POINTS = 50;

    // Legacy – double fuer Geld, String-Vergleiche, Magic Numbers
    static int p(List<Purchase> l, String t) {
        double s = 0;
        for (int i = 0; i < l.size(); i++) {
            s = s + l.get(i).quantity() * l.get(i).unitPrice().doubleValue();
        }
        int pts = (int) (s / 10);
        if (t.equals("SILVER")) {
            pts = pts * 2;
        } else if (t.equals("GOLD")) {
            pts = pts * 3;
        }
        if (s > 500) {
            pts = pts + 50;
        }
        return pts;
    }

    static int loyaltyPoints(List<Purchase> purchases, Tier tier) {
        if (purchases == null || purchases.isEmpty()) {
            throw new IllegalArgumentException("purchases darf nicht leer sein");
        }
        BigDecimal revenue = revenueOf(purchases);
        int basePoints = revenue.divide(EURO_PER_POINT, 0, RoundingMode.FLOOR).intValue();
        int points = basePoints * multiplierFor(tier);
        return revenue.compareTo(BONUS_THRESHOLD) >= 0 ? points + BONUS_POINTS : points;
    }

    private static BigDecimal revenueOf(List<Purchase> purchases) {
        BigDecimal revenue = BigDecimal.ZERO;
        for (Purchase purchase : purchases) {
            if (purchase.quantity() <= 0) {
                throw new IllegalArgumentException("quantity muss > 0 sein: " + purchase.sku());
            }
            revenue = revenue.add(purchase.unitPrice().multiply(BigDecimal.valueOf(purchase.quantity())));
        }
        return revenue;
    }

    private static int multiplierFor(Tier tier) {
        return switch (tier) {
            case BRONZE -> 1;
            case SILVER -> 2;
            case GOLD -> 3;
        };
    }
}`,
      hints: [
        'Zerlege die Aufgabe in kleine, benannte Schritte: Umsatz berechnen (inkl. Validierung), Basispunkte ableiten, Multiplikator bestimmen, Bonus addieren. Jede Zahl mit Bedeutung wird eine Konstante.',
        'Bausteine: `BigDecimal.multiply`, `add`, `BigDecimal.valueOf(int)`, `divide(divisor, 0, RoundingMode.FLOOR)`, `intValue()`, `compareTo(...) >= 0` (nicht `equals`!), `switch`-Ausdruck über das Enum.',
        'Pseudocode: Guard für leere Liste → Umsatz aufsummieren und dabei `quantity <= 0` prüfen → `basePoints = revenue / 10 abgerundet` → `points = basePoints * multiplier` → wenn `revenue >= 500` dann `+ 50`.',
        '```java\nint basePoints = revenue.divide(EURO_PER_POINT, 0, RoundingMode.FLOOR).intValue();\nint points = basePoints * multiplierFor(tier);\nreturn revenue.compareTo(BONUS_THRESHOLD) >= 0 ? points + BONUS_POINTS : points;\n```',
      ],
      tests: `List<Purchase> small = List.of(new Purchase("a", 2, new BigDecimal("12.50")));   // 25.00 Euro
check("Bronze", 2, Solution.loyaltyPoints(small, Tier.BRONZE));
check("Silver", 4, Solution.loyaltyPoints(small, Tier.SILVER));
check("Gold", 6, Solution.loyaltyPoints(small, Tier.GOLD));

List<Purchase> exactly500 = List.of(new Purchase("b", 10, new BigDecimal("50.00")));
check("Bonus genau an der Grenze (Bronze)", 100, Solution.loyaltyPoints(exactly500, Tier.BRONZE));
check("Bonus genau an der Grenze (Gold)", 200, Solution.loyaltyPoints(exactly500, Tier.GOLD));

List<Purchase> justUnder = List.of(new Purchase("c", 1, new BigDecimal("499.99")));
check("knapp unter der Bonusgrenze", 49, Solution.loyaltyPoints(justUnder, Tier.BRONZE));
check("Restbetrag unter 10 Euro zaehlt nicht", 0,
        Solution.loyaltyPoints(List.of(new Purchase("d", 1, new BigDecimal("9.99"))), Tier.GOLD));
check("mehrere Positionen", 7,
        Solution.loyaltyPoints(List.of(new Purchase("e", 3, new BigDecimal("10.00")),
                                       new Purchase("f", 1, new BigDecimal("45.00"))), Tier.BRONZE));
checkThrows("leere Liste", IllegalArgumentException.class, () -> Solution.loyaltyPoints(List.of(), Tier.GOLD));
checkThrows("null-Liste", IllegalArgumentException.class, () -> Solution.loyaltyPoints(null, Tier.GOLD));
checkThrows("Menge 0", IllegalArgumentException.class,
        () -> Solution.loyaltyPoints(List.of(new Purchase("g", 0, new BigDecimal("10.00"))), Tier.GOLD));`,
    },
    {
      id: 'k4',
      title: 'God-Methode zerlegen',
      level: 4,
      description: `Baue \`static OrderResult process(OrderRequest request)\` – und zwar aus **mehreren kleinen, benannten Methoden** auf einer Abstraktionsebene (z. B. \`normalizeItems\`, \`discountFor\`, \`requireCustomer\`).

Spezifikation:

- \`request\` \`null\` → \`IllegalArgumentException\`
- \`customer\` \`null\` oder blank → \`IllegalArgumentException\`; im Ergebnis steht der **getrimmte** Name
- Positionen normalisieren: trimmen, leere raus, **Duplikate raus** (Reihenfolge des ersten Auftretens bleibt)
- bleiben danach **keine** Positionen übrig (auch bei \`items == null\`) → \`new OrderResult(kunde, List.of(), 0, "REJECTED")\`
- Rabatt aus \`couponCode\` (getrimmt, Groß-/Kleinschreibung egal): \`"SAVE10"\` → 10, \`"SAVE20"\` → 20, sonst und bei \`null\` → 0
- sonst Status \`"ACCEPTED"\``,
      given: `record OrderRequest(String customer, List<String> items, String couponCode) {}

record OrderResult(String customer, List<String> items, int discountPercent, String status) {}`,
      starter: `class Solution {

    static OrderResult process(OrderRequest request) {
        // TODO: in kleine, benannte Schritte zerlegen
        return null;
    }
}`,
      solution: `class Solution {

    private static final String ACCEPTED = "ACCEPTED";
    private static final String REJECTED = "REJECTED";

    static OrderResult process(OrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("request darf nicht null sein");
        }
        String customer = requireCustomer(request.customer());
        List<String> items = normalizeItems(request.items());
        if (items.isEmpty()) {
            return new OrderResult(customer, List.of(), 0, REJECTED);
        }
        return new OrderResult(customer, items, discountFor(request.couponCode()), ACCEPTED);
    }

    private static String requireCustomer(String customer) {
        if (customer == null || customer.isBlank()) {
            throw new IllegalArgumentException("customer darf nicht leer sein");
        }
        return customer.trim();
    }

    private static List<String> normalizeItems(List<String> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream()
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .distinct()
                .toList();
    }

    private static int discountFor(String couponCode) {
        if (couponCode == null) {
            return 0;
        }
        return switch (couponCode.trim().toUpperCase()) {
            case "SAVE10" -> 10;
            case "SAVE20" -> 20;
            default -> 0;
        };
    }
}`,
      hints: [
        '`process` soll nur noch den Ablauf erzählen: Kunden prüfen, Positionen normalisieren, ablehnen oder annehmen. Jeder Schritt bekommt eine eigene `private static`-Methode.',
        'Bausteine: `String.isBlank()`, `String.trim()`, `Stream.map/filter/distinct/toList`, `switch`-Ausdruck über den Gutscheincode, `List.of()` als leeres Ergebnis.',
        'Pseudocode: `request`-Guard → `customer = requireCustomer(...)` → `items = normalizeItems(...)` → wenn `items` leer: `REJECTED` mit `List.of()` und 0 → sonst `ACCEPTED` mit `discountFor(couponCode)`.',
        '```java\nprivate static List<String> normalizeItems(List<String> items) {\n    if (items == null) {\n        return List.of();\n    }\n    return items.stream()\n            .map(String::trim)\n            .filter(item -> !item.isEmpty())\n            ./* ... */\n            .toList();\n}\n```',
      ],
      tests: `OrderResult accepted = Solution.process(
        new OrderRequest(" Anna ", new ArrayList<>(List.of(" Buch ", "Stift", "Buch", "  ")), " save10 "));
check("Kunde getrimmt", "Anna", accepted.customer());
check("Positionen normalisiert und ohne Duplikate", List.of("Buch", "Stift"), accepted.items());
check("Rabatt aus Coupon", 10, accepted.discountPercent());
check("Status", "ACCEPTED", accepted.status());

check("SAVE20", 20, Solution.process(new OrderRequest("Bo", List.of("X"), "SAVE20")).discountPercent());
check("unbekannter Coupon", 0, Solution.process(new OrderRequest("Bo", List.of("X"), "XYZ")).discountPercent());
check("kein Coupon", 0, Solution.process(new OrderRequest("Bo", List.of("X"), null)).discountPercent());

OrderResult empty = Solution.process(new OrderRequest("Cem", List.of(), "SAVE10"));
check("leere Positionen -> REJECTED", "REJECTED", empty.status());
check("leere Positionen -> keine Items", List.of(), empty.items());
check("leere Positionen -> kein Rabatt", 0, empty.discountPercent());
check("nur blanke Positionen -> REJECTED", "REJECTED",
        Solution.process(new OrderRequest("Dana", List.of("  ", ""), null)).status());
check("items null -> REJECTED", "REJECTED",
        Solution.process(new OrderRequest("Eve", null, null)).status());
checkThrows("null-Request", IllegalArgumentException.class, () -> Solution.process(null));
checkThrows("leerer Kunde", IllegalArgumentException.class,
        () -> Solution.process(new OrderRequest("  ", List.of("X"), null)));`,
    },
  ],
}

export default chapter
