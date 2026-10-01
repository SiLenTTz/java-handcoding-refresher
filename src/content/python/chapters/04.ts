import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    { id: 'f1', front: 'Aufbau einer List-Comprehension?', back: '`[ausdruck for element in quelle if bedingung]` – der Ausdruck **mappt**, das `if` am Ende **filtert**. Sie ersetzt die Schleife, die nur eine Liste befüllt.' },
    { id: 'f2', front: 'Wo steht das `if` beim Filtern, wo beim Ersetzen?', back: 'Filtern (kein `else` erlaubt): `[n for n in xs if n > 0]`.\nErsetzen (ternär, `else` Pflicht): `[n if n > 0 else 0 for n in xs]`.\nMerksatz: vorne entscheidet über den *Wert*, hinten über das *Ob*.' },
    { id: 'f3', front: 'Set- und Dict-Comprehension?', back: '```python\n{w.lower() for w in words}          # set, dedupliziert\n{u.id: u.name for u in users}        # dict\n{k: v for k, v in d.items() if v}    # gefiltertes dict\n```' },
    { id: 'f4', front: 'Wie flattest du `[[1, 2], [3]]` zu `[1, 2, 3]`?', back: '`[x for row in matrix for x in row]` – die `for`-Klauseln stehen in derselben Reihenfolge wie geschachtelte Schleifen. Alternative: `list(chain.from_iterable(matrix))`.' },
    { id: 'f5', front: 'Unterschied `[...]` und `(...)`?', back: '`[n for n in xs]` baut sofort die komplette Liste (eager, O(n) Speicher). `(n for n in xs)` ist ein **Generator-Ausdruck**: lazy, O(1) Speicher, einmal verwendbar, kein `len()` und kein Index-Zugriff.' },
    { id: 'f6', front: 'Was macht `yield` mit einer Funktion?', back: 'Sie wird zur **Generatorfunktion**: Der Aufruf führt keinen Code aus, sondern liefert ein Generator-Objekt. Der Rumpf läuft erst beim ersten `next()` und pausiert bei jedem `yield`.' },
    { id: 'f7', front: 'Warum `sum(x.amount for x in items)` statt `sum([...])`?', back: 'Der Generator erzeugt keine Zwischenliste – konstanter Speicher statt O(n). Bei einem einzigen Argument dürfen die Klammern des Generators entfallen.' },
    { id: 'f8', front: 'Wie holst du sicher das erste passende Element?', back: '`next((u for u in users if u.is_admin), None)` – der zweite Parameter ist der Default. Ohne ihn wirft `next` bei leerem Generator `StopIteration`.' },
    { id: 'f9', front: '`any` / `all` auf einem leeren Iterable?', back: '`any([])` → `False`, `all([])` → `True` (vacuous truth). Beide sind short-circuiting: sie konsumieren den Generator nur bis zur Entscheidung.' },
    { id: 'f10', front: 'Was passiert beim zweiten Durchlauf eines Generators?', back: 'Nichts – er ist erschöpft. `sum(gen)` gefolgt von `max(gen)` liefert `ValueError: max() arg is an empty sequence`. Wer mehrfach braucht, materialisiert in eine Liste.' },
    { id: 'f11', front: 'Wofür `islice` und `chain`?', back: '`islice(iterable, n)` ist Slicing für Iteratoren, ohne alles zu laden. `chain(a, b)` hängt Iterables aneinander, `chain.from_iterable(rows)` flattet eine Ebene.' },
    { id: 'f12', front: 'Worauf musst du bei `itertools.groupby` achten?', back: 'Es gruppiert nur **aufeinanderfolgende** gleiche Keys – die Daten müssen vorher nach demselben Key sortiert sein. Und `group` sofort mit `list(group)` auswerten, sonst ist sie beim Weiterlaufen leer.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `numbers = [1, 2, 3, 4]
print([n * n for n in numbers if n % 2 == 0])`,
      options: ['`[1, 4, 9, 16]`', '`[4, 16]`', '`[2, 4]`', '`[1, 9]`'],
      correct: 1,
      explanation: 'Erst filtert das `if` (2 und 4), dann quadriert der Ausdruck vorne → `[4, 16]`.',
    },
    {
      id: 'q2',
      prompt: 'Warum knallt das?',
      code: `numbers = [1, -2, 3]
print([n for n in numbers if n > 0 else 0])`,
      options: [
        '`TypeError` – `if` und `else` haben unterschiedliche Typen',
        '`SyntaxError` – das Filter-`if` am Ende darf kein `else` haben',
        'Gar nicht, das Ergebnis ist `[1, 0, 3]`',
        '`NameError` – `else` ist in Comprehensions nicht definiert',
      ],
      correct: 1,
      explanation: 'Das hintere `if` filtert nur und kennt kein `else`. Wer Werte ersetzen will, nimmt den ternären Ausdruck vorn: `[n if n > 0 else 0 for n in numbers]`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `gen = (n for n in [1, 2, 3])
print(sum(gen), sum(gen))`,
      options: ['`6 6`', '`6 0`', '`0 6`', '`StopIteration`'],
      correct: 1,
      explanation: 'Ein Generator ist nach einem Durchlauf erschöpft; der zweite `sum` sieht nichts mehr und liefert `0`. Für mehrfache Nutzung in eine Liste materialisieren.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `def gen():
    print("start")
    yield 1

g = gen()
print("erzeugt")
next(g)`,
      options: ['`start` dann `erzeugt`', '`erzeugt` dann `start`', 'nur `erzeugt`', 'nur `start`'],
      correct: 1,
      explanation: '`gen()` führt den Rumpf **nicht** aus, sondern erzeugt nur das Generator-Objekt. Erst `next(g)` startet den Code – deshalb erscheint `erzeugt` zuerst.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `matrix = [[1, 2], [3, 4]]
print([x for row in matrix for x in row])`,
      options: ['`[[1, 2], [3, 4]]`', '`[1, 2, 3, 4]`', '`[1, 3, 2, 4]`', '`NameError`'],
      correct: 1,
      explanation: 'Die `for`-Klauseln stehen in derselben Reihenfolge wie geschachtelte Schleifen: außen `row`, innen `x` → flache Liste. Umgedreht gäbe es einen `NameError`.',
    },
    {
      id: 'q6',
      prompt: 'Warum knallt das?',
      code: `users = [{"admin": False}, {"admin": False}]
first = next(u for u in users if u["admin"])`,
      options: [
        '`KeyError: \'admin\'`',
        '`StopIteration` – `next` ohne Default auf einem leeren Generator',
        '`TypeError` – `next` braucht eine Liste',
        'Gar nicht, `first` ist `None`',
      ],
      correct: 1,
      explanation: 'Kein Element passt, also ist der Generator sofort erschöpft. Mit Default ist es sicher: `next((u for u in users if u["admin"]), None)`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisch?',
      options: [
        '`total = sum([o.amount for o in orders])`',
        '`total = sum(o.amount for o in orders)`',
        '`total = 0` und danach `[total := total + o.amount for o in orders]`',
        '`total = reduce(lambda a, o: a + o.amount, orders, 0)`',
      ],
      correct: 1,
      explanation: 'Der Generator-Ausdruck spart die Zwischenliste und ist am lesbarsten. Variante 3 missbraucht eine Comprehension für einen Seiteneffekt, Variante 4 ist unnötig umständlich.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `print(any(n > 10 for n in []), all(n > 10 for n in []))`,
      options: ['`False True`', '`True False`', '`False False`', '`True True`'],
      correct: 0,
      explanation: 'Auf der leeren Menge gibt es kein Gegenbeispiel: `all` ist `True` (vacuous truth), `any` findet keinen Treffer und ist `False`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Quadrate der geraden Zahlen',
      level: 1,
      description: `Implementiere \`even_squares(numbers: list[int]) -> list[int]\`:

- behalte nur die **geraden** Zahlen
- gib deren Quadrate in ursprünglicher Reihenfolge zurück

Löse das mit **einer** List-Comprehension, ohne \`append\`.

Beispiel: \`even_squares([1, 2, 3, 4])\` → \`[4, 16]\``,
      starter: `def even_squares(numbers: list[int]) -> list[int]:
    # TODO
    return []`,
      solution: `def even_squares(numbers: list[int]) -> list[int]:
    return [n * n for n in numbers if n % 2 == 0]`,
      hints: [
        'Zwei Dinge in einem Ausdruck: filtern (gerade) und transformieren (quadrieren).',
        'Der Filter gehört ans Ende (`if n % 2 == 0`), die Transformation nach vorn.',
        '[quadrat for zahl in numbers if zahl gerade]',
        '`return [n * n for n in numbers if n % 2 == 0]`',
      ],
      tests: `check("Standardfall", [4, 16], even_squares([1, 2, 3, 4]))
check("leer", [], even_squares([]))
check("nur ungerade", [], even_squares([1, 3, 5]))
check("Null ist gerade", [0], even_squares([0, 1]))
check("negative Zahlen", [4, 16], even_squares([-2, -3, -4]))
check("Reihenfolge bleibt", [16, 4], even_squares([4, 2]))`,
    },
    {
      id: 'k2',
      title: 'Index aus Datensätzen bauen',
      level: 2,
      description: `Gegeben ist eine Liste von Dicts, z. B. aus einer JSON-Antwort.

Implementiere \`index_by_id(records: list[dict]) -> dict[int, str]\`:

- Key ist \`record["id"]\`, Value ist \`record["name"]\`
- Datensätze, denen \`"id"\` **oder** \`"name"\` fehlt, werden übersprungen
- bei doppelter \`id\` gewinnt der **letzte** Datensatz

Löse das mit **einer** Dict-Comprehension.`,
      starter: `def index_by_id(records: list[dict]) -> dict[int, str]:
    # TODO
    return {}`,
      solution: `def index_by_id(records: list[dict]) -> dict[int, str]:
    return {r["id"]: r["name"] for r in records if "id" in r and "name" in r}`,
      hints: [
        'Eine Dict-Comprehension hat die Form `{key_ausdruck: value_ausdruck for ... if ...}`.',
        'Die Vollständigkeitsprüfung gehört in das `if` am Ende: `"id" in r and "name" in r`.',
        '{r["id"]: r["name"] für jeden Datensatz r, sofern beide Keys vorhanden sind}',
        '`return {r["id"]: r["name"] for r in records if "id" in r and "name" in r}`',
      ],
      tests: `rows = [{"id": 1, "name": "Anna"}, {"id": 2, "name": "Bo"}]
check("Standardfall", {1: "Anna", 2: "Bo"}, index_by_id(rows))
check("leer", {}, index_by_id([]))
check("unvollstaendige Datensaetze raus", {1: "Anna"}, index_by_id([{"id": 1, "name": "Anna"}, {"id": 2}, {"name": "X"}]))
check("letzter gewinnt", {1: "Neu"}, index_by_id([{"id": 1, "name": "Alt"}, {"id": 1, "name": "Neu"}]))
check("alles unvollstaendig", {}, index_by_id([{}, {"name": "X"}]))
check_true("Rueckgabe ist ein dict", isinstance(index_by_id(rows), dict))`,
    },
    {
      id: 'k3',
      title: 'Laufende Summe als Generator',
      level: 3,
      description: `Implementiere \`running_total(numbers: Iterable[int]) -> Iterator[int]\` als **Generatorfunktion** mit \`yield\`:

- liefert nach jedem Element die Summe aller bisherigen Elemente
- bei leerer Quelle wird nichts geliefert
- es darf **keine** Zwischenliste aufgebaut werden – die Werte kommen einzeln

Beispiel: \`list(running_total([1, 2, 3]))\` → \`[1, 3, 6]\``,
      starter: `def running_total(numbers: Iterable[int]) -> Iterator[int]:
    # TODO
    return iter([])`,
      solution: `def running_total(numbers: Iterable[int]) -> Iterator[int]:
    total = 0
    for number in numbers:
        total += number
        yield total`,
      hints: [
        'Du brauchst einen Akkumulator, der zwischen den Elementen erhalten bleibt – genau das kann ein Generator.',
        'Ein einziges `yield` im Schleifenrumpf macht die Funktion zur Generatorfunktion; `return` entfällt.',
        'total = 0; für jede Zahl: total erhöhen und total yielden',
        '`total = 0`\n`for number in numbers:`\n`    total += number`\n`    yield total`',
      ],
      tests: `check("Standardfall", [1, 3, 6], list(running_total([1, 2, 3])))
check("leer", [], list(running_total([])))
check("negative Zahlen", [5, 2, 2], list(running_total([5, -3, 0])))
check("ein Element", [7], list(running_total([7])))
check("Generator als Quelle", [0, 1, 3], list(running_total(n for n in range(3))))
check("erstes Element ohne alles zu ziehen", 1, next(running_total([1, 2, 3])))`,
    },
    {
      id: 'k4',
      title: 'Lazy Batches bilden',
      level: 4,
      description: `Implementiere \`paginate(items: Iterable[Any], size: int) -> Iterator[list[Any]]\`:

- liefert die Elemente in Blöcken der Länge \`size\` als Listen
- der letzte Block darf kürzer sein, leere Blöcke gibt es nicht
- die Quelle darf ein beliebiges Iterable sein – auch ein Generator, der nicht komplett in den Speicher passt
- \`size <= 0\` führt zu einem \`ValueError\`

Beispiel: \`list(paginate([1, 2, 3], 2))\` → \`[[1, 2], [3]]\`

Tipp: \`islice\` ist bereits importiert. Es funktioniert auf Iteratoren und holt nur so viele Elemente, wie du anforderst.`,
      starter: `def paginate(items: Iterable[Any], size: int) -> Iterator[list[Any]]:
    # TODO
    return iter([])`,
      solution: `def paginate(items: Iterable[Any], size: int) -> Iterator[list[Any]]:
    if size <= 0:
        raise ValueError("size muss groesser als 0 sein")
    iterator = iter(items)
    while True:
        batch = list(islice(iterator, size))
        if not batch:
            return
        yield batch`,
      hints: [
        'Hol dir mit `iter(items)` einen echten Iterator – nur so merkt sich die Quelle, wie weit du schon gelesen hast.',
        '`list(islice(iterator, size))` zieht bis zu `size` Elemente. Ist das Ergebnis leer, ist die Quelle erschöpft.',
        'validieren; iterator = iter(items); in einer Endlosschleife einen Batch ziehen, bei leerem Batch beenden, sonst yielden',
        '`iterator = iter(items)`\n`while True:`\n`    batch = list(islice(iterator, size))`\n`    if not batch:`\n`        return`\n`    yield batch`',
      ],
      tests: `check("glatt teilbar", [[1, 2], [3, 4]], list(paginate([1, 2, 3, 4], 2)))
check("mit Rest", [[1, 2], [3]], list(paginate([1, 2, 3], 2)))
check("size 1", [[1], [2]], list(paginate([1, 2], 1)))
check("size groesser als Quelle", [[1, 2]], list(paginate([1, 2], 5)))
check("leere Quelle", [], list(paginate([], 3)))
check("Generator als Quelle", [[0, 1], [2, 3], [4]], list(paginate((n for n in range(5)), 2)))
check_raises("size 0", ValueError, lambda: list(paginate([1], 0)))
check_raises("size negativ", ValueError, lambda: list(paginate([1], -1)))`,
    },
  ],
}

export default chapter
