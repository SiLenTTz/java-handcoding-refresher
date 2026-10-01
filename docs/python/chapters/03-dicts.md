# Kapitel 03 – Dicts

## Mental Model

```text
dict = Hash-Map:  KEY (hashbar, eindeutig)  ──>  VALUE (beliebig)

{"id": 1, "name": "Jan"}
   │        └── Zugriff O(1) über den Hash des Keys
   └── Einfügereihenfolge bleibt erhalten (garantiert ab Python 3.7)

d[k]            KeyError wenn fehlt      → "muss da sein"
d.get(k)        None wenn fehlt          → "darf fehlen"
d.setdefault(k) legt an und liefert      → "anlegen falls nötig"
```

- Ein Dict ist die Standard-Datenstruktur für "Nachschlagen nach Schlüssel", Gruppierungen, Zählungen und Konfiguration.
- Keys müssen **hashbar** sein: `str`, `int`, `tuple`, `frozenset`, Enum – **keine** Listen oder Dicts.

## Syntax / API

### Grundlagen

```python
user = {"id": 1, "name": "Jan", "role": "admin"}

user["name"]                  # 'Jan'
user["email"]                 # KeyError: 'email'
user.get("email")             # None
user.get("email", "-")        # '-'  (Default wird NICHT gespeichert)

user["email"] = "a@b.de"      # anlegen oder überschreiben
del user["role"]              # KeyError, wenn nicht da
user.pop("role", None)        # entfernen mit Default, kein Fehler
"name" in user                # True – prüft KEYS, nicht Values
len(user)
user.clear()
```

### `get` vs. `setdefault`

```python
counts = {}
counts["a"] = counts.get("a", 0) + 1          # Zähler ohne Vorbelegung

groups = {}
groups.setdefault("admin", []).append("Jan")  # Liste anlegen, falls nötig
```

`get` liest nur, `setdefault` **schreibt** den Default ins Dict und gibt ihn zurück.

### `defaultdict`

```python
groups: defaultdict[str, list[str]] = defaultdict(list)
for user in users:
    groups[user.role].append(user.name)       # kein setdefault nötig

totals = defaultdict(int)
totals["a"] += 1                              # startet bei 0
```

Achtung: Jeder **Lesezugriff** auf einen fehlenden Key legt ihn an. Vor der Rückgabe oft `dict(groups)` bauen.

### `Counter`

```python
c = Counter(["a", "b", "a"])
c["a"]                    # 2
c["zzz"]                  # 0 – kein KeyError
c.most_common(2)          # [('a', 2), ('b', 1)]
c.total()                 # 3  (ab 3.10)
Counter("mississippi").most_common(1)         # [('i', 4)]
c.update(["b"])           # addiert
Counter({"a": 2}) + Counter({"a": 1})         # Counter({'a': 3})
```

### Iteration

```python
for key in user: ...                # Keys (Default)
for key in user.keys(): ...
for value in user.values(): ...
for key, value in user.items(): ... # der Normalfall

list(user.items())                  # [('id', 1), ('name', 'Jan')]
```

`keys()`, `values()`, `items()` sind **Views**: sie spiegeln spätere Änderungen und kopieren nichts.

### Dict-Comprehension

```python
{u.id: u.name for u in users}
{k: v for k, v in raw.items() if v is not None}       # None-Werte filtern
{k.lower(): v for k, v in raw.items()}                # Keys normalisieren
{v: k for k, v in mapping.items()}                    # invertieren (Werte müssen eindeutig sein)
dict.fromkeys(["a", "b"], 0)                          # {'a': 0, 'b': 0}
```

### Sortieren nach Wert

```python
scores = {"anna": 3, "bo": 7, "cy": 7}

sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
# [('bo', 7), ('cy', 7), ('anna', 3)]

# Wert absteigend, bei Gleichstand Key aufsteigend – deterministisch:
sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))

top3 = dict(sorted(scores.items(), key=lambda kv: -kv[1])[:3])
max(scores, key=scores.get)          # 'bo' – Key mit höchstem Wert
```

### Mergen

```python
defaults = {"limit": 10, "debug": False}
override = {"limit": 50}

merged = defaults | override          # ab 3.9 – neues Dict, rechts gewinnt
defaults |= override                  # in-place
merged = {**defaults, **override}     # ältere Schreibweise
defaults.update(override)             # in-place, gibt None zurück
```

### Verschachtelte Dicts

```python
config = {"db": {"host": "localhost", "port": 5432}}

config["db"]["port"]                          # 5432
config.get("db", {}).get("timeout", 30)       # sicher, auch wenn 'db' fehlt

def deep_get(data: dict, *keys, default=None):
    for key in keys:
        if not isinstance(data, dict) or key not in data:
            return default
        data = data[key]
    return data
```

### Dict statt `switch`

```python
HANDLERS = {
    "csv": parse_csv,
    "json": parse_json,
}

def parse(fmt: str, raw: str) -> list[dict]:
    handler = HANDLERS.get(fmt)
    if handler is None:
        raise ValueError(f"unbekanntes Format: {fmt}")
    return handler(raw)
```

