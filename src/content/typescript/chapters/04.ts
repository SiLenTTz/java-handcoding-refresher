import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    { id: 'f1', front: 'Warum Generics statt `any`?', back: '`any` wirft die Beziehung zwischen Ein- und Ausgabe weg. `first<T>(items: readonly T[]): T | undefined` liefert bei `number[]` ein `number | undefined` – `any[]` liefert nur noch `any`.' },
    { id: 'f2', front: 'Woher weiß TypeScript, was `T` ist?', back: 'Aus den Argumenten (**Inferenz**): `first([1, 2])` → `T = number`. Explizite Type-Arguments (`first<string>([])`) nur, wenn die Inferenz nichts hergibt oder zu weit ausfällt.' },
    { id: 'f3', front: 'Wofür `T extends { length: number }`?', back: 'Ein **Constraint**: T darf alles sein, solange es mindestens ein `length` hat. Erst dadurch ist `a.length` im Rumpf erlaubt.' },
    { id: 'f4', front: 'Was machen `keyof T` und `T[K]`?', back: '`keyof T` ist die Union der Schlüssel, `T[K]` (Indexed Access) der Typ des Werts dazu.\n```ts\nfunction prop<T extends object, K extends keyof T>(o: T, k: K): T[K] {\n  return o[k]\n}\n```' },
    { id: 'f5', front: 'Wann ist ein Type-Parameter überflüssig?', back: 'Wenn er nur **einmal** in der Signatur vorkommt. `function log<T>(v: T): void` bringt nichts – `function log(v: unknown): void` sagt dasselbe ehrlicher.' },
    { id: 'f6', front: 'Regeln für optionale und Default-Parameter?', back: 'Optionale Parameter stehen hinten. Ein Parameter mit Default ist automatisch optional – `?` und `=` kombiniert man nicht (`name?: string = "x"` ist ein Compile-Fehler).' },
    { id: 'f7', front: 'Wann brauchst du Overloads?', back: 'Wenn der Rückgabetyp vom **Argumenttyp** abhängt und eine Union das nicht ausdrückt:\n```ts\nfunction parseId(v: string): number\nfunction parseId(v: string[]): number[]\n```\nDie Implementierungssignatur ist von außen nicht aufrufbar.' },
    { id: 'f8', front: 'Arrow-Funktion vs. `function` beim `this`?', back: 'Arrow-Funktionen haben **kein eigenes** `this` – sie erben es lexikalisch von der Definitionsstelle. Deshalb für Callbacks immer Arrow. `function` bindet `this` erst beim Aufruf.' },
    { id: 'f9', front: 'Was ist eine Closure?', back: 'Eine Funktion, die Variablen aus ihrem Definitions-Scope am Leben hält:\n```ts\nfunction createCounter(start = 0): () => number {\n  let current = start\n  return () => ++current\n}\n```\nSie hält **Referenzen**, keine Kopien.' },
    { id: 'f10', front: 'Was ist Currying?', back: 'Eine mehrstellige Funktion als Kette einstelliger Funktionen:\n```ts\nconst multiplyBy = (factor: number) => (value: number): number => value * factor\nconst double = multiplyBy(2)\n```\nNützlich für vorkonfigurierte Callbacks.' },
    { id: 'f11', front: 'Was ist Contextual Typing?', back: 'Steht der Zieltyp fest, müssen die Lambda-Parameter nicht annotiert werden:\n```ts\ntype BinaryOp = (a: number, b: number) => number\nconst mul: BinaryOp = (a, b) => a * b\n```' },
    { id: 'f12', front: 'Warum ist `[1, 2].map(() => 0)` erlaubt, obwohl `map` drei Argumente übergibt?', back: 'Eine Funktion ist zuweisbar, wenn sie **weniger oder gleich viele** Parameter erwartet. Überzählige Argumente werden ignoriert – genau deshalb ist `["1","2"].map(parseInt)` eine Falle (`parseInt` nimmt den Index als Radix).' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Typ hat `result`?',
      code: `function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

const result = first(['a', 'b'])`,
      options: ['`string`', '`string | undefined`', '`T | undefined`', '`unknown`'],
      correct: 1,
      explanation: 'TypeScript inferiert `T = string` aus dem Argument und setzt es in den Rückgabetyp ein. Genau diesen Zusammenhang würde `any[]` zerstören.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `function names<T>(items: readonly T[]): string[] {
  return items.map((item) => item.name)
}`,
      options: [
        'Generics dürfen nicht mit `readonly` kombiniert werden',
        '`map` gibt es auf `readonly T[]` nicht',
        'Über `T` ist nichts bekannt – ohne Constraint gibt es kein `name`',
        'Der Rückgabetyp müsste `T[]` sein',
      ],
      correct: 2,
      explanation: 'Ein uneingeschränktes `T` kann alles sein. Mit `T extends { name: string }` weiß der Compiler, dass jedes Element ein `name` hat.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `function createCounter(start = 0): () => number {
  let current = start
  return () => ++current
}

