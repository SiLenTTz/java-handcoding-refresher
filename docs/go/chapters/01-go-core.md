# Kapitel 01 – Go Core

## Mental Model

```text
DEKLARATION      var x int = 5   |   x := 5   |   const Max = 100
  ↓
ZERO VALUE       jede Variable ist sofort gültig: 0, "", false, nil
  ↓
TYPEN            keine impliziten Konvertierungen – int64(x), string(r), []byte(s)
  ↓
KONTROLLFLUSS    nur for (in 4 Varianten), switch ohne break, if mit Init-Statement
  ↓
RÜCKGABE         (wert, error) – Fehler sind normale Rückgabewerte
```

Go hat bewusst wenig Features: eine Schleife, ein Sichtbarkeitsregel (Groß-/Kleinschreibung),
keine Vererbung, keine Exceptions. Was du siehst, passiert auch genau so.

## Syntax / API

### Variablen deklarieren

```go
var count int        // 0  – explizit mit Typ
var name = "Jan"     // Typ wird abgeleitet (string)
count := 5           // Kurzform, nur INNERHALB von Funktionen
var a, b = 1, "x"    // mehrere auf einmal

var (
	host string = "localhost"
	port int    = 8080
)
```

`:=` deklariert **und** weist zu. Auf Paketebene (außerhalb von Funktionen) ist nur `var` erlaubt.

### Zero Values

Es gibt kein „uninitialisiert“. Jeder Typ hat einen sinnvollen Nullwert:

| Typ | Zero Value |
|---|---|
| `int`, `float64` | `0`, `0.0` |
| `string` | `""` (nicht `nil`!) |
| `bool` | `false` |
| Pointer, Slice, Map, Channel, Func, Interface | `nil` |
| Struct | Struct mit lauter Zero Values |

```go
var s []int            // nil, aber len(s) == 0 und append(s, 1) funktioniert
var m map[string]int   // nil – Lesen ok, SCHREIBEN paniced
```

### Konstanten und iota

```go
const MaxRetries = 3               // untypisierte Konstante, passt zu int/int64/float64
const Greeting string = "hallo"    // typisiert

type Level int

const (
	Debug Level = iota // 0
	Info               // 1
	Warn               // 2
	Error              // 3
)
```

`iota` zählt innerhalb eines `const`-Blocks pro Zeile hoch und startet bei 0.
Typische Variante für Flags: `1 << iota` → 1, 2, 4, 8.

### Typen und Konvertierungen

Go konvertiert **nie** implizit – auch nicht zwischen `int` und `int64`.

```go
var i int = 42
var f float64 = float64(i)   // Pflicht
var u uint8 = uint8(i)

type UserID int64            // eigener Typ, nicht austauschbar mit int64
var id UserID = UserID(7)
```

Eigene Typen (`type UserID int64`) kosten nichts zur Laufzeit und verhindern Vertauscher.

### Strings, []byte, []rune

Ein `string` ist eine **unveränderliche Folge von Bytes** (UTF-8).

```go
s := "Größe"
len(s)                 // 7 – BYTES, nicht Zeichen! (ö und ß brauchen je 2)
len([]rune(s))         // 5 – Zeichen (Code Points)
s[0]                   // 71 – ein byte (uint8), kein string

for i, r := range s {  // range über einen string liefert rune + Byte-Index
	fmt.Println(i, string(r))
}

b := []byte(s)         // Kopie als Bytes
r := []rune(s)         // Kopie als Runes
string(b)              // zurück
```

Strings bauen: `strings.Builder` statt `+=` in Schleifen.

### for – die einzige Schleife

```go
for i := 0; i < 10; i++ { }        // klassisch
for i < 10 { }                     // while
for { break }                      // Endlosschleife
for i, v := range items { }        // range über Slice/Map/String/Channel
for range items { }                // nur zählen
```

### switch ohne break

```go
switch level {
case Debug, Info:            // mehrere Werte pro case
	return "leise"
case Warn:
	return "laut"
default:
	return "unbekannt"
}

switch {                     // switch ohne Ausdruck = aufgeräumte if/else-Kette
case n < 0:
	return "negativ"
case n == 0:
	return "null"
default:
	return "positiv"
}
```

Kein `break` nötig – Go fällt **nicht** durch. Wer das will, schreibt `fallthrough`.

### Sichtbarkeit

```go
func Export()   {} // Großbuchstabe → außerhalb des Packages sichtbar (public)
func internal() {} // Kleinbuchstabe → nur im eigenen Package (package-private)
```

Das gilt für Funktionen, Typen, Felder, Methoden und Konstanten. Es gibt kein `private`-Keyword.

### Pointer

```go
x := 10
p := &x        // *int – Adresse von x
fmt.Println(*p) // 10 – Dereferenzieren
*p = 20        // x ist jetzt 20

func bump(n *int) { *n++ }   // ändert den Aufrufer
func copyOnly(n int) { n++ } // ändert nichts
```

