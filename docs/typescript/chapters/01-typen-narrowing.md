# Kapitel 01 – Typen & Narrowing

## Mental Model

```text
WEIT                                                          ENG
unknown  →  string | number  →  string  →  "de" | "en"  →  "de"
         ▲                   ▲           ▲
         │                   │           │
    Type Guard          typeof/in/   Literal Type
    (x is Y)            instanceof    (as const)
```

- TypeScript ist ein **Typ-Layer über JavaScript**: Zur Laufzeit existiert kein einziger Typ mehr.
- Deshalb funktioniert Narrowing nur über Prüfungen, die auch in JavaScript real sind (`typeof`, `instanceof`, `in`, Vergleiche).
- Regel: Typen so **weit wie nötig** annehmen (Parameter), so **eng wie möglich** liefern (Rückgabe).

## Syntax / API

### Primitive Typen und Inferenz

```ts
const name = 'Jan'          // Typ: "Jan"  (literal, weil const)
let city = 'Berlin'         // Typ: string (weil let neu zuweisbar ist)
const age: number = 42
const active = true         // true
const nothing = null        // null
const missing = undefined   // undefined
const big = 10n             // bigint
```

Faustregel: **Nicht annotieren, was TypeScript besser weiß.** Annotieren bei Funktionsparametern, Rückgabetypen öffentlicher Funktionen und leeren Containern (`const ids: string[] = []`).

### Literal Types und `as const`

```ts
type Locale = 'de' | 'en' | 'fr'
const locale: Locale = 'de'

const roles = ['admin', 'user'] as const
// readonly ["admin", "user"]
type Role = (typeof roles)[number]   // "admin" | "user"

const config = { retries: 3, mode: 'strict' } as const
// { readonly retries: 3; readonly mode: "strict" }
```

`as const` friert ein Literal ein: keine Weitung zu `string`/`number`, alles `readonly`.

### `type` vs. `interface`

```ts
interface User {
  id: number
  name: string
}

type Point = { x: number; y: number }
type Id = string | number            // nur mit type möglich
type Pair = [number, number]         // nur mit type möglich

interface User { email: string }     // Declaration Merging: User hat jetzt 3 Felder
```

| | `interface` | `type` |
|---|---|---|
| Objektform | ✅ | ✅ |
| Union / Tupel / Primitive | ❌ | ✅ |
| Erweitern | `extends` | `&` (Intersection) |
| Declaration Merging | ✅ | ❌ |

Praxis: `interface` für Objekt- und Klassenverträge, `type` für alles andere. Wichtiger als die Wahl ist, im Projekt **konsistent** zu bleiben.

### `unknown` statt `any`

```ts
function handle(raw: unknown): string {
  // raw.length          // Fehler – erst prüfen!
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number') return raw.toFixed(2)
  return 'unbekannt'
}
```

`any` schaltet die Prüfung ab und verseucht alles, was damit in Berührung kommt. `unknown` erzwingt eine Prüfung – genau das, was man an einer Systemgrenze (`JSON.parse`, `fetch`, Bibliothek ohne Typen) will.

### Narrowing-Werkzeuge

```ts
typeof value === 'string'          // string, number, boolean, bigint, symbol, function, object, undefined
value instanceof Date              // Klassen
'email' in contact                 // Property-Existenz
Array.isArray(value)               // Arrays (typeof liefert "object")
if (value) { … }                   // truthiness
if (value === null) { … }          // exakter Vergleich
```

```ts
function length(value: string | string[] | null): number {
  if (value === null) return 0
  if (Array.isArray(value)) return value.length
  return value.length           // hier sicher string
}
```

Achtung `typeof null === 'object'` – der berühmte JS-Bug. Für "ist es ein echtes Objekt?" braucht es `value !== null && typeof value === 'object'`.

### Eigene Type Guards: `x is Y`

```ts
interface User {
  id: number
  name: string
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as { id: unknown }).id === 'number' &&
    'name' in value &&
    typeof (value as { name: unknown }).name === 'string'
  )
}

const parsed: unknown = JSON.parse(body)
if (isUser(parsed)) {
  console.log(parsed.name)     // parsed ist hier User
}
```

Verwandt: **Assertion-Funktionen** mit `asserts value is User` – sie werfen statt `false` zurückzugeben.

### `readonly` und `strictNullChecks`

```ts
interface Order {
  readonly id: string
  items: readonly string[]
}

function total(prices: readonly number[]): number {
  // prices.push(1)        // Fehler – gut so
  return prices.reduce((sum, p) => sum + p, 0)
}
```

