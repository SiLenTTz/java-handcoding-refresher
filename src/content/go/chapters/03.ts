import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    { id: 'f1', front: 'Wie legst du ein Struct idiomatisch an?', back: 'Mit **benannten** Feldern:\n```go\nu := User{ID: 1, Name: "Jan"}\n```\nPositionale Literale (`User{1, "Jan"}`) brechen, sobald ein Feld dazukommt.' },
    { id: 'f2', front: 'Wann Value-Receiver, wann Pointer-Receiver?', back: '**Pointer**, wenn die Methode etwas ändert, das Struct groß ist oder einen Mutex/Slice enthält. **Value** für kleine, unveränderliche Wertobjekte. Pro Typ einheitlich wählen – nicht mischen.' },
    { id: 'f3', front: 'Was ist ein Methodenset?', back: 'Die Menge der Methoden eines Typs. `T` hat nur die Value-Receiver-Methoden, `*T` hat **alle**. Deshalb erfüllt oft nur `&x` ein Interface.' },
    { id: 'f4', front: 'Warum kompiliert `Counter{}.Inc()` mit Pointer-Receiver nicht?', back: 'Go müsste `&Counter{}` bilden, aber ein Literal ist **nicht addressierbar**. Erst in eine Variable legen:\n```go\nc := Counter{}\nc.Inc() // Go macht daraus (&c).Inc()\n```' },
    { id: 'f5', front: 'Wofür sind Feld-Tags da?', back: 'Metadaten für Reflection-basierte Bibliotheken (JSON, DB-Mapper, Validierung), z. B. `json:"id"` oder `json:"email,omitempty"`. Der Compiler prüft sie **nicht** – Tippfehler fallen erst zur Laufzeit auf.' },
    { id: 'f6', front: 'Was ist die Konvention für Konstruktoren?', back: '`NewX(...)` für den Typ `X`, im Package `user` einfach `user.New(...)`. Nur nötig, wenn Validierung oder Defaults gebraucht werden – sonst reicht das Struct-Literal.' },
    { id: 'f7', front: 'Was passiert beim Embedding?', back: 'Felder und Methoden des eingebetteten Typs werden **promoted**: `e.Name` statt `e.Person.Name`. Das ist Komposition, keine Vererbung – es gibt kein `super` und kein virtuelles Dispatch.' },
    { id: 'f8', front: 'Wie überschreibst du eine eingebettete Methode – und wie kommst du ans Original?', back: 'Gleichnamige Methode auf dem äußeren Typ definieren. Das Original erreichst du über den expliziten Feldnamen:\n```go\nfunc (e Employee) Greet() string {\n\treturn e.Person.Greet() + " von " + e.Company\n}\n```' },
    { id: 'f9', front: 'Wann ist ein Struct vergleichbar (`==`) und als Map-Key nutzbar?', back: 'Wenn **alle** Felder vergleichbar sind. Slices, Maps und Funktionen sind es nicht – ein Struct mit solchen Feldern lässt sich nicht mit `==` vergleichen (Compilerfehler).' },
    { id: 'f10', front: 'Was bedeutet "die Struct-Kopie ist flach"?', back: '`b := a` kopiert alle Felder. Enthält das Struct ein Slice, eine Map oder einen Pointer, zeigen beide Kopien auf **dieselben** Daten. Tiefe Kopie musst du selbst bauen (`slices.Clone`, `maps.Clone`).' },
    { id: 'f11', front: 'Was bringt eine `String() string`-Methode?', back: 'Der Typ erfüllt `fmt.Stringer` und wird von `fmt.Println`, `%v` und `%s` automatisch genutzt – ideal fürs Logging. Niemals `%v` auf den eigenen Wert anwenden: Endlosrekursion.' },
    { id: 'f12', front: 'Warum belegt `struct{}` keinen Speicher?', back: 'Ein Struct ohne Felder hat Größe 0. Deshalb ist `map[string]struct{}` das speichersparsamste Set – `struct{}{}` ist der Wert.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `type Counter struct{ n int }

func (c Counter) Inc() { c.n++ }

c := Counter{}
c.Inc()
c.Inc()
fmt.Println(c.n)`,
      options: ['`2`', '`1`', '`0`', 'Compilerfehler'],
      correct: 2,
      explanation: 'Der Value-Receiver bekommt bei jedem Aufruf eine **Kopie**. `c.n` im Original bleibt 0. Für Änderungen braucht es `func (c *Counter) Inc()`.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `type Counter struct{ n int }

func (c *Counter) Inc() { c.n++ }

fmt.Println(Counter{}.Inc())`,
      options: [
        'Methoden dürfen nichts zurückgeben',
        '`Counter{}` ist nicht addressierbar – für den Pointer-Receiver bräuchte Go `&Counter{}`',
        '`Inc` müsste exportiert sein',
        'Ein Struct-Literal darf keine Methode aufrufen',
      ],
      correct: 1,
      explanation: 'Go setzt bei Pointer-Receivern automatisch `&` – aber nur bei addressierbaren Werten (Variablen, Felder, Slice-Elemente). Ein Literal ist es nicht. (Außerdem gibt `Inc` nichts zurück.)',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `type Person struct{ Name string }
type Employee struct {
	Person
	Company string
}

e := Employee{Person: Person{Name: "Jan"}, Company: "adesso"}
fmt.Println(e.Name, e.Person.Name)`,
      options: ['`Jan Jan`', '` Jan`', 'Compilerfehler: `e.Name` gibt es nicht', '`adesso Jan`'],
      correct: 0,
      explanation: 'Beim Embedding wird `Name` promoted: `e.Name` ist exakt `e.Person.Name` – derselbe Speicher, nicht zwei Felder.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `type Box struct {
	Tags []string
}

a := Box{Tags: []string{"x"}}
b := a
b.Tags[0] = "y"
fmt.Println(a.Tags[0])`,
      options: ['`x`', '`y`', '`nil`', 'panic'],
      correct: 1,
      explanation: 'Die Struct-Kopie ist **flach**: Der Slice-Header wird kopiert, das darunterliegende Array geteilt. Für Unabhängigkeit: `b.Tags = slices.Clone(a.Tags)`.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Bug?',
      code: `type Person struct{ Name string }

func (p Person) Greet() string    { return "Hallo " + p.Name }
func (p Person) Describe() string { return p.Greet() + "!" }

type Loud struct{ Person }

func (l Loud) Greet() string { return "HALLO " + l.Name }

fmt.Println(Loud{Person{"Jan"}}.Describe())`,
      options: [
        'Es gibt keinen Bug – die Ausgabe ist `HALLO Jan!`',
        'Die Ausgabe ist `Hallo Jan!` – `Describe` kennt nur `Person.Greet`, es gibt kein virtuelles Dispatch',
        'Compilerfehler wegen doppelter Methode `Greet`',
        'Die Ausgabe ist leer',
      ],
      correct: 1,
      explanation: 'Embedding ist keine Vererbung. `Describe` ist eine Methode auf `Person` und sieht nur `Person.Greet`. Wer Polymorphie braucht, nimmt ein Interface.',
    },
    {
      id: 'q6',
      prompt: 'Warum kompiliert das nicht?',
      code: `type Key struct {
	Name string
	Tags []string
}

fmt.Println(Key{Name: "a"} == Key{Name: "a"})`,
      options: [
        'Structs kann man nie mit `==` vergleichen',
        '`Key` enthält ein Slice – damit ist der Typ nicht vergleichbar',
        '`==` braucht Pointer',
        'Die Felder müssen exportiert sein',
      ],
      correct: 1,
      explanation: 'Ein Struct ist nur vergleichbar, wenn alle Felder es sind. Slices, Maps und Funktionen sind nicht vergleichbar – solche Structs taugen auch nicht als Map-Keys.',
    },
    {
      id: 'q7',
      prompt: 'Welche API ist idiomatisches Go?',
      options: [
        '`func (u *User) GetName() string` und `func (u *User) SetName(s string)`',
        '`func NewUser(name string) (*User, error)` mit Validierung, Felder exportiert, Methoden einheitlich auf `*User`',
        '`func (u User) Init(name string)` – Felder nach dem Anlegen setzen',
        '`func CreateUserObject(name string) interface{}`',
      ],
      correct: 1,
      explanation: 'Konvention ist `NewX`, Fehler als Rückgabewert und ein einheitlicher Receiver-Typ. `Get`-Präfixe sind in Go unüblich, `interface{}` als Rückgabetyp verschenkt Typsicherheit.',
    },
    {
      id: 'q8',
      prompt: 'Was passiert hier zur Laufzeit?',
      code: `type Temp struct{ C float64 }

func (t Temp) String() string {
	return fmt.Sprintf("%v°C", t)
}

fmt.Println(Temp{21.5})`,
      options: [
        '`21.5°C`',
        '`{21.5}°C`',
        'Endlosrekursion – `%v` ruft wieder `String()` auf, bis der Stack überläuft',
        'Compilerfehler',
      ],
      correct: 2,
      explanation: '`%v` auf einen Typ mit `String()` ruft genau diese Methode auf. Richtig wäre `fmt.Sprintf("%v°C", t.C)` – also das Feld formatieren, nicht den Wert selbst.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Rechteck mit Methoden',
      level: 1,
      description: `Der Typ \`Rect\` mit den Feldern \`Width\` und \`Height\` (beide \`float64\`) ist vorgegeben. Ergänze:

- \`NewRect(w, h float64) Rect\` – Konstruktorfunktion
- \`func (r Rect) Area() float64\` – Fläche, **Value**-Receiver (liest nur)
- \`func (r Rect) Perimeter() float64\` – Umfang, ebenfalls Value-Receiver
- \`func (r *Rect) Scale(factor float64)\` – skaliert **beide** Seiten, **Pointer**-Receiver (ändert das Original)

Der Unterschied zwischen den beiden Receiver-Arten ist hier der ganze Punkt.`,
      starter: `type Rect struct {
	Width  float64
	Height float64
}

func NewRect(w, h float64) Rect {
	// TODO
	return Rect{}
}

func (r Rect) Area() float64 {
	// TODO
	return 0
}

func (r Rect) Perimeter() float64 {
	// TODO
	return 0
}

func (r *Rect) Scale(factor float64) {
	// TODO
}`,
      solution: `type Rect struct {
	Width  float64
	Height float64
}

func NewRect(w, h float64) Rect {
	return Rect{Width: w, Height: h}
}

func (r Rect) Area() float64 {
	return r.Width * r.Height
}

func (r Rect) Perimeter() float64 {
	return 2 * (r.Width + r.Height)
}

func (r *Rect) Scale(factor float64) {
	r.Width *= factor
	r.Height *= factor
}`,
      hints: [
        'Value-Receiver arbeiten auf einer Kopie und können nur lesen. Pointer-Receiver greifen auf das Original zu.',
        'Im Konstruktor ein Struct-Literal mit benannten Feldern zurückgeben: `Rect{Width: w, Height: h}`. In `Scale` schreibst du direkt auf `r.Width` – Go dereferenziert automatisch.',
        'NewRect: Literal zurückgeben. Area: Width*Height. Perimeter: 2*(Width+Height). Scale: beide Felder mit factor multiplizieren.',
        '`func (r *Rect) Scale(factor float64) { r.Width *= factor; r.Height *= factor }`',
      ],
      tests: `	r := NewRect(3, 4)
	check("Konstruktor setzt Width", 3.0, r.Width)
	check("Konstruktor setzt Height", 4.0, r.Height)
	check("Flaeche", 12.0, r.Area())
	check("Umfang", 14.0, r.Perimeter())

	r.Scale(2)
	check("Scale aendert das Original", 6.0, r.Width)
	check("Flaeche nach Scale", 48.0, r.Area())

	zero := Rect{}
	check("Zero Value hat Flaeche 0", 0.0, zero.Area())

	copyOfR := r
	copyOfR.Scale(10)
	check("Kopie beeinflusst das Original nicht", 6.0, r.Width)`,
    },
    {
      id: 'k2',
      title: 'Zähler mit String()',
      level: 2,
      description: `Baue einen Zähler mit unexportiertem Feld:

- \`type Counter struct { n int }\` (schon vorgegeben)
- \`NewCounter(start int) *Counter\` – gibt einen **Pointer** zurück
- \`func (c *Counter) Add(delta int)\` – addiert
- \`func (c *Counter) Inc()\` – nutzt \`Add\`
- \`func (c Counter) Value() int\` – liest den Stand
- \`func (c Counter) String() string\` – liefert z. B. \`"Counter(3)"\`

Weil \`String()\` einen Value-Receiver hat, funktioniert sie sowohl auf \`Counter\` als auch auf \`*Counter\` – \`fmt.Println(c)\` nutzt sie automatisch.`,
      starter: `type Counter struct {
	n int
}

func NewCounter(start int) *Counter {
	// TODO
	return &Counter{}
}

func (c *Counter) Add(delta int) {
	// TODO
}

func (c *Counter) Inc() {
	// TODO
}

func (c Counter) Value() int {
	// TODO
	return 0
}

func (c Counter) String() string {
	// TODO
	return ""
}`,
      solution: `type Counter struct {
	n int
}

func NewCounter(start int) *Counter {
	return &Counter{n: start}
}

func (c *Counter) Add(delta int) {
	c.n += delta
}

func (c *Counter) Inc() {
	c.Add(1)
}

func (c Counter) Value() int {
	return c.n
}

func (c Counter) String() string {
	return fmt.Sprintf("Counter(%d)", c.n)
}`,
      hints: [
        'Methoden, die den Zustand ändern, brauchen einen Pointer-Receiver. Reine Leser dürfen Value-Receiver haben.',
        '`&Counter{n: start}` erzeugt den Pointer direkt. `fmt.Sprintf("Counter(%d)", c.n)` baut den String.',
        'NewCounter: &Counter{n: start}. Add: c.n += delta. Inc: c.Add(1). Value: c.n zurückgeben. String: mit Sprintf formatieren.',
        '`func (c Counter) String() string { return fmt.Sprintf("Counter(%d)", c.n) }`',
      ],
      tests: `	c := NewCounter(0)
	check("Startwert", 0, c.Value())
	c.Inc()
	c.Inc()
	check("zweimal Inc", 2, c.Value())
	c.Add(5)
	check("Add", 7, c.Value())
	c.Add(-10)
	check("negatives Add", -3, c.Value())

	check("String auf Pointer", "Counter(-3)", fmt.Sprintf("%v", c))
	check("String auf Wert", "Counter(-3)", fmt.Sprintf("%v", *c))
	check("Methode direkt", "Counter(-3)", c.String())

	start := NewCounter(42)
	check("Konstruktor uebernimmt Startwert", 42, start.Value())
	checkTrue("Konstruktor liefert Pointer", start != nil)`,
    },
    {
      id: 'k3',
      title: 'Employee durch Embedding',
      level: 3,
      description: `\`Person\` mit der Methode \`Greet()\` ist vorgegeben. Baue darauf auf:

- \`type Employee struct\` – bettet \`Person\` **ohne Feldnamen** ein und hat zusätzlich \`Company string\`
- \`NewEmployee(name string, age int, company string) Employee\`
- \`func (e Employee) Greet() string\` – überschreibt: \`"Hallo, ich bin Jan von adesso"\`. Nutze dafür \`e.Person.Greet()\` und häng \`" von " + e.Company\` an.
- \`func (e Employee) PersonGreet() string\` – gibt bewusst den **Originalgruß** von \`Person\` zurück
- \`func (e *Employee) Birthday()\` – erhöht das promotete Feld \`Age\` um 1

Achte darauf: \`e.Name\` und \`e.Person.Name\` sind dasselbe Feld.`,
      given: `type Person struct {
	Name string
	Age  int
}

func (p Person) Greet() string {
	return "Hallo, ich bin " + p.Name
}`,
      starter: `type Employee struct {
	Person
	Company string
}

func NewEmployee(name string, age int, company string) Employee {
	// TODO
	return Employee{}
}

func (e Employee) Greet() string {
	// TODO
	return ""
}

func (e Employee) PersonGreet() string {
	// TODO
	return ""
}

func (e *Employee) Birthday() {
	// TODO
}`,
      solution: `type Employee struct {
	Person
	Company string
}

func NewEmployee(name string, age int, company string) Employee {
	return Employee{
		Person:  Person{Name: name, Age: age},
		Company: company,
	}
}

func (e Employee) Greet() string {
	return e.Person.Greet() + " von " + e.Company
}

func (e Employee) PersonGreet() string {
	return e.Person.Greet()
}

func (e *Employee) Birthday() {
	e.Age++
}`,
      hints: [
        'Ein eingebettetes Feld schreibt man ohne Namen: `type Employee struct { Person; Company string }`. Der Feldname ist dann der Typname `Person`.',
        'Im Literal initialisierst du es über genau diesen Namen: `Employee{Person: Person{...}, Company: ...}`. Das Original einer überschriebenen Methode erreichst du mit `e.Person.Greet()`.',
        'NewEmployee: verschachteltes Literal. Greet: Person.Greet() plus " von " plus Company. PersonGreet: nur e.Person.Greet(). Birthday: e.Age++ (promotet).',
        '`return e.Person.Greet() + " von " + e.Company`',
      ],
      tests: `	e := NewEmployee("Jan", 40, "adesso")
	check("promotetes Feld Name", "Jan", e.Name)
	check("promotetes Feld Age", 40, e.Age)
	check("eigenes Feld", "adesso", e.Company)
	check("Zugriff ueber Person", "Jan", e.Person.Name)

	check("ueberschriebener Gruss", "Hallo, ich bin Jan von adesso", e.Greet())
	check("Originalgruss", "Hallo, ich bin Jan", e.PersonGreet())
	check("Person.Greet direkt", "Hallo, ich bin Jan", e.Person.Greet())

	e.Birthday()
	check("Birthday erhoeht Age", 41, e.Age)
	check("Age auch ueber Person sichtbar", 41, e.Person.Age)

	other := NewEmployee("", 0, "")
	check("leerer Employee", "Hallo, ich bin  von ", other.Greet())

	copyOfE := e
	copyOfE.Birthday()
	check("Struct-Kopie ist unabhaengig", 41, e.Age)`,
    },
    {
      id: 'k4',
      title: 'Punkte kopieren und deduplizieren',
      level: 4,
      description: `Der Typ \`Point\` mit den \`int\`-Feldern \`X\` und \`Y\` ist vorgegeben. Implementiere:

- \`func Move(p Point, dx, dy int) Point\` – gibt einen **neuen** Punkt zurück, das Original bleibt unberührt
- \`func MoveInPlace(p *Point, dx, dy int)\` – verschiebt den Punkt des Aufrufers
- \`func Dedupe(points []Point) []Point\` – entfernt Duplikate und **behält die Reihenfolge des ersten Vorkommens**

\`Point\` ist vergleichbar (beide Felder sind \`int\`) und darf deshalb Map-Key sein – nutze \`map[Point]struct{}\` als Set.

Für \`Dedupe\` gilt wieder: leerer oder nil-Input → \`[]Point{}\`, **nicht** \`nil\`.`,
      starter: `type Point struct {
	X int
	Y int
}

func Move(p Point, dx, dy int) Point {
	// TODO
	return p
}

func MoveInPlace(p *Point, dx, dy int) {
	// TODO
}

func Dedupe(points []Point) []Point {
	// TODO
	return nil
}`,
      solution: `type Point struct {
	X int
	Y int
}

func Move(p Point, dx, dy int) Point {
	return Point{X: p.X + dx, Y: p.Y + dy}
}

func MoveInPlace(p *Point, dx, dy int) {
	p.X += dx
	p.Y += dy
}

func Dedupe(points []Point) []Point {
	seen := make(map[Point]struct{}, len(points))
	result := make([]Point, 0, len(points))
	for _, p := range points {
		if _, ok := seen[p]; ok {
			continue
		}
		seen[p] = struct{}{}
		result = append(result, p)
	}
	return result
}`,
      hints: [
        'Ein Struct-Parameter ist eine Kopie – `Move` kann das Original gar nicht ändern. Nur der Pointer-Parameter kann das.',
        'Vergleichbare Structs dürfen Map-Keys sein: `map[Point]struct{}` ist ein Set ohne Speicherverbrauch für den Wert. Existenzprüfung mit `_, ok := seen[p]`.',
        'Move: neues Literal mit p.X+dx und p.Y+dy. MoveInPlace: Felder über den Pointer erhöhen. Dedupe: Set und Ergebnis-Slice anlegen, über points laufen, bekannte überspringen, sonst merken und anhängen.',
        '`if _, ok := seen[p]; ok { continue }` … `seen[p] = struct{}{}` … `result = append(result, p)`',
      ],
      tests: `	p := Point{X: 1, Y: 2}
	moved := Move(p, 3, 4)
	check("neuer Punkt", Point{X: 4, Y: 6}, moved)
	check("Original unveraendert", Point{X: 1, Y: 2}, p)

	MoveInPlace(&p, -1, -2)
	check("in place verschoben", Point{X: 0, Y: 0}, p)

	checkTrue("Point ist vergleichbar", Point{1, 2} == Point{1, 2})

	input := []Point{{1, 1}, {2, 2}, {1, 1}, {3, 3}, {2, 2}}
	check("Reihenfolge des ersten Vorkommens", []Point{{1, 1}, {2, 2}, {3, 3}}, Dedupe(input))
	check("Input unveraendert", 5, len(input))
	check("keine Duplikate", []Point{{0, 0}}, Dedupe([]Point{{0, 0}, {0, 0}, {0, 0}}))
	check("leerer Input", []Point{}, Dedupe([]Point{}))
	check("nil Input", []Point{}, Dedupe(nil))
	checkTrue("nie nil", Dedupe(nil) != nil)
	check("alles verschieden", []Point{{1, 0}, {0, 1}}, Dedupe([]Point{{1, 0}, {0, 1}}))`,
    },
  ],
}

export default chapter
