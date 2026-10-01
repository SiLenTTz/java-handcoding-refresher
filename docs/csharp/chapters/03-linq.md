# Kapitel 03 – LINQ

## Mental Model

```text
QUELLE                 list, array, dictionary.Values, EF DbSet
  ↓
DEFERRED (lazy)        Where, Select, OrderBy, ThenBy, SelectMany,
                       GroupBy, Distinct, Skip, Take
  ↓
SOFORTIG (materialisiert / Einzelwert)
                       ToList, ToArray, ToDictionary, ToHashSet,
                       First, Single, Any, All, Count, Sum, Aggregate, foreach
```

- Eine LINQ-Kette ist eine **Beschreibung**, keine Ausführung. Erst die Materialisierung startet sie.
- Jede Materialisierung führt die Kette **erneut** aus – darum einmal `ToList()`, dann weiterarbeiten.
- `IEnumerable<T>` läuft im Speicher, `IQueryable<T>` (EF Core) wird zu SQL übersetzt. Gleiche Syntax, anderes Verhalten.

## Syntax / API

### Where / Select / OrderBy / ThenBy

```csharp
var names = users
    .Where(u => u.IsActive)                 // Func<User, bool>
    .OrderBy(u => u.LastName)               // aufsteigend
    .ThenByDescending(u => u.Salary)        // zweites Kriterium
    .Select(u => u.Name)                    // Projektion User → string
    .ToList();

var withIndex = names.Select((name, i) => $"{i + 1}. {name}").ToList();
var dtos = users.Select(u => new UserDto(u.Id, u.Name)).ToList();
```

`OrderBy(...).ThenBy(...)` statt zweimal `OrderBy` – das zweite `OrderBy` würde das erste verwerfen.

### First / FirstOrDefault / Single / SingleOrDefault

```csharp
var first = users.First(u => u.IsAdmin);            // wirft InvalidOperationException, wenn keiner
var maybe = users.FirstOrDefault(u => u.IsAdmin);   // null bei Referenztypen
var one   = users.Single(u => u.Id == id);          // wirft, wenn 0 ODER >1 Treffer
var opt   = users.SingleOrDefault(u => u.Id == id); // wirft nur bei >1
var fb    = numbers.FirstOrDefault(n => n > 100, -1);  // eigener Default
```

| Methode | 0 Treffer | 1 Treffer | >1 Treffer |
|---|---|---|---|
| `First` | Exception | Wert | erster |
| `FirstOrDefault` | `default` | Wert | erster |
| `Single` | Exception | Wert | Exception |
| `SingleOrDefault` | `default` | Wert | Exception |

`Single` ist eine **Zusicherung**: „hier kann es nur einen geben". Das ist ein Feature, kein Nachteil.

### Any / All / Count

```csharp
var hasAdmin = users.Any(u => u.IsAdmin);       // short-circuit
var isEmpty  = !users.Any();
var allAdult = users.All(u => u.Age >= 18);     // true bei leerer Sequenz!
var admins   = users.Count(u => u.IsAdmin);
var many     = users.Skip(100).Any();           // statt Count() > 100
```

### GroupBy

```csharp
var byDept = employees
    .GroupBy(e => e.Department)                 // IEnumerable<IGrouping<string, Employee>>
    .Select(g => new { Dept = g.Key, Count = g.Count(), Total = g.Sum(e => e.Salary) })
    .OrderBy(x => x.Dept)
    .ToList();

Dictionary<string, List<string>> namesByDept = employees
    .GroupBy(e => e.Department)
    .ToDictionary(g => g.Key, g => g.Select(e => e.Name).OrderBy(n => n).ToList());
```

`IGrouping<TKey, TElement>` ist selbst ein `IEnumerable<TElement>` mit einem `Key`.

### ToDictionary / ToList / ToHashSet / ToLookup

```csharp
var byId = customers.ToDictionary(c => c.Id);              // Wert = das Objekt
var nameById = customers.ToDictionary(c => c.Id, c => c.Name);
var tags = items.SelectMany(i => i.Tags).ToHashSet();
var lookup = orders.ToLookup(o => o.CustomerId);           // wie GroupBy, aber sofort + mehrfach nutzbar
```

`ToDictionary` wirft bei doppelten Keys – bei unsicheren Keys `GroupBy` + `ToDictionary` oder `ToLookup`.

### Aggregate und Zahlen

```csharp
var sum   = orders.Sum(o => o.Amount);            // decimal
var avg   = orders.Average(o => o.Amount);        // wirft bei leerer Sequenz!
var max   = orders.Max(o => o.Amount);
var best  = orders.MaxBy(o => o.Amount);          // das Element, nicht der Wert (.NET 6+)
var csv   = names.Aggregate((a, b) => a + ", " + b);        // wirft bei leer
var csv2  = string.Join(", ", names);                       // besser
var total = lines.Aggregate(0m, (acc, l) => acc + l.Quantity * l.UnitPrice);   // mit Seed
```

Bei möglicherweise leerer Quelle: `DefaultIfEmpty(0m).Average()` oder vorher `Any()` prüfen.

### SelectMany

```csharp
var allTags = posts.SelectMany(p => p.Tags).Distinct().ToList();     // flach machen
var pairs = orders.SelectMany(o => o.Lines, (o, l) => new { o.Id, l.Product }).ToList();
```

`Select` liefert `IEnumerable<List<T>>`, `SelectMany` liefert `IEnumerable<T>`.

