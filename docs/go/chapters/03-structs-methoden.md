# Kapitel 03 – Structs & Methoden

## Mental Model

```text
STRUCT          type Rect struct { W, H float64 }   – reiner Datencontainer, Wert-Semantik
  ↓
KONSTRUKTOR     func NewRect(w, h float64) (Rect, error)   – Konvention, kein Keyword
  ↓
METHODE         func (r Rect) Area() float64     value receiver  → arbeitet auf einer KOPIE
                func (r *Rect) Scale(f float64)  pointer receiver → ändert das Original
  ↓
EMBEDDING       type Employee struct { Person; Company string }
                Felder und Methoden von Person werden PROMOTED – keine Vererbung
```

Ein Struct ist ein Wert. Zuweisen, Übergeben und Zurückgeben kopiert es.
Ob eine Methode das Original ändern kann, entscheidet allein der Receiver-Typ.

## Syntax / API

### Structs definieren und anlegen

```go
type User struct {
	ID    int64
	Name  string
	Email string
	admin bool           // klein → nur im eigenen Package sichtbar
}

u1 := User{ID: 1, Name: "Jan"}       // benannte Felder – immer so
u2 := User{1, "Jan", "j@x.de", false} // positional – spröde, vermeiden
u3 := User{}                          // alle Zero Values
p := &User{ID: 2}                     // *User direkt
var u4 User                           // ebenfalls alle Zero Values
```

Anonyme Structs gibt es auch – praktisch für Tabellen-Tests:

```go
cases := []struct {
	in   string
	want int
}{
	{"a", 1},
	{"bb", 2},
}
```

### Feld-Tags

```go
type User struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email,omitempty"`
	pass  string `json:"-"`
}
```

Tags sind Strings, die per Reflection gelesen werden (`encoding/json`, DB-Mapper, Validierung).
Der Compiler prüft sie **nicht** – ein Tippfehler in `json:"nmae"` fällt erst zur Laufzeit auf.

### Methoden: Value- vs. Pointer-Receiver

```go
type Counter struct{ n int }

func (c Counter) Value() int  { return c.n }   // liest – Kopie reicht
func (c *Counter) Inc()       { c.n++ }        // schreibt – braucht Pointer

c := Counter{}
c.Inc()        // Go nimmt automatisch &c
fmt.Println(c.Value()) // 1
```

Faustregeln:

- **Pointer-Receiver**, wenn die Methode etwas ändert, das Struct groß ist oder es einen Mutex/Slice enthält.
- **Value-Receiver** für kleine, unveränderliche Wertobjekte (`time.Time`, `Point`).
- **Nicht mischen**: Hat ein Typ eine Pointer-Methode, geben ihm alle Methoden einen Pointer-Receiver.

### Konstruktorfunktionen

```go
func NewUser(name, email string) (*User, error) {
	if name == "" {
		return nil, errors.New("name darf nicht leer sein")
	}
	return &User{Name: name, Email: email}, nil
}
```

Konvention: `NewX` für den Typ `X`, im Package `user` einfach `user.New(...)`.
Nur nötig, wenn Validierung oder Defaults gebraucht werden – sonst reicht das Struct-Literal.

### Einbettung (Embedding)

```go
type Person struct {
	Name string
	Age  int
}

func (p Person) Greet() string { return "Hallo, ich bin " + p.Name }

type Employee struct {
	Person          // eingebettet – KEIN Feldname
	Company string
}

e := Employee{Person: Person{Name: "Jan", Age: 40}, Company: "adesso"}
e.Name            // promoted – kurz für e.Person.Name
e.Greet()         // promoted Methode
e.Person.Greet()  // explizit, falls überschrieben
```

Überschreiben geht durch eine gleichnamige Methode auf dem äußeren Typ:

```go
func (e Employee) Greet() string {
	return e.Person.Greet() + " von " + e.Company
}
```

Das ist **Komposition, keine Vererbung**: Es gibt kein `super`, und `Employee` ist kein `Person`.

### Vergleichbarkeit und Kopiersemantik

```go
type Point struct{ X, Y int }
Point{1, 2} == Point{1, 2}   // true – feldweiser Vergleich

type Bad struct{ Tags []string }
Bad{} == Bad{}               // Compilerfehler: Slices sind nicht vergleichbar
```

Vergleichbare Structs dürfen Map-Keys sein. Kopiersemantik:

```go
a := User{Name: "Jan"}
b := a          // echte Kopie
b.Name = "Tom"  // a.Name bleibt "Jan"
```

**Aber**: Die Kopie ist flach. Enthält das Struct ein Slice oder eine Map, teilen sich
beide Kopien diese Daten.

### Methodensets

```go
c := Counter{}
c.Inc()            // ok – c ist addressierbar, Go macht (&c).Inc()
Counter{}.Inc()    // Compilerfehler – Literal ist nicht addressierbar
```

- Methodenset von `T`: alle Methoden mit Value-Receiver.
- Methodenset von `*T`: **alle** Methoden (Value + Pointer).

Das wird in Kapitel 04 wichtig: Nur `*T` erfüllt ein Interface, dessen Methoden
Pointer-Receiver haben.

### String() – der Stringer

```go
func (u User) String() string {
	return fmt.Sprintf("User(%d, %s)", u.ID, u.Name)
}

