# Kapitel 01 – C# Core & Nullable Types

## Mental Model

```text
TYP-SYSTEM            Werttyp (struct)          Referenztyp (class)
                      int, double, bool,        string, List<T>, object,
                      decimal, DateTime,        eigene Klassen, Records
                      Tupel, eigene structs
                      ↓ liegt direkt im Wert    ↓ liegt als Verweis im Wert
                      Kopie beim Zuweisen       Kopie der Referenz

NULLABILITY           int?   = Nullable<int>            → echter Wrapper (HasValue)
                      string? = Referenztyp + Compiler  → nur Analyse, kein Laufzeit-Typ
```

- Werttypen werden **kopiert**, Referenztypen teilen sich das Objekt.
- `?` bei Referenztypen ist reine **Compiler-Information**: „hier darf `null` stehen". Zur Laufzeit ändert sich nichts.
- `?` bei Werttypen ist ein **echter Typ** (`Nullable<int>`) mit `HasValue` und `Value`.
- Der Compiler warnt (`CS86xx`), er verbietet nicht. Warnungen ernst nehmen statt `!` zu streuen.

## Syntax / API

### var und explizite Typen

```csharp
var name = "Jan";                 // string – Typ steht rechts sichtbar
var ids = new List<long>();       // List<long>
var total = 0m;                   // decimal (Suffix: m decimal, d double, f float, L long)

List<Customer> customers = [];    // Collection Expression (C# 12)
int? maybe = null;                // var ginge hier nicht: null hat keinen Typ
```

Faustregel: `var`, wenn der Typ rechts ablesbar ist. Sonst ausschreiben.

### Nullable Reference Types

```csharp
string sicher = "immer da";       // darf nie null sein
string? riskant = FindName();     // darf null sein

int len = riskant.Length;         // ⚠ CS8602: möglicher NullReference
int len2 = riskant?.Length ?? 0;  // sauber: null-conditional + null-coalescing

riskant ??= "Fallback";           // nur zuweisen, wenn null
var upper = riskant!.ToUpperInvariant();   // ! = "ich weiß es besser" – Notausgang
```

| Operator | Bedeutung |
|---|---|
| `?.` | Aufruf nur, wenn nicht null, sonst `null` |
| `??` | linker Wert, falls nicht null, sonst rechter |
| `??=` | zuweisen, nur falls null |
| `!` | null-forgiving: schaltet die Warnung ab (kein Laufzeitschutz!) |

### Nullable Value Types

```csharp
int? age = null;
if (age.HasValue) Console.WriteLine(age.Value);
int shown = age ?? 0;
int? doubled = age * 2;           // null, wenn age null ist (lifted operator)
```

### String-Interpolation

```csharp
var msg = $"{customer.Name} hat {count} Bestellungen";
var money = $"{amount:0.00} EUR";                       // Formatstring
var invariant = amount.ToString("0.00", CultureInfo.InvariantCulture);
var raw = $$"""
    { "name": "{{name}}" }
    """;                                                 // Raw String Literal
```

Für Logs/APIs immer `CultureInfo.InvariantCulture`, sonst wird aus `12.50` je nach Locale `12,50`.

### switch expression

```csharp
var label = status switch
{
    OrderStatus.New       => "neu",
    OrderStatus.Paid      => "bezahlt",
    OrderStatus.Cancelled => "storniert",
    _                     => throw new ArgumentOutOfRangeException(nameof(status)),
};

var category = code switch
{
    < 200 => "Info",
    < 300 => "Erfolg",
    < 400 => "Weiterleitung",
    < 500 when code != 418 => "Client-Fehler",
    _ => "Server-Fehler",
};
```

### Pattern Matching

```csharp
if (value is string s && s.Length > 3) { /* s ist hier typisiert */ }
if (value is not null) { }

var text = value switch
{
    null                       => "-",
    bool b                     => b ? "ja" : "nein",
    int n and > 0              => $"+{n}",
    int n                      => n.ToString(CultureInfo.InvariantCulture),
    string { Length: 0 }       => "leer",
    string str                 => str.Trim(),
    Customer { City: "Bonn" }  => "lokal",            // Property Pattern
    [var first, .., var last]  => $"{first}..{last}", // List Pattern (C# 11)
    _                          => "unbekannt",
};
```

### Tupel und Deconstruction

```csharp
(string Host, int Port) endpoint = ("localhost", 8080);
var (host, port) = endpoint;                  // Deconstruction
Console.WriteLine(endpoint.Host);             // benannte Elemente

static (int Min, int Max) Range(IReadOnlyList<int> xs) => (xs.Min(), xs.Max());
var (min, max) = Range([3, 1, 7]);

foreach (var (key, value) in dictionary) { }  // KeyValuePair deconstructen
```

Tupel sind Werttypen mit struktureller Gleichheit: `(1, "a") == (1, "a")` ist `true`.

### const vs readonly vs static readonly

```csharp
public const int MaxRetries = 3;                     // Compile-Zeit, wird eingebrannt
public static readonly decimal Vat = 0.19m;          // Laufzeit, pro Typ
private readonly ILogger _log;                       // nur im Konstruktor setzbar
```

