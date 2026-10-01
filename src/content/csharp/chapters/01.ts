import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    { id: 'f1', front: 'Werttyp vs. Referenztyp – der Kernunterschied?', back: 'Werttypen (`struct`, `int`, `decimal`, Tupel) werden beim Zuweisen **kopiert**. Referenztypen (`class`, `record`, `string`, `List<T>`) teilen sich dasselbe Objekt – kopiert wird nur der Verweis.' },
    { id: 'f2', front: 'Was ist der Unterschied zwischen `int?` und `string?`?', back: '`int?` ist ein **echter Typ** (`Nullable<int>`) mit `HasValue`/`Value`. `string?` ist nur eine **Compiler-Annotation** – zur Laufzeit ist es dasselbe `string`.' },
    { id: 'f3', front: 'Was machen `?.`, `??` und `??=`?', back: '`a?.B` ruft `B` nur auf, wenn `a` nicht null ist (sonst `null`). `a ?? b` liefert `a`, falls nicht null, sonst `b`. `a ??= b` weist `b` nur zu, wenn `a` null ist.' },
    { id: 'f4', front: 'Was macht der `!`-Operator (null-forgiving)?', back: 'Er schaltet nur die **Compiler-Warnung** ab. Zur Laufzeit passiert nichts – bei `null` gibt es trotzdem eine `NullReferenceException`. Codesmell: lieber echt prüfen.' },
    { id: 'f5', front: 'Wann `var`, wann expliziter Typ?', back: '`var`, wenn der Typ rechts ablesbar ist (`var list = new List<int>();`). Expliziter Typ, wenn nicht (`decimal total = Calculate();`) oder bei `null`/Collection Expressions (`List<int> x = [];`).' },
    { id: 'f6', front: 'Wie prüft man idiomatisch auf leeren String?', back: '`string.IsNullOrWhiteSpace(input)` – deckt `null`, `""` und `"   "` ab. Nicht `input == ""`, denn `??` greift bei `""` nicht.' },
    { id: 'f7', front: 'Parse vs. TryParse?', back: '`int.Parse("abc")` wirft eine `FormatException`. `int.TryParse(raw, out var n)` gibt `false` zurück – Exceptions sind kein Kontrollfluss.\n```csharp\nif (!int.TryParse(raw, out var port))\n    throw new ArgumentException($"kein Port: {raw}");\n```' },
    { id: 'f8', front: 'Was ist eine `switch expression` und was muss man beachten?', back: 'Ein **Ausdruck**, der einen Wert liefert:\n```csharp\nvar label = status switch\n{\n    < 300 => "ok",\n    _ => throw new ArgumentOutOfRangeException(nameof(status)),\n};\n```\nOhne vollständige Abdeckung wirft sie zur Laufzeit eine `SwitchExpressionException`.' },
    { id: 'f9', front: 'Nenne drei Pattern-Arten im Pattern Matching.', back: 'Typ-/Declaration Pattern (`is string s`), relationale und logische Patterns (`is >= 200 and < 300`, `is not null`), Property Pattern (`is Customer { City: "Bonn" }`). Dazu List Patterns (`is [var first, .., var last]`).' },
    { id: 'f10', front: 'Tupel: Deklaration, Deconstruction, Gleichheit?', back: '```csharp\n(string Host, int Port) e = ("db", 5432);\nvar (host, port) = e;\n(1, "a") == (1, "a"); // true\n```\nTupel sind Werttypen mit struktureller Gleichheit. Elementnamen existieren nur zur Compile-Zeit.' },
    { id: 'f11', front: '`const` vs. `static readonly`?', back: '`const` wird zur Compile-Zeit in die **aufrufende Assembly einkompiliert** – Änderungen erfordern Neubau aller Nutzer. `static readonly` wird zur Laufzeit gelesen. `const` nur für echte Konstanten (Zahl, String, bool).' },
    { id: 'f12', front: 'Was ist Boxing und warum ist es teuer?', back: 'Ein Werttyp wird in ein `object` verpackt und landet auf dem **Heap** (Allokation + GC-Druck). Passiert bei `object o = 42;`, `ArrayList` oder nicht-generischen Interfaces. Generics (`List<int>`) vermeiden es.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `int? a = null;
int b = a ?? 5;
int? c = a + 10;
Console.WriteLine($"{b} {c?.ToString() ?? "null"}");`,
      options: ['`5 null`', '`5 10`', '`0 null`', '`NullReferenceException`'],
      correct: 0,
      explanation: '`??` liefert den Fallback `5`. Arithmetik auf `int?` ist "lifted": Ist ein Operand `null`, ist das Ergebnis `null` – also bleibt `c` null.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `var value = null;`,
      options: [
        '`var` ist nur in Methoden erlaubt',
        '`null` hat keinen Typ, also kann der Compiler nichts ableiten',
        'Man muss `var?` schreiben',
        'Nullable Reference Types verbieten `null`-Zuweisungen',
      ],
      correct: 1,
      explanation: '`var` leitet den Typ aus dem Initialisierer ab. `null` ist typlos – hier braucht es einen expliziten Typ, z. B. `string? value = null;`.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Bug?',
      code: `// customer.City ist ""
var city = customer.City ?? "unbekannt";
Console.WriteLine($"[{city}]");`,
      options: [
        '`??` funktioniert nicht mit `string`',
        '`??` greift nur bei `null`, nicht bei `""` – ausgegeben wird `[]`',
        '`city` ist hier `null` und die Interpolation wirft',
        'Kein Bug, ausgegeben wird `[unbekannt]`',
      ],
      correct: 1,
      explanation: 'Der leere String ist nicht `null`. Für "leer oder null" gehört `string.IsNullOrWhiteSpace(..)` hin.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben, wenn `code = 302` ist?',
      code: `var text = code switch
{
    >= 200 and < 300 => "ok",
    >= 400 => "fehler",
};
Console.WriteLine(text);`,
      options: ['`ok`', '`fehler`', 'ein leerer String', '`SwitchExpressionException`'],
      correct: 3,
      explanation: '`302` trifft keinen Arm. Eine `switch expression` ohne `_`-Arm wirft zur Laufzeit `SwitchExpressionException`. Immer bewusst abschließen – notfalls mit `throw`.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `var a = (Id: 1, Name: "Jan");
var b = (Id: 1, Name: "Jan");
Console.WriteLine(a == b);`,
      options: ['`True`', '`False`', 'Compile-Fehler: Tupel kann man nicht vergleichen', 'Compile-Fehler: Elementnamen müssen übereinstimmen'],
      correct: 0,
      explanation: 'Tupel sind Werttypen mit struktureller Gleichheit: Es werden die Elemente paarweise verglichen. Die Elementnamen spielen dabei keine Rolle.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `struct Counter { public int Value; }

var list = new List<Counter> { new Counter { Value = 1 } };
var c = list[0];
c.Value = 99;
Console.WriteLine(list[0].Value);`,
      options: ['`99`', '`1`', '`0`', 'Compile-Fehler'],
      correct: 1,
      explanation: '`list[0]` liefert bei einem `struct` eine **Kopie**. Die Änderung wirkt nur auf `c`. Genau deshalb sollten structs `readonly` und unveränderlich sein.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisch?',
      options: [
        '`int port; try { port = int.Parse(raw); } catch (FormatException) { port = 8080; }`',
        '`var port = raw != null && raw != "" ? Convert.ToInt32(raw) : 8080;`',
        '`var port = int.TryParse(raw, out var p) ? p : 8080;`',
        '`var port = (int)raw!;`',
      ],
      correct: 2,
      explanation: '`TryParse` drückt "kann fehlschlagen" direkt im Typsystem aus, ohne Exception als Kontrollfluss und ohne manuelle String-Prüfungen.',
    },
    {
      id: 'q8',
      prompt: 'Eine Bibliothek veröffentlicht `public const decimal Vat = 0.19m;`. Warum ist das problematisch?',
      options: [
        '`const` ist für `decimal` nicht erlaubt',
        'Der Wert wird in aufrufende Assemblies einkompiliert – nach einer Änderung müssen alle Nutzer neu gebaut werden',
        '`const`-Felder sind nicht thread-safe',
        '`const` erzeugt bei jedem Zugriff eine neue Instanz',
      ],
      correct: 1,
      explanation: 'Genau das ist der Klassiker: `const` ist Compile-Zeit-Ersetzung. Für Werte, die sich ändern können, gehört `public static readonly decimal Vat = 0.19m;` hin. (`const decimal` ist übrigens tatsächlich erlaubt.)',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Null-sichere Anzeige',
      level: 1,
      description: `Implementiere \`Solution.Describe(string? name, int? age)\`:

\`\`\`csharp
public static string Describe(string? name, int? age)
\`\`\`

- Name fehlt (\`null\`, leer oder nur Leerzeichen) → \`"Unbekannt"\`, sonst der **getrimmte** Name
- Alter fehlt (\`null\`) → \`"?"\`
- Ergebnisformat: \`"Anna (30)"\`

Nutze String-Interpolation, \`string.IsNullOrWhiteSpace\` und \`??\`.`,
      starter: `public static class Solution
{
    public static string Describe(string? name, int? age)
    {
        // TODO
        return "";
    }
}`,
      solution: `public static class Solution
{
    public static string Describe(string? name, int? age)
    {
        var shownName = string.IsNullOrWhiteSpace(name) ? "Unbekannt" : name.Trim();
        var shownAge = age?.ToString(CultureInfo.InvariantCulture) ?? "?";
        return $"{shownName} ({shownAge})";
    }
}`,
      hints: [
        'Zwei unabhängige Fälle: fehlender Name und fehlendes Alter. Behandle sie getrennt in zwei lokalen Variablen.',
        '`string.IsNullOrWhiteSpace(..)`, `.Trim()`, `age?.ToString(..)` und `??` für den Fallback.',
        'shownName = leer? "Unbekannt" : name.Trim(); shownAge = age?.ToString() ?? "?"; danach $"{shownName} ({shownAge})".',
        '`var shownAge = age?.ToString(CultureInfo.InvariantCulture) ?? "?";`',
      ],
      tests: `            Check("Normalfall", "Anna (30)", Solution.Describe("Anna", 30));
            Check("ohne Name", "Unbekannt (30)", Solution.Describe(null, 30));
            Check("nur Leerzeichen", "Unbekannt (5)", Solution.Describe("   ", 5));
            Check("ohne Alter", "Anna (?)", Solution.Describe("Anna", null));
            Check("beides fehlt", "Unbekannt (?)", Solution.Describe(null, null));
            Check("Name wird getrimmt", "Jan (0)", Solution.Describe("  Jan  ", 0));`,
    },
    {
      id: 'k2',
      title: 'HTTP-Status mit switch expression',
      level: 2,
      description: `Implementiere zwei Methoden:

\`\`\`csharp
public static string Classify(int status)
public static bool IsRetryable(int status)
\`\`\`

\`Classify\` (per \`switch expression\`, keine if-Kaskade):

| Bereich | Ergebnis |
|---|---|
| 100–199 | \`"Info"\` |
| 200–299 | \`"Erfolg"\` |
| 300–399 | \`"Weiterleitung"\` |
| 400–499 | \`"Client-Fehler"\` |
| 500–599 | \`"Server-Fehler"\` |
| alles andere | \`ArgumentOutOfRangeException\` |

\`IsRetryable\`: \`true\` für \`408\`, \`429\` und alle 5xx – sonst \`false\` (auch für ungültige Werte, hier ohne Exception).`,
      starter: `public static class Solution
{
    public static string Classify(int status)
    {
        // TODO
        return "";
    }

    public static bool IsRetryable(int status)
    {
        // TODO
        return false;
    }
}`,
      solution: `public static class Solution
{
    public static string Classify(int status) => status switch
    {
        < 100 or >= 600 => throw new ArgumentOutOfRangeException(nameof(status), $"kein HTTP-Status: {status}"),
        < 200 => "Info",
        < 300 => "Erfolg",
        < 400 => "Weiterleitung",
        < 500 => "Client-Fehler",
        _ => "Server-Fehler",
    };

    public static bool IsRetryable(int status) =>
        status is 408 or 429 or (>= 500 and < 600);
}`,
      hints: [
        'Eine switch expression prüft die Arme von oben nach unten. Wenn du den Fehlerfall zuerst abfängst, reichen danach reine Obergrenzen.',
        'Relationale Patterns (`< 300`), logische Patterns (`or`, `and`) und `throw` als Arm-Ausdruck.',
        'Arm 1: `< 100 or >= 600 => throw ...`, danach `< 200`, `< 300`, `< 400`, `< 500`, `_`. IsRetryable: `status is 408 or 429 or (>= 500 and < 600)`.',
        '`public static string Classify(int status) => status switch { < 100 or >= 600 => throw new ArgumentOutOfRangeException(nameof(status)), ... };`',
      ],
      tests: `            Check("100 Info", "Info", Solution.Classify(100));
            Check("200 Erfolg", "Erfolg", Solution.Classify(200));
            Check("299 Erfolg", "Erfolg", Solution.Classify(299));
            Check("302 Weiterleitung", "Weiterleitung", Solution.Classify(302));
            Check("404 Client", "Client-Fehler", Solution.Classify(404));
            Check("503 Server", "Server-Fehler", Solution.Classify(503));
            CheckThrows<ArgumentOutOfRangeException>("99 ungueltig", () => Solution.Classify(99));
            CheckThrows<ArgumentOutOfRangeException>("600 ungueltig", () => Solution.Classify(600));
            CheckTrue("408 retrybar", Solution.IsRetryable(408));
            CheckTrue("429 retrybar", Solution.IsRetryable(429));
            CheckTrue("500 retrybar", Solution.IsRetryable(500));
            CheckTrue("404 nicht retrybar", !Solution.IsRetryable(404));
            CheckTrue("200 nicht retrybar", !Solution.IsRetryable(200));`,
    },
    {
      id: 'k3',
      title: 'Pattern Matching: Werte rendern',
      level: 3,
      description: `Implementiere \`Solution.Render(object? value)\` als **eine** \`switch expression\`:

\`\`\`csharp
public static string Render(object? value)
\`\`\`

| Eingabe | Ergebnis |
|---|---|
| \`null\` | \`"-"\` |
| \`bool\` | \`"ja"\` / \`"nein"\` |
| \`int\` < 0 | in Klammern ohne Vorzeichen, z. B. \`-7\` → \`"(7)"\` |
| \`int\` sonst | die Zahl als Text |
| \`decimal\` | immer zwei Nachkommastellen, z. B. \`12.5m\` → \`"12.50"\` |
| \`string\`, leer/nur Leerzeichen | \`"-"\` |
| \`string\` sonst | getrimmt |
| alles andere | \`value.ToString()\`, notfalls \`"-"\` |

Formatiere Zahlen mit \`CultureInfo.InvariantCulture\`. **Achtung auf die Reihenfolge der Arme.**`,
      starter: `public static class Solution
{
    public static string Render(object? value)
    {
        // TODO
        return "";
    }
}`,
      solution: `public static class Solution
{
    public static string Render(object? value) => value switch
    {
        null => "-",
        bool b => b ? "ja" : "nein",
        int n and < 0 => $"({-n})",
        int n => n.ToString(CultureInfo.InvariantCulture),
        decimal d => d.ToString("0.00", CultureInfo.InvariantCulture),
        string s when string.IsNullOrWhiteSpace(s) => "-",
        string s => s.Trim(),
        _ => value.ToString() ?? "-",
    };
}`,
      hints: [
        'Spezialfaelle stehen in einer switch expression immer vor den allgemeinen Faellen – sonst werden sie nie erreicht.',
        'Declaration Pattern (`int n`) kombiniert mit `and < 0`, `when`-Guard fuer Strings, `ToString("0.00", CultureInfo.InvariantCulture)` fuer decimal.',
        'null → "-"; bool b → ja/nein; int n and < 0 → $"({-n})"; int n → ToString; decimal d → "0.00"; string leer → "-"; string s → s.Trim(); _ → value.ToString() ?? "-".',
        '`int n and < 0 => $"({-n})",` muss **vor** `int n => ...` stehen.',
      ],
      tests: `            Check("null", "-", Solution.Render(null));
            Check("true", "ja", Solution.Render(true));
            Check("false", "nein", Solution.Render(false));
            Check("positive Zahl", "42", Solution.Render(42));
            Check("null als Zahl", "0", Solution.Render(0));
            Check("negative Zahl", "(7)", Solution.Render(-7));
            Check("decimal", "12.50", Solution.Render(12.5m));
            Check("decimal ganz", "3.00", Solution.Render(3m));
            Check("string getrimmt", "Jan", Solution.Render("  Jan  "));
            Check("leerer string", "-", Solution.Render("   "));
            Check("anderer Typ", "1.5", Solution.Render(1.5));`,
    },
    {
      id: 'k4',
      title: 'Endpoint parsen mit Tupeln',
      level: 4,
      description: `Ein Endpoint wird als String konfiguriert: \`"localhost:8080"\` oder nur \`"api.example.com"\`.

\`\`\`csharp
public static (string Host, int Port) ParseEndpoint(string? input)
public static string Format((string Host, int Port) endpoint)
\`\`\`

\`ParseEndpoint\`:
- Eingabe wird **getrimmt**
- kein \`:\` → Default-Port \`443\`
- \`null\`, leer oder nur Leerzeichen → \`ArgumentException\`
- leerer Host (z. B. \`":80"\`) → \`ArgumentException\`
- Port ist keine Zahl → \`ArgumentException\` (nutze \`int.TryParse\`, **kein** try/catch)
- Port außerhalb \`1..65535\` → \`ArgumentOutOfRangeException\`

\`Format\`: per **Deconstruction** zerlegen. Ist der Port \`443\`, nur den Host ausgeben, sonst \`"host:port"\`.`,
      starter: `public static class Solution
{
    public static (string Host, int Port) ParseEndpoint(string? input)
    {
        // TODO
        return ("", 0);
    }

    public static string Format((string Host, int Port) endpoint)
    {
        // TODO
        return "";
    }
}`,
      solution: `public static class Solution
{
    private const int DefaultPort = 443;

    public static (string Host, int Port) ParseEndpoint(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            throw new ArgumentException("Endpoint darf nicht leer sein", nameof(input));
        }

        var text = input.Trim();
        var separator = text.IndexOf(':');
        if (separator < 0)
        {
            return (text, DefaultPort);
        }

        var host = text[..separator];
        var portText = text[(separator + 1)..];

        if (host.Length == 0)
        {
            throw new ArgumentException($"kein Host in '{text}'", nameof(input));
        }
        if (!int.TryParse(portText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var port))
        {
            throw new ArgumentException($"kein gueltiger Port: '{portText}'", nameof(input));
        }
        if (port is < 1 or > 65535)
        {
            throw new ArgumentOutOfRangeException(nameof(input), $"Port {port} liegt nicht in 1..65535");
        }

        return (host, port);
    }

    public static string Format((string Host, int Port) endpoint)
    {
        var (host, port) = endpoint;
        return port == DefaultPort ? host : $"{host}:{port}";
    }
}`,
      hints: [
        'Erst die Guard Clauses (leer, kein Host, kein Port, Port-Bereich), danach der Happy Path. So bleibt die Methode flach.',
        '`string.IsNullOrWhiteSpace`, `IndexOf(char)`, Range-Operator `text[..i]` und `text[(i + 1)..]`, `int.TryParse(.., out var port)`, `port is < 1 or > 65535`.',
        'trimmen → IndexOf(:) → wenn < 0: (text, 443) → sonst Host und PortText zerlegen → validieren → (host, port). Format: `var (host, port) = endpoint;`',
        '`if (!int.TryParse(portText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var port)) throw new ArgumentException(...);`',
      ],
      tests: `            Check("Host und Port", ("localhost", 8080), Solution.ParseEndpoint("localhost:8080"));
            Check("Default-Port", ("api.example.com", 443), Solution.ParseEndpoint("api.example.com"));
            Check("wird getrimmt", ("db", 5432), Solution.ParseEndpoint("  db:5432  "));
            Check("Grenzwert 1", ("h", 1), Solution.ParseEndpoint("h:1"));
            Check("Grenzwert 65535", ("h", 65535), Solution.ParseEndpoint("h:65535"));
            CheckThrows<ArgumentException>("null", () => Solution.ParseEndpoint(null));
            CheckThrows<ArgumentException>("nur Leerzeichen", () => Solution.ParseEndpoint("   "));
            CheckThrows<ArgumentException>("kein Host", () => Solution.ParseEndpoint(":80"));
            CheckThrows<ArgumentException>("Port keine Zahl", () => Solution.ParseEndpoint("host:abc"));
            CheckThrows<ArgumentOutOfRangeException>("Port 0", () => Solution.ParseEndpoint("host:0"));
            CheckThrows<ArgumentOutOfRangeException>("Port zu gross", () => Solution.ParseEndpoint("host:70000"));
            Check("Format mit Port", "db:5432", Solution.Format(("db", 5432)));
            Check("Format ohne Port", "db", Solution.Format(("db", 443)));`,
    },
  ],
}

export default chapter