### Method- vs Query-Syntax

```csharp
var a = users.Where(u => u.IsActive).OrderBy(u => u.Name).Select(u => u.Name);

var b = from u in users
        where u.IsActive
        orderby u.Name
        select u.Name;
```

Beides ist identisch. Query-Syntax lohnt sich bei `join` und mehreren `from`; sonst Method-Syntax.

## Typische Use Cases

- Entity → DTO: `entities.Select(Mapper.ToDto).ToList()`
- Reporting: `GroupBy` + `Sum`/`Count` + `OrderByDescending`
- Nachschlagetabelle bauen: `ToDictionary(x => x.Id)` statt verschachtelter Schleifen
- Bestellpositionen flach ziehen: `SelectMany(o => o.Lines)`
- Existenz prüfen: `Any(...)` statt `Count(...) > 0`
- Paging: `.Skip(page * size).Take(size)` – immer mit vorherigem `OrderBy`

## Clean-Code-Empfehlungen

- Eine Operation pro Zeile, Punkte untereinander.
- Komplexe Prädikate in benannte Methoden ziehen: `.Where(IsEligible)`.
- Am Ende der Kette materialisieren (`ToList()`), bevor du das Ergebnis mehrfach nutzt.
- Keine Seiteneffekte in `Select`/`Where` (kein Speichern, kein Loggen, keine externe Liste befüllen).
- `Select` **vor** `Where` nur, wenn der Filter das projizierte Feld braucht – sonst erst filtern.
- Bei EF Core: filtern und projizieren **vor** `ToList()`, sonst lädst du die halbe Tabelle.

## Häufige Fehler

```csharp
// FALSCH: Deferred Execution übersehen – der Klassiker
var factor = 2;
var query = numbers.Select(n => n * factor);
factor = 10;
var result = query.ToList();      // rechnet mit 10, nicht mit 2!
// RICHTIG
var result = numbers.Select(n => n * factor).ToList();   // sofort materialisieren

// FALSCH: Kette mehrfach ausführen
var expensive = ids.Select(Load);
var count = expensive.Count();
foreach (var x in expensive) { }   // Load() läuft ein zweites Mal
// RICHTIG
var loaded = ids.Select(Load).ToList();

// FALSCH: First ohne Fallback
var admin = users.First(u => u.IsAdmin);          // InvalidOperationException
// RICHTIG
var admin = users.FirstOrDefault(u => u.IsAdmin) ?? throw new NotFoundException(...);

// FALSCH: Count für Existenz
if (users.Count(u => u.IsAdmin) > 0) { }
// RICHTIG
if (users.Any(u => u.IsAdmin)) { }

// FALSCH: zweimal OrderBy
users.OrderBy(u => u.Dept).OrderBy(u => u.Name);   // sortiert nur noch nach Name
// RICHTIG
users.OrderBy(u => u.Dept).ThenBy(u => u.Name);

// FALSCH: Average auf möglicherweise leerer Sequenz
var avg = orders.Average(o => o.Amount);           // InvalidOperationException
// RICHTIG
var avg = orders.Any() ? orders.Average(o => o.Amount) : 0m;

// FALSCH: ToDictionary mit doppelten Keys
var map = orders.ToDictionary(o => o.CustomerId);  // ArgumentException
// RICHTIG
var map = orders.GroupBy(o => o.CustomerId).ToDictionary(g => g.Key, g => g.ToList());

// FALSCH: Select für verschachtelte Listen
var tags = posts.Select(p => p.Tags);              // IEnumerable<List<string>>
// RICHTIG
var tags = posts.SelectMany(p => p.Tags);          // IEnumerable<string>
```

## Interview-relevante Details

- **Deferred Execution**: `Where`/`Select`/`OrderBy` speichern nur die Anweisung. Erst `foreach`/`ToList` läuft.
- `OrderBy` ist trotzdem „lazy, aber stateful": beim Ausführen muss es alle Elemente puffern (O(n log n)), und es ist **stabil**.
- `Count()` auf `ICollection<T>` nutzt intern `Count` (O(1)); auf einer echten Sequenz läuft es komplett durch.
- `All` auf leerer Sequenz ist `true`, `Any` ist `false` (vacuous truth).
- `MaxBy`/`MinBy` liefern das Element, `Max`/`Min` den Wert.
- `ToLookup` führt sofort aus und ist mehrfach nutzbar; `GroupBy` ist deferred.
- Bei `IQueryable` wird der Lambda-Ausdruck als **Expression Tree** übersetzt – eigene C#-Methoden im `Where` sprengen das (Client-Evaluation).
- LINQ-Operatoren sind Extension Methods auf `IEnumerable<T>` aus `System.Linq`.

## Zusammenfassung

- Kette bauen → einmal materialisieren. Deferred Execution ist die häufigste Fehlerquelle.
- `Where` filtert, `Select` projiziert, `SelectMany` macht flach, `GroupBy` bündelt.
- `First` vs `Single` vs `…OrderDefault` bewusst wählen – sie kommunizieren deine Erwartung.
- `Any`/`All` statt `Count`-Vergleichen; `MaxBy` statt `OrderByDescending().First()`.
- `ToDictionary` nur bei garantiert eindeutigen Keys, sonst `GroupBy` oder `ToLookup`.
- `Average`/`Aggregate` ohne Seed werfen bei leerer Sequenz.