`const` nur für echte Konstanten (Zahlen, Strings, `bool`). Alles andere `static readonly`.

### Boxing

```csharp
object boxed = 42;             // Boxing: int wandert auf den Heap
int back = (int)boxed;         // Unboxing
ArrayList alt = [];            // alt & untypisiert → boxed jeden int
List<int> gut = [];            // generisch → kein Boxing
```

## Typische Use Cases

- DTO-Felder als `string?` markieren, wenn die API sie weglassen darf – und genau einmal am Rand prüfen.
- Defaults setzen: `var pageSize = request.Size ?? 20;`
- Mapping von Enum/Statuscode auf Text: `switch expression` statt `if`-Kaskade.
- Mehrere Rückgabewerte ohne eigene Klasse: Tupel (intern!), für öffentliche APIs lieber ein `record`.
- Konfiguration parsen: `int.TryParse(value, out var port)` statt `try/catch`.

## Clean-Code-Empfehlungen

- Nullable Reference Types aktiviert lassen und Warnungen wie Fehler behandeln.
- `!` ist ein Codesmell – erst prüfen, ob du nicht umstrukturieren kannst.
- Guard Clauses oben: `ArgumentNullException.ThrowIfNull(customer);`, `ArgumentException.ThrowIfNullOrWhiteSpace(name);`
- `switch expression` statt langer `if/else if`-Ketten; kein `default`, das Fehler verschluckt.
- Tupel nur für kurze, lokale Rückgaben – ab drei Werten oder öffentlicher API ein `record`.
- Keine „magischen" Zahlen: benannte `const`/`static readonly`-Felder.

## Häufige Fehler

```csharp
// FALSCH: ! statt echter Prüfung
var length = name!.Length;
// RICHTIG
var length = name?.Length ?? 0;

// FALSCH: string auf leer prüfen mit == ""
if (input == "" || input == null) { }
// RICHTIG
if (string.IsNullOrWhiteSpace(input)) { }

// FALSCH: Referenzvergleich statt Inhaltsvergleich erwartet
object a = "ab", b = "a" + someVar;
if (a == b) { }                       // object-Überladung → Referenzvergleich
// RICHTIG
if (string.Equals((string)a, (string)b, StringComparison.Ordinal)) { }

// FALSCH: Exception als Kontrollfluss beim Parsen
int port = int.Parse(raw);            // wirft bei "abc"
// RICHTIG
if (!int.TryParse(raw, out var port)) throw new ArgumentException($"kein Port: {raw}");

// FALSCH: ?? greift nicht bei leerem String
var city = customer.City ?? "unbekannt";   // "" bleibt ""
// RICHTIG
var city = string.IsNullOrWhiteSpace(customer.City) ? "unbekannt" : customer.City;

// FALSCH: switch expression ohne vollständige Abdeckung
var label = status switch { OrderStatus.New => "neu" };   // wirft zur Laufzeit
// RICHTIG: _ => throw new ArgumentOutOfRangeException(nameof(status))

// FALSCH: Werttyp kopiert, Änderung verpufft
var p = list[0];      // struct-Kopie
p.X = 5;              // Original unverändert
// RICHTIG: unveränderliche structs verwenden und neu zuweisen

// FALSCH: culture-abhängige Formatierung in Logs/APIs
var text = $"{amount:0.00}";
// RICHTIG
var text = amount.ToString("0.00", CultureInfo.InvariantCulture);
```

## Interview-relevante Details

- `string?` erzeugt **keinen** neuen Typ: zur Laufzeit ist es dasselbe `string`. Nur `Nullable<int>` ist ein echter Typ.
- `?.` wertet den linken Ausdruck **genau einmal** aus – anders als `x != null ? x.Y : null`.
- `??` und `?.` sind short-circuiting; `a ?? Expensive()` ruft `Expensive()` nur bei `null`.
- `const` wird in die aufrufende Assembly **einkompiliert** → Änderungen erfordern Neubau aller Nutzer. `static readonly` nicht.
- `decimal` für Geld (Basis 10, exakt), `double` für Messwerte. `0.1 + 0.2 != 0.3` bei `double`.
- Boxing kostet Heap-Allokation; `struct` in `object`/`ArrayList` oder nicht-generischen Interfaces boxt.
- `switch expression` ist ein **Ausdruck** (liefert einen Wert), `switch`-Statement nicht.
- Tupel-Elementnamen existieren nur im Compiler; zur Laufzeit ist es `ValueTuple<T1,T2>` mit `Item1`/`Item2`.

## Zusammenfassung

- Werttypen kopieren, Referenztypen teilen. `int?` ist ein Typ, `string?` nur eine Annotation.
- `?.`, `??`, `??=` sind die Alltagswerkzeuge; `!` ist der Notausgang.
- `switch expression` + Pattern Matching ersetzen `if`-Kaskaden und Typ-Casts.
- Tupel mit Deconstruction für kurze lokale Mehrfachrückgaben.
- `const` nur für echte Konstanten, sonst `static readonly`.
- `TryParse` statt `Parse`, `IsNullOrWhiteSpace` statt `== ""`, `InvariantCulture` für Maschinen-Output.
