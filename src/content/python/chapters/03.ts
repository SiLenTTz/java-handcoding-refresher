import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    { id: 'f1', front: '`d[key]` vs. `d.get(key)`?', back: '`d[key]` wirft `KeyError`, wenn der Key fehlt – richtig für Pflichtfelder. `d.get(key)` liefert `None` (oder den übergebenen Default) – richtig für optionale Felder.' },
    { id: 'f2', front: 'Unterschied `get(k, default)` und `setdefault(k, default)`?', back: '`get` **liest** nur und ändert das Dict nicht. `setdefault` **schreibt** den Default ins Dict, falls der Key fehlt, und gibt den (jetzt vorhandenen) Wert zurück – ideal für `groups.setdefault(k, []).append(x)`.' },
    { id: 'f3', front: 'Wie gruppierst du eine Liste nach einem Schlüssel?', back: '```python\ngroups: defaultdict[str, list[str]] = defaultdict(list)\nfor user in users:\n    groups[user.role].append(user.name)\nreturn dict(groups)\n```\nNach außen ein normales `dict` zurückgeben.' },
    { id: 'f4', front: 'Fallstrick bei `defaultdict`?', back: 'Schon ein **Lesezugriff** auf einen fehlenden Key legt ihn an. `if stats["unbekannt"] > 0:` fügt den Key hinzu. Zum reinen Lesen `stats.get(k, 0)` nutzen.' },
    { id: 'f5', front: 'Was kann `Counter`?', back: '```python\nc = Counter(["a", "b", "a"])\nc["a"]            # 2\nc["zzz"]          # 0, kein KeyError\nc.most_common(2)  # [(\'a\', 2), (\'b\', 1)]\n```' },
    { id: 'f6', front: 'Wie iterierst du idiomatisch über ein Dict?', back: '`for key, value in d.items():`. `keys()`, `values()` und `items()` sind **Views** – sie kopieren nichts und spiegeln spätere Änderungen.' },
    { id: 'f7', front: 'Was prüft `"Jan" in user`?', back: 'Nur die **Keys**. Für Werte: `"Jan" in user.values()` (O(n)). Für Paare: `("name", "Jan") in user.items()`.' },
    { id: 'f8', front: 'Dict nach Wert absteigend sortieren, deterministisch?', back: '```python\nsorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))\n```\nDer Key als zweites Kriterium macht das Ergebnis bei Gleichstand eindeutig.' },
    { id: 'f9', front: 'Zwei Dicts mergen – welche Varianten gibt es?', back: '`a | b` (ab 3.9, neues Dict, rechts gewinnt), `{**a, **b}` (gleiche Semantik, ältere Schreibweise), `a.update(b)` (in-place, gibt `None` zurück), `a |= b` (in-place).' },
    { id: 'f10', front: 'Welche Objekte dürfen Dict-Keys sein?', back: 'Nur hashbare: `str`, `int`, `tuple` (mit hashbarem Inhalt), `frozenset`, Enum. `list` oder `dict` als Key → `TypeError: unhashable type`.' },
    { id: 'f11', front: 'Sicherer Zugriff auf verschachtelte Dicts?', back: '`config.get("db", {}).get("timeout", 30)` – das leere Dict als Zwischen-Default verhindert `AttributeError` auf `None`.' },
    { id: 'f12', front: 'Wie ersetzt ein Dict eine `if/elif`-Kette?', back: '```python\nHANDLERS = {"csv": parse_csv, "json": parse_json}\nhandler = HANDLERS.get(fmt)\nif handler is None:\n    raise ValueError(fmt)\nreturn handler(raw)\n```\nNeue Formate brauchen keine Änderung an `parse`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `user = {"id": 1}
print(user.get("name"), "id" in user, 1 in user)`,
      options: ['`None True True`', '`None True False`', '`KeyError`', '`None False False`'],
      correct: 1,
      explanation: '`get` liefert `None` statt zu werfen. `in` prüft **Keys** – `"id"` ist ein Key, der Wert `1` ist keiner.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `groups = {}
groups.get("admin", []).append("Jan")
print(groups)`,
      options: ['`{\'admin\': [\'Jan\']}`', '`{}`', '`{\'admin\': []}`', '`KeyError`'],
      correct: 1,
      explanation: '`get` legt nichts an: Die Liste ist ein temporäres Objekt, das nach dem `append` weggeworfen wird. Richtig ist `groups.setdefault("admin", []).append("Jan")`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `stats = defaultdict(int)
if stats["treffer"] > 0:
    pass
print(dict(stats))`,
      options: ['`{}`', '`{\'treffer\': 0}`', '`{\'treffer\': 1}`', '`KeyError`'],
      correct: 1,
      explanation: 'Beim `defaultdict` legt schon der **Lesezugriff** den Key mit dem Factory-Wert an. Zum reinen Prüfen `stats.get("treffer", 0)` verwenden.',
    },
    {
      id: 'q4',
      prompt: 'Warum knallt das?',
      code: `counts = {"a": 0, "b": 2}
for key in counts:
    if counts[key] == 0:
        del counts[key]`,
      options: [
        '`KeyError: \'a\'`',
        '`RuntimeError: dictionary changed size during iteration`',
        '`TypeError` – über Dicts darf man nicht iterieren',
        'Gar nicht, `counts` ist danach `{\'b\': 2}`',
      ],
      correct: 1,
      explanation: 'Ein Dict darf während der Iteration nicht strukturell verändert werden. Lösung: neu aufbauen (`{k: v for k, v in counts.items() if v != 0}`) oder über `list(counts.keys())` iterieren.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `defaults = {"limit": 10, "debug": False}
config = defaults.update({"limit": 50})
print(config)`,
      options: ['`{\'limit\': 50, \'debug\': False}`', '`{\'limit\': 10, \'debug\': False}`', '`None`', '`{\'limit\': 50}`'],
      correct: 2,
      explanation: '`update` verändert in-place und gibt `None` zurück. Für ein neues Dict: `config = defaults | {"limit": 50}`.',
    },
    {
      id: 'q6',
      prompt: 'Welche Reihenfolge liefert der Ausdruck?',
      code: `scores = {"anna": 3, "bo": 7, "cy": 7}
print([k for k, _ in sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))])`,
      options: ['`[\'bo\', \'cy\', \'anna\']`', '`[\'anna\', \'bo\', \'cy\']`', '`[\'cy\', \'bo\', \'anna\']`', '`[\'bo\', \'anna\', \'cy\']`'],
      correct: 0,
      explanation: 'Erst Punkte absteigend (7 vor 3), bei Gleichstand Key aufsteigend → `bo` vor `cy`, dann `anna`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisch, um Vorkommen zu zählen?',
      options: [
        '`counts = {}` und in der Schleife `counts[w] = counts[w] + 1`',
        '`counts = {}` und in der Schleife `counts[w] = counts.get(w, 0) + 1`',
        '`counts = {}` und in der Schleife `if w in counts: counts[w] += 1; else: counts[w] = 1`',
        '`counts = [words.count(w) for w in words]`',
      ],
      correct: 1,
      explanation: '`get(w, 0) + 1` ist die kompakte Standardform (noch kürzer: `Counter(words)`). Variante 1 wirft beim ersten Vorkommen `KeyError`, Variante 4 ist O(n²) und liefert kein Dict.',
    },
    {
      id: 'q8',
      prompt: 'Warum knallt das?',
      code: `cache = {}
cache[["a", "b"]] = 1`,
      options: [
        '`ValueError` – Keys müssen Strings sein',
        '`TypeError: unhashable type: \'list\'` – Keys müssen hashbar sein',
        '`KeyError` – der Key existiert noch nicht',
        'Gar nicht, Listen sind gültige Keys',
      ],
      correct: 1,
      explanation: 'Dicts ermitteln die Position über den Hash des Keys. Veränderliche Objekte haben keinen stabilen Hash – `cache[("a", "b")] = 1` mit Tupel funktioniert.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Wörter zählen',
      level: 1,
      description: `Implementiere \`word_count(text: str) -> dict[str, int]\`:

- zerlegt den Text an Whitespace
- zählt die Wörter **case-insensitiv** (\`"Log"\` und \`"log"\` sind dasselbe Wort)
- leerer Text ergibt \`{}\`

Beispiel: \`word_count("a B a")\` → \`{"a": 2, "b": 1}\``,
      starter: `def word_count(text: str) -> dict[str, int]:
    # TODO
    return {}`,
      solution: `def word_count(text: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts`,
      hints: [
        'Erst normalisieren (Kleinschreibung), dann in Wörter zerlegen, dann hochzählen.',
        '`text.lower().split()` und `counts.get(word, 0) + 1`. Alternative in einer Zeile: `dict(Counter(text.lower().split()))`.',
        'leeres dict anlegen; für jedes Wort den bisherigen Stand mit get(wort, 0) holen und um 1 erhöhen',
        '`for word in text.lower().split():`\n`    counts[word] = counts.get(word, 0) + 1`',
      ],
      tests: `check("Duplikate", {"a": 2, "b": 1}, word_count("a b a"))
check("case-insensitiv", {"log": 2}, word_count("Log LOG"))
check("mehrfacher Whitespace", {"a": 1, "b": 1}, word_count("  a   b "))
check("leerer Text", {}, word_count(""))
check("nur Whitespace", {}, word_count("   "))
check("ein Wort", {"solo": 1}, word_count("solo"))`,
    },
    {
      id: 'k2',
      title: 'Nach Anfangsbuchstabe gruppieren',
      level: 2,
      description: `Implementiere \`group_by_initial(names: list[str]) -> dict[str, list[str]]\`:

- Key ist der **großgeschriebene** erste Buchstabe
- Value ist die Liste der Namen in ursprünglicher Reihenfolge (unverändert geschrieben)
- leere Strings werden übersprungen
- Rückgabe ist ein normales \`dict\`, kein \`defaultdict\`

Beispiel: \`group_by_initial(["anna", "Ben", "axel"])\` → \`{"A": ["anna", "axel"], "B": ["Ben"]}\``,
      starter: `def group_by_initial(names: list[str]) -> dict[str, list[str]]:
    # TODO
    return {}`,
      solution: `def group_by_initial(names: list[str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = {}
    for name in names:
        if not name:
            continue
        groups.setdefault(name[0].upper(), []).append(name)
    return groups`,
      hints: [
        'Pro Name: Key bestimmen, Liste besorgen (ggf. anlegen), Name anhängen.',
        '`setdefault(key, [])` liefert die vorhandene oder die neu angelegte Liste. Mit `defaultdict(list)` geht es auch – dann am Ende `dict(...)`.',
        'leeres dict; leere Namen überspringen; key = name[0].upper(); setdefault(key, []).append(name)',
        '`groups.setdefault(name[0].upper(), []).append(name)`',
      ],
      tests: `check("Standardfall", {"A": ["anna", "axel"], "B": ["Ben"]}, group_by_initial(["anna", "Ben", "axel"]))
check("leere Liste", {}, group_by_initial([]))
check("leere Strings raus", {"X": ["Xy"]}, group_by_initial(["", "Xy", ""]))
check("alles derselbe Buchstabe", {"C": ["ca", "Cb"]}, group_by_initial(["ca", "Cb"]))
check("Reihenfolge bleibt", {"A": ["a2", "a1"]}, group_by_initial(["a2", "a1"]))
check_true("echtes dict, kein defaultdict", type(group_by_initial(["a"])) is dict)`,
    },
    {
      id: 'k3',
      title: 'Top-K nach Wert',
      level: 3,
      description: `Implementiere \`top_k(counts: dict[str, int], k: int) -> list[tuple[str, int]]\`:

- liefert die \`k\` Einträge mit dem höchsten Wert als \`(key, value)\`-Tupel
- Wert **absteigend**, bei Gleichstand Key **aufsteigend** (damit das Ergebnis deterministisch ist)
- ist \`k\` größer als das Dict, kommen alle Einträge zurück; \`k = 0\` ergibt \`[]\``,
      starter: `def top_k(counts: dict[str, int], k: int) -> list[tuple[str, int]]:
    # TODO
    return []`,
      solution: `def top_k(counts: dict[str, int], k: int) -> list[tuple[str, int]]:
    ordered = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return ordered[:k]`,
      hints: [
        '`items()` liefert genau die `(key, value)`-Tupel, die du zurückgeben sollst.',
        '`sorted(..., key=lambda kv: (-kv[1], kv[0]))` und danach ein Slice `[:k]`.',
        'items() sortieren mit Tupel-Key (-wert, key); die ersten k Einträge zurückgeben',
        '`ordered = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))`\n`return ordered[:k]`',
      ],
      tests: `scores = {"anna": 3, "bo": 7, "cy": 7}
check("top 2 mit Gleichstand", [("bo", 7), ("cy", 7)], top_k(scores, 2))
check("k groesser als dict", [("bo", 7), ("cy", 7), ("anna", 3)], top_k(scores, 9))
check("k = 0", [], top_k(scores, 0))
check("leeres dict", [], top_k({}, 3))
check("Original unveraendert", {"anna": 3, "bo": 7, "cy": 7}, scores)
check("negative Werte", [("a", 0), ("b", -5)], top_k({"b": -5, "a": 0}, 2))`,
    },
    {
      id: 'k4',
      title: 'Konfigurationen tief mergen',
      level: 4,
      description: `Implementiere \`merge_config(base: dict, override: dict) -> dict\`:

- liefert ein **neues** Dict; \`base\` und \`override\` bleiben unverändert
- Werte aus \`override\` gewinnen
- sind **beide** Werte zu einem Key wieder Dicts, wird rekursiv gemergt statt ersetzt
- ist nur einer der beiden ein Dict, gewinnt schlicht der Wert aus \`override\`

Beispiel:
\`merge_config({"db": {"host": "x", "port": 1}}, {"db": {"port": 2}})\`
→ \`{"db": {"host": "x", "port": 2}}\``,
      starter: `def merge_config(base: dict, override: dict) -> dict:
    # TODO
    return {}`,
      solution: `def merge_config(base: dict, override: dict) -> dict:
    result = dict(base)
    for key, value in override.items():
        current = result.get(key)
        if isinstance(current, dict) and isinstance(value, dict):
            result[key] = merge_config(current, value)
        else:
            result[key] = value
    return result`,
      hints: [
        'Starte mit einer Kopie von `base` und arbeite die Einträge aus `override` ein – dann wird nichts von außen verändert.',
        '`dict(base)` für die Kopie, `isinstance(x, dict)` für die Typprüfung, rekursiver Aufruf für den Dict-in-Dict-Fall.',
        'result = Kopie von base; für jedes (key, value) aus override: wenn result[key] und value beide dicts sind → rekursiv mergen, sonst überschreiben',
        '`if isinstance(current, dict) and isinstance(value, dict):`\n`    result[key] = merge_config(current, value)`\n`else:`\n`    result[key] = value`',
      ],
      tests: `base = {"db": {"host": "x", "port": 1}, "debug": False}
override = {"db": {"port": 2}, "limit": 10}
check("tiefer Merge", {"db": {"host": "x", "port": 2}, "debug": False, "limit": 10}, merge_config(base, override))
check("base unveraendert", {"db": {"host": "x", "port": 1}, "debug": False}, base)
check("override unveraendert", {"db": {"port": 2}, "limit": 10}, override)
check("leerer override", {"a": 1}, merge_config({"a": 1}, {}))
check("leere base", {"a": 1}, merge_config({}, {"a": 1}))
check("Skalar schlaegt dict", {"db": None}, merge_config({"db": {"host": "x"}}, {"db": None}))
check("drei Ebenen", {"a": {"b": {"c": 2, "d": 3}}}, merge_config({"a": {"b": {"c": 1, "d": 3}}}, {"a": {"b": {"c": 2}}}))`,
    },
  ],
}

export default chapter
