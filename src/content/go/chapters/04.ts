import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    { id: 'f1', front: 'Wie erfüllt ein Typ in Go ein Interface?', back: '**Implizit**: Wer alle Methoden der Signatur hat, erfüllt das Interface. Es gibt kein `implements`, und der Typ muss das Interface nicht einmal kennen.' },
    { id: 'f2', front: 'Woraus besteht ein Interface-Wert intern?', back: 'Aus einem **Paar (dynamischer Typ, Wert)**. Er ist nur dann `nil`, wenn **beide** nil sind.' },
    { id: 'f3', front: 'Was ist der nil-Interface-Fallstrick?', back: '```go\nvar e *MyErr = nil\nvar err error = e\nerr == nil // false!\n```\nDer Interface-Wert ist `(*MyErr, nil)` – Typ gesetzt, also nicht nil. Deshalb im Erfolgsfall immer literales `nil` zurückgeben.' },
    { id: 'f4', front: 'Warum erfüllt `Counter{}` kein Interface, dessen Methode einen Pointer-Receiver hat?', back: 'Methodenset: `T` hat nur die Value-Methoden, `*T` hat alle. Bei `func (c *Counter) Inc()` erfüllt nur `&Counter{}` das Interface `interface{ Inc() }`.' },
    { id: 'f5', front: 'Type Assertion mit und ohne comma-ok?', back: '```go\nn, ok := v.(int) // ok == false bei falschem Typ\nn := v.(int)     // PANIC bei falschem Typ\n```\nIn Produktionscode praktisch immer die comma-ok-Form.' },
    { id: 'f6', front: 'Wie sieht ein Type Switch aus?', back: '```go\nswitch t := v.(type) {\ncase nil:\n\treturn "nil"\ncase int:\n\treturn fmt.Sprint(t)\ndefault:\n\treturn fmt.Sprintf("%T", v)\n}\n```\n`t` hat je Case den konkreten Typ. Bei mehreren Typen in einem Case bleibt `t` vom Interface-Typ.' },
    { id: 'f7', front: 'Was ist `any`?', back: 'Seit Go 1.18 ein **Alias** für `interface{}` – identischer Typ, bessere Lesbarkeit. Es hat keine Methoden, also erfüllt es jeder Typ. Nur an Systemgrenzen einsetzen.' },
    { id: 'f8', front: 'Wie bettet man Interfaces ineinander ein?', back: '```go\ntype ReadWriter interface {\n\tReader\n\tWriter\n}\n```\nGenau so baut die Standardbibliothek `io.ReadWriteCloser`.' },
    { id: 'f9', front: 'Was bringt ein Interface als eingebettetes Feld in einem Struct?', back: 'Das Struct erfüllt das Interface automatisch und **delegiert** an das Feld. Du überschreibst nur die Methoden, die du brauchst – ideal für Decorator (Logging, Caching) und Test-Stubs.' },
    { id: 'f10', front: 'Welche drei Methoden verlangt `sort.Interface`?', back: '```go\nLen() int\nLess(i, j int) bool\nSwap(i, j int)\n```\nDann sortiert `sort.Sort(x)`. Die Less-Funktion muss **strikt** sein (bei Gleichstand `false`).' },
    { id: 'f11', front: 'Was bedeutet "Accept interfaces, return structs"?', back: 'Parameter als kleines Interface (der Aufrufer kann alles Passende übergeben), Rückgabe als konkreter Typ (versteckt keine Methoden). Interfaces gehören ins Package, das sie **benutzt**.' },
    { id: 'f12', front: 'Warum sind kleine Interfaces besser?', back: 'Je weniger Methoden, desto mehr Typen erfüllen sie und desto einfacher sind Tests. `io.Reader` hat genau eine Methode. Regel: *"The bigger the interface, the weaker the abstraction."*' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was gibt `check()` aus?',
      code: `type MyErr struct{}

func (e *MyErr) Error() string { return "boom" }

func mayFail() error {
	var e *MyErr
	return e
}

func check() bool { return mayFail() == nil }`,
      options: ['`true`', '`false`', 'panic: nil pointer', 'Compilerfehler'],
      correct: 1,
      explanation: 'Der Interface-Wert ist `(*MyErr, nil)` – der dynamische Typ ist gesetzt, also ist er **nicht** nil. Im Erfolgsfall muss man literal `return nil` schreiben.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `type Incrementer interface{ Inc() }

type Counter struct{ n int }

func (c *Counter) Inc() { c.n++ }

var i Incrementer = Counter{}`,
      options: [
        '`Counter` muss `implements Incrementer` deklarieren',
        '`Inc` müsste einen Wert zurückgeben',
        '`Inc` hat einen Pointer-Receiver – nur `*Counter` hat die Methode im Methodenset',
        'Interfaces dürfen nur eine Methode haben',
      ],
      correct: 2,
      explanation: 'Das Methodenset von `Counter` enthält nur Value-Receiver-Methoden. Richtig ist `var i Incrementer = &Counter{}`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `func describe(v any) string {
	switch t := v.(type) {
	case int:
		return fmt.Sprintf("int:%d", t)
	case string:
		return fmt.Sprintf("string:%s", t)
	default:
		return fmt.Sprintf("other:%T", v)
	}
}

fmt.Println(describe(3.5))`,
      options: ['`int:3`', '`string:3.5`', '`other:float64`', '`other:3.5`'],
      correct: 2,
      explanation: 'Ein Float-Literal ohne Typ wird zu `float64`. Kein Case passt, also greift `default`, und `%T` gibt den dynamischen Typ aus.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Bug?',
      code: `func toInt(v any) int {
	return v.(int)
}`,
      options: [
        'Type Assertions gibt es nur in Type Switches',
        'Ohne comma-ok paniced die Assertion, wenn `v` kein `int` ist',
        '`any` kann nicht Parameter sein',
        'Kein Bug',
      ],
      correct: 1,
      explanation: 'Die nackte Assertion `v.(int)` paniced bei falschem Typ. Robust ist `n, ok := v.(int)` mit expliziter Behandlung von `!ok`.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `type Store interface{ Get(k string) string }

type MapStore struct{ m map[string]string }

func (s MapStore) Get(k string) string { return s.m[k] }

type Upper struct{ Store }

func (u Upper) Get(k string) string {
	return strings.ToUpper(u.Store.Get(k))
}

u := Upper{Store: MapStore{m: map[string]string{"a": "go"}}}
fmt.Println(u.Get("a"), u.Get("b"))`,
      options: ['`GO ` (zweites leer)', '`go `', '`GO B`', 'panic: nil map'],
      correct: 0,
      explanation: '`Upper` bettet das Interface ein und überschreibt `Get`. Für `"a"` kommt `"go"` → `"GO"`. Für `"b"` liefert die Map den Zero Value `""`, uppercase bleibt `""`.',
    },
    {
      id: 'q6',
      prompt: 'Welche Variante ist idiomatisches Go?',
      options: [
        '`type IUserRepository interface { /* 12 Methoden */ }` im selben Package wie die Implementierung',
        '`type UserFinder interface { FindByID(id int64) (User, error) }` im Package, das es benutzt – Parameter als Interface, Rückgabe als `*Service`',
        '`func NewService(repo any) any`',
        '`type UserRepositoryInterface interface { ... }` mit Präfix `I` für Klarheit',
      ],
      correct: 1,
      explanation: 'Kleine Interfaces, nach Verhalten benannt (kein `I`-Präfix), definiert beim Konsumenten. "Accept interfaces, return structs."',
    },
    {
      id: 'q7',
      prompt: 'Was ist an dieser `sort.Interface`-Implementierung falsch?',
      code: `type ByLen []string

func (b ByLen) Len() int           { return len(b) }
func (b ByLen) Less(i, j int) bool { return len(b[i]) < len(b[j]) }
func (b ByLen) Swap(i, j int)      { b[i] = b[j] }`,
      options: [
        '`Len` müsste einen Pointer-Receiver haben',
        '`Swap` tauscht nicht, sondern überschreibt – richtig ist `b[i], b[j] = b[j], b[i]`',
        '`Less` muss `<=` benutzen',
        '`ByLen` darf kein Slice-Typ sein',
      ],
      correct: 1,
      explanation: '`Swap` muss die beiden Elemente wirklich vertauschen. Mit der gezeigten Zuweisung gehen Elemente verloren. `Less` ist dagegen korrekt strikt.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `var x any
fmt.Println(x == nil)

var s fmt.Stringer
x = s
fmt.Println(x == nil)`,
      options: ['`true true`', '`true false`', '`false false`', '`false true`'],
      correct: 0,
      explanation: 'Beide Interface-Variablen sind echte nil-Interfaces `(nil, nil)`. Erst wenn ein **konkreter** Typ zugewiesen wird – auch mit nil-Wert – ist der Interface-Wert nicht mehr nil.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Shapes implizit erfüllen',
      level: 1,
      description: `Das Interface \`Shape\` mit der Methode \`Area() float64\` ist vorgegeben. Implementiere:

- \`type Rect struct { W, H float64 }\` mit \`Area()\` = \`W*H\`
- \`type Triangle struct { Base, Height float64 }\` mit \`Area()\` = \`Base*Height/2\`
- \`func TotalArea(shapes []Shape) float64\` – Summe aller Flächen, \`0\` bei leerem Input

Du musst nirgends "implements" schreiben: Sobald \`Area()\` da ist, erfüllen die Typen \`Shape\`.
Nutze Value-Receiver – die Methoden lesen nur.`,
      given: `type Shape interface {
	Area() float64
}`,
      starter: `type Rect struct {
	W float64
	H float64
}

func (r Rect) Area() float64 {
	// TODO
	return 0
}

type Triangle struct {
	Base   float64
	Height float64
}

func (t Triangle) Area() float64 {
	// TODO
	return 0
}

func TotalArea(shapes []Shape) float64 {
	// TODO
	return 0
}`,
      solution: `type Rect struct {
	W float64
	H float64
}

func (r Rect) Area() float64 {
	return r.W * r.H
}

type Triangle struct {
	Base   float64
	Height float64
}

func (t Triangle) Area() float64 {
	return t.Base * t.Height / 2
}

func TotalArea(shapes []Shape) float64 {
	total := 0.0
	for _, s := range shapes {
		total += s.Area()
	}
	return total
}`,
      hints: [
        'In Go erfüllt ein Typ ein Interface allein dadurch, dass er die passenden Methoden hat – ohne Deklaration.',
        'Value-Receiver reichen: `func (r Rect) Area() float64`. In `TotalArea` rufst du auf jedem Element `s.Area()` auf.',
        'Rect: W*H. Triangle: Base*Height/2. TotalArea: Summe mit 0.0 starten, über shapes rangen und s.Area() addieren.',
        '`total := 0.0` … `for _, s := range shapes { total += s.Area() }`',
      ],
      tests: `	check("Rechteck", 12.0, Rect{W: 3, H: 4}.Area())
	check("Dreieck", 6.0, Triangle{Base: 4, Height: 3}.Area())

	var s Shape = Rect{W: 2, H: 5}
	check("Rect erfuellt Shape implizit", 10.0, s.Area())
	s = Triangle{Base: 2, Height: 5}
	check("Triangle erfuellt Shape implizit", 5.0, s.Area())

	check("Summe gemischt", 18.0, TotalArea([]Shape{Rect{W: 3, H: 4}, Triangle{Base: 4, Height: 3}}))
	check("leerer Slice", 0.0, TotalArea([]Shape{}))
	check("nil Slice", 0.0, TotalArea(nil))
	check("Nullflaeche", 0.0, TotalArea([]Shape{Rect{}, Triangle{}}))`,
    },
    {
      id: 'k2',
      title: 'Type Switch über any',
      level: 2,
      description: `Implementiere \`Describe(v any) string\` mit einem **Type Switch**. Die erwarteten Rückgaben:

| Eingabe | Ergebnis |
|---|---|
| \`nil\` | \`"nil"\` |
| \`int\` | \`"int:42"\` |
| \`string\` | \`"string:go"\` |
| \`bool\` | \`"bool:true"\` |
| \`[]int\` | \`"[]int(3)"\` – in Klammern die Länge |
| alles andere | \`"unbekannt:float64"\` – nach dem Doppelpunkt der Typ via \`%T\` |

Zusätzlich: \`AsInt(v any) (int, bool)\` – liefert den Wert, wenn \`v\` ein \`int\` ist, sonst \`(0, false)\`. Nutze die comma-ok-Form der Type Assertion, **nicht** die panicende Variante.`,
      starter: `func Describe(v any) string {
	// TODO
	return ""
}

func AsInt(v any) (int, bool) {
	// TODO
	return 0, false
}`,
      solution: `func Describe(v any) string {
	switch t := v.(type) {
	case nil:
		return "nil"
	case int:
		return fmt.Sprintf("int:%d", t)
	case string:
		return "string:" + t
	case bool:
		return fmt.Sprintf("bool:%t", t)
	case []int:
		return fmt.Sprintf("[]int(%d)", len(t))
	default:
		return fmt.Sprintf("unbekannt:%T", v)
	}
}

func AsInt(v any) (int, bool) {
	n, ok := v.(int)
	return n, ok
}`,
      hints: [
        'Ein Type Switch (`switch t := v.(type)`) bindet in jedem Case eine Variable mit dem konkreten Typ.',
        '`case nil:` fängt das echte nil-Interface ab. `%T` gibt den dynamischen Typ aus, `%d`/`%t` formatieren int/bool.',
        'Cases der Reihe nach: nil, int, string, bool, []int, default mit %T. AsInt macht nur `n, ok := v.(int)` und gibt beides zurück.',
        '`case []int: return fmt.Sprintf("[]int(%d)", len(t))`',
      ],
      tests: `	check("nil", "nil", Describe(nil))
	check("int", "int:42", Describe(42))
	check("negativer int", "int:-1", Describe(-1))
	check("string", "string:go", Describe("go"))
	check("leerer string", "string:", Describe(""))
	check("bool", "bool:true", Describe(true))
	check("slice", "[]int(3)", Describe([]int{1, 2, 3}))
	check("leerer slice", "[]int(0)", Describe([]int{}))
	check("unbekannter Typ", "unbekannt:float64", Describe(3.5))
	check("unbekannter Typ int64", "unbekannt:int64", Describe(int64(7)))

	n, ok := AsInt(7)
	check("AsInt Wert", 7, n)
	checkTrue("AsInt ok", ok)

	bad, ok2 := AsInt("7")
	check("AsInt falscher Typ liefert 0", 0, bad)
	checkTrue("AsInt ok ist false", !ok2)

	nilVal, ok3 := AsInt(nil)
	check("AsInt nil liefert 0", 0, nilVal)
	checkTrue("AsInt nil ist nicht ok", !ok3)`,
    },
    {
      id: 'k3',
      title: 'sort.Interface selbst implementieren',
      level: 3,
      description: `Implementiere den Typ \`ByLength\` als \`[]string\` und erfülle damit \`sort.Interface\`:

- \`Len() int\`
- \`Less(i, j int) bool\` – kürzere Strings zuerst; bei **gleicher Länge** alphabetisch aufsteigend
- \`Swap(i, j int)\`

Dazu \`SortByLength(words []string) []string\`:

- sortiert mit \`sort.Sort(ByLength(...))\`
- **kopiert vorher**, der übergebene Slice darf sich nicht ändern
- gibt bei leerem oder nil-Input \`[]string{}\` zurück, **nicht** \`nil\`

Denk an die Kapitel-02-Falle: \`sort.Sort\` arbeitet in place, und ein Slice-Parameter teilt sich das Array mit dem Aufrufer.`,
      starter: `type ByLength []string

func (b ByLength) Len() int {
	// TODO
	return 0
}

func (b ByLength) Less(i, j int) bool {
	// TODO
	return false
}

func (b ByLength) Swap(i, j int) {
	// TODO
}

func SortByLength(words []string) []string {
	// TODO
	return nil
}`,
      solution: `import "sort"

type ByLength []string

func (b ByLength) Len() int {
	return len(b)
}

func (b ByLength) Less(i, j int) bool {
	if len(b[i]) != len(b[j]) {
		return len(b[i]) < len(b[j])
	}
	return b[i] < b[j]
}

func (b ByLength) Swap(i, j int) {
	b[i], b[j] = b[j], b[i]
}

func SortByLength(words []string) []string {
	result := make([]string, len(words))
	copy(result, words)
	sort.Sort(ByLength(result))
	return result
}`,
      hints: [
        '`sort.Interface` verlangt genau drei Methoden. Ein eigener Slice-Typ (`type ByLength []string`) kann sie tragen.',
        '`sort.Sort(ByLength(result))` konvertiert den Slice in deinen Typ. Tauschen geht mit `b[i], b[j] = b[j], b[i]`.',
        'Len: len(b). Less: erst Längen vergleichen, bei Gleichstand die Strings. Swap: Mehrfachzuweisung. SortByLength: mit make+copy klonen, sortieren, zurückgeben.',
        '`if len(b[i]) != len(b[j]) { return len(b[i]) < len(b[j]) }` … `return b[i] < b[j]`',
      ],
      tests: `	check("nach Laenge", []string{"go", "map", "slice"}, SortByLength([]string{"slice", "go", "map"}))
	check("Gleichstand alphabetisch", []string{"ab", "ba", "abc"}, SortByLength([]string{"ba", "abc", "ab"}))
	check("ein Element", []string{"x"}, SortByLength([]string{"x"}))
	check("leerer Input", []string{}, SortByLength([]string{}))
	check("nil Input", []string{}, SortByLength(nil))
	checkTrue("nie nil", SortByLength(nil) != nil)

	src := []string{"bbb", "a", "cc"}
	sorted := SortByLength(src)
	check("Ergebnis sortiert", []string{"a", "cc", "bbb"}, sorted)
	check("Input unveraendert", []string{"bbb", "a", "cc"}, src)

	check("Len", 3, ByLength([]string{"a", "b", "c"}).Len())
	checkTrue("Less nach Laenge", ByLength([]string{"a", "bb"}).Less(0, 1))
	checkTrue("Less ist strikt bei gleichen Werten", !ByLength([]string{"aa", "aa"}).Less(0, 1))

	b := ByLength([]string{"a", "bb"})
	b.Swap(0, 1)
	check("Swap tauscht wirklich", []string{"bb", "a"}, []string(b))`,
    },
    {
      id: 'k4',
      title: 'Validator-Kette aus kleinen Interfaces',
      level: 4,
      description: `Das Interface \`Validator\` mit \`Validate(s string) error\` ist vorgegeben. Baue drei Implementierungen:

- \`type NotEmpty struct{}\` – Fehler bei \`""\` mit der Meldung \`"darf nicht leer sein"\`
- \`type MaxLen struct{ Limit int }\` – Fehler, wenn der String **mehr Zeichen** (Runes, nicht Bytes!) als \`Limit\` hat. Meldung: \`"maximal 3 Zeichen"\` bei \`Limit == 3\`.
- \`type All []Validator\` – erfüllt selbst \`Validator\` und führt alle Prüfungen der Reihe nach aus. **Der erste Fehler gewinnt**; ist alles in Ordnung, kommt \`nil\` zurück.

Zwei Fallen:

1. \`MaxLen\` muss Runes zählen – \`"äöü"\` sind 3 Zeichen, aber 6 Bytes.
2. \`All.Validate\` muss im Erfolgsfall **literal \`nil\`** zurückgeben, keine typisierte nil-Variable. Sonst wäre das Ergebnis ein Interface-Wert, der nicht \`nil\` ist.`,
      given: `type Validator interface {
	Validate(s string) error
}`,
      starter: `type NotEmpty struct{}

func (n NotEmpty) Validate(s string) error {
	// TODO
	return nil
}

type MaxLen struct {
	Limit int
}

func (m MaxLen) Validate(s string) error {
	// TODO
	return nil
}

type All []Validator

func (a All) Validate(s string) error {
	// TODO
	return nil
}`,
      solution: `import "errors"

type NotEmpty struct{}

func (n NotEmpty) Validate(s string) error {
	if s == "" {
		return errors.New("darf nicht leer sein")
	}
	return nil
}

type MaxLen struct {
	Limit int
}

func (m MaxLen) Validate(s string) error {
	if len([]rune(s)) > m.Limit {
		return fmt.Errorf("maximal %d Zeichen", m.Limit)
	}
	return nil
}

type All []Validator

func (a All) Validate(s string) error {
	for _, v := range a {
		if err := v.Validate(s); err != nil {
			return err
		}
	}
	return nil
}`,
      hints: [
        'Jede Implementierung erfüllt `Validator` allein durch die Methode `Validate(string) error`. Auch ein Slice-Typ (`type All []Validator`) darf Methoden haben.',
        '`errors.New("...")` für feste Meldungen, `fmt.Errorf("maximal %d Zeichen", m.Limit)` für formatierte. Zeichen zählst du mit `len([]rune(s))`.',
        'NotEmpty: bei "" Fehler, sonst nil. MaxLen: wenn Runeanzahl > Limit, Fehler. All: über die Kette rangen, beim ersten err != nil sofort zurückgeben, am Ende nil.',
        '`for _, v := range a { if err := v.Validate(s); err != nil { return err } }` … `return nil`',
      ],
      tests: `	notEmpty := NotEmpty{}
	checkErr("leerer String ist ungueltig", true, notEmpty.Validate(""))
	checkErr("nicht leer ist gueltig", false, notEmpty.Validate("go"))
	check("Meldung NotEmpty", "darf nicht leer sein", notEmpty.Validate("").Error())

	maxLen := MaxLen{Limit: 3}
	checkErr("zu lang", true, maxLen.Validate("gogo"))
	checkErr("genau am Limit ist ok", false, maxLen.Validate("abc"))
	checkErr("Umlaute zaehlen als ein Zeichen", false, maxLen.Validate("äöü"))
	check("Meldung MaxLen", "maximal 3 Zeichen", maxLen.Validate("gogo").Error())

	var chain Validator = All{NotEmpty{}, MaxLen{Limit: 3}}
	checkErr("Kette: leer schlaegt fehl", true, chain.Validate(""))
	checkErr("Kette: gueltig", false, chain.Validate("abc"))
	checkErr("Kette: zu lang", true, chain.Validate("abcd"))
	check("erster Fehler gewinnt", "darf nicht leer sein", chain.Validate("").Error())

	checkErr("leere Kette ist immer ok", false, All{}.Validate(""))
	checkTrue("leere Kette liefert echtes nil", All{}.Validate("x") == nil)
	checkTrue("All erfuellt Validator", chain != nil)`,
    },
  ],
}

export default chapter
