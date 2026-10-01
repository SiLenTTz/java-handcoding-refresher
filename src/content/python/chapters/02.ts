import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    { id: 'f1', front: 'Wann `list`, wann `tuple`, wann `set`?', back: '`list` = geordnet und veränderlich (Arbeitsliste). `tuple` = feste Struktur, unveränderlich, hashbar (Datensatz, Rückgabewerte, Dict-Keys). `set` = ungeordnet und eindeutig (Mengenfragen, schnelles `in`).' },
    { id: 'f2', front: 'Unterschied `xs.sort()` und `sorted(xs)`?', back: '`xs.sort()` sortiert **in-place** und gibt `None` zurück (nur für Listen). `sorted(xs)` nimmt jedes Iterable, lässt das Original in Ruhe und liefert immer eine neue `list`.' },
    { id: 'f3', front: 'Nach Punktzahl absteigend, bei Gleichstand nach Name aufsteigend?', back: '```python\nsorted(rows, key=lambda r: (-r.score, r.name))\n```\nTupel-Key: Vorzeichen dreht numerische Kriterien einzeln um. `reverse=True` würde **beide** Kriterien drehen.' },
    { id: 'f4', front: 'Warum ist `sorted` stabil – und was bringt das?', back: 'Elemente mit gleichem Key behalten ihre ursprüngliche Reihenfolge (Timsort). Damit kannst du mehrstufig sortieren: erst nach dem Nebenkriterium, dann nach dem Hauptkriterium.' },
    { id: 'f5', front: 'Was ist an `one = ("a")` falsch?', back: 'Das ist ein `str` – die Klammern gruppieren nur. Das **Komma** macht das Tupel: `one = ("a",)`. Ebenso ist `point = 3, 4` bereits ein Tupel.' },
    { id: 'f6', front: 'Wie dedupliziert man unter Beibehaltung der Reihenfolge?', back: '`list(dict.fromkeys(items))` – Dicts behalten die Einfügereihenfolge. `list(set(items))` dedupliziert zwar, die Reihenfolge ist aber nicht definiert.' },
    { id: 'f7', front: 'Die vier Set-Operatoren?', back: '`a | b` Vereinigung, `a & b` Schnitt, `a - b` Differenz (nur in a), `a ^ b` symmetrische Differenz (in genau einem von beiden).' },
    { id: 'f8', front: 'Warum ist `x in liste` langsam und `x in set` schnell?', back: 'Die Liste prüft linear Element für Element – O(n). Das Set berechnet den Hash und springt direkt in den Bucket – O(1). Steht `in` in einer Schleife, vorher ein `set` bauen.' },
    { id: 'f9', front: 'Flache vs. tiefe Kopie?', back: '`list(xs)`, `xs[:]`, `xs.copy()` kopieren nur die **äußere** Ebene – verschachtelte Objekte bleiben geteilt. Für echte Eigenständigkeit `copy.deepcopy(xs)`.' },
    { id: 'f10', front: 'Was ist an `grid = [[0] * 3] * 2` falsch?', back: 'Der äußere `* 2` kopiert nur die **Referenz** – beide Zeilen sind dieselbe Liste. Richtig: `grid = [[0] * 3 for _ in range(2)]`.' },
    { id: 'f11', front: 'Welche Elemente dürfen in ein `set` (oder als Dict-Key)?', back: 'Nur hashbare, also unveränderliche: `str`, `int`, `tuple` (mit hashbarem Inhalt), `frozenset`, Enum. `list`, `dict`, `set` → `TypeError: unhashable type`.' },
    { id: 'f12', front: 'Wie entfernst du sicher ein Element aus einem Set?', back: '`s.discard(x)` – tut nichts, wenn `x` fehlt. `s.remove(x)` wirft dagegen `KeyError`. Bei Listen: `xs.remove(x)` wirft `ValueError`, wenn das Element fehlt.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `xs = [3, 1, 2]
print(xs.sort())`,
      options: ['`[1, 2, 3]`', '`None`', '`[3, 1, 2]`', '`TypeError`'],
      correct: 1,
      explanation: '`list.sort()` sortiert in-place und gibt `None` zurück. Wer das Ergebnis braucht, nimmt `sorted(xs)`.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `grid = [[0] * 3] * 2
grid[0][0] = 1
print(grid)`,
      options: ['`[[1, 0, 0], [0, 0, 0]]`', '`[[1, 0, 0], [1, 0, 0]]`', '`[[1, 1, 1], [0, 0, 0]]`', '`TypeError`'],
      correct: 1,
      explanation: '`* 2` dupliziert die **Referenz** auf dieselbe innere Liste. Richtig: `[[0] * 3 for _ in range(2)]`.',
    },
    {
      id: 'q3',
      prompt: 'Welche Reihenfolge entsteht?',
      code: `rows = [("bo", 7), ("anna", 7), ("cy", 3)]
print([n for n, _ in sorted(rows, key=lambda r: (-r[1], r[0]))])`,
      options: ['`[\'bo\', \'anna\', \'cy\']`', '`[\'anna\', \'bo\', \'cy\']`', '`[\'cy\', \'anna\', \'bo\']`', '`[\'cy\', \'bo\', \'anna\']`'],
      correct: 1,
      explanation: 'Der Tupel-Key sortiert zuerst nach `-score` (7 vor 3) und bei Gleichstand nach Name aufsteigend → `anna` vor `bo`.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `original = [[1], [2]]
copy_of_it = list(original)
copy_of_it[0].append(99)
print(original)`,
      options: ['`[[1], [2]]`', '`[[1, 99], [2]]`', '`[[99], [2]]`', '`[[1], [2], [99]]`'],
      correct: 1,
      explanation: '`list(original)` ist eine **flache** Kopie: die äußere Liste ist neu, die inneren Listen sind dieselben Objekte. Für Unabhängigkeit `copy.deepcopy`.',
    },
    {
      id: 'q5',
      prompt: 'Warum knallt das?',
      code: `seen = {[1, 2], [3]}`,
      options: [
        'Sets dürfen nur Zahlen enthalten',
        '`TypeError: unhashable type: \'list\'` – Set-Elemente müssen hashbar sein',
        'Die geschweiften Klammern erzeugen ein Dict, dem die Werte fehlen',
        'Gar nicht, `seen` ist ein Set mit zwei Listen',
      ],
      correct: 1,
      explanation: 'Sets brauchen einen stabilen Hash. Listen sind veränderlich und damit unhashbar – `{(1, 2), (3,)}` mit Tupeln funktioniert.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `xs = [0, 1, 2, 3, 4, 5]
