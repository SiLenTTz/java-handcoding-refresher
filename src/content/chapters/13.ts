import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '13',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie sieht die `Throwable`-Hierarchie aus?',
      back: '```text\nThrowable\n ├── Error              nicht fangen (OutOfMemoryError)\n └── Exception\n      ├── RuntimeException  unchecked\n      └── Rest              checked (IOException, SQLException)\n```',
    },
    {
      id: 'f2',
      front: 'Checked oder unchecked – nach welcher Regel entscheidest du?',
      back: 'Leitfrage: **Kann der Aufrufer sinnvoll reagieren?** Erwartbares Umweltproblem → checked. Programmierfehler oder Vertragsbruch → unchecked. Im Spring-Backend dominieren unchecked Exceptions (Rollback + zentraler Handler).',
    },
    {
      id: 'f3',
      front: '`IllegalArgumentException` vs. `IllegalStateException`?',
      back: '`IllegalArgumentException`: das **Argument** ist falsch (Schuld des Aufrufers). `IllegalStateException`: das **Objekt** ist im falschen Zustand für diesen Aufruf (z. B. Konto geschlossen).',
    },
    {
      id: 'f4',
      front: 'Warum immer die `cause` mitgeben?',
      back: 'Ohne `cause` endet der Stacktrace bei deiner Übersetzung – die eigentliche Ursache ist weg.\n\n```java\ncatch (SQLException e) {\n    throw new DataAccessException("Query fehlgeschlagen", e);\n}\n```\nIm Log erscheint dann „Caused by: …“.',
    },
    {
      id: 'f5',
      front: 'Was macht try-with-resources besser als `finally { close(); }`?',
      back: 'Es schließt in **umgekehrter** Deklarationsreihenfolge und hängt eine Exception aus `close()` als **suppressed** an die eigentliche Exception. Beim manuellen `finally` überschreibt die `close()`-Exception die echte Ursache.',
    },
    {
      id: 'f6',
      front: 'Was sind **suppressed exceptions** und wie kommst du dran?',
      back: 'Exceptions, die beim automatischen `close()` auftreten, während schon eine andere fliegt.\n\n```java\nfor (Throwable s : e.getSuppressed()) {\n    log.warn("Beim Schliessen: {}", s.getMessage());\n}\n```',
    },
    {
      id: 'f7',
      front: 'Regeln für Multi-Catch?',
      back: '```java\ncatch (IOException | InterruptedException e) { ... }\n```\nDie Typen dürfen **nicht** verwandt sein (`IOException | FileNotFoundException` ist ein Compilefehler), und `e` ist implizit final.',
    },
    {
      id: 'f8',
      front: 'Was passiert bei `return` im `finally`-Block?',
      back: 'Das `finally`-`return` **gewinnt**: Es überschreibt den Rückgabewert aus `try` **und** verschluckt eine fliegende Exception. Deshalb: `finally` nur zum Aufräumen, nie mit `return` oder `throw`.',
    },
    {
      id: 'f9',
      front: 'Reihenfolge mehrerer `catch`-Blöcke?',
      back: 'Vom **speziellen zum allgemeinen**. Steht `catch (Exception e)` vor `catch (IOException e)`, meldet der Compiler „exception … has already been caught“.',
    },
    {
      id: 'f10',
      front: 'Optional oder Exception – wann was?',
      back: '`Optional<User> findById(...)` für „darf legitim fehlen“ (Suche). `User getById(...)` mit `orElseThrow(...)` für „muss existieren“. Exceptions sind kein Kontrollfluss – sie kosten den Stacktrace.',
    },
    {
      id: 'f11',
      front: 'Was ist am Umgang mit `InterruptedException` besonders?',
      back: 'Nie schlucken – der Interrupt-Status geht sonst verloren:\n\n```java\ncatch (InterruptedException e) {\n    Thread.currentThread().interrupt();\n    throw new IllegalStateException("abgebrochen", e);\n}\n```',
    },
    {
      id: 'f12',
      front: 'Wie behandelst du checked Exceptions in einer Stream-Pipeline?',
      back: 'Im Lambda fangen und übersetzen (`UncheckedIOException`) – oder besser eine benannte Methode mit dem `try/catch` extrahieren:\n\n```java\npaths.stream().map(this::readSafely).toList();\n```',
    },
    {
      id: 'f13',
      front: 'Wie sieht zentrales Exception-Handling in Spring aus?',
      back: '```java\n@RestControllerAdvice\nclass GlobalExceptionHandler {\n    @ExceptionHandler(UserNotFoundException.class)\n    ProblemDetail handle(UserNotFoundException e) {\n        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());\n    }\n}\n```\n`ProblemDetail` (RFC 7807) ist seit Spring 6 der Standard.',
    },
    {
      id: 'f14',
      front: 'Warum rollt `@Transactional` bei einer checked Exception nicht zurück?',
      back: 'Die Default-Regel ist **Rollback nur bei unchecked** (`RuntimeException`, `Error`). Für checked braucht es `@Transactional(rollbackFor = ImportException.class)`.',
    },
    {
      id: 'f15',
      front: 'Warum nicht „loggen **und** werfen“?',
      back: 'Sonst steht derselbe Fehler mehrfach im Log, jedes Mal mit halbem Kontext. Regel: **Wer wirft, loggt nicht. Wer endgültig behandelt, loggt** – dann einmal mit vollem Stacktrace (`log.error("msg", e)`).',
    },
    {
      id: 'f16',
      front: 'Welche Regel gilt beim Überschreiben einer Methode für `throws`?',
      back: 'Die überschreibende Methode darf **keine breiteren** checked Exceptions deklarieren – nur dieselben, engere oder gar keine. Unchecked Exceptions sind immer erlaubt.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was gibt diese Methode zurück?',
      code: `static int value() {
    try {
        throw new IllegalStateException("boom");
    } finally {
        return 42;
    }
}`,
      options: [
        'Sie wirft `IllegalStateException`',
        '`42` – das `return` im `finally` verwirft die Exception',
        '`0`',
        'Compilefehler – `return` ist im `finally` verboten',
      ],
      correct: 1,
      explanation: 'Ein `return` im `finally` überschreibt sowohl den Rückgabewert als auch eine fliegende Exception. Genau deshalb gehört in `finally` nur Aufräumcode.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `try {
    read();
} catch (IOException | FileNotFoundException e) {
    log.warn("failed", e);
}`,
      options: [
        'Multi-Catch erlaubt maximal einen Typ',
        '`FileNotFoundException` ist ein Subtyp von `IOException` – die Alternativen dürfen nicht verwandt sein',
        '`e` muss explizit `final` deklariert werden',
        '`log.warn` darf keine Exception als Argument bekommen',
      ],
      correct: 1,
      explanation: 'Im Multi-Catch müssen die Typen disjunkt sein, sonst wäre einer überflüssig. Hier reicht `catch (IOException e)`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `class R implements AutoCloseable {
    private final String name;
    R(String name) { this.name = name; System.out.print("open" + name + " "); }
    public void close() { System.out.print("close" + name + " "); }
}

