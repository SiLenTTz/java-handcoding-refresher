import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    {
      id: 'f1',
      front: 'Struct vs. Enum – welches Wort beschreibt jeweils die Bedeutung?',
      back: '`struct` ist ein **UND** (Produkttyp): Name UND Alter UND E-Mail. `enum` ist ein **ODER** (Summentyp): Kreis ODER Rechteck ODER Punkt.',
    },
    {
      id: 'f2',
      front: 'Die drei Struct-Formen?',
      back: '```rust\nstruct User { id: u64, name: String }   // benannte Felder\nstruct Meters(f64);                     // Tuple-Struct / Newtype\nstruct Marker;                          // Unit-Struct\n```',
    },
    {
      id: 'f3',
      front: 'Methode vs. assoziierte Funktion?',
      back: 'Eine **Methode** hat `self`/`&self`/`&mut self` und wird mit `.` aufgerufen. Eine **assoziierte Funktion** hat kein `self` und wird mit `::` aufgerufen – z. B. `User::new(..)`, der Rust-"Konstruktor".',
    },
    {
      id: 'f4',
      front: 'Wann nimmt eine Methode `&self`, `&mut self`, `self`?',
      back: '`&self` liest, `&mut self` verändert, `self` **verbraucht** das Objekt (typisch bei `into_*`-Methoden). Das ist Teil der öffentlichen API, nicht nur ein Detail.',
    },
    {
      id: 'f5',
      front: 'Was bedeutet Exhaustiveness bei `match`?',
      back: 'Der Compiler verlangt, dass alle möglichen Werte abgedeckt sind. Fügst du einer Enum eine Variante hinzu, brechen genau die `match`-Blöcke, denen Logik fehlt – compilergestütztes Refactoring.',
    },
    {
      id: 'f6',
      front: 'Warum ist `_ => {}` bei eigenen Enums gefährlich?',
      back: 'Es schaltet die Exhaustiveness-Prüfung ab. Neue Varianten fallen still in den Catch-all und werden übersehen. Bei eigenen Enums lieber jede Variante ausschreiben.',
    },
    {
      id: 'f7',
      front: 'Welche Pattern-Formen kennt `match`?',
      back: '```rust\n200 => ..                  // Literal\n301 | 302 => ..            // Oder-Pattern\n400..=499 => ..            // Range\nn if n >= 500 => ..        // Guard\nUser { name, .. } => ..    // Destructuring\n_ => ..                    // Catch-all\n```',
    },
    {
      id: 'f8',
      front: 'Wann `if let`, wann `let else`?',
      back: '`if let` wenn dich genau ein Fall interessiert und es sinnvoll weitergeht. `let else` wenn der andere Fall abbrechen soll (`return`, `continue`, `panic!`) – so bleibt der Happy Path linksbündig.',
    },
    {
      id: 'f9',
      front: 'Was ist `Option<T>` technisch?',
      back: 'Ein ganz normales Enum: `enum Option<T> { None, Some(T) }`. Genau deshalb braucht Rust kein `null` – das Fehlen eines Werts steht im Typ und `match` erzwingt die Behandlung.',
    },
    {
      id: 'f10',
      front: 'Warum ist `match user { .. }` manchmal ein Move?',
      back: 'Wenn du auf den Wert statt auf eine Referenz matchst, werden Nicht-`Copy`-Felder aus dem Objekt gemoved. Lösung: `match &user { .. }` – dank Match Ergonomics werden die Bindings dann automatisch Referenzen.',
    },
    {
      id: 'f11',
      front: 'Wofür ist ein Newtype wie `struct UserId(u64)` gut?',
      back: 'Er verhindert Verwechslungen zur Compile-Zeit: `UserId` und `OrderId` sind verschiedene Typen, obwohl beide ein `u64` enthalten. Auspacken per `let UserId(raw) = id;` oder `id.0`.',
    },
    {
      id: 'f12',
      front: 'Wie groß ist ein Enum im Speicher?',
      back: 'So groß wie seine **größte** Variante plus Discriminant (plus Alignment). Deshalb große Varianten ggf. boxen. Bei `Option<&T>`/`Option<Box<T>>` spart die Niche Optimization den Discriminant komplett.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Kompiliert das?',
      code: `#[derive(Debug)]
enum Shape {
    Circle { radius: f64 },
    Rectangle(f64, f64),
    Point,
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle { radius } => 3.14 * radius * radius,
        Shape::Rectangle(w, h) => w * h,
    }
}`,
      options: [
        'Ja – `Point` hat ohnehin die Fläche 0',
        'Nein: `non-exhaustive patterns: Shape::Point not covered`',
        'Nein: Struct-Varianten kann man nicht destrukturieren',
        'Nein: `match` braucht immer ein `_`',
      ],
      correct: 1,
      explanation: '`match` muss vollständig sein. Der Compiler nennt die fehlende Variante beim Namen – genau dieser Fehler schützt dich beim Hinzufügen neuer Varianten.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `let code = 404;
let msg = match code {
    200 => "ok",
    301 | 302 => "redirect",
    400..=499 => "client error",
    n if n >= 500 => "server error",
    _ => "unbekannt",
};
println!("{msg}");`,
      options: ['`unbekannt`', '`client error`', '`server error`', 'Compile-Fehler: Arme überlappen'],
      correct: 1,
      explanation: '`match`-Arme werden von oben nach unten geprüft. `400..=499` trifft auf 404 zu; der Guard und der Catch-all werden gar nicht mehr erreicht.',
    },
    {
      id: 'q3',
      prompt: 'Was sagt der Compiler?',
      code: `struct User { id: u64, name: String }

let user = User { id: 1, name: String::from("Jan") };
match user {
    User { name, .. } => println!("{name}"),
}
println!("{}", user.id);`,
      options: [
        'Nichts – `id` ist `u64` und damit `Copy`',
        '`borrow of partially moved value: user`',
        '`cannot match on a struct`',
        '`non-exhaustive patterns`',
      ],
      correct: 1,
      explanation: 'Das Pattern moved `name` (ein `String`) aus `user` heraus. Danach ist `user` nur noch teilweise gültig. Mit `match &user` bleiben die Bindings Referenzen und nichts wird gemoved.',
    },
    {
      id: 'q4',
      prompt: 'Welche Variante ist idiomatisch?',
      code: `let found: Option<User> = find_user(id);`,
      options: [
        '`let user = found.unwrap();`',
        '`let Some(user) = found else { return Err("nicht gefunden".to_string()) };`',
        '`if found != None { let user = found.unwrap(); }`',
        '`let user = match found { Some(u) => u, None => panic!() };`',
      ],
      correct: 1,
      explanation: '`let else` behandelt den Fehlerfall an Ort und Stelle und hält den Happy Path ohne zusätzliche Einrückung. `unwrap()` verschweigt den Fall, `panic!` ist für Bibliothekslogik zu grob.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `#[derive(Debug, PartialEq)]
enum Status { New, Paid { cents: u64 } }

let s = Status::Paid { cents: 500 };
let text = match &s {
    Status::Paid { cents } if *cents > 1000 => "gross",
    Status::Paid { .. } => "klein",
    Status::New => "neu",
};
println!("{text}");`,
      options: ['`gross`', '`klein`', '`neu`', 'Compile-Fehler: Guard auf Referenz'],
      correct: 1,
      explanation: 'Der Guard `*cents > 1000` ist falsch (500), also greift der nächste passende Arm. `..` ignoriert die restlichen Felder.',
    },
    {
      id: 'q6',
      prompt: 'Welche Methodensignatur passt zu "liefert den Namen, ohne das Objekt zu verbrauchen"?',
      options: [
        '`fn name(self) -> String`',
        '`fn name(&self) -> &str`',
        '`fn name(&mut self) -> String`',
        '`fn name() -> &str`',
      ],
      correct: 1,
      explanation: '`&self` leiht nur, und `&str` gibt eine Referenz auf das Feld zurück – ohne Allokation. `self` würde das Objekt verbrauchen, `&mut self` verlangt unnötig exklusiven Zugriff.',
    },
    {
      id: 'q7',
      prompt: 'Kompiliert das?',
      code: `enum Shape { Circle(f64), Square(f64) }

fn area(c: Shape::Circle) -> f64 { c.0 * c.0 * 3.14 }`,
      options: [
        'Ja – Varianten sind eigene Typen',
        'Nein: eine Enum-Variante ist kein Typ, der Parameter muss `Shape` sein',
        'Nein: Tuple-Varianten haben kein `.0`',
        'Ja, aber nur mit `#[derive(Debug)]`',
      ],
      correct: 1,
      explanation: 'In Rust sind Enum-Varianten keine eigenständigen Typen. Der Parameter ist `&Shape` (oder `Shape`), die Unterscheidung passiert im `match`.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `#[derive(Debug)]
