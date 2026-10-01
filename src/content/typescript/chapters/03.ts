import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    { id: 'f1', front: 'Wann `Map`, wann ein Objekt?', back: '**Map**: dynamische, wachsende Schlüssel, beliebige Key-Typen, garantierte Einfügereihenfolge, ehrliches `size`, keine Prototyp-Kollisionen.\n**Objekt/`Record`**: feste oder flache String-Keys, JSON-serialisierbar, kürzere Syntax.' },
    { id: 'f2', front: 'Welchen Typ liefert `Object.keys(obj)`?', back: 'Immer `string[]` – nie die enge Key-Union. Grund: Zur Laufzeit kann ein Objekt mehr Felder haben, als sein Typ verspricht (Structural Typing). Enger wird es nur per Behauptung: `Object.keys(o) as (keyof typeof o)[]`.' },
    { id: 'f3', front: 'Das Standardmuster zum Gruppieren?', back: '```ts\nconst bucket = map.get(key) ?? []\nbucket.push(item)\nmap.set(key, bucket)\n```\nBeim Zählen analog: `record[key] = (record[key] ?? 0) + 1`.' },
    { id: 'f4', front: 'Warum findet `set.has({ id: 1 })` nichts, obwohl `{ id: 1 }` drinsteht?', back: '`Set`/`Map` vergleichen mit SameValueZero, bei Objekten also per **Referenz**. Zwei gleich aussehende Literale sind zwei verschiedene Objekte. Lösung: primitive Keys speichern (`set.add(user.id)`).' },
    { id: 'f5', front: 'Unterschied `email?: string` und `email: string | undefined`?', back: '`email?` darf **fehlen** – taucht dann nicht in `Object.keys` auf. `email: string | undefined` muss gesetzt sein, darf aber `undefined` enthalten. Bei DTOs und Patch-Requests ein wichtiger Unterschied.' },
    { id: 'f6', front: 'Was ist an `Record<string, V>` gefährlich?', back: 'TypeScript behauptet, jeder Zugriff liefere ein `V` – auch bei nicht existierenden Keys. Mit `"noUncheckedIndexedAccess": true` wird daraus korrekt `V | undefined`.' },
    { id: 'f7', front: 'Wie kopierst du ein Objekt flach, wie tief?', back: 'Flach: `{ ...obj }` oder `Object.assign({}, obj)` – verschachtelte Objekte bleiben geteilt.\nTief: `structuredClone(obj)` – kann auch `Map`, `Set`, `Date` und Zyklen (im Gegensatz zu `JSON.parse(JSON.stringify(...))`).' },
    { id: 'f8', front: '`??` oder `||` für Defaults?', back: '`??` – es greift nur bei `null`/`undefined`. `||` greift auch bei `0`, `""` und `false` und macht aus gültigen Werten stillschweigend Defaults.' },
    { id: 'f9', front: 'Was macht Optional Chaining genau?', back: '`a?.b.c` bricht die **gesamte** Kette ab und liefert `undefined`, sobald `a` `null`/`undefined` ist. Auch für Aufrufe (`fn?.()`) und Indexzugriffe (`arr?.[0]`).' },
    { id: 'f10', front: 'Lookup-Tabelle aus einer Liste bauen?', back: '```ts\nconst byId = new Map(users.map((u) => [u.id, u]))\n```\n`Map.get` ist O(1) – deutlich besser als `find` in einer Schleife (O(n²)).' },
    { id: 'f11', front: 'Warum ist `JSON.stringify(new Map([["a", 1]]))` gleich `{}`?', back: 'Maps haben keine eigenen enumerable Properties. Vor dem Serialisieren umwandeln: `Object.fromEntries(map)` oder `[...map]`.' },
    { id: 'f12', front: 'Warum `for…of` mit `Object.entries` statt `for…in`?', back: '`for…in` iteriert Schlüssel als Strings und läuft auch über geerbte Properties der Prototypenkette. `for (const [k, v] of Object.entries(o))` ist typsicher und liefert Schlüssel **und** Wert.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Typ hat `keys`?',
      code: `const scores = { jan: 3, anna: 5 }
const keys = Object.keys(scores)`,
      options: ['`("jan" | "anna")[]`', '`string[]`', '`keyof typeof scores`', '`(string | number)[]`'],
      correct: 1,
      explanation: '`Object.keys` liefert immer `string[]`. Wegen Structural Typing kann ein Objekt zur Laufzeit mehr Felder haben, als sein Typ verspricht – eine engere Signatur wäre unsicher.',
    },
    {
      id: 'q2',
      prompt: 'Was wird ausgegeben?',
      code: `const order = { id: 1, address: { city: 'Hamburg' } }
const copy = { ...order }
copy.address.city = 'Berlin'
console.log(order.address.city)`,
      options: ['`Hamburg`', '`Berlin`', '`undefined`', 'TypeError'],
      correct: 1,
      explanation: 'Spread kopiert flach: `copy.address` und `order.address` zeigen auf dasselbe Objekt. Für eine echte Tiefenkopie `structuredClone(order)`.',
    },
    {
      id: 'q3',
      prompt: 'Warum kompiliert das nicht?',
      code: `const groups = new Map<string, string[]>()
const bucket = groups.get('a')
bucket.push('x')`,
      options: [
        '`Map` hat keine Methode `get`',
        '`bucket` ist `string[] | undefined` – der fehlende Key muss behandelt werden',
        '`push` gibt es auf `readonly string[]` nicht',
        '`groups` müsste `const` sein',
      ],
      correct: 1,
      explanation: '`Map.get` liefert immer `V | undefined`. Das Standardmuster: `const bucket = groups.get("a") ?? []` und anschließend wieder `groups.set("a", bucket)`.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `const seen = new Set<{ id: number }>()
seen.add({ id: 1 })
console.log(seen.has({ id: 1 }), seen.size)`,
      options: ['`true 1`', '`false 1`', '`true 2`', '`false 2`'],
      correct: 1,
      explanation: 'Sets vergleichen Objekte per Referenz. Das zweite Literal ist ein anderes Objekt → `has` ist `false`, die Größe bleibt `1`. Besser primitive Keys speichern.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`counts[city]++`',
        '`counts[city] = counts[city] ? counts[city] + 1 : 1`',
        '`counts[city] = (counts[city] ?? 0) + 1`',
        '`if (!counts[city]) counts[city] = 0; counts[city] += 1`',
      ],
      correct: 2,
      explanation: 'Variante 1 ergibt beim ersten Mal `NaN`. Variante 2 und 4 verlassen sich auf Truthiness und brechen, sobald `0` ein gültiger Zwischenwert wäre. `?? 0` trifft genau den Fall "noch nicht vorhanden".',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `const config = { retries: 0, host: '' }
console.log(config.retries || 3, config.host ?? 'localhost')`,
      options: ['`0 localhost`', '`3 localhost`', '`0 `', '`3 `'],
      correct: 3,
      explanation: '`||` greift bei jedem falsy-Wert, also auch bei `0` → `3`. `??` greift nur bei `null`/`undefined`, der leere String bleibt erhalten.',
    },
    {
      id: 'q7',
      prompt: 'Was wird ausgegeben?',
      code: `const ages = new Map([['jan', 42]])
console.log(JSON.stringify(ages))`,
      options: ['`{"jan":42}`', '`[["jan",42]]`', '`{}`', '`null`'],
      correct: 2,
      explanation: 'Eine Map hat keine eigenen enumerable Properties. Vor dem Serialisieren umwandeln: `JSON.stringify(Object.fromEntries(ages))`.',
    },
    {
      id: 'q8',
      prompt: 'Welchen Typ hat `entries`?',
      code: `const scores = { jan: 3, anna: 5 }
const entries = Object.entries(scores)`,
      options: ['`[string, number]`', '`[string, number][]`', '`Record<string, number>`', '`Map<string, number>`'],
      correct: 1,
      explanation: '`Object.entries` liefert ein Array von Tupeln `[string, number][]` – ideal für `for (const [key, value] of ...)` oder `new Map(entries)`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Produkte pro Kategorie zählen',
      level: 1,
      description: `Implementiere \`countByCategory(products: readonly Product[]): Record<string, number>\`.

Zähle, wie viele Produkte es pro \`category\` gibt. Kategorien ohne Produkte tauchen nicht auf, eine leere Liste ergibt \`{}\`.

Nutze das Muster \`record[key] = (record[key] ?? 0) + 1\`.`,
      given: `interface Product {
  name: string
  category: string
}`,
      starter: `function countByCategory(products: readonly Product[]): Record<string, number> {
  // TODO
  return {}
}`,
      solution: `function countByCategory(products: readonly Product[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const product of products) {
    counts[product.category] = (counts[product.category] ?? 0) + 1
  }
  return counts
}`,
      hints: [
        'Ein Zähler braucht einen Startwert – aber erst beim ersten Auftreten eines Schlüssels.',
        '`counts[key] ?? 0` liefert den bisherigen Stand oder `0`. `for…of` über die Produkte reicht völlig.',
        'leeres Record anlegen → über Produkte laufen → counts[category] = (counts[category] ?? 0) + 1 → zurückgeben',
        '`const counts: Record<string, number> = {}` als erste Zeile – die Annotation ist nötig, sonst wird der Typ zu `{}`.',
      ],
      tests: `const products: Product[] = [
  { name: 'Tastatur', category: 'Input' },
  { name: 'Maus', category: 'Input' },
  { name: 'Monitor', category: 'Display' },
]

check('zaehlt korrekt', { Input: 2, Display: 1 }, countByCategory(products))
check('leere Liste', {}, countByCategory([]))
check('ein Produkt', { Kabel: 1 }, countByCategory([{ name: 'HDMI', category: 'Kabel' }]))
check('alles gleiche Kategorie', { X: 3 }, countByCategory([
  { name: 'a', category: 'X' },
  { name: 'b', category: 'X' },
  { name: 'c', category: 'X' },
]))
check('leerer Kategoriename', { '': 1 }, countByCategory([{ name: 'a', category: '' }]))`,
    },
    {
      id: 'k2',
      title: 'Namen nach Anfangsbuchstaben gruppieren',
      level: 2,
      description: `Implementiere \`groupByInitial(names: readonly string[]): Map<string, string[]>\`.

- Schlüssel ist der erste Buchstabe in **Großschreibung**
- leere Strings werden übersprungen
- innerhalb einer Gruppe bleibt die Eingabereihenfolge erhalten
- die Namen selbst werden **nicht** verändert

Nutze eine \`Map\` und das Muster \`map.get(key) ?? []\`.`,
      starter: `function groupByInitial(names: readonly string[]): Map<string, string[]> {
  // TODO
  return new Map()
}`,
      solution: `function groupByInitial(names: readonly string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const name of names) {
    if (name.length === 0) continue
    const initial = name[0].toUpperCase()
    const bucket = groups.get(initial) ?? []
    bucket.push(name)
    groups.set(initial, bucket)
  }
  return groups
}`,
      hints: [
        'Gruppieren heißt: Für jeden Schlüssel gibt es eine Liste, die beim ersten Treffer angelegt wird.',
        '`map.get(key) ?? []` liefert die vorhandene oder eine frische Liste. Danach `push` und `map.set(key, bucket)`.',
        'über names laufen → leere überspringen → initial = name[0].toUpperCase() → bucket holen oder anlegen → push → set',
        '`const bucket = groups.get(initial) ?? []` – danach `bucket.push(name)` und `groups.set(initial, bucket)`.',
      ],
      tests: `const result = groupByInitial(['anna', 'Ben', 'Alex', '', 'bea'])

check('gruppen', new Map([['A', ['anna', 'Alex']], ['B', ['Ben', 'bea']]]), result)
check('anzahl gruppen', 2, result.size)
check('reihenfolge der keys', ['A', 'B'], [...result.keys()])
check('originale Schreibweise bleibt', ['anna', 'Alex'], result.get('A'))
check('leere Liste', new Map(), groupByInitial([]))
check('nur leere Strings', new Map(), groupByInitial(['', '']))
check('unbekannter key', undefined, result.get('Z'))`,
    },
    {
      id: 'k3',
      title: 'Konfiguration zusammenführen',
      level: 3,
      description: `Implementiere \`applyOverrides(defaults: Settings, overrides: SettingsOverrides): Settings\`.

Regeln:

- Für jedes Feld gilt der Wert aus \`overrides\`, **außer** er ist \`undefined\` – dann bleibt der Default.
- \`0\`, \`""\` und \`false\` sind gültige Werte und müssen übernommen werden (also \`??\`, nicht \`||\`).
- Das Ergebnis ist ein **neues** Objekt; \`defaults\` bleibt unverändert.`,
      given: `interface Settings {
  readonly host: string
  readonly port: number
  readonly debug: boolean
  readonly tags: readonly string[]
}

interface SettingsOverrides {
  readonly host?: string
  readonly port?: number
  readonly debug?: boolean
  readonly tags?: readonly string[]
}`,
      starter: `function applyOverrides(defaults: Settings, overrides: SettingsOverrides): Settings {
  // TODO
  return defaults
}`,
      solution: `function applyOverrides(defaults: Settings, overrides: SettingsOverrides): Settings {
  return {
    host: overrides.host ?? defaults.host,
    port: overrides.port ?? defaults.port,
    debug: overrides.debug ?? defaults.debug,
    tags: overrides.tags ?? defaults.tags,
  }
}`,
      hints: [
        'Ein einfaches `{ ...defaults, ...overrides }` reicht nicht: Ein explizit gesetztes `undefined` würde den Default überschreiben.',
        '`??` liefert die linke Seite, außer sie ist `null`/`undefined`. Genau das brauchst du pro Feld.',
        'neues Objektliteral bauen, jedes Feld als `overrides.x ?? defaults.x`',
        '`return { host: overrides.host ?? defaults.host, port: overrides.port ?? defaults.port, ... }`',
      ],
      tests: `const base: Settings = { host: 'localhost', port: 8080, debug: false, tags: ['default'] }

check('ohne overrides', base, applyOverrides(base, {}))
check('port und debug', { host: 'localhost', port: 9000, debug: true, tags: ['default'] }, applyOverrides(base, { port: 9000, debug: true }))
check('port 0 wird uebernommen', 0, applyOverrides(base, { port: 0 }).port)
check('leerer host wird uebernommen', '', applyOverrides(base, { host: '' }).host)
check('explizites undefined ignoriert', 8080, applyOverrides(base, { port: undefined }).port)
check('tags ersetzt', ['a', 'b'], applyOverrides(base, { tags: ['a', 'b'] }).tags)
checkTrue('neues Objekt', applyOverrides(base, {}) !== base)
check('defaults unveraendert', { host: 'localhost', port: 8080, debug: false, tags: ['default'] }, base)`,
    },
    {
      id: 'k4',
      title: 'Tag-Index mit Map und Set',
      level: 4,
      description: `Baue einen invertierten Index über Dokumente.

1. \`tagIndex(docs: readonly Doc[]): Map<string, Set<string>>\`
   - Schlüssel ist der Tag, getrimmt und kleingeschrieben; leere Tags werden übersprungen
   - Wert ist das \`Set\` der Dokument-IDs mit diesem Tag
   - die Schlüssel stehen in der Reihenfolge ihres ersten Auftretens

2. \`docsWithAllTags(index: Map<string, Set<string>>, tags: readonly string[]): string[]\`
   - liefert die IDs der Dokumente, die **alle** gesuchten Tags tragen (gleiche Normalisierung)
   - Ergebnis alphabetisch aufsteigend sortiert
   - ist die Tag-Liste leer oder ein Tag unbekannt → leeres Array`,
      given: `interface Doc {
  id: string
  tags: readonly string[]
}`,
      starter: `function tagIndex(docs: readonly Doc[]): Map<string, Set<string>> {
  // TODO
  return new Map()
}

function docsWithAllTags(index: Map<string, Set<string>>, tags: readonly string[]): string[] {
  // TODO
  return []
}`,
      solution: `function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}

function tagIndex(docs: readonly Doc[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>()
  for (const doc of docs) {
    for (const rawTag of doc.tags) {
      const tag = normalizeTag(rawTag)
      if (tag.length === 0) continue
      const ids = index.get(tag) ?? new Set<string>()
      ids.add(doc.id)
      index.set(tag, ids)
    }
  }
  return index
}

function docsWithAllTags(index: Map<string, Set<string>>, tags: readonly string[]): string[] {
  const wanted = tags.map(normalizeTag).filter((tag) => tag.length > 0)
  if (wanted.length === 0) return []

  const buckets: Set<string>[] = []
  for (const tag of wanted) {
    const ids = index.get(tag)
    if (ids === undefined) return []
    buckets.push(ids)
  }

  const [first, ...rest] = buckets
  return [...first]
    .filter((id) => rest.every((bucket) => bucket.has(id)))
    .sort((a, b) => a.localeCompare(b))
}`,
      hints: [
        'Ein invertierter Index dreht die Richtung um: statt "Dokument → Tags" speicherst du "Tag → Menge von Dokumenten". Für Mengen ist `Set` die richtige Struktur.',
        'Zwei verschachtelte `for…of`. Pro Tag: `index.get(tag) ?? new Set<string>()`, dann `ids.add(doc.id)` und `index.set(tag, ids)`.',
        'docsWithAllTags: Tags normalisieren und leere wegwerfen → für jeden Tag das Set holen (fehlt eines, sofort `[]`) → vom ersten Set ausgehen und mit `every(bucket => bucket.has(id))` schneiden → sortieren.',
        '`const [first, ...rest] = buckets` und dann `[...first].filter((id) => rest.every((b) => b.has(id))).sort((a, b) => a.localeCompare(b))`.',
      ],
      tests: `const docs: Doc[] = [
  { id: 'd1', tags: ['TS', ' node '] },
  { id: 'd2', tags: ['ts', '   '] },
  { id: 'd3', tags: ['node', 'react'] },
]
const index = tagIndex(docs)

check('anzahl tags', 3, index.size)
check('reihenfolge der keys', ['ts', 'node', 'react'], [...index.keys()])
check('ids fuer ts', new Set(['d1', 'd2']), index.get('ts'))
check('ids fuer node', new Set(['d1', 'd3']), index.get('node'))
check('unbekannter tag', undefined, index.get('vue'))
check('leere docs', new Map(), tagIndex([]))
check('kompletter index', new Map([
  ['ts', new Set(['d1', 'd2'])],
  ['node', new Set(['d1', 'd3'])],
  ['react', new Set(['d3'])],
]), index)
check('beide tags', ['d1'], docsWithAllTags(index, ['ts', 'NODE']))
check('ein tag sortiert', ['d1', 'd2'], docsWithAllTags(index, [' Ts ']))
check('unbekannter tag in Kombination', [], docsWithAllTags(index, ['ts', 'vue']))
check('leere Tagliste', [], docsWithAllTags(index, []))
check('nur leere Tags', [], docsWithAllTags(index, ['  ']))`,
    },
  ],
}

export default chapter