fmt.Println(u)              // nutzt automatisch String()
fmt.Printf("%v / %s", u, u) // ebenfalls
```

Achtung: `String()` darf nicht `%v` auf sich selbst anwenden – das ergibt eine Endlosrekursion.

## Typische Use Cases

- DTOs und API-Modelle mit `json`-Tags.
- Wertobjekte (`Money`, `Point`, `DateRange`) mit Value-Receivern und Vergleichbarkeit.
- Services mit Abhängigkeiten im Struct: `type UserService struct { repo Repo }` plus `NewUserService(repo)`.
- Optionen-Structs statt langer Parameterlisten: `func New(cfg Config) *Server`.
- Embedding für gemeinsame Felder (`type BaseEntity struct { ID int64; CreatedAt time.Time }`).
- Vergleichbare Structs als Map-Keys (`map[Point]bool` für ein Set von Koordinaten).

## Clean-Code-Empfehlungen

- Immer benannte Felder im Literal – positionale Literale brechen bei jeder neuen Feldposition.
- Kurze Receiver-Namen, konsistent im ganzen Typ: `func (u User)`, nicht mal `u`, mal `user`, mal `this`.
- Receiver-Typ pro Typ einheitlich wählen.
- Konstruktor nur bei Validierung/Defaults; sonst ist das Zero-Value-Struct die bessere API.
- Felder klein halten (unexportiert), wenn Invarianten geschützt werden müssen.
- `String()` fürs Logging, nicht fürs Serialisieren – dafür gibt es JSON.
- Struct-Größe im Blick behalten: Ab ein paar Feldern lieber `*T` übergeben.

## Häufige Fehler

```go
// FALSCH: Value-Receiver soll etwas ändern
func (c Counter) Inc() { c.n++ }   // ändert nur die Kopie
// RICHTIG
func (c *Counter) Inc() { c.n++ }

// FALSCH: Receiver-Typen gemischt
func (u User) Name() string {}
func (u *User) SetName(s string) {}   // verwirrend + Interface-Fallen
// RICHTIG: beide mit *User

// FALSCH: positionales Literal
u := User{1, "Jan", "j@x.de", false}  // bricht, sobald ein Feld dazukommt
// RICHTIG
u := User{ID: 1, Name: "Jan", Email: "j@x.de"}

// FALSCH: Methode auf nicht-addressierbarem Wert
Counter{}.Inc()                       // Compilerfehler
// RICHTIG
c := Counter{}
c.Inc()

// FALSCH: flache Kopie als "Schutz" vor Änderungen
b := a
b.Tags[0] = "x"                       // a.Tags ist dasselbe Slice!
// RICHTIG
b.Tags = slices.Clone(a.Tags)

// FALSCH: Struct mit Slice als Map-Key
type K struct{ Tags []string }
m := map[K]int{}                      // Compilerfehler

// FALSCH: String() ruft sich selbst auf
func (u User) String() string { return fmt.Sprintf("%v", u) }  // Endlosrekursion
// RICHTIG
func (u User) String() string { return fmt.Sprintf("User(%d)", u.ID) }

// FALSCH: Embedding als Vererbung missverstehen
func (p Person) Describe() string { return p.Greet() }
// Employee überschreibt Greet – Describe ruft trotzdem Person.Greet auf.
// Es gibt kein virtuelles Dispatch. Wer Polymorphie will, nimmt ein Interface.

// FALSCH: nil-Pointer-Feld ungeprüft dereferenzieren
func (s *Service) Run() { s.repo.Save() }  // panic, wenn s == nil oder repo == nil
```

## Interview-relevante Details

- **Go hat keine Vererbung.** Embedding promotet Felder/Methoden, aber es gibt kein `super` und kein virtuelles Dispatch. Polymorphie kommt ausschließlich über Interfaces.
- **Methodenset**: `*T` hat alle Methoden, `T` nur die Value-Methoden. Deshalb erfüllt oft nur `&x` ein Interface.
- Bei **Namenskollisionen** durch Embedding gewinnt die flachste Ebene; sind zwei Namen gleich tief, ist der Zugriff mehrdeutig und ein Compilerfehler (der Weg über `e.Person.Name` bleibt erlaubt).
- Ein **Struct mit 0 Feldern** (`struct{}`) belegt keinen Speicher – deshalb `map[string]struct{}` für Sets.
- **Feldreihenfolge beeinflusst die Struct-Größe** (Alignment/Padding): große Felder zuerst spart Bytes.
- Methoden auf einem **nil-Pointer-Receiver** sind erlaubt, solange die Methode keine Felder anfasst – manche Typen nutzen das bewusst.
- Der **Zero Value sollte nutzbar sein**: `var b strings.Builder` und `var mu sync.Mutex` funktionieren ohne Konstruktor. Gute API-Designs folgen dem.
- Methoden können nur auf Typen im **eigenen Package** definiert werden. Fremde Typen erweitert man über einen eigenen Typ (`type MyTime time.Time`) oder Embedding.

## Zusammenfassung

- Structs sind Werte: Zuweisen kopiert, aber nur flach.
- Value-Receiver zum Lesen, Pointer-Receiver zum Ändern – pro Typ einheitlich.
- `NewX(...)` ist Konvention, kein Sprachfeature; oft reicht das Struct-Literal.
- Embedding = Komposition mit Promotion, keine Vererbung, kein `super`.
- Structs sind vergleichbar, wenn alle Felder es sind – dann taugen sie als Map-Keys.
- Methodenset: `*T` kann alles, `T` nur Value-Methoden.
- `String() string` macht einen Typ für `fmt` lesbar – niemals rekursiv.
