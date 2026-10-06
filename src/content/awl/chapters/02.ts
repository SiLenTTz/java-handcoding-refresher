import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    { id: 'f1', front: 'Was machen `U`, `O` und `X`?', back: '`U` verknüpft das VKE UND mit dem Operanden, `O` ODER, `X` exklusiv-ODER (Antivalenz). Mit angehängtem `N` (`UN`, `ON`, `XN`) wird der **Operand** vor der Verknüpfung invertiert.' },
    { id: 'f2', front: 'Reihenschaltung und Parallelschaltung in AWL?', back: 'Reihe = UND-Kette (`U`, `U`, `U`), Parallel = ODER-Kette (`O`, `O`, `O`). Das ist die direkte Übersetzung des Stromlaufplans in Anweisungen.' },
    { id: 'f3', front: 'Was bedeutet die UND-vor-ODER-Regel?', back: 'Eine ununterbrochene Folge von `U`-Anweisungen bildet ein UND-Glied; ein `O` **ohne Operand** schließt dieses Glied ab und verodert es mit dem nächsten:\n\n```text\nU  "Automatik"\nU  "Sensor"\nO\nU  "Hand"\nU  "Tipp"\n```\nentspricht `(Automatik AND Sensor) OR (Hand AND Tipp)`.' },
    { id: 'f4', front: 'Was passiert bei `U(`?', back: 'VKE **und** `/ER` werden auf den Klammerstack gelegt und `/ER := 0` gesetzt – innen beginnt also eine neue Erstabfrage. Bei `)` wird das innere Ergebnis mit dem geretteten VKE UND-verknüpft.' },
    { id: 'f5', front: 'Wann brauchst du überhaupt Klammern?', back: 'Immer wenn **ODER vor UND** gelten soll:\n\n```text\nU(\nO  "Hand"\nO  "Automatik"\n)\nU  "Tuer_zu"\n```\nOhne Klammer würde `Hand ODER (Automatik UND Tuer_zu)` herauskommen.' },
    { id: 'f6', front: 'Wie tief darf man bei S7-300/400 klammern?', back: 'Der Klammerstack fasst **7** Ebenen. Lesbar sind in der Praxis höchstens zwei bis drei – tiefer verschachtelte Logik gehört in einen eigenen FC.' },
    { id: 'f7', front: 'Unterschied `NOT` und `UN`?', back: '`NOT` invertiert das **VKE** (also das bisherige Gesamtergebnis), `UN` invertiert nur den **Operanden**:\n\n```text\nU  "A"\nU  "B"\nNOT        // NICHT (A UND B)\n\nU  "A"\nUN "B"     // A UND NICHT B\n```' },
    { id: 'f8', front: 'Was machen `SET` und `CLR`?', back: '`SET` setzt das VKE hart auf `1`, `CLR` auf `0` – beide ohne Operand und unabhängig von allem davor. Zusätzlich wird `/ER := 1` gesetzt, sodass danach normal weiterverknüpft wird.' },
    { id: 'f9', front: 'Wie realisierst du eine Wechselschaltung (zwei Schalter, ein Licht)?', back: '```text\nU     "Schalter_1"\nX     "Schalter_2"\n=     "Licht"\n```\nXOR: Das Licht ist an, wenn genau einer der beiden Schalter betätigt ist.' },
    { id: 'f10', front: 'Wie prüfst du, ob zwei Bits **gleich** sind?', back: 'Antivalenz invertieren:\n\n```text\nU     "Soll"\nX     "Ist"\nNOT\n=     "Werte_gleich"\n```' },
    { id: 'f11', front: 'Warum ist das operandenlose `O` schlechter Stil?', back: 'Es ist funktional korrekt, aber unsichtbar: Beim Überfliegen sieht man die Gruppierung nicht. Klammern (`U(` … `)`) machen die Struktur explizit und sind in Reviews deutlich sicherer.' },
    { id: 'f12', front: 'Wie formuliert man lange Verknüpfungen lesbar?', back: 'In Zwischenmerker zerlegen: Teilbedingungen mit sprechenden Namen (`"Freigabe_Antrieb"`, `"Freigabe_Hydraulik"`) in eigenen Netzwerken bilden und erst danach zusammenführen. Außerdem: positiv benennen (`"Tuer_zu"` statt `UN "Tuer_offen"`).' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Wert hat das VKE nach der letzten Zeile, wenn `E 0.0 = 0`, `E 0.1 = 1` und `E 0.2 = 1` sind?',
      code: `      U     E 0.0
      O     E 0.1
      U     E 0.2`,
      options: ['`0`', '`1`', 'undefiniert', '`E 0.2`'],
      correct: 1,
      explanation: 'Erstabfrage: VKE := 0. Dann VKE := 0 ODER 1 = 1. Dann VKE := 1 UND 1 = 1. Die Operationen werden streng von oben nach unten ausgeführt.',
    },
    {
      id: 'q2',
      prompt: 'Welcher Logik entspricht dieser Code?',
      code: `      U     "Automatik"
      U     "Sensor"
      O
      U     "Hand"
      U     "Tipp"
      =     "Freigabe"`,
      options: [
        '`Automatik AND Sensor AND Hand AND Tipp`',
        '`Automatik AND (Sensor OR Hand) AND Tipp`',
        '`(Automatik AND Sensor) OR (Hand AND Tipp)`',
        '`Automatik OR Sensor OR Hand OR Tipp`',
      ],
      correct: 2,
      explanation: 'Das operandenlose `O` trennt zwei UND-Glieder. Das ist die UND-vor-ODER-Regel – lesbarer schreibt man dasselbe mit `O(` … `)`.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Fehler?',
      code: `      O     "Hand"
      O     "Automatik"
      U     "Tuer_zu"
      =     "Freigabe"`,
      options: [
        '`O` darf nicht als Erstabfrage stehen',
        'Die Klammer um die ODER-Gruppe fehlt – es ergibt sich `Hand OR (Automatik AND Tuer_zu)`',
        '`U` und `O` dürfen nicht gemischt werden',
        '`=` muss vor der Verknüpfung stehen',
      ],
      correct: 1,
      explanation: 'Ohne Klammer gilt UND vor ODER: `Tuer_zu` wirkt nur auf `Automatik`. Richtig ist `U( O "Hand" O "Automatik" ) U "Tuer_zu"`.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat das VKE nach `)`, wenn `E 0.0 = 1`, `E 0.1 = 0` und `E 0.2 = 1` sind?',
      code: `      U     E 0.0
      U(
      O     E 0.1
      O     E 0.2
      )`,
      options: ['`0`', '`1`', 'abhängig vom OR-Bit', 'undefiniert'],
      correct: 1,
      explanation: 'Vor `U(` ist VKE = 1 (E 0.0). Innen beginnt eine Erstabfrage: 0 ODER 1 = 1. Bei `)` wird das gerettete VKE damit UND-verknüpft: 1 UND 1 = 1.',
    },
    {
      id: 'q5',
      prompt: 'Welchen Wert hat `A 4.0`, wenn `E 0.0 = 1` und `E 0.1 = 1` sind?',
      code: `      U     E 0.0
      U     E 0.1
      NOT
      =     A 4.0`,
      options: ['`1`', '`0`', 'abhängig von `E 0.1`', 'undefiniert'],
      correct: 1,
      explanation: '`NOT` invertiert das VKE: 1 UND 1 = 1, invertiert = 0. Hätte man `A UND NICHT B` gewollt, wäre `UN E 0.1` richtig gewesen.',
    },
    {
      id: 'q6',
      prompt: 'Welche AWL-Folge entspricht `Freigabe := (Hand OR Automatik) AND Tuer_zu AND NOT Stoerung;`?',
      options: [
        '`O "Hand"` / `O "Automatik"` / `U "Tuer_zu"` / `UN "Stoerung"` / `= "Freigabe"`',
        '`U( O "Hand" O "Automatik" )` / `U "Tuer_zu"` / `UN "Stoerung"` / `= "Freigabe"`',
        '`U "Hand"` / `U "Automatik"` / `U "Tuer_zu"` / `U "Stoerung"` / `= "Freigabe"`',
        '`U( U "Hand" U "Automatik" )` / `O "Tuer_zu"` / `ON "Stoerung"` / `= "Freigabe"`',
      ],
      correct: 1,
      explanation: 'Die ODER-Gruppe muss geklammert werden, damit sie vor dem UND ausgewertet wird. `NOT Stoerung` wird zu `UN "Stoerung"`.',
    },
    {
      id: 'q7',
      prompt: 'Welchen Wert hat `A 4.0`, wenn `E 0.0 = 0` ist?',
      code: `      U     E 0.0
      SET
      =     A 4.0`,
      options: ['`0`', '`1`', 'abhängig von `E 0.0`', 'Übersetzungsfehler'],
      correct: 1,
      explanation: '`SET` setzt das VKE bedingungslos auf 1 und macht die vorherige Abfrage wirkungslos. Genau deshalb gehört `SET` nie mitten in eine Verknüpfungskette.',
    },
    {
      id: 'q8',
      prompt: 'Wann liefert diese Folge VKE = 1?',
      code: `      U     "Schalter_1"
      X     "Schalter_2"`,
      options: [
        'wenn beide Schalter betätigt sind',
        'wenn keiner der beiden betätigt ist',
        'wenn genau einer der beiden betätigt ist',
        'immer',
      ],
      correct: 2,
      explanation: 'XOR (Antivalenz) ist 1, wenn sich die beiden Signale unterscheiden – die klassische Wechselschaltung.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Betriebsartenwahl mit Klammer',
      level: 1,
      description: `Schreibe **ein** Netzwerk für die Freigabe eines Förderbands.

Freigabe gilt, wenn
- **Hand-** *oder* **Automatikbetrieb** gewählt ist, **und**
- die Schutztür geschlossen ist, **und**
- keine Störung ansteht.

Nutze eine **Klammer**, nicht das operandenlose \`O\`.

**Zuordnungsliste**

| Symbol | Operand | Typ |
|---|---|---|
| \`Hand\` | E 0.0 | BOOL |
| \`Automatik\` | E 0.1 | BOOL |
| \`Schutztuer_zu\` | E 0.2 | BOOL |
| \`Stoerung\` | M 10.0 | BOOL |
| \`Freigabe_Band\` | M 20.0 | BOOL |`,
      starter: `NETZWERK 1
TITEL: Freigabe Foerderband
// (Hand ODER Automatik) UND Schutztuer zu UND keine Stoerung

      // TODO`,
      solution: `NETZWERK 1
TITEL: Freigabe Foerderband
// (Hand ODER Automatik) UND Schutztuer zu UND keine Stoerung

      U(
      O     "Hand"                // Betriebsart Hand
      O     "Automatik"           // oder Betriebsart Automatik
      )
      U     "Schutztuer_zu"       // Schutztuer geschlossen
      UN    "Stoerung"            // keine Sammelstoerung
      =     "Freigabe_Band"`,
      hints: [
        'Die ODER-Gruppe muss zuerst ausgewertet werden – sonst wirkt die Schutztür nur auf "Automatik".',
        'Du brauchst `U(`, zwei `O`, `)`, dann `U` und `UN`, am Ende `=`.',
        'U( O Hand O Automatik ) → U Schutztuer_zu → UN Stoerung → = Freigabe_Band',
        'Die Klammer beginnt so:\n\n```text\n      U(\n      O     "Hand"\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Geschachtelte Freigabe-Logik',
      level: 2,
      description: `Eine Presse wird freigegeben, wenn

\`\`\`text
(Zweihand_links UND Zweihand_rechts) ODER (Fussschalter UND Einrichtbetrieb)
\`\`\`

erfüllt ist **und** gleichzeitig das Schutzgitter geschlossen ist **und** keine Störung ansteht.

Schreibe ein Netzwerk mit **Klammern** (kein operandenloses \`O\`).

**Zuordnungsliste**

| Symbol | Operand | Typ |
|---|---|---|
| \`Zweihand_links\` | E 0.0 | BOOL |
| \`Zweihand_rechts\` | E 0.1 | BOOL |
| \`Fussschalter\` | E 0.2 | BOOL |
| \`Einrichtbetrieb\` | E 0.3 | BOOL |
| \`Schutzgitter_zu\` | E 1.0 | BOOL |
| \`Stoerung\` | M 10.0 | BOOL |
| \`Pressenhub\` | A 4.0 | BOOL |`,
      starter: `NETZWERK 1
TITEL: Freigabe Pressenhub
// (Zweihand links UND rechts) ODER (Fussschalter UND Einrichtbetrieb),
// zusaetzlich Schutzgitter zu und keine Stoerung.

      // TODO`,
      solution: `NETZWERK 1
TITEL: Freigabe Pressenhub
// (Zweihand links UND rechts) ODER (Fussschalter UND Einrichtbetrieb),
// zusaetzlich Schutzgitter zu und keine Stoerung.

      U(
      U(
      U     "Zweihand_links"      // beide Taster der Zweihandbedienung
      U     "Zweihand_rechts"
      )
      O(
      U     "Fussschalter"        // oder Fussschalter im Einrichtbetrieb
      U     "Einrichtbetrieb"
      )
      )
      U     "Schutzgitter_zu"     // Schutzgitter geschlossen
      UN    "Stoerung"            // keine Sammelstoerung
      =     "Pressenhub"`,
      hints: [
        'Die ODER-Verknüpfung der beiden UND-Gruppen ist ein Teilausdruck – er muss als Ganzes mit den restlichen Bedingungen UND-verknüpft werden.',
        'Du brauchst eine äußere Klammer `U( … )` und darin zwei innere Gruppen: `U( … )` und `O( … )`.',
        'U( [ U( links UND rechts ) O( Fuss UND Einricht ) ] ) → U Schutzgitter_zu → UN Stoerung → = Pressenhub',
        'Gerüst:\n\n```text\n      U(\n      U(\n      U     "Zweihand_links"\n      U     "Zweihand_rechts"\n      )\n      O(\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Antivalenz: Drehrichtungsüberwachung',
      level: 3,
      description: `Ein Antrieb hat zwei Rückmeldekontakte, die im Normalbetrieb **immer unterschiedlich** sein müssen (einer meldet "links", der andere "rechts").

Schreibe **drei** Netzwerke:

1. \`Richtung_plausibel\`: 1, wenn **genau einer** der beiden Kontakte 1 ist (Antivalenz).
2. \`Drahtbruch\`: 1, wenn **beide** Kontakte gleich sind – also wenn \`Richtung_plausibel\` **nicht** gilt. Löse das mit \`X\` + \`NOT\` direkt aus den Kontakten, nicht über den Merker aus Netzwerk 1.
3. \`Antrieb_Frei\`: Antrieb freigeben, wenn die Richtung plausibel ist, der Freigabeschalter an ist und keine Störung ansteht.

**Zuordnungsliste**

| Symbol | Operand | Typ |
|---|---|---|
| \`RM_Links\` | E 2.0 | BOOL |
| \`RM_Rechts\` | E 2.1 | BOOL |
| \`Freigabe_Schalter\` | E 0.0 | BOOL |
| \`Stoerung\` | M 10.0 | BOOL |
| \`Richtung_plausibel\` | M 20.0 | BOOL |
| \`Drahtbruch\` | M 20.1 | BOOL |
| \`Antrieb_Frei\` | A 4.0 | BOOL |`,
      starter: `NETZWERK 1
TITEL: Richtung plausibel (Antivalenz)
      // TODO

NETZWERK 2
TITEL: Drahtbrucherkennung (beide Kontakte gleich)
      // TODO

NETZWERK 3
TITEL: Antriebsfreigabe
      // TODO`,
      solution: `NETZWERK 1
TITEL: Richtung plausibel (Antivalenz)
// Genau ein Rueckmeldekontakt darf anstehen.

      U     "RM_Links"            // Erstabfrage
      X     "RM_Rechts"           // Antivalenz: 1, wenn die Signale verschieden sind
      =     "Richtung_plausibel"

NETZWERK 2
TITEL: Drahtbrucherkennung (beide Kontakte gleich)
// Beide 0 = Kabelbruch, beide 1 = Kurzschluss -> in beiden Faellen unplausibel.

      U     "RM_Links"
      X     "RM_Rechts"
      NOT                         // VKE invertieren -> Aequivalenz
      =     "Drahtbruch"

NETZWERK 3
TITEL: Antriebsfreigabe

      U     "Richtung_plausibel"  // Rueckmeldung stimmig
      U     "Freigabe_Schalter"   // Freigabe durch Bediener
      UN    "Stoerung"            // keine Sammelstoerung
      =     "Antrieb_Frei"`,
      hints: [
        '"Genau einer von beiden" ist exklusiv-ODER. "Beide gleich" ist die Negation davon (Äquivalenz).',
        'Du brauchst `X` für die Antivalenz und `NOT` – nicht `XN`, denn `XN` würde nur den Operanden invertieren.',
        'NW1: U RM_Links → X RM_Rechts → = Richtung_plausibel. NW2: dieselbe Verknüpfung, danach NOT → = Drahtbruch. NW3: normale UND-Kette.',
        'Netzwerk 2:\n\n```text\n      U     "RM_Links"\n      X     "RM_Rechts"\n      NOT\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Refactoring: unleserliche Verknüpfung entwirren',
      level: 4,
      description: `Dieses Netzwerk stammt aus einer Altanlage. Es ist funktional in Ordnung, aber unlesbar:

\`\`\`text
NETZWERK 1
      U     E 0.0
      U     E 0.1
      UN    M 10.0
      O
      U     E 0.2
      U     E 0.3
      UN    M 10.0
      O
      U     E 0.4
      UN    M 10.0
      U     E 0.5
      =     A 4.0
\`\`\`

**Aufgabe:** Schreibe die Logik mit **Zwischenmerkern** und **Klammern** so um, dass

- die gemeinsame Bedingung \`UN "Stoerung"\` nur **einmal** vorkommt,
- jede Betriebsart ein eigenes, benanntes Zwischenergebnis bekommt,
- das Endnetzwerk in einem Blick lesbar ist.

**Zuordnungsliste**

| Symbol | Operand | Typ | Bedeutung |
|---|---|---|---|
| \`Auto_Start\` | E 0.0 | BOOL | Start im Automatikbetrieb |
| \`Auto_Bereit\` | E 0.1 | BOOL | Automatik bereit |
| \`Hand_Start\` | E 0.2 | BOOL | Start im Handbetrieb |
| \`Hand_Freigabe\` | E 0.3 | BOOL | Hand-Freigabeschalter |
| \`Einricht_Tipp\` | E 0.4 | BOOL | Tipptaster Einrichtbetrieb |
| \`Einricht_Wahl\` | E 0.5 | BOOL | Wahlschalter Einrichten |
| \`Stoerung\` | M 10.0 | BOOL | Sammelstörung |
| \`Anf_Automatik\` | M 20.0 | BOOL | Anforderung Automatik |
| \`Anf_Hand\` | M 20.1 | BOOL | Anforderung Hand |
| \`Anf_Einrichten\` | M 20.2 | BOOL | Anforderung Einrichten |
| \`Motor\` | A 4.0 | BOOL | Antrieb |`,
      starter: `NETZWERK 1
TITEL: Anforderung Automatikbetrieb
      // TODO

NETZWERK 2
TITEL: Anforderung Handbetrieb
      // TODO

NETZWERK 3
TITEL: Anforderung Einrichtbetrieb
      // TODO

NETZWERK 4
TITEL: Motor ansteuern
// Eine Anforderung reicht, Stoerung sperrt alles.
      // TODO`,
      solution: `NETZWERK 1
TITEL: Anforderung Automatikbetrieb

      U     "Auto_Start"          // Start im Automatikbetrieb
      U     "Auto_Bereit"         // Automatik meldet bereit
      =     "Anf_Automatik"

NETZWERK 2
TITEL: Anforderung Handbetrieb

      U     "Hand_Start"          // Start im Handbetrieb
      U     "Hand_Freigabe"       // Hand-Freigabeschalter
      =     "Anf_Hand"

NETZWERK 3
TITEL: Anforderung Einrichtbetrieb

      U     "Einricht_Tipp"       // Tipptaster
      U     "Einricht_Wahl"       // Wahlschalter Einrichten
      =     "Anf_Einrichten"

NETZWERK 4
TITEL: Motor ansteuern
// Eine Anforderung reicht, Stoerung sperrt alles.
// Die Stoerungsabfrage steht jetzt nur noch an EINER Stelle.

      U(
      O     "Anf_Automatik"
      O     "Anf_Hand"
      O     "Anf_Einrichten"
      )
      UN    "Stoerung"
      =     "Motor"`,
      hints: [
        'Die gemeinsame Bedingung lässt sich ausklammern: `(A OR B OR C) AND NOT Stoerung` statt `(A AND NOT S) OR (B AND NOT S) OR (C AND NOT S)`.',
        'Pro Betriebsart ein Netzwerk mit `U`/`U` und `=` auf einen Anforderungsmerker. Im letzten Netzwerk `U(` + drei `O` + `)` und `UN "Stoerung"`.',
        'NW1-3: je zwei UND-Abfragen → Anforderungsmerker. NW4: U( O Anf_Automatik O Anf_Hand O Anf_Einrichten ) → UN Stoerung → = Motor.',
        'Das letzte Netzwerk beginnt so:\n\n```text\n      U(\n      O     "Anf_Automatik"\n      O     "Anf_Hand"\n```',
      ],
    },
  ],
}

export default chapter
