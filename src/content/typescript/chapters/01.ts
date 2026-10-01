import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    { id: 'f1', front: 'Warum `unknown` statt `any`?', back: '`any` schaltet die Typprüfung ab und verseucht jeden Folgeausdruck. `unknown` akzeptiert ebenfalls alles, erzwingt aber **vor** der Benutzung ein Narrowing (`typeof`, Guard). Regel: An Systemgrenzen (`JSON.parse`, `fetch`) immer `unknown`.' },
    { id: 'f2', front: 'Welche fünf Narrowing-Werkzeuge gibt es zur Laufzeit?', back: '`typeof x === "string"`, `x instanceof Date`, `"email" in contact`, `Array.isArray(x)` und exakte Vergleiche (`x === null`). Zusätzlich Truthiness (`if (x)`) – die aber `0` und `""` verschluckt.' },
    { id: 'f3', front: 'Was macht ein Type Guard mit `value is T`?', back: 'Er meldet dem Compiler das Ergebnis der Laufzeitprüfung zurück.\n```ts\nfunction isUser(v: unknown): v is User {\n  return typeof v === "object" && v !== null && "id" in v\n}\n```\nOhne das Prädikat (`: boolean`) narrowt beim Aufrufer nichts.' },
    { id: 'f4', front: 'Was bewirkt `as const`?', back: 'Es verhindert das Weiten zu `string`/`number` und macht alles `readonly`.\n```ts\nconst roles = ["admin", "user"] as const\ntype Role = (typeof roles)[number] // "admin" | "user"\n```' },
    { id: 'f5', front: 'Warum hat `const name = "Jan"` den Typ `"Jan"`, `let city = "Berlin"` aber `string`?', back: 'Eine `const`-Bindung kann nie neu zugewiesen werden, also ist der Literal-Typ sicher. Bei `let` weitet TypeScript zum Basistyp, damit spätere Zuweisungen möglich bleiben.' },
    { id: 'f6', front: '`type` oder `interface` – wann was?', back: '`interface` für Objekt- und Klassenverträge (erweiterbar, Declaration Merging). `type` für Unions, Tupel, Primitiv-Aliase und Funktionstypen. Wichtiger als die Wahl ist Konsistenz im Projekt.' },
    { id: 'f7', front: 'Warum ist `if (typeof x === "object") x.name` unsicher?', back: '`typeof null === "object"` – der klassische JS-Bug. Korrekt: `if (typeof x === "object" && x !== null)`. Für Arrays zusätzlich `Array.isArray(x)` prüfen.' },
    { id: 'f8', front: 'Unterschied `??` und `||`?', back: '`??` greift nur bei `null`/`undefined`, `||` bei jedem falsy-Wert. Bei `0`, `""` oder `false` als gültigen Werten liefert `||` falsche Ergebnisse: `config.retries || 3` macht aus `0` eine `3`.' },
    { id: 'f9', front: 'Was macht `strictNullChecks`?', back: '`null` und `undefined` sind nicht mehr implizit Teil jedes Typs. `string | undefined` muss vor der Benutzung behandelt werden. Teil von `"strict": true` – die wertvollste Einstellung überhaupt.' },
    { id: 'f10', front: 'Was ist der Unterschied zwischen `as` und einem Type Guard?', back: '`as` ist eine **Behauptung** ohne Laufzeitprüfung – wenn du dich irrst, knallt es später an unerwarteter Stelle. Ein Type Guard prüft wirklich und narrowt danach typsicher.' },
    { id: 'f11', front: 'Was bedeutet Structural Typing?', back: 'Kompatibilität entscheidet die **Form**, nicht der Name. Ein Objekt `{ id: 1, name: "Jan" }` erfüllt `interface User { id: number; name: string }` ohne `implements`. Gegenteil: nominales Typsystem (Java, C#).' },
    { id: 'f12', front: 'Was macht `readonly` – und was nicht?', back: 'Es verbietet Schreibzugriffe **zur Compile-Zeit** (`readonly id: number`, `readonly string[]`). Zur Laufzeit ändert sich nichts; echtes Einfrieren macht `Object.freeze`.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Typ hat `Role`?',
      code: `const roles = ['admin', 'user'] as const
type Role = (typeof roles)[number]`,
      options: ['`string`', '`string[]`', '`"admin" | "user"`', '`readonly ["admin", "user"]`'],
      correct: 2,
      explanation: '`as const` erzeugt `readonly ["admin", "user"]`. Der Indexed Access mit `[number]` liefert die Union aller Elementtypen, also `"admin" | "user"`.',
    },
    {
      id: 'q2',
      prompt: 'Warum kompiliert das nicht?',
      code: `function length(value: unknown): number {
  return value.length
}`,
      options: [
        'Auf `unknown` ist kein Zugriff erlaubt, bevor der Typ eingegrenzt wurde',
        '`length` heißt bei `unknown` `size`',
        '`unknown` darf nicht als Parametertyp verwendet werden',
        'Der Rückgabetyp müsste `unknown` sein',
      ],
      correct: 0,
      explanation: '`unknown` ist der Top-Type: Alles ist zuweisbar, nichts ist benutzbar. Erst nach `typeof value === "string"` oder `Array.isArray(value)` gibt es ein `length`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `function label(count?: number): string {
  return count ? \`\${count} Stück\` : 'keine'
}
console.log(label(0))`,
      options: ['`0 Stück`', '`keine`', '`undefined`', 'Compile-Fehler'],
      correct: 1,
      explanation: '`0` ist falsy, also greift der else-Zweig. Gewollt wäre `count ?? 0` bzw. `count === undefined ? "keine" : ...` – Truthiness ist beim Prüfen auf "vorhanden" fast immer der falsche Test.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Typ hat `value` an der markierten Stelle?',
      code: `function handle(value: string | string[] | null): number {
  if (value === null) return 0
  if (Array.isArray(value)) return value.length
  // hier: value ist ?
  return value.length
}`,
      options: ['`string | string[]`', '`string`', '`string | null`', '`never`'],
      correct: 1,
      explanation: 'Control Flow Analysis entfernt nacheinander `null` und `string[]`. Übrig bleibt `string` – deshalb ist `value.length` hier erlaubt.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`const user = JSON.parse(body) as User`',
        '`const user: any = JSON.parse(body)`',
        '`const raw: unknown = JSON.parse(body); if (!isUser(raw)) throw new TypeError("kein User")`',
        '`const user = JSON.parse(body)!`',
      ],
      correct: 2,
      explanation: '`as` und `!` sind Behauptungen ohne Laufzeitprüfung, `any` schaltet die Prüfung komplett ab. Nur der Type Guard validiert wirklich und narrowt danach typsicher auf `User`.',
    },
    {
      id: 'q6',
      prompt: 'Warum narrowt der Aufrufer hier nicht?',
      code: `function isString(value: unknown): boolean {
  return typeof value === 'string'
}

function shout(value: unknown): string {
  if (isString(value)) return value.toUpperCase()
  return ''
}`,
      options: [
        '`typeof` funktioniert nicht in eigenen Funktionen',
        'Der Rückgabetyp muss das Prädikat `value is string` sein statt `boolean`',
        '`unknown` lässt sich grundsätzlich nicht narrowen',
        'Es fehlt ein `as string` im if-Zweig',
      ],
      correct: 1,
      explanation: 'Ein `boolean` transportiert keine Typinformation. Mit `function isString(value: unknown): value is string` weiß der Compiler im if-Zweig, dass `value` ein `string` ist.',
    },
    {
      id: 'q7',
      prompt: 'Was gibt `typeof null` zurück?',
      options: ['`"null"`', '`"object"`', '`"undefined"`', '`"never"`'],
      correct: 1,
      explanation: 'Ein historischer JS-Bug, der nie behoben wurde. Deshalb reicht `typeof x === "object"` nie aus – immer zusätzlich `x !== null` prüfen.',
    },
    {
      id: 'q8',
      prompt: 'Welchen Typ hat `settings`?',
      code: `const settings = { retries: 3, mode: 'strict' } as const`,
      options: [
        '`{ retries: number; mode: string }`',
        '`{ readonly retries: number; readonly mode: string }`',
        '`{ retries: 3; mode: "strict" }`',
        '`{ readonly retries: 3; readonly mode: "strict" }`',
      ],
      correct: 3,
      explanation: '`as const` macht beides: Literal-Typen statt Weitung **und** alle Properties `readonly` (rekursiv).',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Werte beschreiben mit typeof',
      level: 1,
      description: `Implementiere \`describeValue(value: string | number | boolean | null): string\`.

Rückgabe je nach Typ:

- \`string\` → \`text:<wert>\`
- \`number\` → \`zahl:<wert>\`
- \`boolean\` → \`bool:ja\` bzw. \`bool:nein\`
- \`null\` → \`leer\`

Achte darauf, dass \`0\` und \`""\` **keine** Sonderfälle sind – benutze \`typeof\` und einen exakten Vergleich, keine Truthiness.`,
      starter: `function describeValue(value: string | number | boolean | null): string {
  // TODO
  return ''
}`,
      solution: `function describeValue(value: string | number | boolean | null): string {
  if (value === null) return 'leer'
  if (typeof value === 'string') return \`text:\${value}\`
  if (typeof value === 'number') return \`zahl:\${value}\`
  return value ? 'bool:ja' : 'bool:nein'
}`,
      hints: [
        'Narrowing heißt: Eine Union Schritt für Schritt verkleinern, bis nur noch ein Typ übrig ist.',
        '`value === null` für den null-Fall, danach `typeof value === "string"` und `typeof value === "number"`.',
        'null prüfen → string prüfen → number prüfen → was übrig bleibt, ist boolean.',
        '`if (value === null) return "leer"` als erste Zeile, am Ende `return value ? "bool:ja" : "bool:nein"`.',
      ],
      tests: `check('string', 'text:hallo', describeValue('hallo'))
check('leerer string', 'text:', describeValue(''))
check('zahl', 'zahl:42', describeValue(42))
check('die Zahl 0 ist kein Sonderfall', 'zahl:0', describeValue(0))
check('true', 'bool:ja', describeValue(true))
check('false', 'bool:nein', describeValue(false))
check('null', 'leer', describeValue(null))`,
    },
    {
      id: 'k2',
      title: 'Type Guard für Produkte',
      level: 2,
      description: `Aus einer API kommen ungeprüfte Werte. Implementiere zwei Funktionen:

- \`isProduct(value: unknown): value is Product\` – prüft, ob \`value\` ein Objekt mit \`id: number\`, \`name: string\` und \`price: number\` ist.
- \`onlyProducts(values: readonly unknown[]): Product[]\` – filtert alle gültigen Produkte heraus.

Wichtig: \`null\`, Arrays und Objekte mit falschen Feldtypen müssen abgelehnt werden. Kein \`any\`, kein blindes \`as\`.`,
      given: `interface Product {
  id: number
  name: string
  price: number
}`,
      starter: `function isProduct(value: unknown): value is Product {
  // TODO
  return false
}

function onlyProducts(values: readonly unknown[]): Product[] {
  // TODO
  return []
}`,
      solution: `function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number'
  )
}

function onlyProducts(values: readonly unknown[]): Product[] {
  return values.filter(isProduct)
}`,
      hints: [
        'Ein Type Guard ist eine normale Funktion, die `boolean` zurückgibt – das Prädikat `value is Product` sagt dem Compiler nur, was ein `true` bedeutet.',
        'Reihenfolge: `typeof value !== "object" || value === null || Array.isArray(value)` → raus. Danach Feld für Feld mit `typeof` prüfen.',
        'Für den Feldzugriff einmal auf `Record<string, unknown>` casten, dann `typeof candidate.id === "number"` usw.',
        '`onlyProducts` ist ein Einzeiler: `return values.filter(isProduct)` – `filter` nutzt das Prädikat automatisch für den Ergebnistyp.',
      ],
      tests: `const good = { id: 1, name: 'Tastatur', price: 49.9 }
const alsoGood = { id: 4, name: 'Kabel', price: 5 }
const mixed: unknown[] = [good, { id: '2', name: 'Maus', price: 19.9 }, null, 'Produkt', { id: 3, name: 'Monitor' }, alsoGood]

checkTrue('erkennt gültiges Produkt', isProduct(good))
checkTrue('lehnt null ab', !isProduct(null))
checkTrue('lehnt Array ab', !isProduct([]))
checkTrue('lehnt falschen Feldtyp ab', !isProduct({ id: '2', name: 'Maus', price: 19.9 }))
checkTrue('lehnt fehlendes Feld ab', !isProduct({ id: 3, name: 'Monitor' }))
checkTrue('lehnt String ab', !isProduct('Produkt'))
check('filtert gemischte Liste', [good, alsoGood], onlyProducts(mixed))
check('leere Liste', [], onlyProducts([]))`,
    },
    {
      id: 'k3',
      title: 'Kontakte formatieren mit in-Narrowing',
      level: 3,
      description: `Ein \`Contact\` ist entweder ein \`EmailContact\` oder ein \`PhoneContact\`. Es gibt **kein** gemeinsames Unterscheidungsfeld – nutze deshalb den \`in\`-Operator.

Implementiere \`formatContact(contact: Contact): string\`:

- E-Mail-Kontakt → \`"<name> <<email>>"\`, z. B. \`Jan <jan@example.de>\`
- Telefon-Kontakt → \`"<name> (<countryCode> <phone>)"\`, z. B. \`Anna (+49 1701234)\`

Implementiere außerdem \`emailAddresses(contacts: readonly Contact[]): string[]\`, das nur die E-Mail-Adressen der E-Mail-Kontakte liefert.`,
      given: `interface EmailContact {
  name: string
  email: string
}

interface PhoneContact {
  name: string
  phone: string
  countryCode: string
}

type Contact = EmailContact | PhoneContact`,
      starter: `function formatContact(contact: Contact): string {
  // TODO
  return ''
}

function emailAddresses(contacts: readonly Contact[]): string[] {
  // TODO
  return []
}`,
      solution: `function isEmailContact(contact: Contact): contact is EmailContact {
  return 'email' in contact
}

function formatContact(contact: Contact): string {
  if (isEmailContact(contact)) return \`\${contact.name} <\${contact.email}>\`
  return \`\${contact.name} (\${contact.countryCode} \${contact.phone})\`
}

function emailAddresses(contacts: readonly Contact[]): string[] {
  return contacts.filter(isEmailContact).map((contact) => contact.email)
}`,
      hints: [
        'Der `in`-Operator prüft zur Laufzeit, ob ein Property existiert – und narrowt dabei die Union.',
        '`if ("email" in contact)` reicht schon. Für die Wiederverwendung in `filter` lohnt sich ein benannter Guard `contact is EmailContact`.',
        'formatContact: email-Zweig → Template-String mit spitzen Klammern; sonst Klammern mit countryCode und phone.',
        '`function isEmailContact(contact: Contact): contact is EmailContact { return "email" in contact }` und dann `contacts.filter(isEmailContact).map(...)`.',
      ],
      tests: `const jan: Contact = { name: 'Jan', email: 'jan@example.de' }
const anna: Contact = { name: 'Anna', phone: '1701234', countryCode: '+49' }
const tom: Contact = { name: 'Tom', phone: '555', countryCode: '+1' }
const leer: Contact = { name: '', email: 'a@b.c' }

check('email', 'Jan <jan@example.de>', formatContact(jan))
check('telefon', 'Anna (+49 1701234)', formatContact(anna))
check('andere Vorwahl', 'Tom (+1 555)', formatContact(tom))
check('leerer Name', ' <a@b.c>', formatContact(leer))
check('liste formatiert', ['Jan <jan@example.de>', 'Tom (+1 555)'], [jan, tom].map((c) => formatContact(c)))
check('nur E-Mails', ['jan@example.de', 'a@b.c'], emailAddresses([jan, anna, tom, leer]))
check('keine E-Mails', [], emailAddresses([anna, tom]))
check('leere Liste', [], emailAddresses([]))`,
    },
    {
      id: 'k4',
      title: 'Unbekanntes JSON validieren',
      level: 4,
      description: `Implementiere \`parseSettings(raw: unknown): Settings\`. Die Eingabe kommt aus \`JSON.parse\` – du darfst ihr nichts glauben.

Regeln:

1. Ist \`raw\` kein echtes Objekt (also \`null\`, ein Array oder ein Primitive) → \`TypeError\` mit Nachricht \`kein Objekt\`.
2. \`theme\` muss einer der Werte aus \`THEMES\` sein → sonst \`TypeError\` mit Nachricht \`ungueltiges theme\`.
3. \`retries\` ist optional. Fehlt es (\`undefined\`), gilt \`3\`. Sonst muss es eine ganze Zahl \`>= 0\` sein → sonst \`RangeError\` mit Nachricht \`ungueltige retries\`.
4. \`labels\` ist optional. Fehlt es, gilt \`[]\`. Sonst muss es ein Array aus \`string\` sein → sonst \`TypeError\` mit Nachricht \`ungueltige labels\`.

Kein \`any\`. Nutze \`unknown\`, \`typeof\`, \`Array.isArray\` und \`Number.isInteger\`.`,
      given: `const THEMES = ['light', 'dark'] as const
type Theme = (typeof THEMES)[number]

interface Settings {
  readonly theme: Theme
  readonly retries: number
  readonly labels: readonly string[]
}`,
      starter: `function parseSettings(raw: unknown): Settings {
  // TODO
  return { theme: 'light', retries: 3, labels: [] }
}`,
      solution: `function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

function parseSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new TypeError('kein Objekt')
  }
  const candidate = raw as Record<string, unknown>

  if (!isTheme(candidate.theme)) {
    throw new TypeError('ungueltiges theme')
  }

  const retries = candidate.retries ?? 3
  if (typeof retries !== 'number' || !Number.isInteger(retries) || retries < 0) {
    throw new RangeError('ungueltige retries')
  }

  const labels = candidate.labels ?? []
  if (!Array.isArray(labels) || !labels.every((label) => typeof label === 'string')) {
    throw new TypeError('ungueltige labels')
  }

  return { theme: candidate.theme, retries, labels: [...labels] }
}`,
      hints: [
        'Validierung heißt: eng werden von außen nach innen. Erst die Hülle prüfen, dann Feld für Feld – und bei jedem Verstoß sofort werfen.',
        '`typeof raw !== "object" || raw === null || Array.isArray(raw)` fängt die Hülle ab. Für Feldzugriffe `raw as Record<string, unknown>`.',
        'theme: eigener Guard mit `THEMES.includes(...)`. retries: `candidate.retries ?? 3`, dann `Number.isInteger` und `>= 0`. labels: `Array.isArray` plus `every(typeof === "string")`.',
        '`function isTheme(value: unknown): value is Theme { return typeof value === "string" && (THEMES as readonly string[]).includes(value) }`',
      ],
      tests: `check('vollstaendig', { theme: 'dark', retries: 5, labels: ['a', 'b'] }, parseSettings({ theme: 'dark', retries: 5, labels: ['a', 'b'] }))
check('defaults', { theme: 'dark', retries: 3, labels: [] }, parseSettings({ theme: 'dark' }))
check('retries 0 erlaubt', { theme: 'light', retries: 0, labels: [] }, parseSettings({ theme: 'light', retries: 0 }))
check('leere labels', { theme: 'light', retries: 3, labels: [] }, parseSettings({ theme: 'light', labels: [] }))
checkThrows('null', TypeError, () => parseSettings(null))
checkThrows('Array', 'kein Objekt', () => parseSettings([]))
checkThrows('Primitive', 'kein Objekt', () => parseSettings('dark'))
checkThrows('falsches theme', 'ungueltiges theme', () => parseSettings({ theme: 'blau' }))
checkThrows('fehlendes theme', TypeError, () => parseSettings({ retries: 1 }))
checkThrows('negative retries', RangeError, () => parseSettings({ theme: 'dark', retries: -1 }))
checkThrows('kommazahl retries', RangeError, () => parseSettings({ theme: 'dark', retries: 1.5 }))
checkThrows('labels keine Strings', 'ungueltige labels', () => parseSettings({ theme: 'dark', labels: [1, 2] }))`,
    },
  ],
}

export default chapter
