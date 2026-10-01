# Kapitel 03 – Structs, Enums & Pattern Matching

## Mental Model

```text
struct   "UND"      Ein Wert hat Name UND Alter UND E-Mail.        (Produkttyp)
enum     "ODER"     Ein Wert ist Kreis ODER Rechteck ODER Dreieck. (Summentyp)

match    zerlegt einen Wert in seine Varianten und bindet dabei die Daten.
         Der Compiler erzwingt, dass ALLE Fälle abgedeckt sind (Exhaustiveness).
```

- Structs bündeln Daten, `impl`-Blöcke bündeln das Verhalten dazu – getrennt notiert, nicht wie eine Java-Klasse.
- Enums in Rust können **Daten tragen**. Damit modelliert man Zustände, die sich gegenseitig ausschließen.
- `match` ist ein **Ausdruck** und liefert einen Wert.

## Syntax / API

### Die drei Struct-Formen

```rust
// 1. Klassisches Struct mit benannten Feldern
#[derive(Debug, Clone, PartialEq)]
struct User {
    id: u64,
    name: String,
    active: bool,
}

// 2. Tuple-Struct – Felder ohne Namen, gut für Newtypes
#[derive(Debug, PartialEq)]
struct Meters(f64);

// 3. Unit-Struct – gar keine Daten, nur ein Typ
struct Marker;
```

`Meters(f64)` statt `f64` verhindert, dass man versehentlich Meter und Sekunden addiert.

### Instanzen erzeugen und lesen

```rust
let u = User { id: 1, name: String::from("Jan"), active: true };
println!("{}", u.name);

let name = String::from("Anna");
let a = User { id: 2, name, active: true };          // Field-Init-Shorthand

let b = User { id: 3, ..a.clone() };                 // Struct-Update-Syntax

let Meters(distance) = Meters(4.5);                  // Tuple-Struct destrukturieren
```

### impl-Blöcke: Methoden und assoziierte Funktionen

```rust
impl User {
    // assoziierte Funktion (kein self) – der Rust-"Konstruktor"
    fn new(id: u64, name: &str) -> Self {
        Self { id, name: name.to_string(), active: true }
    }

    fn display_name(&self) -> &str { &self.name }        // liest

    fn deactivate(&mut self) { self.active = false; }    // verändert

    fn into_name(self) -> String { self.name }           // verbraucht
}

let mut u = User::new(1, "Jan");     // :: bei assoziierten Funktionen
u.deactivate();                      // .  bei Methoden
let name = u.into_name();            // u ist danach weg
```

`&self` / `&mut self` / `self` ist die wichtigste Designentscheidung einer Methode.

### Enums mit Daten

```rust
#[derive(Debug, PartialEq)]
enum Shape {
    Circle { radius: f64 },        // Struct-Variante
    Rectangle(f64, f64),           // Tuple-Variante
    Point,                         // Unit-Variante
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
            Shape::Rectangle(w, h) => w * h,
            Shape::Point => 0.0,
        }
    }
}
```

### match: Bindings, Guards, Exhaustiveness

```rust
let msg = match code {
    200 => "ok",
    301 | 302 => "redirect",                     // Oder-Pattern
    400..=499 => "client error",                 // Range-Pattern
    n if n >= 500 => "server error",             // Guard
    _ => "unbekannt",                            // Catch-all zuletzt
};
```

- Ohne `_` muss jeder mögliche Wert abgedeckt sein, sonst: *non-exhaustive patterns*.
- Das ist der eigentliche Gewinn: Eine neue Enum-Variante bricht den Build genau dort, wo Logik fehlt.
- `_` ist deshalb bei eigenen Enums mit Vorsicht zu genießen – es schaltet die Prüfung ab.

```rust
let label = match user {
    User { active: false, .. } => "gesperrt".to_string(),
    User { name, id: 1, .. } => format!("Root: {name}"),
    User { name, .. } => name,
};
```

### if let, let else, while let

```rust
// nur ein Fall interessiert
if let Shape::Circle { radius } = &shape {
    println!("Radius {radius}");
} else {
    println!("kein Kreis");
}

// Happy Path linksbündig halten – der Else-Zweig MUSS divergieren
let Some(user) = find_user(id) else {
    return "nicht gefunden".to_string();
};
println!("{}", user.name);

while let Some(top) = stack.pop() {
    println!("{top}");
}
```

### Option ist einfach ein Enum

```rust
enum Option<T> {
    None,
    Some(T),
}

let found: Option<&User> = users.iter().find(|u| u.id == 1);

match found {
    Some(user) if user.active => println!("aktiv: {}", user.name),
    Some(user) => println!("inaktiv: {}", user.name),
    None => println!("nicht gefunden"),
}
```

Genau deshalb braucht Rust kein `null`: Das Fehlen eines Werts ist eine Variante im Typ
und `match` zwingt dich, sie zu behandeln.

### Destructuring überall

```rust
let (x, y) = (3, 4);
let [first, .., last] = [1, 2, 3, 4];
let Shape::Rectangle(w, h) = shape else { return 0.0 };

for (index, value) in values.iter().enumerate() { }
for (key, count) in &counts { }
```

