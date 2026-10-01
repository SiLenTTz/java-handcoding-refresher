# Kapitel 02 – Arrays & Iteration

## Mental Model

```text
QUELLE        number[]  /  readonly number[]  /  [string, number]  (Tupel)
  ↓
TRANSFORM     map      T[] → U[]        (gleiche Länge)
              filter   T[] → T[]        (weniger oder gleich)
              flatMap  T[] → U[]        (beliebig viele)
  ↓
REDUZIEREN    reduce   T[] → irgendwas
              find / some / every / includes   (brechen früh ab)
```

- `map`/`filter`/`flatMap` liefern **neue** Arrays – die Quelle bleibt unangetastet.
- `sort`, `reverse`, `push`, `splice` **mutieren**. Das ist die häufigste Bug-Quelle in Listen-Code.
- Ein Array ist in TypeScript homogen getypt (`number[]`); ein **Tupel** ist positionsgetypt (`[string, number]`).

## Syntax / API

### Array-Typen

```ts
const ids: number[] = [1, 2, 3]
const names: Array<string> = ['a', 'b']       // identisch, nur andere Schreibweise
const matrix: number[][] = [[1, 2], [3]]
const frozen: readonly string[] = ['a']        // push/sort verboten
const pair: [string, number] = ['age', 42]     // Tupel
const named: [key: string, value: number] = ['age', 42]
const rest: [string, ...number[]] = ['sum', 1, 2, 3]

const empty: string[] = []                     // ohne Annotation wäre es never[]
```

### map / filter / flatMap

```ts
const prices = [10, 20, 30]

const withTax: number[] = prices.map((p) => p * 1.19)
const big: number[] = prices.filter((p) => p > 15)
const labels: string[] = prices.map((p, index) => `${index}: ${p} €`)

const posts = [{ tags: ['ts', 'js'] }, { tags: ['ts'] }]
const allTags: string[] = posts.flatMap((post) => post.tags)   // ["ts","js","ts"]

const cleaned = ['1', 'x', '2'].flatMap((s) => (Number.isNaN(Number(s)) ? [] : [Number(s)]))
// [1, 2] – flatMap als "map + filter" in einem Schritt
```

### reduce

```ts
const sum = prices.reduce((acc, p) => acc + p, 0)

const byId = users.reduce<Record<number, User>>((acc, user) => {
  acc[user.id] = user
  return acc
}, {})
```

Der **Startwert ist Pflicht**, sonst knallt es bei leeren Arrays und der Typ wird zu `T`. Der Generic-Parameter (`reduce<Record<…>>`) verhindert, dass TypeScript den Akkumulator falsch errät.

### find / some / every / includes

```ts
const found: number | undefined = prices.find((p) => p > 15)
const index: number = prices.findIndex((p) => p > 15)          // -1 wenn nichts
const last = prices.findLast((p) => p > 5)

const hasCheap: boolean = prices.some((p) => p < 15)
const allCheap: boolean = prices.every((p) => p < 100)
const known: boolean = prices.includes(20)
```

Leeres Array: `some` → `false`, `every` → `true`. `find` liefert `T | undefined` – mit `strictNullChecks` musst du das behandeln.

### sort – mutiert und sortiert per Default als String!

```ts
const nums = [10, 9, 100]
nums.sort()                                   // [10, 100, 9]  ← lexikografisch!
nums.sort((a, b) => a - b)                    // [9, 10, 100]

users.sort((a, b) => a.name.localeCompare(b.name))          // Strings sprachbewusst
users.sort((a, b) => b.age - a.age)                          // absteigend
users.sort((a, b) => a.dept.localeCompare(b.dept) || b.age - a.age)   // zwei Kriterien

const sorted = [...users].sort((a, b) => a.age - b.age)      // Kopie zuerst
const modern = users.toSorted((a, b) => a.age - b.age)       // ES2023, ohne Mutation
```

Der Comparator liefert `< 0`, `0` oder `> 0`. `a - b` funktioniert nur für Zahlen, niemals für Strings.

### Spread, Rest, Destructuring

```ts
const merged = [...a, ...b]
const copy = [...a]                          // flache Kopie
const withNew = [...items, newItem]          // statt push

function max(...values: number[]): number {  // Rest-Parameter
  return Math.max(...values)                 // Spread beim Aufruf
}

const [first, second = 0, ...others] = prices
const [, secondOnly] = prices                // Position überspringen
for (const [index, value] of prices.entries()) { /* … */ }
```

### Array.from und Co.

```ts
Array.from({ length: 5 }, (_, i) => i)       // [0,1,2,3,4]
Array.from('abc')                            // ["a","b","c"]
Array.from(new Set([1, 1, 2]))               // [1, 2]
Array.of(7)                                  // [7]   (new Array(7) wäre Länge 7!)
new Array(3).fill(0)                          // [0,0,0]
```

