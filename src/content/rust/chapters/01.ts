import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    {
      id: 'f1',
      front: 'Unterschied zwischen `let`, `let mut` und Shadowing?',
      back: '`let` bindet unveränderlich (wie `final`). `let mut` erlaubt Zuweisung an dieselbe Variable. Shadowing (`let x = x + 1;`) erzeugt eine **neue** Variable – der Typ darf dabei wechseln.',
    },
    {
      id: 'f2',
      front: 'Ausdruck oder Statement – und woran erkennt man den Unterschied?',
      back: 'Ein **Ausdruck** liefert einen Wert (`if`, `match`, `loop`, Blöcke, Funktionsaufrufe). Ein **Statement** liefert keinen (`let x = 5;`, `fn f() {}`). Ein Semikolon macht aus einem Ausdruck ein Statement mit Wert `()`.',
    },
    {
      id: 'f3',
      front: 'Warum kompiliert `fn double(x: i32) -> i32 { x * 2; }` nicht?',
      back: 'Das Semikolon verwirft den Wert – der Block liefert `()`, erwartet wird `i32`. Semikolon weg: `{ x * 2 }`.',
    },
    {
      id: 'f4',
      front: 'Was ist der Default-Integer-Typ, und wofür ist `usize` da?',
      back: '`i32` ist der Default. `usize` ist so groß wie ein Zeiger und der Typ für **Indizes und Längen** (`v.len()`, `v.get(i)`).',
    },
    {
      id: 'f5',
      front: 'Was passiert bei `i32::MAX + 1`?',
      back: 'Debug-Build: **Panic** ("attempt to add with overflow"). Release-Build: Wrap-around zu `i32::MIN`. Deshalb nie auf "läuft schon" verlassen.',
    },
    {
      id: 'f6',
      front: 'Die vier Overflow-sicheren Varianten von `add`?',
      back: '```rust\na.checked_add(b)      // Option<i32> -> None\na.saturating_add(b)   // deckelt bei MAX/MIN\na.wrapping_add(b)     // bewusster Wrap\na.overflowing_add(b)  // (Wert, bool)\n```',
    },
    {
      id: 'f7',
      front: '`as` vs. `From` vs. `TryFrom` bei Zahlkonvertierung?',
      back: '`as` konvertiert immer und **schneidet stillschweigend ab** (`300_i32 as u8 == 44`). `From` ist verlustfrei (`i64::from(x)`). `TryFrom` liefert `Result` und ist der saubere Weg beim Verkleinern.',
    },
    {
      id: 'f8',
      front: '`String` oder `&str` – was nimmt man in Signaturen?',
      back: 'Parameter `&str`, Rückgabe `String`. So funktionieren Literale **und** `String` als Argument (Deref-Coercion), ohne dass der Aufrufer klonen muss.',
    },
    {
      id: 'f9',
      front: 'Was liefert `"Grüße".len()`?',
      back: '`6` – `len()` zählt **UTF-8-Bytes**, nicht Zeichen. Zeichen zählt man mit `s.chars().count()` (hier `5`).',
    },
    {
      id: 'f10',
      front: 'Wie gibt man aus einer Schleife einen Wert zurück?',
      back: 'Nur `loop` kann das: `let x = loop { if done { break result; } };`. `while` und `for` liefern immer `()`.',
    },
    {
      id: 'f11',
      front: '`const` vs. `static`?',
      back: '`const` wird an jeder Verwendungsstelle eingesetzt (kein fester Speicherort), `static` hat eine feste Adresse und lebt das ganze Programm. Beide brauchen eine Typ-Annotation. Im Alltag: `const`.',
    },
    {
      id: 'f12',
      front: 'Warum liefert `let ratio = 3 / 4;` den Wert `0`?',
      back: 'Beide Literale sind `i32` – Integer-Division schneidet ab. Für `0.75`: `3.0 / 4.0` oder `3 as f64 / 4 as f64`.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Kompiliert das?',
      code: `fn double(x: i32) -> i32 {
    x * 2;
}`,
      options: [
        'Ja, das Semikolon ist optional',
        'Nein – der Block liefert `()`, erwartet wird `i32`',
        'Nein – es fehlt `return`',
        'Ja, aber nur mit `let mut x`',
      ],
      correct: 1,
      explanation: 'Das Semikolon verwirft den Wert des Ausdrucks. Der Block hat damit den Typ `()`. Ohne Semikolon ist `x * 2` der Rückgabewert.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `let x = 5;
let x = x * 2;
{
    let x = x + 1;
    println!("{x}");
}
println!("{x}");`,
      options: ['`11` und `11`', '`10` und `10`', '`11` und `10`', 'Fehler: `x` ist nicht `mut`'],
      correct: 2,
      explanation: 'Shadowing erzeugt jeweils neue Bindungen. Im inneren Block gilt `11`, nach dem Block ist wieder das äußere `x` mit `10` sichtbar. `mut` braucht man dafür nicht.',
    },
    {
      id: 'q3',
      prompt: 'Was ist der Wert von `ratio`?',
      code: `let ratio = 3 / 4;`,
      options: ['`0.75`', '`0`', '`1`', 'Compile-Fehler'],
      correct: 1,
      explanation: 'Beide Literale werden zu `i32` inferiert, also ganzzahlige Division mit Abschneiden. Für `0.75` müssen beide Operanden `f64` sein.',
    },
    {
      id: 'q4',
      prompt: 'Was passiert im Debug-Build?',
      code: `let a: i32 = i32::MAX;
let b = a + 1;`,
      options: [
        '`b` ist `i32::MIN` (Wrap-around)',
        'Das Programm panickt mit "attempt to add with overflow"',
        '`b` ist `i32::MAX` (gedeckelt)',
        'Compile-Fehler',
      ],
      correct: 1,
      explanation: 'Im Debug-Build sind Overflow-Checks aktiv und lösen einen Panic aus. Im Release-Build würde gewrappt – beides ist ein Bug. Sauber: `a.checked_add(1)`.',
    },
    {
      id: 'q5',
      prompt: 'Welche Konvertierung meldet den Datenverlust, statt still abzuschneiden?',
      code: `let n: i32 = 300;`,
      options: ['`n as u8`', '`u8::try_from(n)`', '`u8::from(n)`', '`n.to_string().len()`'],
      correct: 1,
      explanation: '`try_from` liefert `Result<u8, TryFromIntError>` und schlägt bei 300 fehl. `as` ergäbe stillschweigend `44`, `u8::from(i32)` existiert gar nicht.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `let mut attempt = 0;
let result = loop {
    attempt += 1;
    if attempt == 3 {
        break attempt * 10;
    }
};
println!("{result}");`,
      options: ['`3`', '`30`', '`()`', 'Compile-Fehler: `loop` liefert keinen Wert'],
      correct: 1,
      explanation: '`loop` ist der einzige Schleifentyp, der über `break wert` einen Wert liefert. `while` und `for` haben immer den Typ `()`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Signatur ist idiomatisch?',
      options: [
        '`fn greet(name: String) -> String`',
        '`fn greet(name: &String) -> String`',
        '`fn greet(name: &str) -> String`',
        '`fn greet(name: &str) -> &str`',
      ],
      correct: 2,
      explanation: '`&str` nimmt Literale und `String` entgegen (Deref-Coercion), ohne Ownership zu verlangen. Die Rückgabe muss `String` sein, weil ein neu gebauter Text niemandem gehört, auf den man verweisen könnte.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `let s = "Grüße";
println!("{} {}", s.len(), s.chars().count());`,
      options: ['`5 5`', '`6 5`', '`5 6`', '`6 6`'],
      correct: 1,
      explanation: '`len()` zählt UTF-8-Bytes – das `ü` braucht zwei. `chars().count()` zählt Unicode-Scalars, also 5 Zeichen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Temperatur umrechnen',
      level: 1,
      description:
        'Implementiere zwei Funktionen:\n\n' +
        '- `fn to_celsius(fahrenheit: f64) -> f64` – Formel: `(F - 32) * 5 / 9`\n' +
        '- `fn label(celsius: f64) -> String` – `"kalt"` bei unter `0.0`, `"mild"` bei unter `20.0`, sonst `"warm"`\n\n' +
        'Nutze in `label` einen `if`-**Ausdruck**, keine `mut`-Variable. Achte darauf, dass die Division in `f64` passiert.',
      starter: `fn to_celsius(fahrenheit: f64) -> f64 {
    // TODO
    0.0
}

fn label(celsius: f64) -> String {
    // TODO
    String::new()
}`,
      solution: `fn to_celsius(fahrenheit: f64) -> f64 {
    (fahrenheit - 32.0) * 5.0 / 9.0
}

fn label(celsius: f64) -> String {
    if celsius < 0.0 {
        String::from("kalt")
    } else if celsius < 20.0 {
        String::from("mild")
    } else {
        String::from("warm")
    }
}`,
      hints: [
        'Der letzte Ausdruck einer Funktion ohne Semikolon ist ihr Rückgabewert. Du brauchst weder `return` noch eine Hilfsvariable.',
        'Schreibe alle Zahlenliterale als `32.0`, `5.0`, `9.0` – sonst kollidieren `i32` und `f64`. Einen `&str` machst du mit `String::from(..)` oder `.to_string()` zu einem `String`.',
        'to_celsius: (fahrenheit - 32.0) * 5.0 / 9.0 direkt zurückgeben.\nlabel: if < 0.0 -> kalt, else if < 20.0 -> mild, else -> warm.',
        '```rust\nfn label(celsius: f64) -> String {\n    if celsius < 0.0 {\n        String::from("kalt")\n    } else if /* ... */ {\n        // ...\n    } else {\n        String::from("warm")\n    }\n}\n```',
      ],
      tests: `    check("Gefrierpunkt", 0.0, to_celsius(32.0));
    check("Siedepunkt", 100.0, to_celsius(212.0));
    check("50 Grad Fahrenheit", 10.0, to_celsius(50.0));
    check("minus 40 ist gleich", -40.0, to_celsius(-40.0));
    check("kalt", "kalt".to_string(), label(-0.5));
    check("Grenze 0 ist mild", "mild".to_string(), label(0.0));
    check("Grenze 20 ist warm", "warm".to_string(), label(20.0));
    check("warm", "warm".to_string(), label(31.5));`,
    },
    {
      id: 'k2',
      title: 'Summe ohne Overflow',
      level: 2,
      description:
        'Zwei Wege, mit Integer-Overflow umzugehen:\n\n' +
        '- `fn checked_sum(values: &[i32]) -> Option<i32>` – Summe aller Werte, `None` sobald ein Schritt überläuft. Leerer Slice ergibt `Some(0)`.\n' +
        '- `fn saturating_sum(values: &[i32]) -> i32` – Summe, die bei `i32::MAX` bzw. `i32::MIN` stehen bleibt.\n\n' +
        'Benutze `checked_add` und `saturating_add`, nicht den `+`-Operator.',
      starter: `fn checked_sum(values: &[i32]) -> Option<i32> {
    // TODO
    Some(0)
}

fn saturating_sum(values: &[i32]) -> i32 {
    // TODO
    0
}`,
      solution: `fn checked_sum(values: &[i32]) -> Option<i32> {
    let mut total: i32 = 0;
    for value in values {
        total = total.checked_add(*value)?;
    }
    Some(total)
}

fn saturating_sum(values: &[i32]) -> i32 {
    let mut total: i32 = 0;
    for value in values {
        total = total.saturating_add(*value);
    }
    total
}`,
      hints: [
        'Der `+`-Operator panickt im Debug-Build bei Overflow. Jeder Integer-Typ hat dafür geprüfte Varianten.',
        '`i32::checked_add(self, rhs) -> Option<i32>` und `i32::saturating_add(self, rhs) -> i32`. In `for value in values` ist `value` ein `&i32` – mit `*value` kommst du an den Wert.',
        'Laufsumme mit `let mut total = 0;` starten, über den Slice iterieren, pro Schritt geprüft addieren. Bei `None` sofort `None` zurückgeben.',
        '```rust\nlet mut total: i32 = 0;\nfor value in values {\n    total = total.checked_add(*value)?;   // ? gibt bei None direkt None zurück\n}\nSome(total)\n```',
      ],
      tests: `    check("normale Summe", Some(6), checked_sum(&[1, 2, 3]));
    check("leerer Slice", Some(0), checked_sum(&[]));
    check("negative Werte", Some(-2), checked_sum(&[3, -5]));
    check("Overflow nach oben", None, checked_sum(&[i32::MAX, 1]));
    check("Overflow nach unten", None, checked_sum(&[i32::MIN, -1]));
    check("saturating deckelt oben", i32::MAX, saturating_sum(&[i32::MAX, 5]));
    check("saturating deckelt unten", i32::MIN, saturating_sum(&[i32::MIN, -5]));
    check("saturating normal", 6, saturating_sum(&[1, 2, 3]));`,
    },
    {
      id: 'k3',
      title: 'Min, Max und Spannweite',
      level: 3,
      description:
        'Implementiere:\n\n' +
        '- `fn min_max(values: &[i32]) -> (i32, i32)` – Tupel aus kleinstem und größtem Wert. Bei einem **leeren** Slice: `panic!` mit einer aussagekräftigen Meldung.\n' +
        '- `fn spread(values: &[i32]) -> i32` – Differenz `max - min`, implementiert **auf Basis von** `min_max` (Tupel destrukturieren).\n\n' +
        'Schreibe die Schleife ohne Index-Zugriffe auf `values[i]`.',
      starter: `fn min_max(values: &[i32]) -> (i32, i32) {
    // TODO
    (0, 0)
}

fn spread(values: &[i32]) -> i32 {
    // TODO
    0
}`,
      solution: `fn min_max(values: &[i32]) -> (i32, i32) {
    let Some((first, rest)) = values.split_first() else {
        panic!("min_max braucht mindestens einen Wert");
    };

    let mut min = *first;
    let mut max = *first;
    for value in rest {
        if *value < min {
            min = *value;
        }
        if *value > max {
            max = *value;
        }
    }
    (min, max)
}

fn spread(values: &[i32]) -> i32 {
    let (min, max) = min_max(values);
    max - min
}`,
      hints: [
        'Ein Tupel ist der leichtgewichtige Weg, zwei zusammengehörige Werte zurückzugeben – und `let (a, b) = ...` packt es wieder aus.',
        '`slice.split_first()` liefert `Option<(&i32, &[i32])>`: das erste Element und den Rest. Mit `let ... else { panic!(..) }` behandelst du den leeren Fall sofort.',
        'Erstes Element als Start für min und max nehmen, über den Rest laufen, beide bei Bedarf aktualisieren, am Ende `(min, max)` zurückgeben. `spread` ruft `min_max` auf und destrukturiert.',
        '```rust\nlet Some((first, rest)) = values.split_first() else {\n    panic!("min_max braucht mindestens einen Wert");\n};\nlet mut min = *first;\n// ...\n```',
      ],
      tests: `    check("min und max", (1, 9), min_max(&[3, 1, 9, 4]));
    check("ein Element", (7, 7), min_max(&[7]));
    check("nur negative Werte", (-9, -1), min_max(&[-1, -9, -5]));
    check("Grenzwerte", (i32::MIN, i32::MAX), min_max(&[0, i32::MAX, i32::MIN]));
    check("Spannweite", 8, spread(&[3, 1, 9, 4]));
    check("Spannweite bei einem Element", 0, spread(&[7]));
    check_panics("leerer Slice panickt", || {
        min_max(&[]);
    });`,
    },
    {
      id: 'k4',
      title: 'Namen und Ports parsen',
      level: 4,
      description:
        'Zwei Funktionen rund um `&str`, `String` und Typkonvertierung:\n\n' +
        '- `fn initials(full_name: &str) -> String` – aus `"jan christoph pfrommer"` wird `"J.C.P."`. Mehrfache Leerzeichen ignorieren, leerer Name ergibt einen leeren `String`. Umlaute müssen korrekt großgeschrieben werden.\n' +
        '- `fn parse_port(input: &str) -> Option<u16>` – Eingabe trimmen, als Zahl lesen, nur `1..=65535` akzeptieren, sonst `None`.\n\n' +
        'Hinweis: `char::to_uppercase()` liefert einen **Iterator**, weil ein Zeichen zu mehreren werden kann.',
      starter: `fn initials(full_name: &str) -> String {
    // TODO
    String::new()
}

fn parse_port(input: &str) -> Option<u16> {
    // TODO
    None
}`,
      solution: `fn initials(full_name: &str) -> String {
    let mut result = String::new();
    for word in full_name.split_whitespace() {
        if let Some(first) = word.chars().next() {
            result.extend(first.to_uppercase());
            result.push('.');
        }
    }
    result
}

fn parse_port(input: &str) -> Option<u16> {
    let input = input.trim();
    let number: u32 = input.parse().ok()?;
    if number == 0 || number > 65535 {
        return None;
    }
    u16::try_from(number).ok()
}`,
      hints: [
        '`split_whitespace()` überspringt mehrfache Leerzeichen automatisch. Parsen darf fehlschlagen – modelliere das mit `Option`, nicht mit einem Sentinel-Wert wie `0`.',
        '`word.chars().next()` gibt `Option<char>`. `String` implementiert `Extend<char>`, also funktioniert `result.extend(c.to_uppercase())`. Für Zahlen: `str::parse::<u32>() -> Result<u32, _>`, `Result::ok() -> Option<u32>`, `u16::try_from(u32) -> Result<u16, _>`.',
        'initials: über Wörter laufen, erstes Zeichen groß anhängen, dann einen Punkt.\nparse_port: trimmen, als `u32` parsen (sonst None), Bereich 1..=65535 prüfen, dann nach `u16` konvertieren.',
        '```rust\nlet input = input.trim();\nlet number: u32 = input.parse().ok()?;   // ? auf Option\nif number == 0 || number > 65535 {\n    return None;\n}\nu16::try_from(number).ok()\n```',
      ],
      tests: `    check("drei Namen", "J.C.P.".to_string(), initials("jan christoph pfrommer"));
    check("mehrfache Leerzeichen", "A.B.".to_string(), initials("  anna   berg "));
    check("bereits gross", "M.M.".to_string(), initials("Max Mustermann"));
    check("Umlaut", "Ä.B.".to_string(), initials("änna berg"));
    check("leerer Name", String::new(), initials("   "));
    check("Port ok", Some(8080), parse_port(" 8080 "));
    check("kleinster Port", Some(1), parse_port("1"));
    check("groesster Port", Some(65535), parse_port("65535"));
    check("Port 0 ist ungueltig", None, parse_port("0"));
    check("Port zu gross", None, parse_port("70000"));
    check("keine Zahl", None, parse_port("abc"));`,
    },
  ],
}

export default chapter
