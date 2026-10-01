# Kapitel 02 – Ownership & Borrowing

## Mental Model

```text
OWNERSHIP     Jeder Wert hat genau EINEN Owner.
              Owner geht out of scope  →  Wert wird gedroppt (kein GC, kein free).

MOVE          let b = a;          a ist danach ungültig (bei Heap-Typen)
COPY          let b = a;          a bleibt gültig (i32, bool, char, &T, Copy-Tupel)
CLONE         let b = a.clone();  explizite, sichtbare Kopie

BORROW        &T      beliebig viele gleichzeitig   (shared / immutable)
              &mut T  genau einer, dann kein &T     (exclusive)
```

- Der Borrow-Checker prüft zur **Compile-Zeit**: entweder *ein* `&mut` **oder** *beliebig viele* `&` – nie beides.
- Eine Referenz darf nie länger leben als der Wert, auf den sie zeigt. Das ist alles, was Lifetimes ausdrücken.

## Syntax / API

### Die drei Ownership-Regeln

```rust
{
    let s = String::from("hallo");   // s ist Owner
    // ... s benutzbar
}                                    // Scope-Ende → drop(s), Heap-Speicher frei
```

1. Jeder Wert hat einen Owner.
2. Es gibt immer genau einen Owner.
3. Verlässt der Owner den Scope, wird der Wert gedroppt.

### Move vs. Copy

```rust
let a = String::from("hallo");
let b = a;                     // MOVE
// println!("{a}");            // Fehler: value borrowed here after move

let x = 5;
let y = x;                     // COPY (i32 ist Copy)
println!("{x} {y}");           // ok
```

`Copy` haben alle Skalartypen, `&T`, und Tupel/Arrays, deren Elemente alle `Copy` sind.
Alles mit Heap-Anteil (`String`, `Vec<T>`, `Box<T>`, `HashMap`) ist **Move**.

```rust
fn consume(s: String) { }          // nimmt Ownership
fn inspect(s: &str) { }            // leiht nur

let name = String::from("Jan");
inspect(&name);                    // name bleibt gültig
consume(name);                     // name ist danach weg
// inspect(&name);                 // Fehler
```

Auch `for x in vec` konsumiert den `Vec`. `for x in &vec` leiht ihn.

### Clone – und wann er vertretbar ist

```rust
let a = String::from("hallo");
let b = a.clone();                 // eigener Heap-Puffer
println!("{a} {b}");               // beide gültig
```

`clone()` ist kein Fehler, aber immer eine bewusste Entscheidung. Vertretbar, wenn:

- die Daten klein sind und der Code dadurch deutlich einfacher wird,
- zwei unabhängige Besitzer wirklich gebraucht werden (z. B. Wert in zwei Collections),
- man ein Prototyping-Hindernis wegräumt und es später misst.

Nicht vertretbar als **Reflex**, um den Borrow-Checker ruhigzustellen. Meist reicht `&`.

### Borrowing: & und &mut

```rust
fn length(s: &String) -> usize { s.len() }          // shared borrow

fn shout(s: &mut String) {                          // exclusive borrow
    s.push('!');
}

let mut text = String::from("hallo");
println!("{}", length(&text));
shout(&mut text);
```

`&mut` braucht eine `mut`-Variable: man kann nur ausleihen, was man selbst verändern darf.

### Die Ausschlussregel

```rust
let mut v = vec![1, 2, 3];

let a = &v;
let b = &v;              // ok: beliebig viele shared borrows
println!("{a:?} {b:?}");

let m = &mut v;          // ok, weil a und b nicht mehr benutzt werden (NLL)
m.push(4);

// let a = &v;
// let m = &mut v;
// println!("{a:?}");    // Fehler: cannot borrow `v` as mutable
//                       // because it is also borrowed as immutable
```

Ein Borrow endet bei seiner **letzten Verwendung**, nicht am Blockende (Non-Lexical Lifetimes).

```rust
let mut v = vec![1, 2, 3];
for x in &v {
    // v.push(*x);       // Fehler: v ist während der Iteration geliehen
}
```

### Dangling References gibt es nicht

```rust
fn dangling() -> &String {          // Fehler: missing lifetime specifier
    let s = String::from("weg");
    &s                              // s stirbt am Funktionsende
}

fn fine() -> String {               // Ownership zurückgeben
    String::from("bleibt")
}
```

### Lifetimes als Konzept

Eine Lifetime ist **keine Lebensdauer, die man festlegt**, sondern eine Zusicherung, die man
dem Compiler gibt: *"Die Rückgabe lebt mindestens so lange wie diese Eingabe."*

```rust
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

fn first<'a>(a: &'a str, _b: &str) -> &'a str { a }   // nur a wird zugesichert
```

Bei einem einzigen Referenz-Parameter darf man sie weglassen (Lifetime Elision):

```rust
fn first_word(text: &str) -> &str { .. }              // = <'a>(text: &'a str) -> &'a str
```

In Structs erzwingt `'a`, dass das Struct nicht länger lebt als die geliehenen Daten:

```rust
struct Excerpt<'a> {
    part: &'a str,
}
```

### Slices sind Borrows

