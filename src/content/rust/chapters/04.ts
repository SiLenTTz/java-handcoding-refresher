import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    {
      id: 'f1',
      front: 'Was steckt in einem `Vec<T>` auf dem Stack?',
      back: 'Drei Werte: Pointer auf den Heap-Puffer, `len` (belegte Elemente) und `cap` (reservierter Platz). Beim Überschreiten von `cap` wird neu alloziert und umkopiert – `push` ist amortisiert O(1).',
    },
    {
      id: 'f2',
      front: '`v[i]` oder `v.get(i)`?',
      back: '`v[i]` panickt bei ungültigem Index. `v.get(i)` liefert `Option<&T>`. Index nur dort, wo er nachweislich gültig ist – bei Daten oder Nutzereingaben immer `get`.',
    },
    {
      id: 'f3',
      front: 'Warum ist `&[T]` als Parameter besser als `&Vec<T>`?',
      back: '`&[T]` akzeptiert `Vec`, Array und Teil-Slice (Deref-Coercion macht `&Vec<T>` → `&[T]` automatisch). `&Vec<T>` schließt Aufrufer unnötig aus und fügt eine Indirektion hinzu.',
    },
    {
      id: 'f4',
      front: 'Was macht die `entry`-API?',
      back: 'Sie ersetzt "lookup, prüfen, einfügen" durch **einen** Hash-Durchlauf:\n```rust\n*counts.entry(word).or_insert(0) += 1;\ngroups.entry(key).or_default().push(value);\ncache.entry(id).or_insert_with(|| load(id));\n```',
    },
    {
      id: 'f5',
      front: '`HashMap` vs. `BTreeMap` – wann welche?',
      back: '`HashMap`: O(1) im Mittel, braucht `Eq + Hash`, **zufällige** Iterationsreihenfolge. `BTreeMap`: O(log n), braucht `Ord`, iteriert **sortiert nach Key** – nimm sie, wenn die Reihenfolge Teil des Vertrags ist.',
    },
    {
      id: 'f6',
      front: 'Unterschied `iter()`, `iter_mut()`, `into_iter()`?',
      back: '`iter()` leiht (`&T`), `iter_mut()` leiht veränderbar (`&mut T`), `into_iter()` verbraucht die Collection (`T`). Entsprechend: `for x in &v`, `for x in &mut v`, `for x in v`.',
    },
    {
      id: 'f7',
      front: 'Warum verbietet der Compiler `v.push(4)`, solange `let first = &v[0];` lebt?',
      back: 'Ein `push` kann eine Reallokation auslösen und den Puffer verschieben. `first` zeigte danach auf freigegebenen Speicher. Die Ausschlussregel verhindert dieses Use-after-free zur Compile-Zeit.',
    },
    {
      id: 'f8',
      front: 'Wie sortiert man absteigend nach einem Feld?',
      back: '```rust\nusers.sort_by_key(|u| std::cmp::Reverse(u.age));\n```\nNicht über Negation (`-x`) – das bricht bei `u32` und bei `MIN`-Werten.',
    },
    {
      id: 'f9',
      front: 'Warum entfernt `v.dedup()` nicht alle Duplikate?',
      back: '`dedup` entfernt nur **direkt benachbarte** Wiederholungen. Erst `v.sort()`, dann `v.dedup()` – oder gleich ein `HashSet`/`BTreeSet`.',
    },
    {
      id: 'f10',
      front: 'Muss man für `map.get(..)` bei `HashMap<String, V>` ein `String` bauen?',
      back: 'Nein. Dank `Borrow<str>` funktioniert `map.get("jan")` direkt – `map.get(&"jan".to_string())` ist eine unnötige Allokation.',
    },
    {
      id: 'f11',
      front: 'Was kann `collect()` alles erzeugen?',
      back: 'Alles mit `FromIterator`: `Vec<T>`, `String`, `HashSet`, `HashMap<K, V>` (aus Tupeln), `BTreeMap`, `VecDeque` – sogar `Result<Vec<T>, E>`. Zieltyp per Annotation oder Turbofish `.collect::<Vec<_>>()`.',
    },
    {
      id: 'f12',
      front: 'Warum darf `&s[0..1]` bei `"Änna"` panicken?',
      back: 'String-Slices arbeiten auf **Byte**-Indizes. `Ä` belegt zwei Bytes, `0..1` läge mitten im Zeichen. Bei Unicode `chars()`, `char_indices()` oder `s.get(..)` verwenden.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was sagt der Compiler?',
      code: `let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{first}");`,
      options: [
        'Nichts – `first` ist nur ein Lesezugriff',
        '`cannot borrow v as mutable because it is also borrowed as immutable`',
        '`index out of bounds` zur Laufzeit',
        '`use of moved value: v`',
      ],
      correct: 1,
      explanation: '`push` kann reallozieren und die Elemente verschieben. Solange `first` lebt, ist `&mut v` verboten. Mit `let first = v[0];` (Copy) gibt es keinen offenen Borrow mehr.',
    },
    {
      id: 'q2',
      prompt: 'Welche Variante ist idiomatisch?',
      code: `let mut counts: HashMap<String, usize> = HashMap::new();`,
      options: [
        '`if !counts.contains_key(w) { counts.insert(w.to_string(), 0); } *counts.get_mut(w).unwrap() += 1;`',
        '`*counts.entry(w.to_string()).or_insert(0) += 1;`',
        '`counts.insert(w.to_string(), counts.get(w).unwrap() + 1);`',
        '`counts[w] += 1;`',
      ],
      correct: 1,
      explanation: '`entry` macht aus drei Hash-Durchläufen einen und kommt ohne `unwrap` aus. `HashMap` unterstützt außerdem keinen `IndexMut`, `counts[w] += 1` kompiliert gar nicht.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `let mut v = vec![3, 1, 3, 2, 1];
v.dedup();
println!("{v:?}");`,
      options: ['`[3, 1, 2]`', '`[1, 2, 3]`', '`[3, 1, 3, 2, 1]`', '`[3, 1, 2, 1]`'],
      correct: 2,
      explanation: '`dedup` entfernt nur direkt benachbarte Gleiche – hier gibt es keine. Erst `v.sort()` liefert `[1, 1, 2, 3, 3]`, danach ergibt `dedup` `[1, 2, 3]`.',
    },
    {
      id: 'q4',
      prompt: 'Kompiliert das?',
      code: `let v = vec![String::from("a"), String::from("b")];
for s in v {
    println!("{s}");
}
println!("{}", v.len());`,
      options: [
        'Ja – `for` leiht den Vektor nur',
        'Nein: `borrow of moved value: v` – `for s in v` konsumiert den Vektor',
        'Nein: `String` kann man nicht mit `{}` ausgeben',
        'Ja, aber `v` ist danach leer',
      ],
      correct: 1,
      explanation: '`for s in v` ruft `into_iter()` auf und verbraucht `v`. Mit `for s in &v` bleibt der Vektor nutzbar und `s` ist ein `&String`.',
    },
    {
      id: 'q5',
      prompt: 'Was wird ausgegeben?',
      code: `let v = vec![10, 20, 30];
println!("{:?} {:?}", v.get(1), v.get(9));`,
      options: ['`20 None`', '`Some(20) None`', '`Some(&20) None`', 'Panic: index out of bounds'],
      correct: 1,
      explanation: '`get` liefert `Option<&i32>`. Das `Debug`-Format einer Referenz zeigt den Wert, also `Some(20)`. Bei ungültigem Index kommt `None` statt eines Panics.',
    },
    {
      id: 'q6',
      prompt: 'Welche Map passt, wenn die Ausgabe immer in derselben, nach Key sortierten Reihenfolge erscheinen soll?',
      options: ['`HashMap`', '`BTreeMap`', '`HashSet`', '`VecDeque`'],
      correct: 1,
      explanation: '`HashMap` iteriert in zufälliger Reihenfolge (randomisierter SipHash-Seed, auch zwischen Programmläufen). `BTreeMap` iteriert sortiert nach Key und macht Tests reproduzierbar.',
    },
    {
      id: 'q7',
      prompt: 'Was ist idiomatisch?',
      code: `let mut users: Vec<User> = load_users();`,
      options: [
        '`users.sort_by_key(|u| -(u.age as i64));`',
        '`users.sort_by_key(|u| std::cmp::Reverse(u.age));`',
        '`users.sort(); users.reverse();`',
        '`users.sort_by(|a, b| a.age.cmp(&b.age)).reverse();`',
      ],
      correct: 1,
      explanation: '`Reverse` dreht die Ordnung, ohne Typ-Casts oder einen zweiten Durchlauf. Die Negation scheitert bei vorzeichenlosen Typen, und `sort_by` gibt `()` zurück – daran kann man kein `reverse()` hängen.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `let v = vec![1, 2, 3, 4, 5];
let mid = &v[1..4];
println!("{:?} {}", mid, mid.len());`,
      options: ['`[2, 3, 4] 3`', '`[1, 2, 3] 3`', '`[2, 3, 4, 5] 4`', '`[2, 3] 2`'],
      correct: 0,
      explanation: 'Ranges sind halb offen: Start inklusive, Ende exklusiv. `1..4` liefert die Elemente an den Positionen 1, 2, 3 – also `[2, 3, 4]`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Sicher auf Slices zugreifen',
      level: 1,
      description:
        'Implementiere zwei Funktionen **ohne** einen einzigen `[..]`-Indexzugriff:\n\n' +
        '- `fn first_n(values: &[i32], n: usize) -> Vec<i32>` – die ersten `n` Werte; sind weniger vorhanden, kommen eben alle.\n' +
        '- `fn safe_get(values: &[i32], index: usize) -> Option<i32>` – der Wert an der Position, `None` bei ungültigem Index.\n\n' +
        'Beide dürfen nicht panicken.',
      starter: `fn first_n(values: &[i32], n: usize) -> Vec<i32> {
    // TODO
    Vec::new()
}

fn safe_get(values: &[i32], index: usize) -> Option<i32> {
    // TODO
    None
}`,
      solution: `fn first_n(values: &[i32], n: usize) -> Vec<i32> {
    values.iter().take(n).copied().collect()
}

fn safe_get(values: &[i32], index: usize) -> Option<i32> {
    values.get(index).copied()
}`,
      hints: [
        'Für "höchstens n Elemente" gibt es eine Iterator-Methode, die von selbst aufhört. Für "vielleicht vorhanden" gibt es eine Slice-Methode, die `Option` liefert.',
        '`Iterator::take(n)`, `Iterator::copied()` (aus `&i32` wird `i32`), `Iterator::collect()`, `slice::get(i) -> Option<&i32>`, `Option::copied() -> Option<i32>`.',
        'first_n: iter -> take(n) -> copied -> collect.\nsafe_get: `values.get(index)` und das `Option<&i32>` in ein `Option<i32>` umwandeln.',
        '```rust\nfn first_n(values: &[i32], n: usize) -> Vec<i32> {\n    values.iter().take(n).copied().collect()\n}\n```',
      ],
      tests: `    check("erste zwei", vec![1, 2], first_n(&[1, 2, 3], 2));
    check("mehr angefragt als vorhanden", vec![1, 2, 3], first_n(&[1, 2, 3], 9));
    check("null Elemente", Vec::<i32>::new(), first_n(&[1, 2, 3], 0));
    check("leerer Slice", Vec::<i32>::new(), first_n(&[], 3));

    check("gueltiger Index", Some(3), safe_get(&[1, 2, 3], 2));
    check("erster Index", Some(1), safe_get(&[1, 2, 3], 0));
    check("Index zu gross", None, safe_get(&[1, 2, 3], 9));
    check("leerer Slice liefert None", None, safe_get(&[], 0));`,
    },
    {
      id: 'k2',
      title: 'Wörter zählen mit entry',
      level: 2,
      description:
        'Implementiere `fn word_count(text: &str) -> HashMap<String, usize>`:\n\n' +
        '- Wörter sind durch beliebigen Whitespace getrennt\n' +
        '- Groß-/Kleinschreibung wird ignoriert (alle Keys **klein**)\n' +
        '- leerer Text ergibt eine leere Map\n\n' +
        'Nutze die `entry`-API – kein `contains_key` + `get` + `insert`.',
      starter: `fn word_count(text: &str) -> HashMap<String, usize> {
    // TODO
    HashMap::new()
}`,
      solution: `fn word_count(text: &str) -> HashMap<String, usize> {
    let mut counts: HashMap<String, usize> = HashMap::new();

    for word in text.split_whitespace() {
        *counts.entry(word.to_lowercase()).or_insert(0) += 1;
    }

    counts
}`,
      hints: [
        '"Wert anlegen, falls nicht da, sonst hochzählen" ist genau der Fall, für den die `entry`-API gebaut wurde – ein einziger Hash-Durchlauf statt drei.',
        '`str::split_whitespace()`, `str::to_lowercase() -> String`, `HashMap::entry(key).or_insert(0) -> &mut usize`. Den Zähler erhöhst du mit `*... += 1`.',
        'Leere Map anlegen, über die Wörter laufen, jedes Wort kleinschreiben, per `entry(..).or_insert(0)` an den Zähler kommen und ihn dereferenziert erhöhen. Map zurückgeben.',
        '```rust\nfor word in text.split_whitespace() {\n    *counts.entry(word.to_lowercase()).or_insert(0) += 1;\n}\n```',
      ],
      tests: `    let counts = word_count("a b A c b a");
    check("a kommt dreimal", Some(&3), counts.get("a"));
    check("b kommt zweimal", Some(&2), counts.get("b"));
    check("c kommt einmal", Some(&1), counts.get("c"));
    check("unbekanntes Wort", None, counts.get("z"));
    check("Anzahl Schluessel", 3, counts.len());

    let mut expected: HashMap<String, usize> = HashMap::new();
    expected.insert("rust".to_string(), 2);
    expected.insert("rockt".to_string(), 1);
    check("komplette Map", expected, word_count("Rust rockt rust"));

    check("nur Leerzeichen", 0, word_count("   ").len());
    check("leerer Text", 0, word_count("").len());`,
    },
    {
      id: 'k3',
      title: 'Top-N Wörter',
      level: 3,
      description:
        'Implementiere `fn top_words(text: &str, n: usize) -> Vec<(String, usize)>`:\n\n' +
        '- zähle die Wörter wie in Kata 2 (kleingeschrieben)\n' +
        '- sortiere nach Häufigkeit **absteigend**\n' +
        '- bei gleicher Häufigkeit **alphabetisch aufsteigend**\n' +
        '- gib höchstens `n` Einträge zurück\n\n' +
        'Eine `HashMap` hat keine verlässliche Reihenfolge – du musst sie also in einen `Vec` überführen und selbst sortieren.',
      starter: `fn top_words(text: &str, n: usize) -> Vec<(String, usize)> {
    // TODO
    Vec::new()
}`,
      solution: `fn top_words(text: &str, n: usize) -> Vec<(String, usize)> {
    let mut counts: HashMap<String, usize> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word.to_lowercase()).or_insert(0) += 1;
    }

    let mut ranked: Vec<(String, usize)> = counts.into_iter().collect();
    ranked.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
    ranked.truncate(n);
    ranked
}`,
      hints: [
        'Zwei Schritte: erst zählen (wie in Kata 2), dann ordnen. Für zwei Sortierkriterien mit unterschiedlicher Richtung reicht `sort_by_key` nicht – du brauchst `sort_by`.',
        '`HashMap::into_iter()` liefert `(String, usize)` und lässt sich direkt in einen `Vec` sammeln. `Ord::cmp` gibt ein `Ordering`, `Ordering::then(..)` verkettet Kriterien. `Vec::truncate(n)` kürzt.',
        'zählen -> `counts.into_iter().collect::<Vec<_>>()` -> `sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)))` -> `truncate(n)` -> zurückgeben.\nAchtung auf die Reihenfolge der Operanden: `b.1.cmp(&a.1)` sortiert absteigend, `a.0.cmp(&b.0)` aufsteigend.',
        '```rust\nlet mut ranked: Vec<(String, usize)> = counts.into_iter().collect();\nranked.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));\nranked.truncate(n);\n```',
      ],
      tests: `    let text = "b a a c c c";
    check(
        "Top 2",
        vec![("c".to_string(), 3), ("a".to_string(), 2)],
        top_words(text, 2),
    );
    check(
        "alle drei",
        vec![("c".to_string(), 3), ("a".to_string(), 2), ("b".to_string(), 1)],
        top_words(text, 10),
    );
    check(
        "Gleichstand alphabetisch",
        vec![("aa".to_string(), 1), ("bb".to_string(), 1)],
        top_words("bb aa", 2),
    );
    check(
        "Gross- und Kleinschreibung",
        vec![("rust".to_string(), 2)],
        top_words("Rust rust", 1),
    );
    check("n ist null", Vec::<(String, usize)>::new(), top_words(text, 0));
    check("leerer Text", Vec::<(String, usize)>::new(), top_words("   ", 5));`,
    },
    {
      id: 'k4',
      title: 'Gruppieren mit BTreeMap',
      level: 4,
      description:
        'Implementiere:\n\n' +
        '- `fn group_by_initial(names: &[String]) -> BTreeMap<char, Vec<String>>` – gruppiert Namen nach ihrem ersten Zeichen, **großgeschrieben** (ASCII reicht). Innerhalb einer Gruppe bleibt die Eingabereihenfolge erhalten. Leere Namen werden übersprungen.\n' +
        '- `fn flatten(groups: &BTreeMap<char, Vec<String>>) -> Vec<String>` – alle Namen hintereinander, Gruppen in Key-Reihenfolge.\n\n' +
        'Warum `BTreeMap`? Weil die Gruppenreihenfolge Teil des Vertrags ist – mit `HashMap` wäre `flatten` nicht reproduzierbar.',
      starter: `fn group_by_initial(names: &[String]) -> BTreeMap<char, Vec<String>> {
    // TODO
    BTreeMap::new()
}