try (R a = new R("A"); R b = new R("B")) {
    System.out.print("body ");
}`,
      options: ['`openA openB body closeA closeB`', '`openA openB body closeB closeA`', '`openA openB closeB closeA body`', '`openB openA body closeA closeB`'],
      correct: 1,
      explanation: 'Ressourcen werden in Deklarationsreihenfolge geöffnet und in **umgekehrter** Reihenfolge geschlossen – wie ein Stack.',
    },
    {
      id: 'q4',
      prompt: 'Welche Exception erreicht den Aufrufer und was passiert mit der anderen?',
      code: `try (R r = new R()) {   // r.close() wirft IllegalStateException("close")
    throw new IllegalArgumentException("body");
}`,
      options: [
        '`IllegalStateException("close")` – sie überschreibt die aus dem Body',
        '`IllegalArgumentException("body")`, die `close`-Exception hängt als suppressed daran',
        'Beide werden verschluckt',
        'Compilefehler – `close()` darf nicht werfen',
      ],
      correct: 1,
      explanation: 'try-with-resources priorisiert die Exception aus dem `try`-Block; die aus `close()` landet in `getSuppressed()`. Beim manuellen `finally { close(); }` wäre die echte Ursache verloren.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Bug?',
      code: `try {
    repository.save(order);
} catch (DataIntegrityViolationException e) {
    throw new OrderNotSavedException("Bestellung konnte nicht gespeichert werden");
}`,
      options: [
        'Kein Bug',
        'Die `cause` fehlt – der Stacktrace der Ursache geht verloren',
        '`DataIntegrityViolationException` ist checked und muss deklariert werden',
        'Der `catch`-Block müsste `Exception` fangen',
      ],
      correct: 1,
      explanation: 'Richtig wäre `new OrderNotSavedException("…", e)`. Ohne `cause` fehlt im Log das „Caused by:“ und damit die eigentliche Fehlerstelle.',
    },
    {
      id: 'q6',
      prompt: 'Welche Exception passt fachlich?',
      code: `void withdraw(Account account, BigDecimal amount) {
    // amount ist negativ         → (A)
    // account ist bereits geschlossen → (B)
}`,
      options: [
        '(A) `IllegalStateException`, (B) `IllegalArgumentException`',
        '(A) und (B) beide `RuntimeException`',
        '(A) `IllegalArgumentException`, (B) `IllegalStateException`',
        '(A) `NullPointerException`, (B) `UnsupportedOperationException`',
      ],
      correct: 2,
      explanation: 'Das Argument ist falsch → `IllegalArgumentException`. Das Objekt ist im falschen Zustand für diese Operation → `IllegalStateException`.',
    },
    {
      id: 'q7',
      prompt: 'Warum kompiliert das nicht?',
      code: `List<String> contents = paths.stream()
    .map(path -> Files.readString(path))
    .toList();`,
      options: [
        '`Files.readString` gibt kein `String` zurück',
        '`map` akzeptiert keine Method References',
        '`Files.readString` wirft die checked `IOException`; `Function.apply` deklariert kein `throws`',
        '`toList()` gibt es erst ab Java 22',
      ],
      correct: 2,
      explanation: 'Die `java.util.function`-Typen deklarieren keine checked Exceptions. Lösung: im Lambda fangen und in `UncheckedIOException` übersetzen – oder eine benannte Methode mit `try/catch` extrahieren.',
    },
    {
      id: 'q8',
      prompt: 'Welche Variante ist Clean Code?',
      code: `// A
