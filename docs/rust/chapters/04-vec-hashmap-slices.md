# Kapitel 04 – Vec, HashMap & Slices

## Mental Model

```text
Vec<T>        besitzt      wachsbarer Heap-Puffer   (ptr, len, cap)
&[T]          leiht        Fenster auf fremde Daten (ptr, len)
[T; N]        besitzt      feste Länge, Stack

String        besitzt      wachsbarer UTF-8-Puffer
&str          leiht        Fenster auf UTF-8-Bytes

HashMap<K,V>  unsortiert, O(1) im Mittel
BTreeMap<K,V> sortiert nach Key, O(log n), stabile Iterationsreihenfolge
```

Faustregel für Signaturen: **besitzen im Struct, leihen im Parameter.**
Also Feld `Vec<String>`, Parameter `&[String]`.

## Syntax / API

### Vec anlegen und füllen

```rust
let mut v: Vec<i32> = Vec::new();
let mut v = vec![1, 2, 3];
let mut v = vec![0_u8; 16];                  // 16 Nullen
let v = Vec::with_capacity(1_000);           // vermeidet Reallokationen

v.push(4);
v.insert(0, 99);
let last = v.pop();                          // Option<i32>
v.remove(0);                                 // O(n), verschiebt alles
v.swap_remove(0);                            // O(1), zerstört die Reihenfolge
v.extend([7, 8]);
v.retain(|x| *x % 2 == 0);                   // filtern in-place
v.clear();
```

### get vs. Index

```rust
let v = vec![10, 20, 30];

let a = v[1];                 // 20 – panickt bei out of bounds
let b = v.get(1);             // Some(&20)
let c = v.get(99);            // None  ← der sichere Weg
let d = v.first();            // Option<&i32>
let e = v.last();             // Option<&i32>
```

`v[i]` nur dort, wo der Index nachweislich gültig ist. Sonst `get` und den `None`-Fall behandeln.

### Kapazität verstehen

```rust
let mut v = Vec::new();
v.push(1);
println!("{} {}", v.len(), v.capacity());    // 1 4  (implementierungsabhängig)
```

- `len` = tatsächliche Elemente, `capacity` = reservierter Platz.
- Beim Überschreiten wird ein neuer, größerer Puffer alloziert und umkopiert (amortisiert O(1)).
- **Wichtig:** Eine Reallokation verschiebt die Daten – deshalb verbietet der Borrow-Checker
  `push` während eine Referenz auf ein Element offen ist.

### Slices

```rust
let v = vec![1, 2, 3, 4, 5];

let all:  &[i32] = &v;
let head: &[i32] = &v[..2];          // [1, 2]
let tail: &[i32] = &v[2..];          // [3, 4, 5]
let mid:  &[i32] = &v[1..4];         // [2, 3, 4]

let safe = v.get(1..4);              // Option<&[i32]> – kein Panic
v.chunks(2);                         // [1,2] [3,4] [5]
v.windows(2);                        // [1,2] [2,3] [3,4] [4,5]
let (left, right) = v.split_at(2);

fn sum(values: &[i32]) -> i32 { values.iter().sum() }
sum(&v);
sum(&[1, 2, 3]);
sum(&v[1..]);
```

Ein Slice ist ein Borrow: Er besitzt nichts und hält den Ursprung am Leben.
`&[T]` als Parameter akzeptiert `Vec`, Array und Teil-Slice – `&Vec<T>` nur den `Vec`.

### String-Slices

```rust
let s = String::from("hallo welt");

let first: &str = &s[..5];               // "hallo" – Byte-Indizes!
let word = s.split_whitespace().next();  // Option<&str>
let parts: Vec<&str> = s.split(' ').collect();

s.starts_with("hal");
s.contains("welt");
s.trim();
s.to_uppercase();                        // String
s.replace("welt", "Rust");               // String

for c in s.chars() { }                   // Zeichen
for (i, c) in s.char_indices() { }       // Byte-Offset + Zeichen
```

`&s[0..1]` panickt, wenn die Grenze mitten in einem Mehrbyte-Zeichen liegt. Bei Unicode
lieber `chars()`, `char_indices()` oder `get(..)`.

### HashMap

```rust
let mut scores: HashMap<String, u32> = HashMap::new();

scores.insert("Jan".to_string(), 10);
let old = scores.insert("Jan".to_string(), 20);      // Option<u32> = Some(10)

scores.get("Jan");                                   // Option<&u32>
scores.get("Jan").copied().unwrap_or(0);             // u32
scores.contains_key("Jan");
scores.remove("Jan");                                // Option<u32>
scores.len();
```

Lookup geht mit `&str`, obwohl der Key `String` ist (Borrow-Trait) – kein `to_string()` nötig.

### Die entry-API

