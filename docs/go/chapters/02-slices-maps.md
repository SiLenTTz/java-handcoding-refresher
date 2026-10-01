# Kapitel 02 – Slices & Maps

## Mental Model

```text
ARRAY   [5]int          feste Länge, Teil des TYPS, Wert-Semantik (Kopie beim Zuweisen)
  ↓
SLICE   []int           Header { ptr → Array, len, cap } – Referenz auf ein Array
  ↓
append  passt cap noch? → schreibt ins BESTEHENDE Array (Aliasing!)
        sonst          → neues Array, alte Aliase zeigen weiter aufs alte
  ↓
MAP     map[K]V         Hash-Tabelle, Referenztyp, Iterationsreihenfolge ZUFÄLLIG
```

Ein Slice ist ein kleiner Header, der auf ein Array zeigt. Kopierst du den Slice,
kopierst du nur den Header – die Daten teilen sich beide.

## Syntax / API

### Arrays vs. Slices

```go
var arr [3]int            // Array: [0 0 0], Länge ist Teil des Typs
arr2 := arr               // echte KOPIE
arr2[0] = 9               // arr bleibt [0 0 0]

s := []int{1, 2, 3}       // Slice-Literal
s2 := make([]int, 3)      // len 3, cap 3 → [0 0 0]
s3 := make([]int, 0, 10)  // len 0, cap 10 – vorreservieren
```

Faustregel: In Signaturen stehen fast immer Slices. Arrays braucht man selten.

### len und cap

```go
s := make([]int, 2, 5)
len(s) // 2 – so viele Elemente sind sichtbar
cap(s) // 5 – so viel Platz hat das darunterliegende Array ab dem Slice-Start
```

`cap` wächst beim `append` in Sprüngen (üblich: Verdopplung). Wenn du die Größe kennst,
reservier sie: `make([]T, 0, n)` spart Reallokationen.

### append und das Aliasing-Problem

```go
s := []int{1, 2, 3}
t := append(s, 4)         // cap reichte nicht → NEUES Array, s und t sind getrennt

u := make([]int, 3, 10)   // cap 10
v := append(u, 4)         // cap reichte → gleiches Array, u und v teilen Speicher
v[0] = 99                 // u[0] ist jetzt auch 99!
```

`append` gibt **immer** einen neuen Slice-Header zurück. Deshalb `s = append(s, x)` –
der Rückgabewert darf nie verworfen werden.

### copy

```go
dst := make([]int, len(src))
n := copy(dst, src)       // kopiert min(len(dst), len(src)) Elemente
```

`copy` ist der saubere Weg, ein Slice zu klonen, ohne Aliasing. Ab Go 1.21 auch `slices.Clone(src)`.

### Slicing von Slices

```go
s := []int{0, 1, 2, 3, 4}
s[1:3]     // [1 2]      – bis EXKLUSIVE 3
s[:2]      // [0 1]
s[2:]      // [2 3 4]
s[:]       // alles

part := s[1:3]
part[0] = 99              // s[1] ist jetzt 99 – gleiches Array!
part = append(part, 7)    // überschreibt s[3]!
```

Sub-Slices teilen sich das Array mit dem Original. Willst du Unabhängigkeit: `copy` oder
den **Full Slice Expression** `s[1:3:3]` (setzt cap → `append` muss neu allozieren).

### nil-Slice vs. leerer Slice

```go
var a []int          // nil,  len 0, cap 0
b := []int{}         // NICHT nil, len 0
c := make([]int, 0)  // NICHT nil, len 0

a == nil             // true
b == nil             // false
len(a) == len(b)     // true – für len/range/append identisch
```

Praktisch verhalten sie sich gleich. Unterschiedlich sind sie bei `reflect.DeepEqual`
und bei `encoding/json` (`nil` → `null`, leer → `[]`). Idiomatisch: `var a []int` als
Startwert, wenn du nur `append`st.

### Maps

