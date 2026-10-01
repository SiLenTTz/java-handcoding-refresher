import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    { id: 'f1', front: 'Unterschied `==` und `is`?', back: '`==` vergleicht den **Wert** (`__eq__`), `is` die **Identität** (`id()`, also dasselbe Objekt im Speicher). Im Alltag immer `==` – `is` nur für `None`, `True`, `False` und bewusste Sentinels.' },
    { id: 'f2', front: 'Wie prüfst du korrekt auf einen fehlenden Wert?', back: '`if value is None:`. `if not value:` ist falsch, sobald `0`, `0.0`, `""`, `[]` oder `{}` legale Werte sind.' },
    { id: 'f3', front: 'Welche Werte sind falsy?', back: '`None`, `False`, `0`, `0.0`, `Decimal("0")`, `""`, `[]`, `()`, `{}`, `set()`. Alles andere ist truthy – auch `"0"` und `" "`.' },
    { id: 'f4', front: 'Warum ist `def add(item, target=[])` ein Bug?', back: 'Default-Argumente werden **einmal bei der Definition** ausgewertet. Alle Aufrufe teilen sich dieselbe Liste.\n\n```python\ndef add(item, target: list | None = None) -> list:\n    target = [] if target is None else target\n    return [*target, item]\n```' },
    { id: 'f5', front: 'Was liefert `7 / 2`, `7 // 2` und `-7 // 2`?', back: '`3.5` (echte Division, immer `float`), `3` (Floor Division) und `-4` – Floor Division rundet Richtung minus unendlich, nicht Richtung Null.' },
    { id: 'f6', front: 'Warum `Decimal` statt `float` für Geld?', back: '`0.1 + 0.2 == 0.3` ist `False`, weil Binär-Floats dezimale Brüche nicht exakt abbilden. `Decimal("0.1") + Decimal("0.2")` ist exakt `Decimal("0.3")`. Immer aus **String** konstruieren, nie aus `float`.' },
    { id: 'f7', front: 'Was macht `s[::-1]` und was `s[2:99]`?', back: '`s[::-1]` dreht die Sequenz um (Schrittweite -1). `s[2:99]` liefert einfach den Rest – Slices werfen nie `IndexError`, nur der Einzelzugriff `s[99]` tut das.' },
    { id: 'f8', front: 'Mutable vs. immutable – welche Typen?', back: '**Unveränderlich:** `int`, `float`, `str`, `bytes`, `tuple`, `frozenset`, `Decimal`.\n**Veränderlich:** `list`, `dict`, `set`, die meisten eigenen Klassen.\nNur veränderliche Objekte können durch Aliasing überraschen.' },
    { id: 'f9', front: 'Was passiert bei `b = a`, wenn `a` eine Liste ist?', back: 'Kein Kopieren – `b` ist ein zweiter **Name** für dasselbe Objekt. `b.append(x)` ist auch in `a` sichtbar. Flache Kopie: `list(a)`, `a[:]` oder `a.copy()`.' },
    { id: 'f10', front: 'Tupel-Unpacking: `head, *rest = [1, 2, 3]`?', back: '`head = 1`, `rest = [2, 3]` (der Stern-Teil ist immer eine `list`). Auch `*init, tail = xs` und der Tausch `a, b = b, a` funktionieren so.' },
    { id: 'f11', front: 'Wozu der Walross-Operator `:=`?', back: 'Zuweisen **innerhalb** eines Ausdrucks, damit der Wert nicht zweimal berechnet oder eine Extra-Zeile nötig wird.\n\n```python\nif (match := re.search(r"\\d+", text)) is not None:\n    print(match.group())\n```' },
    { id: 'f12', front: 'EAFP vs. LBYL – was ist pythonic?', back: 'EAFP ("easier to ask forgiveness than permission"): einfach versuchen und `except` behandeln. LBYL prüft vorher und hat eine Lücke zwischen Prüfung und Zugriff.\n\n```python\ntry:\n    value = int(raw)\nexcept ValueError:\n    value = 0\n```' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `print(bool("0"), bool(""), bool([0]), bool(0.0))`,
      options: ['`True False True False`', '`False False True False`', '`True False False False`', '`True True True False`'],
      correct: 0,
      explanation: 'Truthiness richtet sich nach Leere, nicht nach Inhalt: `"0"` ist ein nicht-leerer String (`True`), `[0]` eine nicht-leere Liste (`True`). Leer sind `""` und `0.0`.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `a = [1, 2]
b = a
b.append(3)
print(len(a), a is b)`,
      options: ['`2 False`', '`3 False`', '`2 True`', '`3 True`'],
      correct: 3,
      explanation: '`b = a` kopiert nichts – beide Namen zeigen auf dieselbe Liste. `append` ist für beide sichtbar, `is` liefert `True`. Für eine echte Kopie: `b = list(a)`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `def add(item, target=[]):
    target.append(item)
    return target

print(add(1))
print(add(2))`,
      options: ['`[1]` und `[2]`', '`[1]` und `[1, 2]`', '`[1]` und `[]`', '`TypeError`'],
      correct: 1,
      explanation: 'Das Default-Argument wird **einmal bei der Definition** erzeugt und über alle Aufrufe hinweg wiederverwendet. Lösung: `target: list | None = None` und im Rumpf ersetzen.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `print(7 // 2, -7 // 2, int(-3.5), 7 / 2)`,
      options: ['`3 -3 -3 3.5`', '`3 -4 -4 3.5`', '`3 -4 -3 3.5`', '`3 -4 -3 3`'],
      correct: 2,
      explanation: '`//` rundet **ab** (Richtung minus unendlich) → `-4`. `int()` schneidet dagegen Richtung Null ab → `-3`. `/` liefert immer einen `float`.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist für Geldbeträge idiomatisch und korrekt?',
      options: [
        '`total = 0.1 + 0.2`',
        '`total = Decimal(0.1) + Decimal(0.2)`',
        '`total = Decimal("0.1") + Decimal("0.2")`',
        '`total = round(0.1 + 0.2, 2)`',
      ],
      correct: 2,
      explanation: '`Decimal` aus einem **String** ist exakt. `Decimal(0.1)` übernimmt den bereits fehlerhaften Binär-Float, und `round` kaschiert den Fehler nur für die Anzeige.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `s = "handcoding"
print(s[-4:], s[::-1][:3])`,
      options: ['`ding gni`', '`odin gni`', '`ding nid`', '`ding gni` und dann ein `IndexError`'],
      correct: 0,
      explanation: '`s[-4:]` sind die letzten vier Zeichen → `ding`. `s[::-1]` ist `gnidocdnah`, davon die ersten drei → `gni`.',
    },
    {
      id: 'q7',
      prompt: 'Was wird ausgegeben – und warum ist das ein Bug?',
      code: `config = {"retries": 0}
retries = config.get("retries") or 3
print(retries)`,
      options: ['`0` – alles korrekt', '`3` – `0` ist falsy und wird durch den Default ersetzt', '`None`', '`KeyError`'],
      correct: 1,
      explanation: '`or` greift bei jedem falsy Wert, also auch bei der bewusst gesetzten `0`. Richtig ist `config.get("retries", 3)` bzw. eine explizite `is None`-Prüfung.',
    },
    {
      id: 'q8',
      prompt: 'Warum knallt das?',
      code: `point = (1, 2)
point[0] = 5`,
      options: [
        '`point` ist zu kurz für einen Index-Zugriff',
        '`TypeError` – Tupel sind unveränderlich, Item-Zuweisung gibt es nicht',
        '`SyntaxError` – Tupel brauchen ein Komma am Ende',
        'Gar nicht, `point` ist danach `(5, 2)`',
      ],
      correct: 1,
      explanation: 'Tupel sind immutable: `TypeError: \'tuple\' object does not support item assignment`. Ein neues Tupel bauen (`point = (5, point[1])`) oder eine Liste verwenden.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Eingaben normalisieren',
      level: 1,
      description: `Implementiere \`normalize(raw: str | None) -> str\`:

- \`None\` ergibt \`""\`
- führende/abschließende Whitespaces entfernen
- mehrfache Whitespaces im Inneren (auch Tabs und Umbrüche) zu **einem** Leerzeichen zusammenziehen

Beispiel: \`"  Jan   Pfrommer "\` → \`"Jan Pfrommer"\``,
      starter: `def normalize(raw: str | None) -> str:
    # TODO
    return ""`,
      solution: `def normalize(raw: str | None) -> str:
    if raw is None:
        return ""
    return " ".join(raw.split())`,
      hints: [
        'Zwei Fälle: `None` (Sonderfall, früh zurückgeben) und ein echter String.',
        '`str.split()` ohne Argument trennt an beliebigem Whitespace und wirft Leerstrings weg. `" ".join(...)` fügt wieder zusammen.',
        'wenn raw is None → "" zurückgeben; sonst split() → join(" ")',
        '`return " ".join(raw.split())`',
      ],
      tests: `check("None", "", normalize(None))
check("nur Whitespace", "", normalize("   "))
check("leerer String", "", normalize(""))
check("trim und collapse", "Jan Pfrommer", normalize("  Jan   Pfrommer "))
check("Tabs und Umbrueche", "a b c", normalize("a\\tb\\nc"))
check("schon sauber", "ok", normalize("ok"))`,
    },
    {
      id: 'k2',
      title: 'Bereich parsen',
      level: 2,
      description: `Implementiere \`parse_range(text: str) -> tuple[int, int]\`:

- Eingabe hat die Form \`"3-7"\`, Leerzeichen um die Zahlen sind erlaubt (\`" 10 - 20 "\`)
- Rückgabe ist das Tupel \`(start, end)\`
- \`ValueError\`, wenn es nicht genau **einen** Trenner gibt, wenn ein Teil keine Zahl ist oder wenn \`start > end\`

Nutze EAFP – du musst nicht vorher prüfen, ob der Text eine Zahl ist.`,
      starter: `def parse_range(text: str) -> tuple[int, int]:
    # TODO
    return (0, 0)`,
      solution: `def parse_range(text: str) -> tuple[int, int]:
    parts = text.split("-")
    if len(parts) != 2:
        raise ValueError(f"ungueltiger Bereich: {text!r}")
    start, end = (int(part.strip()) for part in parts)
    if start > end:
        raise ValueError(f"start groesser als end: {text!r}")
    return start, end`,
      hints: [
        'Drei Schritte: aufteilen, in Zahlen wandeln, Reihenfolge prüfen. Jeder Schritt kann scheitern.',
        '`text.split("-")` liefert eine Liste. `int("  7 ".strip())` wirft von allein `ValueError` bei Unsinn.',
        'parts = split("-"); wenn len != 2 → raise; start, end = int(...) für beide; wenn start > end → raise; sonst Tupel zurück',
        '`parts = text.split("-")`\n`if len(parts) != 2:`\n`    raise ValueError(text)`\n`start, end = (int(p.strip()) for p in parts)`',
      ],
      tests: `check("einfach", (3, 7), parse_range("3-7"))
check("mit Leerzeichen", (10, 20), parse_range(" 10 - 20 "))
check("gleiche Grenzen", (5, 5), parse_range("5-5"))
check_raises("kein Trenner", ValueError, lambda: parse_range("5"))
check_raises("zu viele Trenner", ValueError, lambda: parse_range("1-2-3"))
check_raises("keine Zahl", ValueError, lambda: parse_range("a-b"))
check_raises("verdreht", ValueError, lambda: parse_range("7-3"))`,
    },
    {
      id: 'k3',
      title: 'Text in Blöcke schneiden',
      level: 3,
      description: `Implementiere \`chunks(text: str, size: int) -> list[str]\`:

- zerlegt \`text\` in aufeinanderfolgende Stücke der Länge \`size\`
- das letzte Stück darf kürzer sein
- leerer Text ergibt \`[]\`
- \`size <= 0\` wirft \`ValueError\`

Beispiel: \`chunks("abcdef", 4)\` → \`["abcd", "ef"]\`

Nutze Slicing – kein Zeichen-für-Zeichen-Aufbau.`,
      starter: `def chunks(text: str, size: int) -> list[str]:
    # TODO
    return []`,
      solution: `def chunks(text: str, size: int) -> list[str]:
    if size <= 0:
        raise ValueError("size muss groesser als 0 sein")
    return [text[start:start + size] for start in range(0, len(text), size)]`,
      hints: [
        'Die Startpositionen sind 0, size, 2*size, … – genau das liefert `range` mit Schrittweite.',
        '`range(0, len(text), size)` und `text[start:start + size]`. Slices dürfen über das Ende hinausgehen.',
        'Validierung zuerst; dann für jede Startposition ein Slice sammeln',
        '`return [text[i:i + size] for i in range(0, len(text), size)]`',
      ],
      tests: `check("glatt teilbar", ["abc", "def"], chunks("abcdef", 3))
check("mit Rest", ["abcd", "ef"], chunks("abcdef", 4))
check("Groesse 1", ["a", "b"], chunks("ab", 1))
check("size groesser als Text", ["ab"], chunks("ab", 5))
check("leerer Text", [], chunks("", 3))
check_raises("size 0", ValueError, lambda: chunks("abc", 0))
check_raises("size negativ", ValueError, lambda: chunks("abc", -2))`,
    },
    {
      id: 'k4',
      title: 'Messwerte beschreiben',
      level: 4,
      description: `Implementiere \`describe(values: list[float | None]) -> str\`:

- \`None\`-Einträge werden ignoriert, **\`0.0\` aber nicht** (klassische Truthiness-Falle)
- gibt es keinen bekannten Wert, ist das Ergebnis genau \`"n=0"\`
- sonst: \`"n=<anzahl> min=<min> max=<max> avg=<schnitt>"\` mit jeweils **zwei** Nachkommastellen

Beispiel: \`describe([1.0, None, 0.0, 3.0])\` → \`"n=3 min=0.00 max=3.00 avg=1.33"\``,
      starter: `def describe(values: list[float | None]) -> str:
    # TODO
    return ""`,
      solution: `def describe(values: list[float | None]) -> str:
    known = [value for value in values if value is not None]
    if not known:
        return "n=0"
    average = sum(known) / len(known)
    return f"n={len(known)} min={min(known):.2f} max={max(known):.2f} avg={average:.2f}"`,
      hints: [
        'Erst die bekannten Werte herausfiltern – mit `is not None`, nicht mit `if value`.',
        '`min`, `max`, `sum`/`len` und f-String-Formatierung `f"{wert:.2f}"`.',
        'known = alle Werte, die nicht None sind; wenn leer → "n=0"; sonst Durchschnitt berechnen und f-String bauen',
        '`known = [v for v in values if v is not None]`\n`if not known:`\n`    return "n=0"`',
      ],
      tests: `check("None und 0.0 gemischt", "n=3 min=0.00 max=3.00 avg=1.33", describe([1.0, None, 0.0, 3.0]))
check("leere Liste", "n=0", describe([]))
check("nur None", "n=0", describe([None, None]))
check("ein Wert", "n=1 min=2.50 max=2.50 avg=2.50", describe([2.5]))
check("negative Werte", "n=2 min=-4.00 max=2.00 avg=-1.00", describe([-4.0, 2.0]))
check("nur Null", "n=1 min=0.00 max=0.00 avg=0.00", describe([0.0]))`,
    },
  ],
}

export default chapter