## Typische Use Cases

- Domänenobjekte als Struct mit `new`-Funktion und Validierung darin.
- Zustandsautomaten als Enum: `enum Order { New, Paid { at: u64 }, Cancelled { reason: String } }`.
- Parser/Kommandos: Text → `enum Command` mit `match` auf die Tokens.
- Newtype gegen Verwechslung: `struct UserId(u64)`, `struct Cents(i64)`.
- Fehlerklassen als Enum statt Fehlercode-Konstanten.
- Konfigurationsvarianten: `enum Source { File(String), Url(String), Stdin }`.

## Clean-Code-Empfehlungen

- `#[derive(Debug, Clone, PartialEq)]` an Datentypen – kostet nichts und macht Tests lesbar.
- Konstruktion über `Self::new(..)` bündeln, damit Invarianten an einer Stelle geprüft werden.
- Bei eigenen Enums **kein** `_ => ..`, damit neue Varianten Compile-Fehler erzeugen.
- Enum-Varianten mit Struct-Feldern benennen, sobald mehr als ein Datum dranhängt.
- `if let` / `let else` statt `match` mit leerem `_ => {}`-Zweig.
- Logik ins `impl` des Typs, nicht in freie Funktionen, die auf Felder zugreifen.
- Verhalten pro Variante in einer `match`-Tabelle halten statt in verschachtelten `if`s.

## Häufige Fehler

```rust
// FALSCH: Enum-Variante ist kein Typ
fn area(c: Shape::Circle) -> f64 { .. }
// RICHTIG
fn area(s: &Shape) -> f64 { .. }

// FALSCH: match nicht vollständig
match shape {
    Shape::Circle { radius } => radius,
    Shape::Rectangle(w, h) => w * h,
}                                        // non-exhaustive patterns: `Point` not covered
// RICHTIG: alle Varianten ausschreiben

// FALSCH: Catch-all versteckt vergessene Varianten
match status {
    Status::New => handle_new(),
    _ => {}                              // neue Variante fällt still durch
}
// RICHTIG: jede Variante explizit

// FALSCH: match auf Wert, obwohl nur gelesen wird → Move
match user {                             // user wird gemoved
    User { name, .. } => println!("{name}"),
}
println!("{}", user.id);                 // Fehler
// RICHTIG
match &user {
    User { name, .. } => println!("{name}"),
}

// FALSCH: Guard deckt nicht alles ab
match n {
    x if x > 0 => "positiv",
    x if x < 0 => "negativ",
}                                        // Compiler sieht 0 nicht abgedeckt
// RICHTIG
match n {
    x if x > 0 => "positiv",
    x if x < 0 => "negativ",
    _ => "null",
}

// FALSCH: Methode nimmt self, obwohl sie nur liest
fn name(self) -> String { self.name }    // verbraucht das Objekt
// RICHTIG
fn name(&self) -> &str { &self.name }

// FALSCH: Option per unwrap auspacken
let user = find_user(id).unwrap();
// RICHTIG
let Some(user) = find_user(id) else {
    return Err("User nicht gefunden".to_string());
};
```

## Interview-relevante Details

- **Structs sind Produkttypen, Enums Summentypen.** Ein `enum` mit drei Varianten hat so viele Werte wie die Summe der Varianten – ein `struct` so viele wie das Produkt seiner Felder.
- **Exhaustiveness-Checking** ist der Hauptgrund für `match`: Refactorings werden compilergestützt.
- **Ein Enum ist so groß wie seine größte Variante + Discriminant.** Große Varianten deshalb ggf. boxen.
- **Niche Optimization**: `Option<&T>` und `Option<Box<T>>` brauchen keinen Extraspeicher – `None` nutzt den Null-Zeiger.
- **`impl` ist nicht gleich Klasse**: Man kann mehrere `impl`-Blöcke für denselben Typ schreiben, auch mit unterschiedlichen Trait-Bounds.
- **`self` vs. `&self` vs. `&mut self`** bestimmt, ob eine Methode verbraucht, liest oder verändert – das ist Teil der öffentlichen API.
- **Match Ergonomics**: Beim `match` auf `&T` werden Bindings automatisch zu Referenzen, man braucht kein `ref` mehr.
- **`let else`** (Rust 1.65) hält den Happy Path ohne Einrückung – idiomatischer Ersatz für frühe `return`-`match`-Blöcke.

## Zusammenfassung

- Drei Struct-Formen: benannt, Tuple (Newtype), Unit.
- Verhalten lebt im `impl`-Block; `Self::new` ist der Konstruktor, `::` für assoziierte Funktionen, `.` für Methoden.
- Enums tragen Daten und modellieren sich ausschließende Zustände.
- `match` ist ein Ausdruck mit Bindings, Guards, Oder- und Range-Patterns – und erzwingt Vollständigkeit.
- `if let` für einen Fall, `let else` für den Happy Path, `while let` zum Leerräumen.
- `Option<T>` ist ein ganz normales Enum – deshalb braucht Rust kein `null`.
- `_` sparsam einsetzen: Es kostet dich die Compiler-Warnung beim nächsten Refactoring.
