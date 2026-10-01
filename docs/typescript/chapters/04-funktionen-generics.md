# Kapitel 04 – Funktionen & Generics

## Mental Model

```text
KONKRET      function firstUser(users: User[]): User | undefined
                                  │
                        "das geht für jeden Typ"
                                  ▼
GENERISCH    function first<T>(items: readonly T[]): T | undefined

T ist ein Platzhalter, den der AUFRUFER füllt –
meistens füllt TypeScript ihn selbst per Inferenz:
   first([1, 2, 3])        → T = number
   first(['a'])            → T = string
```

- Generics erhalten die Typbeziehung zwischen Ein- und Ausgabe. `any` wirft sie weg.
- Ein Type-Parameter, der nur **einmal** vorkommt, ist fast immer überflüssig.
- Constraints (`T extends …`) sagen: "T darf alles sein, solange es mindestens das kann."

## Syntax / API

### Funktionstypen

```ts
function add(a: number, b: number): number { return a + b }

const addArrow = (a: number, b: number): number => a + b

type BinaryOp = (a: number, b: number) => number
const multiply: BinaryOp = (a, b) => a * b        // Parameter werden inferiert

interface Repository {
  findById(id: number): User | undefined          // Methoden-Syntax
  onChange: (user: User) => void                  // Property mit Funktionstyp
}
```

Die Annotation am Funktionstyp macht die Lambdas darunter schlank: **Contextual Typing**.

### Optionale und Default-Parameter, Rest

```ts
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name
}

function paginate(items: readonly string[], page = 0, size = 20): readonly string[] {
  return items.slice(page * size, page * size + size)
}

function logAll(level: string, ...messages: string[]): void {
  messages.forEach((m) => console.log(level, m))
}
```

Optionale Parameter stehen **hinten**. Ein Parameter mit Default ist automatisch optional – `?` und `=` kombiniert man nicht.

### Overloads

```ts
function parseId(value: string): number
function parseId(value: string[]): number[]
function parseId(value: string | string[]): number | number[] {
  return Array.isArray(value) ? value.map(Number) : Number(value)
}

const one = parseId('7')        // number
const many = parseId(['7'])     // number[]
```

Die Implementierungssignatur ist von außen **nicht** aufrufbar. Overloads nur, wenn eine Union-Signatur den Zusammenhang nicht ausdrücken kann.

### Generische Funktionen

```ts
function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b]
}

function identity<T>(value: T): T { return value }

first([1, 2])                   // T = number, inferiert
first<string>([])               // explizit, wenn die Inferenz nichts hergibt
```

### Constraints mit `extends`

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

longest('abc', 'ab')            // string
longest([1], [1, 2])            // number[]
// longest(1, 2)                // Fehler: number hat kein length

function prop<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

prop({ id: 1, name: 'Jan' }, 'name')    // string
// prop({ id: 1 }, 'nope')              // Fehler

function withDefault<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback
}
```

`keyof T` ist die Union der Schlüssel, `T[K]` der Typ des Werts an diesem Schlüssel (**Indexed Access**).

### Generische Interfaces und Klassen

```ts
interface Page<T> {
  readonly items: readonly T[]
  readonly total: number
}

interface Repository<T, ID> {
  findById(id: ID): T | undefined
  save(entity: T): T
}

class Stack<T> {
  private readonly items: T[] = []

  push(item: T): void { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
  get size(): number { return this.items.length }
}

const stack = new Stack<string>()
```

### Generische Utility-Funktionen

```ts
function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const result = new Map<K, T[]>()
  for (const item of items) {
    const bucket = result.get(keyOf(item)) ?? []
    bucket.push(item)
    result.set(keyOf(item), bucket)
  }
  return result
}

function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) result[key] = source[key]
  return result
}

