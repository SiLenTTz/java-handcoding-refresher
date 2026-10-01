import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    { id: 'f1', front: 'Was bedeutet "Deferred Execution"?', back: '`Where`, `Select`, `OrderBy` & Co. bauen nur eine Beschreibung auf. Ausgeführt wird erst bei `foreach`, `ToList()`, `Count()`, `First()` … – und dann **jedes Mal neu**.' },
    { id: 'f2', front: 'Unterschied `Where` und `Select`?', back: '`Where(Func<T, bool>)` filtert (Typ bleibt `T`, Anzahl sinkt). `Select(Func<T, R>)` projiziert (Typ wird `R`, Anzahl bleibt gleich).' },
    { id: 'f3', front: '`First` vs. `FirstOrDefault` vs. `Single` vs. `SingleOrDefault`?', back: '`First`: wirft bei 0 Treffern. `FirstOrDefault`: `default`/`null` bei 0. `Single`: wirft bei 0 **und** bei >1. `SingleOrDefault`: wirft nur bei >1. `Single*` ist eine Zusicherung "es kann nur einen geben".' },
    { id: 'f4', front: 'Warum `Any()` statt `Count() > 0`?', back: '`Any` bricht beim ersten Treffer ab (short-circuit) und drückt die Absicht aus. `Count()` läuft über die gesamte Sequenz – bei EF Core sogar als eigene SQL-Abfrage.' },
    { id: 'f5', front: '`All` und `Any` auf einer **leeren** Sequenz?', back: '`All` → `true` (vacuous truth), `Any` → `false`. Das ist die häufigste Überraschung bei Validierungen.' },
    { id: 'f6', front: 'Wie sortiert man nach zwei Kriterien?', back: '```csharp\nemployees.OrderBy(e => e.Department)\n         .ThenByDescending(e => e.Salary)\n```\nZweimal `OrderBy` würde die erste Sortierung verwerfen.' },
    { id: 'f7', front: 'Was liefert `GroupBy` genau?', back: '`IEnumerable<IGrouping<TKey, TElement>>`. Ein `IGrouping` hat einen `Key` und ist selbst ein `IEnumerable<TElement>` – also direkt aggregierbar:\n```csharp\n.GroupBy(e => e.Dept)\n.Select(g => new { g.Key, Total = g.Sum(e => e.Salary) })\n```' },
    { id: 'f8', front: 'Wann wirft `ToDictionary` – und was ist die Alternative?', back: 'Bei **doppelten Schlüsseln** (`ArgumentException`). Alternative:\n```csharp\norders.GroupBy(o => o.CustomerId)\n      .ToDictionary(g => g.Key, g => g.ToList());\n```\noder `ToLookup(..)`.' },
    { id: 'f9', front: '`Select` vs. `SelectMany`?', back: '`posts.Select(p => p.Tags)` → `IEnumerable<List<string>>`. `posts.SelectMany(p => p.Tags)` → `IEnumerable<string>` – macht verschachtelte Sequenzen flach.' },
    { id: 'f10', front: '`Max` vs. `MaxBy`?', back: '`Max(o => o.Amount)` liefert den **Wert** (größter Betrag). `MaxBy(o => o.Amount)` liefert das **Element** (die Bestellung) – oder `null` bei leerer Sequenz. Besser als `OrderByDescending(..).First()`.' },
    { id: 'f11', front: 'Welche LINQ-Methoden werfen bei leerer Sequenz?', back: '`First`, `Last`, `Single`, `Min`, `Max` (bei Werttypen), `Average` und `Aggregate` **ohne Seed**. `Sum` liefert `0`, `Count` liefert `0`, `*OrDefault` liefern `default`.' },
    { id: 'f12', front: '`IEnumerable<T>` vs. `IQueryable<T>`?', back: '`IEnumerable`: Lambdas laufen als Code im Speicher. `IQueryable` (EF Core): Lambdas werden als **Expression Tree** in SQL übersetzt. Darum filtern und projizieren **vor** `ToList()`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was steht in `result`?',
      code: `var factor = 2;
var query = new[] { 1, 2, 3 }.Select(n => n * factor);
factor = 10;
var result = query.ToList();`,
      options: ['`[2, 4, 6]`', '`[10, 20, 30]`', '`[1, 2, 3]`', 'Compile-Fehler'],
      correct: 1,
      explanation: 'Deferred Execution: Das Lambda läuft erst bei `ToList()` – und liest `factor` dann mit dem aktuellen Wert `10`. Wer den Zustand festhalten will, materialisiert sofort.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `var users = new List<string>();
Console.WriteLine($"{users.Any()} {users.All(u => u.Length > 100)}");`,
      options: ['`False True`', '`False False`', '`True True`', '`InvalidOperationException`'],
      correct: 0,
      explanation: 'Auf der leeren Sequenz ist `Any()` immer `false` und `All(..)` immer `true` – für die leere Menge gilt jede Allaussage.',
    },
    {
      id: 'q3',
      prompt: 'Warum kompiliert das nicht?',
      code: `users.Select(u => u.Name)
     .Where(u => u.IsActive)
     .ToList();`,
      options: [
        '`Where` muss immer vor `Select` stehen',
        'Nach `Select(u => u.Name)` ist es ein `IEnumerable<string>` – `string` hat kein `IsActive`',
        '`ToList()` braucht einen Comparer',
        'Lambda-Parameter dürfen nicht zweimal `u` heißen',
      ],
      correct: 1,
      explanation: 'Jede Stufe ändert den Elementtyp. Erst filtern, dann projizieren – oder auf einer Eigenschaft des projizierten Typs filtern.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben, wenn zwei Bestellungen dieselbe `CustomerId` haben?',
      code: `var map = orders.ToDictionary(o => o.CustomerId);`,
      options: [
        'Der letzte Eintrag gewinnt',
        'Der erste Eintrag gewinnt',
        '`ArgumentException: An item with the same key has already been added`',
        'Das Dictionary enthält eine Liste pro Key',
      ],
      correct: 2,
      explanation: '`ToDictionary` nutzt intern `Add` und wirft bei Duplikaten. Bei unsicheren Schlüsseln `GroupBy(..).ToDictionary(g => g.Key, g => g.ToList())` oder `ToLookup`.',
    },
    {
      id: 'q5',
      prompt: 'Welche Reihenfolge ergibt sich?',
      code: `var people = new[] { ("IT", "Bo"), ("HR", "Al"), ("IT", "Ann") };
var result = people
    .OrderBy(p => p.Item1)
    .OrderBy(p => p.Item2)
    .Select(p => p.Item2)
    .ToList();`,
      options: ['`[Al, Ann, Bo]`', '`[Al, Bo, Ann]`', '`[Bo, Ann, Al]`', '`[Ann, Bo, Al]`'],
      correct: 0,
      explanation: 'Das zweite `OrderBy` sortiert komplett neu und verwirft die erste Sortierung – übrig bleibt die Sortierung nach Name. Gewollt wäre `OrderBy(..).ThenBy(..)`.',
    },
    {
      id: 'q6',
      prompt: 'Wo ist der Bug?',
      code: `var products = LoadProducts();          // kann leer sein
var average = products.Average(p => p.Price);`,
      options: [
        '`Average` gibt es nur auf `int`',
        '`Average` wirft bei leerer Sequenz eine `InvalidOperationException`',
        '`Average` liefert bei leerer Sequenz `null`',
        'Kein Bug, `Average` liefert `0`',
      ],
      correct: 1,
      explanation: 'Im Gegensatz zu `Sum` (liefert 0) wirft `Average` bei leerer Sequenz. Absichern mit `products.Any() ? products.Average(..) : 0m` oder `DefaultIfEmpty`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisch, um die teuerste Bestellung zu finden?',
      options: [
        '`orders.OrderByDescending(o => o.Amount).First()`',
        '`orders.MaxBy(o => o.Amount)`',
        '`orders.Where(o => o.Amount == orders.Max(x => x.Amount)).Single()`',
        '`orders.Max()`',
      ],
      correct: 1,
      explanation: '`MaxBy` ist O(n), liefert das Element und gibt bei leerer Sequenz `null` statt zu werfen. Variante 1 sortiert unnötig (O(n log n)), Variante 3 läuft die Sequenz mehrfach durch.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `var posts = new[]
{
    new { Tags = new[] { "a", "b" } },
    new { Tags = new[] { "b", "c" } },
};
var tags = posts.SelectMany(p => p.Tags).Distinct().ToList();
Console.WriteLine(tags.Count);`,
      options: ['`2`', '`3`', '`4`', '`1`'],
      correct: 1,
      explanation: '`SelectMany` macht flach: `a, b, b, c`. `Distinct()` entfernt das doppelte `b` → `a, b, c` = 3. Mit `Select` wäre es eine Sequenz aus zwei Arrays gewesen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Filtern, projizieren, sortieren',
      level: 1,
      description: `Implementiere:

\`\`\`csharp
public static List<string> ActiveNames(IEnumerable<User> users)
\`\`\`

Die Namen aller **aktiven** User, ohne Duplikate, ordinal aufsteigend sortiert. Eine LINQ-Kette, kein \`foreach\`.`,
      given: `public record User(long Id, string Name, int Age, bool IsActive, bool IsAdmin);`,
      starter: `public static class Solution
{
    public static List<string> ActiveNames(IEnumerable<User> users)
    {
        // TODO
        return new List<string>();
    }
}`,
      solution: `public static class Solution
{
    public static List<string> ActiveNames(IEnumerable<User> users) =>
        users.Where(user => user.IsActive)
             .Select(user => user.Name)
             .Distinct()
             .OrderBy(name => name, StringComparer.Ordinal)
             .ToList();
}`,
      hints: [
        'Reihenfolge ueberlegen: Der Filter braucht den ganzen User, also zuerst filtern und erst danach auf den Namen projizieren.',
        '`Where`, `Select`, `Distinct`, `OrderBy(.., StringComparer.Ordinal)`, `ToList`.',
        'users.Where(aktiv) → Select(Name) → Distinct → OrderBy → ToList',
        '`users.Where(user => user.IsActive).Select(user => user.Name).Distinct()...`',
      ],
      tests: `            var users = new List<User>
            {
                new(1, "Tom", 30, true, false),
                new(2, "Anna", 25, false, false),
                new(3, "Ben", 40, true, true),
                new(4, "Tom", 22, true, false),
            };
            Check("aktiv, eindeutig, sortiert", new List<string> { "Ben", "Tom" }, Solution.ActiveNames(users));
            Check("leere Eingabe", new List<string>(), Solution.ActiveNames(new List<User>()));
            Check("niemand aktiv", new List<string>(), Solution.ActiveNames(new List<User> { new(5, "X", 1, false, false) }));
            Check("einzelner User", new List<string> { "Zoe" }, Solution.ActiveNames(new List<User> { new(6, "Zoe", 1, true, false) }));`,
    },
    {
      id: 'k2',
      title: 'Gruppieren und auswerten',
      level: 2,
      description: `Implementiere drei Auswertungen über Mitarbeiter:

\`\`\`csharp
public static Dictionary<string, int> CountByDepartment(IEnumerable<Employee> employees)
public static Dictionary<string, decimal> TotalSalaryByDepartment(IEnumerable<Employee> employees)
public static Dictionary<string, List<string>> NamesByDepartment(IEnumerable<Employee> employees)
\`\`\`

- \`CountByDepartment\`: Abteilung → Anzahl Mitarbeiter
- \`TotalSalaryByDepartment\`: Abteilung → Gehaltssumme
- \`NamesByDepartment\`: Abteilung → Namen, ordinal aufsteigend sortiert

Jeweils \`GroupBy\` + \`ToDictionary\`. Leere Eingabe → leeres Dictionary.`,
      given: `public record Employee(string Name, string Department, decimal Salary);`,
      starter: `public static class Solution
{
    public static Dictionary<string, int> CountByDepartment(IEnumerable<Employee> employees)
    {
        // TODO
        return new Dictionary<string, int>();
    }

    public static Dictionary<string, decimal> TotalSalaryByDepartment(IEnumerable<Employee> employees)
    {
        // TODO
        return new Dictionary<string, decimal>();
    }

    public static Dictionary<string, List<string>> NamesByDepartment(IEnumerable<Employee> employees)
    {
        // TODO
        return new Dictionary<string, List<string>>();
    }
}`,
      solution: `public static class Solution
{
    public static Dictionary<string, int> CountByDepartment(IEnumerable<Employee> employees) =>
        employees.GroupBy(employee => employee.Department)
                 .ToDictionary(group => group.Key, group => group.Count());

    public static Dictionary<string, decimal> TotalSalaryByDepartment(IEnumerable<Employee> employees) =>
        employees.GroupBy(employee => employee.Department)
                 .ToDictionary(group => group.Key, group => group.Sum(employee => employee.Salary));

    public static Dictionary<string, List<string>> NamesByDepartment(IEnumerable<Employee> employees) =>
        employees.GroupBy(employee => employee.Department)
                 .ToDictionary(
                     group => group.Key,
                     group => group.Select(employee => employee.Name)
                                   .OrderBy(name => name, StringComparer.Ordinal)
                                   .ToList());
}`,
      hints: [
        'Ein `IGrouping<TKey, TElement>` ist selbst eine Sequenz – du kannst darauf direkt `Count()`, `Sum(..)` oder `Select(..)` aufrufen.',
        '`GroupBy(e => e.Department)` und `ToDictionary(g => g.Key, g => ...)`.',
        'GroupBy(Department) → ToDictionary(Key, Aggregat). Fuer die Namen innerhalb der Gruppe: Select(Name) → OrderBy → ToList.',
        '`.ToDictionary(group => group.Key, group => group.Sum(employee => employee.Salary));`',
      ],
      tests: `            var employees = new List<Employee>
            {
                new("Tom", "IT", 60000m),
                new("Anna", "HR", 50000m),
                new("Ben", "IT", 80000m),
                new("Cleo", "IT", 60000m),
                new("Dan", "HR", 70000m),
            };

            Check("Anzahl je Abteilung", new Dictionary<string, int> { ["IT"] = 3, ["HR"] = 2 }, Solution.CountByDepartment(employees));
            Check("Gehaltssumme", new Dictionary<string, decimal> { ["IT"] = 200000m, ["HR"] = 120000m }, Solution.TotalSalaryByDepartment(employees));
            Check("Namen sortiert", new Dictionary<string, List<string>>
            {
                ["IT"] = new List<string> { "Ben", "Cleo", "Tom" },
                ["HR"] = new List<string> { "Anna", "Dan" },
            }, Solution.NamesByDepartment(employees));

            Check("leer: Anzahl", new Dictionary<string, int>(), Solution.CountByDepartment(new List<Employee>()));
            Check("leer: Summe", new Dictionary<string, decimal>(), Solution.TotalSalaryByDepartment(new List<Employee>()));
            Check("eine Abteilung", new Dictionary<string, int> { ["IT"] = 1 }, Solution.CountByDepartment(new List<Employee> { new("Solo", "IT", 1m) }));`,
    },
    {
      id: 'k3',
      title: 'Suchen, prüfen, aggregieren',
      level: 3,
      description: `Implementiere einen kleinen Produktkatalog:

\`\`\`csharp
public static decimal TotalStockValue(IEnumerable<Product> products)
public static decimal AveragePrice(IEnumerable<Product> products)
public static Product GetById(IEnumerable<Product> products, long id)
public static bool AllInStock(IEnumerable<Product> products)
public static string? MostExpensiveName(IEnumerable<Product> products)
\`\`\`

- \`TotalStockValue\`: Summe aus \`Price * Stock\`
- \`AveragePrice\`: Durchschnittspreis, bei leerer Liste \`0m\` (**nicht** werfen)
- \`GetById\`: genau ein Treffer erwartet. Kein Treffer → \`KeyNotFoundException\`. Mehrere Treffer sollen ebenfalls auffallen – nutze \`SingleOrDefault\`.
- \`AllInStock\`: sind **alle** Produkte mit \`Stock > 0\` vorrätig?
- \`MostExpensiveName\`: Name des teuersten Produkts, \`null\` bei leerer Liste (\`MaxBy\`)`,
      given: `public record Product(long Id, string Name, decimal Price, int Stock);`,
      starter: `public static class Solution
{
    public static decimal TotalStockValue(IEnumerable<Product> products)
    {
        // TODO
        return 0m;
    }

    public static decimal AveragePrice(IEnumerable<Product> products)
    {
        // TODO
        return 0m;
    }

    public static Product GetById(IEnumerable<Product> products, long id)
    {
        // TODO
        return null!;
    }

    public static bool AllInStock(IEnumerable<Product> products)
    {
        // TODO
        return false;
    }

    public static string? MostExpensiveName(IEnumerable<Product> products)
    {
        // TODO
        return null;
    }
}`,
      solution: `public static class Solution
{
    public static decimal TotalStockValue(IEnumerable<Product> products) =>
        products.Sum(product => product.Price * product.Stock);

    public static decimal AveragePrice(IEnumerable<Product> products)
    {
        var all = products.ToList();
        return all.Count == 0 ? 0m : all.Average(product => product.Price);
    }

    public static Product GetById(IEnumerable<Product> products, long id) =>
        products.SingleOrDefault(product => product.Id == id)
        ?? throw new KeyNotFoundException($"kein Produkt mit Id {id}");

    public static bool AllInStock(IEnumerable<Product> products) =>
        products.All(product => product.Stock > 0);

    public static string? MostExpensiveName(IEnumerable<Product> products) =>
        products.MaxBy(product => product.Price)?.Name;
}`,
      hints: [
        'Ueberlege pro Methode: Was passiert bei leerer Sequenz? `Sum` liefert 0, `Average` wirft, `All` liefert true, `MaxBy` liefert null.',
        '`Sum(..)`, `Average(..)`, `SingleOrDefault(..)`, `All(..)`, `MaxBy(..)?.Name`, `?? throw new KeyNotFoundException(..)`.',
        'AveragePrice: einmal materialisieren (ToList), dann Count pruefen. GetById: SingleOrDefault, bei null werfen.',
        '`products.SingleOrDefault(p => p.Id == id) ?? throw new KeyNotFoundException($"kein Produkt mit Id {id}");`',
      ],
      tests: `            var products = new List<Product>
            {
                new(1, "Kaffee", 4.50m, 10),
                new(2, "Tasse", 9.00m, 0),
                new(3, "Tee", 3.00m, 5),
            };
            var empty = new List<Product>();

            Check("Lagerwert", 60.00m, Solution.TotalStockValue(products));
            Check("Lagerwert leer", 0m, Solution.TotalStockValue(empty));
            Check("Durchschnittspreis", 5.50m, Solution.AveragePrice(products));
            Check("Durchschnittspreis leer", 0m, Solution.AveragePrice(empty));
            Check("nach Id", products[1], Solution.GetById(products, 2));
            CheckThrows<KeyNotFoundException>("unbekannte Id", () => Solution.GetById(products, 99));
            CheckThrows<InvalidOperationException>("mehrdeutige Id", () => Solution.GetById(new List<Product> { products[0], products[0] }, 1));
            CheckTrue("nicht alles vorraetig", !Solution.AllInStock(products));
            CheckTrue("alles vorraetig", Solution.AllInStock(new List<Product> { products[0], products[2] }));
            CheckTrue("leere Liste gilt als vorraetig", Solution.AllInStock(empty));
            Check("teuerstes Produkt", "Tasse", Solution.MostExpensiveName(products));
            Check("teuerstes Produkt leer", null, Solution.MostExpensiveName(empty));`,
    },
    {
      id: 'k4',
      title: 'Bestellungen auswerten',
      level: 4,
      description: `Bestellungen bestehen aus Positionen. Implementiere:

\`\`\`csharp
public static decimal Total(Order order)
public static Dictionary<string, decimal> RevenueByCustomer(IEnumerable<Order> orders)
public static List<string> TopProducts(IEnumerable<Order> orders, int count)
\`\`\`

- \`Total\`: Summe aus \`Quantity * UnitPrice\` aller Positionen der Bestellung
- \`RevenueByCustomer\`: Kunde → Gesamtumsatz über alle seine Bestellungen
- \`TopProducts\`: die \`count\` meistverkauften Produkte (nach **Gesamtmenge** absteigend), bei Gleichstand ordinal alphabetisch. Nutze \`SelectMany\` + \`GroupBy\`.`,
      given: `public record OrderLine(string Product, int Quantity, decimal UnitPrice);
public record Order(long Id, string Customer, List<OrderLine> Lines);`,
      starter: `public static class Solution
{
    public static decimal Total(Order order)
    {
        // TODO
        return 0m;
    }

    public static Dictionary<string, decimal> RevenueByCustomer(IEnumerable<Order> orders)
    {
        // TODO
        return new Dictionary<string, decimal>();
    }

    public static List<string> TopProducts(IEnumerable<Order> orders, int count)
    {
        // TODO
        return new List<string>();
    }
}`,
      solution: `public static class Solution
{
    public static decimal Total(Order order) =>
        order.Lines.Sum(line => line.Quantity * line.UnitPrice);

    public static Dictionary<string, decimal> RevenueByCustomer(IEnumerable<Order> orders) =>
        orders.GroupBy(order => order.Customer)
              .ToDictionary(group => group.Key, group => group.Sum(Total));

    public static List<string> TopProducts(IEnumerable<Order> orders, int count) =>
        orders.SelectMany(order => order.Lines)
              .GroupBy(line => line.Product)
              .OrderByDescending(group => group.Sum(line => line.Quantity))
              .ThenBy(group => group.Key, StringComparer.Ordinal)
              .Take(count)
              .Select(group => group.Key)
              .ToList();
}`,
      hints: [
        'TopProducts arbeitet nicht auf Bestellungen, sondern auf Positionen – du musst die verschachtelten Listen zuerst flach machen.',
        '`SelectMany(o => o.Lines)`, `GroupBy(l => l.Product)`, `OrderByDescending(g => g.Sum(..))`, `ThenBy(g => g.Key, StringComparer.Ordinal)`, `Take(count)`.',
        'Total: Lines.Sum(Quantity * UnitPrice). RevenueByCustomer: GroupBy(Customer) → ToDictionary(Key, g.Sum(Total)). TopProducts: SelectMany → GroupBy → sortieren → Take → Select(Key).',
        '`.ToDictionary(group => group.Key, group => group.Sum(Total));` – `Total` laesst sich als Method Group uebergeben.',
      ],
      tests: `            var orders = new List<Order>
            {
                new(1, "Jan", new List<OrderLine> { new("Kaffee", 2, 4.50m), new("Tasse", 1, 9.00m) }),
                new(2, "Anna", new List<OrderLine> { new("Kaffee", 5, 4.50m) }),
                new(3, "Jan", new List<OrderLine> { new("Tee", 1, 3.00m) }),
                new(4, "Lea", new List<OrderLine>()),
            };

            Check("Summe einer Bestellung", 18.00m, Solution.Total(orders[0]));
            Check("Bestellung ohne Positionen", 0m, Solution.Total(orders[3]));
            Check("Umsatz je Kunde", new Dictionary<string, decimal> { ["Jan"] = 21.00m, ["Anna"] = 22.50m, ["Lea"] = 0m }, Solution.RevenueByCustomer(orders));
            Check("Umsatz ohne Bestellungen", new Dictionary<string, decimal>(), Solution.RevenueByCustomer(new List<Order>()));
            Check("Top 1", new List<string> { "Kaffee" }, Solution.TopProducts(orders, 1));
            Check("Top 2 mit Gleichstand", new List<string> { "Kaffee", "Tasse" }, Solution.TopProducts(orders, 2));
            Check("mehr angefragt als vorhanden", new List<string> { "Kaffee", "Tasse", "Tee" }, Solution.TopProducts(orders, 10));
            Check("keine Bestellungen", new List<string>(), Solution.TopProducts(new List<Order>(), 3));`,
    },
  ],
}

export default chapter
