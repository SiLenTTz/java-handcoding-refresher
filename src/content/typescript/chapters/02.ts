import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    { id: 'f1', front: 'Warum liefert `[10, 9, 100].sort()` das Ergebnis `[10, 100, 9]`?', back: '`sort` wandelt ohne Comparator jedes Element in einen String um und vergleicht lexikografisch. Für Zahlen immer `sort((a, b) => a - b)` angeben.' },
    { id: 'f2', front: 'Welche Array-Methoden mutieren – welche nicht?', back: '**Mutierend:** `push`, `pop`, `splice`, `sort`, `reverse`, `fill`.\n**Neu:** `map`, `filter`, `flatMap`, `slice`, `concat`, `toSorted`, `toReversed`, `with`.' },
    { id: 'f3', front: 'Wie sortierst du ohne die Quelle zu verändern?', back: '```ts\nconst sorted = [...items].sort(cmp)\nconst modern = items.toSorted(cmp) // ES2023\n```\nParameter als `readonly T[]` annotieren – dann meldet der Compiler versehentliches `sort`.' },
    { id: 'f4', front: 'Was liefert `find` – und was ist die Falle?', back: '`T | undefined`. Mit `strictNullChecks` musst du das Ergebnis prüfen, bevor du darauf zugreifst: `const u = users.find(...); if (!u) throw new Error(...)`.' },
    { id: 'f5', front: '`some` und `every` auf einem **leeren** Array?', back: '`some` → `false`, `every` → `true` (vacuous truth). Beide brechen beim ersten entscheidenden Element ab.' },
    { id: 'f6', front: 'Warum braucht `reduce` einen Startwert?', back: 'Ohne Startwert wirft `reduce` auf leeren Arrays einen `TypeError` und der Akkumulator-Typ wird auf den Elementtyp festgenagelt. Mit Startwert (und ggf. `reduce<Acc>(...)`) ist beides gelöst.' },
    { id: 'f7', front: 'Wozu `flatMap`?', back: 'Map und ein Level Flach-Machen in einem Durchlauf: `posts.flatMap((p) => p.tags)`. Ein leeres Array als Rückgabe filtert Elemente weg – "map + filter" in einem Schritt.' },
    { id: 'f8', front: 'Sortieren nach zwei Kriterien?', back: '```ts\nitems.toSorted((a, b) =>\n  b.score - a.score || a.name.localeCompare(b.name))\n```\nDer `||`-Trick funktioniert, weil `0` (= gleich) falsy ist.' },
    { id: 'f9', front: 'Wie erzeugst du `[0, 1, 2, 3, 4]`?', back: '`Array.from({ length: 5 }, (_, i) => i)`. `new Array(5).map(...)` funktioniert **nicht** – ein Sparse Array hat keine Elemente, über die `map` laufen könnte.' },
    { id: 'f10', front: 'Was ist ein Tupel – und wann nutzt du es?', back: 'Ein positionsgetyptes Array fester Länge: `const pair: [string, number] = ["age", 42]`. Nützlich für `Object.entries`, `useState`-ähnliche Rückgaben und Koordinaten. Benannt lesbarer: `[key: string, value: number]`.' },
    { id: 'f11', front: '`includes` vs. `indexOf`?', back: '`includes` liefert `boolean` und findet auch `NaN` (SameValueZero). `indexOf` liefert die Position oder `-1` und findet `NaN` nie (strikte Gleichheit). Für "ist drin?" immer `includes`.' },
    { id: 'f12', front: 'Was bedeutet `readonly number[]` zur Laufzeit?', back: 'Gar nichts – es ist rein statisch. Der Compiler verbietet `push`/`sort`, aber das Objekt ist ein normales Array. Echtes Einfrieren: `Object.freeze(arr)`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `console.log([10, 9, 100].sort())`,
      options: ['`[9, 10, 100]`', '`[10, 100, 9]`', '`[100, 10, 9]`', '`[10, 9, 100]`'],
      correct: 1,
      explanation: 'Ohne Comparator vergleicht `sort` die String-Repräsentationen: `"10" < "100" < "9"`. Für Zahlen immer `sort((a, b) => a - b)`.',
    },
    {
      id: 'q2',
      prompt: 'Welchen Typ hat `result`?',
      code: `const result = users.map((user) => {
  if (user.active) return user.name
})`,
      options: ['`string[]`', '`(string | undefined)[]`', '`string[] | undefined`', '`void[]`'],
      correct: 1,
      explanation: 'Ein `if` ohne `else` liefert implizit `undefined`. `map` behält die Länge – die Löcher bleiben drin. Korrekt: erst `filter`, dann `map`.',
    },
    {
      id: 'q3',
      prompt: 'Warum kompiliert das nicht?',
      code: `const names: string[] = ['Tom', 'Anna']
names.sort((a, b) => a - b)`,
      options: [
        '`sort` erwartet genau ein Argument',
        'Der Comparator muss `boolean` zurückgeben',
        'Arithmetik mit `-` ist auf `string` nicht erlaubt – für Strings `localeCompare` nutzen',
        '`names` ist `readonly`',
      ],
      correct: 2,
      explanation: '`a - b` funktioniert nur für Zahlen. Strings vergleicht man mit `a.localeCompare(b)` – das berücksichtigt auch Umlaute korrekt.',
    },
    {
      id: 'q4',
      prompt: 'Was passiert hier?',
      code: `const values: number[] = []
console.log(values.reduce((sum, v) => sum + v))`,
      options: ['`0`', '`undefined`', '`NaN`', '`TypeError: Reduce of empty array with no initial value`'],
      correct: 3,
      explanation: 'Ohne Startwert nimmt `reduce` das erste Element als Startwert – bei leerem Array gibt es keins. `reduce((sum, v) => sum + v, 0)` löst beides.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`function sorted(items: User[]) { return items.sort(byName) }`',
        '`function sorted(items: readonly User[]) { return [...items].sort(byName) }`',
        '`function sorted(items: User[]) { items.sort(byName); return items }`',
        '`function sorted(items: User[]) { const c = items; c.sort(byName); return c }`',
      ],
      correct: 1,
      explanation: 'Nur Variante 2 lässt die Eingabe unangetastet. Variante 4 ist besonders tückisch: `const c = items` kopiert nur die Referenz.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `const empty: number[] = []