Ein Dict von Funktionen ersetzt lange `if/elif`-Ketten und ist erweiterbar, ohne die Funktion anzufassen. Für Mustererkennung auf Strukturen gibt es ab 3.10 zusätzlich `match/case`.

## Typische Use Cases

- Nachschlagen per ID: `by_id = {u.id: u for u in users}` statt Liste linear durchsuchen.
- Gruppieren: `defaultdict(list)` + `items()`-Iteration.
- Zählen und Top-N: `Counter(...).most_common(n)`.
- Konfiguration aus Defaults + Env + Datei mergen (`|`).
- JSON-Payloads verarbeiten (`json.loads` liefert Dicts).
- Dispatch-Tabellen statt `if/elif`-Ketten.

## Clean-Code-Empfehlungen

- `get(key, default)` wenn ein Wert fehlen **darf**; `d[key]` wenn sein Fehlen ein Bug ist.
- `defaultdict` für Aufbau-Phasen, aber nach außen ein normales `dict` zurückgeben.
- Über `items()` iterieren statt `for k in d: d[k]`.
- Keys als Konstanten oder `Enum` statt magischer Strings im ganzen Code.
- Tief verschachtelte Dicts sind ein Geruch – ab 2–3 Ebenen lieber Dataclasses (Kapitel 06).
- Beim Sortieren immer einen eindeutigen Tiebreaker angeben, sonst sind Ergebnisse nur scheinbar stabil.

## Häufige Fehler

```python
# FALSCH: fehlender Key sprengt den Request
email = payload["email"]
# RICHTIG
email = payload.get("email")
if email is None:
    raise ValueError("email fehlt")

# FALSCH: get() legt nichts an – die Liste ist sofort weg
groups.get(role, []).append(name)
# RICHTIG
groups.setdefault(role, []).append(name)

# FALSCH: in prüft Keys, nicht Values
if "Jan" in user: ...                  # sucht den KEY 'Jan'
# RICHTIG
if "Jan" in user.values(): ...

# FALSCH: Dict während der Iteration verändern
for key in counts:
    if counts[key] == 0:
        del counts[key]                # RuntimeError
# RICHTIG
counts = {k: v for k, v in counts.items() if v != 0}

# FALSCH: unhashbarer Key
cache = {[1, 2]: "x"}                  # TypeError: unhashable type: 'list'
# RICHTIG
cache = {(1, 2): "x"}

# FALSCH: update() gibt None zurück
config = defaults.update(override)     # config ist None
# RICHTIG
config = defaults | override

# FALSCH: defaultdict legt beim Lesen an
stats = defaultdict(int)
if stats["unbekannt"] > 0: ...         # Key existiert jetzt
# RICHTIG
if stats.get("unbekannt", 0) > 0: ...

# FALSCH: Sortieren ohne Tiebreaker bei gleichen Werten
sorted(scores.items(), key=lambda kv: -kv[1])
# RICHTIG (deterministisch)
sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
```

## Interview-relevante Details

- **Reihenfolge**: Ab CPython 3.6 Implementierungsdetail, ab 3.7 **Sprachgarantie** – Dicts behalten die Einfügereihenfolge.
- **Hash-Vertrag**: Gleiche Objekte müssen gleichen Hash haben. Wer `__eq__` überschreibt, muss `__hash__` mitliefern, sonst ist die Klasse unhashbar.
- **Kollisionen** löst CPython per Open Addressing; im Worst Case wird ein Lookup O(n), praktisch ist er O(1).
- **`dict` vs. `dataclass`**: Dicts sind flexibel, aber typlos und tippfehleranfällig – für feste Strukturen gehört eine Dataclass her.
- **`defaultdict` vs. `setdefault`**: `setdefault` wertet den Default **immer** aus (auch wenn der Key existiert), `defaultdict` ruft die Factory nur bei Bedarf.
- **`Counter` ist ein `dict`**: fehlende Keys liefern `0`, `most_common()` sortiert absteigend und ist bei Gleichstand nach Einfügereihenfolge stabil.
- **Views sind live**: `keys()` nach einer Änderung neu auswerten – oder `list(d.keys())` nehmen, wenn du während der Iteration löschen willst.

## Zusammenfassung

- Dict = O(1)-Lookup über hashbare Keys, Einfügereihenfolge garantiert.
- `d[k]` für Pflichtfelder, `get` für optionale, `setdefault`/`defaultdict` für Sammel-Container.
- `Counter` zählt, `most_common(n)` liefert Top-N.
- Iteration idiomatisch über `items()`; nie während der Iteration strukturell ändern.
- Dict-Comprehensions bauen Indizes, filtern und normalisieren Keys.
- Nach Wert sortieren: `sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))`.
- `|` merged unveränderlich; `update` verändert und gibt `None` zurück.
- Dispatch-Dicts ersetzen `if/elif`-Ketten.