const next = createCounter(10)
next()
console.log(next(), createCounter(10)())`,
      options: ['`12 11`', '`11 11`', '`12 12`', '`11 12`'],
      correct: 0,
      explanation: '`next` hält seine eigene Closure-Variable: nach zwei Aufrufen `12`. `createCounter(10)()` erzeugt eine **neue** Closure und liefert `11`.',
    },
    {
      id: 'q4',
      prompt: 'Warum kompiliert das nicht?',
      code: `function send(body?: string, url: string): void {}`,
      options: [
        'Ein Parameter mit `?` muss nach allen Pflichtparametern stehen',
        '`void` ist kein gültiger Rückgabetyp',
        'Der Body darf nicht leer sein',
        '`string` muss `string | undefined` sein',
      ],
      correct: 0,
      explanation: 'Optionale Parameter stehen immer hinten – sonst wäre beim Aufruf nicht entscheidbar, welches Argument zu welchem Parameter gehört. Korrekt: `send(url: string, body?: string)`.',
    },
    {
      id: 'q5',
      prompt: 'Welchen Typ hat `value`?',
      code: `function prop<T extends object, K extends keyof T>(source: T, key: K): T[K] {
  return source[key]
}

const value = prop({ id: 1, name: 'Jan' }, 'name')`,
      options: ['`string | number`', '`string`', '`keyof { id: number; name: string }`', '`unknown`'],
      correct: 1,
      explanation: '`K` wird zu `"name"` inferiert, `T[K]` ist damit der Typ des Felds `name`, also `string`. Ein Tippfehler wie `"nmae"` wäre ein Compile-Fehler.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i))
}`,
      options: ['`0 1 2`', '`3 3 3`', '`0 0 0`', '`2 2 2`'],
      correct: 1,
      explanation: '`var` ist funktions-, nicht blockgebunden: Alle drei Closures teilen sich dieselbe Variable, die beim Ausführen bereits `3` ist. Mit `let` gibt es pro Durchlauf eine eigene Bindung → `0 1 2`.',
    },
    {
      id: 'q7',
      prompt: 'Warum ist `this.count` hier `undefined`?',
      code: `class Timer {
  count = 0

  start(): void {
    setTimeout(function () {
      this.count++
    }, 100)
  }
}`,
      options: [
        '`count` müsste `private` sein',
        '`setTimeout` unterstützt kein `this`',
        'Eine `function` bekommt ihr eigenes `this` beim Aufruf – nicht das der Klasse. Arrow-Funktion nutzen',
        '`count` wird zu spät initialisiert',
      ],
      correct: 2,
      explanation: 'Arrow-Funktionen haben kein eigenes `this` und erben es lexikalisch. `setTimeout(() => { this.count++ }, 100)` funktioniert deshalb wie erwartet.',
    },
    {
      id: 'q8',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`function log<T>(value: T): void { console.log(value) }`',
        '`function log(value: any): void { console.log(value) }`',
        '`function log(value: unknown): void { console.log(value) }`',
        '`function log<T extends unknown>(value: T): T { console.log(value); return value }`',
      ],
      correct: 2,
      explanation: 'Der Type-Parameter käme nur einmal vor und bringt keinen Mehrwert – er ist reines Rauschen. `unknown` drückt "beliebiger Wert, nicht benutzbar ohne Prüfung" direkt aus; `any` schaltet die Prüfung ab.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Generischer Default-Zugriff',
      level: 1,
      description: `Implementiere zwei Funktionen:

1. \`firstOrDefault<T>(items: readonly T[], fallback: T): T\` – das erste Element oder \`fallback\`, wenn die Liste leer ist.
   Achtung: \`null\`, \`0\` und \`false\` sind gültige Elemente und dürfen **nicht** durch den Fallback ersetzt werden.

2. \`repeat(text: string, times = 2, separator = ' '): string\` – \`text\` so oft wiederholt, verbunden mit \`separator\`. \`times = 0\` ergibt den leeren String.`,
      starter: `function firstOrDefault<T>(items: readonly T[], fallback: T): T {
  // TODO
  return fallback
}

function repeat(text: string, times = 2, separator = ' '): string {
  // TODO
  return ''
}`,
      solution: `function firstOrDefault<T>(items: readonly T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback
}

function repeat(text: string, times = 2, separator = ' '): string {
  return Array.from({ length: times }, () => text).join(separator)
}`,
      hints: [
        'Der Fallback darf nur greifen, wenn die Liste wirklich leer ist – nicht, wenn das erste Element falsy ist.',
        '`items.length > 0` als Bedingung. Für `repeat`: `Array.from({ length: times }, () => text)` plus `join`.',
        'firstOrDefault: Länge prüfen → items[0] oder fallback. repeat: Array der gewünschten Länge bauen → join(separator).',
        '`return items.length > 0 ? items[0] : fallback` – `items[0] ?? fallback` wäre falsch, sobald `null` ein gültiges Element ist.',
      ],
      tests: `check('zahlen', 1, firstOrDefault([1, 2, 3], 0))
check('leere Liste', 0, firstOrDefault<number>([], 0))
check('strings', 'a', firstOrDefault(['a'], 'z'))
check('false als Element', false, firstOrDefault([false, true], true))
check('null als Element', null, firstOrDefault<number | null>([null, 1], 99))
check('objekt', { id: 1 }, firstOrDefault([{ id: 1 }], { id: 0 }))

check('default times und separator', 'ab ab', repeat('ab'))
check('dreimal mit Bindestrich', 'a-a-a', repeat('a', 3, '-'))
check('einmal', 'a', repeat('a', 1))
check('nullmal', '', repeat('a', 0))
check('leerer Text', ' ', repeat('', 2))`,
    },
    {
      id: 'k2',
      title: 'Generisches groupBy',
      level: 2,
      description: `Implementiere \`groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]>\`.

- \`keyOf\` bestimmt den Schlüssel für jedes Element
- Elemente einer Gruppe behalten die Eingabereihenfolge
- die Schlüssel stehen in der Reihenfolge ihres ersten Auftretens
- die Funktion muss für **beliebige** Element- und Schlüsseltypen funktionieren (\`string\`, \`number\`, \`boolean\`, …)`,
      given: `interface Employee {
  name: string
  department: string
  age: number
}`,
      starter: `function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  // TODO
  return new Map()
}`,
      solution: `function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    const bucket = groups.get(key) ?? []
    bucket.push(item)
    groups.set(key, bucket)
  }
  return groups
}`,
      hints: [
        'Zwei Type-Parameter: `T` für die Elemente, `K` für den Schlüssel. `keyOf` verbindet beide – daher inferiert TypeScript alles selbst.',
        '`map.get(key) ?? []` liefert die vorhandene oder eine frische Liste; danach `push` und `set`.',
        'leere Map anlegen → über items laufen → key = keyOf(item) → bucket holen/anlegen → push → set → Map zurückgeben',
        '`const bucket = groups.get(key) ?? []` – der Rest ist `bucket.push(item)` und `groups.set(key, bucket)`.',
      ],
      tests: `const employees: Employee[] = [
  { name: 'Jan', department: 'IT', age: 42 },
  { name: 'Anna', department: 'HR', age: 30 },
  { name: 'Ben', department: 'IT', age: 25 },
]

check('nach Abteilung', new Map([
  ['IT', [employees[0], employees[2]]],
  ['HR', [employees[1]]],
]), groupBy(employees, (e) => e.department))

check('reihenfolge der keys', ['IT', 'HR'], [...groupBy(employees, (e) => e.department).keys()])
check('nach boolean', new Map([[true, ['Jan', 'Ben']], [false, ['Anna']]]), groupBy(['Jan', 'Anna', 'Ben'], (n) => n.length === 3))
check('nach Zahl', new Map([[1, [1, 3]], [0, [2, 4]]]), groupBy([1, 2, 3, 4], (n) => n % 2))
check('leere Liste', new Map(), groupBy<number, number>([], (n) => n))
check('ein Element', new Map([['x', ['x']]]), groupBy(['x'], (s) => s))
checkTrue('Eingabe unveraendert', employees.length === 3 && employees[0].name === 'Jan')`,
    },
    {
      id: 'k3',
      title: 'pick und pluck mit keyof',
      level: 3,
      description: `Zwei typsichere Helfer für DTO-Mapping:

1. \`pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K>\`
   – ein neues Objekt mit genau den angegebenen Schlüsseln. Doppelte Schlüssel sind kein Problem, \`source\` bleibt unverändert.

2. \`pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][]\`
   – die Werte eines Felds aus einer Liste, in Eingabereihenfolge.

Der Trick ist \`keyof T\` als Constraint: Ein Tippfehler im Schlüssel wird damit zum Compile-Fehler.`,
      given: `interface User {
  id: number
  name: string
  email: string
  internal: boolean
}`,
      starter: `function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  // TODO
  return {} as Pick<T, K>
}

function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  // TODO
  return []
}`,
      solution: `function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    result[key] = source[key]
  }
  return result
}

function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key])
}`,
      hints: [
        '`keyof T` ist die Union der erlaubten Schlüssel, `T[K]` der Typ des Werts dahinter. Beides zusammen macht den Zugriff typsicher.',
        'pick: leeres Ergebnisobjekt anlegen und über `keys` laufen. pluck ist ein `map` über `item[key]`.',
        'pick: `const result = {} as Pick<T, K>` → for…of über keys → `result[key] = source[key]` → zurückgeben.',
        '`function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] { return items.map((item) => item[key]) }`',
      ],
      tests: `const user: User = { id: 1, name: 'Jan', email: 'jan@example.de', internal: true }
const users: User[] = [user, { id: 2, name: 'Anna', email: 'anna@example.de', internal: false }]

check('zwei Felder', { id: 1, name: 'Jan' }, pick(user, ['id', 'name']))
check('keine Felder', {}, pick(user, []))
check('doppelte Keys', { id: 1 }, pick(user, ['id', 'id']))
check('alle Felder', { id: 1, name: 'Jan', email: 'jan@example.de', internal: true }, pick(user, ['id', 'name', 'email', 'internal']))
checkTrue('neues Objekt', pick(user, ['id']) !== user)
check('source unveraendert', 4, Object.keys(user).length)

check('pluck ids', [1, 2], pluck(users, 'id'))
check('pluck namen', ['Jan', 'Anna'], pluck(users, 'name'))
check('pluck booleans', [true, false], pluck(users, 'internal'))
check('pluck leer', [], pluck<User, 'id'>([], 'id'))`,
    },
    {
      id: 'k4',
      title: 'memoize mit Closure',
      level: 4,
      description: `Implementiere \`memoize<A extends readonly unknown[], R>(fn: (...args: A) => R): (...args: A) => R\`.

Die zurückgegebene Funktion verhält sich wie \`fn\`, ruft sie aber für dieselben Argumente nur **einmal** auf und liefert danach das gespeicherte Ergebnis.

- Cache-Schlüssel: \`JSON.stringify(args)\`
- funktioniert für beliebige Stelligkeit (0, 1, 2 … Argumente)
- \`undefined\`, \`0\` und \`false\` als Ergebnis müssen ebenfalls gecacht werden – prüfe die **Existenz** des Schlüssels, nicht den Wert
- der Cache lebt in einer Closure, nicht global`,
      starter: `function memoize<A extends readonly unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  // TODO
  return fn
}`,
      solution: `function memoize<A extends readonly unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>()

  return (...args: A): R => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as R
    }
    const value = fn(...args)
    cache.set(key, value)
    return value
  }
}`,
      hints: [
        'Der Cache muss pro memoizierter Funktion existieren und zwischen den Aufrufen überleben – genau das leistet eine Closure.',
        'Cache als `new Map<string, R>()` vor dem `return`. Die zurückgegebene Arrow-Funktion nimmt `...args: A` entgegen.',
        'Cache anlegen → Arrow zurückgeben → key = JSON.stringify(args) → wenn cache.has(key), gespeicherten Wert liefern → sonst fn(...args) aufrufen, speichern, zurückgeben.',
        '`if (cache.has(key)) return cache.get(key) as R` – mit `cache.get(key) ?? fn(...)` würden `undefined`, `0` und `false` nie gecacht.',
      ],
      tests: `let addCalls = 0
const add = memoize((a: number, b: number): number => {
  addCalls++
  return a + b
})

check('erstes Ergebnis', 3, add(1, 2))
check('zweites Ergebnis', 3, add(1, 2))
check('nur ein echter Aufruf', 1, addCalls)
check('andere Argumente', 7, add(3, 4))
check('zwei echte Aufrufe', 2, addCalls)
check('argumentreihenfolge zaehlt', 3, add(2, 1))
check('drei echte Aufrufe', 3, addCalls)

let upperCalls = 0
const upper = memoize((text: string): string => {
  upperCalls++
  return text.toUpperCase()
})
check('string ergebnis', 'AB', upper('ab'))
check('string gecached', 'AB', upper('ab'))
check('ein Aufruf fuer string', 1, upperCalls)

let zeroCalls = 0
const zero = memoize((): number => {
  zeroCalls++
  return 0
})
zero()
zero()
check('falsy Ergebnis gecached', 1, zeroCalls)

let voidCalls = 0
const nothing = memoize((): undefined => {
  voidCalls++
  return undefined
})
nothing()
nothing()
check('undefined Ergebnis gecached', 1, voidCalls)

let otherCalls = 0
const other = memoize((n: number): number => {
  otherCalls++
  return n
})
other(1)
check('eigener Cache pro memoize', 1, otherCalls)
check('add-Cache unberuehrt', 3, addCalls)`,
    },
  ],
}

export default chapter
