# Kapitel 02 – Collections

## Mental Model

```text
IEnumerable<T>      nur durchlaufen              foreach, LINQ
   ↑
ICollection<T>      + Count, Add, Remove, Contains
   ↑
IList<T>            + Index [i], Insert, IndexOf
   ↑
List<T>             konkrete Implementierung (Array im Hintergrund)

Dictionary<K,V>     Key → Value,  O(1),   ungeordnet
HashSet<T>          Menge ohne Duplikate, O(1), ungeordnet
Queue<T>            FIFO: Enqueue / Dequeue
Stack<T>            LIFO: Push / Pop
```

- Als **Parametertyp** das schwächste ausreichende Interface (`IEnumerable<T>`), als **Rückgabetyp** das, was du garantieren willst (`IReadOnlyList<T>`).
- `Dictionary` und `HashSet` brauchen stabile `GetHashCode`/`Equals` – also unveränderliche Keys.
- Reihenfolge ist bei `Dictionary`/`HashSet` ein **Implementierungsdetail**, kein Versprechen.

## Syntax / API

### List<T>

```csharp
var names = new List<string> { "Jan", "Anna" };      // Collection Initializer
List<string> leer = [];                               // Collection Expression (C# 12)
List<int> merged = [..a, ..b, 99];                    // Spread

names.Add("Ben");
names.AddRange(["Cleo", "Dan"]);
names.Insert(0, "Zoe");
names.Remove("Jan");          // erstes Vorkommen, bool
names.RemoveAll(n => n.StartsWith('A'));   // Anzahl entfernter
names.RemoveAt(0);
var exists = names.Contains("Ben");
var idx = names.IndexOf("Ben");            // -1, wenn nicht da
names.Clear();
```

`new List<string>(capacity)` spart Reallokationen, wenn die Größe bekannt ist.

### Dictionary<TKey, TValue>

```csharp
var ages = new Dictionary<string, int> { ["Jan"] = 38, ["Anna"] = 25 };

ages["Ben"] = 40;                  // add or update
ages.Add("Cleo", 30);              // wirft bei doppeltem Key!
var ok = ages.TryAdd("Cleo", 31);  // false statt Exception

if (ages.TryGetValue("Jan", out var age)) { /* age ist hier gesetzt */ }
var safe = ages.GetValueOrDefault("Unbekannt", -1);

ages.ContainsKey("Jan");
ages.Remove("Jan");
foreach (var (name, value) in ages) { }            // KeyValuePair deconstructen

var caseInsensitive = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
```

**`TryGetValue` ist das Standardmuster** – ein Lookup statt `ContainsKey` + Indexer (zwei Lookups).

### HashSet<T>

```csharp
var tags = new HashSet<string> { "a", "b" };
var added = tags.Add("a");          // false: war schon drin
tags.UnionWith(other);              // Vereinigung
tags.IntersectWith(other);          // Schnittmenge
tags.ExceptWith(other);             // Differenz
tags.Overlaps(other);
tags.IsSubsetOf(other);
```

`Contains` ist O(1) – bei `List<T>` ist es O(n). Für wiederholte Lookups immer ein `HashSet`.

### Queue<T> und Stack<T>

```csharp
var queue = new Queue<string>();
queue.Enqueue("a");
var next = queue.Dequeue();              // wirft bei leer
queue.TryDequeue(out var item);          // false statt Exception
queue.Peek();

var stack = new Stack<char>();
stack.Push('(');
var top = stack.Pop();
stack.TryPop(out var c);
```

### Sortieren

```csharp
names.Sort();                                            // in-place, natürliche Ordnung
names.Sort(StringComparer.OrdinalIgnoreCase);            // mit IComparer<T>
names.Sort((a, b) => a.Length.CompareTo(b.Length));      // Comparison<T>

employees.Sort((a, b) =>
{
    var byDept = string.CompareOrdinal(a.Department, b.Department);
    return byDept != 0 ? byDept : b.Salary.CompareTo(a.Salary);   // Gehalt absteigend
});

var sorted = names.OrderBy(n => n).ToList();             // LINQ: neue Liste, Original bleibt
```

`List.Sort` verändert die Liste, `OrderBy` gibt eine neue Sequenz zurück.

### Array vs List

```csharp
int[] fixedSize = new int[3];        // Länge unveränderlich, Length
int[] literal = [1, 2, 3];
var dynamic = new List<int>();       // wächst, Count
var asArray = dynamic.ToArray();
var asList = fixedSize.ToList();
```

Arrays nur für feste Größen und Interop – im Alltag `List<T>`.

### Unveränderliche / schreibgeschützte Varianten

```csharp
IReadOnlyList<string> view = names;                  // Sicht, Original bleibt änderbar
var frozen = names.AsReadOnly();                     // ReadOnlyCollection-Wrapper
ImmutableArray<string> immutable = [..names];        // echte Kopie, unveränderlich
```

