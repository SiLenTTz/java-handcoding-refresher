# Kapitel 03 – Map

## Mental Model

```text
KEY → VALUE        jeder Key höchstens einmal, Value beliebig oft

HashMap       Buckets nach hashCode → O(1) im Mittel, keine Ordnung
LinkedHashMap HashMap + verkettete Einfügereihenfolge (oder Zugriffsreihenfolge)
TreeMap       Rot-Schwarz-Baum → Keys sortiert, O(log n)
```

Map ist das Werkzeug für: **Lookup**, **Zählen**, **Gruppieren**, **Index**, **Cache**.

## Syntax / API

### Basis

```java
Map<Long, User> usersById = new HashMap<>();
usersById.put(user.id(), user);        // liefert alten Wert oder null
User u = usersById.get(1L);            // null, wenn Key fehlt
usersById.containsKey(1L);
usersById.remove(1L);
usersById.size();
usersById.isEmpty();

Map<String, Integer> fixed = Map.of("a", 1, "b", 2);      // immutable, max. 10 Paare
Map<String, Integer> copy = Map.copyOf(mutable);
```

### Defaults und bedingtes Schreiben

```java
int count = counts.getOrDefault("Java", 0);

usersById.putIfAbsent(user.id(), user);     // nur wenn Key fehlt (oder null-Value)
```

### computeIfAbsent – Gruppieren / Multimap

```java
Map<String, List<User>> usersByCountry = new HashMap<>();
for (User user : users) {
    usersByCountry
        .computeIfAbsent(user.country(), key -> new ArrayList<>())
        .add(user);
}
```

Liefert den **vorhandenen oder neu erzeugten** Value zurück – daher direkt `.add(..)`.

### merge – Zählen / Aufsummieren

```java
Map<String, Integer> counts = new HashMap<>();
for (String tech : technologies) {
    counts.merge(tech, 1, Integer::sum);
}

Map<String, BigDecimal> revenue = new HashMap<>();
revenue.merge(order.customer(), order.total(), BigDecimal::add);
```

`merge(key, value, fn)`: Key fehlt → `value`; sonst `fn(alt, value)`; liefert `fn` `null` → Eintrag wird entfernt.

### compute / computeIfPresent

```java
stock.computeIfPresent("apple", (k, qty) -> qty > 1 ? qty - 1 : null); // null entfernt den Key
stock.compute("pear", (k, qty) -> qty == null ? 1 : qty + 1);
```

### Iteration

```java
for (Map.Entry<Long, User> entry : usersById.entrySet()) {
    Long id = entry.getKey();
    User user = entry.getValue();
}

usersById.forEach((id, user) -> System.out.println(id + " " + user.name()));

usersById.keySet();     // Set<K> (View)
usersById.values();     // Collection<V> (View)
usersById.entrySet().removeIf(e -> e.getValue().inactive());
```

### Sortierte Maps

```java
TreeMap<LocalDate, Order> byDate = new TreeMap<>();
byDate.firstKey();
byDate.lastEntry();
byDate.headMap(today);                  // alle Keys < today
byDate.floorKey(date);                  // größter Key <= date
```

### LRU-Cache mit LinkedHashMap

```java
class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    LruCache(int capacity) {
        super(16, 0.75f, true);         // accessOrder = true
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

### Stream → Map

```java
Map<Long, User> usersById = users.stream()
    .collect(Collectors.toMap(User::id, Function.identity()));
```

Mehr dazu in Kapitel 05 (`toMap` mit Merge-Funktion, `groupingBy`).

## Typische Use Cases

| Aufgabe | Werkzeug |
|---|---|
| Lookup nach ID | `Map<Long, User>` + `get` |
| Frequency Counter | `merge(k, 1, Integer::sum)` |
| Gruppieren | `computeIfAbsent(k, x -> new ArrayList<>()).add(v)` |
| Summen je Key | `merge(k, amount, BigDecimal::add)` |
| Sortierte Ausgabe | `TreeMap` |
| Reihenfolge wie Eingabe | `LinkedHashMap` |
| Cache | `LinkedHashMap` (LRU) oder `computeIfAbsent(k, this::load)` |

## Clean-Code-Empfehlungen

- Namen nach Schema `valuesByKey`: `usersById`, `ordersByCustomer`, `countByTech`.
- `merge`/`computeIfAbsent` statt `if (containsKey) ... else ...`.
- `entrySet()` statt `keySet()` + `get(key)`, wenn Key **und** Value gebraucht werden.
- Keys immutable wählen (String, Long, Records, Enums). Für Enum-Keys: `EnumMap`.
- Interne Maps nicht direkt herausgeben – `Map.copyOf(..)`.

## Häufige Fehler

```java
// FALSCH: Umständlich + doppelter Lookup
if (counts.containsKey(tech)) {
    counts.put(tech, counts.get(tech) + 1);
} else {
    counts.put(tech, 1);
}
// RICHTIG
counts.merge(tech, 1, Integer::sum);

// FALSCH: NPE durch Unboxing
int n = counts.get("Go");               // Key fehlt → null → NPE
// RICHTIG
int n = counts.getOrDefault("Go", 0);

// FALSCH: put überschreibt die Liste
map.put(country, new ArrayList<>());
map.get(country).add(user);             // jedes Mal neue Liste!
// RICHTIG
map.computeIfAbsent(country, k -> new ArrayList<>()).add(user);

// FALSCH: keySet + get
for (Long id : usersById.keySet()) {
    User u = usersById.get(id);
}
// RICHTIG
for (var entry : usersById.entrySet()) { ... }

// FALSCH: Map während Iteration verändern
for (String key : map.keySet()) {
    if (...) map.remove(key);           // ConcurrentModificationException
}
// RICHTIG
map.keySet().removeIf(key -> ...);

// FALSCH: Map.of mit doppeltem Key
Map.of("a", 1, "a", 2);                 // IllegalArgumentException
```

## Interview-relevante Details

- **HashMap intern**: Array von Buckets; Index aus `hashCode()` (gespreizt), Kollisionen als Liste, ab 8 Einträgen pro Bucket als Baum (Java 8+). Resize bei Load Factor 0.75 → Rehashing.
- Komplexität: `HashMap` get/put O(1) im Mittel (Worst Case O(log n) dank Treeification), `TreeMap` O(log n).
- `HashMap` erlaubt **einen** `null`-Key und `null`-Values; `TreeMap` keinen `null`-Key; `Map.of` gar keine `null`s.
- Mutable Keys, deren `hashCode` sich ändert, sind "verloren".
- `get` liefert `null` für "fehlt" **und** für "Value ist null" – `containsKey` unterscheidet.
- `computeIfAbsent` mit Lambda, das `null` liefert → kein Eintrag.
- `ConcurrentHashMap` für parallelen Zugriff; `merge`/`compute` sind dort atomar.
- `HashMap` Iterationsreihenfolge ist **undefiniert** – nie in Tests darauf verlassen.

## Zusammenfassung

- `HashMap` Standard, `LinkedHashMap` für Reihenfolge/LRU, `TreeMap` für Sortierung, `EnumMap` für Enum-Keys.
- Zählen: `merge`. Gruppieren: `computeIfAbsent`. Default: `getOrDefault`.
- Iteration über `entrySet()`, Löschen per `removeIf` auf den Views.
- `get` kann `null` liefern → Unboxing-NPE vermeiden.
- Keys brauchen stabiles `equals`/`hashCode`.
