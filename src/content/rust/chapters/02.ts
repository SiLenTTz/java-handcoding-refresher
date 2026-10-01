import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    {
      id: 'f1',
      front: 'Die drei Ownership-Regeln?',
      back: '1. Jeder Wert hat einen Owner. 2. Es gibt immer genau **einen** Owner. 3. Verlässt der Owner den Scope, wird der Wert gedroppt (Speicher sofort frei, kein GC).',
    },
    {
      id: 'f2',
      front: 'Wann wird gemoved, wann kopiert?',
      back: 'Typen mit `Copy` (alle Skalare, `bool`, `char`, `&T`, Tupel/Arrays daraus) werden **kopiert**. Alles mit Heap-Anteil (`String`, `Vec<T>`, `Box<T>`, `HashMap`) wird **gemoved** – die Quelle ist danach ungültig.',
    },
    {
      id: 'f3',
      front: 'Was kopiert ein Move eigentlich?',
      back: 'Nur den Stack-Anteil (bei `String`: Pointer, `len`, `cap`) und invalidiert die Quelle. Kein Deep Copy – dafür gibt es `clone()`.',
    },
    {
      id: 'f4',
      front: 'Die Ausschlussregel des Borrow-Checkers?',
      back: 'Zu jedem Zeitpunkt entweder **beliebig viele** `&T` **oder genau ein** `&mut T` – nie beides gleichzeitig. Das verhindert Data Races zur Compile-Zeit.',
    },
    {
      id: 'f5',
      front: 'Was sind Non-Lexical Lifetimes (NLL)?',
      back: 'Ein Borrow endet bei seiner **letzten Verwendung**, nicht am Blockende. Deshalb darf nach der letzten Nutzung eines `&v` wieder ein `&mut v` genommen werden.',
    },
    {
      id: 'f6',
      front: 'Warum kompiliert das nicht?\n```rust\nfn build() -> &str {\n    let s = String::from("hi");\n    &s\n}\n```',
      back: '`s` stirbt am Funktionsende – die Referenz wäre dangling. Rust lehnt das ab ("missing lifetime specifier"). Lösung: Ownership zurückgeben (`-> String`).',
    },
    {
      id: 'f7',
      front: 'Was sagt `fn longest<\'a>(a: &\'a str, b: &\'a str) -> &\'a str` aus?',
      back: 'Die Rückgabe lebt höchstens so lange wie die **kürzere** der beiden Eingaben. Lifetimes verlängern nichts, sie beschreiben nur eine Beziehung und erzeugen keinen Code.',
    },
    {
      id: 'f8',
      front: 'Wann darf man die Lifetime weglassen (Elision)?',
      back: 'Bei genau einem Referenz-Parameter gilt dessen Lifetime automatisch für die Rückgabe. Bei Methoden gewinnt `&self`. Sonst muss man annotieren.',
    },
    {
      id: 'f9',
      front: 'Warum `&[T]` statt `&Vec<T>` und `&str` statt `&String`?',
      back: 'Slices sind die schwächere Anforderung: `&[T]` akzeptiert `Vec`, Array und Teil-Slice. Deref-Coercion macht `&Vec<T>` → `&[T]` automatisch. Eine `&Vec<T>`-Signatur schließt Aufrufer unnötig aus.',
    },
    {
      id: 'f10',
      front: 'Unterschied `for x in v`, `for x in &v`, `for x in &mut v`?',
      back: '`for x in v` konsumiert den `Vec` (`x: T`, `v` danach gemoved). `for x in &v` leiht (`x: &T`). `for x in &mut v` leiht veränderbar (`x: &mut T`).',
    },
    {
      id: 'f11',
      front: 'Wann ist `clone()` vertretbar?',
      back: 'Wenn zwei unabhängige Besitzer wirklich gebraucht werden oder die Daten klein sind und der Code deutlich einfacher wird. **Nicht** als Reflex, um den Borrow-Checker ruhigzustellen – meist reicht `&`.',
    },
    {
      id: 'f12',
      front: 'Warum verbietet der Compiler `v.push(..)`, solange `let first = &v[0];` lebt?',
      back: 'Ein `push` kann eine Reallokation auslösen und die Daten verschieben – `first` zeigte dann ins Leere. Die Ausschlussregel verhindert genau dieses Use-after-free.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was sagt der Compiler?',
      code: `let s = String::from("hi");
let t = s;
println!("{s}");`,
      options: [
        'Nichts – `s` und `t` zeigen beide auf denselben Text',
        '`borrow of moved value: s`',
        '`cannot borrow s as mutable`',
        'Nichts – `String` ist `Copy`',
      ],
      correct: 1,
      explanation: '`String` besitzt Heap-Speicher und ist deshalb nicht `Copy`. `let t = s;` moved den Wert, `s` ist danach ungültig. Mit `let t = s.clone();` oder `let t = &s;` bleibt `s` nutzbar.',
    },
    {
      id: 'q2',
      prompt: 'Kompiliert das?',
      code: `let x = 5;
let y = x;
println!("{x} {y}");`,
      options: ['Nein, `x` wurde gemoved', 'Ja – `i32` ist `Copy`', 'Nein, `x` ist nicht `mut`', 'Nur mit `x.clone()`'],
      correct: 1,
      explanation: 'Skalartypen implementieren `Copy`: Die Zuweisung kopiert den Wert, die Quelle bleibt gültig. Move betrifft nur Typen mit Heap-Anteil oder eigener `Drop`-Logik.',
    },
    {
      id: 'q3',
      prompt: 'Was sagt der Borrow-Checker?',
      code: `let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{first}");`,
      options: [
        'Alles ok – `first` ist nur eine Leseoperation',
        '`cannot borrow v as mutable because it is also borrowed as immutable`',
        '`use of moved value: v`',
        'Laufzeitfehler: index out of bounds',
      ],
      correct: 1,
      explanation: '`first` hält einen shared borrow, der bis zum `println!` lebt. `push` braucht `&mut v`. Ein `push` kann reallozieren und die Elemente verschieben – die Referenz wäre danach ungültig.',
    },
    {
      id: 'q4',
      prompt: 'Kompiliert das?',
      code: `let mut v = vec![1, 2, 3];
let a = &v;
println!("{a:?}");
let m = &mut v;
m.push(4);`,
      options: [
        'Nein – `a` und `m` überschneiden sich',
        'Ja – `a` wird nach dem `println!` nicht mehr benutzt (NLL)',
        'Nein – man braucht zwei getrennte Blöcke',
        'Nein – `&mut` auf einen `Vec` ist nie erlaubt',
      ],
      correct: 1,
      explanation: 'Non-Lexical Lifetimes: Ein Borrow endet bei der letzten Verwendung. Nach dem `println!` ist `a` tot, also darf `&mut v` genommen werden.',
    },
    {
      id: 'q5',
      prompt: 'Warum kompiliert diese Funktion nicht?',
      code: `fn build() -> &str {
    let s = String::from("hi");
    &s
}`,
      options: [
        '`String::from` gibt es nicht',
        'Die Referenz würde auf einen Wert zeigen, der am Funktionsende gedroppt wird',
        '`&str` darf nie Rückgabetyp sein',
        'Es fehlt ein `mut`',
      ],
      correct: 1,
      explanation: 'Dangling References sind in Rust unmöglich. Der Compiler fordert eine Lifetime, die es hier nicht geben kann. Lösung: `-> String` und `s` zurückgeben.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if b.len() > a.len() { b } else { a }
}

