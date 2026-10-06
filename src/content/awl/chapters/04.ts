import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    { id: 'f1', front: 'Was passiert bei `L MW 10` mit den Akkus?', back: 'Der bisherige Inhalt von **Akku 1 rutscht nach Akku 2**, danach wird `MW 10` nach Akku 1 geladen. `L` schiebt also immer durch.' },
    { id: 'f2', front: 'Was passiert bei `T MW 20`?', back: 'Der Inhalt von Akku 1 wird nach `MW 20` kopiert. **Akku 1 bleibt unverändert**, es wird nichts geschoben. Deshalb kann man denselben Wert mehrfach hintereinander transferieren.' },
    { id: 'f3', front: 'Wie viele Akkus haben S7-300 und S7-400?', back: 'S7-300: **2** Akkus. S7-400: **4** Akkus. Code, der mit Akku 3/4 arbeitet, läuft deshalb nicht auf der S7-300.' },
    { id: 'f4', front: 'Was steht nach `L MB 10` in Akku 1, wenn `MB 10 = 16#FF` ist?', back: '`DW#16#0000_00FF`. Bytes werden **rechtsbündig** geladen, die oberen Bits werden mit 0 gefüllt. Deshalb ist `L MB x` nie negativ.' },
    { id: 'f5', front: 'Welche Reihenfolge gilt bei `-I` und `/I`?', back: '**Akku 2 (op) Akku 1** – der *zuerst* geladene Wert steht links vom Operator:\n\n```text\nL     "Sollwert"\nL     "Istwert"\n-I                  // Soll - Ist\n```' },
    { id: 'f6', front: 'Nenne die Konstanten-Präfixe in AWL.', back: '`16#` hex, `2#` binär, `L#` DINT, `B#16#` Byte, `W#16#` Wort, `DW#16#` Doppelwort, `S5T#` S5-Zeit, `T#` IEC-Zeit, `C#` Zählwert, `1.5e1` REAL.' },
    { id: 'f7', front: 'Was machen Vergleichsbefehle wie `>I` mit dem VKE?', back: 'Sie **setzen** das VKE: `1`, wenn `Akku 2 > Akku 1`. Zusätzlich werden die Anzeigenbits `A1`/`A0` gesetzt. Vergleiche sind die Brücke zwischen Wort- und Bitverarbeitung.' },
    { id: 'f8', front: 'Was macht `TAK`?', back: 'Tauscht Akku 1 und Akku 2. Praktisch, wenn man die Operanden in der falschen Reihenfolge geladen hat – für `-I`, `/I` und Vergleiche entscheidend.' },
    { id: 'f9', front: 'Sind `L` und `T` vom VKE abhängig?', back: '**Nein.** Lade- und Transferbefehle werden immer ausgeführt und setzen `/ER` nicht zurück. Bedingtes Transferieren geht nur über einen Sprung (`SPBN` + Marke).' },
    { id: 'f10', front: 'Was passiert bei `L MW 10` gefolgt von `T MB 20`?', back: 'Nur das **unterste Byte** von Akku 1 wird geschrieben – die oberen 8 Bit gehen verloren. Ziel- und Quellbreite müssen zusammenpassen.' },
    { id: 'f11', front: 'Wie rechnet man INT-Werte mit einem REAL-Faktor?', back: 'Erst umwandeln, dann rechnen:\n\n```text\nL     MW 10\nITD                 // INT -> DINT\nDTR                 // DINT -> REAL\nL     2.5e0\n*R\nRND                 // REAL -> DINT, gerundet\n```' },
    { id: 'f12', front: 'Wo landet der Rest bei `/I`?', back: 'Im **oberen Wort** von Akku 1, der Quotient steht im unteren Wort. Für DINT gibt es zusätzlich `MOD` als eigenen Befehl.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Was steht nach der letzten Zeile in Akku 1 und Akku 2, wenn `MW 10 = 7` und `MW 12 = 3` sind?',
      code: `      L     MW 10
      L     MW 12`,
      options: [
        'Akku 1 = 7, Akku 2 = 3',
        'Akku 1 = 3, Akku 2 = 7',
        'Akku 1 = 10, Akku 2 = 3',
        'Akku 1 = 3, Akku 2 = 0',
      ],
      correct: 1,
      explanation: '`L` lädt nach Akku 1 und schiebt den alten Inhalt nach Akku 2. Das zuletzt geladene `MW 12` = 3 steht in Akku 1, das zuerst geladene `MW 10` = 7 in Akku 2.',
    },
    {
      id: 'q2',
      prompt: 'Was steht danach in `MW 14`, wenn `MW 10 = 7` und `MW 12 = 3` sind?',
      code: `      L     MW 10
      L     MW 12
      -I
      T     MW 14`,
      options: ['`-4`', '`4`', '`10`', '`21`'],
      correct: 1,
      explanation: '`-I` rechnet `Akku 2 - Akku 1`, also `7 - 3 = 4`. Der zuerst geladene Wert steht links vom Operator.',
    },
    {
      id: 'q3',
      prompt: 'Was steht nach `L MB 10` in Akku 1, wenn `MB 10 = 2#1000_0001` ist?',
      code: `      L     MB 10`,
      options: ['`DW#16#FFFF_FF81`', '`DW#16#0000_0081`', '`DW#16#8100_0000`', '`-127`'],
      correct: 1,
      explanation: 'Bytes werden rechtsbündig geladen, die oberen 24 Bit werden mit 0 gefüllt. Es findet **keine** Vorzeichenerweiterung statt – deshalb ist das Ergebnis `129`, nicht `-127`.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat `A 4.0`, wenn `"Fuellstand" = 750` ist?',
      code: `      L     "Fuellstand"
      L     800
      >I
      =     A 4.0`,
      options: ['`1`', '`0`', 'undefiniert', 'Übersetzungsfehler'],
      correct: 1,
      explanation: '`>I` prüft `Akku 2 > Akku 1`, also `750 > 800` → falsch → VKE = 0. Der zuerst geladene Wert steht links vom Vergleichsoperator.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Fehler?',
      code: `      U     "Freigabe"
      L     100
      T     "Sollwert"`,
      options: [
        '`L` muss vor `U` stehen',
        '`T` wird unbedingt ausgeführt – `"Freigabe"` hat keinerlei Wirkung',
        '`L 100` muss `L W#16#100` heißen',
        '`T` darf nicht auf ein Symbol schreiben',
      ],
      correct: 1,
      explanation: 'Lade- und Transferbefehle sind VKE-unabhängig. Für eine bedingte Ausführung braucht man einen Sprung: `U "Freigabe"` / `SPBN M001` / `L 100` / `T "Sollwert"` / `M001: NOP 0`.',
    },
    {
      id: 'q6',
      prompt: 'Was steht danach in `MW 20`, wenn `MW 10 = 300` ist?',
      code: `      L     MW 10
      T     MB 20
      L     MW 10
      T     MW 20`,
      options: ['`44`', '`300`', '`0`', '`76`'],
      correct: 1,
      explanation: '`T MB 20` schreibt nur das untere Byte (300 = 16#012C → 16#2C = 44). Danach überschreibt `T MW 20` beide Bytes mit dem vollen Wert 300. Die Frage zielt auf `MW 20`, nicht auf `MB 20`.',
    },
    {
      id: 'q7',
      prompt: 'Welche AWL-Folge berechnet `MW 20 := (MW 10 - MW 12) * 2`?',
      options: [
        '`L MW 12` / `L MW 10` / `-I` / `L 2` / `*I` / `T MW 20`',
        '`L MW 10` / `L MW 12` / `-I` / `L 2` / `*I` / `T MW 20`',
        '`L MW 10` / `-I MW 12` / `*I 2` / `T MW 20`',
        '`L 2` / `L MW 10` / `L MW 12` / `-I` / `*I` / `T MW 20`',
      ],
      correct: 1,
      explanation: '`-I` rechnet `Akku 2 - Akku 1`, also muss `MW 10` zuerst geladen werden. Das Ergebnis bleibt in Akku 1; `L 2` schiebt es nach Akku 2, `*I` multipliziert. Rechenbefehle haben in AWL keine Operanden.',
    },
    {
      id: 'q8',
      prompt: 'Wo ist der Fehler?',
      code: `      L     30000
      L     10000
      +I
      T     MW 20`,
      options: [
        '`+I` gibt es nicht, es heißt `+`',
        'Das Ergebnis 40000 passt nicht in INT (max. 32767) – `OV`/`OS` werden gesetzt, `MW 20` wird negativ',
        'Konstanten müssen mit `L#` geladen werden',
        'Kein Fehler',
      ],
      correct: 1,
      explanation: 'INT reicht von -32768 bis 32767. Richtig wäre in DINT zu rechnen: `L 30000` / `ITD` / `L L#10000` / `+D` / `T MD 20`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Werte kopieren',
      level: 1,
      description: `Schreibe ein Netzwerk, das

1. den Sollwert aus \`MW 10\` in \`MW 20\` kopiert,
2. den Istwert aus \`EW 100\` in \`MW 22\` kopiert.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Sollwert_Quelle\` | MW 10 | INT | Sollwert aus Rezeptverwaltung |
| \`Istwert_Roh\` | EW 100 | INT | Analogeingang Rohwert |
| \`Sollwert_Aktiv\` | MW 20 | INT | aktiver Sollwert |
| \`Istwert_Aktiv\` | MW 22 | INT | aktueller Istwert |`,
      starter: `NETZWERK 1
TITEL: Soll- und Istwert uebernehmen

      // TODO`,
      solution: `NETZWERK 1
TITEL: Soll- und Istwert uebernehmen

      L     "Sollwert_Quelle"     // Akku 1 := MW 10
      T     "Sollwert_Aktiv"      // MW 20 := Akku 1

      L     "Istwert_Roh"         // Akku 1 := EW 100 (alter Wert nach Akku 2)
      T     "Istwert_Aktiv"       // MW 22 := Akku 1`,
      hints: [
        'Kopieren heißt in AWL immer: laden, dann transferieren.',
        'Du brauchst `L` und `T` – jeweils mit Wortbreite, nicht Byte.',
        'L Sollwert_Quelle → T Sollwert_Aktiv, danach L Istwert_Roh → T Istwert_Aktiv.',
        'Achte auf die Breiten: Quelle und Ziel sind beide Wörter (`MW`, `EW`). Ein `T MB 20` würde das obere Byte verlieren.',
      ],
    },
    {
      id: 'k2',
      title: 'Regelabweichung berechnen',
      level: 2,
      description: `Berechne die Regelabweichung \`Differenz := Sollwert - Istwert\` und lege sie in \`MW 24\` ab.

Setze zusätzlich ein Meldebit:
- \`Ist_zu_klein\` = 1, wenn der **Istwert kleiner** als der Sollwert ist.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Sollwert\` | MW 20 | INT | Sollwert |
| \`Istwert\` | MW 22 | INT | Istwert |
| \`Differenz\` | MW 24 | INT | Soll - Ist |
| \`Ist_zu_klein\` | M 30.0 | BOOL | Istwert unter Sollwert |

**Achtung:** Die Ladereihenfolge entscheidet über das Vorzeichen.`,
      starter: `NETZWERK 1
TITEL: Regelabweichung Soll - Ist
      // TODO

NETZWERK 2
TITEL: Meldung Istwert zu klein
      // TODO`,
      solution: `NETZWERK 1
TITEL: Regelabweichung Soll - Ist
// Akku 2 = Sollwert, Akku 1 = Istwert, -I rechnet Akku2 - Akku1.

      L     "Sollwert"            // zuerst geladen -> steht links vom Operator
      L     "Istwert"             // zuletzt geladen -> Akku 1
      -I                          // Soll - Ist
      T     "Differenz"

NETZWERK 2
TITEL: Meldung Istwert zu klein
// Vergleichsbefehle setzen direkt das VKE.

      L     "Istwert"             // Akku 2 nach dem naechsten L
      L     "Sollwert"            // Akku 1
      <I                          // Akku 2 < Akku 1, also Ist < Soll
      =     "Ist_zu_klein"`,
      hints: [
        'Subtraktion und Vergleich rechnen beide mit `Akku 2 (op) Akku 1` – der zuerst geladene Wert steht links.',
        'Du brauchst `L`, `-I`, `T` sowie einen Vergleichsbefehl (`<I`) und `=`.',
        'NW1: L Sollwert → L Istwert → -I → T Differenz. NW2: L Istwert → L Sollwert → <I → = Ist_zu_klein.',
        'Alternativ ginge Netzwerk 2 auch über die Differenz: `L "Differenz"` / `L 0` / `>I`. Positive Differenz bedeutet Ist unter Soll.',
      ],
    },
    {
      id: 'k3',
      title: 'Grenzwertüberwachung mit Bereichsprüfung',
      level: 3,
      description: `Ein Drucksensor liefert seinen Wert als INT in \`MW 30\` (Einheit: mbar).

Bilde **drei** Meldungen:

1. \`Druck_zu_niedrig\`: Druck **unter** 200 mbar.
2. \`Druck_zu_hoch\`: Druck **über** 800 mbar.
3. \`Druck_im_Band\`: Druck zwischen 200 und 800 mbar **einschließlich** der Grenzen. Löse das mit **Klammern** und zwei Vergleichen in **einem** Netzwerk (nicht über die beiden Meldebits).

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Druck\` | MW 30 | INT | Istdruck in mbar |
| \`Druck_zu_niedrig\` | M 31.0 | BOOL | < 200 mbar |
| \`Druck_zu_hoch\` | M 31.1 | BOOL | > 800 mbar |
| \`Druck_im_Band\` | M 31.2 | BOOL | 200 … 800 mbar |`,
      starter: `NETZWERK 1
TITEL: Untergrenze
      // TODO

NETZWERK 2
TITEL: Obergrenze
      // TODO

NETZWERK 3
TITEL: Druck im zulaessigen Band
// Zwei Vergleiche mit Klammern verknuepfen.
      // TODO`,
      solution: `NETZWERK 1
TITEL: Untergrenze

      L     "Druck"               // Akku 2 nach dem naechsten L
      L     200                   // Akku 1
      <I                          // Druck < 200
      =     "Druck_zu_niedrig"

NETZWERK 2
TITEL: Obergrenze

      L     "Druck"
      L     800
      >I                          // Druck > 800
      =     "Druck_zu_hoch"

NETZWERK 3
TITEL: Druck im zulaessigen Band
// Zwei Vergleiche mit Klammern verknuepfen.
// Jeder Vergleich setzt das VKE neu, deshalb muessen die Teilausdruecke
// geklammert werden - sonst ueberschreibt der zweite Vergleich den ersten.

      U(
      L     "Druck"
      L     200
      >=I                         // Druck >= 200
      )
      U(
      L     "Druck"
      L     800
      <=I                         // Druck <= 800
      )
      =     "Druck_im_Band"`,
      hints: [
        'Ein Vergleichsbefehl **überschreibt** das VKE. Zwei Vergleiche hintereinander ohne Klammern lassen vom ersten nichts übrig.',
        'Du brauchst `L`, `<I`, `>I`, `>=I`, `<=I` sowie `U(` … `)` für die Bereichsprüfung.',
        'NW1: L Druck → L 200 → <I → = Druck_zu_niedrig. NW3: U( L Druck, L 200, >=I ) U( L Druck, L 800, <=I ) → = Druck_im_Band.',
        'Die erste Klammer sieht so aus:\n\n```text\n      U(\n      L     "Druck"\n      L     200\n      >=I\n      )\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Analogwert skalieren',
      level: 4,
      description: `Ein Analogeingang liefert in \`PEW 256\` einen Rohwert von **0 … 27648** (Siemens-Standard für 0 … 10 V).

Rechne ihn in einen Füllstand von **0 … 5000 mm** um und lege das Ergebnis als INT in \`MW 40\` ab.

Formel:

\`\`\`text
Fuellstand = Rohwert * 5000 / 27648
\`\`\`

**Anforderungen**

- In **DINT** rechnen, damit \`Rohwert * 5000\` nicht überläuft (27648 · 5000 ≈ 138 Mio.).
- Ergebnis am Ende wieder nach INT wandeln und transferieren.
- Negative Rohwerte (Drahtbruch bei 4-20 mA) müssen nicht behandelt werden – kommentiere aber, dass das in der Praxis dazugehört.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Rohwert\` | PEW 256 | INT | Analogeingang 0…27648 |
| \`Rohwert_Puffer\` | MW 38 | INT | Zwischenspeicher |
| \`Rechenwert\` | MD 42 | DINT | 32-Bit-Zwischenergebnis |
| \`Fuellstand_mm\` | MW 40 | INT | Füllstand in mm |`,
      starter: `NETZWERK 1
TITEL: Analogwert einlesen
      // TODO

NETZWERK 2
TITEL: Skalierung 0..27648 -> 0..5000 mm
// In DINT rechnen, sonst laeuft die Multiplikation ueber.
      // TODO`,
      solution: `NETZWERK 1
TITEL: Analogwert einlesen
// Peripheriewort direkt lesen und puffern, damit im Netzwerk 2
// ein konsistenter Wert verwendet wird.

      L     PEW 256               // Rohwert direkt von der Baugruppe
      T     "Rohwert_Puffer"

NETZWERK 2
TITEL: Skalierung 0..27648 -> 0..5000 mm
// In DINT rechnen, sonst laeuft die Multiplikation ueber:
// 27648 * 5000 = 138.240.000 passt nicht in INT (max. 32767).
//
// Hinweis fuer die Praxis: Bei 4-20 mA liefert ein Drahtbruch einen
// negativen Rohwert. Dann gehoert hier eine Plausibilitaetspruefung hin
// (z. B. L Rohwert / L 0 / <I / = Drahtbruch).

      L     "Rohwert_Puffer"      // INT
      ITD                         // INT -> DINT
      L     L#5000                // Messbereichsendwert in mm
      *D                          // Akku2 * Akku1, Ergebnis in DINT
      L     L#27648               // Nennwert des Analogeingangs
      /D                          // Akku2 / Akku1
      T     "Rechenwert"          // 32-Bit-Zwischenergebnis sichern

      L     "Rechenwert"
      T     "Fuellstand_mm"       // nur das untere Wort - Wert ist <= 5000,
                                  // passt also sicher in INT`,
      hints: [
        'Die Reihenfolge der Operationen ist entscheidend: erst multiplizieren, dann dividieren – umgekehrt wäre das Ergebnis durch die Ganzzahldivision fast immer 0.',
        'Du brauchst `L`, `ITD`, `*D`, `/D`, `T` und die DINT-Konstanten `L#5000` und `L#27648`.',
        'L Rohwert → ITD → L L#5000 → *D → L L#27648 → /D → T Rechenwert → L Rechenwert → T Fuellstand_mm',
        'Die Umwandlung beginnt so:\n\n```text\n      L     "Rohwert_Puffer"\n      ITD\n      L     L#5000\n      *D\n```\nMerke: `*D` und `/D` rechnen `Akku 2 (op) Akku 1`.',
      ],
    },
  ],
}

export default chapter