try { return list.get(0); } catch (IndexOutOfBoundsException e) { return null; }

// B
return list.isEmpty() ? null : list.get(0);

// C
return list.stream().findFirst().orElse(null);`,
      options: [
        'A – robust gegen jede Listenimplementierung',
        'B oder C – Exceptions sind kein Kontrollfluss',
        'A und C sind gleichwertig',
        'Keine – man sollte immer `get(0)` ohne Prüfung aufrufen',
      ],
      correct: 1,
      explanation: 'Exceptions für vorhersehbare Fälle sind teuer und verschleiern die Absicht. Noch besser als `null`: `Optional<T> first()` als Rückgabetyp.',
    },
    {
      id: 'q9',
      prompt: 'Welche Aussage zu `@Transactional` und Exceptions stimmt?',
      options: [
        'Es wird bei jeder Exception zurückgerollt',
        'Es wird nur bei checked Exceptions zurückgerollt',
        'Standardmäßig nur bei unchecked Exceptions und `Error`; für checked braucht es `rollbackFor`',
        'Rollback passiert nur, wenn man `TransactionAspectSupport` manuell aufruft',
      ],
      correct: 2,
      explanation: 'Default-Regel von Spring: Rollback bei `RuntimeException` und `Error`. Eine checked Exception committet sonst die Transaktion – ein klassischer Produktionsbug.',
    },
    {
      id: 'q10',
      prompt: 'Wo ist der Bug?',
      code: `public void importAll(List<Path> files) {
    for (Path file : files) {
        try {
            importer.run(file);
        } catch (Exception e) {
            log.error("Import fehlgeschlagen", e);
        }
    }
}`,
      options: [
        'Kein Bug – jede Datei wird unabhängig verarbeitet',
        '`catch (Exception e)` fängt auch Programmierfehler (NPE) und `InterruptedException` – der Import „gelingt“ scheinbar trotz Bugs',
        '`log.error` darf keine Exception als zweites Argument bekommen',
        'Die Schleife müsste ein `finally` haben',
      ],
      correct: 1,
      explanation: 'Der zu breite `catch` verwandelt Bugs in Logzeilen: Der Aufrufer erfährt nie, dass nichts importiert wurde. Besser gezielt fangen, Fehler sammeln und am Ende ein Ergebnis mit Fehlerliste zurückgeben oder werfen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Fail Fast: Eingaben prüfen',
      level: 1,
      description: `Implementiere in \`Solution\` die typischen Guard-Methoden:

- \`static int requirePositive(int value)\` – gibt \`value\` zurück; bei \`value <= 0\` eine \`IllegalArgumentException\`, deren Meldung den Wert enthält
- \`static String requireNonBlank(String value, String field)\` – gibt den **getrimmten** Wert zurück; bei \`null\` oder blank eine \`IllegalArgumentException\`, deren Meldung \`field\` enthält
- \`static int parseOrDefault(String raw, int fallback)\` – parst \`raw\` als \`int\`; bei \`null\` oder ungültiger Eingabe den \`fallback\` (keine Exception nach außen)`,
      starter: `class Solution {

    static int requirePositive(int value) {
        // TODO
        return -1;
    }

    static String requireNonBlank(String value, String field) {
        // TODO
        return null;
    }

    static int parseOrDefault(String raw, int fallback) {
        // TODO
        return -1;
    }
}`,
      solution: `class Solution {

    static int requirePositive(int value) {
        if (value <= 0) {
            throw new IllegalArgumentException("Wert muss > 0 sein, war: " + value);
        }
        return value;
    }

    static String requireNonBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " darf nicht leer sein");
        }
        return value.trim();
    }

    static int parseOrDefault(String raw, int fallback) {
        if (raw == null) {
            return fallback;
        }
        try {
            return Integer.parseInt(raw.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }
}`,
      hints: [
        'Guard Clauses stehen am Methodenanfang: ungültiger Fall zuerst prüfen und sofort werfen, danach läuft nur noch der Normalfall.',
        'Bausteine: `String.isBlank()`, `String.trim()`, `Integer.parseInt(...)` wirft `NumberFormatException` (unchecked), `IllegalArgumentException(String message)`.',
        'Pseudocode: requirePositive → `if (value <= 0) throw …; return value;`. requireNonBlank → `if (value == null || value.isBlank()) throw …; return value.trim();`. parseOrDefault → `null`-Guard, dann `try { parseInt } catch (NumberFormatException) { return fallback; }`.',
        '```java\nstatic String requireNonBlank(String value, String field) {\n    if (value == null || value.isBlank()) {\n        throw new IllegalArgumentException(field + " darf nicht leer sein");\n    }\n    return value./* ... */;\n}\n```',
      ],
      tests: `check("requirePositive gibt den Wert zurueck", 5, Solution.requirePositive(5));
checkThrows("requirePositive bei 0", IllegalArgumentException.class, () -> Solution.requirePositive(0));
checkThrows("requirePositive bei negativem Wert", IllegalArgumentException.class, () -> Solution.requirePositive(-3));
check("requireNonBlank trimmt", "Anna", Solution.requireNonBlank("  Anna ", "name"));
checkThrows("requireNonBlank bei null", IllegalArgumentException.class, () -> Solution.requireNonBlank(null, "name"));
checkThrows("requireNonBlank bei Leerzeichen", IllegalArgumentException.class, () -> Solution.requireNonBlank("   ", "name"));
try {
    Solution.requireNonBlank(" ", "email");
    checkTrue("Meldung nennt das Feld", false);
} catch (IllegalArgumentException e) {
    checkTrue("Meldung nennt das Feld", e.getMessage() != null && e.getMessage().contains("email"));
}
check("parseOrDefault bei gueltiger Zahl", 42, Solution.parseOrDefault("42", 0));
check("parseOrDefault mit Leerzeichen", 7, Solution.parseOrDefault(" 7 ", 0));
check("parseOrDefault bei Muell", 7, Solution.parseOrDefault("x1", 7));
check("parseOrDefault bei null", 7, Solution.parseOrDefault(null, 7));
check("parseOrDefault bei leerem String", -1, Solution.parseOrDefault("", -1));`,
    },
    {
      id: 'k2',
      title: 'Checked übersetzen, cause behalten',
      level: 2,
      description: `\`LegacyStore.load(key)\` wirft die **checked** \`StoreException\`. Die will niemand durch alle Schichten schleppen.

Implementiere in \`Solution\`:

- \`static String loadName(String key)\` – ruft \`LegacyStore.load(key)\`. Bei \`StoreException\` eine \`LoadFailedException\` werfen, deren Meldung den \`key\` enthält und die die ursprüngliche Exception als **cause** trägt.
- \`static Optional<String> findName(String key)\` – dieselbe Quelle, aber „darf fehlen“: bei \`StoreException\` ein leeres \`Optional\`.

Merke dir den Unterschied: \`loadName\` = Vertragsbruch (Exception), \`findName\` = Suche (Optional).`,
      given: `class StoreException extends Exception {
    StoreException(String message) {
        super(message);
    }
}

class LegacyStore {
    private static final Map<String, String> DATA = Map.of("1", "Anna", "2", "Bo");

    static String load(String key) throws StoreException {
        if (key == null) {
            throw new StoreException("key is null");
        }
        String value = DATA.get(key);
        if (value == null) {
            throw new StoreException("no entry for " + key);
        }
        return value;
    }
}

class LoadFailedException extends RuntimeException {
    LoadFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}`,
      starter: `class Solution {

    static String loadName(String key) {
        // TODO
        return null;
    }

    static Optional<String> findName(String key) {
        // TODO
        return Optional.empty();
    }
}`,
      solution: `class Solution {

    static String loadName(String key) {
        try {
            return LegacyStore.load(key);
        } catch (StoreException e) {
            throw new LoadFailedException("Laden fehlgeschlagen fuer Key: " + key, e);
        }
    }

    static Optional<String> findName(String key) {
        try {
            return Optional.of(LegacyStore.load(key));
        } catch (StoreException e) {
            return Optional.empty();
        }
    }
}`,
      hints: [
        'Eine checked Exception an der Schicht-Grenze übersetzen: fangen, in eine fachliche unchecked Exception verpacken, **cause** mitgeben. Für den Suchfall stattdessen ein leeres `Optional` liefern.',
        'Bausteine: `try { … } catch (StoreException e) { … }`, `new LoadFailedException(message, e)`, `Optional.of(...)`, `Optional.empty()`.',
        'Pseudocode: loadName → `try { return LegacyStore.load(key); } catch (StoreException e) { throw new LoadFailedException("… " + key, e); }`. findName → derselbe Aufruf, im catch `Optional.empty()`.',
        '```java\nstatic String loadName(String key) {\n    try {\n        return LegacyStore.load(key);\n    } catch (StoreException e) {\n        throw new LoadFailedException("Laden fehlgeschlagen fuer Key: " + key, /* ... */);\n    }\n}\n```',
      ],
      tests: `check("loadName bei bekanntem Key", "Anna", Solution.loadName("1"));
checkThrows("loadName bei unbekanntem Key", LoadFailedException.class, () -> Solution.loadName("99"));
checkThrows("loadName bei null", LoadFailedException.class, () -> Solution.loadName(null));
try {
    Solution.loadName("99");
    checkTrue("cause ist gesetzt", false);
} catch (LoadFailedException e) {
    checkTrue("cause ist eine StoreException", e.getCause() instanceof StoreException);
    checkTrue("Meldung enthaelt den Key", e.getMessage() != null && e.getMessage().contains("99"));
}
check("findName bei bekanntem Key", Optional.of("Bo"), Solution.findName("2"));
check("findName bei unbekanntem Key", Optional.empty(), Solution.findName("99"));
check("findName bei null", Optional.empty(), Solution.findName(null));`,
    },
    {
      id: 'k3',
      title: 'try-with-resources und suppressed exceptions',
      level: 3,
      description: `\`Resource\` implementiert \`AutoCloseable\` und protokolliert jeden Schritt in eine Liste. Implementiere in \`Solution\`:

- \`static List<String> useTwo(String first, String second)\` – beide Ressourcen in **einem** try-with-resources öffnen (\`failOnClose = false\`), auf beiden \`use()\` aufrufen, das Log zurückgeben
- \`static List<String> closedOnFailure(String name)\` – eine Ressource öffnen, \`use()\` aufrufen, dann eine \`IllegalStateException("fail")\` werfen, diese **im selben Methodenrumpf** fangen und das Log zurückgeben
- \`static String suppressedMessageOf(String name)\` – eine Ressource mit \`failOnClose = true\` öffnen, im try-Block eine \`IllegalArgumentException("boom")\` werfen, sie fangen und die Meldung der **ersten suppressed exception** zurückgeben (keine vorhanden → \`"keine"\`)

Achte auf die Reihenfolge, in der geschlossen wird.`,
      given: `class Resource implements AutoCloseable {
    private final String name;
    private final boolean failOnClose;
    private final List<String> log;

    Resource(String name, boolean failOnClose, List<String> log) {
        this.name = name;
        this.failOnClose = failOnClose;
        this.log = log;
    }

    void use() {
        log.add("use:" + name);
    }

    @Override
    public void close() {
        log.add("close:" + name);
        if (failOnClose) {
            throw new IllegalStateException("close " + name);
        }
    }
}`,
      starter: `class Solution {

    static List<String> useTwo(String first, String second) {
        // TODO
        return null;
    }

    static List<String> closedOnFailure(String name) {
        // TODO
        return null;
    }

    static String suppressedMessageOf(String name) {
        // TODO
        return "keine";
    }
}`,
      solution: `class Solution {

    static List<String> useTwo(String first, String second) {
        List<String> log = new ArrayList<>();
        try (Resource a = new Resource(first, false, log);
             Resource b = new Resource(second, false, log)) {
            a.use();
            b.use();
        }
        return log;
    }

    static List<String> closedOnFailure(String name) {
        List<String> log = new ArrayList<>();
        try (Resource resource = new Resource(name, false, log)) {
            resource.use();
            throw new IllegalStateException("fail");
        } catch (IllegalStateException e) {
            return log;
        }
    }

    static String suppressedMessageOf(String name) {
        List<String> log = new ArrayList<>();
        try (Resource resource = new Resource(name, true, log)) {
            resource.use();
            throw new IllegalArgumentException("boom");
        } catch (IllegalArgumentException e) {
            Throwable[] suppressed = e.getSuppressed();
            return suppressed.length == 0 ? "keine" : suppressed[0].getMessage();
        }
    }
}`,
      hints: [
        'Mehrere Ressourcen werden im Kopf durch `;` getrennt und in **umgekehrter** Reihenfolge geschlossen. Fliegt im try-Block eine Exception und wirft auch `close()`, gewinnt die aus dem try-Block – die andere wird suppressed.',
        'Bausteine: `try (Resource a = …; Resource b = …) { … }`, `Throwable.getSuppressed()` liefert ein `Throwable[]`, `Throwable.getMessage()`.',
        'Pseudocode: Log-Liste anlegen, Ressourcen im try-Kopf erzeugen (Log durchreichen), im Body `use()` aufrufen, danach das Log zurückgeben. Für suppressed: im catch `getSuppressed()` prüfen – leer → `"keine"`, sonst `suppressed[0].getMessage()`.',
        '```java\nstatic String suppressedMessageOf(String name) {\n    List<String> log = new ArrayList<>();\n    try (Resource resource = new Resource(name, true, log)) {\n        throw new IllegalArgumentException("boom");\n    } catch (IllegalArgumentException e) {\n        Throwable[] suppressed = e.getSuppressed();\n        return /* ... */;\n    }\n}\n```',
      ],
      tests: `check("useTwo Reihenfolge", List.of("use:a", "use:b", "close:b", "close:a"), Solution.useTwo("a", "b"));
check("useTwo mit gleichen Namen", List.of("use:x", "use:x", "close:x", "close:x"), Solution.useTwo("x", "x"));
check("closedOnFailure schliesst trotz Exception", List.of("use:r", "close:r"), Solution.closedOnFailure("r"));
check("closedOnFailure anderer Name", List.of("use:db", "close:db"), Solution.closedOnFailure("db"));
check("suppressed Meldung", "close r", Solution.suppressedMessageOf("r"));
check("suppressed Meldung anderer Name", "close q", Solution.suppressedMessageOf("q"));
checkTrue("es gibt ueberhaupt eine suppressed exception", !Solution.suppressedMessageOf("z").equals("keine"));`,
    },
    {
      id: 'k4',
      title: 'Optional vs. Exception im Service',
      level: 4,
      description: `Baue die typische Service-Schicht: Das Repository liefert \`Optional\`, der Service übersetzt in eine fachliche Exception.

Implementiere in \`Solution\`:

- \`static Optional<User> findById(List<User> users, Long id)\` – leeres \`Optional\` bei unbekannter oder \`null\`-Id
- \`static User getById(List<User> users, Long id)\` – sonst \`UserNotFoundException\` (nutze \`orElseThrow\`)
- \`static List<String> emailsOf(List<User> users, List<Long> ids)\` – E-Mails in der Reihenfolge der \`ids\`; eine unbekannte Id bricht mit \`UserNotFoundException\` ab
- \`static List<String> emailsOfKnown(List<User> users, List<Long> ids)\` – unbekannte Ids werden **übersprungen**

Kein \`try/catch\` nötig – arbeite mit \`Optional\` und Streams.`,
      given: `record User(Long id, String email) {}

class UserNotFoundException extends RuntimeException {
    private final Long userId;

    UserNotFoundException(Long userId) {
        super("User nicht gefunden: " + userId);
        this.userId = userId;
    }

    Long userId() {
        return userId;
    }
}`,
      starter: `class Solution {

    static Optional<User> findById(List<User> users, Long id) {
        // TODO
        return Optional.empty();
    }

    static User getById(List<User> users, Long id) {
        // TODO
        return null;
    }

    static List<String> emailsOf(List<User> users, List<Long> ids) {
        // TODO
        return List.of();
    }

    static List<String> emailsOfKnown(List<User> users, List<Long> ids) {
        // TODO
        return List.of();
    }
}`,
      solution: `class Solution {

    static Optional<User> findById(List<User> users, Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return users.stream()
                .filter(user -> id.equals(user.id()))
                .findFirst();
    }

    static User getById(List<User> users, Long id) {
        return findById(users, id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    static List<String> emailsOf(List<User> users, List<Long> ids) {
        return ids.stream()
                .map(id -> getById(users, id).email())
                .toList();
    }

    static List<String> emailsOfKnown(List<User> users, List<Long> ids) {
        return ids.stream()
                .map(id -> findById(users, id))
                .flatMap(Optional::stream)
                .map(User::email)
                .toList();
    }
}`,
      hints: [
        '`findById` ist die Suche (darf leer sein), `getById` der Vertrag (muss liefern). Die beiden Listen-Methoden unterscheiden sich nur darin, welche der beiden sie verwenden.',
        'Bausteine: `Stream.filter`, `Stream.findFirst`, `Optional.orElseThrow(Supplier)`, `Optional::stream` in Kombination mit `flatMap`, `Long.equals` (nicht `==`!).',
        'Pseudocode: findById → `null`-Guard, dann streamen und `findFirst`. getById → `findById(...).orElseThrow(() -> new UserNotFoundException(id))`. emailsOf → `ids.stream().map(id -> getById(...).email()).toList()`. emailsOfKnown → `map(findById).flatMap(Optional::stream).map(User::email)`.',
        '```java\nstatic List<String> emailsOfKnown(List<User> users, List<Long> ids) {\n    return ids.stream()\n            .map(id -> findById(users, id))\n            .flatMap(/* ... */)\n            .map(User::email)\n            .toList();\n}\n```',
      ],
      tests: `List<User> users = List.of(new User(1L, "anna@example.com"), new User(2L, "bo@example.com"));

check("findById mit Treffer", Optional.of(new User(1L, "anna@example.com")), Solution.findById(users, 1L));
check("findById ohne Treffer", Optional.empty(), Solution.findById(users, 9L));
check("findById bei null-Id", Optional.empty(), Solution.findById(users, null));
check("findById in leerer Liste", Optional.empty(), Solution.findById(List.of(), 1L));
check("getById", "bo@example.com", Solution.getById(users, 2L).email());
checkThrows("getById wirft UserNotFoundException", UserNotFoundException.class, () -> Solution.getById(users, 9L));
try {
    Solution.getById(users, 9L);
    checkTrue("Exception traegt die Id", false);
} catch (UserNotFoundException e) {
    check("Exception traegt die Id", 9L, e.userId());
    checkTrue("Meldung enthaelt die Id", e.getMessage() != null && e.getMessage().contains("9"));
}
check("emailsOf", List.of("anna@example.com", "bo@example.com"), Solution.emailsOf(users, List.of(1L, 2L)));
checkThrows("emailsOf bricht bei unbekannter Id ab", UserNotFoundException.class,
        () -> Solution.emailsOf(users, List.of(1L, 9L)));
check("emailsOfKnown ueberspringt Unbekanntes", List.of("anna@example.com"), Solution.emailsOfKnown(users, List.of(1L, 9L)));
check("emailsOfKnown bei leerer Id-Liste", List.of(), Solution.emailsOfKnown(users, List.of()));
check("emailsOfKnown wenn nichts passt", List.of(), Solution.emailsOfKnown(users, List.of(7L, 8L)));`,
    },
  ],
}

export default chapter
