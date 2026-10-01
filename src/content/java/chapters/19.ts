import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '19',
  flashcards: [
    {
      id: 'f1',
      front: 'Was ist der Unterschied zwischen `Pageable`, `Slice<T>` und `Page<T>`?',
      back: '`Pageable` ist die **Anfrage** (page, size, sort). `Slice<T>` ist die **Antwort** mit Inhalt + `hasNext()`. `Page<T> extends Slice<T>` und kennt zusätzlich `getTotalElements()` / `getTotalPages()`.',
    },
    {
      id: 'f2',
      front: 'Wie baust du „Seite 3, 25 Einträge, nach `createdAt` absteigend“?',
      back: `\`\`\`java
Pageable pageable = PageRequest.of(2, 25, Sort.by("createdAt").descending());
\`\`\`
Achtung: Seiten sind **0-basiert** – Seite 3 ist Index 2.`,
    },
    {
      id: 'f3',
      front: 'Wie viele Queries erzeugt eine `Page`-Methode, wie viele eine `Slice`-Methode?',
      back: '`Page`: Content-Query **+ COUNT-Query**. `Slice`: nur **eine** Query, die `size + 1` Zeilen liest.',
    },
    {
      id: 'f4',
      front: 'Woher weiß eine `Slice`, dass es eine nächste Seite gibt?',
      back: 'Spring fragt `size + 1` Datensätze ab. Kommt die Extra-Zeile zurück, ist `hasNext() == true`; sie wird abgeschnitten und nicht ausgeliefert.',
    },
    {
      id: 'f5',
      front: 'Wie berechnest du `offset` und `totalPages`?',
      back: '`offset = (long) page * size`. `totalPages = ceil(totalElements / size)`, in Integer-Arithmetik `(int) ((total + size - 1) / size)`.',
    },
    {
      id: 'f6',
      front: 'Wie mappst du eine `Page<UserEntity>` auf eine `Page<UserDto>`?',
      back: `\`\`\`java
return repository.findAll(pageable).map(mapper::toDto);
\`\`\`
\`map\` behält Pageable, Sort, \`hasNext\` und \`totalElements\` – nur der Inhalt wird transformiert.`,
    },
    {
      id: 'f7',
      front: 'Welche Query-Parameter bindet Spring automatisch an ein `Pageable`?',
      back: '`?page=1&size=50&sort=lastName,asc&sort=firstName`. `sort` darf mehrfach vorkommen, die Reihenfolge bestimmt die Priorität.',
    },
    {
      id: 'f8',
      front: 'Wie setzt du Defaults für ein `Pageable` in einem Controller?',
      back: `\`\`\`java
@GetMapping("/api/users")
public Page<UserDto> list(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
        Pageable pageable) { ... }
\`\`\``,
    },
    {
      id: 'f9',
      front: 'Warum musst du beim Paginieren immer sortieren?',
      back: 'Ohne `ORDER BY` ist die Zeilenreihenfolge in SQL **undefiniert**. Zwischen zwei Seitenabrufen können Elemente doppelt erscheinen oder fehlen. Zusätzlich ein eindeutiges Tie-Breaker-Feld (`id`) anhängen.',
    },
    {
      id: 'f10',
      front: 'Was bewirkt `spring.data.web.pageable.max-page-size=100`?',
      back: 'Begrenzt die vom Client anforderbare Seitengröße (Default 2000). Schutz davor, dass `?size=1000000` die Anwendung lahmlegt.',
    },
    {
      id: 'f11',
      front: 'Wie gibst du einem `@Query` eine eigene Count-Query?',
      back: `\`\`\`java
@Query(value = "select o from OrderEntity o join o.customer c where c.country = :c",
       countQuery = "select count(o) from OrderEntity o join o.customer c where c.country = :c")
Page<OrderEntity> findByCountry(@Param("c") String country, Pageable pageable);
\`\`\``,
    },
    {
      id: 'f12',
      front: 'Was ist das Problem mit sehr großen Offsets (`page=5000`)?',
      back: 'Die Datenbank muss alle übersprungenen Zeilen trotzdem lesen → Laufzeit wächst mit dem Offset. Außerdem ist Offset-Pagination instabil, wenn währenddessen Zeilen eingefügt/gelöscht werden.',
    },
    {
      id: 'f13',
      front: 'Was ist Keyset-Pagination?',
      back: 'Statt `offset` wird der letzte gesehene Schlüssel weitergereicht: `where id > :lastId order by id limit :size`. Konstant schnell und stabil, aber kein direktes Springen zu Seite N. Spring Data: `ScrollPosition` / `Window`.',
    },
    {
      id: 'f14',
      front: 'Warum solltest du `PageImpl` nicht direkt als JSON serialisieren?',
      back: 'Die JSON-Struktur ist nicht als API-Vertrag stabilisiert (Warnung beim Start). Besser ein eigenes `PageResponse`-Record oder `@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)` (Boot 3.3+).',
    },
    {
      id: 'f15',
      front: 'Was passiert bei `join fetch` auf eine Collection zusammen mit `Pageable`?',
      back: 'Hibernate kann nicht in SQL limitieren und paginiert **im Speicher** (`HHH000104` / „firstResult/maxResults specified with collection fetch“). Lösung: erst IDs paginieren, dann die Collection in einer zweiten Query laden.',
    },
    {
      id: 'f16',
      front: 'Wann `Page`, wann `Slice`, wann `List`?',
      back: '`Page` für „Seite 3 von 17“ mit Seitenzahlen. `Slice` für Infinite Scroll / „Mehr laden“ (spart den COUNT). `List` mit `Pageable` oder `Top N`, wenn du gar keine Metadaten brauchst.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Seite liefert `PageRequest.of(1, 20)`?',
      options: ['Die erste Seite (Elemente 1–20)', 'Die zweite Seite (Elemente 21–40)', 'Einen Fehler, Seiten starten bei 1', 'Alle Elemente, `1` ist die Anzahl Seiten'],
      correct: 1,
      explanation: 'Seiten sind 0-basiert. `of(1, 20)` heißt `offset = 1 * 20 = 20`, also die **zweite** Seite.',
    },
    {
      id: 'q2',
      prompt: 'Wie viele SQL-Statements erzeugt dieser Aufruf typischerweise?',
      code: `Page<UserEntity> page = repository.findByActiveTrue(PageRequest.of(0, 20));`,
      options: ['1', '2 (Content + COUNT)', '21 (`size + 1`)', '20'],
      correct: 1,
      explanation: '`Page` braucht zusätzlich `select count(*)`, um `totalElements`/`totalPages` zu füllen. Nur bei einer nicht vollen ersten Seite spart Spring die COUNT-Query.',
    },
    {
      id: 'q3',
      prompt: 'Wie viele Zeilen liest Spring bei `Slice<PostEntity> findByAuthorId(Long id, Pageable p)` mit `size = 20`?',
      options: ['20', '21', '40', 'Alle, das Limit passiert in Java'],
      correct: 1,
      explanation: '`size + 1` – die Extra-Zeile beantwortet `hasNext()` und wird anschließend abgeschnitten.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Bug?',
      code: `Page<UserEntity> page = repository.findAll(pageable);
List<UserDto> dtos = page.getContent().stream().map(mapper::toDto).toList();
return new PageImpl<>(dtos);`,
      options: [
        '`PageImpl` ist abstrakt',
        'Der Ein-Argument-Konstruktor verliert `pageable` und `totalElements` – `getTotalPages()` liefert 1',
        '`getContent()` gibt `null` zurück, wenn die Seite leer ist',
        '`map` gibt es auf `Page` nicht',
      ],
      correct: 1,
      explanation: '`new PageImpl<>(list)` erzeugt eine „unpaged“ Seite mit `total = list.size()`. Richtig ist `repository.findAll(pageable).map(mapper::toDto)` – das erhält alle Metadaten.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist Clean Code für „die 50 neuesten Bestellungen eines Kunden, paginiert“?',
      options: [
        '`repository.findAll()` laden und mit `subList` schneiden',
        '`repository.findByCustomerId(id, PageRequest.of(page, 50, Sort.by("createdAt").descending().and(Sort.by("id"))))`',
        '`repository.findByCustomerId(id)` und danach `stream().skip(page * 50).limit(50)`',
        '`repository.findByCustomerId(id, PageRequest.of(page, 50))` ohne Sortierung',
      ],
      correct: 1,
      explanation: 'Filtern, Sortieren und Limitieren gehören in die Datenbank. Ohne deterministische Sortierung (inkl. eindeutigem Tie-Breaker) ist die Seitenaufteilung nicht stabil.',
    },
    {
      id: 'q6',
      prompt: 'Was gilt für eine leere Tabelle bei `Page<T>` mit `size = 20`?',
      options: [
        '`getTotalPages() == 1` und `isLast() == false`',
        '`getTotalPages() == 0` und `isLast() == true`',
        '`getTotalPages() == 0` und `isLast() == false`',
        '`getContent()` ist `null`',
      ],
      correct: 1,
      explanation: '`totalPages = ceil(0 / 20) = 0`. Es gibt keine nächste Seite, also `hasNext() == false` und `isLast() == true`. `getContent()` ist eine leere Liste, nie `null`.',
    },
    {
      id: 'q7',
      prompt: 'Was passiert zur Laufzeit?',
      code: `Page<UserEntity> page = repository.findAll(PageRequest.of(0, 20));
Page<UserDto> dtos = page.map(mapper::toDto);`,
      options: [
        'Es wird eine weitere Query ausgeführt',
        'Nur der Inhalt wird transformiert; `pageable`, `sort`, `totalElements` und `hasNext` bleiben erhalten',
        '`dtos.getTotalElements()` ist immer `20`',
        'Kompilierfehler – `map` existiert nur auf `Stream`',
      ],
      correct: 1,
      explanation: '`Page.map` ist ein Functor über dem Inhalt: Container-Metadaten bleiben, nur `T` wird zu `R`. Es wird keine neue Query abgesetzt.',
    },
    {
      id: 'q8',
      prompt: 'Welche Aussage über diese Repository-Methode stimmt?',
      code: `@Query("select o from OrderEntity o join fetch o.items")
Page<OrderEntity> findAllWithItems(Pageable pageable);`,
      options: [
        'Die Pagination wird korrekt in SQL mit LIMIT/OFFSET umgesetzt',
        'Hibernate lädt alle Zeilen und paginiert im Speicher (Warnung `HHH000104`)',
        'Das ist ein Kompilierfehler',
        '`join fetch` wird von Spring Data ignoriert',
      ],
      correct: 1,
      explanation: 'Bei einem Collection-Fetch entspricht eine SQL-Zeile nicht einer Entity – LIMIT wäre falsch. Hibernate holt deshalb alles und schneidet in Java. Lösung: IDs paginieren + zweite Query oder `@BatchSize`.',
    },
    {
      id: 'q9',
      prompt: 'Die UI hat nur einen „Mehr laden“-Button und zeigt keine Gesamtanzahl. Welche Signatur ist die richtige?',
      options: [
        '`Page<PostDto> feed(Pageable pageable)`',
        '`Slice<PostDto> feed(Pageable pageable)`',
        '`List<PostDto> feed()` und im Frontend schneiden',
        '`Optional<List<PostDto>> feed(Pageable pageable)`',
      ],
      correct: 1,
      explanation: 'Ohne angezeigte Gesamtzahl ist die COUNT-Query von `Page` reine Verschwendung – besonders bei großen Tabellen mit Joins. `Slice` reicht.',
    },
    {
      id: 'q10',
      prompt: 'Warum ist Keyset-Pagination bei `page=5000&size=20` besser als Offset?',
      options: [
        'Sie erlaubt das direkte Springen zu beliebigen Seiten',
        'Die DB muss 100 000 Zeilen nicht erst lesen und verwerfen; außerdem verschieben gleichzeitige Inserts die Seite nicht',
        'Sie braucht keinen Index',
        'Sie liefert automatisch `totalElements`',
      ],
      correct: 1,
      explanation: 'Offset ist O(offset) und instabil bei parallelen Änderungen. Keyset (`where id > :lastId order by id limit :size`) nutzt den Index direkt – dafür gibt es kein Springen zu Seite N und keine Gesamtzahl.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Pagination-Arithmetik',
      level: 2,
      description: `Bevor du \`Page\` benutzt, solltest du die Formeln im Schlaf können. Implementiere \`PageMath\` mit **statischen** Methoden:

- \`static long offset(int page, int size)\` → \`page * size\` (als \`long\`, damit nichts überläuft)
- \`static int totalPages(long totalElements, int size)\` → \`ceil(totalElements / size)\` **ohne** \`double\`
- \`static boolean isLast(int page, int size, long totalElements)\` → gibt es nach dieser Seite noch etwas?

Validierung: \`size <= 0\`, \`page < 0\` und \`totalElements < 0\` führen zu einer \`IllegalArgumentException\`.

Edge Cases, an die du denken musst: leere Tabelle, Seite hinter dem Ende, exakt aufgehende Division.`,
      starter: `class PageMath {

    static long offset(int page, int size) {
        // TODO
        return -1;
    }

    static int totalPages(long totalElements, int size) {
        // TODO
        return -1;
    }

    static boolean isLast(int page, int size, long totalElements) {
        // TODO
        return false;
    }
}`,
      solution: `class PageMath {

    static long offset(int page, int size) {
        validate(page, size);
        return (long) page * size;
    }

    static int totalPages(long totalElements, int size) {
        validateSize(size);
        validateTotal(totalElements);
        return (int) ((totalElements + size - 1) / size);
    }

    static boolean isLast(int page, int size, long totalElements) {
        validate(page, size);
        validateTotal(totalElements);
        return page + 1 >= totalPages(totalElements, size);
    }

    private static void validate(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be >= 0 but was " + page);
        }
        validateSize(size);
    }

    private static void validateSize(int size) {
        if (size <= 0) {
            throw new IllegalArgumentException("size must be > 0 but was " + size);
        }
    }

    private static void validateTotal(long totalElements) {
        if (totalElements < 0) {
            throw new IllegalArgumentException("totalElements must be >= 0 but was " + totalElements);
        }
    }
}`,
      hints: [
        'Aufrunden ohne Gleitkomma: Vor der Division `size - 1` addieren. Der Rest ist Ganzzahlarithmetik.',
        '`(long) page * size` casted **vor** der Multiplikation. `(totalElements + size - 1) / size` ergibt `ceil`. `isLast` lässt sich über `totalPages` ausdrücken.',
        'validate(page, size) → offset = page * size; totalPages = (total + size - 1) / size; isLast = page + 1 >= totalPages.',
        '`return (int) ((totalElements + size - 1) / size);`',
      ],
      tests: `check("offset erste Seite", 0L, PageMath.offset(0, 20));
check("offset dritte Seite", 60L, PageMath.offset(3, 20));
check("offset laeuft nicht ueber int", 4000000000L, PageMath.offset(2000000, 2000));
check("totalPages exakt", 5, PageMath.totalPages(100, 20));
check("totalPages mit Rest", 6, PageMath.totalPages(101, 20));
check("totalPages ein Element", 1, PageMath.totalPages(1, 20));
check("totalPages leere Tabelle", 0, PageMath.totalPages(0, 20));
checkTrue("letzte Seite", PageMath.isLast(4, 20, 100));
checkTrue("vorletzte Seite ist nicht last", !PageMath.isLast(3, 20, 100));
checkTrue("leere Tabelle: Seite 0 ist last", PageMath.isLast(0, 20, 0));
checkTrue("Seite hinter dem Ende ist last", PageMath.isLast(99, 20, 100));
checkThrows("size 0", IllegalArgumentException.class, () -> PageMath.totalPages(10, 0));
checkThrows("negative page", IllegalArgumentException.class, () -> PageMath.offset(-1, 20));
checkThrows("negative totalElements", IllegalArgumentException.class, () -> PageMath.isLast(0, 20, -5));`,
    },
    {
      id: 'k2',
      title: 'Page<T> selbst bauen',
      level: 3,
      description: `Baue eine eigene generische \`PageImpl<T>\` nach, damit du weißt, was Spring dir abnimmt.

Konstruktor: \`PageImpl(List<T> content, int number, int size, long totalElements)\` – validiert \`size > 0\`, \`number >= 0\`, \`totalElements >= 0\` (sonst \`IllegalArgumentException\`) und kopiert den Inhalt defensiv.

Zu implementieren:
- \`getNumberOfElements()\` – Elemente **auf dieser Seite**
- \`getTotalPages()\`
- \`hasContent()\`, \`isFirst()\`, \`isLast()\`, \`hasNext()\`, \`hasPrevious()\`
- \`<R> PageImpl<R> map(Function<? super T, ? extends R> mapper)\` – transformiert nur den Inhalt, **alle Metadaten bleiben erhalten**

Eine Seite hinter dem Ende (leerer Inhalt, hohe Nummer) muss \`isLast() == true\` liefern.`,
      starter: `class PageImpl<T> {
    private final List<T> content;
    private final int number;
    private final int size;
    private final long totalElements;

    PageImpl(List<T> content, int number, int size, long totalElements) {
        // TODO: size > 0, number >= 0, totalElements >= 0 pruefen
        this.content = List.copyOf(content);
        this.number = number;
        this.size = size;
        this.totalElements = totalElements;
    }

    List<T> getContent() {
        return content;
    }

    int getNumber() {
        return number;
    }

    int getSize() {
        return size;
    }

    long getTotalElements() {
        return totalElements;
    }

    int getNumberOfElements() {
        // TODO
        return -1;
    }

    int getTotalPages() {
        // TODO
        return -1;
    }

    boolean hasContent() {
        // TODO
        return false;
    }

    boolean isFirst() {
        // TODO
        return false;
    }

    boolean isLast() {
        // TODO
        return false;
    }

    boolean hasNext() {
        // TODO
        return false;
    }

    boolean hasPrevious() {
        // TODO
        return false;
    }

    <R> PageImpl<R> map(Function<? super T, ? extends R> mapper) {
        // TODO
        return null;
    }
}`,
      solution: `class PageImpl<T> {
    private final List<T> content;
    private final int number;
    private final int size;
    private final long totalElements;

    PageImpl(List<T> content, int number, int size, long totalElements) {
        if (size <= 0) {
            throw new IllegalArgumentException("size must be > 0 but was " + size);
        }
        if (number < 0) {
            throw new IllegalArgumentException("number must be >= 0 but was " + number);
        }
        if (totalElements < 0) {
            throw new IllegalArgumentException("totalElements must be >= 0 but was " + totalElements);
        }
        this.content = List.copyOf(content);
        this.number = number;
        this.size = size;
        this.totalElements = totalElements;
    }

    List<T> getContent() {
        return content;
    }

    int getNumber() {
        return number;
    }

    int getSize() {
        return size;
    }

    long getTotalElements() {
        return totalElements;
    }

    int getNumberOfElements() {
        return content.size();
    }

    int getTotalPages() {
        return (int) ((totalElements + size - 1) / size);
    }

    boolean hasContent() {
        return !content.isEmpty();
    }

    boolean isFirst() {
        return number == 0;
    }

    boolean isLast() {
        return number + 1 >= getTotalPages();
    }

    boolean hasNext() {
        return !isLast();
    }

    boolean hasPrevious() {
        return number > 0;
    }

    <R> PageImpl<R> map(Function<? super T, ? extends R> mapper) {
        List<R> mapped = content.stream()
            .<R>map(mapper)
            .toList();
        return new PageImpl<>(mapped, number, size, totalElements);
    }
}`,
      hints: [
        '`getTotalPages()` ist die einzige echte Rechnung – alle Booleans lassen sich daraus ableiten. `map` erzeugt eine **neue** Page mit denselben Metadaten.',
        '`(totalElements + size - 1) / size` für `ceil`. `content.stream().map(mapper).toList()`. `List.copyOf` für defensives Kopieren.',
        'isFirst = number == 0; isLast = number + 1 >= totalPages; hasNext = !isLast; hasPrevious = number > 0; map = new PageImpl<>(gemappt, number, size, totalElements).',
        '`return new PageImpl<>(content.stream().<R>map(mapper).toList(), number, size, totalElements);`',
      ],
      tests: `PageImpl<String> page = new PageImpl<>(List.of("aa", "bbb", "c"), 1, 3, 10);
check("numberOfElements", 3, page.getNumberOfElements());
check("size bleibt", 3, page.getSize());
check("totalPages", 4, page.getTotalPages());
checkTrue("hasContent", page.hasContent());
checkTrue("hasNext", page.hasNext());
checkTrue("hasPrevious", page.hasPrevious());
checkTrue("nicht first", !page.isFirst());
checkTrue("nicht last", !page.isLast());

PageImpl<Integer> mapped = page.map(String::length);
check("map transformiert Inhalt", List.of(2, 3, 1), mapped.getContent());
check("map behaelt totalElements", 10L, mapped.getTotalElements());
check("map behaelt number", 1, mapped.getNumber());
check("map behaelt totalPages", 4, mapped.getTotalPages());

PageImpl<String> last = new PageImpl<>(List.of("j"), 3, 3, 10);
checkTrue("letzte Seite", last.isLast());
checkTrue("letzte Seite hat kein next", !last.hasNext());
check("letzte Seite hat 1 Element", 1, last.getNumberOfElements());

PageImpl<String> empty = new PageImpl<>(List.of(), 0, 20, 0);
check("leer: totalPages", 0, empty.getTotalPages());
checkTrue("leer: isFirst", empty.isFirst());
checkTrue("leer: isLast", empty.isLast());
checkTrue("leer: kein Inhalt", !empty.hasContent());

PageImpl<String> behind = new PageImpl<>(List.of(), 7, 20, 10);
checkTrue("Seite hinter dem Ende ist last", behind.isLast());
checkTrue("Seite hinter dem Ende hat kein next", !behind.hasNext());

checkThrows("size 0", IllegalArgumentException.class, () -> new PageImpl<>(List.of("a"), 0, 0, 1));
checkThrows("negative number", IllegalArgumentException.class, () -> new PageImpl<>(List.of("a"), -1, 10, 1));`,
    },
    {
      id: 'k3',
      title: 'Slice mit dem size-plus-1-Trick',
      level: 4,
      description: `Implementiere \`SliceSupport.slice(...)\` genau so, wie Spring Data eine \`Slice\` erzeugt: sortieren, \`page * size\` überspringen, **\`size + 1\`** Elemente lesen und aus der Extra-Zeile \`hasNext\` ableiten.

\`\`\`java
static <T> SliceImpl<T> slice(List<T> source, Comparator<T> comparator, int page, int size)
\`\`\`

- Der Inhalt enthält **höchstens \`size\`** Elemente – die Extra-Zeile wird abgeschnitten.
- \`hasNext\` ist genau dann \`true\`, wenn die Extra-Zeile existierte.
- \`page < 0\` oder \`size <= 0\` → \`IllegalArgumentException\`.
- Eine Seite hinter dem Ende liefert leeren Inhalt, behält aber ihre Seitennummer.`,
      given: `record Product(String name, int price) {}

record SliceImpl<T>(List<T> content, int number, int size, boolean hasNext) {
    boolean isLast() {
        return !hasNext;
    }
}`,
      starter: `class SliceSupport {

    static <T> SliceImpl<T> slice(List<T> source, Comparator<T> comparator, int page, int size) {
        // TODO
        return null;
    }
}`,
      solution: `class SliceSupport {

    static <T> SliceImpl<T> slice(List<T> source, Comparator<T> comparator, int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be >= 0 but was " + page);
        }
        if (size <= 0) {
            throw new IllegalArgumentException("size must be > 0 but was " + size);
        }

        List<T> window = source.stream()
            .sorted(comparator)
            .skip((long) page * size)
            .limit(size + 1L)          // eine Zeile mehr als angefragt
            .toList();

        boolean hasNext = window.size() > size;
        List<T> content = hasNext ? List.copyOf(window.subList(0, size)) : window;
        return new SliceImpl<>(content, page, size, hasNext);
    }
}`,
      hints: [
        'Eine Slice kennt die Gesamtzahl nicht. Die einzige Information über „gibt es mehr?“ kommt daraus, dass du bewusst ein Element zu viel liest.',
        '`stream().sorted(comparator).skip(offset).limit(size + 1).toList()`, danach `window.size() > size` und `subList(0, size)`.',
        'validate → window = sortiert, skip(page*size), limit(size+1) → hasNext = window.size() > size → content = hasNext ? window.subList(0, size) : window.',
        '`boolean hasNext = window.size() > size;\\nList<T> content = hasNext ? List.copyOf(window.subList(0, size)) : window;`',
      ],
      tests: `List<Product> data = List.of(
    new Product("Mouse", 20),
    new Product("Keyboard", 50),
    new Product("Cable", 20),
    new Product("Monitor", 200),
    new Product("Dock", 120));
Comparator<Product> byName = Comparator.comparing(Product::name);

SliceImpl<Product> first = SliceSupport.slice(data, byName, 0, 2);
check("erste Seite sortiert", List.of(new Product("Cable", 20), new Product("Dock", 120)), first.content());
check("hoechstens size Elemente", 2, first.content().size());
checkTrue("hasNext", first.hasNext());
checkTrue("nicht last", !first.isLast());

SliceImpl<Product> last = SliceSupport.slice(data, byName, 2, 2);
check("letzte Seite", List.of(new Product("Mouse", 20)), last.content());
checkTrue("letzte Seite ohne next", !last.hasNext());
checkTrue("letzte Seite isLast", last.isLast());

SliceImpl<Product> exact = SliceSupport.slice(data, byName, 0, 5);
check("genau aufgehend", 5, exact.content().size());
checkTrue("genau aufgehend ohne next", !exact.hasNext());

SliceImpl<Product> behind = SliceSupport.slice(data, byName, 5, 2);
check("Seite hinter dem Ende ist leer", List.<Product>of(), behind.content());
checkTrue("Seite hinter dem Ende ohne next", !behind.hasNext());
check("Seitennummer bleibt erhalten", 5, behind.number());

SliceImpl<Product> fromEmpty = SliceSupport.slice(List.<Product>of(), byName, 0, 10);
check("leere Quelle", List.<Product>of(), fromEmpty.content());
checkTrue("leere Quelle ohne next", !fromEmpty.hasNext());

Comparator<Product> byPriceThenName = Comparator.comparingInt(Product::price).thenComparing(Product::name);
check("Tie-Breaker entscheidet", List.of(new Product("Cable", 20), new Product("Mouse", 20)),
    SliceSupport.slice(data, byPriceThenName, 0, 2).content());

checkThrows("size 0", IllegalArgumentException.class, () -> SliceSupport.slice(data, byName, 0, 0));
checkThrows("negative page", IllegalArgumentException.class, () -> SliceSupport.slice(data, byName, -1, 10));`,
    },
    {
      id: 'k4',
      title: 'Paginierter Lese-Endpoint mit Spring (write & compare)',
      level: 5,
      description: `Schreibe den kompletten Lesepfad für \`GET /api/orders\` – Repository, Service und Controller.

1. \`OrderRepository extends JpaRepository<OrderEntity, Long>\`
   - \`Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable)\`
   - \`Slice<OrderEntity> findByCustomerId(Long customerId, Pageable pageable)\` (Infinite Scroll, kein COUNT)
   - eine \`@Query\` mit Join auf \`customer\` **und eigener \`countQuery\`**
2. \`OrderQueryService\`
   - \`@Transactional(readOnly = true)\`
   - liefert \`Page<OrderDto>\` über \`…​.map(mapper::toDto)\` – **nicht** über ein neues \`PageImpl\`
3. \`OrderController\`
   - \`@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)\`
   - gibt ein eigenes \`PageResponse<T>\`-Record zurück statt \`PageImpl\` direkt zu serialisieren
4. Notiere darunter als Kommentar, welche Properties du setzen würdest (max. Seitengröße, \`open-in-view\`).

Diese Kata wird **nicht** ausgeführt – schreibe sie von Hand und vergleiche danach mit der Musterlösung.`,
      starter: `public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    // TODO
}

// TODO: OrderQueryService

// TODO: OrderController

// TODO: PageResponse`,
      solution: `import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable);

    // Infinite Scroll: kein count(*)
    Slice<OrderEntity> findByCustomerId(Long customerId, Pageable pageable);

    @Query(value = """
            select o from OrderEntity o
              join o.customer c
             where c.country = :country
            """,
           countQuery = """
            select count(o) from OrderEntity o
              join o.customer c
             where c.country = :country
            """)
    Page<OrderEntity> findByCustomerCountry(@Param("country") String country, Pageable pageable);
}

@Service
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository repository;
    private final OrderMapper mapper;

    public OrderQueryService(OrderRepository repository, OrderMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public Page<OrderDto> byStatus(OrderStatus status, Pageable pageable) {
        // map() behaelt pageable, sort, totalElements - kein neues PageImpl bauen!
        return repository.findByStatus(status, pageable).map(mapper::toDto);
    }

    public Slice<OrderDto> feedForCustomer(Long customerId, Pageable pageable) {
        return repository.findByCustomerId(customerId, pageable).map(mapper::toDto);
    }
}

public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}

@RestController
public class OrderController {

    private final OrderQueryService service;

    public OrderController(OrderQueryService service) {
        this.service = service;
    }

    @GetMapping("/api/orders")
    public PageResponse<OrderDto> list(
            @RequestParam OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return PageResponse.of(service.byStatus(status, pageable));
    }
}

// application.properties
// spring.data.web.pageable.max-page-size=100      Schutz gegen ?size=1000000
// spring.data.web.pageable.default-page-size=20
// spring.jpa.open-in-view=false                   Lazy-Fehler frueh sichtbar machen
//
// Sortier-Properties aus dem Request gehoeren gewhitelistet - sonst kann ein Client
// nach beliebigen (auch internen) Feldern sortieren.`,
      hints: [
        'Drei Schichten, drei Verantwortungen: Repository = Abfrage, Service = Transaktion + Mapping, Controller = HTTP-Vertrag.',
        '`Page`, `Slice`, `Pageable`, `@PageableDefault`, `@Query(value = ..., countQuery = ...)`, `@Transactional(readOnly = true)`, `page.map(...)`.',
        'Repository liefert Entities → Service mappt mit `.map(mapper::toDto)` → Controller verpackt in ein eigenes Response-Record. Für den Feed `Slice` statt `Page`, damit kein COUNT läuft.',
        '`public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages, boolean last) { public static <T> PageResponse<T> of(Page<T> p) { ... } }`',
      ],
    },
  ],
}

export default chapter