```rust
// Zählen: Wert anlegen, falls nicht da, sonst hochzählen
*counts.entry(word.to_string()).or_insert(0) += 1;

// Gruppieren: Vec anlegen, falls nicht da, dann pushen
groups.entry(key).or_default().push(value);

// Teuer zu berechnender Default
cache.entry(id).or_insert_with(|| load_from_db(id));

// Vorhandenen Wert anpassen, sonst Startwert
counts.entry(k).and_modify(|c| *c += 1).or_insert(1);
```

`entry` macht aus "lookup, prüfen, einfügen" **einen** Hash-Durchlauf und einen Ausdruck.

### BTreeMap für Ordnung

```rust
let mut m: BTreeMap<String, u32> = BTreeMap::new();
m.insert("b".into(), 2);
m.insert("a".into(), 1);

for (k, v) in &m { }                 // immer a, b – sortiert nach Key
m.first_key_value();                 // Option<(&String, &u32)>
m.range("a".to_string().."c".to_string());
```

`HashMap` hat eine **zufällige** Iterationsreihenfolge (auch zwischen Programmläufen).
Wenn eine stabile Reihenfolge Teil des Vertrags ist: `BTreeMap` – oder am Ende sortieren.

### Iteration und Ownership

```rust
let v = vec![String::from("a"), String::from("b")];

for s in &v { }            // s: &String   – v bleibt nutzbar
for s in &mut v { }        // s: &mut String
for s in v { }             // s: String    – v ist danach gemoved

v.iter();                  // Iterator<Item = &T>
v.iter_mut();              // Iterator<Item = &mut T>
v.into_iter();             // Iterator<Item = T> – verbraucht v

map.iter();                // (&K, &V)
map.keys();                // &K
map.values();              // &V
map.values_mut();          // &mut V
map.into_iter();           // (K, V) – verbraucht die Map
```

Merksatz: `iter` leiht, `into_iter` verbraucht, `iter_mut` leiht veränderbar.

### Sortieren

```rust
let mut v = vec![3, 1, 2];
v.sort();                                          // braucht Ord
v.sort_unstable();                                 // schneller, keine Stabilität
v.reverse();

let mut users: Vec<User> = ..;
users.sort_by_key(|u| u.age);                      // ein Schlüssel, aufsteigend
users.sort_by_key(|u| std::cmp::Reverse(u.age));   // absteigend
users.sort_by(|a, b| a.dept.cmp(&b.dept).then(b.age.cmp(&a.age)));

let mut prices = vec![1.5, 0.5];
prices.sort_by(|a, b| a.partial_cmp(b).unwrap());  // f64 ist nicht Ord
// oder: prices.sort_by(f64::total_cmp);

v.dedup();                                         // nur direkte Nachbarn!
v.binary_search(&2);                               // nur auf sortierten Daten
```

`sort_by_key` kann keinen Key zurückgeben, der aus dem Element geliehen ist – dafür `sort_by`.

### collect in verschiedene Container

```rust
let v: Vec<i32>                = (1..=5).collect();
let s: HashSet<i32>            = vec![1, 1, 2].into_iter().collect();
let m: HashMap<String, usize>  = pairs.into_iter().collect();
let b: BTreeMap<String, usize> = m.into_iter().collect();
let text: String               = vec!["a", "b"].concat();
let joined: String             = words.join(", ");
let d: VecDeque<i32>           = (1..=3).collect();
```

`collect` braucht einen Zieltyp – entweder per Annotation links oder per Turbofish:
`.collect::<Vec<_>>()`.

## Typische Use Cases

- Häufigkeiten zählen → `HashMap` + `entry(..).or_insert(0)`.
- Gruppieren → `HashMap<K, Vec<V>>` + `entry(..).or_default().push(..)`.
- Top-N → sammeln, `sort_by_key(|x| Reverse(x.count))`, `into_iter().take(n)`.
- Deduplizieren ohne Reihenfolge → `HashSet`; mit Reihenfolge → `BTreeSet` oder `sort` + `dedup`.
- Feste Reihenfolge in Tests/Ausgaben → `BTreeMap` statt `HashMap`.
- Lesende Hilfsfunktionen → `&[T]` / `&str` als Parameter.
- Fenstervergleiche (z. B. Differenzen) → `windows(2)`.

## Clean-Code-Empfehlungen

- Parameter: `&[T]` statt `&Vec<T>`, `&str` statt `&String`.
- `get(..)` statt `[..]`, wenn der Index aus Daten oder Nutzereingaben kommt.
- `entry` statt `contains_key` + `get` + `insert`.
- Bekannte Größe vorab reservieren: `Vec::with_capacity(n)`.
- Iteratorketten statt Indexschleifen: `for i in 0..v.len()` ist meist ein Smell.
- Kein `HashMap`, wenn die Reihenfolge Teil der Erwartung ist – das erzeugt flackernde Tests.
- Für große Werte `into_iter()` statt `iter().cloned()`, wenn die Quelle ohnehin verbraucht wird.

