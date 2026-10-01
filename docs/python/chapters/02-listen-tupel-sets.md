# Kapitel 02 – Listen, Tupel & Sets

## Mental Model

```text
list   [1, 2, 2]   geordnet   veränderlich   Duplikate ok    "die Arbeitsliste"
tuple  (1, 2, 2)   geordnet   unveränderlich Duplikate ok    "ein fester Datensatz"
set    {1, 2}      ungeordnet veränderlich   eindeutig       "die Mengenfrage"

x in liste  → O(n)   (jedes Element prüfen)
x in set    → O(1)   (Hash-Lookup)
```

- **Liste** = Reihenfolge zählt, Inhalt ändert sich. **Tupel** = zusammengehörige Werte, die sich nicht ändern. **Set** = "ist das drin?" und "was ist der Unterschied?".
- Sets und Dict-Keys brauchen **hashbare** (= unveränderliche) Elemente.

## Syntax / API

### Erzeugen

```python
numbers = [1, 2, 3]
empty: list[int] = []
point = (3, 4)                  # Klammern optional: point = 3, 4
single = (42,)                  # Komma macht das Tupel, nicht die Klammer!
tags = {"a", "b"}
empty_set = set()               # {} wäre ein leeres dict
frozen = frozenset({"a", "b"})  # hashbar → als Dict-Key/Set-Element nutzbar
```

### Listen-Operationen

```python
items = ["a", "b"]
items.append("c")          # ein Element ans Ende
items.extend(["d", "e"])   # mehrere anhängen
items.insert(0, "x")       # an Position (O(n))
items.remove("b")          # erstes Vorkommen, ValueError wenn fehlt
last = items.pop()         # letztes Element entfernen und liefern
first = items.pop(0)       # O(n) – bei Queues lieber deque
items.index("a")           # Position, ValueError wenn fehlt
items.count("a")           # Vorkommen
items.clear()

combined = [1, 2] + [3]    # neue Liste
repeated = [0] * 3         # [0, 0, 0]
merged = [*a, *b]          # Unpacking, liest sich besser als +
```

### Slicing inkl. Schrittweite

```python
xs = [0, 1, 2, 3, 4, 5]
xs[1:4]        # [1, 2, 3]
xs[:2]         # [0, 1]
xs[-2:]        # [4, 5]     – die letzten beiden
xs[::2]        # [0, 2, 4]
xs[::-1]       # [5, 4, 3, 2, 1, 0] – neue, umgedrehte Liste
xs[1:3] = [9]  # Slice-Zuweisung: [0, 9, 3, 4, 5]
del xs[0]      # entfernt an Position
```

`xs[:]` und `list(xs)` erzeugen eine **flache Kopie**.

### `sort` vs. `sorted`

```python
xs = [3, 1, 2]
xs.sort()                   # in-place, Rückgabe None!
new = sorted(xs)            # neue Liste, Original unverändert
sorted({"b", "a"})          # ['a', 'b'] – sorted nimmt jedes Iterable, liefert immer list
```

### `key=` und `reverse=`

```python
words = ["Birne", "apfel", "Kirsche"]
sorted(words)                        # ['Birne', 'Kirsche', 'apfel'] – ASCII: Groß vor Klein
sorted(words, key=str.lower)         # ['apfel', 'Birne', 'Kirsche']
sorted(words, key=len, reverse=True)

people = [("Anna", 30), ("Bo", 25), ("Cy", 30)]
sorted(people, key=lambda p: p[1])                 # nach Alter
sorted(people, key=lambda p: (-p[1], p[0]))        # Alter absteigend, Name aufsteigend
```

`sorted` ist **stabil**: gleiche Keys behalten ihre ursprüngliche Reihenfolge. Damit kann man auch in zwei Durchgängen sortieren (erst Nebenkriterium, dann Hauptkriterium).

```python
max(people, key=lambda p: p[1])      # ('Anna', 30) – erster Treffer bei Gleichstand
min(words, key=len)
```

### Kopien: flach vs. tief

```python
original = [[1, 2], [3]]
shallow = list(original)        # gleiche innere Listen!
shallow[0].append(99)           # original[0] ist jetzt [1, 2, 99]

import copy
deep = copy.deepcopy(original)  # komplett eigenständig
```

### Set-Operationen

```python
a = {1, 2, 3}
b = {3, 4}

a | b        # {1, 2, 3, 4}   union
a & b        # {3}            intersection
a - b        # {1, 2}         difference
a ^ b        # {1, 2, 4}      symmetric_difference

a.add(5)
a.discard(9)         # kein Fehler, wenn nicht drin
a.remove(9)          # KeyError, wenn nicht drin
a.issubset(b)
{1, 2} <= {1, 2, 3}  # True – Teilmenge
```

### Tupel als Value Object

```python
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x, p[0]                 # beides 3
p._replace(x=9)           # neues Tupel

def min_max(xs: list[int]) -> tuple[int, int]:
    return min(xs), max(xs)

low, high = min_max([3, 1, 7])
```

Für mehr als zwei, drei Felder: lieber `@dataclass(frozen=True)` (Kapitel 06) – benannt, typisiert, erweiterbar.

### Performance (O-Notation)

