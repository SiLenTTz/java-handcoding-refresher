import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '06',
  flashcards: [
    { id: 'f1', front: 'Wofür steht `Optional<T>` – und wofür nicht?', back: 'Ein Container mit **0 oder 1** Element. Gedacht als **Rückgabetyp** für „hier kann legitim nichts sein". Nicht als Feld, Parameter oder Collection-Element.' },
    { id: 'f2', front: 'Unterschied `Optional.of` und `Optional.ofNullable`?', back: '`of(x)` wirft sofort eine `NullPointerException`, wenn `x` null ist (dokumentiert „darf nie null sein"). `ofNullable(x)` liefert bei null `Optional.empty()`.' },
    { id: 'f3', front: 'Wann `map`, wann `flatMap`?', back: 'Liefert die Funktion einen **normalen Wert** → `map`. Liefert sie selbst ein `Optional` → `flatMap`, sonst entsteht `Optional<Optional<T>>`.' },
    { id: 'f4', front: 'Der Unterschied zwischen `orElse` und `orElseGet`?', back: '`orElse(x)` wertet `x` **immer** aus – auch wenn ein Wert da ist. `orElseGet(supplier)` ruft den Supplier nur bei `empty`. Konstanten → `orElse`, teure Aufrufe → `orElseGet`.' },
    { id: 'f5', front: 'Wie holst du einen Wert heraus und wirfst sonst eine fachliche Exception?', back: '```java\nUser user = repo.findById(id)\n    .orElseThrow(() -> new UserNotFoundException(id));\n```' },
    { id: 'f6', front: 'Warum kein `Optional.get()`?', back: 'Wirft `NoSuchElementException` ohne jeden Kontext und verführt zum `isPresent()`+`get()`-Muster. Seit Java 10 gibt es `orElseThrow()` – gleiche Semantik, ehrlicher Name.' },
    { id: 'f7', front: '`ifPresent` vs. `ifPresentOrElse`?', back: '`ifPresent(Consumer)` führt etwas aus, wenn ein Wert da ist. `ifPresentOrElse(Consumer, Runnable)` hat zusätzlich einen else-Zweig. Beide sind `void` – für Werte `map` + `orElse…` nutzen.' },
    { id: 'f8', front: 'Was macht `Optional.or(...)`?', back: 'Fallback-Kette auf Optional-Ebene: `fromEnv().or(() -> fromFile()).or(() -> fromDefaults())`. Der Supplier liefert selbst ein `Optional` und wird nur bei `empty` ausgeführt (Java 9).' },
    { id: 'f9', front: 'Wie filterst du leere Optionals aus einem Stream?', back: '```java\nusers.stream().map(User::address)\n    .flatMap(Optional::stream)\n    .toList();\n```\nStatt `filter(Optional::isPresent).map(Optional::get)`.' },
    { id: 'f10', front: 'Was liefert `Optional.of(user).map(User::nickname)`, wenn `nickname` null ist?', back: '`Optional.empty()` – `map` ist null-tolerant und wrappt das Ergebnis mit `ofNullable`.' },
    { id: 'f11', front: 'Warum ist `Optional<List<User>>` ein Anti-Pattern?', back: 'Eine leere Liste drückt „nichts gefunden" bereits aus. Der Aufrufer müsste zwei Leer-Fälle unterscheiden (`empty` vs. leere Liste) – unnötige Komplexität.' },
    { id: 'f12', front: 'Warum gehört `Optional` nicht in ein Entity- oder DTO-Feld?', back: '`Optional` ist nicht `Serializable`, JPA/Jackson kommen damit schlecht klar, und es kostet ein Objekt pro Feld. Nullable Feld + `Optional`-Rückgabe in einer Methode ist der Weg.' },
    { id: 'f13', front: 'Welchen Rückgabetyp haben Spring-Data-Queries idealerweise?', back: '`Optional<T>` für „höchstens einer" (`findById`, `findByEmail`), `List<T>` für „viele". Ein nacktes `T` kann `null` liefern – vermeiden.' },
    { id: 'f14', front: 'Was liefert `users.stream().mapToInt(User::age).average()`?', back: 'Ein `OptionalDouble` – die primitive Variante ohne `map`/`flatMap`. Auspacken mit `orElse(0.0)`.' },
    { id: 'f15', front: 'Wie schreibt man `if (x != null) return x.name(); else return "?";` mit Optional?', back: '`Optional.ofNullable(x).map(X::name).orElse("?")`' },
    { id: 'f16', front: 'Was ist der schlimmste Optional-Fehler?', back: '`return null;` aus einer Methode mit Rückgabetyp `Optional<T>`. Der Aufrufer verlässt sich auf Nicht-Null – immer `Optional.empty()` zurückgeben.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was passiert hier zur Laufzeit, wenn `map.get(key)` `null` liefert?',
      code: `return Optional.of(map.get(key));`,
      options: [
        'Es wird `Optional.empty()` zurückgegeben',
        'Es wird `null` zurückgegeben',
        '`NullPointerException`',
        'Es kompiliert nicht',
      ],
      correct: 2,
      explanation: '`Optional.of` verbietet null per Vertrag. Für potentiell fehlende Werte ist `Optional.ofNullable(map.get(key))` korrekt.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `Optional<String> name = Optional.of("Jan");
String result = name.orElse(loadDefault());

static String loadDefault() {
    System.out.println("geladen");
    return "Default";
}`,
      options: ['nichts', '`geladen`', '`geladen` und `Default`', '`Default`'],
      correct: 1,
      explanation: '`orElse` ist ein normaler Methodenaufruf – das Argument wird **immer** ausgewertet, auch wenn der Wert vorhanden ist. `result` ist trotzdem `"Jan"`. Mit `orElseGet(Xy::loadDefault)` würde nichts ausgegeben.',
    },
    {
      id: 'q3',
      prompt: 'Warum kompiliert das nicht?',
      code: `record Address(String city) {}
record User(String name, Address address) {}

Optional<Address> a = Optional.of(user).flatMap(User::address);`,
      options: [
        '`flatMap` gibt es auf `Optional` nicht',
        '`User::address` liefert `Address`, `flatMap` erwartet aber eine Funktion, die ein `Optional` liefert',
        'Records dürfen keine Method References haben',
        '`Optional.of` akzeptiert keine Records',
      ],
      correct: 1,
      explanation: '`flatMap` braucht `Function<T, Optional<R>>`. Hier passt `map(User::address)` (liefert `Optional<Address>`, weil `map` null-tolerant ist) oder `flatMap(u -> Optional.ofNullable(u.address()))`.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat `result`?',
      code: `record User(String nickname) {}
var result = Optional.of(new User(null))
    .map(User::nickname)
    .orElse("anonym");`,
      options: ['`null`', '`"anonym"`', '`NullPointerException`', '`Optional.empty()`'],
      correct: 1,
      explanation: '`map` wrappt das Ergebnis mit `ofNullable`: ein `null`-Mapper-Ergebnis wird zu `empty`. Danach greift `orElse("anonym")`.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist Clean Code?',
      options: [
        '`if (opt.isPresent()) { return opt.get().name(); } else { return "?"; }`',
        '`return opt.isPresent() ? opt.get().name() : "?";`',
        '`return opt.map(User::name).orElse("?");`',
        '`return opt.orElse(null) != null ? opt.get().name() : "?";`',
      ],
      correct: 2,
      explanation: 'Der Wert bleibt im Container, bis er gebraucht wird. `isPresent()` + `get()` ist nur eine umständliche Null-Prüfung mit Zusatzobjekt.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `List<Optional<String>> list = List.of(
    Optional.of("a"), Optional.empty(), Optional.of("b"));
System.out.println(list.stream().flatMap(Optional::stream).toList());`,
      options: ['`[a, b]`', '`[a, null, b]`', '`[Optional[a], Optional[b]]`', '`NoSuchElementException`'],
      correct: 0,
      explanation: '`Optional::stream` (Java 9) liefert einen Stream mit 0 oder 1 Element. `flatMap` lässt die leeren einfach verschwinden.',
    },
    {
      id: 'q7',
      prompt: 'Wo ist der Bug?',
      code: `public Optional<User> findByEmail(String email) {
    User user = repository.findByEmail(email);
    if (user == null) {
        return null;
    }
    return Optional.of(user);
}`,
      options: [
        '`Optional.of` müsste `ofNullable` sein',
        '`return null` bei einem `Optional`-Rückgabetyp – der Aufrufer bekommt garantiert eine NPE',
        'Die Methode darf nicht `public` sein',
        'Kein Bug',
      ],
      correct: 1,
      explanation: 'Ein `null`-Optional ist der schlimmste Fall: Der Aufrufer ruft arglos `.map(..)` auf. Die ganze Methode ist ein Einzeiler: `return Optional.ofNullable(repository.findByEmail(email));`',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `Optional<Integer> a = Optional.of(5);
System.out.println(a.filter(x -> x > 10).map(x -> x * 2).orElse(-1));`,
      options: ['`10`', '`5`', '`-1`', '`Optional.empty()`'],
      correct: 2,
      explanation: '`filter` macht aus dem Optional ein `empty`, weil 5 nicht > 10 ist. `map` auf `empty` bleibt `empty`, also greift `orElse(-1)`.',
    },
    {
      id: 'q9',
      prompt: 'Welche Signatur ist sauber?',
      options: [
        '`Optional<List<User>> findActiveUsers()`',
        '`List<User> findActiveUsers()`',
        '`List<Optional<User>> findActiveUsers()`',
        '`Optional<User[]> findActiveUsers()`',
      ],
      correct: 1,
      explanation: 'Eine leere Liste bedeutet bereits „nichts gefunden". `Optional` um Collections erzeugt zwei Leer-Zustände, die jeder Aufrufer prüfen müsste.',
    },
    {
      id: 'q10',
      prompt: 'Was wird ausgegeben?',
      code: `Optional<String> primary = Optional.empty();
String value = primary
    .or(() -> Optional.of("fallback"))
    .orElse("default");
System.out.println(value);`,
      options: ['`default`', '`fallback`', '`null`', 'Compilefehler – `or` gibt es nicht'],
      correct: 1,
      explanation: '`or` liefert bei `empty` das Optional des Suppliers. Da dieses einen Wert enthält, kommt `orElse` gar nicht mehr zum Zug.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Sichere Map-Lookups',
      level: 1,
      description: `Implementiere ohne jede \`if (x == null)\`-Prüfung:

- \`findName(Map<Long, String> names, Long id)\` → \`Optional<String>\`
- \`displayName(Map<Long, String> names, Long id)\` → \`String\`, Fallback \`"Unbekannt"\`
- \`upperName(Map<Long, String> names, Long id)\` → \`Optional<String>\`, Name in Großbuchstaben`,
      starter: `class Solution {

    static Optional<String> findName(Map<Long, String> names, Long id) {
        // TODO
        return null;
    }

    static String displayName(Map<Long, String> names, Long id) {
        // TODO
        return null;
    }

    static Optional<String> upperName(Map<Long, String> names, Long id) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Optional<String> findName(Map<Long, String> names, Long id) {
        return Optional.ofNullable(names.get(id));
    }

    static String displayName(Map<Long, String> names, Long id) {
        return findName(names, id).orElse("Unbekannt");
    }

    static Optional<String> upperName(Map<Long, String> names, Long id) {
        return findName(names, id).map(name -> name.toUpperCase(Locale.ROOT));
    }
}`,
      hints: [
        '`map.get(..)` liefert `null`, wenn der Key fehlt – genau dafür gibt es eine null-tolerante Factory.',
        '`Optional.ofNullable(..)`, `orElse(..)`, `map(..)`.',
        'findName: ofNullable(names.get(id)). displayName: findName(..).orElse("Unbekannt"). upperName: findName(..).map(toUpperCase).',
        '`return Optional.ofNullable(names.get(id));`',
      ],
      tests: `Map<Long, String> names = Map.of(1L, "Jan", 2L, "Anna");
check("Treffer", Optional.of("Jan"), Solution.findName(names, 1L));
check("kein Treffer", Optional.empty(), Solution.findName(names, 99L));
check("Anzeige mit Treffer", "Anna", Solution.displayName(names, 2L));
check("Anzeige ohne Treffer", "Unbekannt", Solution.displayName(names, 99L));
check("gross", Optional.of("JAN"), Solution.upperName(names, 1L));
check("gross ohne Treffer", Optional.empty(), Solution.upperName(names, 99L));
check("leere Map", Optional.empty(), Solution.findName(Map.of(), 1L));`,
    },
    {
      id: 'k2',
      title: 'flatMap statt verschachtelter Optionals',
      level: 2,
      description: `Das \`UserRepository\` liefert \`Optional<User>\`, \`addressOf(user)\` liefert \`Optional<Address>\`. Implementiere:

- \`cityOf(UserRepository repo, Long id)\` → \`Optional<String>\`: Stadt des Users
- \`cityOrUnknown(UserRepository repo, Long id)\` → \`String\`, Fallback \`"unbekannt"\`
- \`activeCityOf(UserRepository repo, Long id)\` → \`Optional<String>\`: wie \`cityOf\`, aber nur für **aktive** User

Achtung: Ein User kann keine Adresse haben.`,
      given: `record Address(String street, String city) {}
record User(Long id, String name, Address address, boolean active) {}

class UserRepository {
    private final List<User> users;

    UserRepository(List<User> users) {
        this.users = users;
    }

    Optional<User> findById(Long id) {
        return users.stream().filter(user -> user.id().equals(id)).findFirst();
    }

    Optional<Address> addressOf(User user) {
        return Optional.ofNullable(user.address());
    }
}`,
      starter: `class Solution {

    static Optional<String> cityOf(UserRepository repo, Long id) {
        // TODO
        return null;
    }

    static String cityOrUnknown(UserRepository repo, Long id) {
        // TODO
        return null;
    }

    static Optional<String> activeCityOf(UserRepository repo, Long id) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Optional<String> cityOf(UserRepository repo, Long id) {
        return repo.findById(id)
            .flatMap(repo::addressOf)
            .map(Address::city);
    }

    static String cityOrUnknown(UserRepository repo, Long id) {
        return cityOf(repo, id).orElse("unbekannt");
    }

    static Optional<String> activeCityOf(UserRepository repo, Long id) {
        return repo.findById(id)
            .filter(User::active)
            .flatMap(repo::addressOf)
            .map(Address::city);
    }
}`,
      hints: [
        'Wenn die Funktion selbst ein `Optional` liefert, würde `map` verschachteln.',
        '`flatMap(repo::addressOf)`, `map(Address::city)`, `filter(User::active)`, `orElse(..)`.',
        'findById → flatMap(addressOf) → map(city). Für die aktive Variante das filter direkt nach findById einsetzen.',
        '`return repo.findById(id).flatMap(repo::addressOf).map(Address::city);`',
      ],
      tests: `var repo = new UserRepository(List.of(
    new User(1L, "Jan", new Address("Hauptstr. 1", "Dortmund"), true),
    new User(2L, "Anna", null, true),
    new User(3L, "Ben", new Address("Ring 5", "Essen"), false)));
check("Stadt vorhanden", Optional.of("Dortmund"), Solution.cityOf(repo, 1L));
check("User ohne Adresse", Optional.empty(), Solution.cityOf(repo, 2L));
check("User unbekannt", Optional.empty(), Solution.cityOf(repo, 99L));
check("Fallback", "unbekannt", Solution.cityOrUnknown(repo, 2L));
check("Fallback mit Treffer", "Dortmund", Solution.cityOrUnknown(repo, 1L));
check("aktiv", Optional.of("Dortmund"), Solution.activeCityOf(repo, 1L));
check("inaktiv wird gefiltert", Optional.empty(), Solution.activeCityOf(repo, 3L));`,
    },
    {
      id: 'k3',
      title: 'Fallback-Kette: or, orElseGet, orElseThrow',
      level: 2,
      description: `Eine Konfiguration wird aus zwei Quellen gelesen. Jede \`read\`-Anfrage zählt in \`source.reads\` mit – die Tests prüfen, dass du **faul** arbeitest.

- \`lookup(primary, fallback, key)\` → \`Optional<String>\`: erst \`primary\`, nur bei \`empty\` die \`fallback\`-Quelle
- \`lookupOrDefault(primary, fallback, key, defaultValue)\` → \`String\`
- \`require(primary, fallback, key)\` → \`String\`, sonst \`NoSuchElementException\` mit dem Key als Message

Die zweite Quelle darf **nicht** gelesen werden, wenn die erste liefert.`,
      given: `class ConfigSource {
    private final Map<String, String> values;
    int reads = 0;

    ConfigSource(Map<String, String> values) {
        this.values = values;
    }

    Optional<String> read(String key) {
        reads++;
        return Optional.ofNullable(values.get(key));
    }
}`,
      starter: `class Solution {

    static Optional<String> lookup(ConfigSource primary, ConfigSource fallback, String key) {
        // TODO
        return null;
    }

    static String lookupOrDefault(ConfigSource primary, ConfigSource fallback, String key, String defaultValue) {
        // TODO
        return null;
    }

    static String require(ConfigSource primary, ConfigSource fallback, String key) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Optional<String> lookup(ConfigSource primary, ConfigSource fallback, String key) {
        return primary.read(key).or(() -> fallback.read(key));
    }

    static String lookupOrDefault(ConfigSource primary, ConfigSource fallback, String key, String defaultValue) {
        return lookup(primary, fallback, key).orElse(defaultValue);
    }

    static String require(ConfigSource primary, ConfigSource fallback, String key) {
        return lookup(primary, fallback, key)
            .orElseThrow(() -> new NoSuchElementException(key));
    }
}`,
      hints: [
        'Es gibt eine Optional-Methode, die erst bei `empty` eine zweite Optional-Quelle befragt – und zwar lazy über einen Supplier.',
        '`or(Supplier<Optional<T>>)`, `orElse(..)`, `orElseThrow(Supplier<Throwable>)`.',
        'lookup: primary.read(key).or(() -> fallback.read(key)). require: lookup(..).orElseThrow(() -> new NoSuchElementException(key)).',
        '`return primary.read(key).or(() -> fallback.read(key));`',
      ],
      tests: `var primary = new ConfigSource(Map.of("db.url", "jdbc:primary"));
var fallback = new ConfigSource(Map.of("db.url", "jdbc:fallback", "db.user", "sa"));
check("primary gewinnt", Optional.of("jdbc:primary"), Solution.lookup(primary, fallback, "db.url"));
check("fallback wurde NICHT gelesen", 0, fallback.reads);
check("fallback greift", Optional.of("sa"), Solution.lookup(primary, fallback, "db.user"));
check("fallback jetzt gelesen", 1, fallback.reads);
check("nirgends vorhanden", Optional.empty(), Solution.lookup(primary, fallback, "db.pass"));
check("default", "secret", Solution.lookupOrDefault(primary, fallback, "db.pass", "secret"));
check("require liefert Wert", "jdbc:primary", Solution.require(primary, fallback, "db.url"));
checkThrows("require wirft", NoSuchElementException.class, () -> Solution.require(primary, fallback, "db.pass"));`,
    },
    {
      id: 'k4',
      title: 'Optional im Stream',
      level: 3,
      description: `Implementiere ohne \`isPresent()\` und ohne \`get()\`:

- \`cities(List<User> users)\` → \`List<String>\`: alle vorhandenen Städte, ohne Duplikate, alphabetisch sortiert (\`city\` kann \`null\` sein)
- \`oldestName(List<User> users)\` → \`Optional<String>\`: Name des ältesten Users
- \`firstCityOfActive(List<User> users)\` → \`String\`: Stadt des ersten aktiven Users mit Stadt, sonst \`"-"\``,
      given: `record User(Long id, String name, int age, String city, boolean active) {}`,
      starter: `class Solution {

    static List<String> cities(List<User> users) {
        // TODO
        return List.of();
    }

    static Optional<String> oldestName(List<User> users) {
        // TODO
        return null;
    }

    static String firstCityOfActive(List<User> users) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static List<String> cities(List<User> users) {
        return users.stream()
            .map(user -> Optional.ofNullable(user.city()))
            .flatMap(Optional::stream)
            .distinct()
            .sorted()
            .toList();
    }

    static Optional<String> oldestName(List<User> users) {
        return users.stream()
            .max(Comparator.comparingInt(User::age))
            .map(User::name);
    }

    static String firstCityOfActive(List<User> users) {
        return users.stream()
            .filter(User::active)
            .map(User::city)
            .filter(Objects::nonNull)
            .findFirst()
            .orElse("-");
    }
}`,
      hints: [
        'Ein `Optional` lässt sich in einen Stream mit 0 oder 1 Element verwandeln – damit fallen die leeren automatisch raus.',
        '`Optional::stream`, `flatMap`, `Stream.max(Comparator)` (liefert `Optional`), `findFirst`, `Objects::nonNull`.',
        'cities: map(ofNullable(city)) → flatMap(Optional::stream) → distinct → sorted → toList. oldestName: max(comparingInt(age)).map(name).',
        '`.map(user -> Optional.ofNullable(user.city())).flatMap(Optional::stream)`',
      ],
      tests: `var users = List.of(
    new User(1L, "Jan", 30, "Dortmund", true),
    new User(2L, "Anna", 45, null, true),
    new User(3L, "Ben", 28, "Essen", false),
    new User(4L, "Lea", 38, "Dortmund", true));
check("Staedte", List.of("Dortmund", "Essen"), Solution.cities(users));
check("aeltester", Optional.of("Anna"), Solution.oldestName(users));
check("erste Stadt aktiver User", "Dortmund", Solution.firstCityOfActive(users));
check("leere Liste: Staedte", List.of(), Solution.cities(List.of()));
check("leere Liste: aeltester", Optional.empty(), Solution.oldestName(List.of()));
check("keiner mit Stadt", "-", Solution.firstCityOfActive(List.of(new User(5L, "X", 1, null, true))));
check("nur inaktive", "-", Solution.firstCityOfActive(List.of(new User(6L, "Y", 1, "Bonn", false))));`,
    },
    {
      id: 'k5',
      title: 'Parsen, das fehlschlagen darf',
      level: 4,
      description: `Implementiere:

- \`parsePositive(String raw)\` → \`Optional<Integer>\`. Leer, wenn \`raw\` \`null\`, leer/nur Whitespace, keine Zahl oder \`<= 0\` ist. Umgebende Leerzeichen werden ignoriert (\`" 42 "\` → \`42\`).
- \`sumOfValid(List<String> raws)\` → \`int\`: Summe aller gültigen Werte, \`0\` bei keiner gültigen Eingabe.
- \`firstValid(List<String> raws)\` → \`Optional<Integer>\`: der erste gültige Wert.

Die Liste kann \`null\`-Elemente enthalten. Keine \`if\`-Kaskade – arbeite mit \`Optional\`-Kette und einem kleinen Helfer für \`Integer.parseInt\`.`,
      starter: `class Solution {

    static Optional<Integer> parsePositive(String raw) {
        // TODO
        return null;
    }

    static int sumOfValid(List<String> raws) {
        // TODO
        return -1;
    }

    static Optional<Integer> firstValid(List<String> raws) {
        // TODO
        return null;
    }
}`,
      solution: `class Solution {

    static Optional<Integer> parsePositive(String raw) {
        return Optional.ofNullable(raw)
            .map(String::trim)
            .filter(text -> !text.isEmpty())
            .flatMap(Solution::toInt)
            .filter(value -> value > 0);
    }

    private static Optional<Integer> toInt(String text) {
        try {
            return Optional.of(Integer.valueOf(text));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }

    static int sumOfValid(List<String> raws) {
        return raws.stream()
            .map(Solution::parsePositive)
            .flatMap(Optional::stream)
            .mapToInt(Integer::intValue)
            .sum();
    }

    static Optional<Integer> firstValid(List<String> raws) {
        return raws.stream()
            .map(Solution::parsePositive)
            .flatMap(Optional::stream)
            .findFirst();
    }
}`,
      hints: [
        'Beginne mit `Optional.ofNullable(raw)` und hänge Schritt für Schritt `map`/`filter` an. Das Parsen selbst kapselst du in eine private Methode, die `Optional` statt einer Exception liefert.',
        '`Optional.ofNullable`, `map(String::trim)`, `filter`, `flatMap`, `Optional::stream`, `mapToInt(..).sum()`, `findFirst`.',
        'parsePositive: ofNullable → map(trim) → filter(nicht leer) → flatMap(toInt) → filter(> 0). toInt: try/catch um parseInt, Rückgabe Optional.',
        '`return Optional.ofNullable(raw).map(String::trim).filter(t -> !t.isEmpty()).flatMap(Solution::toInt).filter(v -> v > 0);`',
      ],
      tests: `check("normal", Optional.of(42), Solution.parsePositive("42"));
check("mit Leerzeichen", Optional.of(7), Solution.parsePositive("  7 "));
check("null", Optional.empty(), Solution.parsePositive(null));
check("leer", Optional.empty(), Solution.parsePositive("   "));
check("keine Zahl", Optional.empty(), Solution.parsePositive("abc"));
check("negativ", Optional.empty(), Solution.parsePositive("-5"));
check("null-Wert 0", Optional.empty(), Solution.parsePositive("0"));
List<String> raws = Arrays.asList("10", null, "x", " 5", "-3", "0", "1");
check("Summe", 16, Solution.sumOfValid(raws));
check("Summe ohne gueltige", 0, Solution.sumOfValid(Arrays.asList(null, "x", "-1")));
check("erster gueltiger", Optional.of(10), Solution.firstValid(raws));
check("keiner gueltig", Optional.empty(), Solution.firstValid(Arrays.asList("x", null)));`,
    },
  ],
}

export default chapter
