import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    { id: 'f1', front: 'Unterschied zwischen `var x = 5` und `x := 5`?', back: 'Inhaltlich identisch. `:=` ist die Kurzform und **nur innerhalb von Funktionen** erlaubt. Auf Paketebene geht nur `var`.' },
    { id: 'f2', front: 'Was ist ein Zero Value – und welche gibt es?', back: 'Der Wert, den eine Variable ohne explizite Initialisierung hat.\n\n`0` (Zahlen), `""` (string), `false` (bool), `nil` (Pointer, Slice, Map, Channel, Func, Interface), Struct mit lauter Zero Values.' },
    { id: 'f3', front: 'nil-Slice vs. nil-Map – was geht, was paniced?', back: 'nil-Slice: `len`, `range` und `append` funktionieren.\n\nnil-Map: Lesen liefert den Zero Value, **Schreiben paniced**. Deshalb `m := make(map[string]int)`.' },
    { id: 'f4', front: 'Wie definierst du ein Enum in Go?', back: '```go\ntype Level int\n\nconst (\n\tDebug Level = iota\n\tInfo\n\tWarn\n)\n```\n`iota` zählt pro Zeile im `const`-Block hoch, beginnend bei 0.' },
    { id: 'f5', front: 'Warum kompiliert `var f float64 = i` mit `var i int = 5` nicht?', back: 'Go konvertiert **nie** implizit – auch nicht zwischen Zahlentypen. Richtig: `var f float64 = float64(i)`.' },
    { id: 'f6', front: 'Was liefert `len("Größe")` und warum?', back: '`7`. `len` auf einem string zählt **Bytes**, nicht Zeichen – `ö` und `ß` brauchen in UTF-8 je zwei Bytes. Zeichen zählen: `len([]rune("Größe"))` → `5`.' },
    { id: 'f7', front: 'Was ist der Unterschied zwischen `string(65)` und `strconv.Itoa(65)`?', back: '`string(65)` interpretiert 65 als Code Point → `"A"`. `strconv.Itoa(65)` formatiert die Zahl → `"65"`. Fast immer willst du `strconv`.' },
    { id: 'f8', front: 'Welche Schleifenformen gibt es in Go?', back: 'Nur `for` – in vier Varianten:\n```go\nfor i := 0; i < n; i++ {}\nfor cond {}          // while\nfor {}               // endlos\nfor i, v := range x {}\n```' },
    { id: 'f9', front: 'Braucht ein `case` in Go ein `break`?', back: 'Nein, Go fällt nicht durch. Wer das Durchfallen will, schreibt explizit `fallthrough`. Mehrere Werte pro Case: `case Debug, Info:`.' },
    { id: 'f10', front: 'Wie steuert man Sichtbarkeit in Go?', back: 'Über den ersten Buchstaben des Namens: **Groß** = außerhalb des Packages sichtbar, **klein** = nur im eigenen Package. Es gibt kein `public`/`private`.' },
    { id: 'f11', front: 'Was ist das comma-ok-Idiom?', back: 'Ein zweiter `bool`-Rückgabewert, der sagt, ob der Wert echt ist:\n```go\nv, ok := m["key"]\nif !ok { /* nicht vorhanden */ }\n```\nGleiches Muster bei Type Assertions und Channel-Reads.' },
    { id: 'f12', front: 'Was ist Shadowing bei `:=` – und warum ist das gefährlich?', back: '`:=` in einem inneren Block erzeugt eine **neue** Variable, statt die äußere zu überschreiben:\n```go\nerr := doA()\nif cond {\n\terr := doB() // neue Variable!\n}\n```\nDie äußere `err` bleibt unverändert – Fehler gehen verloren. Innen `err = doB()` schreiben.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `var s []int
var m map[string]int
fmt.Println(len(s), len(m), s == nil)`,
      options: ['`0 0 true`', '`0 0 false`', 'panic: nil map', '`nil nil true`'],
      correct: 0,
      explanation: '`len` funktioniert auf nil-Slices und nil-Maps und liefert 0. Der Vergleich `s == nil` ist `true`. Erst das **Schreiben** in eine nil-Map paniced.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `const (
	A = iota
	B
	_
	D
)
fmt.Println(A, B, D)`,
      options: ['`0 1 2`', '`0 1 3`', '`1 2 4`', '`0 1 nil`'],
      correct: 1,
      explanation: '`iota` zählt pro Zeile im const-Block hoch – auch für das verworfene `_`. Also A=0, B=1, `_`=2, D=3.',
    },
    {
      id: 'q3',
      prompt: 'Warum kompiliert das nicht?',
      code: `func total(prices []int) int {
	sum := 0
	count := len(prices)
	for _, p := range prices {
		sum += p
	}
	return sum
}`,
      options: [
        '`range` braucht beide Variablen',
        '`count` wird deklariert, aber nie benutzt – das ist ein Compilerfehler',
        '`sum += p` ist kein gültiges Go',
        '`_` ist als Variablenname nicht erlaubt',
      ],
      correct: 1,
      explanation: 'Ungenutzte **lokale** Variablen (und ungenutzte Imports) sind in Go harte Compilerfehler, keine Warnungen. Zeile löschen oder `_ = count`.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `s := "héllo"
fmt.Println(len(s), len([]rune(s)))`,
      options: ['`5 5`', '`6 5`', '`5 6`', '`6 6`'],
      correct: 1,
      explanation: '`é` belegt in UTF-8 zwei Bytes → `len(s)` ist 6. Als `[]rune` sind es 5 Code Points.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Bug?',
      code: `func load() error {
	data, err := read()
	if err != nil {
		return err
	}
	if len(data) == 0 {
		err := fetch()
		if err != nil {
			return err
		}
	}
	return nil
}`,
      options: [
        'Kein Bug',
        '`data` müsste ein Pointer sein',
        'Das innere `err :=` schattet – hier harmlos, aber genau so gehen Fehler verloren',
        '`return nil` ist bei Rückgabetyp `error` nicht erlaubt',
      ],
      correct: 2,
      explanation: 'Das innere `:=` erzeugt eine neue `err`-Variable in einem neuen Scope. Hier wird sie noch geprüft; in der typischen Bug-Variante ohne `if` ginge der Fehler stillschweigend verloren. Innen `err = fetch()` verwenden.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `x := 10
p := &x
*p = *p * 2
fmt.Println(x)`,
      options: ['`10`', '`20`', 'die Adresse von x', 'Compilerfehler'],
      correct: 1,
      explanation: '`p` zeigt auf `x`. `*p = *p * 2` schreibt durch den Pointer in dieselbe Speicherstelle – `x` ist danach 20.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisches Go?',
      options: [
        '`func GetUser(id int64) (User, bool) { ... }` und im Fehlerfall `false`',
        '`func FindUser(id int64) (User, error) { ... }` – Fehler als zweiter Rückgabewert, früh zurückkehren',
        '`func FindUser(id int64) User { panic("not found") }`',
        '`func FindUser(id int64) *UserOrError { ... }`',
      ],
      correct: 1,
      explanation: 'Fehler sind in Go normale Rückgabewerte. `panic` ist für Programmierfehler reserviert. Das `(wert, ok)`-Muster passt nur für reine Lookups ohne Fehlerursache.',
    },
    {
      id: 'q8',
      prompt: 'Was gibt `classify(0)` zurück?',
      code: `func classify(n int) string {
	switch {
	case n < 0:
		return "negativ"
	case n == 0:
		return "null"
	default:
		return "positiv"
	}
}`,
      options: ['`"negativ"`', '`"null"`', '`"positiv"`', '`""` – es fehlt ein `break`'],
      correct: 1,
      explanation: 'Ein `switch` ohne Ausdruck prüft die Cases der Reihe nach als Bedingungen. Der erste passende Case gewinnt, ein `break` ist nie nötig.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Division mit Fehler',
      level: 1,
      description: `Implementiere zwei Funktionen:

- \`Divide(a, b int) (int, error)\` – Ganzzahldivision. Bei \`b == 0\` gib \`0\` und einen Fehler zurück.
- \`DivideOrZero(a, b int) int\` – nutzt \`Divide\` und liefert bei Fehler einfach \`0\`.

Kehre früh zurück (\`if err != nil { return ... }\`) – so schreibt man Go.`,
      starter: `func Divide(a, b int) (int, error) {
	// TODO
	return 0, nil
}

func DivideOrZero(a, b int) int {
	// TODO
	return 0
}`,
      solution: `import "errors"

var ErrDivideByZero = errors.New("division durch null")

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return a / b, nil
}

func DivideOrZero(a, b int) int {
	result, err := Divide(a, b)
	if err != nil {
		return 0
	}
	return result
}`,
      hints: [
        'Go hat keine Exceptions: Fehler sind ein zweiter Rückgabewert vom Typ `error`.',
        '`errors.New("...")` erzeugt einen Fehler. Sentinel-Fehler legt man als Paketvariable `var ErrXyz = errors.New(...)` an.',
        'Divide: wenn b == 0 → return 0, Fehler. Sonst return a/b, nil. DivideOrZero: Divide aufrufen, bei err != nil 0 zurückgeben.',
        '`result, err := Divide(a, b)` … `if err != nil { return 0 }` … `return result`',
      ],
      tests: `	q, err := Divide(10, 2)
	check("10/2", 5, q)
	checkErr("kein Fehler", false, err)

	q2, err2 := Divide(7, 2)
	check("Ganzzahldivision 7/2", 3, q2)
	checkErr("kein Fehler bei 7/2", false, err2)

	q3, err3 := Divide(5, 0)
	check("bei Fehler 0 zurueck", 0, q3)
	checkErr("Fehler bei /0", true, err3)

	check("negativ", -4, mustDivide(-8, 2))
	check("Fallback 0", 0, DivideOrZero(5, 0))
	check("Fallback normal", 2, DivideOrZero(4, 2))`,
      given: `func mustDivide(a, b int) int {
	v, err := Divide(a, b)
	if err != nil {
		panic(err)
	}
	return v
}`,
    },
    {
      id: 'k2',
      title: 'Strings, Bytes und Runes',
      level: 2,
      description: `Implementiere drei Funktionen, die den Unterschied zwischen Bytes und Runes sichtbar machen:

- \`ByteLen(s string) int\` – Anzahl der **Bytes**
- \`RuneLen(s string) int\` – Anzahl der **Zeichen** (Code Points)
- \`Reverse(s string) string\` – dreht den String **zeichenweise** um (Umlaute dürfen nicht zerfallen)

Für den leeren String gilt: \`Reverse("") == ""\`.`,
      starter: `func ByteLen(s string) int {
	// TODO
	return 0
}

func RuneLen(s string) int {
	// TODO
	return 0
}

func Reverse(s string) string {
	// TODO
	return ""
}`,
      solution: `func ByteLen(s string) int {
	return len(s)
}

func RuneLen(s string) int {
	return len([]rune(s))
}

func Reverse(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}`,
      hints: [
        'Ein string ist eine Byte-Folge in UTF-8. `len(s)` zählt Bytes, `[]rune(s)` zerlegt in Zeichen.',
        'Konvertieren mit `[]rune(s)` und zurück mit `string(runes)`. Tauschen geht mit Mehrfachzuweisung: `a, b = b, a`.',
        'Reverse: in []rune wandeln, zwei Indizes von außen nach innen laufen lassen und paarweise tauschen, dann zurück in string.',
        '`for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 { ... }`',
      ],
      tests: `	check("Bytes mit Umlaut", 7, ByteLen("Größe"))
	check("Runes mit Umlaut", 5, RuneLen("Größe"))
	check("ASCII gleich", 4, ByteLen("Jan!"))
	check("leerer String Bytes", 0, ByteLen(""))
	check("reverse ascii", "cba", Reverse("abc"))
	check("reverse mit Umlaut", "eßörG", Reverse("Größe"))
	check("reverse leer", "", Reverse(""))
	check("reverse ein Zeichen", "ä", Reverse("ä"))`,
    },
    {
      id: 'k3',
      title: 'FizzBuzz mit switch',
      level: 3,
      description: `Implementiere \`FizzBuzz(n int) []string\`:

- Liefert die Ergebnisse für \`1\` bis \`n\` (inklusive).
- Vielfache von 3 → \`"Fizz"\`, von 5 → \`"Buzz"\`, von beiden → \`"FizzBuzz"\`, sonst die Zahl als String.
- Bei \`n <= 0\` ein **leerer, initialisierter** Slice (\`[]string{}\`), **nicht** \`nil\`.

Der letzte Punkt ist wichtig: Die Tests nutzen \`reflect.DeepEqual\`, und dort ist ein nil-Slice **nicht** gleich einem leeren Slice. Lege den Slice deshalb immer mit \`make([]string, 0, ...)\` an.

Nutze einen \`switch\` ohne Ausdruck statt einer if/else-Kette.`,
      starter: `func FizzBuzz(n int) []string {
	// TODO
	return nil
}`,
      solution: `import "strconv"

func FizzBuzz(n int) []string {
	if n < 0 {
		n = 0
	}
	result := make([]string, 0, n)
	for i := 1; i <= n; i++ {
		switch {
		case i%15 == 0:
			result = append(result, "FizzBuzz")
		case i%3 == 0:
			result = append(result, "Fizz")
		case i%5 == 0:
			result = append(result, "Buzz")
		default:
			result = append(result, strconv.Itoa(i))
		}
	}
	return result
}`,
      hints: [
        'Ein `switch` ohne Ausdruck ist eine aufgeräumte if/else-Kette: der erste passende Case gewinnt.',
        '`strconv.Itoa(i)` wandelt int in string. `string(i)` wäre falsch – das liefert ein Unicode-Zeichen.',
        'Slice mit make([]string, 0, n) anlegen, von 1 bis n zählen, im switch zuerst i%15 prüfen, dann i%3, dann i%5, sonst die Zahl.',
        '`result := make([]string, 0, n)` … `case i%15 == 0: result = append(result, "FizzBuzz")`',
      ],
      tests: `	check("1 bis 5", []string{"1", "2", "Fizz", "4", "Buzz"}, FizzBuzz(5))
	check("1 bis 15", []string{"1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"}, FizzBuzz(15))
	check("n = 0 liefert leeren Slice", []string{}, FizzBuzz(0))
	check("n negativ liefert leeren Slice", []string{}, FizzBuzz(-3))
	checkTrue("nicht nil bei n = 0", FizzBuzz(0) != nil)
	check("n = 1", []string{"1"}, FizzBuzz(1))
	check("n = 3", []string{"1", "2", "Fizz"}, FizzBuzz(3))`,
    },
    {
      id: 'k4',
      title: 'Log-Level mit iota und Pointern',
      level: 4,
      description: `Gegeben ist der Typ \`Level\` mit \`iota\`-Konstanten (siehe unten). Implementiere:

- \`LevelName(l Level) string\` – \`"DEBUG"\`, \`"INFO"\`, \`"WARN"\`, \`"ERROR"\`, sonst \`"UNKNOWN"\`. Nutze einen \`switch\`.
- \`ParseLevel(s string) (Level, error)\` – erkennt genau die vier Namen in Großschreibung. Unbekannt → \`(Debug, Fehler)\`.
- \`RaiseTo(current *Level, candidate Level) bool\` – setzt \`*current\` auf \`candidate\`, **wenn** \`candidate\` strenger ist, und gibt \`true\` zurück. Sonst bleibt alles unverändert und das Ergebnis ist \`false\`.

\`RaiseTo\` arbeitet über einen Pointer – der Aufrufer sieht die Änderung.`,
      given: `type Level int

const (
	Debug Level = iota
	Info
	Warn
	Error
)`,
      starter: `func LevelName(l Level) string {
	// TODO
	return ""
}

func ParseLevel(s string) (Level, error) {
	// TODO
	return Debug, nil
}

func RaiseTo(current *Level, candidate Level) bool {
	// TODO
	return false
}`,
      solution: `func LevelName(l Level) string {
	switch l {
	case Debug:
		return "DEBUG"
	case Info:
		return "INFO"
	case Warn:
		return "WARN"
	case Error:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

func ParseLevel(s string) (Level, error) {
	switch s {
	case "DEBUG":
		return Debug, nil
	case "INFO":
		return Info, nil
	case "WARN":
		return Warn, nil
	case "ERROR":
		return Error, nil
	default:
		return Debug, fmt.Errorf("unbekannter Level: %q", s)
	}
}

func RaiseTo(current *Level, candidate Level) bool {
	if candidate <= *current {
		return false
	}
	*current = candidate
	return true
}`,
      hints: [
        'Level ist ein eigener Typ auf Basis von int – die iota-Konstanten sind der Reihe nach 0 bis 3 und damit vergleichbar mit `<` und `>`.',
        '`fmt.Errorf("unbekannter Level: %q", s)` erzeugt einen Fehler mit Kontext. Für den Pointer brauchst du `*current` zum Lesen und Schreiben.',
        'LevelName: switch über l mit default "UNKNOWN". ParseLevel: switch über s, default gibt Debug plus Fehler. RaiseTo: wenn candidate <= *current → false, sonst *current setzen und true.',
        '`if candidate <= *current { return false }` … `*current = candidate` … `return true`',
      ],
      tests: `	check("Debug", "DEBUG", LevelName(Debug))
	check("Error", "ERROR", LevelName(Error))
	check("unbekannt", "UNKNOWN", LevelName(Level(99)))

	lvl, err := ParseLevel("WARN")
	check("parse WARN", Warn, lvl)
	checkErr("parse ok", false, err)

	fallback, err2 := ParseLevel("warn")
	check("Fallback bei Fehler ist Debug", Debug, fallback)
	checkErr("parse Fehler bei Kleinschreibung", true, err2)

	current := Info
	checkTrue("Error ist strenger als Info", RaiseTo(&current, Error))
	check("current wurde erhoeht", Error, current)
	checkTrue("Debug ist nicht strenger", !RaiseTo(&current, Debug))
	check("current unveraendert", Error, current)
	checkTrue("gleicher Level aendert nichts", !RaiseTo(&current, Error))`,
    },
  ],
}

export default chapter
