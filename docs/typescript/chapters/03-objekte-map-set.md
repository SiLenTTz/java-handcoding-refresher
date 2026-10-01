# Kapitel 03 – Objekte, Map & Set

## Mental Model

```text
OBJEKT           feste, bekannte Felder      { id: number; name: string }
RECORD           dynamische String-Keys      Record<string, number>
MAP              beliebige Keys, Reihenfolge Map<K, V>   .get .set .has .delete .size
SET              Eindeutigkeit               Set<T>      .add .has .delete .size

Schlüssel bekannt zur Compile-Zeit?  → Objekt / interface
Schlüssel dynamisch, nur Strings?    → Record<string, V>
Schlüssel dynamisch, oft ändernd?    → Map
Nur "ist drin / nicht drin"?          → Set
```

- Objekt-Keys sind immer `string` (oder `symbol`) – `obj[1]` wird still zu `obj["1"]`.
- `Map` und `Set` behalten die Einfügereihenfolge und haben ein ehrliches `size`.

## Syntax / API

### Objekt-Typen, optionale und readonly Properties

```ts
interface User {
  readonly id: number
  name: string
  email?: string            // string | undefined
  address?: {
    city: string
  }
}

const user: User = { id: 1, name: 'Jan' }
// user.id = 2              // Fehler: readonly
```

`email?: string` heißt: Property darf **fehlen**. `email: string | undefined` heißt: Property muss da sein, darf aber `undefined` sein. Feiner Unterschied, große Wirkung bei `Object.keys`.

### Index Signatures und `Record`

```ts
interface Counter {
  [key: string]: number
}

type ByCategory = Record<string, number>          // gleichwertig, kürzer
type Translations = Record<'de' | 'en', string>   // erzwingt beide Keys
type Flags = Partial<Record<Feature, boolean>>    // alle optional
```

Achtung: Bei `Record<string, V>` behauptet TypeScript, **jeder** Zugriff liefere ein `V` – auch `counts['gibtesnicht']`. Mit `"noUncheckedIndexedAccess": true` wird daraus korrekt `V | undefined`.

### Zugriff und Kopieren

```ts
const { name, email = 'keine' } = user            // Destructuring mit Default
const { address: { city } = { city: '?' } } = user

const copy = { ...user }                          // flache Kopie
const updated = { ...user, name: 'Neu' }          // "ändern" ohne Mutation
const merged = { ...defaults, ...overrides }      // rechts gewinnt

const deep = structuredClone(user)                // echte Tiefenkopie (Node 17+, Browser)
```

`{ ...a, ...b }` ist flach: Verschachtelte Objekte sind in beiden Kopien **dasselbe** Objekt. Und: Ein `undefined`-Wert in `b` überschreibt den Wert aus `a`.

### `Object.keys` / `values` / `entries`

```ts
const scores = { jan: 3, anna: 5 }

Object.keys(scores)      // string[]   ← NICHT ("jan" | "anna")[]
Object.values(scores)    // number[]
Object.entries(scores)   // [string, number][]

for (const [name, score] of Object.entries(scores)) {
  console.log(`${name}: ${score}`)
}

Object.fromEntries([['a', 1], ['b', 2]])          // { a: 1, b: 2 }
```

`Object.keys` liefert bewusst `string[]`, weil ein Objekt zur Laufzeit mehr Felder haben kann als der Typ verspricht. Wenn du die engen Keys brauchst: `Object.keys(o) as (keyof typeof o)[]` – mit dem Wissen, dass das eine Behauptung ist.

### Map

```ts
const ages = new Map<string, number>()
ages.set('jan', 42).set('anna', 30)

ages.get('jan')            // number | undefined
ages.has('jan')            // boolean
ages.delete('jan')         // boolean
ages.size                  // 1
ages.get('weg') ?? 0       // Default sauber setzen

for (const [key, value] of ages) { /* … */ }
[...ages.keys()], [...ages.values()], [...ages.entries()]

const fromPairs = new Map([['a', 1], ['b', 2]])
const asObject = Object.fromEntries(ages)
```

### Gruppieren und Zählen

```ts
function groupByCity(users: readonly User[]): Map<string, User[]> {
  const result = new Map<string, User[]>()
  for (const user of users) {
    const bucket = result.get(user.city) ?? []
    bucket.push(user)
    result.set(user.city, bucket)
  }
  return result
}

function countByCity(users: readonly User[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const user of users) {
    result[user.city] = (result[user.city] ?? 0) + 1
  }
  return result
}
```

Das `?? []` / `?? 0` ist das Kernmuster – es ersetzt das umständliche `if (!map.has(k)) map.set(k, [])`.

### Set

```ts
const tags = new Set<string>(['ts', 'js', 'ts'])
tags.size                   // 2
tags.add('node')
tags.has('ts')              // O(1)
[...tags]                   // string[] in Einfügereihenfolge

const unique = [...new Set(values)]
const both = a.filter((x) => b.has(x))        // Schnittmenge
```

