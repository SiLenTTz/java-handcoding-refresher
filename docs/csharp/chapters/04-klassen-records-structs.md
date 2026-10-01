# Kapitel 04 – Klassen, Records & Structs

## Mental Model

```text
                  Referenztyp                      Werttyp
             ┌────────────────────┐          ┌────────────────────┐
IDENTITÄT    │ class              │          │ struct             │
(Referenz)   │ Verhalten, State,  │          │ (Identität selten  │
             │ Vererbung, DI      │          │  sinnvoll)         │
             ├────────────────────┤          ├────────────────────┤
WERT         │ record (class)     │          │ record struct      │
(Inhalt)     │ DTO, Event,        │          │ kleine Werte:      │
             │ Value Object       │          │ Point, Money       │
             └────────────────────┘          └────────────────────┘
```

- **Frage 1:** Zählt die Identität (dasselbe Objekt) oder der Inhalt (gleiche Werte)? → `class` vs `record`.
- **Frage 2:** Klein (≤ 16 Byte), unveränderlich, kurzlebig? → `struct`, sonst Referenztyp.
- `record` schenkt dir `Equals`, `GetHashCode`, `ToString`, Deconstruction und `with`.

## Syntax / API

### Klasse mit Properties

```csharp
public class Customer
{
    public long Id { get; init; }                 // nur beim Erzeugen setzbar
    public required string Name { get; init; }    // muss im Initializer gesetzt werden
    public string? City { get; set; }             // frei änderbar, darf null sein
    public int Visits { get; private set; }       // von außen nur lesbar

    private readonly List<string> _tags = [];
    public IReadOnlyList<string> Tags => _tags;   // expression-bodied Property

    public void Visit() => Visits++;
}

var c = new Customer { Id = 1, Name = "Jan", City = "Bonn" };   // Object Initializer
```

| Accessor | Setzbar |
|---|---|
| `get;` | nie (nur im Konstruktor/Feldinitialisierer) |
| `get; init;` | im Konstruktor und im Object Initializer |
| `get; set;` | immer |
| `get; private set;` | nur innerhalb der Klasse |

### Konstruktoren

```csharp
public class Order
{
    private readonly List<OrderLine> _lines;

    public Order(long id, string customer)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(customer);
        Id = id;
        Customer = customer;
        _lines = [];
    }

    public Order(long id, string customer, List<OrderLine> lines) : this(id, customer)
        => _lines = lines;                        // Konstruktor-Verkettung

    public long Id { get; }
    public string Customer { get; }
}

public class Repo(IDbConnection connection)       // Primary Constructor (C# 12)
{
    private readonly IDbConnection _connection = connection;
}
```

Der Konstruktor ist der Ort für Invarianten: Ein Objekt darf nie ungültig existieren.

### Records

```csharp
public record CustomerDto(long Id, string Name, string? City);     // positional

var a = new CustomerDto(1, "Jan", "Bonn");
var b = new CustomerDto(1, "Jan", "Bonn");
a == b;                       // true – Werte-Gleichheit
a.ToString();                 // CustomerDto { Id = 1, Name = Jan, City = Bonn }
var (id, name, city) = a;     // Deconstruction gratis

var moved = a with { City = "Köln" };     // non-destructive mutation, a bleibt unverändert
```

```csharp
public record Money(decimal Amount, string Currency)
{
    public static Money Euro(decimal amount) => new(amount, "EUR");   // statische Factory

    public Money Plus(Money other) => Currency == other.Currency
        ? this with { Amount = Amount + other.Amount }
        : throw new InvalidOperationException("Währungen verschieden");
}
```

- `record` = `record class` (Referenztyp), `record struct` = Werttyp.
- Positional Properties sind `get; init;` → unveränderlich.
- Vererbung ist erlaubt: `public record Admin(long Id, string Name, string Scope) : User(Id, Name);`

### struct und readonly struct

```csharp
public readonly struct Temperature : IEquatable<Temperature>
{
    private Temperature(double celsius) => Celsius = celsius;

    public double Celsius { get; }
    public double Fahrenheit => Celsius * 9 / 5 + 32;

    public static Temperature FromCelsius(double celsius) => celsius < -273.15
        ? throw new ArgumentOutOfRangeException(nameof(celsius))
        : new Temperature(celsius);

    public bool Equals(Temperature other) => Celsius.Equals(other.Celsius);
    public override bool Equals(object? obj) => obj is Temperature t && Equals(t);
    public override int GetHashCode() => Celsius.GetHashCode();
    public override string ToString() => $"{Celsius.ToString("0.0", CultureInfo.InvariantCulture)} °C";
}

public readonly record struct Point(int X, int Y);    // kürzeste Variante
```

`readonly struct` verhindert versehentliche Mutation und defensive Kopien durch den Compiler.

### Vererbung vs Komposition

```csharp
// Vererbung: "ist ein" – nur bei echter Substituierbarkeit
public abstract class Shape
{
    public abstract double Area { get; }
    public override string ToString() => $"{GetType().Name}: {Area:0.00}";
}
public sealed class Circle(double r) : Shape
{
    public override double Area => Math.PI * r * r;
}

// Komposition: "hat ein" – der Normalfall
public class OrderService(IOrderRepository repository, IPriceCalculator calculator)
{
    public decimal Total(long id) => calculator.Total(repository.Load(id));
}
```