function unique<T, K>(items: readonly T[], keyOf: (item: T) => K): T[] {
  const seen = new Set<K>()
  return items.filter((item) => {
    const key = keyOf(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
```

### Arrow vs. `function` und `this`

```ts
class Timer {
  private count = 0

  startBroken(): void {
    setTimeout(function () { this.count++ }, 100)     // this ist nicht der Timer
  }

  start(): void {
    setTimeout(() => { this.count++ }, 100)           // Arrow erbt this lexikalisch
  }
}
```

Arrow-Funktionen haben **kein eigenes** `this`, `arguments` oder `prototype` und sind nicht als Konstruktor verwendbar. Für Callbacks deshalb immer Arrow. Wer `this` in einer Funktion wirklich braucht, kann es typisieren: `function handler(this: HTMLElement, ev: Event) {}`.

### Closures und Currying

```ts
function createCounter(start = 0): () => number {
  let current = start
  return () => ++current          // current lebt in der Closure weiter
}

const next = createCounter(10)
next()                            // 11
next()                            // 12

const multiplyBy = (factor: number) => (value: number): number => value * factor
const double = multiplyBy(2)
double(21)                        // 42

function memoize<A extends readonly unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>()
  return (...args: A): R => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key) as R
    const value = fn(...args)
    cache.set(key, value)
    return value
  }
}
```

Wichtig ist `cache.has(key)` statt `cache.get(key) ?? …` – nur so werden auch `0`, `false` und `undefined` als Ergebnis korrekt zwischengespeichert.

## Typische Use Cases

- Wiederverwendbare Listen-Helfer: `groupBy`, `unique`, `sortBy`, `chunk`.
- Typsichere API-Schicht: `async function get<T>(url: string): Promise<T>`.
- Domänenobjekte teilweise übertragen: `pick(user, ['id', 'name'])` für DTOs.
- Konfigurierbare Callbacks: `multiplyBy(2)`, `withRetry(3)`.
- Caching und Rate-Limiting über Closures (`memoize`, `debounce`).
- Generische Container: `Page<T>`, `Result<T>`, `Repository<T, ID>`.

## Clean-Code-Empfehlungen

- Type-Parameter sinnvoll benennen: `T`, `K`, `V`, `R` sind Konvention – bei mehr als zwei lieber `TItem`, `TKey`.
- Generics erst einführen, wenn es **zwei** echte Anwendungsfälle gibt. Vorab-Abstraktion ist teurer als Duplikation.
- Rückgabetypen exportierter Funktionen explizit annotieren.
- Höchstens drei Parameter; mehr → Options-Objekt mit benannten Feldern.
- Callback-Parameter als Funktionstyp-Alias deklarieren, wenn er mehrfach vorkommt.
- Keine Boolean-Parameter (`render(true)`); stattdessen Literal-Union (`render('compact')`).
- Reine Funktionen bevorzugen: gleiche Eingabe → gleiche Ausgabe, keine Mutation der Argumente.

## Häufige Fehler

```ts
// FALSCH: any zerstört den Zusammenhang
function first(items: any[]): any { return items[0] }
// RICHTIG
function first<T>(items: readonly T[]): T | undefined { return items[0] }

// FALSCH: Generic, der nur einmal vorkommt
function log<T>(value: T): void { console.log(value) }
// RICHTIG
function log(value: unknown): void { console.log(value) }

// FALSCH: optionaler Parameter vor Pflichtparameter
function send(body?: string, url: string) {}      // Compile-Fehler
// RICHTIG
function send(url: string, body?: string) {}

// FALSCH: ? und Default kombiniert
function greet(name?: string = 'Welt') {}         // Compile-Fehler
// RICHTIG
function greet(name = 'Welt') {}

// FALSCH: this in einer klassischen Callback-Funktion
element.addEventListener('click', function () { this.state.count++ })
// RICHTIG
element.addEventListener('click', () => { this.state.count++ })

// FALSCH: veränderbares Default-Objekt pro Aufruf neu gedacht
function add(item: string, target: string[] = []) { target.push(item); return target }
// (funktioniert in JS, weil der Default bei JEDEM Aufruf neu ausgewertet wird –
//  in Sprachen wie Python wäre das ein klassischer Bug. Trotzdem: Mutation von
//  Parametern vermeiden.)
// RICHTIG
function add(item: string, target: readonly string[] = []): string[] { return [...target, item] }

// FALSCH: Constraint fehlt, Zugriff unmöglich
function byName<T>(items: T[]) { return items.map((i) => i.name) }
// RICHTIG
function byName<T extends { name: string }>(items: readonly T[]): string[] {
  return items.map((i) => i.name)
}

// FALSCH: Closure über let in einer for-Schleife (var-Variante)
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))   // 3 3 3
// RICHTIG
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i))   // 0 1 2
```

## Interview-relevante Details

- **Type Erasure**: Generics verschwinden beim Kompilieren; es gibt kein `new T()` und kein `T[]`-Reflection.
- **Inferenz**: TypeScript leitet T aus den Argumenten ab; explizite Type-Arguments nur, wenn Inferenz scheitert oder zu weit ist.
- `keyof`, `typeof` und Indexed Access (`T[K]`) sind die Bausteine, auf denen `Pick`, `Omit`, `Record` (Kapitel 06) aufbauen.
- **Parameter-Bivarianz**: Methoden-Syntax (`foo(x: T): void`) ist bivariant geprüft, Property-Syntax (`foo: (x: T) => void`) mit `strictFunctionTypes` kontravariant – die Property-Form ist die sicherere.
- Funktionen sind zuweisbar, wenn sie **weniger** Parameter erwarten: `[1,2].map(() => 0)` ist erlaubt.
- Ein Rückgabetyp `void` bei Callbacks bedeutet "Ergebnis wird ignoriert", nicht "darf nichts zurückgeben".
- Closures halten Referenzen, nicht Kopien – der häufigste Grund für Memory-Leaks in Event-Handlern.
- Overloads werden von oben nach unten geprüft; die erste passende gewinnt, deshalb spezifische zuerst.

## Zusammenfassung

- Funktionstypen als `type` deklarieren; Parameter darunter werden inferiert.
- Optionale Parameter nach hinten, Defaults statt `?` + manueller Prüfung.
- Generics erhalten die Beziehung Eingabe → Ausgabe; `any` zerstört sie.
- `T extends …` schränkt ein und macht Properties zugänglich; `keyof T` + `T[K]` für schlüsselbasierte Helfer.
- Generische Interfaces/Klassen für Container wie `Page<T>`, `Stack<T>`, `Repository<T, ID>`.
- Arrow-Funktionen für Callbacks (lexikalisches `this`), Closures für Zustand ohne Klasse.
