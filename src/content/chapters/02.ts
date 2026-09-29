import type { ChapterContent } from '../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    { id: 'f1', front: 'Unterschied `List` und `Set`?', back: '`List`: geordnet, Index-Zugriff, Duplikate erlaubt. `Set`: keine Duplikate (über `equals`/`hashCode` bzw. `compareTo`), kein Index.' },
    { id: 'f2', front: 'Komplexität: `ArrayList.get(i)`, `ArrayList.contains(x)`, `HashSet.contains(x)`, `TreeSet.contains(x)`?', back: 'O(1), O(n), O(1) im Mittel, O(log n).' },
    { id: 'f3', front: 'Welches Set, wenn die Einfügereihenfolge erhalten bleiben soll?', back: '`LinkedHashSet`. Sortiert: `TreeSet`. Ohne Ordnungsanforderung: `HashSet`.' },
    { id: 'f4', front: 'Duplikate aus einer Liste entfernen und Reihenfolge behalten – Einzeiler?', back: '`List<String> unique = new ArrayList<>(new LinkedHashSet<>(list));` oder `list.stream().distinct().toList();`' },
    { id: 'f5', front: 'Welche Klasse als Stack verwenden – und welche Methoden?', back: '`Deque<T> stack = new ArrayDeque<>();` mit `push`, `pop`, `peek`. `java.util.Stack` ist Legacy (synchronisiert, erbt von `Vector`).' },
    { id: 'f6', front: 'Queue-Methoden von `ArrayDeque` – welche werfen, welche liefern `null`?', back: '`add`/`remove`/`element` werfen bei Fehler/leer. `offer`/`poll`/`peek` liefern `false`/`null`.' },
    { id: 'f7', front: 'Was passiert bei `List.of("a", null)`?', back: '`NullPointerException`. `List.of`, `Set.of`, `Map.of` erlauben keine `null`s. `Set.of("a", "a")` wirft `IllegalArgumentException`.' },
    { id: 'f8', front: 'Unterschied `List.copyOf(list)` und `Collections.unmodifiableList(list)`?', back: '`copyOf` = echte unveränderliche Kopie. `unmodifiableList` = read-only **View**: Änderungen an der Originalliste sind sichtbar.' },
    { id: 'f9', front: 'Wie entfernt man Elemente sicher während der Iteration?', back: '`list.removeIf(predicate)` oder explizit `Iterator` mit `it.remove()`. `list.remove(..)` in for-each → `ConcurrentModificationException`.' },
    { id: 'f10', front: 'Falle bei `List<Integer>.remove(1)`?', back: 'Ruft `remove(int index)` auf, nicht `remove(Object)`. Für den Wert: `list.remove(Integer.valueOf(1))`.' },
    { id: 'f11', front: 'Was liefert `Arrays.asList("a", "b")`?', back: 'Eine **fixed-size** Liste, die das Array wrappt: `set` geht, `add`/`remove` → `UnsupportedOperationException`.' },
    { id: 'f12', front: 'Schnittmenge zweier Sets ohne die Eingaben zu verändern?', back: '```java\nSet<String> common = new HashSet<>(a);\ncommon.retainAll(b);\n```\n`retainAll` mutiert – deshalb erst kopieren.' },
    { id: 'f13', front: 'Was ist bei `TreeSet` mit einem `Comparator` zu beachten?', back: 'Elemente mit `compare(a, b) == 0` gelten als **Duplikat** und werden nicht eingefügt – auch wenn `equals` false wäre.' },
    { id: 'f14', front: 'Warum sollte man mutable Objekte im `HashSet` nicht verändern?', back: 'Ändert sich der `hashCode`, liegt das Objekt im falschen Bucket: `contains` findet es nicht mehr, `remove` scheitert.' },
    { id: 'f15', front: 'Wofür `PriorityQueue`?', back: 'Heap: `poll()` liefert immer das kleinste (bzw. per Comparator priorisierte) Element. `offer`/`poll` O(log n), `peek` O(1). Iteration ist **nicht** sortiert.' },
    { id: 'f16', front: 'Warum sollte eine Methode statt `null` eine leere Collection zurückgeben?', back: 'Aufrufer können ohne Null-Check iterieren/streamen. `return List.of();` – keine NPE-Fallen.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was passiert?',
      code: `List<String> names = new ArrayList<>(List.of("Jan", "", "Anna"));
for (String name : names) {
    if (name.isEmpty()) {
        names.remove(name);
    }
}`,
      options: [
        'Die leere Zeichenkette wird entfernt, alles gut',
        '`ConcurrentModificationException` möglich – strukturelle Änderung während for-each',
        'Compile-Fehler',
        '`UnsupportedOperationException`',
      ],
      correct: 1,
      explanation: 'for-each nutzt einen fail-fast Iterator. Strukturelle Änderungen an der Liste außerhalb des Iterators führen zu `ConcurrentModificationException` (hier beim nächsten `next()`). Fix: `names.removeIf(String::isEmpty)`.',
    },
    {
      id: 'q2',
      prompt: 'Welchen Inhalt hat `nums` danach?',
      code: `List<Integer> nums = new ArrayList<>(List.of(5, 1, 7));
nums.remove(1);`,
      options: ['`[5, 7]`', '`[1, 7]`', '`[5, 1, 7]`', '`[5, 1]`'],
      correct: 0,
      explanation: '`remove(1)` mit `int` wählt `remove(int index)` und entfernt das Element an Index 1 (den Wert `1`, zufällig). Für einen Wert explizit `remove(Integer.valueOf(7))`.',
    },
    {
      id: 'q3',
      prompt: 'Was passiert beim `add`?',
      code: `List<String> list = Arrays.asList("a", "b");
list.add("c");`,
      options: ['`[a, b, c]`', 'Compile-Fehler', '`NullPointerException`', '`UnsupportedOperationException`'],
      correct: 3,
      explanation: '`Arrays.asList` liefert eine fixed-size Liste über dem Array. `set` funktioniert, `add`/`remove` nicht.',
    },
    {
      id: 'q4',
      prompt: 'Was gibt der Code aus?',
      code: `List<String> source = new ArrayList<>(List.of("a"));
List<String> view = Collections.unmodifiableList(source);
List<String> copy = List.copyOf(source);
source.add("b");
System.out.println(view.size() + " " + copy.size());`,
      options: ['`1 1`', '`2 2`', '`2 1`', '`UnsupportedOperationException`'],
      correct: 2,
      explanation: '`unmodifiableList` ist eine View auf `source` und sieht die Änderung. `List.copyOf` ist eine unabhängige Kopie.',
    },
    {
      id: 'q5',
      prompt: 'Du prüfst in einer Schleife über 100.000 Orders, ob die Kunden-ID in einer Liste von 10.000 gesperrten IDs ist. Beste Verbesserung?',
      options: [
        '`LinkedList` statt `ArrayList` für die gesperrten IDs',
        'Die gesperrten IDs vorher sortieren',
        'Die gesperrten IDs in ein `HashSet` kopieren und `contains` darauf aufrufen',
        'Parallel Stream verwenden',
      ],
      correct: 2,
      explanation: '`List.contains` ist O(n) → insgesamt O(n·m). Mit `HashSet` ist jeder Lookup O(1) → O(n + m).',
    },
    {
      id: 'q6',
      prompt: 'Welche Ausgabe?',
      code: `Set<String> set = new TreeSet<>(List.of("banana", "Apple", "cherry"));
System.out.println(set);`,
      options: ['`[Apple, banana, cherry]`', '`[banana, Apple, cherry]`', '`[apple, banana, cherry]`', 'Reihenfolge undefiniert'],
      correct: 0,
      explanation: '`TreeSet` sortiert nach natürlicher Ordnung. Bei Strings ist das lexikografisch nach Unicode – Großbuchstaben kommen vor Kleinbuchstaben.',
    },
    {
      id: 'q7',
      prompt: 'Welche Deklaration ist Clean Code für ein Feld mit Rollen eines Users?',
      options: [
        '`public HashSet<Role> roles = new HashSet<>();`',
        '`private final Set<Role> roles = new HashSet<>();`',
        '`private ArrayList<Role> roles;`',
        '`private final Vector<Role> roles = new Vector<>();`',
      ],
      correct: 1,
      explanation: 'Interface-Typ (`Set`), `private final`, Set weil Rollen eindeutig sind. `Vector` ist Legacy, `public` bricht Kapselung.',
    },
    {
      id: 'q8',
      prompt: 'Was gibt `stack.pop()` zurück?',
      code: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.push(3);
stack.pop();
System.out.println(stack.pop());`,
      options: ['`1`', '`3`', '`2`', '`NoSuchElementException`'],
      correct: 2,
      explanation: 'LIFO: `3` wird zuerst entfernt, dann `2`.',
    },
    {
      id: 'q9',
      prompt: 'Wo ist der Bug?',
      code: `public List<String> getTags() {
    return tags;   // private final List<String> tags = new ArrayList<>();
}`,
      options: [
        'Kein Bug',
        'Aufrufer können die interne Liste verändern – Kapselung gebrochen',
        'Compile-Fehler: `final` Listen können nicht zurückgegeben werden',
        '`tags` kann `null` sein',
      ],
      correct: 1,
      explanation: '`final` schützt nur die Referenz. Besser `return List.copyOf(tags);` oder `Collections.unmodifiableList(tags)`.',
    },
    {
      id: 'q10',
      prompt: 'Was passiert?',
      code: `List<String> names = Stream.of("a", "b").toList();
names.add("c");`,
      options: ['`[a, b, c]`', '`UnsupportedOperationException`', 'Compile-Fehler', '`IllegalStateException`'],
      correct: 1,
      explanation: '`Stream.toList()` (Java 16) liefert eine unveränderliche Liste. Für eine veränderbare: `collect(Collectors.toCollection(ArrayList::new))`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Duplikate entfernen – mit und ohne Sortierung',
      level: 1,
      description: `Implementiere ohne Streams:

- \`uniqueInOrder(List<String> items)\`: entfernt Duplikate, erstes Vorkommen bestimmt die Reihenfolge
- \`uniqueSorted(List<String> items)\`: entfernt Duplikate und sortiert natürlich

Die Eingabeliste darf nicht verändert werden.`,
      starter: `class Solution {

    static List<String> uniqueInOrder(List<String> items) {
        // TODO
        return items;
    }

    static List<String> uniqueSorted(List<String> items) {
        // TODO
        return items;
    }
}`,
      solution: `class Solution {

    static List<String> uniqueInOrder(List<String> items) {
        return new ArrayList<>(new LinkedHashSet<>(items));
    }

    static List<String> uniqueSorted(List<String> items) {
        return new ArrayList<>(new TreeSet<>(items));
    }
}`,
      hints: [
        'Ein Set entfernt Duplikate. Welche Set-Implementierung behält die Einfügereihenfolge, welche sortiert?',
        '`LinkedHashSet` und `TreeSet` haben Copy-Konstruktoren, die eine Collection annehmen.',
        'Set aus Liste bauen → wieder in eine `ArrayList` kopieren.',
        '`return new ArrayList<>(new LinkedHashSet<>(items));`',
      ],
      tests: `check("in Reihenfolge", List.of("c", "a", "b"), Solution.uniqueInOrder(List.of("c", "a", "c", "b", "a")));
check("sortiert", List.of("a", "b", "c"), Solution.uniqueSorted(List.of("c", "a", "c", "b", "a")));
check("leer", List.of(), Solution.uniqueInOrder(List.of()));
check("leer sortiert", List.of(), Solution.uniqueSorted(List.of()));
check("ohne Duplikate", List.of("x", "y"), Solution.uniqueInOrder(List.of("x", "y")));
var input = new ArrayList<>(List.of("b", "b", "a"));
Solution.uniqueSorted(input);
check("Eingabe unverändert", List.of("b", "b", "a"), input);`,
    },
    {
      id: 'k2',
      title: 'Set-Operationen ohne Seiteneffekte',
      level: 2,
      description: `Implementiere für zwei Tag-Mengen:

- \`common(a, b)\`: Schnittmenge
- \`onlyInFirst(a, b)\`: Elemente aus \`a\`, die nicht in \`b\` sind
- \`allSorted(a, b)\`: Vereinigung als **alphabetisch sortierte Liste**

Die Eingaben dürfen nicht verändert werden (sie können sogar unveränderlich sein, z. B. \`Set.of(..)\`).`,
      starter: `class Solution {

    static Set<String> common(Set<String> a, Set<String> b) {
        // TODO
        return Set.of();
    }

    static Set<String> onlyInFirst(Set<String> a, Set<String> b) {
        // TODO
        return Set.of();
    }

    static List<String> allSorted(Set<String> a, Set<String> b) {
        // TODO
        return List.of();
    }
}`,
      solution: `class Solution {

    static Set<String> common(Set<String> a, Set<String> b) {
        Set<String> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }

    static Set<String> onlyInFirst(Set<String> a, Set<String> b) {
        Set<String> result = new HashSet<>(a);
        result.removeAll(b);
        return result;
    }

    static List<String> allSorted(Set<String> a, Set<String> b) {
        Set<String> result = new TreeSet<>(a);
        result.addAll(b);
        return new ArrayList<>(result);
    }
}`,
      hints: [
        '`retainAll`, `removeAll`, `addAll` verändern das Set, auf dem sie aufgerufen werden – also zuerst eine Kopie anlegen.',
        '`new HashSet<>(a)` kopiert; `new TreeSet<>(a)` kopiert und sortiert.',
        'common: Kopie von a, retainAll(b). onlyInFirst: Kopie von a, removeAll(b). allSorted: TreeSet(a), addAll(b), in Liste.',
        '`Set<String> result = new HashSet<>(a); result.retainAll(b); return result;`',
      ],
      tests: `var a = Set.of("java", "spring", "sql");
var b = Set.of("sql", "java", "docker");
check("Schnittmenge", Set.of("java", "sql"), Solution.common(a, b));
check("nur in a", Set.of("spring"), Solution.onlyInFirst(a, b));
check("nur in b", Set.of("docker"), Solution.onlyInFirst(b, a));
check("Vereinigung sortiert", List.of("docker", "java", "spring", "sql"), Solution.allSorted(a, b));
check("leere Schnittmenge", Set.of(), Solution.common(Set.of("x"), Set.of("y")));
check("mit leerem Set", Set.of("x"), Solution.onlyInFirst(Set.of("x"), Set.of()));
check("beide leer", List.of(), Solution.allSorted(Set.of(), Set.of()));`,
    },
    {
      id: 'k3',
      title: 'Klammern prüfen mit ArrayDeque',
      level: 3,
      description: `Implementiere \`isBalanced(String s)\`: \`true\`, wenn alle Klammern \`()\`, \`[]\`, \`{}\` korrekt geöffnet und geschlossen werden. Andere Zeichen werden ignoriert. Verwende \`Deque<Character>\` mit \`ArrayDeque\` als Stack.

Beispiele: \`"{[()]}"\` → true, \`"([)]"\` → false, \`""\` → true, \`"(("\` → false.`,
      starter: `class Solution {

    static boolean isBalanced(String s) {
        // TODO
        return true;
    }
}`,
      solution: `class Solution {

    private static final Map<Character, Character> OPENING_FOR = Map.of(')', '(', ']', '[', '}', '{');

    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (OPENING_FOR.containsValue(c)) {
                stack.push(c);
            } else if (OPENING_FOR.containsKey(c)) {
                if (stack.isEmpty() || !stack.pop().equals(OPENING_FOR.get(c))) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }
}`,
      hints: [
        'Öffnende Klammer → merken (Stack). Schließende Klammer → muss zur zuletzt geöffneten passen.',
        '`Deque<Character> stack = new ArrayDeque<>();` mit `push`, `pop`, `isEmpty`. Eine `Map<Character, Character>` von schließend → öffnend spart if-Kaskaden.',
        'für jedes Zeichen: öffnend → push; schließend → wenn Stack leer oder pop() passt nicht → false. Am Ende: Stack muss leer sein.',
        '`if (stack.isEmpty() || !stack.pop().equals(OPENING_FOR.get(c))) return false;`',
      ],
      tests: `checkTrue("verschachtelt", Solution.isBalanced("{[()]}"));
checkTrue("hintereinander", Solution.isBalanced("()[]{}"));
checkTrue("mit Text", Solution.isBalanced("list.get(map[key])"));
checkTrue("leer", Solution.isBalanced(""));
checkTrue("überkreuzt", !Solution.isBalanced("([)]"));
checkTrue("nur offen", !Solution.isBalanced("(("));
checkTrue("schließt zuerst", !Solution.isBalanced(")("));
checkTrue("zu viele schließend", !Solution.isBalanced("())"));`,
    },
    {
      id: 'k4',
      title: 'Recently Viewed mit Kapazität',
      level: 4,
      description: `Implementiere die Klasse \`RecentlyViewed\`:

- Konstruktor \`RecentlyViewed(int capacity)\` – bei \`capacity < 1\` \`IllegalArgumentException\`
- \`view(String productId)\`: markiert ein Produkt als zuletzt angesehen. Schon vorhandene IDs wandern nach vorne (keine Duplikate). Ist die Kapazität überschritten, fällt das älteste heraus.
- \`items()\`: liefert die IDs, **neueste zuerst**, als unveränderliche Liste (Aufrufer dürfen den internen Zustand nicht ändern).`,
      starter: `class RecentlyViewed {

    RecentlyViewed(int capacity) {
        // TODO
    }

    void view(String productId) {
        // TODO
    }

    List<String> items() {
        // TODO
        return new ArrayList<>();
    }
}`,
      solution: `class RecentlyViewed {

    private final int capacity;
    private final Deque<String> recent = new ArrayDeque<>();

    RecentlyViewed(int capacity) {
        if (capacity < 1) {
            throw new IllegalArgumentException("capacity must be >= 1");
        }
        this.capacity = capacity;
    }

    void view(String productId) {
        recent.remove(productId);
        recent.addFirst(productId);
        if (recent.size() > capacity) {
            recent.removeLast();
        }
    }

    List<String> items() {
        return List.copyOf(recent);
    }
}`,
      hints: [
        'Du brauchst eine Struktur, an deren beiden Enden du effizient einfügen/entfernen kannst.',
        '`ArrayDeque`: `addFirst`, `removeLast`, `remove(Object)`. Rückgabe mit `List.copyOf(..)`.',
        'view: vorhandene ID entfernen → vorne einfügen → wenn size > capacity: hinten entfernen.',
        '`recent.remove(productId); recent.addFirst(productId); if (recent.size() > capacity) recent.removeLast();`',
      ],
      tests: `var r = new RecentlyViewed(3);
check("leer", List.of(), r.items());
r.view("A"); r.view("B"); r.view("C");
check("neueste zuerst", List.of("C", "B", "A"), r.items());
r.view("D");
check("ältestes fällt raus", List.of("D", "C", "B"), r.items());
r.view("C");
check("Duplikat wandert nach vorne", List.of("C", "D", "B"), r.items());
check("keine Duplikate", 3, r.items().size());
checkThrows("items unveränderlich", UnsupportedOperationException.class, () -> r.items().add("X"));
var one = new RecentlyViewed(1);
one.view("A"); one.view("B");
check("Kapazität 1", List.of("B"), one.items());
checkThrows("Kapazität 0", IllegalArgumentException.class, () -> new RecentlyViewed(0));`,
    },
  ],
}

export default chapter
