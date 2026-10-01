# Kapitel 04 – Comprehensions & Generatoren

## Mental Model

```text
[ AUSGABE  for ELEMENT in QUELLE  if BEDINGUNG ]
      │            │                    │
      │            │                    └── filtern (weglassen)
      │            └── Schleifenvariable
      └── transformieren (mappen)

[...]  list comprehension     → baut sofort die ganze Liste     (eager)
{...}  set / dict comprehension → sofort, eindeutig / key: value
(...)  generator expression   → liefert Element für Element      (lazy)
```

- Comprehension = **map + filter in einem Ausdruck**. Sie ersetzt die Schleife, die nur eine Liste befüllt.
- Ein Generator merkt sich seinen Zustand und produziert Werte erst auf Nachfrage – Speicher O(1) statt O(n).

## Syntax / API

### List-Comprehension

```python
numbers = [1, 2, 3, 4, 5]

[n * n for n in numbers]                  # [1, 4, 9, 16, 25]
[n for n in numbers if n % 2 == 0]        # [2, 4]
[n * n for n in numbers if n % 2 == 0]    # [4, 16]

# entspricht:
result = []
for n in numbers:
    if n % 2 == 0:
        result.append(n * n)
```

### Set- und Dict-Comprehension

```python
{word.lower() for word in words}                  # set – dedupliziert
{u.id: u.name for u in users}                     # dict
{k: v for k, v in raw.items() if v is not None}
{i: i * i for i in range(4)}                      # {0: 0, 1: 1, 2: 4, 3: 9}
```

### Bedingung: `if` am Ende vs. ternär vorn

```python
# FILTERN – if am Ende (kein else erlaubt)
[n for n in numbers if n > 2]

# ERSETZEN – ternärer Ausdruck vorn (else ist Pflicht)
["gerade" if n % 2 == 0 else "ungerade" for n in numbers]

# beides kombiniert
[n if n > 0 else 0 for n in numbers if n is not None]
#  └── Ausdruck ──┘                    └── Filter ──┘
```

Merksatz: **vorne** entscheidet über den *Wert*, **hinten** über das *Ob*.

### Verschachtelte Comprehensions

```python
matrix = [[1, 2], [3, 4]]

[x for row in matrix for x in row]        # [1, 2, 3, 4] – flatten
# Reihenfolge wie bei geschachtelten for-Schleifen: erst row, dann x

[[x * 2 for x in row] for row in matrix]  # [[2, 4], [6, 8]] – Struktur bleibt

[(a, b) for a in "ab" for b in (1, 2)]    # Kreuzprodukt
[x for row in matrix for x in row if x % 2 == 0]
```

Mehr als zwei Ebenen: lieber eine echte Schleife oder eine Hilfsfunktion.

### Generator-Ausdrücke

```python
squares = (n * n for n in numbers)        # nichts passiert bisher
next(squares)                             # 1
list(squares)                             # [4, 9, 16, 25] – Rest, Generator ist erschöpft

sum(n * n for n in numbers)               # Klammern bei einzigem Argument optional
with open("big.log") as f:
    errors = sum(1 for line in f if "ERROR" in line)   # Datei nie komplett im RAM
```

Generatoren sind **einmal** verwendbar; ein zweites `list(...)` liefert `[]`.

### `yield`

```python
def running_total(numbers: Iterable[int]) -> Iterator[int]:
    total = 0
    for n in numbers:
        total += n
        yield total                      # hier pausiert die Funktion

list(running_total([1, 2, 3]))           # [1, 3, 6]

def read_batches(rows: Iterable[dict], size: int) -> Iterator[list[dict]]:
    batch: list[dict] = []
    for row in rows:
        batch.append(row)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch                      # Rest nicht vergessen
```

Der Funktionsrumpf läuft erst beim ersten `next()` – auch ein `raise` am Anfang schlägt erst dann zu.

### Lazy Evaluation nutzen

```python
first_error = next((l for l in lines if "ERROR" in l), None)   # None als Default!
any(u.is_admin for u in users)          # bricht beim ersten True ab
all(o.paid for o in orders)             # bricht beim ersten False ab
sum(o.amount for o in orders)
min(users, key=lambda u: u.age)
max((n for n in numbers if n < 100), default=0)
```

`any`/`all` auf leerem Iterable: `any` → `False`, `all` → `True`.

### itertools-Basics

```python
chain([1, 2], [3])                      # 1, 2, 3 – Iterables aneinanderhängen
chain.from_iterable(matrix)             # flatten ohne Comprehension
islice(stream, 10)                      # die ersten 10, ohne alles zu laden
islice(stream, 5, 15)                   # Slicing für Iteratoren

rows = sorted(rows, key=lambda r: r["dept"])       # groupby braucht sortierte Daten!
for dept, group in groupby(rows, key=lambda r: r["dept"]):
    print(dept, len(list(group)))
```

### Wann Comprehension, wann Schleife?

| Situation | Wahl |
|---|---|
| Liste aus Liste mappen/filtern | Comprehension |
| Ergebnis wird nur aggregiert (`sum`, `any`) | Generator-Ausdruck |
| Sehr große oder unendliche Quelle | Generator / `yield` |
| Seiteneffekte (schreiben, loggen, senden) | `for`-Schleife |
| `break`, komplexe Verzweigungen, mehrere Akkumulatoren | `for`-Schleife |
| Ausdruck passt nicht mehr in 2 Zeilen | `for`-Schleife oder Hilfsfunktion |

