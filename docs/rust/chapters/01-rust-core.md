# Kapitel 01 – Rust Core

## Mental Model

```text
Wert          let x = 5;            unveränderlich (Default!)
              let mut x = 5;        veränderlich (bewusste Entscheidung)
              let x = x + 1;        Shadowing: neue Variable, neuer Typ erlaubt

Ausdruck      if / match / loop / { .. }   liefern einen WERT
Statement     let .. = ..;  fn ..          liefern KEINEN Wert

Typ           statisch, inferiert, nie implizit konvertiert
              i32 + i64  →  Compile-Fehler, nicht Auto-Widening
```

- In Rust ist fast alles ein **Ausdruck**. Der letzte Ausdruck eines Blocks **ohne Semikolon** ist sein Wert.
- Unveränderlichkeit ist die Voreinstellung. `mut` ist eine Aussage über die Absicht, nicht nur Syntax.
- Es gibt **keine impliziten Zahlkonvertierungen**. Jede Umwandlung steht sichtbar im Code.

## Syntax / API

### let, mut und Shadowing

```rust
let x = 5;              // i32 (Default-Integer)
// x = 6;               // Fehler: cannot assign twice to immutable variable

let mut y = 5;
y = 6;                  // ok

let input = "42";           // &str
let input = input.trim();   // &str – shadowing, gleicher Typ
let input: i32 = input.parse().expect("keine Zahl");   // Typ darf wechseln!
```

Shadowing ist **kein** `mut`: Es entsteht eine neue Variable. Das ist der idiomatische Weg, um
`&str` → `i32` zu parsen, ohne `input_str`, `input_trimmed`, `input_num` zu erfinden.

### Konstanten

```rust
const MAX_RETRIES: u32 = 3;                 // immer Typ-Annotation, SCREAMING_SNAKE_CASE
static GREETING: &str = "Hallo";            // feste Adresse im Programm

fn retry_limit() -> u32 { MAX_RETRIES }
```

`const` wird an jeder Verwendungsstelle eingesetzt, `static` hat eine feste Speicheradresse.
Im Alltag: `const` nehmen.

### Skalartypen und Overflow

| Gruppe | Typen | Default |
|---|---|---|
| Ganzzahl vorzeichenbehaftet | `i8 i16 i32 i64 i128 isize` | `i32` |
| Ganzzahl vorzeichenlos | `u8 u16 u32 u64 u128 usize` | – |
| Fließkomma | `f32 f64` | `f64` |
| Sonstige | `bool`, `char` (4 Byte, Unicode-Scalar) | – |

```rust
let a: i32 = i32::MAX;
// let b = a + 1;              // Debug: Panic "attempt to add with overflow"
//                             // Release: wrap-around (still böse)

let c = a.checked_add(1);      // Option<i32> → None
let d = a.saturating_add(1);   // i32        → i32::MAX
let e = a.wrapping_add(1);     // i32        → i32::MIN (bewusst!)
let (f, overflowed) = a.overflowing_add(1);
```

`usize` ist der Typ für Indizes und Längen – so groß wie ein Zeiger.

### Typkonvertierung

```rust
let n: i64 = 300;
let small = n as i32;          // as: kann abschneiden, niemals bei Geld benutzen
let byte = 300_i32 as u8;      // 44 – stillschweigender Datenverlust!

let safe: Result<u8, _> = u8::try_from(300_i32);   // Err – der saubere Weg
let widened: i64 = i64::from(42_i32);              // From: immer verlustfrei

let text = 42.to_string();
let parsed: i32 = "42".parse().expect("keine Zahl");
let ratio = 3 as f64 / 4 as f64;        // 0.75 – ohne Cast wäre 3 / 4 == 0
```

Regel: `From`/`TryFrom` wenn möglich, `as` nur bewusst und mit Kommentar.

### Tupel und Arrays