Mit `strictNullChecks` (Teil von `"strict": true`) sind `null` und `undefined` **nicht** automatisch in jedem Typ enthalten. `string | undefined` muss also erst behandelt werden – das ist die wichtigste Fehlerquelle, die TypeScript dir abnimmt.

## Typische Use Cases

- API-Antworten validieren: `unknown` → Type Guard → getypter DTO.
- Feste Wertemengen modellieren: `type Status = 'new' | 'paid' | 'cancelled'` statt `string`.
- Konfigurationsobjekte mit `as const` einfrieren und daraus Typen ableiten.
- Optionale Felder (`user.email?: string`) sauber mit `if (user.email)` oder `?? fallback` behandeln.
- Funktionen, die Listen nur lesen, mit `readonly T[]` annotieren – dokumentiert die Absicht.

## Clean-Code-Empfehlungen

- **Niemals `any`.** Wenn du den Typ nicht kennst: `unknown` plus Guard.
- Keine überflüssigen Annotationen: `const n: number = 1` ist Rauschen.
- Öffentliche Funktionen bekommen einen expliziten Rückgabetyp – das verhindert, dass eine Refaktorierung still die Signatur ändert.
- `as` (Type Assertion) ist eine Behauptung, keine Prüfung. Sparsam einsetzen und kommentieren, warum es sicher ist.
- Union statt boolescher Flags: `{ state: 'loading' | 'ready' | 'error' }` statt `isLoading`, `isError`.
- Guards in benannte Funktionen auslagern (`isUser`), nicht inline verschachteln.

## Häufige Fehler

```ts
// FALSCH: any als Abkürzung
function parse(raw: any) { return raw.data.items }
// RICHTIG
function parse(raw: unknown): unknown[] {
  if (typeof raw === 'object' && raw !== null && 'items' in raw && Array.isArray(raw.items)) return raw.items
  return []
}

// FALSCH: typeof null ist "object"
if (typeof value === 'object') value.name
// RICHTIG
if (typeof value === 'object' && value !== null) { /* … */ }

// FALSCH: truthiness verschluckt 0 und ""
function label(count?: number) { return count ? count : 'keine' }   // 0 → "keine"
// RICHTIG
function label(count?: number) { return count ?? 'keine' }

// FALSCH: as erzwingt eine Lüge
const user = JSON.parse(body) as User    // zur Laufzeit ungeprüft
// RICHTIG
const parsed: unknown = JSON.parse(body)
if (!isUser(parsed)) throw new TypeError('kein User')

// FALSCH: Rückgabetyp weitet sich zu string
function mode() { return 'strict' }                  // string
// RICHTIG
function mode(): 'strict' | 'loose' { return 'strict' }

// FALSCH: Guard ohne Prädikat – kein Narrowing beim Aufrufer
function isString(v: unknown): boolean { return typeof v === 'string' }
// RICHTIG
function isString(v: unknown): v is string { return typeof v === 'string' }
```

## Interview-relevante Details

- **Structural Typing**: Kompatibilität entscheidet die Form, nicht der Name. Ein Objekt mit `{ id, name }` passt auf `User`, auch ohne `implements`.
- **Type Erasure**: Nach dem Kompilieren gibt es keine Typen mehr – deshalb kein `value instanceof MyInterface`.
- `unknown` ist der Top-Type (alles ist zuweisbar, nichts ist benutzbar), `never` der Bottom-Type (nichts ist zuweisbar) – nützlich für Exhaustiveness-Checks.
- **Excess Property Check**: Objektliteral-Zuweisungen melden unbekannte Felder, Variablen-Zuweisungen nicht.
- `type` und `interface` sind beim Kompilieren gleich schnell; Unterschiede liegen in Merging und Ausdrucksstärke.
- Control Flow Analysis merkt sich Narrowing nur, solange die Variable nicht neu zugewiesen wird – bei `let` in Closures geht es verloren.
- `strict` bündelt u. a. `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` – in jedem neuen Projekt einschalten.

## Zusammenfassung

- Typen so eng wie möglich: Literal Types und `as const` statt `string`.
- `unknown` an Systemgrenzen, `any` nie.
- Narrowing über `typeof`, `instanceof`, `in`, `Array.isArray`, exakte Vergleiche.
- Eigene Prüfungen als Type Guard mit `value is T` schreiben, sonst verpufft das Narrowing.
- `interface` für Objektverträge, `type` für Unions, Tupel, Aliase.
- `readonly` dokumentiert Nur-Lese-Absicht, `strict` fängt die `null`-Fehler.
