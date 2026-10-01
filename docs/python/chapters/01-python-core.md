# Kapitel 01 – Python Core

## Mental Model

```text
NAME  ──referenziert──>  OBJEKT (hat Typ + Identität + Wert)
x = [1, 2]        x ──────────┐
y = x             y ──────────┴──> [1, 2]   (dasselbe Objekt, id() gleich)
y.append(3)       x == [1, 2, 3]            (mutable → beide sehen die Änderung)

z = [1, 2, 3]     z ──> [1, 2, 3]           (anderes Objekt)
z == x  → True    (gleicher Wert)
z is x  → False   (andere Identität)
```

- In Python sind Variablen **Namen**, die auf Objekte zeigen – keine Boxen, in die Werte kopiert werden.
- `==` fragt nach dem **Wert**, `is` nach der **Identität**. Fast immer willst du `==`.

## Syntax / API

### Typen und Type Hints

```python
name: str = "Jan"
age: int = 38
price: float = 19.99
active: bool = True
tags: list[str] = ["backend", "python"]
user: dict[str, Any] = {"id": 1}
maybe: str | None = None          # ab 3.10 statt Optional[str]

def greet(name: str, formal: bool = False) -> str:
    return f"Guten Tag, {name}" if formal else f"Hi, {name}"
```

Type Hints sind zur Laufzeit **nicht** bindend – sie sind Dokumentation für Leser, IDE und `mypy`.

### Truthiness

```python
bool("")      # False   – leerer String
bool("0")     # True    – nicht-leerer String!
bool([])      # False   – leere Sequenz
bool({})      # False   – leeres Dict
bool(0)       # False
bool(0.0)     # False
bool(None)    # False
```

Alles andere ist `True`. Deshalb: `if items:` statt `if len(items) > 0:`.

### `is` vs. `==` und `None`

```python
if value is None: ...          # RICHTIG – None ist ein Singleton
if value == None: ...          # unidiomatisch, kann durch __eq__ lügen
if not value: ...              # prüft auch 0, "", [] mit!

a = 1000
b = 1000
a == b   # True
a is b   # meist False – Identität ist kein Wertevergleich
```

`is` nur für `None`, `True`, `False` und bewusste Sentinel-Objekte.

### f-Strings

```python
name, total = "Jan", 1234.5678
f"{name}: {total:.2f}"          # 'Jan: 1234.57'
f"{total:>12,.2f}"              # rechtsbündig, Tausendertrennung
f"{age=}"                       # 'age=38'  – Debug-Syntax ab 3.8
f"{user['id']}"                 # Dict-Zugriff mit anderer Quote-Art
```

`f"{obj}"` nutzt `__str__`, `f"{obj!r}"` nutzt `__repr__` (besser für Logs).

### Slicing

```python
s = "abcdefg"
s[0]        # 'a'
s[-1]       # 'g'
s[1:4]      # 'bcd'      – Ende exklusiv
s[:3]       # 'abc'
s[3:]       # 'defg'
s[::2]      # 'aceg'     – Schrittweite
s[::-1]     # 'gfedcba'  – umdrehen
s[2:99]     # 'cdefg'    – Slices werfen nie IndexError
s[99]       # IndexError – Einzelzugriff schon
```

### Mutability

```python
# unveränderlich: int, float, str, bytes, tuple, frozenset
# veränderlich:   list, dict, set, die meisten eigenen Klassen

def add_tag(tags: list[str]) -> None:
    tags.append("neu")          # verändert die Liste des Aufrufers!

def with_tag(tags: list[str]) -> list[str]:
    return [*tags, "neu"]       # neue Liste, Original bleibt heil
```

### Tupel-Unpacking

```python
first, last = "Jan", "Pfrommer"
first, last = last, first             # Tausch ohne temp-Variable

head, *rest = [1, 2, 3, 4]            # head=1, rest=[2, 3, 4]
*init, tail = [1, 2, 3, 4]            # init=[1, 2, 3], tail=4

for index, value in enumerate(["a", "b"], start=1):
    print(index, value)

for key, val in {"a": 1}.items():
    print(key, val)
```

### Walross-Operator `:=`

```python
if (match := re.search(r"\d+", text)) is not None:
    print(match.group())

while (line := stream.readline()) != "":
    process(line)
```

Zuweisen **und** prüfen in einem Ausdruck – spart eine Zeile, nicht mehr. Sparsam einsetzen.

### Zahlen: int, float, Decimal

```python
7 / 2       # 3.5   – echte Division, immer float
7 // 2      # 3     – Floor Division
-7 // 2     # -4    – rundet Richtung minus unendlich!
7 % 3       # 1
2 ** 10     # 1024

0.1 + 0.2 == 0.3                       # False – Binärdarstellung
math.isclose(0.1 + 0.2, 0.3)           # True

Decimal("0.1") + Decimal("0.2")        # Decimal('0.3')  – Geld immer so
Decimal(0.1)                           # FALSCH: erbt den float-Fehler
```

### Wichtige `str`-Methoden

```python
" Jan ".strip()               # 'Jan'
"a,b,,c".split(",")           # ['a', 'b', '', 'c']
"a b  c".split()              # ['a', 'b', 'c'] – Whitespace, ohne Leerstrings
", ".join(["a", "b"])         # 'a, b'
"jan".upper(), "JAN".lower()  # 'JAN', 'jan'
"report.csv".endswith(".csv") # True
"a-b".replace("-", "_")       # 'a_b'
"abc".startswith(("a", "x"))  # True – Tupel erlaubt
"42".isdigit()                # True
"jan" in "jan.pfrommer"       # True
```