console.log(empty.every((n) => n > 100), empty.some((n) => n > 0))`,
      options: ['`true false`', '`false true`', '`false false`', '`true true`'],
      correct: 0,
      explanation: 'Für die leere Menge gilt jede Allaussage (`every` → `true`), aber keine Existenzaussage (`some` → `false`).',
    },
    {
      id: 'q7',
      prompt: 'Was wird ausgegeben?',
      code: `const input = ['1', 'x', '2']
console.log(input.flatMap((s) => (Number.isNaN(Number(s)) ? [] : [Number(s)])))`,
      options: ['`[1, NaN, 2]`', '`[1, 2]`', '`[[1], [], [2]]`', '`["1", "2"]`'],
      correct: 1,
      explanation: 'Ein leeres Array als Rückgabe entfernt das Element. So wird `flatMap` zu "map + filter" in einem Durchlauf.',
    },
    {
      id: 'q8',
      prompt: 'Was wird ausgegeben?',
      code: `const values = [1, NaN, 3]
console.log(values.includes(NaN), values.indexOf(NaN))`,
      options: ['`true 1`', '`true -1`', '`false -1`', '`false 1`'],
      correct: 1,
      explanation: '`includes` nutzt SameValueZero und findet `NaN`. `indexOf` nutzt strikte Gleichheit, und `NaN === NaN` ist `false` – deshalb `-1`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Gerade Zahlen quadrieren',
      level: 1,
      description: `Implementiere \`evenSquares(numbers: readonly number[]): number[]\`.

Nimm alle **geraden** Zahlen (auch \`0\` und negative) und gib ihre Quadrate in der ursprünglichen Reihenfolge zurück. Die Eingabe darf nicht verändert werden.

Nutze \`filter\` und \`map\` – keine Schleife, kein \`push\`.`,
      starter: `function evenSquares(numbers: readonly number[]): number[] {
  // TODO
  return []
}`,
      solution: `function evenSquares(numbers: readonly number[]): number[] {
  return numbers.filter((n) => n % 2 === 0).map((n) => n * n)
}`,
      hints: [
        'Erst aussortieren, dann umrechnen – die Reihenfolge der Kette entscheidet über den Elementtyp jeder Stufe.',
        '`filter(predicate)` behält Elemente, `map(fn)` transformiert sie. Beide liefern neue Arrays.',
        'numbers → filter(gerade) → map(quadrat)',
        '`return numbers.filter((n) => n % 2 === 0).map((n) => n * n)`',
      ],
      tests: `const input = [1, 2, 3, 4]
check('gemischt', [4, 16], evenSquares(input))
check('Eingabe unveraendert', [1, 2, 3, 4], input)
check('leer', [], evenSquares([]))
check('nur ungerade', [], evenSquares([1, 3, 5]))
check('null ist gerade', [0], evenSquares([0, 1]))
check('negative', [4, 16], evenSquares([-2, -1, -4]))`,
    },
    {
      id: 'k2',
      title: 'Top-N ohne Mutation',
      level: 2,
      description: `Implementiere \`topNames(entries: readonly Entry[], count: number): string[]\`.

- sortiere nach \`score\` **absteigend**
- bei Gleichstand nach \`name\` aufsteigend (\`localeCompare\`)
- gib die ersten \`count\` Namen zurück
- die übergebene Liste darf **nicht** verändert werden
- \`count <= 0\` → leeres Array, \`count\` größer als die Liste → alle Namen`,
      given: `interface Entry {
  name: string
  score: number
}`,
      starter: `function topNames(entries: readonly Entry[], count: number): string[] {
  // TODO
  return []
}`,
      solution: `function topNames(entries: readonly Entry[], count: number): string[] {
  if (count <= 0) return []
  return [...entries]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, count)
    .map((entry) => entry.name)
}`,
      hints: [
        '`sort` mutiert – bei einem `readonly`-Parameter musst du also zuerst kopieren.',
        'Kopieren mit `[...entries]` (oder `entries.toSorted(...)`), abschneiden mit `slice(0, count)`.',
        'Kopie → sort(score absteigend, dann Name) → slice(0, count) → map(name)',
        'Comparator: `(a, b) => b.score - a.score || a.name.localeCompare(b.name)` – die `0` bei Gleichstand ist falsy, also greift das zweite Kriterium.',
      ],
      tests: `const entries: Entry[] = [
  { name: 'Tom', score: 30 },
  { name: 'Anna', score: 50 },
  { name: 'Ben', score: 30 },
  { name: 'Lea', score: 70 },
]
const namesBefore = entries.map((e) => e.name)

check('top 2', ['Lea', 'Anna'], topNames(entries, 2))
check('Gleichstand alphabetisch', ['Lea', 'Anna', 'Ben', 'Tom'], topNames(entries, 4))
check('Eingabe unveraendert', namesBefore, entries.map((e) => e.name))
check('count groesser als Liste', ['Lea', 'Anna', 'Ben', 'Tom'], topNames(entries, 99))
check('count 0', [], topNames(entries, 0))
check('count negativ', [], topNames(entries, -1))
check('leere Liste', [], topNames([], 3))`,
    },
    {
      id: 'k3',
      title: 'Tag-Wolke aus Blogposts',
      level: 3,
      description: `Implementiere \`allTags(posts: readonly Post[]): string[]\`.

Sammle alle Tags aller Posts und normalisiere sie:

1. \`trim()\` und \`toLowerCase()\`
2. leere Tags (nach dem Trimmen) verwerfen
3. Duplikate entfernen
4. alphabetisch aufsteigend sortieren

Nutze \`flatMap\`. Für die Duplikate reicht hier \`filter\` mit \`indexOf\` – ein \`Set\` kommt in Kapitel 03.`,
      given: `interface Post {
  title: string
  tags: readonly string[]
}`,
      starter: `function allTags(posts: readonly Post[]): string[] {
  // TODO
  return []
}`,
      solution: `function allTags(posts: readonly Post[]): string[] {
  return posts
    .flatMap((post) => post.tags)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .sort((a, b) => a.localeCompare(b))
}`,
      hints: [
        'Jeder Post hat ein Array von Tags – aus `Post[]` soll ein flaches `string[]` werden.',
        '`flatMap` macht map und ein Level flach in einem Schritt. Danach ganz normal `map`, `filter`, `sort`.',
        'flatMap(tags) → map(trim+lowercase) → filter(nicht leer) → filter(erstes Vorkommen) → sort',
        'Dedupe-Trick: `.filter((tag, index, all) => all.indexOf(tag) === index)` behält nur das erste Vorkommen.',
      ],
      tests: `const posts: Post[] = [
  { title: 'A', tags: ['TypeScript', ' node ', 'ts'] },
  { title: 'B', tags: ['ts', 'TYPESCRIPT', '  '] },
  { title: 'C', tags: [] },
]

check('normalisiert und sortiert', ['node', 'ts', 'typescript'], allTags(posts))
check('leere Liste', [], allTags([]))
check('nur leere Tags', [], allTags([{ title: 'X', tags: ['', '   '] }]))
check('ein Post', ['a', 'b'], allTags([{ title: 'Y', tags: ['b', 'A'] }]))
check('alles doppelt', ['x'], allTags([{ title: 'Z', tags: ['x', 'X', ' x '] }]))
checkTrue('Ergebnis ist ein Array', Array.isArray(allTags(posts)))`,
    },
    {
      id: 'k4',
      title: 'Gleitender Mittelwert',
      level: 4,
      description: `Implementiere \`movingAverage(values: readonly number[], window: number): number[]\`.

Für jedes Fenster der Breite \`window\` wird der Mittelwert berechnet:

\`\`\`text
movingAverage([1, 2, 3, 4], 2) → [1.5, 2.5, 3.5]
\`\`\`

Regeln:

- \`window\` muss eine ganze Zahl \`>= 1\` sein, sonst \`RangeError\` mit Nachricht \`ungueltiges Fenster\`
- ist \`window\` größer als die Liste → leeres Array
- die Eingabe darf nicht verändert werden

Tipp: \`Array.from({ length: n }, (_, i) => ...)\` plus \`slice\` und \`reduce\`.`,
      starter: `function movingAverage(values: readonly number[], window: number): number[] {
  // TODO
  return []
}`,
      solution: `function movingAverage(values: readonly number[], window: number): number[] {
  if (!Number.isInteger(window) || window < 1) {
    throw new RangeError('ungueltiges Fenster')
  }
  const count = values.length - window + 1
  if (count <= 0) return []

  return Array.from({ length: count }, (_, start) => {
    const slice = values.slice(start, start + window)
    return slice.reduce((sum, value) => sum + value, 0) / window
  })
}`,
      hints: [
        'Erst die Vorbedingungen prüfen und werfen, danach rechnen. Wie viele Fenster passen in eine Liste der Länge n?',
        '`Number.isInteger` für die Validierung, `values.length - window + 1` für die Anzahl der Fenster, `slice(start, start + window)` für ein Fenster.',
        'validieren → count berechnen → bei count <= 0 leeres Array → Array.from mit Index als Startposition → slice → reduce/window',
        '`return Array.from({ length: count }, (_, start) => values.slice(start, start + window).reduce((s, v) => s + v, 0) / window)`',
      ],
      tests: `const input = [1, 2, 3, 4]

check('fenster 2', [1.5, 2.5, 3.5], movingAverage(input, 2))
check('Eingabe unveraendert', [1, 2, 3, 4], input)
check('fenster 1 kopiert', [1, 2, 3], movingAverage([1, 2, 3], 1))
check('fenster gleich Laenge', [2], movingAverage([1, 2, 3], 3))
check('fenster zu gross', [], movingAverage([1, 2], 3))
check('leere Liste', [], movingAverage([], 1))
check('negative Werte', [-1, 0], movingAverage([-2, 0, 0], 2))
checkThrows('fenster 0', RangeError, () => movingAverage([1, 2], 0))
checkThrows('fenster negativ', 'ungueltiges Fenster', () => movingAverage([1, 2], -3))
checkThrows('fenster kommazahl', RangeError, () => movingAverage([1, 2], 1.5))`,
    },
  ],
}

export default chapter
