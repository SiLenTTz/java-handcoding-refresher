import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    { id: 'f1', front: 'Was macht `map.merge(k, 1, Integer::sum)`?', back: 'Key fehlt: setzt `1`. Sonst: `alt + 1`. Liefert die Funktion `null`, wird der Eintrag entfernt.' },
    { id: 'f2', front: 'Was macht `computeIfAbsent` – und was liefert es zurück?', back: 'Erzeugt den Value per Funktion nur, wenn der Key fehlt, legt ihn ab und liefert den **aktuellen** Value (vorhanden oder neu). Deshalb:\n```java\nmap.computeIfAbsent(k, x -> new ArrayList<>()).add(v);\n```' },
    { id: 'f3', front: '`putIfAbsent` vs. `computeIfAbsent`?', back: '`putIfAbsent(k, v)`: Value wird **immer** vorher erzeugt, liefert alten Value oder `null`. `computeIfAbsent(k, fn)`: Value wird nur bei Bedarf (lazy) erzeugt, liefert aktuellen Value.' },
    { id: 'f4', front: 'Wie iteriert man Key und Value gleichzeitig?', back: '```java\nfor (Map.Entry<Long, User> e : map.entrySet()) {\n    e.getKey(); e.getValue();\n}\n```\noder `map.forEach((k, v) -> ...)`.' },
    { id: 'f5', front: '`HashMap` vs. `LinkedHashMap` vs. `TreeMap`?', back: '`HashMap`: keine Ordnung, O(1). `LinkedHashMap`: Einfüge- (oder Zugriffs-)Reihenfolge, O(1). `TreeMap`: sortierte Keys, O(log n), Navigationsmethoden (`firstKey`, `floorKey`, `headMap`).' },
    { id: 'f6', front: 'Warum ist `int n = map.get("x");` gefährlich?', back: 'Fehlt der Key, liefert `get` `null` → Unboxing wirft `NullPointerException`. Besser `map.getOrDefault("x", 0)`.' },
    { id: 'f7', front: 'Wie entfernt man mit `compute`/`computeIfPresent` einen Eintrag?', back: 'Die Remapping-Funktion gibt `null` zurück:\n```java\nstock.computeIfPresent(item, (k, q) -> q > 1 ? q - 1 : null);\n```' },
    { id: 'f8', front: 'Wie funktioniert `HashMap` intern (Kurzfassung)?', back: 'Array aus Buckets. Index aus gespreiztem `hashCode()`. Kollisionen: verkettete Liste, ab 8 Einträgen Baum. Bei Load Factor 0,75 wird verdoppelt und neu verteilt.' },
    { id: 'f9', front: 'Welche `null`-Regeln gelten für `HashMap`, `TreeMap`, `Map.of`?', back: '`HashMap`: ein `null`-Key, `null`-Values erlaubt. `TreeMap`: kein `null`-Key (natürliche Ordnung). `Map.of`/`Map.copyOf`: keine `null`-Keys oder -Values.' },
    { id: 'f10', front: 'Wie baut man einen LRU-Cache mit Bordmitteln?', back: '`LinkedHashMap` mit `accessOrder = true` (`new LinkedHashMap<>(16, 0.75f, true)`) und `removeEldestEntry` überschreiben: `return size() > capacity;`' },
    { id: 'f11', front: 'Warum sollten Map-Keys immutable sein?', back: 'Ändert sich der `hashCode` eines Keys nach dem Einfügen, liegt er im falschen Bucket – `get`/`remove` finden ihn nicht mehr.' },
    { id: 'f12', front: 'Wie entfernt man Einträge sicher während der Iteration?', back: 'Über die Views: `map.entrySet().removeIf(e -> ...)`, `map.values().removeIf(...)` oder `map.keySet().removeIf(...)`.' },
    { id: 'f13', front: 'Wie unterscheidet man "Key fehlt" von "Value ist null"?', back: '`containsKey(k)`. `get(k) == null` ist in beiden Fällen wahr.' },
    { id: 'f14', front: 'Welche Map für Enum-Keys?', back: '`EnumMap<Status, Integer> m = new EnumMap<>(Status.class);` – intern ein Array, sehr schnell, Iteration in Enum-Reihenfolge.' },
    { id: 'f15', front: 'Umsatz pro Kunde mit `BigDecimal` aufsummieren?', back: '```java\nrevenue.merge(order.customer(), order.total(), BigDecimal::add);\n```' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was steht nach dem Code in `counts`?',
      code: `Map<String, Integer> counts = new HashMap<>();
counts.merge("Java", 1, Integer::sum);
counts.merge("Java", 1, Integer::sum);
counts.merge("Go", 5, Integer::sum);`,
      options: ['`{Java=1, Go=5}`', '`{Java=2, Go=1}`', '`{Java=2, Go=5}`', '`{Java=2}`'],
      correct: 2,
      explanation: 'Erster Aufruf pro Key setzt den übergebenen Wert (`1` bzw. `5`), weitere Aufrufe kombinieren mit `Integer::sum`.',
    },
    {
      id: 'q2',
      prompt: 'Wo ist der Bug?',
      code: `Map<String, List<User>> byCountry = new HashMap<>();
for (User u : users) {
    byCountry.put(u.country(), new ArrayList<>());
    byCountry.get(u.country()).add(u);
}`,
      options: [
        'Kein Bug',
        '`get` liefert `null`, NPE',
        'Bei jedem User wird die Liste des Landes durch eine neue ersetzt – nur der letzte User pro Land bleibt',
        '`HashMap` erlaubt keine Listen als Value',
      ],
      correct: 2,
      explanation: '`put` überschreibt jedes Mal. Richtig: `byCountry.computeIfAbsent(u.country(), k -> new ArrayList<>()).add(u);`',
    },
    {
      id: 'q3',
      prompt: 'Was gibt der Code aus?',
      code: `Map<String, Integer> m = new HashMap<>();
System.out.println(m.put("a", 1));
System.out.println(m.put("a", 2));`,
      options: ['`null` und `1`', '`1` und `2`', '`true` und `false`', '`null` und `null`'],
      correct: 0,
      explanation: '`put` liefert den **vorherigen** Value zum Key – beim ersten Mal `null`, dann `1`.',
    },
    {
      id: 'q4',
      prompt: 'Welche Map, wenn Keys beim Ausgeben alphabetisch sortiert sein sollen?',
      options: ['`HashMap`', '`LinkedHashMap`', '`EnumMap`', '`TreeMap`'],
      correct: 3,
      explanation: '`TreeMap` hält Keys nach natürlicher Ordnung (oder Comparator) sortiert. `LinkedHashMap` behält nur die Einfügereihenfolge.',
    },
    {
      id: 'q5',
      prompt: 'Was ist nach dem Code in `stock`?',
      code: `Map<String, Integer> stock = new HashMap<>(Map.of("apple", 1, "pear", 3));
stock.computeIfPresent("apple", (k, q) -> q > 1 ? q - 1 : null);
stock.computeIfPresent("kiwi", (k, q) -> q - 1);`,
      options: ['`{apple=0, pear=3}`', '`{pear=3}`', '`{pear=3, kiwi=-1}`', '`NullPointerException`'],
      correct: 1,
      explanation: 'Gibt die Funktion `null` zurück, wird der Eintrag entfernt. Für den fehlenden Key `kiwi` wird die Funktion gar nicht aufgerufen.',
    },
    {
      id: 'q6',
      prompt: 'Welche Variante ist am saubersten, um Key und Value auszugeben?',
      options: [
        '`for (String k : map.keySet()) System.out.println(k + map.get(k));`',
        '`map.forEach((k, v) -> System.out.println(k + "=" + v));`',
        '`for (int i = 0; i < map.size(); i++) ...`',
        '`map.values().forEach(v -> System.out.println(map.keySet() + v));`',
      ],
      correct: 1,
      explanation: '`forEach` mit `BiConsumer` (oder `entrySet`) liefert Key und Value in einem Durchgang, ohne zusätzlichen Lookup.',
    },
    {
      id: 'q7',
      prompt: 'Was passiert?',
      code: `Map<String, Integer> m = Map.of("a", 1, "b", 2);
m.put("c", 3);`,
      options: ['`{a=1, b=2, c=3}`', '`UnsupportedOperationException`', 'Compile-Fehler', '`IllegalArgumentException`'],
      correct: 1,
      explanation: '`Map.of` ist unveränderlich. Für eine veränderbare Map: `new HashMap<>(Map.of(...))`.',
    },
    {
      id: 'q8',
      prompt: 'Welche Komplexität hat `get` bei `HashMap` bzw. `TreeMap` (typisch)?',
      options: ['O(1) / O(1)', 'O(n) / O(log n)', 'O(log n) / O(1)', 'O(1) / O(log n)'],
      correct: 3,
      explanation: 'Hash-Lookup ist im Mittel konstant, der Rot-Schwarz-Baum der `TreeMap` braucht logarithmisch viele Vergleiche.',
    },
    {
      id: 'q9',
      prompt: 'Welches Problem hat dieser Code?',
      code: `Map<String, Integer> counts = new HashMap<>();
for (String w : words) {
    if (counts.containsKey(w)) {
        counts.put(w, counts.get(w) + 1);
    } else {
        counts.put(w, 1);
    }
}`,
      options: [
        'Er ist falsch – zählt doppelt',
        'Er ist korrekt, aber umständlich – `merge(w, 1, Integer::sum)` drückt dasselbe in einer Zeile aus',
        'Er wirft `ConcurrentModificationException`',
        'Er funktioniert nur mit `TreeMap`',
      ],
      correct: 1,
      explanation: 'Korrekt, aber drei Lookups und viel Rauschen. `merge` ist die idiomatische Variante.',
    },
    {
      id: 'q10',
      prompt: 'Was gibt der Code aus?',
      code: `Map<String, String> m = new HashMap<>();
m.put("k", null);
System.out.println(m.get("k") + " " + m.containsKey("k") + " " + m.getOrDefault("k", "x"));`,
      options: ['`null true x`', '`null false x`', '`null true null`', '`x true x`'],
      correct: 2,
      explanation: '`getOrDefault` liefert den Default nur, wenn der Key **fehlt**. Hier existiert er mit Value `null` – also `null`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Frequency Counter',
      level: 1,
      description: 'Implementiere `count(List<String> technologies)`, das für jede Technologie zählt, wie oft sie vorkommt. Nutze eine Schleife und `Map.merge` (keine Streams).',
      starter: `class Solution {

    static Map<String, Integer> count(List<String> technologies) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Map<String, Integer> count(List<String> technologies) {
        Map<String, Integer> counts = new HashMap<>();
        for (String tech : technologies) {
            counts.merge(tech, 1, Integer::sum);
        }
        return counts;
    }
}`,
      hints: [
        'Du brauchst eine Map als Zähler: Technologie → Anzahl.',
        '`Map.merge(key, 1, Integer::sum)`',
        'neue HashMap; für jede tech: merge(tech, 1, sum); Map zurückgeben.',
        '`for (String tech : technologies) { counts.merge(tech, 1, Integer::sum); }`',
      ],
      tests: `var result = Solution.count(List.of("Java", "Go", "Java", "Kotlin", "Java"));
check("Java dreimal", 3, result.get("Java"));
check("Go einmal", 1, result.get("Go"));
check("komplette Map", Map.of("Java", 3, "Go", 1, "Kotlin", 1), result);
check("leere Liste", Map.of(), Solution.count(List.of()));
check("ein Element", Map.of("Rust", 1), Solution.count(List.of("Rust")));
check("case-sensitive", Map.of("java", 1, "Java", 1), Solution.count(List.of("java", "Java")));`,
    },
    {
      id: 'k2',
      title: 'Index nach ID mit Duplikat-Prüfung',
      level: 2,
      description: `Implementiere \`indexById(List<User> users)\` → \`Map<Long, User>\` mit der ID als Key.

Kommt eine ID doppelt vor, wirf eine \`IllegalArgumentException\` (nicht stillschweigend überschreiben!). Nutze den Rückgabewert von \`putIfAbsent\`.`,
      given: `record User(Long id, String name, String country) {}`,
      starter: `class Solution {

    static Map<Long, User> indexById(List<User> users) {
        // TODO
        return Map.of();
    }
}`,
      solution: `class Solution {

    static Map<Long, User> indexById(List<User> users) {
        Map<Long, User> usersById = new HashMap<>();
        for (User user : users) {
            User previous = usersById.putIfAbsent(user.id(), user);
            if (previous != null) {
                throw new IllegalArgumentException("duplicate id: " + user.id());
            }
        }
        return usersById;
    }
}`,
      hints: [
        'Eine Map mit ID → User. Beim Einfügen musst du erkennen, ob die ID schon belegt war.',
        '`putIfAbsent` liefert `null`, wenn eingefügt wurde, sonst den bereits vorhandenen Value.',
        'für jeden User: previous = putIfAbsent(id, user); wenn previous != null → Exception.',
        '`User previous = usersById.putIfAbsent(user.id(), user);`',
      ],
      tests: `var jan = new User(1L, "Jan", "DE");
var anna = new User(2L, "Anna", "AT");
var index = Solution.indexById(List.of(jan, anna));
check("Größe", 2, index.size());
check("Lookup 1", jan, index.get(1L));
check("Lookup 2", anna, index.get(2L));
check("fehlende ID", null, index.get(3L));
check("leer", Map.of(), Solution.indexById(List.of()));
checkThrows("Duplikat", IllegalArgumentException.class, () -> Solution.indexById(List.of(jan, new User(1L, "Jana", "DE"))));`,
    },
    {
      id: 'k3',
      title: 'Gruppieren mit computeIfAbsent',
      level: 2,
      description: `Implementiere \`namesByCountry(List<User> users)\` → \`Map<String, List<String>>\`:

- Key: Land, Value: Namen der User in Eingabereihenfolge
- die Keys sollen **alphabetisch sortiert** sein
- ohne Streams, mit \`computeIfAbsent\``,
      given: `record User(Long id, String name, String country) {}`,
      starter: `class Solution {

    static Map<String, List<String>> namesByCountry(List<User> users) {
        // TODO
        return new HashMap<>();
    }
}`,
      solution: `class Solution {

    static Map<String, List<String>> namesByCountry(List<User> users) {
        Map<String, List<String>> namesByCountry = new TreeMap<>();
        for (User user : users) {
            namesByCountry
                .computeIfAbsent(user.country(), country -> new ArrayList<>())
                .add(user.name());
        }
        return namesByCountry;
    }
}`,
      hints: [
        'Welche Map-Implementierung hält Keys sortiert?',
        '`TreeMap` + `computeIfAbsent(key, k -> new ArrayList<>())` – das liefert die Liste zurück.',
        'für jeden User: Liste für user.country() holen/erzeugen, user.name() anhängen.',
        '`namesByCountry.computeIfAbsent(user.country(), c -> new ArrayList<>()).add(user.name());`',
      ],
      tests: `var users = List.of(
    new User(1L, "Jan", "DE"),
    new User(2L, "Anna", "AT"),
    new User(3L, "Tom", "DE"),
    new User(4L, "Lea", "CH"));
var result = Solution.namesByCountry(users);
check("DE in Reihenfolge", List.of("Jan", "Tom"), result.get("DE"));
check("AT", List.of("Anna"), result.get("AT"));
check("Keys sortiert", List.of("AT", "CH", "DE"), new ArrayList<>(result.keySet()));
check("komplett", Map.of("DE", List.of("Jan", "Tom"), "AT", List.of("Anna"), "CH", List.of("Lea")), result);
check("leer", Map.of(), Solution.namesByCountry(List.of()));`,
    },
    {
      id: 'k4',
      title: 'Inventory mit merge und computeIfPresent',
      level: 3,
      description: `Implementiere die Klasse \`Inventory\`:

- \`add(String item, int qty)\`: erhöht den Bestand; \`qty <= 0\` → \`IllegalArgumentException\`
- \`remove(String item, int qty)\`: verringert den Bestand; ist nicht genug da (oder Item unbekannt) → \`IllegalStateException\`. Fällt der Bestand auf 0, verschwindet das Item komplett.
- \`quantity(String item)\`: aktueller Bestand, 0 wenn unbekannt
- \`snapshot()\`: unveränderliche Kopie des Bestands`,
      starter: `class Inventory {

    void add(String item, int qty) {
        // TODO
    }

    void remove(String item, int qty) {
        // TODO
    }

    int quantity(String item) {
        // TODO
        return 0;
    }

    Map<String, Integer> snapshot() {
        // TODO
        return new HashMap<>();
    }
}`,
      solution: `class Inventory {

    private final Map<String, Integer> stock = new HashMap<>();

    void add(String item, int qty) {
        requirePositive(qty);
        stock.merge(item, qty, Integer::sum);
    }

    void remove(String item, int qty) {
        requirePositive(qty);
        int available = quantity(item);
        if (available < qty) {
            throw new IllegalStateException("not enough " + item + ": " + available);
        }
        stock.computeIfPresent(item, (key, current) -> current == qty ? null : current - qty);
    }

    int quantity(String item) {
        return stock.getOrDefault(item, 0);
    }

    Map<String, Integer> snapshot() {
        return Map.copyOf(stock);
    }

    private static void requirePositive(int qty) {
        if (qty <= 0) {
            throw new IllegalArgumentException("qty must be > 0");
        }
    }
}`,
      hints: [
        'Intern: `Map<String, Integer>`. Validierung (Guard Clauses) vor jeder Änderung.',
        '`merge` zum Erhöhen, `getOrDefault` zum Lesen, `computeIfPresent` mit `null`-Rückgabe zum Entfernen, `Map.copyOf` für den Snapshot.',
        'remove: qty prüfen → available = quantity(item) → wenn zu wenig: throw → computeIfPresent(item, (k, cur) -> cur == qty ? null : cur - qty).',
        '`stock.computeIfPresent(item, (key, current) -> current == qty ? null : current - qty);`',
      ],
      tests: `var inv = new Inventory();
inv.add("apple", 5);
inv.add("apple", 3);
inv.add("pear", 2);
check("merge addiert", 8, inv.quantity("apple"));
check("unbekannt = 0", 0, inv.quantity("kiwi"));
inv.remove("apple", 3);
check("nach remove", 5, inv.quantity("apple"));
inv.remove("pear", 2);
checkTrue("auf 0 -> Key entfernt", !inv.snapshot().containsKey("pear"));
check("snapshot", Map.of("apple", 5), inv.snapshot());
checkThrows("zu wenig", IllegalStateException.class, () -> inv.remove("apple", 6));
checkThrows("unbekanntes Item", IllegalStateException.class, () -> inv.remove("kiwi", 1));
checkThrows("qty 0", IllegalArgumentException.class, () -> inv.add("apple", 0));
checkThrows("snapshot unveränderlich", UnsupportedOperationException.class, () -> inv.snapshot().put("x", 1));
check("nach Fehlern unverändert", 5, inv.quantity("apple"));`,
    },
    {
      id: 'k5',
      title: 'LRU-Cache',
      level: 4,
      description: `Implementiere einen generischen \`LruCache<K, V>\` mit fester Kapazität:

- \`put(K key, V value)\`: speichert; wird die Kapazität überschritten, fliegt der **am längsten nicht benutzte** Eintrag raus
- \`get(K key)\`: liefert den Value oder \`null\`; ein Treffer zählt als Benutzung
- \`keys()\`: Keys vom am längsten nicht benutzten zum zuletzt benutzten
- \`size()\`

Tipp: Es gibt eine JDK-Map, die das fast allein kann. Nutze Komposition (privates Feld) statt öffentlicher Vererbung.`,
      starter: `class LruCache<K, V> {

    LruCache(int capacity) {
        // TODO
    }

    V get(K key) {
        // TODO
        return null;
    }

    void put(K key, V value) {
        // TODO
    }

    List<K> keys() {
        // TODO
        return List.of();
    }

    int size() {
        // TODO
        return 0;
    }
}`,
      solution: `class LruCache<K, V> {

    private final Map<K, V> entries;

    LruCache(int capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException("capacity must be >= 1");
        }
        this.entries = new LinkedHashMap<>(16, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > capacity;
            }
        };
    }

    V get(K key) {
        return entries.get(key);
    }

    void put(K key, V value) {
        entries.put(key, value);
    }

    List<K> keys() {
        return List.copyOf(entries.keySet());
    }

    int size() {
        return entries.size();
    }
}`,
      hints: [
        '`LinkedHashMap` kann statt Einfüge- die **Zugriffsreihenfolge** führen und bei jedem `put` den ältesten Eintrag entfernen lassen.',
        'Konstruktor `new LinkedHashMap<>(16, 0.75f, true)` (accessOrder) und `protected boolean removeEldestEntry(Map.Entry<K, V> eldest)` überschreiben.',
        'Im Konstruktor eine anonyme Subklasse von LinkedHashMap erzeugen, die `size() > capacity` zurückgibt; alle Methoden delegieren.',
        '`this.entries = new LinkedHashMap<>(16, 0.75f, true) { @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) { return size() > capacity; } };`',
      ],
      tests: `var cache = new LruCache<String, Integer>(2);
cache.put("a", 1);
cache.put("b", 2);
check("get a", 1, cache.get("a"));
cache.put("c", 3);
check("b wurde verdrängt", null, cache.get("b"));
check("a noch da", 1, cache.get("a"));
check("c da", 3, cache.get("c"));
check("Größe begrenzt", 2, cache.size());
check("Reihenfolge nach Zugriff", List.of("a", "c"), cache.keys());
cache.put("a", 10);
check("Update", 10, cache.get("a"));
check("Update ändert Größe nicht", 2, cache.size());
check("unbekannt", null, cache.get("zzz"));`,
    },
  ],
}

export default chapter