`Set` und `Map` vergleichen mit SameValueZero, also per **Referenz** bei Objekten: Zwei gleich aussehende Objekte sind zwei Einträge.

### Optional Chaining und Nullish Coalescing

```ts
const city = user.address?.city                 // string | undefined
const len = list?.length ?? 0
const name = user.getName?.()                    // nur aufrufen, wenn vorhanden
const first = items?.[0]

const port = config.port ?? 8080                 // nur bei null/undefined
const portBad = config.port || 8080              // auch bei 0 → Bug
```

## Typische Use Cases

- Lookup-Tabelle aus einer Liste bauen: `new Map(users.map((u) => [u.id, u]))`.
- Gruppieren nach Feld für Reports und UI-Sektionen.
- Zählen/Histogramm mit `Record<string, number>`.
- Duplikate entfernen oder "schon gesehen?" merken mit `Set`.
- Defaults und User-Overrides zusammenführen mit Spread.
- Verschachtelte API-Antworten sicher lesen mit `?.` und `??`.

## Clean-Code-Empfehlungen

- Für dynamische, wachsende Schlüsselmengen `Map` statt Objekt – kein Prototyp-Ballast, ehrliches `size`, beliebige Key-Typen.
- `Record<string, T>` nur, wenn die Daten wirklich flach und String-basiert sind (z. B. JSON-Konfiguration).
- Nicht mutieren, wo Kopieren billig ist: `{ ...state, field: neu }`.
- `??` statt `||`, sobald `0`, `''` oder `false` gültige Werte sind.
- Optional Chaining nicht als Fehler-Teppich: `a?.b?.c?.d` versteckt oft ein Modellierungsproblem.
- Gruppierungs-Helfer einmal generisch schreiben statt fünfmal kopieren (siehe Kapitel 04).

## Häufige Fehler

```ts
// FALSCH: map.get()-Ergebnis ungeprüft
const list = groups.get(key)
list.push(item)                         // list ist V | undefined
// RICHTIG
const list = groups.get(key) ?? []
list.push(item)
groups.set(key, list)

// FALSCH: || verschluckt gültige Werte
const retries = config.retries || 3     // 0 → 3
// RICHTIG
const retries = config.retries ?? 3

// FALSCH: Objekt als Map-Key vergleichen
const seen = new Set<{ id: number }>()
seen.add({ id: 1 })
seen.has({ id: 1 })                      // false – andere Referenz
// RICHTIG
const seen = new Set<number>()
seen.add(user.id)

// FALSCH: Spread ist flach
const copy = { ...order }
copy.address.city = 'Berlin'             // ändert auch order.address
// RICHTIG
const copy = structuredClone(order)

// FALSCH: for…in über ein Array/Objekt
for (const key in scores) { /* key ist string, auch geerbte Props */ }
// RICHTIG
for (const [key, value] of Object.entries(scores)) { /* … */ }

// FALSCH: Zählen ohne Default
counts[city]++                           // NaN beim ersten Mal
// RICHTIG
counts[city] = (counts[city] ?? 0) + 1

// FALSCH: Map-Größe über Object.keys
Object.keys(myMap).length                // immer 0
// RICHTIG
myMap.size
```

## Interview-relevante Details

- `Map` vs. Objekt: Map hat beliebige Key-Typen, garantierte Einfügereihenfolge, `size` in O(1) und keine Prototype-Kollision (`__proto__`, `constructor`). Objekt ist JSON-serialisierbar und syntaktisch kürzer.
- `JSON.stringify(new Map())` ergibt `{}` – Maps müssen vor dem Serialisieren über `[...map]` konvertiert werden.
- Objekt-Keys werden zu Strings gecastet; ganzzahlige Keys werden zusätzlich **numerisch sortiert** ausgegeben, alle anderen in Einfügereihenfolge.
- `WeakMap`/`WeakSet` halten Keys nicht am Leben – gut für Metadaten zu Objekten ohne Memory-Leak.
- `structuredClone` kopiert auch `Map`, `Set`, `Date` und Zyklen – `JSON.parse(JSON.stringify(x))` verliert all das.
- `?.` short-circuitet die ganze Kette: `a?.b.c` wirft nicht, wenn `a` null ist.
- `Object.freeze` ist ebenfalls flach; `readonly` existiert nur zur Compile-Zeit.

## Zusammenfassung

- Bekannte Felder → `interface`; dynamische String-Keys → `Record<string, V>`; alles andere → `Map`.
- `Object.keys/values/entries` liefern bewusst weite Typen (`string[]`).
- Gruppieren/Zählen mit `map.get(k) ?? default` bzw. `record[k] ?? 0`.
- `Set` für Eindeutigkeit und O(1)-Mitgliedschaft – aber nur mit primitiven Keys.
- Spread kopiert flach, `structuredClone` tief.
- `?.` und `??` sind Präzisionswerkzeuge – `||` nur bei echten Booleans.