println!("{}", longest("abc", "xyz"));`,
      options: ['`abc`', '`xyz`', 'Compile-Fehler: mehrdeutige Lifetime', 'Zufällig eines von beiden'],
      correct: 0,
      explanation: 'Bei gleicher Länge ist `b.len() > a.len()` falsch, also gewinnt `a`. Die Lifetime-Annotation sagt nur, dass die Rückgabe nicht länger lebt als beide Eingaben – sie beeinflusst die Logik nicht.',
    },
    {
      id: 'q7',
      prompt: 'Welche Signatur ist idiomatisch für eine Funktion, die nur die Summe berechnet?',
      options: [
        '`fn total(values: Vec<i32>) -> i32`',
        '`fn total(values: &Vec<i32>) -> i32`',
        '`fn total(values: &[i32]) -> i32`',
        '`fn total(values: &mut Vec<i32>) -> i32`',
      ],
      correct: 2,
      explanation: '`&[i32]` ist die schwächste Anforderung: Sie akzeptiert `Vec`, Array und Teil-Slice, nimmt keine Ownership und verlangt keine Mutation.',
    },
    {
      id: 'q8',
      prompt: 'Was ist der sauberste Fix?',
      code: `fn count(v: Vec<i32>) -> usize { v.len() }

let v = vec![1, 2];
count(v);
println!("{}", v.len());`,
      options: [
        '`count(v.clone());`',
        'Die Signatur auf `fn count(v: &[i32]) -> usize` ändern',
        '`let v = count(v);`',
        '`v` als `mut` deklarieren',
      ],
      correct: 1,
      explanation: 'Die Funktion liest nur – sie braucht keine Ownership. `clone()` würde funktionieren, kostet aber eine Allokation und kaschiert die zu starke Signatur.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Referenzen zurückgeben',
      level: 1,
      description:
        'Implementiere zwei Funktionen, die eine der Eingabe-Referenzen zurückgeben:\n\n' +
        '- `fn longest<\'a>(a: &\'a str, b: &\'a str) -> &\'a str` – die längere Zeichenkette, bei Gleichstand `a`.\n' +
        '- `fn first_non_empty<\'a>(a: &\'a str, b: &\'a str) -> Option<&\'a str>` – `a`, falls nicht leer, sonst `b`, falls nicht leer, sonst `None`.\n\n' +
        'Beide geben nur **geliehene** Daten zurück – es darf nichts kopiert oder geklont werden.',
      starter: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    // TODO
    ""
}