### Unveränderliche Varianten (ES2023)

| mutierend | unveränderlich |
|---|---|
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `splice` | `toSpliced` |
| `arr[i] = x` | `with(i, x)` |

## Typische Use Cases

- Listen für die UI aufbereiten: `filter` → `sort` (auf einer Kopie) → `map` in ein View-Modell.
- Top-N: `[...items].sort(cmp).slice(0, n)`.
- Kennzahlen: `reduce` auf ein Ergebnisobjekt `{ count, total, max }`.
- Verschachtelte Daten glattziehen: `flatMap`.
- Paginierung: `items.slice(page * size, page * size + size)`.
- Eindeutige Werte: `[...new Set(values)]`.

## Clean-Code-Empfehlungen

- Eine Operation pro Zeile, Kette von oben nach unten lesbar halten.
- Parameter aussagekräftig benennen: `.filter((order) => …)` statt `.filter((o) => …)` bei längeren Bodies.
- Nie in `map`/`filter` Seiteneffekte auslösen – dafür ist `for…of` ehrlicher.
- Vor `sort` immer kopieren (`[...arr]` oder `toSorted`), außer du willst bewusst mutieren.
- Lese-Parameter als `readonly T[]` annotieren; dann meckert der Compiler bei versehentlicher Mutation.
- `reduce` nur, wenn es klarer ist als eine Schleife. Ein `reduce`, das jemand dreimal lesen muss, ist die falsche Wahl.

## Häufige Fehler

```ts
// FALSCH: sort ohne Comparator bei Zahlen
[10, 9, 100].sort()                    // [10, 100, 9]
// RICHTIG
[10, 9, 100].sort((a, b) => a - b)

// FALSCH: sort mutiert die Eingabe (Props/State kaputt)
function sorted(items: User[]) { return items.sort(byName) }
// RICHTIG
function sorted(items: readonly User[]) { return [...items].sort(byName) }

// FALSCH: Strings mit Minus vergleichen
names.sort((a, b) => a - b)            // Compile-Fehler
// RICHTIG
names.sort((a, b) => a.localeCompare(b))

// FALSCH: reduce ohne Startwert
[].reduce((a, b) => a + b)             // TypeError: Reduce of empty array
// RICHTIG
[].reduce((a, b) => a + b, 0)

// FALSCH: find-Ergebnis ungeprüft benutzen
const user = users.find((u) => u.id === id)
console.log(user.name)                 // user ist User | undefined
// RICHTIG
if (!user) throw new Error(`User ${id} nicht gefunden`)

// FALSCH: forEach zum Sammeln
const names: string[] = []
users.forEach((u) => names.push(u.name))
// RICHTIG
const names = users.map((u) => u.name)

// FALSCH: map mit if ohne else liefert undefined-Löcher
const r = users.map((u) => { if (u.active) return u.name })   // (string | undefined)[]
// RICHTIG
const r = users.filter((u) => u.active).map((u) => u.name)

// FALSCH: Kopie ist flach
const copy = [...users]
copy[0].name = 'x'                     // ändert auch das Original-Objekt
```

## Interview-relevante Details

- `includes` findet `NaN`, `indexOf` nicht (`includes` nutzt SameValueZero, `indexOf` strikte Gleichheit).
- `sort` ist seit ES2019 **stabil**: gleichwertige Elemente behalten ihre Reihenfolge – Grundlage für Mehrfach-Sortierung.
- `map` überspringt Löcher in Sparse Arrays, `Array.from({length: n})` nicht – deshalb funktioniert `new Array(3).map(…)` nicht.
- `flat(depth)` vs. `flatMap` – `flatMap` ist genau `map(…).flat(1)`, aber in einem Durchlauf.
- `readonly T[]` ist rein statisch: zur Laufzeit ist es ein ganz normales Array. Echtes Einfrieren macht `Object.freeze`.
- `for…of` iteriert Werte, `for…in` iteriert **Schlüssel als Strings** und läuft auch über geerbte Properties – für Arrays praktisch nie richtig.
- Kettenlänge kostet: Jede Stufe erzeugt ein neues Array. Bei sehr großen Listen ist eine Schleife messbar schneller – aber erst messen, dann optimieren.

## Zusammenfassung

- `map` transformiert, `filter` reduziert, `flatMap` macht beides und flacht ab, `reduce` faltet zusammen.
- `find`/`some`/`every`/`includes` für Suche und Prüfung; `find` liefert `T | undefined`.
- `sort` mutiert und vergleicht Strings – immer Comparator angeben und vorher kopieren (`toSorted`).
- Spread kopiert flach; Rest-Parameter und Destructuring halten Signaturen lesbar.
- `Array.from({ length: n }, (_, i) => …)` erzeugt Sequenzen.
- `readonly T[]` an Parametern signalisiert: Ich lese nur.
