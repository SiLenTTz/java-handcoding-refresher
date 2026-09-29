import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '11',
  flashcards: [
    {
      id: 'f1',
      front: 'Was bedeutet **Type Erasure**?',
      back: 'Typargumente existieren nur zur Compilezeit. Im Bytecode wird `T` durch seine erste Bound (meist `Object`) ersetzt, der Compiler fügt Casts ein. `List<String>` und `List<Integer>` sind zur Laufzeit dieselbe Klasse.',
    },
    {
      id: 'f2',
      front: 'Was bedeutet **PECS**?',
      back: '**Producer Extends, Consumer Super.**\n\n- Struktur *liefert* Werte (du liest) → `? extends T`\n- Struktur *nimmt* Werte auf (du schreibst) → `? super T`\n- beides → exakt `T`',
    },
    {
      id: 'f3',
      front: 'Ist `List<Integer>` ein Subtyp von `List<Number>`?',
      back: 'Nein – Generics sind **invariant**. Sonst könnte man über die `List<Number>`-Referenz ein `Double` in eine `List<Integer>` schreiben. Flexibilität gibt es über `List<? extends Number>`.',
    },
    {
      id: 'f4',
      front: 'Was darfst du mit `List<? extends Number> nums` tun?',
      back: 'Lesen als `Number` (`Number n = nums.get(0)`). **Nicht** schreiben (außer `null`), weil der konkrete Elementtyp unbekannt ist (könnte `List<Double>` sein).',
    },
    {
      id: 'f5',
      front: 'Was darfst du mit `List<? super Integer> sink` tun?',
      back: '`Integer` (und Subtypen) hineinschreiben: `sink.add(42)`. Lesen nur als `Object`.',
    },
    {
      id: 'f6',
      front: 'Syntax einer generischen **Methode**?',
      back: 'Typparameter **vor** dem Rückgabetyp:\n\n```java\nstatic <T> T firstOrDefault(List<T> values, T fallback) {\n    return values.isEmpty() ? fallback : values.getFirst();\n}\n```',
    },
    {
      id: 'f7',
      front: 'Warum `<T extends Comparable<? super T>>` statt `<T extends Comparable<T>>`?',
      back: 'Damit auch Typen funktionieren, die `Comparable` von einer Superklasse erben: `Dog extends Animal implements Comparable<Animal>` → `Dog` ist `Comparable<Animal>`, nicht `Comparable<Dog>`.',
    },
    {
      id: 'f8',
      front: 'Vier Dinge, die wegen Type Erasure **nicht** gehen?',
      back: '- `new T()` / `new T[n]`\n- `x instanceof List<String>`\n- `static T field`\n- Overloads, die sich nur im Typargument unterscheiden (`f(List<String>)` + `f(List<Integer>)`)',
    },
    {
      id: 'f9',
      front: 'Wie erzeugst du in generischem Code trotzdem Instanzen von `T`?',
      back: 'Fabrik übergeben:\n\n```java\nstatic <T> List<T> create(int n, Supplier<T> factory) {\n    return Stream.generate(factory).limit(n).toList();\n}\ncreate(3, ArrayList::new);\n```\nAlternativ `Class<T>` als Type Token.',
    },
    {
      id: 'f10',
      front: 'Arrays vs. Generics bei der Varianz?',
      back: 'Arrays sind **kovariant** (`String[]` ist ein `Object[]`) und prüfen zur Laufzeit → `ArrayStoreException`. Generics sind **invariant** und prüfen zur Compilezeit.',
    },
    {
      id: 'f11',
      front: 'Unterschied `List<Object>` vs. `List<?>`?',
      back: '`List<Object>`: man darf alles hineinschreiben, aber eine `List<String>` ist *keine* `List<Object>`. `List<?>`: akzeptiert **jede** Liste, man kann nur lesen (als `Object`) und nichts außer `null` schreiben.',
    },
    {
      id: 'f12',
      front: 'Was ist ein **Raw Type** und warum vermeiden?',
      back: '`List list = new ArrayList();` – Generic ohne Typargument. Keine Typprüfung, unchecked Warnings, `ClassCastException` erst viel später beim Lesen. Nur für Legacy-Kompatibilität.',
    },
    {
      id: 'f13',
      front: 'Signatur von `Stream.map` – und warum die Wildcards?',
      back: '```java\n<R> Stream<R> map(Function<? super T, ? extends R> mapper)\n```\nDie Function *konsumiert* `T` (super) und *produziert* `R` (extends) → PECS, damit z. B. `Function<Object, Integer>` für `Stream<String>` passt.',
    },
    {
      id: 'f14',
      front: 'Wildcards in Parametern oder Rückgabetypen?',
      back: 'In **Parametern** (macht die API für Aufrufer flexibel). **Nicht** in Rückgabetypen – sonst muss jeder Aufrufer mit `? extends X` hantieren.',
    },
    {
      id: 'f15',
      front: 'Typsicherer heterogener Container – Kern-Idee?',
      back: '```java\nprivate final Map<Class<?>, Object> values = new HashMap<>();\n<T> void put(Class<T> type, T v) { values.put(type, type.cast(v)); }\n<T> T get(Class<T> type) { return type.cast(values.get(type)); }\n```\n`Class<T>` dient als Type Token.',
    },
    {
      id: 'f16',
      front: 'Mehrfach-Bound – Syntax und Regel?',
      back: '`<T extends Number & Comparable<T>>` – mit `&` verbunden, eine **Klasse zuerst**, danach beliebig viele Interfaces.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Kompiliert diese Zeile?',
      code: `List<Number> numbers = new ArrayList<Integer>();`,
      options: [
        'Ja, weil `Integer extends Number`',
        'Ja, aber mit unchecked Warning',
        'Nein – Generics sind invariant',
        'Nein – `ArrayList` muss mit Diamond `<>` erzeugt werden',
      ],
      correct: 2,
      explanation: '`ArrayList<Integer>` ist kein `List<Number>`. Korrekt wäre `List<? extends Number> numbers = new ArrayList<Integer>();` (dann aber nur lesend).',
    },
    {
      id: 'q2',
      prompt: 'Welche Zeile kompiliert?',
      code: `List<? extends Number> nums = List.of(1, 2, 3);`,
      options: ['`nums.add(4);`', '`Number first = nums.get(0);`', '`Integer first = nums.get(0);`', '`nums.add(Integer.valueOf(4));`'],
      correct: 1,
      explanation: 'Aus `? extends Number` liest man als `Number`. Schreiben geht nicht (unbekannter Subtyp), und `Integer` ist ohne Cast zu speziell.',
    },
    {
      id: 'q3',
      prompt: 'Welche Signatur ist nach PECS am flexibelsten für eine Methode, die `Integer`-Werte in eine Liste **schreibt**?',
      options: [
        '`void fill(List<Integer> target)`',
        '`void fill(List<? extends Integer> target)`',
        '`void fill(List<?> target)`',
        '`void fill(List<? super Integer> target)`',
      ],
      correct: 3,
      explanation: 'Die Liste ist Consumer → `super`. Akzeptiert `List<Integer>`, `List<Number>` und `List<Object>`.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass());`,
      options: ['`true`', '`false`', 'Compilefehler: inkompatible Typen', 'Hängt von der JVM ab'],
      correct: 0,
      explanation: 'Type Erasure: Zur Laufzeit sind beide einfach `ArrayList`.',
    },
    {
      id: 'q5',
      prompt: 'Kompiliert diese Klasse?',
      code: `class Converter {
    void process(List<String> values) { }
    void process(List<Integer> values) { }
}`,
      options: [
        'Ja – klassisches Overloading',
        'Nein – beide Methoden haben nach Erasure dieselbe Signatur (Name Clash)',
        'Ja, aber der Aufruf ist immer mehrdeutig',
        'Nein – `List` darf kein Parameter sein',
      ],
      correct: 1,
      explanation: 'Beide werden zu `process(List)` gelöscht → „name clash: … have the same erasure“.',
    },
    {
      id: 'q6',
      prompt: 'Was passiert?',
      code: `Object[] items = new String[2];
items[0] = "ok";
items[1] = 42;`,
      options: ['Compilefehler in Zeile 1', 'Compilefehler in Zeile 3', 'Läuft ohne Fehler', '`ArrayStoreException` zur Laufzeit'],
      correct: 3,
      explanation: 'Arrays sind kovariant, deshalb kompiliert es. Zur Laufzeit kennt das Array seinen Elementtyp `String` und wirft beim Speichern eines `Integer` eine `ArrayStoreException`.',
    },
    {
      id: 'q7',
      prompt: 'Wo fliegt die Exception?',
      code: `List raw = new ArrayList();
raw.add(42);                    // (1)
List<String> strings = raw;     // (2)
Object o = strings.get(0);      // (3)
String s = strings.get(0);      // (4)`,
      options: ['(1)', '(2)', '(4) – `ClassCastException`', 'Nirgends'],
      correct: 2,
      explanation: '(1) und (2) kompilieren mit Warnungen. (3) braucht keinen Cast. Erst (4) fügt der Compiler einen Cast auf `String` ein → `ClassCastException`. Heap Pollution fällt spät und weit weg auf.',
    },
    {
      id: 'q8',
      prompt: 'Welche Zeile kompiliert **nicht**?',
      code: `class Holder<T> {
    private T value;                          // (a)
    private static T shared;                  // (b)
    <R> R map(Function<T, R> f) { ... }      // (c)
    List<T> asList() { return List.of(value); } // (d)
}`,
      options: ['(a)', '(c)', '(d)', '(b)'],
      correct: 3,
      explanation: '`static`-Member gehören zur Klasse, nicht zu einer Instanz mit einem bestimmten `T`. Deshalb kann ein statisches Feld den Typparameter der Klasse nicht verwenden.',
    },
    {
      id: 'q9',
      prompt: 'Clean-Code-Urteil über diese API-Signatur?',
      code: `List<? extends Animal> findAnimals(String owner);`,
      options: [
        'Ideal – maximal flexibel',
        'Ungünstig – Wildcards gehören in Parameter, nicht in Rückgabetypen; `List<Animal>` zurückgeben',
        'Kompiliert nicht',
        'Nur mit `@SafeVarargs` erlaubt',
      ],
      correct: 1,
      explanation: 'Der Aufrufer kann in die Liste nichts einfügen und muss selbst mit Wildcards arbeiten. Rückgabetypen konkret halten.',
    },
    {
      id: 'q10',
      prompt: 'Welchen Typ inferiert der Compiler für `T`?',
      code: `static <T> T pick(T a, T b) { return a; }

var x = pick("hello", 42);`,
      options: [
        '`String`',
        'Compilefehler',
        'Ein Schnitttyp wie `Object & Serializable & Comparable<...>`',
        '`Integer`',
      ],
      correct: 2,
      explanation: 'Der Compiler sucht den spezifischsten gemeinsamen Supertyp von `String` und `Integer` – das ist ein Intersection Type (u. a. `Serializable`, `Comparable<...>`). Mit `var` bleibt er erhalten; ein Zieltyp wie `Object x = ...` würde `T` auf `Object` festlegen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Generischer Pair-Record',
      level: 1,
      description: `Vervollständige den generischen Record \`Pair<A, B>\`:

- \`static <A, B> Pair<A, B> of(A first, B second)\`
- \`Pair<B, A> swap()\`
- \`<R> Pair<R, B> mapFirst(Function<? super A, ? extends R> mapper)\``,
      starter: `record Pair<A, B>(A first, B second) {

    static <A, B> Pair<A, B> of(A first, B second) {
        // TODO
        return null;
    }

    Pair<B, A> swap() {
        // TODO
        return null;
    }

    <R> Pair<R, B> mapFirst(Function<? super A, ? extends R> mapper) {
        // TODO
        return null;
    }
}`,
      solution: `record Pair<A, B>(A first, B second) {

    static <A, B> Pair<A, B> of(A first, B second) {
        return new Pair<>(first, second);
    }

    Pair<B, A> swap() {
        return new Pair<>(second, first);
    }

    <R> Pair<R, B> mapFirst(Function<? super A, ? extends R> mapper) {
        return new Pair<>(mapper.apply(first), second);
    }
}`,
      hints: [
        'Records sind unveränderlich – jede „Änderung“ erzeugt ein neues `Pair`.',
        'Der Diamond `new Pair<>(...)` inferiert die Typargumente aus dem Rückgabetyp.',
        'swap: neues Pair mit vertauschten Komponenten. mapFirst: `mapper.apply(first)` als neue erste Komponente.',
        '```java\n<R> Pair<R, B> mapFirst(Function<? super A, ? extends R> mapper) {\n    return new Pair<>(/* ... */, second);\n}\n```',
      ],
      tests: `Pair<String, Integer> p = Pair.of("hello", 1);
check("of", new Pair<>("hello", 1), p);
check("swap", Pair.of(1, "hello"), p.swap());
check("swap zweimal = Original", p, p.swap().swap());
Pair<Integer, Integer> mapped = p.mapFirst(String::length);
check("mapFirst", Pair.of(5, 1), mapped);
Function<Object, String> describe = o -> "<" + o + ">";
check("mapFirst mit Function<Object, ...>", Pair.of("<hello>", 1), p.mapFirst(describe));
check("null erlaubt", Pair.of(null, "x"), Pair.of("x", null).swap());`,
    },
    {
      id: 'k2',
      title: 'Generisches max mit Bounded Type',
      level: 2,
      description: `Implementiere in \`Generics\`, **ohne** \`Collections.max\` oder Streams:

- \`static <T extends Comparable<? super T>> T max(Collection<? extends T> values)\`
- \`static <T> T maxBy(Collection<? extends T> values, Comparator<? super T> comparator)\`

Leere Collection → \`NoSuchElementException\`. Bei Gleichstand gewinnt das **erste** Element.

Die Tests nutzen auch \`Dog extends Animal implements Comparable<Animal>\` – dafür brauchst du \`? super T\`.`,
      given: `class Animal implements Comparable<Animal> {
    final String name;
    final int weight;

    Animal(String name, int weight) {
        this.name = name;
        this.weight = weight;
    }

    @Override
    public int compareTo(Animal other) {
        return Integer.compare(weight, other.weight);
    }
}

class Dog extends Animal {
    Dog(String name, int weight) {
        super(name, weight);
    }
}`,
      starter: `class Generics {
    static <T extends Comparable<? super T>> T max(Collection<? extends T> values) {
        // TODO
        return null;
    }

    static <T> T maxBy(Collection<? extends T> values, Comparator<? super T> comparator) {
        // TODO
        return null;
    }
}`,
      solution: `class Generics {
    static <T extends Comparable<? super T>> T max(Collection<? extends T> values) {
        return maxBy(values, Comparator.naturalOrder());
    }

    static <T> T maxBy(Collection<? extends T> values, Comparator<? super T> comparator) {
        Iterator<? extends T> iterator = values.iterator();
        if (!iterator.hasNext()) {
            throw new NoSuchElementException("Collection is empty");
        }
        T best = iterator.next();
        while (iterator.hasNext()) {
            T candidate = iterator.next();
            if (comparator.compare(candidate, best) > 0) {
                best = candidate;
            }
        }
        return best;
    }
}`,
      hints: [
        'Einmal über die Collection laufen und den bisher besten Kandidaten merken. `max` lässt sich auf `maxBy` mit natürlicher Ordnung zurückführen.',
        '`Iterator<? extends T> it = values.iterator()`, `it.hasNext()`, `it.next()`. `Comparator.naturalOrder()` für `Comparable`-Typen. Nur bei `> 0` ersetzen → erster gewinnt bei Gleichstand.',
        'Pseudocode: leer → NoSuchElementException; best = erstes; für jeden weiteren: wenn compare(candidate, best) > 0 → best = candidate; return best.',
        '```java\nstatic <T extends Comparable<? super T>> T max(Collection<? extends T> values) {\n    return maxBy(values, Comparator.naturalOrder());\n}\n```',
      ],
      tests: `check("Integers", 9, Generics.max(List.of(3, 9, 2)));
check("Strings", "pear", Generics.max(Set.of("apple", "pear", "banana")));
check("ein Element", 7, Generics.max(List.of(7)));
Dog heaviest = Generics.max(List.of(new Dog("Rex", 30), new Dog("Bello", 42), new Dog("Fifi", 5)));
check("Dog via Comparable<Animal>", "Bello", heaviest.name);
checkThrows("leer", NoSuchElementException.class, () -> Generics.max(new ArrayList<Integer>()));
check("maxBy Länge", "banana", Generics.maxBy(List.of("kiwi", "banana", "fig"), Comparator.comparing(String::length)));
check("maxBy Gleichstand -> erstes", "aa", Generics.maxBy(List.of("aa", "bb", "c"), Comparator.comparing(String::length)));
Comparator<Animal> byName = Comparator.comparing(a -> a.name);
Dog lastByName = Generics.maxBy(List.of(new Dog("Anton", 1), new Dog("Zorro", 2)), byName);
check("maxBy mit Comparator<Animal> für Dogs", "Zorro", lastByName.name);
checkThrows("maxBy leer", NoSuchElementException.class, () -> Generics.maxBy(List.<String>of(), Comparator.naturalOrder()));`,
    },
    {
      id: 'k3',
      title: 'PECS: Signaturen richtig machen',
      level: 3,
      description: `Die Signaturen im Starter sind **invariant** – deshalb kompilieren die Tests nicht (z. B. \`sum(List<Integer>)\`). Passe die Signaturen nach **PECS** an und implementiere die Methoden:

- \`sum(numbers)\` – Summe als \`double\`, für jede Collection von Number-Subtypen
- \`addRange(target, from, toInclusive)\` – fügt \`from..toInclusive\` in eine Liste ein, die \`Integer\` aufnehmen kann (\`List<Integer>\`, \`List<Number>\`, \`List<Object>\`)
- \`copy(dest, src)\` – hängt alle Elemente von \`src\` an \`dest\` an
- \`countMatching(items, filter)\` – zählt Elemente, auf die das Predicate passt (auch \`Predicate<Object>\` für \`List<String>\`)`,
      starter: `class Pecs {
    // TODO: Signaturen nach PECS anpassen

    static double sum(Collection<Number> numbers) {
        // TODO
        return 0;
    }

    static void addRange(List<Integer> target, int from, int toInclusive) {
        // TODO
    }

    static <T> void copy(List<T> dest, List<T> src) {
        // TODO
    }

    static <T> int countMatching(Collection<T> items, Predicate<T> filter) {
        // TODO
        return 0;
    }
}`,
      solution: `class Pecs {

    static double sum(Collection<? extends Number> numbers) {
        double total = 0;
        for (Number number : numbers) {
            total += number.doubleValue();
        }
        return total;
    }

    static void addRange(List<? super Integer> target, int from, int toInclusive) {
        for (int i = from; i <= toInclusive; i++) {
            target.add(i);
        }
    }

    static <T> void copy(List<? super T> dest, List<? extends T> src) {
        for (T item : src) {
            dest.add(item);
        }
    }

    static <T> int countMatching(Collection<? extends T> items, Predicate<? super T> filter) {
        int count = 0;
        for (T item : items) {
            if (filter.test(item)) {
                count++;
            }
        }
        return count;
    }
}`,
      hints: [
        'Frage bei jedem Parameter: Liest die Methode daraus (Producer → `extends`) oder schreibt sie hinein (Consumer → `super`)? Ein Predicate *konsumiert* Elemente.',
        '`Collection<? extends Number>`, `List<? super Integer>`, `copy(List<? super T> dest, List<? extends T> src)`, `Predicate<? super T>`.',
        'sum: über alle Numbers iterieren, `doubleValue()` addieren. addRange: klassische for-Schleife mit `<=`. countMatching: Zähler erhöhen, wenn `filter.test(item)`.',
        '```java\nstatic <T> void copy(List<? super T> dest, List<? extends T> src) {\n    for (T item : src) {\n        // ...\n    }\n}\n```',
      ],
      tests: `check("sum Integers", 6.0, Pecs.sum(List.of(1, 2, 3)));
check("sum gemischt", 6.5, Pecs.sum(List.of(1, 2.5, 3L)));
check("sum leer", 0.0, Pecs.sum(Set.<Double>of()));
List<Number> numbers = new ArrayList<>();
Pecs.addRange(numbers, 1, 3);
check("addRange in List<Number>", List.<Number>of(1, 2, 3), numbers);
List<Object> objects = new ArrayList<>(List.of("start"));
Pecs.addRange(objects, 5, 5);
check("addRange in List<Object>", List.of("start", 5), objects);
List<Integer> ints = new ArrayList<>();
Pecs.addRange(ints, 3, 1);
check("addRange leerer Bereich", List.of(), ints);
List<Object> dest = new ArrayList<>();
Pecs.copy(dest, List.of("a", "b"));
Pecs.copy(dest, List.of(1));
check("copy", List.of("a", "b", 1), dest);
Predicate<Object> notNull = Objects::nonNull;
check("countMatching mit Predicate<Object>", 2, Pecs.countMatching(Arrays.asList("x", null, "y"), notNull));
check("countMatching", 1, Pecs.countMatching(List.of("a", "bbb"), s -> s.length() > 2));`,
    },
    {
      id: 'k4',
      title: 'Generisches groupBy ohne Streams',
      level: 4,
      description: `Implementiere eine generische Utility – **ohne** Streams, mit einer Schleife:

\`\`\`java
static <T, K> Map<K, List<T>> groupBy(Collection<? extends T> items,
                                      Function<? super T, ? extends K> classifier)
\`\`\`

- Schlüssel in **Reihenfolge des ersten Auftretens** (\`LinkedHashMap\`)
- Elemente pro Gruppe in Eingabereihenfolge
- \`items\` oder \`classifier\` \`null\` → \`NullPointerException\``,
      starter: `class CollectionUtils {
    static <T, K> Map<K, List<T>> groupBy(Collection<? extends T> items,
                                          Function<? super T, ? extends K> classifier) {
        // TODO
        return Map.of();
    }
}`,
      solution: `class CollectionUtils {
    static <T, K> Map<K, List<T>> groupBy(Collection<? extends T> items,
                                          Function<? super T, ? extends K> classifier) {
        Objects.requireNonNull(items, "items");
        Objects.requireNonNull(classifier, "classifier");
        Map<K, List<T>> groups = new LinkedHashMap<>();
        for (T item : items) {
            K key = classifier.apply(item);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(item);
        }
        return groups;
    }
}`,
      hints: [
        'Pro Element den Schlüssel berechnen und das Element an die Liste dieses Schlüssels anhängen. Fehlt die Liste, wird sie angelegt.',
        '`Map.computeIfAbsent(key, k -> new ArrayList<>())` liefert die (ggf. neue) Liste. `LinkedHashMap` erhält die Einfügereihenfolge.',
        'Guard Clauses (requireNonNull) → `Map<K, List<T>> groups = new LinkedHashMap<>()` → for item: key = classifier.apply(item); groups.computeIfAbsent(...).add(item) → return groups.',
        '```java\nfor (T item : items) {\n    K key = classifier.apply(item);\n    groups.computeIfAbsent(key, k -> new ArrayList<>()).add(item);\n}\n```',
      ],
      tests: `Map<Integer, List<String>> byLength = CollectionUtils.groupBy(List.of("a", "bb", "cc", "d"), String::length);
check("nach Länge", Map.of(1, List.of("a", "d"), 2, List.of("bb", "cc")), byLength);
check("Reihenfolge der Keys", List.of(2, 1), new ArrayList<>(CollectionUtils.groupBy(List.of("bb", "a", "cc"), String::length).keySet()));
check("leer", Map.of(), CollectionUtils.groupBy(List.<String>of(), String::length));
Map<Boolean, List<Number>> evenOdd = CollectionUtils.groupBy(List.of(1, 2, 3, 4), (Number n) -> n.intValue() % 2 == 0);
check("List<Integer> als Collection<? extends Number>", Map.of(false, List.of(1, 3), true, List.of(2, 4)), evenOdd);
Function<Object, String> byClass = o -> o.getClass().getSimpleName();
Map<String, List<Object>> mixed = CollectionUtils.groupBy(List.<Object>of("x", 1, "y"), byClass);
check("Function<Object, String>", Map.of("String", List.of("x", "y"), "Integer", List.of(1)), mixed);
checkThrows("items null", NullPointerException.class, () -> CollectionUtils.groupBy(null, Object::toString));
checkThrows("classifier null", NullPointerException.class, () -> CollectionUtils.groupBy(List.of(1), null));`,
    },
    {
      id: 'k5',
      title: 'Sealed generischer Result-Typ',
      level: 5,
      description: `Baue einen generischen Ergebnis-Typ \`Result<T>\` als \`sealed interface\` mit den Records \`Ok<T>(T value)\` und \`Err<T>(String message)\`:

- Fabriken \`Result.ok(value)\` und \`Result.err(message)\`
- \`<R> Result<R> map(Function<? super T, ? extends R> mapper)\` – nur bei \`Ok\` anwenden
- \`<R> Result<R> flatMap(Function<? super T, Result<R>> mapper)\` – nur bei \`Ok\`, Ergebnis nicht verschachteln
- \`T orElse(T fallback)\`
- \`boolean isOk()\`

Nutze **Pattern Matching** (\`switch\` über \`this\`) statt \`instanceof\`-Ketten. Bei \`Err\` darf der Mapper **nicht** aufgerufen werden.`,
      starter: `sealed interface Result<T> permits Ok, Err {

    static <T> Result<T> ok(T value) {
        return new Ok<>(value);
    }

    static <T> Result<T> err(String message) {
        return new Err<>(message);
    }

    default <R> Result<R> map(Function<? super T, ? extends R> mapper) {
        // TODO
        return null;
    }

    default <R> Result<R> flatMap(Function<? super T, Result<R>> mapper) {
        // TODO
        return null;
    }

    default T orElse(T fallback) {
        // TODO
        return fallback;
    }

    default boolean isOk() {
        // TODO
        return false;
    }
}

record Ok<T>(T value) implements Result<T> {}

record Err<T>(String message) implements Result<T> {}`,
      solution: `sealed interface Result<T> permits Ok, Err {

    static <T> Result<T> ok(T value) {
        return new Ok<>(value);
    }

    static <T> Result<T> err(String message) {
        return new Err<>(message);
    }

    default <R> Result<R> map(Function<? super T, ? extends R> mapper) {
        return switch (this) {
            case Ok<T> ok -> new Ok<>(mapper.apply(ok.value()));
            case Err<T> err -> new Err<>(err.message());
        };
    }

    default <R> Result<R> flatMap(Function<? super T, Result<R>> mapper) {
        return switch (this) {
            case Ok<T> ok -> mapper.apply(ok.value());
            case Err<T> err -> new Err<>(err.message());
        };
    }

    default T orElse(T fallback) {
        return switch (this) {
            case Ok<T> ok -> ok.value();
            case Err<T> err -> fallback;
        };
    }

    default boolean isOk() {
        return this instanceof Ok;
    }
}

record Ok<T>(T value) implements Result<T> {}

record Err<T>(String message) implements Result<T> {}`,
      hints: [
        'Ein `Err<T>` lässt sich nicht einfach zu `Result<R>` casten – erzeuge ein **neues** `Err<R>` mit derselben Nachricht.',
        '`switch (this) { case Ok<T> ok -> ...; case Err<T> err -> ...; }` ist exhaustive, weil `Result` sealed ist.',
        'map: Ok → `new Ok<>(mapper.apply(value))`, Err → `new Err<>(message)`. flatMap: Ok → `mapper.apply(value)` direkt zurückgeben. orElse: Ok → value, Err → fallback.',
        '```java\ndefault <R> Result<R> map(Function<? super T, ? extends R> mapper) {\n    return switch (this) {\n        case Ok<T> ok -> new Ok<>(mapper.apply(ok.value()));\n        // ...\n    };\n}\n```',
      ],
      tests: `Result<Integer> two = Result.ok(2);
check("map Ok", new Ok<>(4), two.map(x -> x * 2));
check("map Typwechsel", Result.ok("2!"), two.map(x -> x + "!"));
int[] calls = {0};
Result<Integer> failed = Result.err("boom");
check("map Err bleibt Err", new Err<>("boom"), failed.map(x -> { calls[0]++; return x * 2; }));
check("Mapper bei Err nicht aufgerufen", 0, calls[0]);
Function<String, Result<Integer>> parse = s -> !s.isEmpty() && s.chars().allMatch(Character::isDigit)
        ? Result.ok(Integer.parseInt(s))
        : Result.err("not a number: " + s);
check("flatMap Ok", Result.ok(42), Result.ok("42").flatMap(parse));
check("flatMap -> Err", Result.err("not a number: x"), Result.ok("x").flatMap(parse));
check("flatMap auf Err", Result.err("early"), Result.<String>err("early").flatMap(parse));
check("orElse Ok", 2, two.orElse(0));
check("orElse Err", 0, failed.orElse(0));
checkTrue("isOk", two.isOk() && !failed.isOk());`,
    },
  ],
}

export default chapter
