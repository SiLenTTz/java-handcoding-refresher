# Kapitel 04 – Interfaces & Embedding

## Mental Model

```text
INTERFACE       type Reader interface { Read(p []byte) (int, error) }
                = eine Liste von Methoden, KEINE Implementierungsbeziehung
  ↓
ERFÜLLUNG       implizit: wer die Methoden hat, erfüllt das Interface
                kein "implements", kein Import der Interface-Definition nötig
  ↓
INTERFACE-WERT  (Typ, Wert) – ein Paar!
                nil-Interface = (nil, nil); typed nil = (*T, nil) und NICHT nil
  ↓
ZURÜCK          Type Assertion v.(T) / Type Switch switch v := x.(type)
```

Interfaces werden beim **Konsumenten** definiert, nicht beim Produzenten.
Das ist der größte Unterschied zu Java.

## Syntax / API

### Definition und implizite Erfüllung

```go
type Shape interface {
	Area() float64
}

type Rect struct{ W, H float64 }

func (r Rect) Area() float64 { return r.W * r.H }   // fertig – Rect ist ein Shape

var s Shape = Rect{2, 3}
```

Es gibt kein `implements`. `Rect` weiß nichts von `Shape` – die Beziehung entsteht beim Zuweisen.

### Kleine Interfaces

Die Standardbibliothek zeigt das Ideal:

```go
type Stringer interface{ String() string }
type error interface{ Error() string }
type Reader interface{ Read(p []byte) (n int, err error) }
type Writer interface{ Write(p []byte) (n int, err error) }
```

Ein bis drei Methoden. Je kleiner das Interface, desto mehr Typen erfüllen es.
Sprichwort: *„The bigger the interface, the weaker the abstraction.“*

### interface{} / any

```go
var x any = 42          // any ist seit Go 1.18 ein Alias für interface{}
```

Das leere Interface hat keine Methoden – **jeder** Typ erfüllt es. Nutze es nur an echten
Grenzen (Logging, JSON, generische Container ohne Generics). Es kostet Typsicherheit.

### Type Assertion

```go
v, ok := x.(int)      // comma-ok: ok == false statt Panic
if !ok {
	return 0, errors.New("kein int")
}

n := x.(int)          // ohne ok: PANIC bei falschem Typ
```

Assertion geht auch auf Interfaces:

```go
if s, ok := x.(fmt.Stringer); ok {
	fmt.Println(s.String())
}
```

### Type Switch

```go
func describe(v any) string {
	switch t := v.(type) {
	case nil:
		return "nil"
	case int:
		return fmt.Sprintf("int:%d", t)
	case string:
		return fmt.Sprintf("string:%s", t)
	case []int:
		return fmt.Sprintf("[]int mit %d Elementen", len(t))
	case error:
		return "error:" + t.Error()
	default:
		return fmt.Sprintf("unbekannt:%T", v)
	}
}
```

`t` hat in jedem Case den passenden Typ. Bei mehreren Typen pro Case (`case int, int64:`)
bleibt `t` vom Interface-Typ.

### Embedding von Interfaces

```go
type Reader interface{ Read(p []byte) (int, error) }
type Writer interface{ Write(p []byte) (int, error) }

type ReadWriter interface {
	Reader
	Writer
}
```

So baut die Standardbibliothek `io.ReadWriteCloser` & Co. auch Structs können Interfaces
einbetten – dann delegieren sie an das Feld und du überschreibst nur einzelne Methoden:

```go
type LoggingStore struct {
	Store            // Interface als eingebettetes Feld
	log []string
}

func (l *LoggingStore) Get(k string) (string, bool) {  // nur Get überschrieben
	l.log = append(l.log, k)
	return l.Store.Get(k)
}
```

### Der nil-Interface-Fallstrick

```go
type MyErr struct{}
func (e *MyErr) Error() string { return "boom" }

func bad() error {
	var e *MyErr = nil
	return e            // (*MyErr, nil) – NICHT nil!
}

bad() == nil            // false !!
```

Ein Interface-Wert ist nil **nur**, wenn Typ *und* Wert nil sind. Deshalb:
gib im Erfolgsfall immer ein literales `nil` zurück, nie eine typisierte nil-Variable.

### Methodensets und Interfaces

```go
type Counter struct{ n int }
func (c *Counter) Inc() {}

type Incrementer interface{ Inc() }

var i Incrementer = &Counter{}   // ok
var j Incrementer = Counter{}    // Compilerfehler: Counter hat Inc() nicht im Methodenset
```

Pointer-Receiver → nur `*T` erfüllt das Interface.

### Standard-Interfaces

```go
// fmt.Stringer – lesbare Ausgabe
func (u User) String() string { return "User(" + u.Name + ")" }

// error – jeder Fehler
func (e ValidationError) Error() string { return e.Field + " ist ungültig" }

// sort.Interface – eigene Sortierung
type ByLen []string
func (b ByLen) Len() int           { return len(b) }
func (b ByLen) Less(i, j int) bool { return len(b[i]) < len(b[j]) }
func (b ByLen) Swap(i, j int)      { b[i], b[j] = b[j], b[i] }

sort.Sort(ByLen(words))
```

### Accept interfaces, return structs

```go
// GUT: Parameter ist ein kleines Interface, Rückgabe ein konkreter Typ
func NewService(repo UserRepo) *UserService { ... }

// SCHLECHT: Rückgabe als Interface versteckt Funktionalität
func NewService(repo UserRepo) Service { ... }
```

