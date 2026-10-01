import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    { id: 'f1', front: 'Woraus besteht ein Slice intern?', back: 'Aus drei Feldern: **Pointer** auf ein Array, **len** und **cap**. Der Header wird by value kopiert – die Daten dahinter nicht.' },
    { id: 'f2', front: 'Unterschied Array und Slice?', back: 'Beim Array ist die Länge Teil des Typs (`[3]int` ≠ `[4]int`) und Zuweisen kopiert alles. Ein Slice (`[]int`) hat variable Länge und zeigt auf ein gemeinsames Array.' },
    { id: 'f3', front: 'Was ist der Unterschied zwischen `len` und `cap`?', back: '`len` = sichtbare Elemente, `cap` = Platz im darunterliegenden Array ab dem Slice-Start. `append` alloziert neu, sobald `len` die `cap` überschreiten würde.' },
    { id: 'f4', front: 'Warum muss man `s = append(s, x)` schreiben?', back: '`append` kann ein neues Array anlegen und gibt in jedem Fall einen **neuen Header** zurück. Wird er verworfen, ist das Ergebnis weg – ohne Compilerfehler.' },
    { id: 'f5', front: 'Was ist das Aliasing-Problem bei `append`?', back: 'Reicht die Kapazität, schreibt `append` ins **bestehende** Array. Andere Slices auf dasselbe Array sehen die Änderung:\n```go\nu := make([]int, 3, 10)\nv := append(u, 4)\nv[0] = 99 // u[0] ist jetzt auch 99\n```' },
    { id: 'f6', front: 'Wie klonst du ein Slice unabhängig vom Original?', back: '```go\ndst := make([]int, len(src))\ncopy(dst, src)\n```\nOder ab Go 1.21: `slices.Clone(src)`.' },
    { id: 'f7', front: 'nil-Slice vs. leerer Slice – wo ist der Unterschied?', back: 'Für `len`, `range` und `append` identisch. Unterschiedlich bei `reflect.DeepEqual` und JSON (`nil` → `null`, `[]int{}` → `[]`). `var s []int` ist nil, `[]int{}` und `make([]int, 0)` nicht.' },
    { id: 'f8', front: 'Wie prüfst du, ob ein Map-Key existiert?', back: 'Mit dem comma-ok-Idiom:\n```go\nv, ok := m["key"]\nif !ok { /* fehlt */ }\n```\n`m["key"] == 0` reicht nicht – der gespeicherte Wert könnte selbst 0 sein.' },
    { id: 'f9', front: 'Was passiert beim Lesen und Schreiben einer nil-Map?', back: 'Lesen liefert den Zero Value und `ok == false`. **Schreiben paniced** (`assignment to entry in nil map`). Deshalb immer `make(map[K]V)`.' },
    { id: 'f10', front: 'In welcher Reihenfolge läuft `for k := range m`?', back: 'In **zufälliger** Reihenfolge – bei jedem Programmlauf anders. Das ist Absicht. Für stabile Ausgaben: Keys in ein Slice sammeln und sortieren.' },
    { id: 'f11', front: 'Wie sortierst du eine Struct-Liste nach zwei Kriterien?', back: '```go\nsort.Slice(us, func(i, j int) bool {\n\tif us[i].Age != us[j].Age {\n\t\treturn us[i].Age > us[j].Age\n\t}\n\treturn us[i].Name < us[j].Name\n})\n```\nDie Less-Funktion muss **strikt** sein (`<`, nicht `<=`).' },
    { id: 'f12', front: 'Warum wirkt `func grow(s []int) { s = append(s, 1) }` nicht beim Aufrufer?', back: 'Der Slice-**Header** wird kopiert. `append` ändert nur die lokale Kopie. Schreibzugriffe per Index (`s[0] = 1`) wirken dagegen sehr wohl, weil das Array geteilt ist. Lösung: den Slice zurückgeben.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was wird ausgegeben?',
      code: `s := make([]int, 0, 5)
s = append(s, 1, 2)
fmt.Println(len(s), cap(s))`,
      options: ['`2 2`', '`2 5`', '`5 5`', '`0 5`'],
      correct: 1,
      explanation: '`make([]int, 0, 5)` legt len 0 und cap 5 an. Nach zwei `append`s ist len 2, die Kapazität reicht noch – cap bleibt 5.',
    },
    {
      id: 'q2',
      prompt: 'Wo ist der Bug?',
      code: `out := make([]string, len(in))
for _, v := range in {
	out = append(out, strings.ToUpper(v))
}`,
      options: [
        '`range` braucht den Index',
        '`make` mit Länge statt Kapazität – `out` beginnt mit len(in) leeren Strings, die Ergebnisse landen dahinter',
        '`append` darf nicht in einer Schleife stehen',
        'Kein Bug',
      ],
      correct: 1,
      explanation: '`make([]string, n)` erzeugt n Zero Values. `append` hängt dahinter an → doppelte Länge mit führenden `""`. Richtig ist `make([]string, 0, len(in))`.',
    },
    {
      id: 'q3',
      prompt: 'Was wird ausgegeben?',
      code: `s := []int{0, 1, 2, 3, 4}
part := s[1:3]
part = append(part, 99)
fmt.Println(s)`,
      options: ['`[0 1 2 3 4]`', '`[0 1 2 99 4]`', '`[0 1 2 3 4 99]`', '`[0 1 99 3 4]`'],
      correct: 1,
      explanation: '`part` hat len 2, aber cap 4 (bis zum Ende von `s`). `append` schreibt deshalb in das bestehende Array an Position 3 und überschreibt die 3. Schutz: `s[1:3:3]` oder vorher klonen.',
    },
    {
      id: 'q4',
      prompt: 'Was wird ausgegeben?',
      code: `m := map[string]int{"a": 0}
v1, ok1 := m["a"]
v2, ok2 := m["b"]
fmt.Println(v1, ok1, v2, ok2)`,
      options: ['`0 true 0 false`', '`0 false 0 false`', '`0 true 0 true`', 'panic: key not found'],
      correct: 0,
      explanation: 'Der gespeicherte Wert von `"a"` ist 0, aber der Key existiert → `ok1 == true`. `"b"` fehlt → Zero Value 0 und `ok2 == false`. Genau deshalb reicht der Wertvergleich nicht.',
    },
    {
      id: 'q5',
      prompt: 'Warum kompiliert das nicht?',
      code: `type Key struct{ Tags []string }
m := map[Key]int{}
m[Key{}] = 1`,
      options: [
        'Structs dürfen keine Map-Keys sein',
        'Map-Literale brauchen immer einen Eintrag',
        '`Key` enthält ein Slice und ist damit nicht vergleichbar – Map-Keys müssen vergleichbar sein',
        '`m[Key{}]` braucht einen Pointer',
      ],
      correct: 2,
      explanation: 'Map-Keys müssen mit `==` vergleichbar sein. Structs sind das nur, wenn **alle** Felder vergleichbar sind – Slices, Maps und Funktionen sind es nicht.',
    },
    {
      id: 'q6',
      prompt: 'Was wird ausgegeben?',
      code: `func fill(s []int)  { s[0] = 7 }
func grow(s []int)  { s = append(s, 8) }

s := []int{1, 2, 3}
fill(s)
grow(s)
fmt.Println(s)`,
      options: ['`[7 2 3]`', '`[1 2 3]`', '`[7 2 3 8]`', '`[1 2 3 8]`'],
      correct: 0,
      explanation: '`fill` schreibt über den geteilten Array-Pointer → sichtbar. `grow` ändert nur den lokalen Header-Kopie → unsichtbar. Wer wachsen will, muss den Slice zurückgeben.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist idiomatisch, um deterministisch über eine Map auszugeben?',
      options: [
        '`for k, v := range m { fmt.Println(k, v) }`',
        'Keys in ein Slice sammeln, `sort.Strings(keys)`, dann über `keys` iterieren',
        'Die Map in eine `sync.Map` umwandeln',
        'Die Map zweimal durchlaufen und die Ergebnisse vergleichen',
      ],
      correct: 1,
      explanation: 'Die Map-Reihenfolge ist absichtlich randomisiert. Der Standardweg ist: `keys := make([]string, 0, len(m))`, einsammeln, sortieren, iterieren.',
    },
    {
      id: 'q8',
      prompt: 'Was ist an dieser Less-Funktion falsch?',
      code: `sort.Slice(nums, func(i, j int) bool {
	return nums[i] <= nums[j]
})`,
      options: [
        'Sie muss `int` statt `bool` liefern',
        'Sie ist nicht strikt – bei gleichen Werten liefert sie `true`, was die Sortierordnung verletzt',
        '`sort.Slice` erwartet drei Parameter',
        'Sie müsste `nums[j] < nums[i]` heißen',
      ],
      correct: 1,
      explanation: 'Die Less-Funktion muss eine strikte Ordnung beschreiben: bei gleichen Elementen `false`. Mit `<=` kann `sort` inkonsistent werden oder panicen. Richtig: `nums[i] < nums[j]`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Filtern und Verdoppeln',
      level: 1,
      description: `Implementiere \`EvensDoubled(nums []int) []int\`:

- behält nur die geraden Zahlen und verdoppelt sie
- die Reihenfolge bleibt erhalten
- bei leerem oder nil-Input kommt ein **leerer, initialisierter** Slice zurück (\`[]int{}\`), **nicht** \`nil\`

Der letzte Punkt zählt: \`reflect.DeepEqual\` unterscheidet nil-Slice und leeren Slice. Leg den Ergebnis-Slice deshalb immer mit \`make([]int, 0, len(nums))\` an.`,
      starter: `func EvensDoubled(nums []int) []int {
	// TODO
	return nil
}`,
      solution: `func EvensDoubled(nums []int) []int {
	result := make([]int, 0, len(nums))
	for _, n := range nums {
		if n%2 != 0 {
			continue
		}
		result = append(result, n*2)
	}
	return result
}`,
      hints: [
        'Ergebnis-Slice vorher anlegen und mit `append` befüllen – das ist das Standardmuster für Filtern in Go.',
        '`make([]int, 0, len(nums))` reserviert Kapazität, ohne Elemente anzulegen. `n%2 == 0` prüft auf gerade.',
        'Slice mit make(..., 0, len(nums)) anlegen, über nums rangen, ungerade überspringen, sonst n*2 anhängen, Slice zurückgeben.',
        '`result := make([]int, 0, len(nums))` … `result = append(result, n*2)`',
      ],
      tests: `	check("gerade verdoppelt", []int{4, 8}, EvensDoubled([]int{1, 2, 3, 4, 5}))
	check("alle gerade", []int{0, 4, 20}, EvensDoubled([]int{0, 2, 10}))
	check("negative Zahlen", []int{-4}, EvensDoubled([]int{-2, -3}))
	check("leerer Input", []int{}, EvensDoubled([]int{}))
	check("nil Input", []int{}, EvensDoubled(nil))
	checkTrue("Ergebnis ist nie nil", EvensDoubled(nil) != nil)
	check("nichts passt", []int{}, EvensDoubled([]int{1, 3, 5}))

	src := []int{2, 4}
	_ = EvensDoubled(src)
	check("Input unveraendert", []int{2, 4}, src)`,
    },
    {
      id: 'k2',
      title: 'Wörter zählen',
      level: 2,
      description: `Implementiere zwei Funktionen rund um \`map[string]int\`:

- \`CountWords(words []string) map[string]int\` – zählt, wie oft jedes Wort vorkommt. Leere Strings werden übersprungen. Bei leerem Input kommt eine **initialisierte, leere Map** zurück (\`map[string]int{}\`), **nicht** \`nil\`.
- \`CountOf(counts map[string]int, word string) (int, bool)\` – liefert den Zählerstand und ob der Key überhaupt existiert (comma-ok-Idiom).

Denk daran: Der Zero Value einer Map ist 0, deshalb reicht \`counts[w]++\` ohne Vorprüfung.`,
      starter: `func CountWords(words []string) map[string]int {
	// TODO
	return nil
}

func CountOf(counts map[string]int, word string) (int, bool) {
	// TODO
	return 0, false
}`,
      solution: `func CountWords(words []string) map[string]int {
	counts := make(map[string]int, len(words))
	for _, w := range words {
		if w == "" {
			continue
		}
		counts[w]++
	}
	return counts
}

func CountOf(counts map[string]int, word string) (int, bool) {
	n, ok := counts[word]
	return n, ok
}`,
      hints: [
        'Eine Map muss mit `make` angelegt werden, bevor du hineinschreibst – in eine nil-Map zu schreiben paniced.',
        '`counts[w]++` funktioniert auch beim ersten Vorkommen, weil fehlende Keys den Zero Value 0 liefern. Für die Existenzprüfung: `v, ok := m[k]`.',
        'CountWords: Map mit make anlegen, über words rangen, leere Strings überspringen, counts[w]++ . CountOf: comma-ok abfragen und beides zurückgeben.',
        '`counts := make(map[string]int, len(words))` … `n, ok := counts[word]; return n, ok`',
      ],
      tests: `	counts := CountWords([]string{"go", "map", "go", "", "go"})
	check("go dreimal", 3, counts["go"])
	check("map einmal", 1, counts["map"])
	check("leere Strings ignoriert", 2, len(counts))
	check("komplette Map", map[string]int{"go": 3, "map": 1}, counts)

	check("leerer Input ist leere Map", map[string]int{}, CountWords(nil))
	checkTrue("nie nil", CountWords(nil) != nil)

	n, ok := CountOf(counts, "go")
	check("Wert vorhanden", 3, n)
	checkTrue("ok ist true", ok)

	missing, ok2 := CountOf(counts, "rust")
	check("fehlender Key liefert 0", 0, missing)
	checkTrue("ok ist false", !ok2)

	zero, ok3 := CountOf(map[string]int{"x": 0}, "x")
	check("gespeicherte 0", 0, zero)
	checkTrue("0 heisst nicht fehlend", ok3)`,
    },
    {
      id: 'k3',
      title: 'Top-N aus einer Map',
      level: 3,
      description: `Implementiere \`TopN(counts map[string]int, n int) []string\`:

- liefert die \`n\` Wörter mit der höchsten Zahl
- bei Gleichstand entscheidet das Wort **alphabetisch aufsteigend** (damit das Ergebnis deterministisch ist – Map-Iteration ist zufällig!)
- \`n <= 0\` oder eine leere Map → \`[]string{}\` (initialisiert, nicht \`nil\`)
- ist \`n\` größer als die Map, kommen eben alle Einträge zurück

Nutze \`sort.Slice\` mit einer **strikten** Less-Funktion.`,
      starter: `func TopN(counts map[string]int, n int) []string {
	// TODO
	return nil
}`,
      solution: `import "sort"

func TopN(counts map[string]int, n int) []string {
	if n <= 0 {
		return []string{}
	}
	keys := make([]string, 0, len(counts))
	for k := range counts {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool {
		if counts[keys[i]] != counts[keys[j]] {
			return counts[keys[i]] > counts[keys[j]]
		}
		return keys[i] < keys[j]
	})
	if n > len(keys) {
		n = len(keys)
	}
	return keys[:n]
}`,
      hints: [
        'Map-Iteration ist zufällig. Sammle die Keys erst in ein Slice, sortiere dieses und schneide dann ab.',
        '`sort.Slice(keys, func(i, j int) bool { ... })` sortiert in place. Für zwei Kriterien: erst Zähler vergleichen, bei Gleichstand die Keys.',
        'Bei n <= 0 leeren Slice zurückgeben. Keys sammeln, mit sort.Slice nach Count absteigend und Name aufsteigend sortieren, n auf len(keys) begrenzen, keys[:n] zurückgeben.',
        '`if counts[keys[i]] != counts[keys[j]] { return counts[keys[i]] > counts[keys[j]] }` … `return keys[i] < keys[j]`',
      ],
      tests: `	counts := map[string]int{"go": 5, "map": 3, "slice": 5, "chan": 1}
	check("Top 2 mit Gleichstand alphabetisch", []string{"go", "slice"}, TopN(counts, 2))
	check("Top 3", []string{"go", "slice", "map"}, TopN(counts, 3))
	check("n groesser als Map", []string{"go", "slice", "map", "chan"}, TopN(counts, 99))
	check("n = 0", []string{}, TopN(counts, 0))
	check("n negativ", []string{}, TopN(counts, -1))
	check("leere Map", []string{}, TopN(map[string]int{}, 3))
	checkTrue("nie nil", TopN(nil, 3) != nil)
	check("deterministisch bei zwei Laeufen", TopN(counts, 4), TopN(counts, 4))`,
    },
    {
      id: 'k4',
      title: 'Chunks ohne Aliasing',
      level: 4,
      description: `Implementiere \`Chunk(values []int, size int) [][]int\`:

- zerlegt \`values\` in Blöcke der Länge \`size\`; der letzte Block darf kürzer sein
- \`size <= 0\` oder leerer Input → \`[][]int{}\` (initialisiert, nicht \`nil\`)
- **Wichtig:** Die Blöcke dürfen sich den Speicher **nicht** mit \`values\` teilen. Wer nachträglich \`values\` ändert, darf die Blöcke nicht verändern – und umgekehrt.

Ein naives \`values[i:end]\` erfüllt die letzte Bedingung **nicht**: Sub-Slices zeigen auf dasselbe Array. Kopiere jeden Block mit \`make\` + \`copy\`.`,
      starter: `func Chunk(values []int, size int) [][]int {
	// TODO
	return nil
}`,
      solution: `func Chunk(values []int, size int) [][]int {
	result := make([][]int, 0)
	if size <= 0 {
		return result
	}
	for start := 0; start < len(values); start += size {
		end := start + size
		if end > len(values) {
			end = len(values)
		}
		block := make([]int, end-start)
		copy(block, values[start:end])
		result = append(result, block)
	}
	return result
}`,
      hints: [
        'Sub-Slices wie `values[a:b]` teilen sich das darunterliegende Array mit dem Original – Änderungen sind auf beiden Seiten sichtbar.',
        '`block := make([]int, n)` plus `copy(block, src)` erzeugt eine unabhängige Kopie. `copy` gibt die Anzahl kopierter Elemente zurück.',
        'Ergebnis-Slice anlegen, bei size <= 0 sofort zurück. In Schritten von size über values laufen, end auf len(values) begrenzen, Block kopieren und anhängen.',
        '`block := make([]int, end-start)` … `copy(block, values[start:end])` … `result = append(result, block)`',
      ],
      tests: `	check("gleichmaessig", [][]int{{1, 2}, {3, 4}}, Chunk([]int{1, 2, 3, 4}, 2))
	check("letzter Block kuerzer", [][]int{{1, 2, 3}, {4, 5}}, Chunk([]int{1, 2, 3, 4, 5}, 3))
	check("size 1", [][]int{{1}, {2}}, Chunk([]int{1, 2}, 1))
	check("size groesser als Input", [][]int{{1, 2}}, Chunk([]int{1, 2}, 5))
	check("size 0", [][]int{}, Chunk([]int{1, 2}, 0))
	check("size negativ", [][]int{}, Chunk([]int{1, 2}, -2))
	check("leerer Input", [][]int{}, Chunk(nil, 2))
	checkTrue("nie nil", Chunk(nil, 2) != nil)

	src := []int{1, 2, 3, 4}
	blocks := Chunk(src, 2)
	src[0] = 99
	check("Block teilt keinen Speicher mit dem Input", []int{1, 2}, blocks[0])
	blocks[1][0] = 77
	check("Input bleibt unberuehrt", []int{99, 2, 3, 4}, src)`,
    },
  ],
}

export default chapter