Keine Pointer-Arithmetik. `new(int)` liefert einen `*int` auf den Zero Value.

### Mehrfachrückgabe

```go
func divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("division durch null")
	}
	return a / b, nil
}

result, err := divide(10, 2)
if err != nil {
	return err          // früh zurückkehren
}

value, ok := cache["key"] // comma-ok-Idiom
_ = value                 // _ verwirft einen Wert
```

## Typische Use Cases

- `(wert, error)` für alles, was schiefgehen kann – statt Exceptions.
- `(wert, ok bool)` für Lookups, die leer sein dürfen.
- `type UserID int64` / `type Status string` statt roher Primitives in Signaturen.
- `iota`-Konstanten für Enums (Log-Level, Status, Zustände).
- `switch` ohne Ausdruck statt langer `if/else if`-Ketten.
- `[]rune` nur dann, wenn du wirklich zeichenweise arbeitest (Reverse, Zählen).

## Clean-Code-Empfehlungen

- Kurze Namen in kurzem Scope (`i`, `s`, `err`), sprechende Namen im großen Scope.
- Kein `Get`-Präfix: `user.Name()`, nicht `user.GetName()`.
- Früh zurückkehren. Der Happy Path steht links, nicht eingerückt.
- `err` sofort prüfen, nie ignorieren – `_ = err` nur mit Kommentar.
- Exportiere so wenig wie möglich; klein anfangen, später groß schreiben.
- `:=` in Funktionen, `var` nur für Zero Values (`var buf strings.Builder`).
- `gofmt` entscheidet über Formatierung – nicht diskutieren.

## Häufige Fehler

```go
// FALSCH: ungenutzte Variable und ungenutzter Import sind COMPILERFEHLER
import "os"
x := compute()
// RICHTIG: benutzen, entfernen oder bewusst verwerfen
_ = compute()

// FALSCH: := auf Paketebene
count := 0
// RICHTIG
var count = 0

// FALSCH: := überschreibt nicht, sondern schattet in einem neuen Scope
err := doA()
if true {
	err := doB()   // NEUE Variable, die äußere bleibt unverändert
	_ = err
}
// RICHTIG
if true {
	err = doB()
}

// FALSCH: implizite Konvertierung erwartet
var i int = 5
var f float64 = i
// RICHTIG
var f float64 = float64(i)

// FALSCH: string(int) erzeugt ein Unicode-Zeichen, keine Zahl
s := string(65)          // "A"
// RICHTIG
s := strconv.Itoa(65)    // "65"

// FALSCH: len() zählt Bytes, nicht Zeichen
len("Größe")             // 7
// RICHTIG
len([]rune("Größe"))     // 5

// FALSCH: in eine nil-Map schreiben
var m map[string]int
m["a"] = 1               // panic: assignment to entry in nil map
// RICHTIG
m := make(map[string]int)

// FALSCH: Fehler ignorieren und trotzdem weiterarbeiten
v, _ := divide(1, 0)
// RICHTIG
v, err := divide(1, 0)
if err != nil {
	return 0, err
}
```

## Interview-relevante Details

- **Zero Value ist nutzbar**: `var buf strings.Builder` und `var mu sync.Mutex` funktionieren ohne Konstruktor. Das ist ein Designziel („make the zero value useful“).
- **Untypisierte Konstanten** haben beliebige Präzision und passen sich dem Zieltyp an: `const K = 1 << 40` ist auch auf 32-Bit-`int`-Systemen gültig, solange du es einem `int64` zuweist.
- **`byte` ist `uint8`, `rune` ist `int32`** – reine Aliase.
- **Strings sind immutable**: `s[0] = 'x'` kompiliert nicht. Jede Änderung erzeugt einen neuen String.
- **Shadowing** ist die häufigste Bugquelle bei `:=`; `go vet` und Linter finden es.
- **Kein `++x`**, nur `x++`, und das ist ein **Statement**, kein Ausdruck (`y := x++` kompiliert nicht).
- **Alles wird by value übergeben** – auch Slices und Maps. Bei denen wird nur der kleine Header kopiert, der auf dieselben Daten zeigt.
- Switch-Cases dürfen beliebige Ausdrücke enthalten (`switch { case n > 10: }`), Duplikate bei Konstanten sind ein Compilerfehler.

## Zusammenfassung

- `var` für Zero Values, `:=` innerhalb von Funktionen, `const`+`iota` für Enums.
- Jeder Typ hat einen brauchbaren Zero Value; `nil`-Slice ist benutzbar, `nil`-Map nur lesbar.
- Keine impliziten Konvertierungen – `float64(i)`, `strconv.Itoa(i)`, `[]rune(s)`.
- `string` = Bytes; `len` zählt Bytes, `range` liefert Runes.
- `for` ist die einzige Schleife; `switch` fällt nicht durch.
- Sichtbarkeit über Groß-/Kleinschreibung.
- Fehler sind Rückgabewerte: `if err != nil { return ... }` – früh zurückkehren.
