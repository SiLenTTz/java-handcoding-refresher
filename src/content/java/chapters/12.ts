import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '12',
  flashcards: [
    {
      id: 'f1',
      front: 'Was ist ein **Functional Interface**?',
      back: 'Ein Interface mit **genau einer abstrakten Methode** (SAM). `default`-, `static`- und `private`-Methoden zählen nicht mit, ebenso wenig re-deklarierte `Object`-Methoden wie `equals` oder `toString`. `@FunctionalInterface` lässt den Compiler das prüfen.',
    },
    {
      id: 'f2',
      front: 'Signaturen von `Function`, `Predicate`, `Supplier`, `Consumer`?',
      back: '```text\nFunction<T,R>  T -> R        apply\nPredicate<T>   T -> boolean  test\nSupplier<T>    () -> T       get\nConsumer<T>    T -> void     accept\n```',
    },
    {
      id: 'f3',
      front: 'Was ist der Unterschied zwischen `UnaryOperator<T>` und `Function<T,R>`?',
      back: '`UnaryOperator<T> extends Function<T,T>` – Ein- und Ausgabetyp sind identisch. Analog: `BinaryOperator<T> extends BiFunction<T,T,T>`. Nützlich z. B. bei `List.replaceAll(UnaryOperator<E>)`.',
    },
    {
      id: 'f4',
      front: 'Was bedeutet **effektiv final** und warum verlangt Java das?',
      back: 'Eine lokale Variable, die nach der Initialisierung nie wieder zugewiesen wird. Lambdas kopieren den Wert (Capture by Value) und können den Stackframe überleben (Thread, Callback) – deshalb muss der Wert stabil sein. **Felder** sind davon nicht betroffen.',
    },
    {
      id: 'f5',
      front: 'Rechne vor: `plus2.andThen(times3).apply(1)` vs. `plus2.compose(times3).apply(1)`',
      back: '```java\nplus2.andThen(times3).apply(1); // (1+2)*3 = 9  → erst this, dann after\nplus2.compose(times3).apply(1); // (1*3)+2 = 5  → erst before, dann this\n```',
    },
    {
      id: 'f6',
      front: 'Wie negierst du `String::isBlank` als `Predicate`?',
      back: '```java\nnames.stream().filter(Predicate.not(String::isBlank));\n```\n`!String::isBlank` gibt es nicht. Auf einer *Variablen* geht auch `predicate.negate()`.',
    },
    {
      id: 'f7',
      front: 'Die **vier Arten** von Method References?',
      back: '1. `Integer::parseInt` – statische Methode\n2. `System.out::println` – Methode eines konkreten Objekts\n3. `String::toUpperCase` – Methode eines *beliebigen* Objekts des Typs (erster Parameter wird Empfänger)\n4. `ArrayList::new` / `String[]::new` – Konstruktor',
    },
    {
      id: 'f8',
      front: 'Wie unterscheidet sich `this` im Lambda von `this` in einer anonymen Klasse?',
      back: 'Im **Lambda** ist `this` die umschließende Instanz (Lambdas haben keinen eigenen Scope). In der **anonymen Klasse** ist `this` die anonyme Instanz – auf die äußere kommt man nur über `Outer.this`.',
    },
    {
      id: 'f9',
      front: 'Warum gibt es primitive Varianten wie `IntPredicate` oder `ToIntFunction<T>`?',
      back: 'Sie vermeiden **Autoboxing**. `Predicate<Integer>` boxt bei jedem Test ein `int` in ein `Integer` (Allokation + Indirektion). Namensregel: `ToXxx…` = Rückgabe primitiv, `XxxFunction` = Parameter primitiv.',
    },
    {
      id: 'f10',
      front: 'Warum ist `var f = x -> x;` ein Compilefehler?',
      back: '**Target Typing**: Ein Lambda hat keinen eigenen Typ, der Zieltyp bestimmt das Interface. Ohne deklarierten Zieltyp kann der Compiler nicht entscheiden, ob `Function`, `UnaryOperator` oder ein eigenes Interface gemeint ist.',
    },
    {
      id: 'f11',
      front: 'Wie behandelst du eine **checked Exception** in einem Lambda?',
      back: 'Die `java.util.function`-Typen deklarieren kein `throws`. Entweder im Lambda fangen und in eine unchecked Exception übersetzen (`UncheckedIOException`), oder ein eigenes Functional Interface mit `throws` definieren.\n\n```java\npaths.stream().map(this::readSafely).toList();\n```',
    },
    {
      id: 'f12',
      front: 'Warum `orElseGet(...)` statt `orElse(...)`?',
      back: '`orElse(loadFromDb())` wertet das Argument **immer** aus – auch wenn der `Optional` gefüllt ist. `orElseGet(this::loadFromDb)` nimmt einen `Supplier` und ist damit **lazy**.',
    },
    {
      id: 'f13',
      front: 'Was macht `.reversed()` in `Comparator.comparing(a).thenComparing(b).reversed()`?',
      back: 'Es dreht die **gesamte** bisher gebaute Kette um, nicht nur `b`. Willst du nur einen Schlüssel absteigend: `thenComparing(b, Comparator.reverseOrder())`.',
    },
    {
      id: 'f14',
      front: 'Wann lohnt sich ein **eigenes** Functional Interface?',
      back: 'Wenn der Name fachlich etwas trägt (`PriceRule` statt `Function<Order, BigDecimal>`), wenn mehr als zwei Parameter nötig sind, oder wenn eine checked Exception in der Signatur stehen muss. Dazu passen `default`-Methoden für Komposition.',
    },
    {
      id: 'f15',
      front: 'Wie sieht **Strategy per Lambda** im Service aus?',
      back: '```java\nprivate static final Map<CustomerType, UnaryOperator<BigDecimal>> RULES = Map.of(\n    CustomerType.STANDARD, amount -> amount,\n    CustomerType.VIP,      amount -> amount.multiply(new BigDecimal("0.80")));\n\nBigDecimal price(BigDecimal amount, CustomerType type) {\n    return RULES.get(type).apply(amount);\n}\n```',
    },
    {
      id: 'f16',
      front: 'Clean-Code-Regel für die Länge eines Lambdas?',
      back: 'Mehr als ~3 Zeilen → in eine benannte Methode extrahieren und per Method Reference referenzieren. Das Lambda soll die Pipeline lesbar halten, nicht Logik verstecken.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `Function<Integer, Integer> plus2 = n -> n + 2;
Function<Integer, Integer> times3 = n -> n * 3;
System.out.println(plus2.compose(times3).apply(4));`,
      options: ['`18`', '`14`', '`12`', '`20`'],
      correct: 1,
      explanation: '`compose` führt zuerst das **Argument** aus: `4 * 3 = 12`, danach `this`: `12 + 2 = 14`. Mit `andThen` wäre es `(4+2)*3 = 18`.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `int total = 0;
List.of(1, 2, 3).forEach(n -> total += n);
System.out.println(total);`,
      options: [
        '`forEach` akzeptiert kein Lambda',
        '`total` müsste `Integer` sein',
        '`total` ist nicht effektiv final – Lambdas dürfen lokale Variablen nicht verändern',
        'Der Lambda-Body braucht geschweifte Klammern',
      ],
      correct: 2,
      explanation: 'Lambdas erfassen lokale Variablen per Wert; sie müssen effektiv final sein. Lösung: `int total = List.of(1,2,3).stream().mapToInt(Integer::intValue).sum();`',
    },
    {
      id: 'q3',
      prompt: 'Welche Zeile kompiliert **nicht**?',
      code: `List<String> names = new ArrayList<>(List.of("Anna", " ", "Bo"));

names.removeIf(String::isBlank);                    // (a)
names.stream().filter(!String::isBlank).toList();   // (b)
names.stream().filter(Predicate.not(String::isBlank)).toList(); // (c)
names.replaceAll(String::trim);                     // (d)`,
      options: ['(a)', '(b)', '(c)', '(d)'],
      correct: 1,
      explanation: 'Eine Method Reference ist kein `boolean`-Ausdruck, `!` ist darauf nicht anwendbar. Der korrekte Weg ist `Predicate.not(...)` oder `predicate.negate()`.',
    },
    {
      id: 'q4',
      prompt: 'Was gibt dieses Programm aus?',
      code: `class Box {
    private final String name = "Box";

    Runnable lambda() { return () -> System.out.println(name); }

    Runnable anonymous() {
        return new Runnable() {
            private final String name = "Anonym";
            @Override public void run() { System.out.println(name); }
        };
    }
}
new Box().lambda().run();
new Box().anonymous().run();`,
      options: ['`Box` / `Box`', '`Box` / `Anonym`', '`Anonym` / `Anonym`', 'Compilefehler – Feld `name` doppelt'],
      correct: 1,
      explanation: 'Das Lambda hat keinen eigenen Scope, `name` ist das Feld von `Box`. Die anonyme Klasse hat einen eigenen Scope und ein eigenes Feld `name`, das das äußere verdeckt.',
    },
    {
      id: 'q5',
      prompt: 'Welcher funktionale Typ passt zu `String[]::new`?',
      options: ['`Supplier<String[]>`', '`Function<String, String[]>`', '`IntFunction<String[]>`', '`UnaryOperator<String[]>`'],
      correct: 2,
      explanation: 'Ein Array-Konstruktor nimmt die Länge als `int` und liefert das Array – genau `IntFunction<String[]>`. Deshalb funktioniert `stream.toArray(String[]::new)`.',
    },
    {
      id: 'q6',
      prompt: 'Wo ist der Bug?',
      code: `String name = repository.findName(id)
    .orElse(loadDefaultFromDatabase());`,
      options: [
        'Kein Bug – so ist `orElse` gedacht',
        '`loadDefaultFromDatabase()` wird immer ausgeführt, auch wenn der Optional gefüllt ist → `orElseGet(this::loadDefaultFromDatabase)`',
        '`orElse` darf nur Literale bekommen, sonst Compilefehler',
        '`orElse` wirft eine `NoSuchElementException`, wenn der Optional leer ist',
      ],
      correct: 1,
      explanation: '`orElse` bekommt einen **Wert**, das Argument wird also vorher ausgewertet. `orElseGet` bekommt einen `Supplier` und ruft ihn nur im leeren Fall auf.',
    },
    {
      id: 'q7',
      prompt: 'Was wird ausgegeben?',
      code: `BiFunction<String, String, Boolean> f = String::startsWith;
System.out.println(f.apply("javaland", "java"));`,
      options: ['`false`', '`true`', 'Compilefehler – `startsWith` ist keine statische Methode', '`null`'],
      correct: 1,
      explanation: 'Method Reference vom Typ „Instanzmethode eines beliebigen Objekts“: Der **erste** Parameter wird zum Empfänger. Das Lambda dazu wäre `(a, b) -> a.startsWith(b)`.',
    },
    {
      id: 'q8',
      prompt: 'Welches Interface ist **kein** gültiges Functional Interface?',
      code: `@FunctionalInterface interface A { int run(); default int twice() { return run() * 2; } }   // (a)
@FunctionalInterface interface B { int run(); static B noop() { return () -> 0; } }           // (b)
@FunctionalInterface interface C { int run(); boolean equals(Object o); }                     // (c)
@FunctionalInterface interface D { int run(); int stop(); }                                   // (d)`,
      options: ['(a)', '(b)', '(c)', '(d)'],
      correct: 3,
      explanation: '`D` hat zwei abstrakte Methoden. `default` und `static` zählen nicht mit, und re-deklarierte `Object`-Methoden wie `equals` ebenfalls nicht.',
    },
    {
      id: 'q9',
      prompt: 'Welche Sortierung liefert diese Zeile?',
      code: `users.sort(Comparator.comparing(User::lastName)
                     .thenComparing(User::age)
                     .reversed());`,
      options: [
        'Nachname aufsteigend, Alter absteigend',
        'Nachname absteigend, bei gleichem Nachnamen Alter absteigend',
        'Nachname aufsteigend, Alter aufsteigend',
        'Nur nach Alter absteigend',
      ],
      correct: 1,
      explanation: '`reversed()` dreht die **gesamte** Kette um. Für „Nachname aufsteigend, Alter absteigend“: `.thenComparing(User::age, Comparator.reverseOrder())`.',
    },
    {
      id: 'q10',
      prompt: 'Welche Variante ist Clean Code?',
      code: `// A
orders.stream().map(o -> { var d = o.total().multiply(RATE);
    var n = o.total().subtract(d); return n.setScale(2, RoundingMode.HALF_UP); }).toList();

// B
orders.stream().map(this::discountedTotal).toList();

// C
orders.stream().map(o -> discountedTotal(o)).toList();`,
      options: [
        'A – alles an einer Stelle sichtbar',
        'C – Lambda ist expliziter als eine Method Reference',
        'B – die Logik steckt in einer benannten Methode, die Pipeline bleibt lesbar',
        'Alle drei sind gleichwertig',
      ],
      correct: 2,
      explanation: 'Mehrzeilige Lambdas verstecken Logik in der Pipeline. B extrahiert sie in eine benannte, testbare Methode; C ist eine unnötige Lambda-Hülle um genau diesen Aufruf.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Die Function-Familie',
      level: 1,
      description: `Gib in \`Solution\` jeweils die passende Implementierung des Functional Interface **zurück** (nicht das Ergebnis!):

- \`static Function<String, Integer> length()\` – Länge des Strings
- \`static Predicate<String> notBlank()\` – \`true\`, wenn der String nicht leer/blank ist
- \`static Supplier<List<String>> newNameList()\` – liefert bei **jedem** Aufruf eine neue, veränderbare, leere Liste
- \`static UnaryOperator<String> shout()\` – trimmen, in Großbuchstaben, \`"!"\` anhängen
- \`static BinaryOperator<Integer> larger()\` – der größere der beiden Werte

Nutze Method References, wo sie ohne Umformung möglich sind.`,
      starter: `class Solution {

    static Function<String, Integer> length() {
        // TODO
        return null;
    }

    static Predicate<String> notBlank() {
        // TODO
        return null;
    }

    static Supplier<List<String>> newNameList() {
        // TODO
        return null;
    }

    static UnaryOperator<String> shout() {
        // TODO
        return null;
    }

    static BinaryOperator<Integer> larger() {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Function<String, Integer> length() {
        return String::length;
    }

    static Predicate<String> notBlank() {
        return Predicate.not(String::isBlank);
    }

    static Supplier<List<String>> newNameList() {
        return ArrayList::new;
    }

    static UnaryOperator<String> shout() {
        return value -> value.trim().toUpperCase() + "!";
    }

    static BinaryOperator<Integer> larger() {
        return Integer::max;
    }
}`,
      hints: [
        'Jede Methode gibt ein **Verhalten** zurück, keinen Wert. Der Rückgabetyp verrät die Signatur: `Function<String,Integer>` ist `String -> int`, `Supplier<T>` ist `() -> T`.',
        'Passende Bausteine: `String::length`, `Predicate.not(...)`, `String::isBlank`, `ArrayList::new`, `Integer::max`, `String::trim`, `String::toUpperCase`.',
        'Pseudocode: length → Method Reference auf `length`. notBlank → `Predicate.not` auf `isBlank`. newNameList → Konstruktor-Referenz. shout → Lambda mit trim + toUpperCase + "!". larger → Method Reference auf `Integer.max`.',
        '```java\nstatic Predicate<String> notBlank() {\n    return Predicate.not(String::isBlank);\n}\n\nstatic Supplier<List<String>> newNameList() {\n    return ArrayList::new;\n}\n```',
      ],
      tests: `check("length", 5, Solution.length().apply("hello"));
check("length leerer String", 0, Solution.length().apply(""));
checkTrue("notBlank bei Text", Solution.notBlank().test("a"));
checkTrue("notBlank bei Leerzeichen", !Solution.notBlank().test("   "));
checkTrue("notBlank bei leerem String", !Solution.notBlank().test(""));
List<String> names = Solution.newNameList().get();
check("Supplier liefert leere Liste", 0, names.size());
names.add("Anna");
checkTrue("Supplier liefert jedes Mal eine neue Liste", Solution.newNameList().get().isEmpty());
check("shout", "HALLO!", Solution.shout().apply("  hallo "));
check("shout bei leerem String", "!", Solution.shout().apply("   "));
check("larger", 9, Solution.larger().apply(9, 3));
check("larger bei Gleichstand", 4, Solution.larger().apply(4, 4));`,
    },
    {
      id: 'k2',
      title: 'Komposition: andThen, compose, and, negate',
      level: 2,
      description: `Baue in \`Solution\` zusammengesetzte Funktionen – **ohne** die Logik selbst auszurechnen, nur durch Kombinieren:

- \`static Function<Integer, Integer> addThenMultiply(int add, int factor)\` – erst \`+ add\`, dann \`* factor\` (nutze \`andThen\`)
- \`static Function<Integer, Integer> multiplyThenAdd(int add, int factor)\` – erst \`* factor\`, dann \`+ add\` (nutze \`compose\`)
- \`static Predicate<String> validName(int minLength)\` – nicht blank **und** mindestens \`minLength\` Zeichen (nutze \`and\`)
- \`static Predicate<String> invalidName(int minLength)\` – die Negation davon (nutze \`negate\`)
- \`static long countValid(List<String> values, Predicate<? super String> filter)\` – zählt die Treffer`,
      starter: `class Solution {

    static Function<Integer, Integer> addThenMultiply(int add, int factor) {
        // TODO
        return null;
    }

    static Function<Integer, Integer> multiplyThenAdd(int add, int factor) {
        // TODO
        return null;
    }

    static Predicate<String> validName(int minLength) {
        // TODO
        return null;
    }

    static Predicate<String> invalidName(int minLength) {
        // TODO
        return null;
    }

    static long countValid(List<String> values, Predicate<? super String> filter) {
        // TODO
        return -1;
    }
}`,
      solution: `class Solution {

    static Function<Integer, Integer> addThenMultiply(int add, int factor) {
        Function<Integer, Integer> plus = value -> value + add;
        Function<Integer, Integer> times = value -> value * factor;
        return plus.andThen(times);
    }

    static Function<Integer, Integer> multiplyThenAdd(int add, int factor) {
        Function<Integer, Integer> plus = value -> value + add;
        Function<Integer, Integer> times = value -> value * factor;
        return plus.compose(times);
    }

    static Predicate<String> validName(int minLength) {
        Predicate<String> notBlank = Predicate.not(String::isBlank);
        Predicate<String> longEnough = value -> value.trim().length() >= minLength;
        return notBlank.and(longEnough);
    }

    static Predicate<String> invalidName(int minLength) {
        return validName(minLength).negate();
    }

    static long countValid(List<String> values, Predicate<? super String> filter) {
        return values.stream().filter(filter).count();
    }
}`,
      hints: [
        '`andThen` hängt eine Funktion **hinten** an, `compose` schaltet eine **davor**. Bei Predicates verknüpfen `and`/`or` und `negate` dreht um.',
        'Verfügbar: `Function.andThen`, `Function.compose`, `Predicate.and`, `Predicate.negate`, `Predicate.not`, `Stream.filter`, `Stream.count`.',
        'Pseudocode: zwei einfache Funktionen `plus` und `times` als lokale Variablen anlegen, dann `plus.andThen(times)` bzw. `plus.compose(times)` zurückgeben. `invalidName` ruft `validName(...).negate()` auf.',
        '```java\nstatic Function<Integer, Integer> addThenMultiply(int add, int factor) {\n    Function<Integer, Integer> plus = value -> value + add;\n    Function<Integer, Integer> times = value -> value * factor;\n    return plus./* ... */(times);\n}\n```',
      ],
      tests: `check("addThenMultiply(2,3) auf 1", 9, Solution.addThenMultiply(2, 3).apply(1));
check("addThenMultiply(0,5) auf 4", 20, Solution.addThenMultiply(0, 5).apply(4));
check("multiplyThenAdd(2,3) auf 1", 5, Solution.multiplyThenAdd(2, 3).apply(1));
check("multiplyThenAdd bei 0", 2, Solution.multiplyThenAdd(2, 3).apply(0));
checkTrue("validName akzeptiert Anna", Solution.validName(3).test("Anna"));
checkTrue("validName lehnt zu kurz ab", !Solution.validName(3).test("Al"));
checkTrue("validName lehnt Leerzeichen ab", !Solution.validName(3).test("     "));
checkTrue("invalidName ist die Negation", Solution.invalidName(3).test("Al"));
checkTrue("invalidName bei gueltigem Namen false", !Solution.invalidName(3).test("Anna"));
check("countValid", 2L, Solution.countValid(List.of("Anna", "Al", "Bertram"), Solution.validName(3)));
check("countValid bei leerer Liste", 0L, Solution.countValid(List.of(), Solution.validName(3)));
check("countValid mit Predicate<Object>", 3L, Solution.countValid(List.of("a", "b", "c"), Objects::nonNull));`,
    },
    {
      id: 'k3',
      title: 'Method References & Comparator',
      level: 3,
      description: `Implementiere in \`Solution\` – jede Methode mit **Method References** statt ausgeschriebener Lambdas:

- \`static List<Integer> parseAll(List<String> raw)\` – jede Zeichenkette in ein \`Integer\`
- \`static List<String> upperCase(List<String> values)\` – alles in Großbuchstaben
- \`static String[] toArray(List<String> values)\` – als \`String[]\`
- \`static List<String> sortedLabels(List<User> users)\` – sortiert nach Nachname, dann Vorname; Ergebnis je Eintrag \`"Nachname, Vorname"\`
- \`static Optional<User> youngest(List<User> users)\` – jüngster User, leere Liste → \`Optional.empty()\``,
      given: `record User(String firstName, String lastName, int age) {}`,
      starter: `class Solution {

    static List<Integer> parseAll(List<String> raw) {
        // TODO
        return null;
    }

    static List<String> upperCase(List<String> values) {
        // TODO
        return null;
    }

    static String[] toArray(List<String> values) {
        // TODO
        return null;
    }

    static List<String> sortedLabels(List<User> users) {
        // TODO
        return null;
    }

    static Optional<User> youngest(List<User> users) {
        // TODO
        return Optional.empty();
    }
}`,
      solution: `class Solution {

    static List<Integer> parseAll(List<String> raw) {
        return raw.stream().map(Integer::parseInt).toList();
    }

    static List<String> upperCase(List<String> values) {
        return values.stream().map(String::toUpperCase).toList();
    }

    static String[] toArray(List<String> values) {
        return values.stream().toArray(String[]::new);
    }

    static List<String> sortedLabels(List<User> users) {
        return users.stream()
                .sorted(Comparator.comparing(User::lastName).thenComparing(User::firstName))
                .map(user -> user.lastName() + ", " + user.firstName())
                .toList();
    }

    static Optional<User> youngest(List<User> users) {
        return users.stream().min(Comparator.comparingInt(User::age));
    }
}`,
      hints: [
        'Vier Arten von Method References: statische Methode, Methode eines konkreten Objekts, Methode eines beliebigen Objekts des Typs, Konstruktor. Für Sortierung liefert `Comparator` fertige Fabriken.',
        'Bausteine: `Integer::parseInt`, `String::toUpperCase`, `String[]::new` als `IntFunction`, `Comparator.comparing`, `thenComparing`, `Comparator.comparingInt`, `Stream.min`.',
        'Pseudocode: jeweils `stream()` → `map(...)` → `toList()`. Für `toArray`: `stream().toArray(String[]::new)`. Für `youngest`: `stream().min(Comparator.comparingInt(User::age))` – liefert schon ein `Optional`.',
        '```java\nstatic List<String> sortedLabels(List<User> users) {\n    return users.stream()\n            .sorted(Comparator.comparing(User::lastName).thenComparing(/* ... */))\n            .map(user -> user.lastName() + ", " + user.firstName())\n            .toList();\n}\n```',
      ],
      tests: `check("parseAll", List.of(1, 2, 3), Solution.parseAll(List.of("1", "2", "3")));
check("parseAll bei leerer Liste", List.of(), Solution.parseAll(List.of()));
check("parseAll mit negativer Zahl", List.of(-7), Solution.parseAll(List.of("-7")));
check("upperCase", List.of("ANNA", "BO"), Solution.upperCase(List.of("Anna", "bo")));
check("upperCase bei leerer Liste", List.of(), Solution.upperCase(List.of()));
String[] array = Solution.toArray(List.of("a", "b"));
check("toArray Laenge", 2, array.length);
check("toArray Inhalt", "b", array[1]);
check("toArray bei leerer Liste", 0, Solution.toArray(List.of()).length);
List<User> users = List.of(new User("Anna", "Zander", 30),
                           new User("Cem", "Meier", 41),
                           new User("Bo", "Meier", 25));
check("sortedLabels", List.of("Meier, Bo", "Meier, Cem", "Zander, Anna"), Solution.sortedLabels(users));
check("youngest", Optional.of(new User("Bo", "Meier", 25)), Solution.youngest(users));
check("youngest bei leerer Liste", Optional.empty(), Solution.youngest(List.of()));`,
    },
    {
      id: 'k4',
      title: 'Eigenes Functional Interface: PriceRule',
      level: 4,
      description: `\`PriceRule\` ist ein eigenes Functional Interface (\`Order -> BigDecimal\`). Baue in \`Solution\` **Higher-Order-Methoden**, die Regeln erzeugen und kombinieren:

- \`static PriceRule base()\` – \`quantity * unitPrice\`
- \`static PriceRule discounted(PriceRule rule, BigDecimal rate)\` – Ergebnis von \`rule\` minus \`rate\`-Anteil (\`0.10\` = 10 %)
- \`static PriceRule atLeast(PriceRule rule, BigDecimal floor)\` – nie weniger als \`floor\`
- \`static BigDecimal totalOf(List<Order> orders, PriceRule rule)\` – Summe über alle Bestellungen

Alle Rückgaben von \`totalOf\` mit \`setScale(2, RoundingMode.HALF_UP)\`. Leere Liste → \`0.00\`. Die Regeln müssen sich **verketten** lassen: \`atLeast(discounted(base(), rate), floor)\`.`,
      given: `record Order(String customer, int quantity, BigDecimal unitPrice) {}

@FunctionalInterface
interface PriceRule {
    BigDecimal apply(Order order);
}`,
      starter: `class Solution {

    static PriceRule base() {
        // TODO
        return null;
    }

    static PriceRule discounted(PriceRule rule, BigDecimal rate) {
        // TODO
        return null;
    }

    static PriceRule atLeast(PriceRule rule, BigDecimal floor) {
        // TODO
        return null;
    }

    static BigDecimal totalOf(List<Order> orders, PriceRule rule) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static PriceRule base() {
        return order -> order.unitPrice().multiply(BigDecimal.valueOf(order.quantity()));
    }

    static PriceRule discounted(PriceRule rule, BigDecimal rate) {
        return order -> {
            BigDecimal amount = rule.apply(order);
            return amount.subtract(amount.multiply(rate));
        };
    }

    static PriceRule atLeast(PriceRule rule, BigDecimal floor) {
        return order -> rule.apply(order).max(floor);
    }

    static BigDecimal totalOf(List<Order> orders, PriceRule rule) {
        return orders.stream()
                .map(rule::apply)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}`,
      hints: [
        'Jede Methode gibt eine **neue Regel** zurück, die die übergebene Regel im Lambda aufruft – das ist eine Closure über den Parameter. Nichts wird sofort berechnet.',
        'Bausteine: `BigDecimal.multiply`, `subtract`, `max`, `BigDecimal.valueOf(int)`, `Stream.reduce(BigDecimal.ZERO, BigDecimal::add)`, `setScale(2, RoundingMode.HALF_UP)`.',
        'Pseudocode: `base` → `order -> unitPrice * quantity`. `discounted` → `order -> { amount = rule.apply(order); return amount - amount * rate; }`. `atLeast` → `order -> rule.apply(order).max(floor)`. `totalOf` → streamen, `rule::apply` mappen, reduzieren, skalieren.',
        '```java\nstatic PriceRule discounted(PriceRule rule, BigDecimal rate) {\n    return order -> {\n        BigDecimal amount = rule.apply(order);\n        return amount.subtract(/* ... */);\n    };\n}\n```',
      ],
      tests: `Order anna = new Order("Anna", 3, new BigDecimal("10.00"));
Order bo = new Order("Bo", 1, new BigDecimal("15.00"));
PriceRule base = Solution.base();

check("base", "30.00", base.apply(anna).setScale(2, RoundingMode.HALF_UP).toPlainString());
check("base bei Menge 0", "0.00", base.apply(new Order("Cem", 0, new BigDecimal("9.99")))
        .setScale(2, RoundingMode.HALF_UP).toPlainString());
check("discounted 10 Prozent", "27.00", Solution.discounted(base, new BigDecimal("0.10"))
        .apply(anna).setScale(2, RoundingMode.HALF_UP).toPlainString());
check("discounted 0 Prozent", "30.00", Solution.discounted(base, BigDecimal.ZERO)
        .apply(anna).setScale(2, RoundingMode.HALF_UP).toPlainString());
check("atLeast greift", "50.00", Solution.atLeast(base, new BigDecimal("50.00"))
        .apply(anna).setScale(2, RoundingMode.HALF_UP).toPlainString());
check("atLeast greift nicht", "30.00", Solution.atLeast(base, new BigDecimal("10.00"))
        .apply(anna).setScale(2, RoundingMode.HALF_UP).toPlainString());
PriceRule combined = Solution.atLeast(Solution.discounted(base, new BigDecimal("0.50")), new BigDecimal("20.00"));
check("Verkettung atLeast(discounted(base))", "20.00",
        combined.apply(anna).setScale(2, RoundingMode.HALF_UP).toPlainString());
check("totalOf", "45.00", Solution.totalOf(List.of(anna, bo), base).toPlainString());
check("totalOf bei leerer Liste", "0.00", Solution.totalOf(List.of(), base).toPlainString());
check("totalOf mit Rabattregel", "40.50",
        Solution.totalOf(List.of(anna, bo), Solution.discounted(base, new BigDecimal("0.10"))).toPlainString());`,
    },
  ],
}

export default chapter