Standard: **Komposition**. Klassen `sealed`, bis Vererbung wirklich gebraucht wird.

### ToString / Equals / GetHashCode von Hand

```csharp
public sealed class Sku : IEquatable<Sku>
{
    public Sku(string value) => Value = value;
    public string Value { get; }

    public bool Equals(Sku? other) => other is not null && Value == other.Value;
    public override bool Equals(object? obj) => Equals(obj as Sku);
    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);
    public override string ToString() => Value;
}
```

Regel: `Equals` und `GetHashCode` immer **zusammen** überschreiben – oder einfach ein `record` nehmen.

## Typische Use Cases

- API-/DB-DTOs, Events, Messages → `record` (unveränderlich, Werte-Gleichheit, `with`).
- Services, Repositories, Controller → `class` mit Konstruktor-Injection, `sealed`.
- Value Objects wie `Money`, `Sku`, `Email` → `record` oder `readonly record struct`.
- Kleine mathematische Werte (`Point`, `Range`) → `readonly record struct`.
- Objekte mit Validierung beim Erzeugen → private Konstruktor + statische Factory (`Create`, `Parse`).

## Clean-Code-Empfehlungen

- Unveränderlich als Default: `init` statt `set`, `readonly` Felder.
- Ungültige Zustände unmöglich machen: validieren im Konstruktor/Factory, nicht beim Benutzen.
- Klassen `sealed`, Felder `private`, Collections nach außen als `IReadOnlyList<T>`.
- Keine öffentlichen Felder – Properties (auch `public double X { get; }`).
- Statische Factory-Methoden mit sprechendem Namen statt fünf Konstruktor-Überladungen.
- Ein Typ = eine Verantwortung. DTO ≠ Entity ≠ Domain-Modell.

## Häufige Fehler

```csharp
// FALSCH: Equals überschrieben, GetHashCode vergessen
public override bool Equals(object? o) => o is Sku s && s.Value == Value;
// → im HashSet/Dictionary landen "gleiche" Objekte doppelt
// RICHTIG: beide überschreiben – oder record verwenden

// FALSCH: with verändert das Original (Annahme)
var moved = customer with { City = "Köln" };
// customer ist UNVERÄNDERT – "moved" ist eine Kopie. Rückgabewert nutzen!

// FALSCH: record mit Collection und Werte-Gleichheit erwarten
record Order(long Id, List<string> Items);
new Order(1, ["a"]) == new Order(1, ["a"]);   // false! List vergleicht per Referenz

// FALSCH: veränderbarer struct
public struct Counter { public int Value; }
list[0].Value = 5;                 // ändert eine Kopie oder kompiliert nicht
// RICHTIG: readonly struct + neue Instanz zurückgeben

// FALSCH: Validierung im Property-Setter statt im Konstruktor
public decimal Price { get; set; }    // negativ jederzeit möglich
// RICHTIG
public decimal Price { get; init; }   // + Prüfung im Konstruktor/Factory

// FALSCH: interne Liste nach außen geben
public List<string> Tags => _tags;    // Aufrufer kann _tags verändern
// RICHTIG
public IReadOnlyList<string> Tags => _tags;

// FALSCH: Vererbung für Code-Wiederverwendung
public class CsvExporter : FileHelper { }
// RICHTIG: FileHelper injizieren (Komposition)

// FALSCH: required vergessen und "schleichend" ungültige Objekte
var c = new Customer();               // Name ist null
// RICHTIG
public required string Name { get; init; }
```

## Interview-relevante Details

- `record` generiert: `Equals`, `GetHashCode`, `ToString`, `op_Equality`, `Deconstruct`, Copy-Konstruktor und `with`.
- `record` vergleicht **feldweise** – bei Collection-Properties also per Referenz. Für Werte-Gleichheit selbst `Equals` überschreiben.
- `with` ruft den protected Copy-Konstruktor auf und erzeugt eine **flache** Kopie (shallow copy).
- `struct` hat immer einen impliziten parameterlosen Konstruktor (`default`) – Invarianten lassen sich nicht erzwingen.
- Werttypen leben dort, wo sie deklariert sind (Stack oder eingebettet im Objekt); Boxing bringt sie auf den Heap.
- `init` funktioniert über `modreq IsExternalInit` – es ist eine Compiler-Regel, keine Laufzeitprüfung.
- `required` ist ebenfalls Compile-Zeit: Reflection kann es umgehen.
- `sealed` erlaubt dem JIT, virtuelle Aufrufe zu devirtualisieren – und dokumentiert die Absicht.

## Zusammenfassung

- `class` für Identität und Verhalten, `record` für Werte, `struct` für kleine unveränderliche Werte.
- `record` positional + `with` = der Standard für DTOs und Value Objects.
- Invarianten im Konstruktor oder in einer statischen Factory prüfen, nicht später.
- `init`/`required`/`readonly` statt `set` – unveränderlich als Standard.
- `Equals` und `GetHashCode` nur gemeinsam überschreiben; Collections in Records brechen die Werte-Gleichheit.
- Komposition vor Vererbung, Klassen `sealed`, Collections als `IReadOnlyList<T>` nach außen.