```rust
let v = vec![10, 20, 30, 40];
let all: &[i32] = &v;              // ganzer Vec als Slice
let mid: &[i32] = &v[1..3];        // [20, 30]

let text = String::from("hallo welt");
let word: &str = &text[0..5];      // "hallo"

fn total(values: &[i32]) -> i32 {  // nimmt Vec, Array und Slice entgegen
    values.iter().sum()
}
total(&v);
total(&[1, 2, 3]);
```

Ein Slice besitzt nichts – er zeigt auf fremden Speicher und hält einen Borrow.
Deshalb: `&[T]` statt `&Vec<T>` und `&str` statt `&String` in Signaturen.

## Typische Use Cases

- Lesende Funktionen nehmen `&T`/`&[T]`/`&str` und geben berechnete Werte zurück.
- Verändernde Funktionen nehmen `&mut T` und geben `()` zurück.
- Builder/Transformationen nehmen `T` per Value und geben `T` zurück (Move-Kette).
- Ergebnis-Strings immer als `String` zurückgeben, niemals als Referenz auf Lokales.
- Zwei Sichten auf dieselben Daten → Slices statt zwei `Vec`-Kopien.
- Teure Strukturen in Schleifen: einmal `&` holen statt pro Durchlauf klonen.

## Clean-Code-Empfehlungen

- Signaturen so schwach wie möglich: `&str` > `&String`, `&[T]` > `&Vec<T>`.
- `&mut` nur, wenn die Funktion wirklich mutiert – sonst `&`.
- Lieber eine `String`-Rückgabe als eine Lifetime-Annotation, die niemand versteht.
- `clone()` mit einer kurzen Begründung versehen, wenn er nicht offensichtlich ist.
- Lange `&mut`-Borrows vermeiden: Scope klein halten, damit danach wieder `&` möglich ist.
- Struct-Felder besitzen lassen (`String`, `Vec<T>`); Structs mit `'a` nur für kurzlebige Views.

## Häufige Fehler

```rust
// FALSCH: nach Move weiterverwenden
let s = String::from("hi");
let t = s;
println!("{s}");                       // borrow of moved value
// RICHTIG
let t = s.clone();                     // oder: let t = &s;

// FALSCH: Vec an Funktion geben und danach brauchen
fn count(v: Vec<i32>) -> usize { v.len() }
let v = vec![1, 2];
count(v);
println!("{}", v.len());               // v wurde gemoved
// RICHTIG
fn count(v: &[i32]) -> usize { v.len() }

// FALSCH: shared und exclusive Borrow gleichzeitig
let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{first}");                   // cannot borrow `v` as mutable
// RICHTIG
let first = v[0];                      // i32 ist Copy → kein Borrow mehr offen
v.push(4);

// FALSCH: Referenz auf lokale Variable zurückgeben
fn build() -> &str {
    let s = String::from("hi");
    &s
}
// RICHTIG
fn build() -> String { String::from("hi") }

// FALSCH: während der Iteration verändern
for item in &items {
    items.push(item.clone());          // cannot borrow `items` as mutable
}
// RICHTIG
let extra: Vec<_> = items.iter().cloned().collect();
items.extend(extra);

// FALSCH: clone() als Borrow-Checker-Schmerzmittel
process(data.clone());
process(data.clone());
// RICHTIG
process(&data);
process(&data);

// FALSCH: überflüssig starke Signatur
fn print_all(v: &Vec<String>) { }
// RICHTIG
fn print_all(v: &[String]) { }
```

## Interview-relevante Details

- **Ownership ersetzt GC und manuelles `free`**: Speicher wird deterministisch beim Verlassen des Scopes freigegeben (RAII).
- **Move ist ein Byte-Kopieren des Stack-Anteils** (Pointer/len/cap) plus Invalidierung der Quelle – kein Deep Copy.
- **`Copy` und `Drop` schließen sich aus**: Ein Typ mit `Drop`-Logik kann nicht `Copy` sein.
- **Ausschlussregel verhindert Data Races** zur Compile-Zeit – das ist die Grundlage von "fearless concurrency".
- **NLL**: Ein Borrow endet bei der letzten Verwendung, nicht am Blockende. Erklärt viele "warum kompiliert das doch?"-Fälle.
- **Lifetime-Annotationen erzeugen keinen Code** und verlängern nichts – sie prüfen nur Beziehungen.
- **Elision-Regeln**: Ein Eingabe-Borrow → dessen Lifetime gilt für die Ausgabe; bei `&self` gewinnt `self`.
- **Slice = Fat Pointer** (Zeiger + Länge); `&Vec<T>` ist ein zusätzlicher Indirektionsschritt.

## Zusammenfassung

- Ein Owner pro Wert; Scope-Ende bedeutet Drop.
- Heap-Typen werden **gemoved**, Skalare werden **kopiert**, `clone()` ist immer explizit.
- `&` beliebig oft, `&mut` genau einmal und nie parallel zu `&`.
- Referenzen können nie dangling werden – der Compiler lehnt das ab.
- Lifetimes beschreiben Beziehungen zwischen Referenzen, sie steuern keine Lebensdauer.
- Slices (`&[T]`, `&str`) sind Borrows und die bessere Parameterform.
- `clone()` ist erlaubt, aber eine Entscheidung – kein Standardwerkzeug gegen den Borrow-Checker.