| Operation | list | set | tuple |
|---|---|---|---|
| `x in c` | O(n) | **O(1)** | O(n) |
| `append` / `add` | O(1) amortisiert | O(1) | – |
| `insert(0, x)` / `pop(0)` | O(n) | – | – |
| Indexzugriff `c[i]` | O(1) | – | O(1) |
| `sorted(c)` | O(n log n) | O(n log n) | O(n log n) |

Faustregel: Steht `in` in einer Schleife, gehört die rechte Seite in ein `set`.

## Typische Use Cases

- Zwischenergebnisse sammeln → `list` (oder gleich Comprehension, Kapitel 04).
- "Welche IDs sind neu / weggefallen?" → `set(new) - set(old)`.
- Duplikate entfernen, Reihenfolge egal → `set(items)`; Reihenfolge wichtig → `dict.fromkeys(items)`.
- Mehrere Rückgabewerte, Dict-Keys, Koordinaten → `tuple`.
- Top-N-Listen → `sorted(..., key=..., reverse=True)[:n]`.
- Whitelists/Blacklists als Modulkonstante → `frozenset({...})`.

## Clean-Code-Empfehlungen

- `sorted(...)` bevorzugen, wenn der Aufrufer das Original noch braucht – `sort()` nur bewusst in-place.
- Funktionen, die eine Liste bekommen, sollten sie nicht heimlich verändern; gib eine neue Liste zurück.
- `key=`-Funktionen benennen, sobald das Lambda länger als eine Zeile wäre.
- Sprechende Namen statt Index-Zugriff: `namedtuple`/Dataclass statt `row[3]`.
- Für Mengenfragen echte Set-Operatoren nutzen statt verschachtelter Schleifen.
- Große Konstanten als `frozenset` – unveränderlich und schnell.

## Häufige Fehler

```python
# FALSCH: sort() liefert None
top = [3, 1, 2].sort()[:2]          # TypeError
# RICHTIG
top = sorted([3, 1, 2])[:2]

# FALSCH: Einzel-Tupel ohne Komma
one = ("a")        # das ist ein str!
# RICHTIG
one = ("a",)

# FALSCH: Liste multiplizieren mit inneren Listen
grid = [[0] * 3] * 2
grid[0][0] = 1                       # beide Zeilen ändern sich
# RICHTIG
grid = [[0] * 3 for _ in range(2)]

# FALSCH: while der Iteration entfernen
for item in items:
    if item.startswith("_"):
        items.remove(item)           # überspringt Elemente
# RICHTIG
items = [i for i in items if not i.startswith("_")]

# FALSCH: O(n²) durch "in liste" in der Schleife
duplicates = [x for x in a if x in b]        # b ist eine Liste
# RICHTIG
b_set = set(b)
duplicates = [x for x in a if x in b_set]

# FALSCH: set(...) zerstört die Reihenfolge
unique = list(set(names))            # Reihenfolge nicht definiert
# RICHTIG (Reihenfolge erhalten, ab 3.7 garantiert)
unique = list(dict.fromkeys(names))

# FALSCH: flache Kopie schützt nur die äußere Ebene
snapshot = list(rows)
snapshot[0].append("x")              # rows[0] ändert sich mit
# RICHTIG
snapshot = copy.deepcopy(rows)

# FALSCH: Liste als Set-Element
seen = {[1, 2]}                      # TypeError: unhashable type: 'list'
# RICHTIG
seen = {(1, 2)}
```

## Interview-relevante Details

- **Warum ist `in` beim Set O(1)?** Weil das Element gehasht und direkt im Bucket gesucht wird. Bedingung: `__hash__` und `__eq__` sind konsistent.
- **Hashbarkeit**: `tuple` ist nur hashbar, wenn **alle** Elemente hashbar sind – `(1, [2])` ist es nicht.
- **Stabilität von `sorted`** (Timsort) erlaubt mehrstufiges Sortieren; Timsort ist auf vorsortierte Daten optimiert (best case O(n)).
- **`list.append` ist O(1) amortisiert**, weil die Kapazität überproportional wächst; `insert(0, x)` verschiebt dagegen alles.
- **Set-Reihenfolge** ist eine Implementierungsfolge der Hashwerte, keine Zusicherung – nie darauf verlassen, immer `sorted(...)` beim Vergleichen.
- **Tupel vs. Liste als Signaturtyp**: Ein Tupel signalisiert "feste Struktur, feste Länge", eine Liste "beliebig viele gleichartige Elemente".
- **`sorted` mit `key=`** ruft die Key-Funktion genau einmal pro Element auf (Decorate-Sort-Undecorate) – auch teure Keys sind also bezahlbar.

## Zusammenfassung

- `list` für Reihenfolge und Änderungen, `tuple` für feste Datensätze, `set` für Eindeutigkeit und Mengenlogik.
- `sort()` verändert in-place und gibt `None` zurück; `sorted()` liefert eine neue Liste.
- `key=` plus Tupel-Key (`(-score, name)`) löst fast jede Mehrfachsortierung.
- Kopien sind standardmäßig flach – verschachtelte Strukturen brauchen `copy.deepcopy`.
- Set-Operatoren `|`, `&`, `-`, `^` ersetzen verschachtelte Schleifen.
- `in` auf Listen ist O(n): in Schleifen vorher ein `set` bauen.
- Reihenfolge-erhaltende Deduplizierung: `list(dict.fromkeys(items))`.