Strings sind unveränderlich: jede Methode gibt einen **neuen** String zurück.

### EAFP vs. LBYL

```python
# EAFP – "easier to ask forgiveness than permission" (pythonic)
try:
    value = int(raw)
except ValueError:
    value = 0

# LBYL – "look before you leap"
if raw.isdigit():
    value = int(raw)
else:
    value = 0                 # scheitert bei "-5" und " 42 "
```

EAFP ist meist korrekter (keine Lücke zwischen Prüfung und Zugriff) und bei seltenen Fehlern schneller.

## Typische Use Cases

- Eingaben aus HTTP/CSV normalisieren: `raw.strip()`, `int(...)` in `try/except`.
- Fehlende Werte als `None` modellieren und mit `is None` prüfen – nicht mit `not`.
- Geldbeträge als `Decimal("…")` aus Strings, nie aus `float`.
- Logging und Fehlermeldungen mit f-Strings formatieren.
- Mehrere Rückgabewerte als Tupel + Unpacking beim Aufrufer.
- Verteidigung gegen Alias-Bugs: Listen/Dicts kopieren, bevor sie verändert werden.

## Clean-Code-Empfehlungen

- Type Hints in jeder öffentlichen Signatur – auch der Rückgabetyp.
- `snake_case` für Funktionen/Variablen, `PascalCase` für Klassen, `UPPER_CASE` für Konstanten.
- Keine veränderlichen Default-Argumente (`def f(items=[])`) – stattdessen `None` + Ersatz im Rumpf.
- Funktionen entweder **verändern** oder **zurückgeben** – nicht beides.
- Aussagekräftige Namen statt Kommentare; Docstring nur, wenn er mehr sagt als die Signatur.
- Frühe Rückgabe statt tiefer `if`-Schachtelung.

## Häufige Fehler

```python
# FALSCH: veränderliches Default-Argument wird EINMAL erzeugt
def add(item, target=[]):
    target.append(item)
    return target
# RICHTIG
def add(item, target: list | None = None) -> list:
    target = [] if target is None else target
    return [*target, item]

# FALSCH: 0 und "" gelten als "fehlt"
def label(count=None):
    return "unbekannt" if not count else str(count)   # 0 → 'unbekannt'
# RICHTIG
    return "unbekannt" if count is None else str(count)

# FALSCH: float für Geld
total = 0.1 + 0.2                  # 0.30000000000000004
# RICHTIG
total = Decimal("0.1") + Decimal("0.2")

# FALSCH: Liste beim Iterieren verändern
for item in items:
    if item.expired:
        items.remove(item)         # überspringt Elemente
# RICHTIG
items = [item for item in items if not item.expired]

# FALSCH: is für Wertevergleich
if status is "PAID": ...           # SyntaxWarning, unzuverlässig
# RICHTIG
if status == "PAID": ...

# FALSCH: Aliasing übersehen
defaults = {"limit": 10}
config = defaults
config["limit"] = 99               # defaults ist jetzt auch 99
# RICHTIG
config = dict(defaults)
```

## Interview-relevante Details

- **`is` vs `==`**: `is` vergleicht `id()`. Kleine ints (-5..256) und kurze Strings werden vom CPython-Interpreter gecacht – daher liefert `a is b` bei `a = 5` zufällig `True`. Nie darauf verlassen.
- **Default-Argumente** werden bei der **Definition** ausgewertet, nicht bei jedem Aufruf.
- **`-7 // 2` ist `-4`**: Floor Division rundet ab, nicht Richtung Null. `int(-3.5)` ist dagegen `-3`.
- **`None` zurückgeben** ist der implizite Rückgabewert jeder Funktion ohne `return`.
- **f-String vs. `%`/`format`**: f-Strings werden zur Compile-Zeit in Konkatenation übersetzt und sind am schnellsten – aber nie für SQL oder Logging-Templates mit Nutzerdaten verwenden.
- **Shallow Copy**: `list(x)`, `x[:]` und `x.copy()` kopieren nur die äußere Ebene; verschachtelte Objekte bleiben geteilt (`copy.deepcopy` für tief).
- **EAFP** ist der offizielle Python-Stil; LBYL ist bei Nebenläufigkeit sogar fehlerhaft (Race Condition zwischen Prüfung und Zugriff).

## Zusammenfassung

- Namen zeigen auf Objekte; `==` für Werte, `is` nur für `None`/Singletons.
- Truthiness umfasst `0`, `""`, `[]`, `{}`, `None` – bei optionalen Zahlen immer `is None` prüfen.
- Slices sind Ende-exklusiv, tolerant gegenüber Grenzen und erlauben Schrittweite (`[::-1]`).
- Mutable Defaults und versehentliches Aliasing sind die zwei klassischen Anfängerfallen.
- Geld gehört in `Decimal("…")`, Vergleiche von floats in `math.isclose`.
- f-Strings zum Formatieren, `str`-Methoden geben immer neue Strings zurück.
- EAFP (`try/except`) schlägt LBYL – Fehler behandeln statt vorher raten.