```rust
let point: (i32, i32) = (3, 4);
let (x, y) = point;                 // Destructuring
let first = point.0;

let unit: () = ();                  // Unit-Tupel – "kein Wert"

let days: [&str; 3] = ["Mo", "Di", "Mi"];   // Länge gehört zum Typ
let zeros = [0_u8; 16];                     // 16 Nullen
let len = days.len();
let maybe = days.get(7);                    // Option<&&str> → None
// let boom = days[7];                      // Panic: index out of bounds
```

Arrays haben **feste** Länge und liegen auf dem Stack. Für dynamische Listen: `Vec<T>` (Kapitel 04).

### Funktionen, Ausdrücke vs. Statements

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b                    // kein Semikolon = Rückgabewert
}

fn add_verbose(a: i32, b: i32) -> i32 {
    return a + b;            // erlaubt, idiomatisch nur beim frühen Rückkehren
}

fn broken(a: i32) -> i32 {
    a + 1;                   // Semikolon → Wert ist (), Typfehler
}

let squared = {
    let base = 4;
    base * base              // Block ist ein Ausdruck → 16
};
```

### Kontrollfluss als Ausdruck

```rust
let category = if age >= 18 { "erwachsen" } else { "minderjährig" };
// beide Zweige müssen denselben Typ liefern; ohne else ist der Typ ()

let mut attempt = 0;
let result = loop {
    attempt += 1;
    if attempt == 3 {
        break attempt * 10;         // loop kann einen Wert liefern
    }
};

while attempt > 0 {
    attempt -= 1;
}

for day in ["Mo", "Di", "Mi"] {     // for konsumiert einen IntoIterator
    println!("{day}");
}
for i in 0..3 { }                   // 0, 1, 2
for i in (0..=3).rev() { }          // 3, 2, 1, 0

'outer: for i in 0..3 {
    for j in 0..3 {
        if i * j > 2 { break 'outer; }
    }
}
```

Es gibt **keine** C-artige `for (i = 0; i < n; i++)`-Schleife. Ranges und Iteratoren ersetzen sie.

### String vs. &str

```rust
let literal: &str = "Hallo";            // Slice, im Binary, unveränderlich
let mut owned: String = String::from("Hallo");
owned.push_str(", Welt");               // wächst auf dem Heap

let borrowed: &str = &owned;            // Deref-Coercion: String → &str
let back: String = borrowed.to_string();

fn greet(name: &str) -> String {        // Parameter &str, Rückgabe String
    format!("Hallo, {name}!")
}

greet("Jan");            // &str passt direkt
greet(&owned);           // String wird automatisch zu &str
```

Faustregel: **Parameter `&str`, Rückgabe `String`** – so nimmt die Funktion beides entgegen.

```rust
let s = "Grüße";
s.len();                 // 6 – BYTES, nicht Zeichen!
s.chars().count();       // 5 – Zeichen
// s[0]                  // gibt es nicht: kein Indexzugriff auf Strings
&s[0..1];                // Byte-Slice – panickt an ungültiger Zeichengrenze
```

## Typische Use Cases

- Eingabe parsen und dabei shadowen: `let port: u16 = port.trim().parse()?;`
- Konfigurationswerte als `const` an den Modulkopf.
- Rückgabewerte über `if`-/`match`-Ausdruck statt über eine `mut`-Variable.
- Mehrere Ergebnisse ohne eigenen Typ: Tupel `(min, max)` – ab drei Feldern lieber ein Struct.
- Arithmetik auf Benutzereingaben immer mit `checked_*`/`try_from` absichern.
- API-Signaturen: `fn f(name: &str)` statt `fn f(name: String)`, damit Aufrufer nicht klonen müssen.

## Clean-Code-Empfehlungen

- `mut` nur, wenn es wirklich gebraucht wird – sonst Shadowing oder direkte Initialisierung.
- Keine Zwischenvariablen für Rückgaben: `fn area(w: u32, h: u32) -> u32 { w * h }`.
- Sprechende Typen wählen: `u32` für "kann nicht negativ sein", `usize` nur für Indizes/Längen.
- Zahlenliterale mit Unterstrichen und Suffix lesbar machen: `1_000_000_u64`.
- `expect("aussagekräftiger Grund")` statt `unwrap()` – der Text landet in der Panic-Meldung.
- Keine `as`-Casts als Reflex; `try_from` zeigt den Fehlerfall im Typ.
- `snake_case` für Funktionen/Variablen, `CamelCase` für Typen, `SCREAMING_SNAKE_CASE` für Konstanten.

## Häufige Fehler

```rust
// FALSCH: Semikolon macht aus dem Rückgabewert ()
fn double(x: i32) -> i32 { x * 2; }
// RICHTIG
fn double(x: i32) -> i32 { x * 2 }