fn flatten(groups: &BTreeMap<char, Vec<String>>) -> Vec<String> {
    // TODO
    Vec::new()
}`,
      solution: `fn group_by_initial(names: &[String]) -> BTreeMap<char, Vec<String>> {
    let mut groups: BTreeMap<char, Vec<String>> = BTreeMap::new();

    for name in names {
        let Some(first) = name.chars().next() else {
            continue;
        };
        groups
            .entry(first.to_ascii_uppercase())
            .or_default()
            .push(name.clone());
    }

    groups
}

fn flatten(groups: &BTreeMap<char, Vec<String>>) -> Vec<String> {
    groups.values().flatten().cloned().collect()
}`,
      hints: [
        'Gruppieren ist der zweite klassische `entry`-Fall: Fehlt der Key, soll ein leerer `Vec` entstehen, in den dann gepusht wird. Leere Namen überspringst du mit `let ... else { continue };`.',
        '`str::chars().next() -> Option<char>`, `char::to_ascii_uppercase() -> char`, `Entry::or_default() -> &mut Vec<String>`, `BTreeMap::values()`, `Iterator::flatten()`, `Iterator::cloned()`.',
        'group_by_initial: leere BTreeMap, über die Namen leihen, erstes Zeichen holen (sonst `continue`), großschreiben, `entry(key).or_default().push(name.clone())`.\nflatten: `values()` liefert `&Vec<String>`; `flatten()` macht daraus `&String`, `cloned()` daraus `String`, `collect()` den Vec.',
        '```rust\nlet Some(first) = name.chars().next() else {\n    continue;\n};\ngroups\n    .entry(first.to_ascii_uppercase())\n    .or_default()\n    .push(name.clone());\n```',
      ],
      tests: `    let names = vec![
        "anna".to_string(),
        "Ben".to_string(),
        "arno".to_string(),
        String::new(),
        "carla".to_string(),
    ];
    let groups = group_by_initial(&names);

    check("Anzahl Gruppen", 3, groups.len());
    check(
        "Gruppe A behaelt Reihenfolge",
        Some(&vec!["anna".to_string(), "arno".to_string()]),
        groups.get(&'A'),
    );
    check("Gruppe B", Some(&vec!["Ben".to_string()]), groups.get(&'B'));
    check("leerer Name erzeugt keine Gruppe", None, groups.get(&'Z'));

    check(
        "sortiert abgeflacht",
        vec![
            "anna".to_string(),
            "arno".to_string(),
            "Ben".to_string(),
            "carla".to_string(),
        ],
        flatten(&groups),
    );

    check("leere Eingabe", 0, group_by_initial(&[]).len());
    check("flatten auf leerer Map", Vec::<String>::new(), flatten(&BTreeMap::new()));`,
    },
  ],
}

export default chapter