## Typische Use Cases

- Lookup nach ID: `Dictionary<long, Customer>` statt `list.First(c => c.Id == id)` in einer Schleife.
- Duplikate entfernen mit Reihenfolge: `HashSet` als „gesehen"-Merker beim Durchlaufen.
- Gruppieren/Zählen: `Dictionary<string, int>` mit `TryGetValue` hochzählen (oder LINQ `GroupBy`).
- Klammer-/Undo-Logik: `Stack<T>`. Aufgabenreihenfolge / Round-Robin: `Queue<T>`.
- Rückgabe aus Services: `IReadOnlyList<T>`, damit Aufrufer nicht in deinen State schreiben.

## Clean-Code-Empfehlungen

- Parameter so allgemein wie möglich (`IEnumerable<T>`), Rückgabe so konkret wie nötig (`IReadOnlyList<T>`).
- Nie `null` für „keine Elemente" zurückgeben – leere Collection zurückgeben.
- `IEnumerable<T>`-Parameter nur **einmal** durchlaufen oder vorher materialisieren (`ToList()`).
- Keine Collection während `foreach` verändern → `InvalidOperationException`. Stattdessen `RemoveAll` oder neue Liste bauen.
- Collection-Properties: `get`-only mit initialisierter Liste, kein `set`.
- Sprechende Namen im Plural (`customers`), keine Typen im Namen (`customerList`).

## Häufige Fehler

```csharp
// FALSCH: zwei Lookups
if (map.ContainsKey(key)) { var v = map[key]; }
// RICHTIG
if (map.TryGetValue(key, out var v)) { }

// FALSCH: Indexer auf fehlendem Key
var value = map["fehlt"];                 // KeyNotFoundException
// RICHTIG
var value = map.GetValueOrDefault("fehlt", 0);

// FALSCH: Add auf existierendem Key
map.Add(key, 1);                          // ArgumentException bei Duplikat
// RICHTIG
map[key] = 1;                             // oder map.TryAdd(key, 1)

// FALSCH: während der Iteration verändern
foreach (var n in names) if (n.Length < 3) names.Remove(n);   // InvalidOperationException
// RICHTIG
names.RemoveAll(n => n.Length < 3);

// FALSCH: Contains auf großer List<T> in einer Schleife (O(n*m))
foreach (var id in ids) if (bigList.Contains(id)) { }
// RICHTIG
var lookup = bigList.ToHashSet();
foreach (var id in ids) if (lookup.Contains(id)) { }

// FALSCH: veränderliches Objekt als Dictionary-Key
var key = new StringBuilder("a");
map[key] = 1; key.Append("b");            // Eintrag ist nicht mehr auffindbar
// RICHTIG: unveränderliche Keys (string, int, record mit Werten)

// FALSCH: null als "leer"
public List<string>? GetTags() => null;
// RICHTIG
public IReadOnlyList<string> GetTags() => [];

// FALSCH: OrderBy-Ergebnis ignorieren
names.OrderBy(n => n);                    // ändert names NICHT
// RICHTIG
names = names.OrderBy(n => n).ToList();   // oder names.Sort();
```

## Interview-relevante Details

- `Dictionary`/`HashSet`: O(1) im Schnitt, O(n) im Worst Case (Hash-Kollisionen). `List.Contains`: O(n).
- `List<T>` wächst durch Verdopplung des internen Arrays – `Add` ist amortisiert O(1), `Insert(0, x)` ist O(n).
- `Dictionary` garantiert **keine** Reihenfolge. Wer sie braucht: `SortedDictionary` (nach Key sortiert) oder eigene Liste.
- `GetHashCode` und `Equals` müssen konsistent sein: gleiche Objekte → gleicher Hash. `record` erledigt das automatisch.
- `AsReadOnly()` ist nur ein **Wrapper** – ändert sich das Original, ändert sich die Sicht. `ImmutableArray` ist eine echte Kopie.
- `Array.Length` vs `List.Count` vs `IEnumerable.Count()` – letzteres läuft ggf. über die ganze Sequenz.
- `ArrayList`/`Hashtable` sind Altlasten (untypisiert, Boxing) – nie in neuem Code.

## Zusammenfassung

- `List<T>` als Standard, `Dictionary<K,V>` für Lookups, `HashSet<T>` für Mengen, `Queue`/`Stack` für Reihenfolgen.
- `TryGetValue` statt `ContainsKey` + Indexer; `GetValueOrDefault` für Defaults.
- Interfaces nach außen: `IEnumerable<T>` rein, `IReadOnlyList<T>` raus, niemals `null`.
- `List.Sort` sortiert in-place, `OrderBy` liefert eine neue Sequenz.
- Nicht während `foreach` verändern; für Massenlöschung `RemoveAll`.
- Keys unveränderlich halten – sonst findest du deine Einträge nicht wieder.