## Häufige Fehler

```rust
// FALSCH: push während eine Referenz auf ein Element lebt
let first = &v[0];
v.push(4);
println!("{first}");                     // cannot borrow `v` as mutable
// RICHTIG
let first = v[0];                        // Copy-Typ kopieren
v.push(4);

// FALSCH: blinder Indexzugriff
let x = v[i];                            // panickt bei i >= len
// RICHTIG
let Some(x) = v.get(i) else { return None };

// FALSCH: lookup, prüfen, einfügen – drei Hash-Durchläufe
if !counts.contains_key(word) {
    counts.insert(word.to_string(), 0);
}
*counts.get_mut(word).unwrap() += 1;
// RICHTIG
*counts.entry(word.to_string()).or_insert(0) += 1;

// FALSCH: unnötige Allokation beim Lookup
scores.get(&name.to_string());
// RICHTIG
scores.get(name.as_str());

// FALSCH: Vec versehentlich moven
for s in v { }
println!("{}", v.len());                 // v wurde gemoved
// RICHTIG
for s in &v { }

// FALSCH: dedup ohne sort entfernt nur Nachbarn
let mut v = vec![1, 2, 1];
v.dedup();                               // [1, 2, 1]
// RICHTIG
v.sort();
v.dedup();                               // [1, 2]

// FALSCH: stabile Reihenfolge von HashMap erwarten
let keys: Vec<_> = map.keys().collect(); // zufällige Reihenfolge
// RICHTIG
let map: BTreeMap<_, _> = map.into_iter().collect();

// FALSCH: reversed sortieren per Negation
users.sort_by_key(|u| -(u.age as i64));
// RICHTIG
users.sort_by_key(|u| std::cmp::Reverse(u.age));

// FALSCH: String an beliebiger Byte-Grenze schneiden
let first = &name[0..1];                 // Panic bei "Änna"
// RICHTIG
let first = name.chars().next();         // Option<char>

// FALSCH: Indexschleife
let mut total = 0;
for i in 0..v.len() { total += v[i]; }
// RICHTIG
let total: i32 = v.iter().sum();
```

## Interview-relevante Details

- **`Vec<T>` = (ptr, len, cap)**, 3 Words auf dem Stack; Wachstum verdoppelt die Kapazität → amortisiert O(1) für `push`.
- **Reallokation invalidiert Referenzen** – genau deshalb ist die Ausschlussregel hier nicht schikanös, sondern rettet vor Use-after-free.
- **`remove` ist O(n)**, `swap_remove` O(1) ohne Reihenfolgegarantie, `pop` O(1) am Ende.
- **Slice = Fat Pointer** (ptr + len), Deref-Coercion macht `&Vec<T>` → `&[T]` automatisch.
- **HashMap nutzt SipHash 1-3** mit zufälligem Seed – DoS-resistent, aber langsamer als naive Hashes und mit zufälliger Iterationsreihenfolge.
- **`entry` gibt ein `Entry`-Enum** (`Occupied`/`Vacant`) zurück und braucht einen `&mut` auf die Map – deshalb kein zweiter Lookup.
- **Key-Anforderungen**: `HashMap` braucht `Eq + Hash`, `BTreeMap` braucht `Ord`. `f64` erfüllt keines von beiden.
- **`Borrow<Q>`** erlaubt `map.get("x")` bei `HashMap<String, _>` – ohne temporäres `String`.
- **`sort` ist stabil** (TimSort-Variante, alloziert), `sort_unstable` ist Pattern-Defeating Quicksort ohne Allokation.
- **`collect` ist generisch über `FromIterator`** – deshalb kann dieselbe Kette in `Vec`, `HashMap`, `String` oder `Result<Vec<_>, E>` landen.

## Zusammenfassung

- `Vec<T>` besitzt, `&[T]` leiht – Parameter deshalb als Slice deklarieren.
- `get` statt Index, wenn der Index nicht garantiert gültig ist.
- Kapazität erklärt, warum `push` bei offenen Referenzen verboten ist.
- `HashMap` ist schnell und unsortiert, `BTreeMap` sortiert und vorhersagbar.
- Die `entry`-API ist der idiomatische Weg für Zählen, Gruppieren und Caching.
- `iter` leiht, `iter_mut` leiht veränderbar, `into_iter` verbraucht.
- `sort_by_key` mit `Reverse` für absteigend, `sort_by` für mehrere Kriterien.
- `collect` funktioniert in jeden Container, der `FromIterator` implementiert.