fn first_non_empty<'a>(a: &'a str, b: &'a str) -> Option<&'a str> {
    // TODO
    None
}`,
      solution: `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if b.len() > a.len() {
        b
    } else {
        a
    }
}

fn first_non_empty<'a>(a: &'a str, b: &'a str) -> Option<&'a str> {
    if !a.is_empty() {
        Some(a)
    } else if !b.is_empty() {
        Some(b)
    } else {
        None
    }
}`,
      hints: [
        'Die Lifetime `\'a` sagt dem Compiler nur: "Die Rückgabe lebt höchstens so lange wie beide Eingaben." Du musst dafür nichts tun außer die passende Referenz zurückzugeben.',
        '`str::len()` zählt Bytes, `str::is_empty()` prüft auf leer. `if` ist ein Ausdruck – du brauchst keine Zwischenvariable.',
        'longest: wenn b länger ist, b, sonst a.\nfirst_non_empty: a prüfen, dann b prüfen, sonst None.',
        '```rust\nfn longest<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if b.len() > a.len() { b } else { a }\n}\n```',
      ],
      tests: `    check("a ist laenger", "hallo", longest("hallo", "hi"));
    check("b ist laenger", "weltweit", longest("hi", "weltweit"));
    check("gleich lang gewinnt a", "abc", longest("abc", "xyz"));

    let owned = String::from("eine lange Zeichenkette");
    check("String gegen Literal", owned.as_str(), longest(&owned, "kurz"));

    check("erstes gefuellt", Some("a"), first_non_empty("a", "b"));
    check("nur zweites gefuellt", Some("b"), first_non_empty("", "b"));
    check("beide leer", None, first_non_empty("", ""));`,
    },
    {
      id: 'k2',
      title: 'Leihen statt besitzen',
      level: 2,
      description:
        'Implementiere:\n\n' +
        '- `fn total_length(words: &[String]) -> usize` – Summe der Längen, **ohne** den Aufrufer zu enteignen.\n' +
        '- `fn append_suffix(words: &mut Vec<String>, suffix: &str)` – hängt `suffix` an **jedes** Wort an, in-place.\n\n' +
        'Die zweite Funktion gibt nichts zurück. Achte darauf, dass `total_length` den Vektor danach noch benutzbar lässt.',
      starter: `fn total_length(words: &[String]) -> usize {
    // TODO
    0
}

fn append_suffix(words: &mut Vec<String>, suffix: &str) {
    // TODO
}`,
      solution: `fn total_length(words: &[String]) -> usize {
    words.iter().map(|word| word.len()).sum()
}

fn append_suffix(words: &mut Vec<String>, suffix: &str) {
    for word in words.iter_mut() {
        word.push_str(suffix);
    }
}`,
      hints: [
        '`&[T]` leiht nur – der Aufrufer behält seinen `Vec`. `&mut Vec<T>` erlaubt Veränderung, verlangt aber, dass es zur Zeit keinen weiteren Borrow gibt.',
        '`slice.iter()` gibt `&String`, `slice.iter_mut()` gibt `&mut String`. `String::push_str(&mut self, &str)` hängt an, `Iterator::sum()` summiert.',
        'total_length: iter -> map(len) -> sum.\nappend_suffix: über `iter_mut()` laufen und jedem Wort den Suffix anhängen.',
        '```rust\nfn total_length(words: &[String]) -> usize {\n    words.iter().map(|word| word.len()).sum()\n}\n```',
      ],
      tests: `    let words = vec!["hallo".to_string(), "welt".to_string()];
    check("Gesamtlaenge", 9, total_length(&words));
    check("leerer Slice", 0, total_length(&[]));
    check("Original weiter nutzbar", 2, words.len());

    let mut items = vec!["a".to_string(), "b".to_string()];
    append_suffix(&mut items, "!");
    check("Suffix angehaengt", vec!["a!".to_string(), "b!".to_string()], items.clone());
    check("Anzahl unveraendert", 2, items.len());

    append_suffix(&mut items, "?");
    check("zweimal angehaengt", vec!["a!?".to_string(), "b!?".to_string()], items);

    let mut empty: Vec<String> = Vec::new();
    append_suffix(&mut empty, "!");
    check("leerer Vec bleibt leer", 0, empty.len());`,
    },
    {
      id: 'k3',
      title: 'Slices als Borrow',
      level: 3,
      description:
        'Implementiere zwei Funktionen, die `&str`-Slices **aus der Eingabe** zurückgeben – ohne `String`, ohne `clone`:\n\n' +
        '- `fn first_word(text: &str) -> &str` – das erste Wort, `""` wenn es keines gibt.\n' +
        '- `fn longest_word(text: &str) -> Option<&str>` – das längste Wort, bei Gleichstand das **zuerst** auftretende, `None` wenn es kein Wort gibt.\n\n' +
        'Wörter sind durch beliebigen Whitespace getrennt. Die Lifetimes darfst du weglassen (Elision).',
      starter: `fn first_word(text: &str) -> &str {
    // TODO
    ""
}

fn longest_word(text: &str) -> Option<&str> {
    // TODO
    None
}`,
      solution: `fn first_word(text: &str) -> &str {
    text.split_whitespace().next().unwrap_or("")
}

fn longest_word(text: &str) -> Option<&str> {
    text.split_whitespace()
        .min_by_key(|word| std::cmp::Reverse(word.len()))
}`,
      hints: [
        'Ein `&str`-Slice besitzt nichts, er zeigt in die Eingabe. Weil es nur einen Referenz-Parameter gibt, leitet der Compiler die Lifetime der Rückgabe selbst ab.',
        '`str::split_whitespace()` liefert einen `Iterator<Item = &str>`. `Iterator::next()`, `Option::unwrap_or(..)`, `Iterator::min_by_key(..)` und `std::cmp::Reverse` sind alles, was du brauchst.',
        'first_word: ersten Iterator-Eintrag holen, sonst `""`.\nlongest_word: das Minimum nach `Reverse(len)` suchen – `min_by_key` liefert bei Gleichstand das **erste** Element, `max_by_key` das letzte.',
        '```rust\ntext.split_whitespace()\n    .min_by_key(|word| std::cmp::Reverse(word.len()))\n```',
      ],
      tests: `    check("erstes Wort", "hallo", first_word("hallo welt"));
    check("fuehrende Leerzeichen", "hallo", first_word("   hallo welt"));
    check("einziges Wort", "solo", first_word("solo"));
    check("leerer Text", "", first_word(""));
    check("nur Leerzeichen", "", first_word("   "));

    check("laengstes Wort", Some("weltweit"), longest_word("hi weltweit du"));
    check("Gleichstand nimmt das erste", Some("aa"), longest_word("aa bb"));
    check("kein Wort", None, longest_word("   "));

    let owned = String::from("rust ist konsequent");
    check("aus einem String", Some("konsequent"), longest_word(&owned));
    check("Original weiter nutzbar", 19, owned.len());`,
    },
    {
      id: 'k4',
      title: 'Ownership bewusst übernehmen',
      level: 4,
      description:
        'Hier nimmst du Ownership entgegen und gibst sie weiter – **ohne einen einzigen `clone()`**:\n\n' +
        '- `fn split_owned(words: Vec<String>, min_len: usize) -> (Vec<String>, Vec<String>)` – teilt in `(lang, kurz)`, wobei "lang" `len() >= min_len` bedeutet. Die Reihenfolge innerhalb der Gruppen bleibt erhalten.\n' +
        '- `fn concat_all(chunks: Vec<String>, separator: &str) -> String` – verbindet alle Teile mit dem Trennzeichen.\n\n' +
        'Beide Funktionen verbrauchen ihren `Vec`. Nutze `into_iter()` oder `for word in words`, damit die `String`s gemoved statt kopiert werden.',
      starter: `fn split_owned(words: Vec<String>, min_len: usize) -> (Vec<String>, Vec<String>) {
    // TODO
    (Vec::new(), Vec::new())
}

fn concat_all(chunks: Vec<String>, separator: &str) -> String {
    // TODO
    String::new()
}`,
      solution: `fn split_owned(words: Vec<String>, min_len: usize) -> (Vec<String>, Vec<String>) {
    let mut long_words = Vec::new();
    let mut short_words = Vec::new();

    for word in words {
        if word.len() >= min_len {
            long_words.push(word);
        } else {
            short_words.push(word);
        }
    }

    (long_words, short_words)
}

fn concat_all(chunks: Vec<String>, separator: &str) -> String {
    let mut result = String::new();
    for (index, chunk) in chunks.into_iter().enumerate() {
        if index > 0 {
            result.push_str(separator);
        }
        result.push_str(&chunk);
    }
    result
}`,
      hints: [
        '`for word in words` (ohne `&`) konsumiert den Vektor – jedes `word` ist ein eigener `String`, den du direkt in eine andere Collection schieben kannst. Kein `clone` nötig.',
        '`Vec::into_iter()`, `Iterator::enumerate()`, `Vec::push(..)`, `String::push_str(&str)`. Ein `&String` wird durch Deref-Coercion automatisch zu `&str`.',
        'split_owned: zwei leere Vecs anlegen, über die Wörter moven, nach Länge einsortieren, Tupel zurückgeben.\nconcat_all: über `into_iter().enumerate()` laufen und ab Index 1 vor jedem Teil den Separator anhängen.',
        '```rust\nfor (index, chunk) in chunks.into_iter().enumerate() {\n    if index > 0 {\n        result.push_str(separator);\n    }\n    result.push_str(&chunk);\n}\n```',
      ],
      tests: `    let words = vec!["hallo".to_string(), "hi".to_string(), "welt!".to_string()];
    let (long_words, short_words) = split_owned(words, 5);
    check("lange Woerter", vec!["hallo".to_string(), "welt!".to_string()], long_words);
    check("kurze Woerter", vec!["hi".to_string()], short_words);

    let (empty_long, empty_short) = split_owned(Vec::new(), 3);
    check("leer bleibt leer (lang)", Vec::<String>::new(), empty_long);
    check("leer bleibt leer (kurz)", Vec::<String>::new(), empty_short);

    let (all_long, none_short) = split_owned(vec!["abcd".to_string()], 1);
    check("alles lang", 1, all_long.len());
    check("nichts kurz", 0, none_short.len());

    check(
        "verbinden",
        "a-b-c".to_string(),
        concat_all(vec!["a".to_string(), "b".to_string(), "c".to_string()], "-"),
    );
    check("ein Element ohne Separator", "a".to_string(), concat_all(vec!["a".to_string()], "-"));
    check("leere Liste", String::new(), concat_all(Vec::new(), "-"));`,
    },
  ],
}

export default chapter