print(xs[1:4], xs[-2:], xs[::2])`,
      options: [
        '`[1, 2, 3] [4, 5] [0, 2, 4]`',
        '`[1, 2, 3, 4] [4, 5] [0, 2, 4]`',
        '`[1, 2, 3] [3, 4] [1, 3, 5]`',
        '`[0, 1, 2, 3] [4, 5] [0, 2, 4]`',
      ],
      correct: 0,
      explanation: 'Das Ende eines Slices ist exklusiv, negative Indizes zählen von hinten, der dritte Wert ist die Schrittweite.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisch und schnell, wenn `a` und `b` je 100.000 Einträge haben?',
      options: [
        '`[x for x in a if x in b]`',
        '`b_set = set(b)` und dann `[x for x in a if x in b_set]`',
        '`[x for x in a for y in b if x == y]`',
        '`list(filter(lambda x: b.count(x) > 0, a))`',
      ],
      correct: 1,
      explanation: '`in` auf einer Liste ist O(n) – in der Schleife ergibt das O(n²). Einmal ein `set` bauen macht die Prüfung O(1). Noch kürzer bei egaler Reihenfolge: `sorted(set(a) & set(b))`.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `a = {1, 2, 3}
b = {3, 4}
print(sorted(a - b), sorted(a ^ b))`,
      options: ['`[1, 2] [1, 2, 4]`', '`[3] [1, 2, 4]`', '`[1, 2] [3]`', '`[4] [1, 2, 3, 4]`'],
      correct: 0,
      explanation: '`a - b` sind die Elemente nur aus `a` → `{1, 2}`. `a ^ b` sind die Elemente, die in genau einem der Sets stecken → `{1, 2, 4}`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Top-N ohne Nebenwirkung',
      level: 1,
      description: `Implementiere \`top_n(numbers: list[int], n: int) -> list[int]\`:

- liefert die \`n\` größten Zahlen, **absteigend** sortiert
- die übergebene Liste darf dabei **nicht** verändert werden
- ist \`n\` größer als die Liste, kommen einfach alle Zahlen zurück`,
      starter: `def top_n(numbers: list[int], n: int) -> list[int]:
    # TODO
    return []`,
      solution: `def top_n(numbers: list[int], n: int) -> list[int]:
    return sorted(numbers, reverse=True)[:n]`,
      hints: [
        '`sort()` würde das Original verändern – du brauchst die Variante, die eine neue Liste liefert.',
        '`sorted(..., reverse=True)` plus ein Slice `[:n]`. Slices sind tolerant gegenüber zu großen Grenzen.',
        'neue absteigend sortierte Liste bauen, davon die ersten n Elemente zurückgeben',
        '`return sorted(numbers, reverse=True)[:n]`',
      ],
      tests: `values = [3, 9, 1, 9, 5]
check("top 2", [9, 9], top_n(values, 2))
check("Original unveraendert", [3, 9, 1, 9, 5], values)
check("n groesser als Liste", [9, 9, 5, 3, 1], top_n(values, 10))
check("n = 0", [], top_n(values, 0))
check("leere Liste", [], top_n([], 3))
check("negative Zahlen", [-1, -4], top_n([-4, -1, -7], 2))`,
    },
    {
      id: 'k2',
      title: 'Duplikate raus, Reihenfolge bleibt',
      level: 2,
      description: `Implementiere \`unique(items: list[str]) -> list[str]\`:

- entfernt Duplikate
- die Reihenfolge des **ersten** Vorkommens bleibt erhalten
- die Prüfung "schon gesehen?" muss O(1) sein – also über ein \`set\`, nicht über \`in liste\``,
      starter: `def unique(items: list[str]) -> list[str]:
    # TODO
    return []`,
      solution: `def unique(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result`,
      hints: [
        'Du brauchst zwei Container: einen für das Ergebnis (Reihenfolge) und einen fürs Nachschlagen (Eindeutigkeit).',
        '`set.add`, `in` auf dem Set, `list.append` auf dem Ergebnis. Alternative in einer Zeile: `list(dict.fromkeys(items))`.',
        'seen = leeres Set, result = leere Liste; pro Element: wenn nicht in seen → zu seen und result hinzufügen',
        '`seen: set[str] = set()`\n`for item in items:`\n`    if item not in seen:`\n`        ...`',
      ],
      tests: `check("Duplikate mittendrin", ["a", "b", "c"], unique(["a", "b", "a", "c", "b"]))
check("Reihenfolge bleibt", ["z", "a"], unique(["z", "a", "z"]))
check("leer", [], unique([]))
check("alles gleich", ["a"], unique(["a", "a", "a"]))
check("nichts zu tun", ["a", "b"], unique(["a", "b"]))
check_true("Rueckgabe ist eine Liste", isinstance(unique(["a"]), list))`,
    },
    {
      id: 'k3',
      title: 'Rangliste sortieren',
      level: 3,
      description: `Gegeben sind Ergebnisse als Tupel \`(name, punkte)\`.

Implementiere \`ranking(rows: list[tuple[str, int]]) -> list[str]\`:

- Punkte **absteigend**
- bei Gleichstand Name **aufsteigend** (alphabetisch)
- Rückgabe ist nur die Liste der Namen

Löse das mit **einem** \`sorted\`-Aufruf und einem Tupel-Key – nicht mit \`reverse=True\`.`,
      starter: `def ranking(rows: list[tuple[str, int]]) -> list[str]:
    # TODO
    return []`,
      solution: `def ranking(rows: list[tuple[str, int]]) -> list[str]:
    ordered = sorted(rows, key=lambda row: (-row[1], row[0]))
    return [name for name, _ in ordered]`,
      hints: [
        'Zwei Kriterien mit unterschiedlicher Richtung: `reverse=True` würde beide drehen.',
        'Ein Tupel als `key` vergleicht der Reihe nach. Für "absteigend" bei Zahlen genügt das Minuszeichen.',
        'sortieren mit key = (-punkte, name); danach nur die Namen herausziehen',
        '`ordered = sorted(rows, key=lambda row: (-row[1], row[0]))`',
      ],
      tests: `rows = [("bo", 7), ("anna", 7), ("cy", 3)]
check("Gleichstand alphabetisch", ["anna", "bo", "cy"], ranking(rows))
check("Original unveraendert", [("bo", 7), ("anna", 7), ("cy", 3)], rows)
check("leer", [], ranking([]))
check("einer", ["solo"], ranking([("solo", 1)]))
check("alle gleich", ["a", "b", "c"], ranking([("c", 5), ("a", 5), ("b", 5)]))
check("negative Punkte", ["a", "b"], ranking([("b", -3), ("a", 0)]))`,
    },
    {
      id: 'k4',
      title: 'Zwei Listen vergleichen',
      level: 4,
      description: `Implementiere \`diff(old: list[str], new: list[str]) -> tuple[list[str], list[str], list[str]]\`.

Rückgabe ist das Tupel \`(added, removed, common)\`:

- \`added\`: nur in \`new\`
- \`removed\`: nur in \`old\`
- \`common\`: in beiden

Jede Teilliste ist **alphabetisch sortiert** und duplikatfrei. Nutze Set-Operatoren, keine verschachtelten Schleifen.`,
      starter: `def diff(old: list[str], new: list[str]) -> tuple[list[str], list[str], list[str]]:
    # TODO
    return ([], [], [])`,
      solution: `def diff(old: list[str], new: list[str]) -> tuple[list[str], list[str], list[str]]:
    old_set = set(old)
    new_set = set(new)
    return sorted(new_set - old_set), sorted(old_set - new_set), sorted(old_set & new_set)`,
      hints: [
        'Drei Mengenfragen: "nur rechts", "nur links", "in beiden".',
        '`set(a) - set(b)` für die Differenz, `&` für den Schnitt. `sorted(...)` macht daraus eine stabile Liste.',
        'beide Listen in Sets wandeln; added = new - old, removed = old - new, common = old & new; jeweils sorted zurückgeben',
        '`old_set, new_set = set(old), set(new)`\n`return sorted(new_set - old_set), ...`',
      ],
      tests: `check("Standardfall", (["d"], ["a"], ["b", "c"]), diff(["a", "b", "c"], ["b", "c", "d"]))
check("beide leer", ([], [], []), diff([], []))
check("alles neu", (["a", "b"], [], []), diff([], ["b", "a"]))
check("alles weg", ([], ["a"], []), diff(["a", "a"], []))
check("Duplikate zusammengefasst", ([], [], ["x"]), diff(["x", "x"], ["x", "x", "x"]))
check("identisch", ([], [], ["a", "b"]), diff(["b", "a"], ["a", "b"]))`,
    },
  ],
}

export default chapter