```go
m := make(map[string]int)
m := map[string]int{"a": 1, "b": 2}   // Literal

m["a"] = 1              // schreiben
v := m["fehlt"]         // 0 – Zero Value, KEIN Fehler
v, ok := m["fehlt"]     // comma-ok: v == 0, ok == false
delete(m, "a")          // löschen, kein Fehler wenn nicht vorhanden
len(m)                  // Anzahl Einträge

for k, v := range m {   // Reihenfolge ist ZUFÄLLIG – bewusst so
	_ = k
	_ = v
}
```

Zählen ohne Vorprüfung geht direkt, weil der Zero Value 0 ist:

```go
counts := make(map[string]int)
for _, w := range words {
	counts[w]++
}
```

Map-Keys müssen vergleichbar sein: Zahlen, Strings, Bools, Pointer, Structs aus
vergleichbaren Feldern. **Nicht** erlaubt: Slices, Maps, Funktionen.

### Deterministisch über eine Map iterieren

```go
keys := make([]string, 0, len(m))
for k := range m {
	keys = append(keys, k)
}
sort.Strings(keys)           // oder slices.Sort(keys) ab Go 1.21
for _, k := range keys {
	fmt.Println(k, m[k])
}
```

### Sortieren

```go
sort.Ints(nums)
sort.Strings(names)
slices.Sort(nums)                        // generisch, ab Go 1.21

sort.Slice(users, func(i, j int) bool {  // Less-Funktion: "i vor j?"
	return users[i].Age < users[j].Age
})

sort.Slice(users, func(i, j int) bool {  // mehrere Kriterien
	if users[i].Age != users[j].Age {
		return users[i].Age > users[j].Age  // Alter absteigend
	}
	return users[i].Name < users[j].Name    // dann Name aufsteigend
})
```

`sort.Slice` sortiert **in place** und ist nicht stabil (`sort.SliceStable`, wenn du das brauchst).

### Slices als Funktionsparameter

```go
func fill(s []int) { s[0] = 1 }        // WIRKT auf den Aufrufer (gleiches Array)
func grow(s []int) { s = append(s, 1) } // wirkt NICHT – lokaler Header
func grow2(s []int) []int { return append(s, 1) } // richtig: zurückgeben
```

## Typische Use Cases

- Filtern/Mappen: `out := make([]T, 0, len(in))` + `append` in einer Schleife.
- Häufigkeiten zählen: `map[string]int` mit `counts[w]++`.
- Gruppieren: `map[string][]Item` mit `groups[k] = append(groups[k], item)` (funktioniert auch beim ersten Mal, weil der Zero Value ein nil-Slice ist).
- Set: `map[string]struct{}` (Wert braucht kein Byte) oder `map[string]bool`.
- Top-N: alles in ein Slice, `sort.Slice`, dann `result[:min(n, len(result))]`.
- Deduplizieren unter Erhalt der Reihenfolge: `seen := map[T]bool` + Ergebnis-Slice.

## Clean-Code-Empfehlungen

- Kapazität vorreservieren, wenn die Größe bekannt ist.
- Nimm Slices als Parameter, gib Slices zurück – `append`-Ergebnis nie verwerfen.
- Wenn eine Funktion den Input nicht verändern darf: intern kopieren und das dokumentieren.
- Gib konsistent entweder immer nil oder immer einen initialisierten Slice zurück – und schreib es in den Doc-Kommentar.
- Verlass dich nie auf die Map-Reihenfolge; für Ausgaben Keys sortieren.
- `map[string]struct{}` für Sets, wenn der Wert egal ist.
- Große Schleifenkörper in eigene Funktionen ziehen, statt sie zu verschachteln.

## Häufige Fehler