struct Point { x: i32, y: i32 }

let p = Point { x: 3, y: 4 };
let q = Point { y: 9, ..p };
println!("{} {}", q.x, q.y);`,
      options: ['`3 4`', '`3 9`', '`9 4`', 'Compile-Fehler: `p` wurde gemoved'],
      correct: 1,
      explanation: 'Die Struct-Update-Syntax `..p` übernimmt alle nicht explizit gesetzten Felder. Da beide Felder `i32` (also `Copy`) sind, bleibt `p` hier sogar gültig.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Struct mit impl-Block',
      level: 1,
      description:
        'Baue ein `Rectangle` mit `width: u32` und `height: u32` und implementiere:\n\n' +
        '- `Rectangle::new(width, height) -> Self` – assoziierte Funktion\n' +
        '- `Rectangle::square(size) -> Self` – quadratisch, soll `new` wiederverwenden\n' +
        '- `area(&self) -> u32`\n' +
        '- `is_square(&self) -> bool`\n' +
        '- `can_hold(&self, other: &Rectangle) -> bool` – passt `other` in `self` (Breite **und** Höhe mindestens so groß)?\n\n' +
        'Das Struct-Gerüst steht schon im Starter. Achte darauf, dass keine Methode `self` verbraucht.',
      starter: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(width: u32, height: u32) -> Self {
        // TODO
        Self { width: 0, height: 0 }
    }

    fn square(size: u32) -> Self {
        // TODO
        Self { width: 0, height: 0 }
    }

    fn area(&self) -> u32 {
        // TODO
        0
    }

    fn is_square(&self) -> bool {
        // TODO
        false
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        // TODO
        false
    }
}`,
      solution: `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(width: u32, height: u32) -> Self {
        Self { width, height }
    }

    fn square(size: u32) -> Self {
        Self::new(size, size)
    }

    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn is_square(&self) -> bool {
        self.width == self.height
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width >= other.width && self.height >= other.height
    }
}`,
      hints: [
        'Daten und Verhalten sind getrennt: Das `struct` beschreibt die Felder, der `impl`-Block die Funktionen dazu. `Self` ist innerhalb des Blocks ein Alias für `Rectangle`.',
        'Field-Init-Shorthand: Heißt der Parameter wie das Feld, reicht `Self { width, height }`. Assoziierte Funktionen rufst du intern mit `Self::new(..)` auf.',
        'new: Felder aus den Parametern setzen.\nsquare: `Self::new(size, size)`.\narea: Breite mal Höhe.\nis_square: Breite gleich Höhe.\ncan_hold: beide Maße vergleichen und mit `&&` verknüpfen.',
        '```rust\nfn square(size: u32) -> Self {\n    Self::new(size, size)\n}\n\nfn area(&self) -> u32 {\n    self.width * self.height\n}\n```',
      ],
      tests: `    let r = Rectangle::new(3, 4);
    check("Flaeche", 12, r.area());
    check("kein Quadrat", false, r.is_square());

    let s = Rectangle::square(5);
    check("Quadratflaeche", 25, s.area());
    check("ist Quadrat", true, s.is_square());

    check("Quadrat haelt kleineres", true, s.can_hold(&Rectangle::new(4, 4)));
    check("gleich gross passt", true, s.can_hold(&Rectangle::square(5)));
    check("schmales haelt breites nicht", false, r.can_hold(&s));
    check("entartetes Rechteck", 0, Rectangle::new(0, 9).area());`,
    },
    {
      id: 'k2',
      title: 'Enum mit Daten und match',
      level: 2,
      description:
        'Die Enum `Shape` ist vorgegeben. Implementiere:\n\n' +
        '- `impl Shape { fn area(&self) -> f64 }` – Kreis `PI * r * r`, Rechteck `breite * hoehe`, Punkt `0.0`\n' +
        '- `impl Shape { fn name(&self) -> &\'static str }` – `"Kreis"`, `"Rechteck"`, `"Punkt"`\n' +
        '- `fn total_area(shapes: &[Shape]) -> f64` – Summe aller Flächen\n\n' +
        'Nutze `std::f64::consts::PI` und schreibe in beiden `match`-Blöcken jede Variante aus – **kein** `_`.',
      given: `#[derive(Debug, PartialEq)]
pub enum Shape {
    Circle { radius: f64 },
    Rectangle(f64, f64),
    Point,
}`,
      starter: `impl Shape {
    fn area(&self) -> f64 {
        // TODO
        0.0
    }

    fn name(&self) -> &'static str {
        // TODO
        ""
    }
}

fn total_area(shapes: &[Shape]) -> f64 {
    // TODO
    0.0
}`,
      solution: `impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
            Shape::Rectangle(width, height) => width * height,
            Shape::Point => 0.0,
        }
    }

    fn name(&self) -> &'static str {
        match self {
            Shape::Circle { .. } => "Kreis",
            Shape::Rectangle(..) => "Rechteck",
            Shape::Point => "Punkt",
        }
    }
}

fn total_area(shapes: &[Shape]) -> f64 {
    shapes.iter().map(|shape| shape.area()).sum()
}`,
      hints: [
        'Ein `match` auf `&self` ist ein Ausdruck – jeder Arm liefert den Rückgabewert. Dank Match Ergonomics sind die gebundenen Felder automatisch Referenzen, du brauchst kein `ref`.',
        'Struct-Varianten bindest du mit `Shape::Circle { radius }`, Tuple-Varianten mit `Shape::Rectangle(w, h)`. Felder ignorieren: `{ .. }` bzw. `(..)`. Die Summe kommt aus `iter().map(..).sum()`.',
        'area: match über alle drei Varianten, jeweils die Formel.\nname: match über alle drei Varianten, jeweils ein Literal.\ntotal_area: über den Slice iterieren, `area()` mappen, summieren.',
        '```rust\nmatch self {\n    Shape::Circle { radius } => std::f64::consts::PI * radius * radius,\n    Shape::Rectangle(width, height) => width * height,\n    Shape::Point => 0.0,\n}\n```',
      ],
      tests: `    check("Rechteckflaeche", 12.0, Shape::Rectangle(3.0, 4.0).area());
    check("Punktflaeche", 0.0, Shape::Point.area());
    check(
        "Kreisflaeche",
        std::f64::consts::PI * 4.0,
        Shape::Circle { radius: 2.0 }.area(),
    );

    check("Name Kreis", "Kreis", Shape::Circle { radius: 1.0 }.name());
    check("Name Rechteck", "Rechteck", Shape::Rectangle(1.0, 1.0).name());
    check("Name Punkt", "Punkt", Shape::Point.name());

    let shapes = vec![Shape::Rectangle(3.0, 4.0), Shape::Point, Shape::Rectangle(2.0, 0.5)];
    check("Gesamtflaeche", 13.0, total_area(&shapes));
    check("leere Liste", 0.0, total_area(&[]));`,
    },
    {
      id: 'k3',
      title: 'Kommandos parsen',
      level: 3,
      description:
        'Implementiere `fn parse(input: &str) -> Command` für eine kleine Kommandosprache:\n\n' +
        '| Eingabe | Ergebnis |\n' +
        '|---|---|\n' +
        '| `"add 5"` | `Command::Add(5)` |\n' +
        '| `"remove -3"` | `Command::Remove(-3)` |\n' +
        '| `"clear"` | `Command::Clear` |\n' +
        '| alles andere | `Command::Unknown(<getrimmte Eingabe>)` |\n\n' +
        'Regeln: Die Eingabe wird zuerst getrimmt. `clear` darf **kein** Argument haben. `add`/`remove` brauchen genau ein Argument, das sich als `i64` parsen lässt – sonst `Unknown`.',
      given: `#[derive(Debug, PartialEq)]
pub enum Command {
    Add(i64),
    Remove(i64),
    Clear,
    Unknown(String),
}`,
      starter: `fn parse(input: &str) -> Command {
    // TODO
    Command::Unknown(input.trim().to_string())
}`,
      solution: `fn parse(input: &str) -> Command {
    let trimmed = input.trim();
    let mut parts = trimmed.split_whitespace();
    let keyword = parts.next();
    let argument = parts.next();
    let rest = parts.next();

    match (keyword, argument, rest) {
        (Some("clear"), None, None) => Command::Clear,
        (Some("add"), Some(value), None) => match value.parse::<i64>() {
            Ok(number) => Command::Add(number),
            Err(_) => Command::Unknown(trimmed.to_string()),
        },
        (Some("remove"), Some(value), None) => match value.parse::<i64>() {
            Ok(number) => Command::Remove(number),
            Err(_) => Command::Unknown(trimmed.to_string()),
        },
        _ => Command::Unknown(trimmed.to_string()),
    }
}`,
      hints: [
        'Zerlege die Eingabe zuerst in Schlüsselwort und Argument. Ein Tupel aus beiden lässt sich in **einem** `match` auswerten – das ist lesbarer als verschachtelte `if`s.',
        '`str::trim()`, `str::split_whitespace()`, `Iterator::next() -> Option<&str>`, `str::parse::<i64>() -> Result<i64, _>`. Auf ein Tupel kann man direkt matchen: `match (a, b) { (Some("add"), Some(v)) => .. }`.',
        'trimmen, in Teile zerlegen, die ersten drei Iterator-Einträge holen.\nDann `match (keyword, argument, rest)`:\n- ("clear", None, None) -> Clear\n- ("add", Some(v), None) -> parsen, bei Ok -> Add, bei Err -> Unknown\n- analog für "remove"\n- alles andere -> Unknown',
        '```rust\nmatch (keyword, argument, rest) {\n    (Some("clear"), None, None) => Command::Clear,\n    (Some("add"), Some(value), None) => match value.parse::<i64>() {\n        Ok(number) => Command::Add(number),\n        Err(_) => Command::Unknown(trimmed.to_string()),\n    },\n    // ...\n}\n```',
      ],
      tests: `    check("add", Command::Add(5), parse("add 5"));
    check("add mit Leerzeichen", Command::Add(42), parse("  add   42  "));
    check("remove negativ", Command::Remove(-3), parse("remove -3"));
    check("clear", Command::Clear, parse("  clear  "));
    check("kaputte Zahl", Command::Unknown("add x".to_string()), parse("add x"));
    check("add ohne Argument", Command::Unknown("add".to_string()), parse("add"));
    check("clear mit Argument", Command::Unknown("clear 3".to_string()), parse("clear 3"));
    check("zu viele Argumente", Command::Unknown("add 1 2".to_string()), parse("add 1 2"));
    check("unbekanntes Wort", Command::Unknown("foo".to_string()), parse("foo"));
    check("leere Eingabe", Command::Unknown(String::new()), parse("   "));`,
    },
    {
      id: 'k4',
      title: 'Event-Log zusammenfassen',
      level: 4,
      description:
        'Implementiere `fn summarize(events: &[Event]) -> Vec<String>`. Pro Event **eine** Zeile, in Eingabereihenfolge:\n\n' +
        '| Variante | Zeile |\n' +
        '|---|---|\n' +
        '| `Login { user }` | `"<user> angemeldet"` |\n' +
        '| `Logout { user }` | `"<user> abgemeldet"` |\n' +
        '| `Purchase` mit `cents >= 10_000` | `"<user> Grosseinkauf <betrag>"` |\n' +
        '| `Purchase` sonst | `"<user> kauft <betrag>"` |\n' +
        '| `Ping` | **keine** Zeile |\n\n' +
        'Der Betrag wird als `"123.45 EUR"` formatiert – also Euro, Punkt, **immer zwei** Cent-Stellen (`9_999` wird zu `"99.99 EUR"`, `10_000` zu `"100.00 EUR"`).\n\n' +
        'Nutze einen Guard für die Betragsgrenze und schreibe jede Variante explizit aus.',
      given: `#[derive(Debug, PartialEq)]
pub enum Event {
    Login { user: String },
    Logout { user: String },
    Purchase { user: String, cents: u64 },
    Ping,
}`,
      starter: `fn summarize(events: &[Event]) -> Vec<String> {
    // TODO
    Vec::new()
}`,
      solution: `fn format_euro(cents: u64) -> String {
    format!("{}.{:02} EUR", cents / 100, cents % 100)
}

fn summarize(events: &[Event]) -> Vec<String> {
    let mut lines = Vec::new();

    for event in events {
        match event {
            Event::Login { user } => lines.push(format!("{user} angemeldet")),
            Event::Logout { user } => lines.push(format!("{user} abgemeldet")),
            Event::Purchase { user, cents } if *cents >= 10_000 => {
                lines.push(format!("{user} Grosseinkauf {}", format_euro(*cents)));
            }
            Event::Purchase { user, cents } => {
                lines.push(format!("{user} kauft {}", format_euro(*cents)));
            }
            Event::Ping => {}
        }
    }

    lines
}`,
      hints: [
        'Zwei Arme können dieselbe Variante behandeln, wenn der erste einen Guard hat – der Guard-Arm muss dabei **oben** stehen. Ein Arm darf auch einfach nichts tun (`=> {}`).',
        'Cent-Formatierung: `format!("{}.{:02} EUR", cents / 100, cents % 100)` – `{:02}` füllt auf zwei Stellen mit Null auf. Im `match` auf `&Event` ist `cents` ein `&u64`, also `*cents` zum Vergleichen.',
        'Ergebnis-Vec anlegen, über `events` iterieren (leihen, nicht moven), pro Event matchen:\nLogin/Logout -> Zeile pushen\nPurchase mit Guard >= 10_000 -> Grosseinkauf-Zeile\nPurchase sonst -> kauft-Zeile\nPing -> nichts\nZieh die Betragsformatierung in eine kleine Hilfsfunktion.',
        '```rust\nEvent::Purchase { user, cents } if *cents >= 10_000 => {\n    lines.push(format!("{user} Grosseinkauf {}", format_euro(*cents)));\n}\nEvent::Purchase { user, cents } => {\n    lines.push(format!("{user} kauft {}", format_euro(*cents)));\n}\n```',
      ],
      tests: `    let events = vec![
        Event::Login { user: "jan".to_string() },
        Event::Ping,
        Event::Purchase { user: "jan".to_string(), cents: 250 },
        Event::Purchase { user: "anna".to_string(), cents: 12_345 },
        Event::Logout { user: "jan".to_string() },
    ];
    let lines = summarize(&events);
    check("Ping erzeugt keine Zeile", 4, lines.len());
    check(
        "komplettes Protokoll",
        vec![
            "jan angemeldet".to_string(),
            "jan kauft 2.50 EUR".to_string(),
            "anna Grosseinkauf 123.45 EUR".to_string(),
            "jan abgemeldet".to_string(),
        ],
        lines,
    );

    check(
        "Grenzwert 100 EUR ist gross",
        vec!["bo Grosseinkauf 100.00 EUR".to_string()],
        summarize(&[Event::Purchase { user: "bo".to_string(), cents: 10_000 }]),
    );
    check(
        "knapp darunter ist klein",
        vec!["bo kauft 99.99 EUR".to_string()],
        summarize(&[Event::Purchase { user: "bo".to_string(), cents: 9_999 }]),
    );
    check(
        "null Cent",
        vec!["bo kauft 0.00 EUR".to_string()],
        summarize(&[Event::Purchase { user: "bo".to_string(), cents: 0 }]),
    );
    check("nur Pings", Vec::<String>::new(), summarize(&[Event::Ping, Event::Ping]));
    check("leere Eingabe", Vec::<String>::new(), summarize(&[]));`,
    },
  ],
}

export default chapter