## Typische Use Cases

- Entities → DTOs: `[to_dto(e) for e in entities]`.
- Index aufbauen: `{u.id: u for u in users}`.
- Log-/CSV-Dateien zeilenweise streamen und aggregieren, ohne alles in den RAM zu laden.
- Batches für Bulk-Inserts bilden (`yield` alle n Zeilen).
- Frühe Suche mit `next(gen, None)` statt kompletter Liste plus `[0]`.
- Flache Liste aus verschachtelter Struktur: `chain.from_iterable`.

## Clean-Code-Empfehlungen

- Eine Comprehension darf höchstens einen `for` und einen `if` haben, sonst wird es eine Schleife.
- Sprechende Schleifenvariablen (`for user in users`, nicht `for u in us`); `_` für Ungenutztes.
- Bei Aggregation immer Generator statt Liste: `sum(x.amount for x in items)` – keine Zwischenliste.
- Keine Seiteneffekte in Comprehensions (kein `append` an fremde Listen, kein `print`).
- Lange Comprehensions über mehrere Zeilen umbrechen: Ausdruck / `for` / `if` je eine Zeile.
- Generatorfunktionen mit `-> Iterator[T]` annotieren, damit Leser die Laziness sehen.

## Häufige Fehler

```python
# FALSCH: else beim Filter-if
[n for n in numbers if n > 0 else 0]       # SyntaxError
# RICHTIG
[n if n > 0 else 0 for n in numbers]

# FALSCH: Generator zweimal verwenden
gen = (n for n in numbers)
print(sum(gen))
print(max(gen))                            # ValueError: max() arg is an empty sequence
# RICHTIG
values = [n for n in numbers]              # materialisieren, wenn mehrfach gebraucht

# FALSCH: Comprehension nur wegen Seiteneffekt
[print(u.name) for u in users]             # baut eine Liste aus None
# RICHTIG
for user in users:
    print(user.name)

# FALSCH: teure Funktion doppelt aufrufen
[score(u) for u in users if score(u) > 10]
# RICHTIG (Walross)
[s for u in users if (s := score(u)) > 10]

# FALSCH: next() ohne Default
first = next(u for u in users if u.is_admin)     # StopIteration, wenn keiner passt
# RICHTIG
first = next((u for u in users if u.is_admin), None)

# FALSCH: groupby auf unsortierten Daten
for key, group in groupby(rows, key=lambda r: r["dept"]):   # zerfällt in viele Gruppen
    ...
# RICHTIG
for key, group in groupby(sorted(rows, key=lambda r: r["dept"]), key=lambda r: r["dept"]):
    ...

# FALSCH: Zwischenliste nur zum Summieren
total = sum([o.amount for o in orders])
# RICHTIG
total = sum(o.amount for o in orders)

# FALSCH: verschachtelte for-Reihenfolge verdreht
[x for x in row for row in matrix]         # NameError: row ist noch nicht definiert
# RICHTIG
[x for row in matrix for x in row]
```

## Interview-relevante Details

- **Scope**: Die Schleifenvariable einer Comprehension lebt in Python 3 in einem eigenen Scope und leckt nicht nach außen (in Python 2 tat sie das).
- **Generator vs. Liste**: Der Generator braucht O(1) Speicher, hat aber keinen `len()`, kein Slicing und keinen Index-Zugriff.
- **`yield` macht die Funktion zur Generatorfunktion** – der Aufruf führt keinen Code aus, sondern gibt ein Generator-Objekt zurück. Deshalb schlägt Validierung im Rumpf erst beim ersten `next()` zu (Trick: Wrapper-Funktion, die validiert und dann den inneren Generator zurückgibt).
- **Short-Circuiting**: `any`/`all`/`next` konsumieren den Generator nur bis zum Treffer – das ist der eigentliche Performance-Gewinn.
- **`StopIteration`** beendet die Iteration; in einem Generator darf sie nicht durchgereicht werden (seit PEP 479 wird daraus ein `RuntimeError`).
- **Comprehension vs. `map`/`filter`**: Comprehensions sind lesbarer und ähnlich schnell; `map` lohnt nur mit fertiger Funktion (`map(int, tokens)`).
- **`groupby`** gruppiert nur **aufeinanderfolgende** gleiche Keys und liefert Gruppen, die beim Weiterlaufen ungültig werden – `list(group)` sofort auswerten.

## Zusammenfassung

- `[ausdruck for x in quelle if bedingung]` ersetzt die Sammel-Schleife.
- `if` hinten filtert, der ternäre Ausdruck vorn ersetzt Werte.
- Set-/Dict-Comprehensions bauen Mengen und Indizes in einer Zeile.
- Runde Klammern erzeugen einen **lazy** Generator – ideal für `sum`, `any`, `all`, `next`.
- `yield` schreibt eigene Generatoren; der Rumpf startet erst beim ersten `next()`.
- `next(gen, default)` statt `StopIteration` riskieren.
- `itertools.chain`, `islice`, `groupby` (nur auf sortierten Daten) decken die Standardfälle ab.
- Seiteneffekte, `break` und mehrstufige Logik gehören in eine normale Schleife.