Der Aufrufer kann jedes passende Objekt hineingeben, bekommt aber einen konkreten Typ
mit allen Methoden zurück. Interfaces gehören ins Package, das sie **benutzt**.

## Typische Use Cases

- Testbarkeit: Der Service nimmt ein `Repo`-Interface, der Test gibt ein Fake-Struct.
- `io.Reader`/`io.Writer` statt konkreter Dateien oder Buffer.
- Strategie-Muster: `Notifier`, `Validator`, `PricingRule` als Interface mit mehreren Implementierungen.
- Fehlerklassifizierung mit `errors.As` und Type Switches über Fehlertypen.
- Dekorieren durch Embedding: Logging-, Caching- oder Retry-Wrapper um ein bestehendes Interface.
- Heterogene Daten (JSON) mit `map[string]any` und Type Switch auspacken.

## Clean-Code-Empfehlungen

- Interfaces klein halten – eine bis drei Methoden.
- Interface dort definieren, wo es **gebraucht** wird (Konsument), nicht beim Implementierer.
- Kein `IUserRepo`, kein `UserRepoInterface`. Namen nach Verhalten: `Reader`, `Notifier`, `Store`.
- Erst ein Interface einführen, wenn es einen zweiten Nutzer oder Test gibt – nicht auf Vorrat.
- Parameter als Interface, Rückgabe als Struct.
- Comma-ok statt nackter Type Assertion.
- `any` nur an Systemgrenzen; darunter konkrete Typen oder Generics.

## Häufige Fehler

```go
// FALSCH: typisierte nil-Variable als error zurückgeben
func do() error {
	var e *MyErr
	if somethingBroke {
		e = &MyErr{}
	}
	return e            // niemals nil, auch im Erfolgsfall!
}
// RICHTIG
func do() error {
	if somethingBroke {
		return &MyErr{}
	}
	return nil
}

// FALSCH: Value statt Pointer bei Pointer-Receivern
var i Incrementer = Counter{}   // Compilerfehler
// RICHTIG
var i Incrementer = &Counter{}

// FALSCH: Type Assertion ohne ok
n := v.(int)                    // panic, wenn v kein int ist
// RICHTIG
n, ok := v.(int)
if !ok { return 0, errors.New("kein int") }

// FALSCH: riesiges Interface "für alle Fälle"
type Repository interface {
	Save(); Find(); Delete(); Count(); Flush(); Migrate()
}
// RICHTIG: aufteilen in das, was der Aufrufer wirklich braucht
type UserFinder interface{ FindByID(id int64) (User, error) }

// FALSCH: Interface zurückgeben und damit Methoden verstecken
func New() Service { return &service{} }
// RICHTIG
func New() *Service { return &Service{} }

// FALSCH: Interface auf Vorrat, mit genau einer Implementierung und ohne Test
type UserServiceInterface interface { /* 12 Methoden */ }

// FALSCH: Less-Funktion in sort.Interface vertauscht
func (b ByLen) Less(i, j int) bool { return len(b[j]) < len(b[i]) } // sortiert absteigend
// RICHTIG (aufsteigend)
func (b ByLen) Less(i, j int) bool { return len(b[i]) < len(b[j]) }

// FALSCH: any als Rückgabetyp aus "Bequemlichkeit"
func Parse(s string) any {}
// RICHTIG
func Parse(s string) (Config, error) {}
```

## Interview-relevante Details

- Ein Interface-Wert ist ein **Paar (dynamischer Typ, Wert)**. Er ist genau dann `nil`, wenn beide nil sind – die Quelle des häufigsten Go-Bugs mit `error`.
- **Implizite Erfüllung** entkoppelt Packages: Du kannst Interfaces für fremde Typen definieren, ohne deren Code zu ändern.
- **Methodenset**: Pointer-Receiver-Methoden zählen nur zu `*T`. Deshalb scheitert `var i I = T{}` oft.
- Interface-Aufrufe gehen über eine **itab** (Methodentabelle) – etwas langsamer als direkte Aufrufe und meist nicht inlinebar.
- **`errors.Is` vs. `errors.As`**: `Is` vergleicht mit einem Sentinel, `As` macht eine Type Assertion durch die Wrapping-Kette.
- Ein **Struct kann ein Interface einbetten**. Fehlt zur Laufzeit die Implementierung (nil-Feld), paniced erst der Aufruf – praktisch für Test-Stubs mit nur einer überschriebenen Methode.
- Bei **Embedding-Konflikten** zwischen zwei Interfaces mit gleicher Methodensignatur ist das seit Go 1.14 erlaubt; unterschiedliche Signaturen sind ein Fehler.
- `any` ist nur ein **Alias** für `interface{}` – identischer Typ, bessere Lesbarkeit.

## Zusammenfassung

- Interfaces werden implizit erfüllt; es gibt kein `implements`.
- Klein halten und beim Konsumenten definieren.
- `any`/`interface{}` nur an Grenzen; auspacken mit Type Assertion (comma-ok) oder Type Switch.
- Interfaces lassen sich in Interfaces und in Structs einbetten (Delegation + selektives Überschreiben).
- Ein Interface mit typisiertem nil ist **nicht** nil – immer literales `nil` zurückgeben.
- Pointer-Receiver → nur `*T` erfüllt das Interface.
- Standard-Interfaces kennen: `fmt.Stringer`, `error`, `sort.Interface`, `io.Reader`/`io.Writer`.
- Akzeptiere Interfaces, gib Structs zurück.
