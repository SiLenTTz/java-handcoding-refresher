import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    { id: 'f1', front: 'Die Interface-Hierarchie der Collections – von schwach nach stark?', back: '`IEnumerable<T>` (durchlaufen) → `ICollection<T>` (+ `Count`, `Add`, `Remove`, `Contains`) → `IList<T>` (+ Index, `Insert`, `IndexOf`). Parameter so schwach wie möglich, Rückgabe so konkret wie nötig.' },
    { id: 'f2', front: 'Warum `TryGetValue` statt `ContainsKey` + Indexer?', back: '`ContainsKey` + `map[key]` sind **zwei** Lookups. `TryGetValue` ist einer:\n```csharp\nif (map.TryGetValue(key, out var value)) { }\n```' },
    { id: 'f3', front: 'Was passiert bei `map["fehlt"]` und bei `map.Add(key, v)` mit vorhandenem Key?', back: 'Indexer-Lesen auf fehlendem Key → `KeyNotFoundException`. `Add` mit vorhandenem Key → `ArgumentException`. Alternativen: `GetValueOrDefault(..)`, `map[key] = v`, `TryAdd(..)`.' },
    { id: 'f4', front: 'Wann `HashSet<T>` statt `List<T>`?', back: 'Wenn du Eindeutigkeit brauchst oder oft `Contains` prüfst: `HashSet.Contains` ist O(1), `List.Contains` ist O(n). `Add` liefert `false`, wenn das Element schon drin war.' },
    { id: 'f5', front: '`Queue<T>` vs. `Stack<T>`?', back: '`Queue` = FIFO: `Enqueue`/`Dequeue`/`Peek` (z. B. Aufgabenreihenfolge). `Stack` = LIFO: `Push`/`Pop`/`Peek` (z. B. Klammernprüfung, Undo). Beide haben `TryDequeue`/`TryPop` statt Exception.' },
    { id: 'f6', front: 'Was passiert, wenn man eine Collection während `foreach` verändert?', back: '`InvalidOperationException: Collection was modified`. Stattdessen `list.RemoveAll(predicate)` oder über eine Kopie iterieren bzw. eine neue Liste bauen.' },
    { id: 'f7', front: '`List.Sort(..)` vs. `OrderBy(..)`?', back: '`Sort` sortiert **in-place** und gibt nichts zurück (instabil, Quicksort-artig). `OrderBy` liefert eine **neue** Sequenz und ist stabil. Das Ergebnis von `OrderBy` muss zugewiesen werden.' },
    { id: 'f8', front: 'Wie sortiert man nach Abteilung aufsteigend, dann Gehalt absteigend – ohne LINQ?', back: '```csharp\nlist.Sort((a, b) =>\n{\n    var byDept = string.CompareOrdinal(a.Department, b.Department);\n    return byDept != 0 ? byDept : b.Salary.CompareTo(a.Salary);\n});\n```' },
    { id: 'f9', front: 'Array vs. `List<T>`?', back: 'Array: feste Länge, `Length`, schnell, für Interop und feste Größen. `List<T>`: wächst dynamisch (internes Array wird verdoppelt), `Count`, `Add`/`Remove`. Im Alltag `List<T>`.' },
    { id: 'f10', front: 'Was gibt man aus einer Methode zurück, wenn es keine Elemente gibt?', back: 'Eine **leere Collection**, nie `null`. Idiomatisch: `public IReadOnlyList<string> GetTags() => [];`' },
    { id: 'f11', front: '`AsReadOnly()` vs. `ImmutableArray<T>`?', back: '`AsReadOnly()` ist nur ein **Wrapper**: ändert sich die Originalliste, ändert sich die Sicht. `ImmutableArray<T>` / `ImmutableList<T>` sind echte Kopien und garantiert unveränderlich.' },
    { id: 'f12', front: 'Warum dürfen Dictionary-Keys nicht veränderlich sein?', back: 'Der Eintrag wird über `GetHashCode()` in einem Bucket abgelegt. Ändert sich das Objekt, ändert sich der Hash – der Eintrag ist nicht mehr auffindbar. Keys: `string`, `int`, `record` mit Werten.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche Variante ist idiomatisch?',
      options: [
        '`if (map.ContainsKey(k)) { var v = map[k]; Use(v); }`',
        '`try { Use(map[k]); } catch (KeyNotFoundException) { }`',
        '`if (map.TryGetValue(k, out var v)) { Use(v); }`',
        '`var v = map.Keys.Contains(k) ? map[k] : default;`',
      ],
      correct: 2,
      explanation: '`TryGetValue` braucht genau einen Lookup, wirft nicht und deklariert die Variable direkt. Variante 1 sucht zweimal, Variante 4 sogar linear über alle Keys.',
    },
    {
      id: 'q2',
      prompt: 'Was passiert hier?',
      code: `var names = new List<string> { "Jan", "Al", "Anna" };
foreach (var n in names)
{
    if (n.Length < 3) names.Remove(n);
}`,
      options: [
        '`names` enthält danach `Jan` und `Anna`',
        '`InvalidOperationException` – die Collection wurde während der Iteration verändert',
        'Compile-Fehler: `Remove` ist in `foreach` verboten',
        'Nichts, `Remove` wirkt erst nach der Schleife',
      ],
      correct: 1,
      explanation: 'Der Enumerator merkt die Änderung und wirft. Lösung: `names.RemoveAll(n => n.Length < 3);`',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `var tags = new HashSet<string> { "a", "b" };
var first = tags.Add("c");
var second = tags.Add("a");
Console.WriteLine($"{first} {second} {tags.Count}");`,
      options: ['`True False 3`', '`True True 4`', '`True False 4`', '`False False 3`'],
      correct: 0,
      explanation: '`HashSet.Add` liefert `false`, wenn das Element schon enthalten war – das Set bleibt dann unverändert. Am Ende: `a`, `b`, `c`.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `var names = new List<string> { "Zoe", "Anna" };
names.OrderBy(n => n);
Console.WriteLine(names[0]);`,
      options: ['`Anna`', '`Zoe`', 'ein leerer String', 'Compile-Fehler'],
      correct: 1,
      explanation: '`OrderBy` verändert die Liste nicht, sondern liefert eine neue Sequenz – die hier weggeworfen wird. Entweder `names = names.OrderBy(..).ToList();` oder `names.Sort();`',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Bug?',
      code: `var known = new List<long>(/* 100_000 Einträge */);
foreach (var id in incomingIds)
{
    if (known.Contains(id)) Handle(id);
}`,
      options: [
        '`Contains` gibt es auf `List<T>` nicht',
        '`List.Contains` ist O(n) – die Schleife wird O(n*m); ein `HashSet<long>` macht daraus O(m)',
        '`long` kann man nicht mit `Contains` vergleichen',
        'Kein Bug, `List.Contains` nutzt intern einen Hash-Index',
      ],
      correct: 1,
      explanation: '`List.Contains` scannt linear. `var lookup = known.ToHashSet();` einmal bauen, dann O(1) je Prüfung.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `var ages = new Dictionary<string, int> { ["Jan"] = 38 };
ages["Anna"] = 25;
ages["Jan"] = 39;
Console.WriteLine($"{ages.Count} {ages.GetValueOrDefault("Ben", -1)}");`,
      options: ['`3 -1`', '`2 -1`', '`2 0`', '`ArgumentException`'],
      correct: 1,
      explanation: 'Der Indexer macht "add or update" – `ages["Jan"] = 39` ersetzt nur. Also 2 Einträge. `GetValueOrDefault` liefert den übergebenen Default statt zu werfen. (`ages.Add("Jan", 39)` hätte geworfen.)',
    },
    {
      id: 'q7',
      prompt: 'Welche Signatur ist für einen Service idiomatisch?',
      options: [
        '`public List<Customer>? FindAll()` – `null`, wenn nichts gefunden wurde',
        '`public IReadOnlyList<Customer> FindAll()` – leere Liste, wenn nichts gefunden wurde',
        '`public ArrayList FindAll()`',
        '`public Customer[]? FindAll()`',
      ],
      correct: 1,
      explanation: 'Nie `null` für "leer" zurückgeben. `IReadOnlyList<T>` sagt dem Aufrufer: lesen ja, in meinen State schreiben nein. `ArrayList` ist untypisiert und boxt.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `var names = new List<string> { "Jan" };
IReadOnlyList<string> view = names.AsReadOnly();
names.Add("Anna");
Console.WriteLine(view.Count);`,
      options: ['`1`', '`2`', '`0`', '`InvalidOperationException`'],
      correct: 1,
      explanation: '`AsReadOnly()` ist nur eine **Sicht** auf dieselbe Liste, keine Kopie. Wer eine echte Momentaufnahme braucht: `names.ToList()` oder `ImmutableArray`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Wörter zählen',
      level: 1,
      description: `Implementiere:

\`\`\`csharp
public static Dictionary<string, int> CountWords(IEnumerable<string>? words)
\`\`\`

- \`null\` als Eingabe → leeres Dictionary (nicht werfen)
- Einträge, die \`null\`, leer oder nur Leerzeichen sind, werden übersprungen
- Schlüssel: der Wert **getrimmt und klein geschrieben** (\`ToLowerInvariant()\`)
- Wert: wie oft das Wort vorkam

Nutze \`TryGetValue\` – kein \`ContainsKey\` + Indexer.`,
      starter: `public static class Solution
{
    public static Dictionary<string, int> CountWords(IEnumerable<string>? words)
    {
        // TODO
        return new Dictionary<string, int>();
    }
}`,
      solution: `public static class Solution
{
    public static Dictionary<string, int> CountWords(IEnumerable<string>? words)
    {
        var counts = new Dictionary<string, int>();
        if (words is null)
        {
            return counts;
        }

        foreach (var word in words)
        {
            if (string.IsNullOrWhiteSpace(word))
            {
                continue;
            }

            var key = word.Trim().ToLowerInvariant();
            counts.TryGetValue(key, out var current);
            counts[key] = current + 1;
        }

        return counts;
    }
}`,
      hints: [
        'Ein Dictionary anlegen, die Eingabe einmal durchlaufen und pro gueltigem Wort den Zaehler erhoehen.',
        '`string.IsNullOrWhiteSpace`, `Trim()`, `ToLowerInvariant()`, `TryGetValue(key, out var current)`, Indexer zum Schreiben.',
        'null-Check → foreach → ungueltige ueberspringen → key normalisieren → TryGetValue → counts[key] = current + 1.',
        '`counts.TryGetValue(key, out var current);` liefert bei fehlendem Key `0` in `current` – genau der gewuenschte Startwert.',
      ],
      tests: `            var result = Solution.CountWords(new[] { "Java", "java", " C# ", "C#", "C#", "   " });
            Check("Anzahl Schluessel", 2, result.Count);
            Check("java gezaehlt", 2, result.GetValueOrDefault("java", -1));
            Check("c# gezaehlt", 3, result.GetValueOrDefault("c#", -1));
            Check("komplett", new Dictionary<string, int> { ["java"] = 2, ["c#"] = 3 }, result);
            CheckTrue("unbekannter Key fehlt", !result.ContainsKey("python"));
            Check("null-Eingabe", new Dictionary<string, int>(), Solution.CountWords(null));
            Check("leere Eingabe", new Dictionary<string, int>(), Solution.CountWords(new List<string>()));
            Check("nur Leerzeichen", new Dictionary<string, int>(), Solution.CountWords(new[] { "  ", "" }));`,
    },
    {
      id: 'k2',
      title: 'Lookup mit Fallback und Merge',
      level: 2,
      description: `Implementiere zwei Methoden:

\`\`\`csharp
public static List<string> ResolveNames(Dictionary<long, string> namesById, IEnumerable<long> ids)
public static Dictionary<string, int> Merge(Dictionary<string, int> first, Dictionary<string, int> second)
\`\`\`

\`ResolveNames\`: für jede ID den Namen, in derselben Reihenfolge. Fehlt die ID → \`"unbekannt(42)"\` mit der ID darin.

\`Merge\`: beide Dictionaries zusammenführen, bei gleichem Schlüssel die Werte **addieren**. Die übergebenen Dictionaries dürfen **nicht** verändert werden.`,
      starter: `public static class Solution
{
    public static List<string> ResolveNames(Dictionary<long, string> namesById, IEnumerable<long> ids)
    {
        // TODO
        return new List<string>();
    }

    public static Dictionary<string, int> Merge(Dictionary<string, int> first, Dictionary<string, int> second)
    {
        // TODO
        return new Dictionary<string, int>();
    }
}`,
      solution: `public static class Solution
{
    public static List<string> ResolveNames(Dictionary<long, string> namesById, IEnumerable<long> ids)
    {
        var result = new List<string>();
        foreach (var id in ids)
        {
            result.Add(namesById.TryGetValue(id, out var name) ? name : $"unbekannt({id})");
        }

        return result;
    }

    public static Dictionary<string, int> Merge(Dictionary<string, int> first, Dictionary<string, int> second)
    {
        var merged = new Dictionary<string, int>(first);
        foreach (var (key, value) in second)
        {
            merged[key] = merged.GetValueOrDefault(key) + value;
        }

        return merged;
    }
}`,
      hints: [
        'Beide Methoden bauen ein neues Ergebnis auf. Nichts an den Eingaben veraendern – sonst ueberraschst du den Aufrufer.',
        '`TryGetValue(.., out var name)` mit Ternary, `new Dictionary<..>(first)` als Kopier-Konstruktor, `GetValueOrDefault(key)`.',
        'ResolveNames: foreach ueber ids → TryGetValue → Name oder $"unbekannt({id})". Merge: Kopie von first → foreach ueber second → merged[key] = alt + neu.',
        '`foreach (var (key, value) in second) merged[key] = merged.GetValueOrDefault(key) + value;`',
      ],
      tests: `            var byId = new Dictionary<long, string> { [1L] = "Jan", [2L] = "Anna" };
            Check("bekannte IDs", new List<string> { "Jan", "Anna" }, Solution.ResolveNames(byId, new long[] { 1, 2 }));
            Check("fehlender Key", new List<string> { "Jan", "unbekannt(9)" }, Solution.ResolveNames(byId, new long[] { 1, 9 }));
            Check("Reihenfolge und Duplikate", new List<string> { "Anna", "Anna", "Jan" }, Solution.ResolveNames(byId, new long[] { 2, 2, 1 }));
            Check("leere ID-Liste", new List<string>(), Solution.ResolveNames(byId, new List<long>()));

            var a = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
            var b = new Dictionary<string, int> { ["b"] = 3, ["c"] = 4 };
            Check("gemerged", new Dictionary<string, int> { ["a"] = 1, ["b"] = 5, ["c"] = 4 }, Solution.Merge(a, b));
            Check("erstes Dictionary unveraendert", 2, a.GetValueOrDefault("b", -1));
            Check("zweites Dictionary unveraendert", 2, b.Count);
            Check("Merge mit leerem Dictionary", new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 }, Solution.Merge(a, new Dictionary<string, int>()));`,
    },
    {
      id: 'k3',
      title: 'HashSet und eigener Vergleich',
      level: 3,
      description: `Implementiere drei Methoden – **ohne LINQ**, mit Collections und \`List.Sort\`:

\`\`\`csharp
public static List<string> Unique(IEnumerable<string> items)
public static List<string> Common(IEnumerable<string> first, IEnumerable<string> second)
public static List<string> SortByLengthThenAlpha(IEnumerable<string> items)
\`\`\`

- \`Unique\`: Duplikate entfernen, **ursprüngliche Reihenfolge erhalten** (\`HashSet\` als "gesehen"-Merker)
- \`Common\`: Elemente, die in beiden vorkommen – ohne Duplikate, ordinal aufsteigend sortiert
- \`SortByLengthThenAlpha\`: nach Länge aufsteigend, bei gleicher Länge ordinal alphabetisch. Die **Eingabe darf nicht verändert** werden.`,
      starter: `public static class Solution
{
    public static List<string> Unique(IEnumerable<string> items)
    {
        // TODO
        return new List<string>();
    }

    public static List<string> Common(IEnumerable<string> first, IEnumerable<string> second)
    {
        // TODO
        return new List<string>();
    }

    public static List<string> SortByLengthThenAlpha(IEnumerable<string> items)
    {
        // TODO
        return new List<string>();
    }
}`,
      solution: `public static class Solution
{
    public static List<string> Unique(IEnumerable<string> items)
    {
        var seen = new HashSet<string>();
        var result = new List<string>();
        foreach (var item in items)
        {
            if (seen.Add(item))
            {
                result.Add(item);
            }
        }

        return result;
    }

    public static List<string> Common(IEnumerable<string> first, IEnumerable<string> second)
    {
        var lookup = new HashSet<string>(second);
        var result = new List<string>();
        var added = new HashSet<string>();
        foreach (var item in first)
        {
            if (lookup.Contains(item) && added.Add(item))
            {
                result.Add(item);
            }
        }

        result.Sort(StringComparer.Ordinal);
        return result;
    }

    public static List<string> SortByLengthThenAlpha(IEnumerable<string> items)
    {
        var sorted = new List<string>(items);
        sorted.Sort((left, right) =>
        {
            var byLength = left.Length.CompareTo(right.Length);
            return byLength != 0 ? byLength : string.CompareOrdinal(left, right);
        });

        return sorted;
    }
}`,
      hints: [
        '`HashSet.Add` liefert `false`, wenn das Element schon drin war – damit filterst du Duplikate, ohne die Reihenfolge zu verlieren.',
        '`new HashSet<string>(second)` fuer schnelle Contains-Pruefungen, `List.Sort(Comparison<T>)`, `string.CompareOrdinal`, `StringComparer.Ordinal`.',
        'Unique: seen-Set + Ergebnisliste. Common: Set aus second + zweites Set gegen Duplikate + am Ende sortieren. SortByLengthThenAlpha: Kopie anlegen, dann Sort mit Laenge und Fallback.',
        '`sorted.Sort((l, r) => { var byLength = l.Length.CompareTo(r.Length); return byLength != 0 ? byLength : string.CompareOrdinal(l, r); });`',
      ],
      tests: `            Check("Unique erhaelt Reihenfolge", new List<string> { "b", "a", "c" }, Solution.Unique(new[] { "b", "a", "b", "c", "a" }));
            Check("Unique leer", new List<string>(), Solution.Unique(new List<string>()));
            Check("Unique ohne Duplikate", new List<string> { "x", "y" }, Solution.Unique(new[] { "x", "y" }));

            Check("Common sortiert", new List<string> { "a", "c" }, Solution.Common(new[] { "c", "a", "d" }, new[] { "a", "b", "c" }));
            Check("Common ohne Schnittmenge", new List<string>(), Solution.Common(new[] { "x" }, new[] { "y" }));
            Check("Common ohne Duplikate", new List<string> { "a" }, Solution.Common(new[] { "a", "a" }, new[] { "a" }));

            Check("nach Laenge, dann alphabetisch", new List<string> { "ab", "cd", "abc" }, Solution.SortByLengthThenAlpha(new[] { "abc", "cd", "ab" }));
            Check("Sortierung leer", new List<string>(), Solution.SortByLengthThenAlpha(new List<string>()));

            var original = new List<string> { "bbb", "a" };
            Solution.SortByLengthThenAlpha(original);
            Check("Eingabe unveraendert", new List<string> { "bbb", "a" }, original);`,
    },
    {
      id: 'k4',
      title: 'Stack und Queue im Einsatz',
      level: 4,
      description: `Implementiere:

\`\`\`csharp
public static bool IsBalanced(string? text)
public static IReadOnlyList<string> RoundRobin(IEnumerable<string> workers, int tasks)
\`\`\`

\`IsBalanced\` (\`Stack<char>\`): Prüft \`()\`, \`[]\` und \`{}\` auf korrekte Verschachtelung. Alle anderen Zeichen werden ignoriert. \`null\` und leerer String gelten als balanciert.

\`RoundRobin\` (\`Queue<string>\`): Verteilt \`tasks\` Aufgaben reihum auf die Worker und gibt die Zuordnung in Reihenfolge zurück – \`(["a","b"], 3)\` → \`["a", "b", "a"]\`.
- \`tasks < 0\` → \`ArgumentOutOfRangeException\`
- keine Worker → \`ArgumentException\``,
      starter: `public static class Solution
{
    public static bool IsBalanced(string? text)
    {
        // TODO
        return false;
    }

    public static IReadOnlyList<string> RoundRobin(IEnumerable<string> workers, int tasks)
    {
        // TODO
        return new List<string>();
    }
}`,
      solution: `public static class Solution
{
    private static readonly Dictionary<char, char> ClosingToOpening = new()
    {
        [')'] = '(',
        [']'] = '[',
        ['}'] = '{',
    };

    public static bool IsBalanced(string? text)
    {
        if (string.IsNullOrEmpty(text))
        {
            return true;
        }

        var open = new Stack<char>();
        foreach (var c in text)
        {
            if (c is '(' or '[' or '{')
            {
                open.Push(c);
            }
            else if (ClosingToOpening.TryGetValue(c, out var expected))
            {
                if (!open.TryPop(out var actual) || actual != expected)
                {
                    return false;
                }
            }
        }

        return open.Count == 0;
    }

    public static IReadOnlyList<string> RoundRobin(IEnumerable<string> workers, int tasks)
    {
        if (tasks < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(tasks), "Aufgaben duerfen nicht negativ sein");
        }

        var queue = new Queue<string>(workers);
        if (queue.Count == 0)
        {
            throw new ArgumentException("mindestens ein Worker noetig", nameof(workers));
        }

        var result = new List<string>(tasks);
        for (var i = 0; i < tasks; i++)
        {
            var worker = queue.Dequeue();
            result.Add(worker);
            queue.Enqueue(worker);
        }

        return result;
    }
}`,
      hints: [
        'Klammern sind LIFO: die zuletzt geoeffnete muss zuerst geschlossen werden – das ist genau ein Stack. Round Robin ist FIFO – das ist eine Queue.',
        '`Stack.Push`, `Stack.TryPop(out var c)`, `Stack.Count`, `new Queue<string>(workers)`, `Dequeue()` + `Enqueue()` im selben Schritt.',
        'IsBalanced: oeffnende pushen, bei schliessender die erwartete oeffnende nachschlagen und poppen; am Ende muss der Stack leer sein. RoundRobin: Guards, dann tasks-mal dequeue/add/enqueue.',
        '`if (!open.TryPop(out var actual) || actual != expected) return false;`',
      ],
      tests: `            CheckTrue("einfach balanciert", Solution.IsBalanced("({[]})"));
            CheckTrue("leerer String", Solution.IsBalanced(""));
            CheckTrue("null", Solution.IsBalanced(null));
            CheckTrue("Text dazwischen", Solution.IsBalanced("a(b[c]d){e}"));
            CheckTrue("falsche Verschachtelung", !Solution.IsBalanced("([)]"));
            CheckTrue("zu viele offene", !Solution.IsBalanced("(()"));
            CheckTrue("zu viele geschlossene", !Solution.IsBalanced("())"));
            CheckTrue("falscher Typ", !Solution.IsBalanced("(]"));

            Check("reihum verteilt", new List<string> { "a", "b", "c", "a", "b" }, Solution.RoundRobin(new[] { "a", "b", "c" }, 5));
            Check("keine Aufgaben", new List<string>(), Solution.RoundRobin(new[] { "a" }, 0));
            Check("ein Worker", new List<string> { "a", "a" }, Solution.RoundRobin(new[] { "a" }, 2));
            CheckThrows<ArgumentException>("keine Worker", () => Solution.RoundRobin(new List<string>(), 3));
            CheckThrows<ArgumentOutOfRangeException>("negative Aufgabenzahl", () => Solution.RoundRobin(new[] { "a" }, -1));`,
    },
  ],
}

export default chapter
