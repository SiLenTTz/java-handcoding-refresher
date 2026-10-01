# Kapitel 02 – Collections

## Mental Model

```text
Collection<E>
 ├─ List<E>   geordnet, Index, Duplikate erlaubt
 ├─ Set<E>    keine Duplikate (equals/hashCode bzw. compareTo)
 └─ Queue<E> / Deque<E>   FIFO / LIFO, Zugriff an den Enden

Map<K, V>     KEIN Collection-Subtyp – Key → Value (Kapitel 03)
```

Deklariere gegen das **Interface**, instanziiere die **Implementierung**:

```java
List<String> names = new ArrayList<>();
Set<Role> roles = new HashSet<>();
Deque<Task> stack = new ArrayDeque<>();
```

## Syntax / API

### List

```java
List<String> names = new ArrayList<>();
names.add("Jan");
names.add(0, "Anna");          // an Index einfügen – O(n)
names.get(1);                  // O(1)
names.set(1, "Jana");
names.remove("Anna");          // remove(Object)
names.contains("Jan");         // O(n)
names.indexOf("Jan");
names.size();
names.isEmpty();
names.removeIf(n -> n.isBlank());
names.sort(Comparator.naturalOrder());
```

### Set

```java
Set<String> tags = new HashSet<>(List.of("java", "spring"));
tags.add("java");              // false – schon enthalten
tags.contains("spring");       // O(1) im Mittel

Set<String> ordered = new LinkedHashSet<>();   // Einfügereihenfolge
Set<String> sorted = new TreeSet<>();          // natürliche Ordnung, O(log n)
```

Set-Operationen (mutieren das Ziel – daher erst kopieren):

```java
Set<String> common = new HashSet<>(a);
common.retainAll(b);           // Schnittmenge
Set<String> union = new HashSet<>(a);
union.addAll(b);               // Vereinigung
Set<String> diff = new HashSet<>(a);
diff.removeAll(b);             // Differenz
```

### Deque (Queue und Stack)

```java
Deque<String> queue = new ArrayDeque<>();
queue.offer("a");              // hinten anfügen
queue.poll();                  // vorne entnehmen, null wenn leer

Deque<Character> stack = new ArrayDeque<>();
stack.push('(');               // oben drauf
stack.peek();                  // ansehen
stack.pop();                   // entnehmen, NoSuchElementException wenn leer
```

`Stack` und `Vector` sind Legacy (synchronisiert) – `ArrayDeque` verwenden.

### Immutable Collections

```java
List<String> fixed = List.of("a", "b");        // unveränderlich, keine nulls
Set<String> set = Set.of("x", "y");            // Duplikate → IllegalArgumentException
List<String> copy = List.copyOf(mutable);      // unveränderliche Kopie
List<String> view = Collections.unmodifiableList(mutable); // nur View!
List<String> fromStream = stream.toList();     // unveränderlich (Java 16)
```

### Iteration

```java
for (String name : names) { ... }                        // for-each
names.forEach(System.out::println);

Iterator<String> it = names.iterator();                  // Entfernen beim Iterieren
while (it.hasNext()) {
    if (it.next().isBlank()) it.remove();
}
```

## Wann welche Struktur?

| Struktur | Use Case | get/contains | add | Ordnung |
|---|---|---|---|---|
| `ArrayList` | Standardliste | `get` O(1), `contains` O(n) | amortisiert O(1) am Ende | Einfügung |
| `LinkedList` | selten sinnvoll | O(n) | O(1) an Enden | Einfügung |
| `HashSet` | eindeutige Werte, schneller Lookup | O(1) | O(1) | keine |
| `LinkedHashSet` | eindeutig + Reihenfolge | O(1) | O(1) | Einfügung |
| `TreeSet` | eindeutig + sortiert, `first`/`ceiling` | O(log n) | O(log n) | sortiert |
| `ArrayDeque` | Queue / Stack | O(1) an Enden | O(1) | Einfügung |
| `PriorityQueue` | immer kleinstes zuerst | `peek` O(1) | O(log n) | Heap |

## Typische Use Cases

- Duplikate entfernen, Reihenfolge behalten: `new ArrayList<>(new LinkedHashSet<>(list))`
- "Habe ich das schon gesehen?": `Set.add` liefert `false` bei Duplikat
- Klammerprüfung, Undo, DFS: `ArrayDeque` als Stack
- BFS, Job-Queue: `ArrayDeque` als Queue
- Top-N / Scheduling: `PriorityQueue`
- Rückgabe aus Methoden: unveränderliche Liste (`List.copyOf`, `toList()`)

## Clean-Code-Empfehlungen

- Interface als Typ (`List`, nicht `ArrayList`) in Feldern, Parametern, Returns.
- Leere Collection statt `null` zurückgeben: `return List.of();`
- Interne Listen nicht direkt herausgeben – defensive Kopie oder unmodifiable.
- `isEmpty()` statt `size() == 0`.
- `removeIf` statt manueller Iterator-Schleife.
- Plural-Namen: `users`, `activeOrders`; Set-Namen nach Zweck: `seenIds`.

## Häufige Fehler

```java
// FALSCH: ConcurrentModificationException
for (String n : names) {
    if (n.isBlank()) names.remove(n);
}
// RICHTIG
names.removeIf(String::isBlank);

// FALSCH: Arrays.asList ist fix groß
List<String> l = Arrays.asList("a", "b");
l.add("c");                 // UnsupportedOperationException
// RICHTIG
List<String> l = new ArrayList<>(List.of("a", "b"));

// FALSCH: List.of mit null
List.of("a", null);         // NullPointerException

// FALSCH: remove(int) vs remove(Object)
List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));
nums.remove(1);             // entfernt Index 1 (20)!
// RICHTIG, wenn der Wert gemeint ist
nums.remove(Integer.valueOf(10));

// FALSCH: contains in Schleife auf List → O(n²)
for (User u : users) if (blockedList.contains(u.id())) ...
// RICHTIG
Set<Long> blocked = new HashSet<>(blockedList);   // O(1) Lookups

// FALSCH: mutable Objekt im HashSet verändern
set.add(user);
user.setEmail("neu");       // hashCode ändert sich → user "verschwindet"
```

## Interview-relevante Details

- `ArrayList` wächst um ~50 % (Kopie des Arrays) → `add` amortisiert O(1).
- `HashSet` ist intern eine `HashMap` mit Dummy-Values.
- `HashSet`/`HashMap` brauchen korrektes `equals` + `hashCode`; `TreeSet` braucht `Comparable` oder `Comparator` – und gilt Elemente mit `compareTo == 0` als Duplikat.
- `Collections.unmodifiableList(list)` ist eine **View**: Änderungen an `list` sind sichtbar. `List.copyOf` ist eine echte Kopie.
- `Iterator.remove()` ist der einzige sichere Weg, während for-each-artiger Iteration zu löschen (fail-fast Iteratoren).
- `LinkedList` ist in der Praxis fast immer langsamer als `ArrayList` (Cache-Lokalität).
- `Collection.toArray(String[]::new)` für typisierte Arrays.

## Zusammenfassung

- `List` = Reihenfolge + Index, `Set` = Eindeutigkeit, `Deque` = Enden.
- Standardwahl: `ArrayList`, `HashSet`, `ArrayDeque`; Ordnung: `LinkedHashSet`; Sortierung: `TreeSet`.
- Immutable: `List.of`, `List.copyOf`, `toList()` – keine `null`s.
- Nie während for-each die Collection verändern → `removeIf` / `Iterator.remove`.
- Komplexität kennen: `ArrayList.contains` O(n), `HashSet.contains` O(1), `TreeSet` O(log n).