```go
// FALSCH: append-Ergebnis verworfen
append(s, 4)
// RICHTIG
s = append(s, 4)

// FALSCH: make mit Länge statt Kapazität → führende Nullen
out := make([]int, len(in))
for _, v := range in {
	out = append(out, v)   // hängt HINTER len(in) Nullen an
}
// RICHTIG
out := make([]int, 0, len(in))

// FALSCH: Sub-Slice ändert das Original
part := s[1:3]
part = append(part, 99)    // überschreibt s[3]
// RICHTIG
part := append([]int(nil), s[1:3]...)   // oder slices.Clone(s[1:3])

// FALSCH: in eine nil-Map schreiben
var m map[string]int
m["a"] = 1                 // panic
// RICHTIG
m := make(map[string]int)

// FALSCH: Existenz über den Zero Value prüfen
if m["a"] == 0 { /* "nicht vorhanden" – oder der Wert IST 0 */ }
// RICHTIG
if _, ok := m["a"]; !ok { }

// FALSCH: auf Map-Reihenfolge verlassen
for k := range m { fmt.Println(k) }   // Reihenfolge wechselt bei jedem Lauf
// RICHTIG: Keys einsammeln und sortieren

// FALSCH: Less-Funktion mit <= (nicht strikt) → sort paniced oder sortiert falsch
sort.Slice(s, func(i, j int) bool { return s[i] <= s[j] })
// RICHTIG
sort.Slice(s, func(i, j int) bool { return s[i] < s[j] })

// FALSCH: in der Schleife aus einem Slice löschen und dabei den Index behalten
for i, v := range s {
	if v == 0 { s = append(s[:i], s[i+1:]...) }  // überspringt Elemente
}
// RICHTIG: Filter-in-place mit zwei Indizes
out := s[:0]
for _, v := range s {
	if v != 0 { out = append(out, v) }
}
s = out
```

## Interview-relevante Details

- Ein Slice ist ein **Struct aus 3 Feldern** (Pointer, len, cap) und wird by value übergeben – deshalb wirken `append`s im Callee nicht nach außen, Schreibzugriffe per Index aber schon.
- **Wachstumsstrategie**: Bis etwa 256 Elemente verdoppelt Go die Kapazität, danach in kleineren Schritten (~1,25×). Garantiert ist nur amortisiert O(1).
- **Memory-Leak-Falle**: `small := huge[:2]` hält das komplette große Array am Leben. Lösung: `slices.Clone` bzw. `copy`.
- `s[a:b:c]` ist die **Full Slice Expression**: `len = b-a`, `cap = c-a`. Damit kappst du `cap` und verhinderst, dass `append` fremde Daten überschreibt.
- Die Map-**Iterationsreihenfolge ist absichtlich randomisiert**, damit sich niemand darauf verlässt.
- Maps sind **nicht** nebenläufigkeitssicher; parallele Schreibzugriffe lösen einen Runtime-Fehler aus. Lösung: `sync.Mutex` oder `sync.Map`.
- Du kannst die **Adresse eines Map-Elements nicht nehmen** (`&m["a"]` kompiliert nicht), weil die Map umziehen darf. Bei Structs in Maps: `map[K]*V` oder Wert herausholen, ändern, zurückschreiben.
- `delete` während `range` über dieselbe Map ist erlaubt und definiert.

## Zusammenfassung

- Array = Wert mit fester Länge, Slice = Header auf ein Array (`ptr`, `len`, `cap`).
- `s = append(s, v)` – Rückgabewert immer zuweisen; bei genug `cap` wird in place geschrieben (Aliasing!).
- `copy` oder `slices.Clone` für echte Kopien; Sub-Slices teilen Speicher.
- nil-Slice und leerer Slice verhalten sich fast gleich – außer bei `DeepEqual` und JSON.
- Map: `v, ok := m[k]` fürs Prüfen, `delete(m, k)` zum Löschen, Zero Value macht `m[k]++` möglich.
- Map-Iteration ist zufällig; für stabile Ausgaben Keys sortieren.
- `sort.Slice` mit strikter Less-Funktion; `slices.Sort` für einfache Typen.