// FALSCH: implizite Konvertierung erwartet
let a: i32 = 1;
let b: i64 = 2;
let c = a + b;                       // mismatched types
// RICHTIG
let c = i64::from(a) + b;

// FALSCH: Integer-Division, weil beide Seiten i32 sind
let ratio = 3 / 4;                   // 0
// RICHTIG
let ratio = 3.0 / 4.0;               // 0.75

// FALSCH: mut, obwohl der Wert nur einmal gesetzt wird
let mut label = String::new();
if ok { label = "ok".to_string(); } else { label = "fehler".to_string(); }
// RICHTIG
let label = if ok { "ok" } else { "fehler" };

// FALSCH: Overflow schleicht sich ein
let total = price * quantity;        // panickt im Debug-Build
// RICHTIG
let total = price.checked_mul(quantity).expect("Gesamtpreis zu groß");

// FALSCH: String indexieren
let first = name[0];                 // kompiliert nicht
// RICHTIG
let first = name.chars().next();     // Option<char>

// FALSCH: String-Parameter erzwingt Klonen beim Aufrufer
fn greet(name: String) -> String { format!("Hallo {name}") }
// RICHTIG
fn greet(name: &str) -> String { format!("Hallo {name}") }

// FALSCH: if-Zweige mit unterschiedlichem Typ
let x = if flag { 1 } else { "eins" };   // mismatched types
```

## Interview-relevante Details

- **Immutability by default** ist der zentrale Unterschied zu Java/C#: `let` entspricht `final`, `mut` ist die Ausnahme.
- **Shadowing vs. `mut`**: Shadowing erzeugt eine neue Bindung (Typwechsel erlaubt), `mut` ändert denselben Speicher.
- **Overflow-Verhalten**: Debug-Build panickt, Release-Build wrappt. Deshalb existieren `checked_`, `saturating_`, `wrapping_`, `overflowing_`.
- **`as` ist verlustbehaftet** und nie fehlschlagend – `try_from` ist die überprüfte Variante.
- **`loop` kann Werte liefern** (`break value`), `while`/`for` nicht (die liefern `()`).
- **`&str` ist ein Fat Pointer** (Zeiger + Länge) auf UTF-8-Bytes; `String` besitzt einen wachsbaren Heap-Puffer.
- **`char` ist 4 Byte**, ein Unicode-Scalar – nicht ein Byte wie in C.
- **Kein Null**: Fehlende Werte werden über `Option<T>` modelliert (Kapitel 05).

## Zusammenfassung

- `let` ist unveränderlich, `mut` ist die bewusste Ausnahme, Shadowing erlaubt Typwechsel.
- Fast alles ist ein Ausdruck: `if`, `match`, `loop`, Blöcke liefern Werte – Semikolon macht daraus `()`.
- Keine impliziten Konvertierungen: `From`/`TryFrom` bevorzugen, `as` nur bewusst.
- Integer-Overflow panickt im Debug-Build; `checked_*`/`saturating_*` sind die sicheren Werkzeuge.
- Tupel für zwei zusammengehörige Werte, Arrays für feste Längen, `Vec` für alles Dynamische.
- `&str` leihen, `String` besitzen: Parameter `&str`, Rückgabe `String`.
- `s.len()` zählt Bytes, `s.chars().count()` zählt Zeichen.
