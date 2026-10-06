import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    { id: 'f1', front: 'Woraus besteht eine AWL-Anweisung?', back: 'Aus **Operation** und (meist) **Operand**:\n\n```text\nU     E 0.0\n│     └─ Operand: Eingangsbit 0.0\n└─ Operation: UND-Verknüpfung\n```\n\nManche Operationen haben keinen Operanden (`NOT`, `SET`, `CLR`, `BEA`).' },
    { id: 'f2', front: 'Was ist das VKE?', back: 'Das **Verknüpfungsergebnis** – ein einzelnes Bit im Statuswort, das alle Bit-Operationen (`U`, `O`, `X`, `=`, `S`, `R`) als Arbeitsregister benutzen. AWL liest man deshalb immer als Kette, nie zeilenweise isoliert.' },
    { id: 'f3', front: 'Was ist eine Erstabfrage?', back: 'Die erste Bit-Abfrage nach einem VKE-begrenzenden Befehl. Das Erstabfragebit `/ER` ist dann `0`, und die Abfrage **überschreibt** das VKE statt es zu verknüpfen. Danach ist `/ER = 1`, alle weiteren Abfragen verknüpfen.' },
    { id: 'f4', front: 'Welche Befehle sind VKE-begrenzend?', back: 'U. a. `=`, `S`, `R`, `SPB`, `SPBN`, `CALL`, `BEB`. Sie setzen `/ER := 0` und lösen damit die nächste Erstabfrage aus – so trennen sich aufeinanderfolgende Netzwerke sauber.' },
    { id: 'f5', front: 'Nenne die wichtigsten Operandenbereiche.', back: '`E` Eingang (PAE), `A` Ausgang (PAA), `M` Merker, `L` Lokaldaten, `DB`/`DI` Datenbausteine, `T` Zeiten, `Z` Zähler, `PE`/`PA` Peripherie direkt. Englisch: `I`, `Q`, `M`, `L`, `DB`, `T`, `C`.' },
    { id: 'f6', front: 'Welche Bitnummern sind bei `E 0.x` erlaubt?', back: 'Nur `.0` bis `.7` – ein Byte hat 8 Bit. Nach `E 0.7` folgt `E 1.0`. `E 0.8` ist ein Syntaxfehler.' },
    { id: 'f7', front: 'Welche Bytes belegt `MW 10`?', back: '`MB 10` und `MB 11`. Deshalb überlappen sich `MW 10` und `MW 11` – Wortadressen sollte man im 2er-Raster vergeben (`MW 10`, `MW 12`, `MW 14`).' },
    { id: 'f8', front: 'Was macht die Zuweisung `=`?', back: 'Sie schreibt das aktuelle VKE in den Operanden und beendet die Verknüpfungskette. Sie ist **nicht speichernd**: Wird das VKE `0`, wird der Operand sofort `0`.' },
    { id: 'f9', front: 'Was ist das Prozessabbild (PAE/PAA)?', back: 'Die CPU liest am Zyklusanfang alle Eingänge **einmal** ins PAE und schreibt am Zyklusende das PAA **einmal** auf die Ausgänge. Innerhalb eines Zyklus siehst du ein eingefrorenes Bild. `PE`/`PA` greifen daran vorbei direkt auf die Baugruppe zu.' },
    { id: 'f10', front: 'Absolute vs. symbolische Adressierung?', back: 'Absolut: `U E 0.0` – sagt nichts über die Funktion.\nSymbolisch: `U "Start_Band"` – aufgelöst über die Zuordnungsliste (Symboltabelle).\nSymbolisch ist Pflicht für wartbaren Code; die absolute Adresse gehört in Zuordnungsliste und Klemmenplan.' },
    { id: 'f11', front: 'Was ist der Unterschied zwischen `STA` und `VKE`?', back: '`VKE` ist das Ergebnis der Verknüpfungskette und damit das Arbeitsbit. `STA` (Status) zeigt nur den Signalzustand des **zuletzt adressierten Bits** und dient ausschließlich der Diagnose in der Statusanzeige.' },
    { id: 'f12', front: 'Welchen Stellenwert hat AWL heute?', back: 'AWL ist der Siemens-Dialekt der IEC-61131-3-**IL**, die inzwischen als veraltet gilt. **S7-1200 unterstützt AWL gar nicht**, bei S7-1500 wird SCL empfohlen. Als **Lesekompetenz für S7-300/400-Altanlagen** bleibt AWL in Instandhaltung und Retrofit wertvoll.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Wert hat das VKE nach der letzten Zeile, wenn `E 0.0 = 1`, `E 0.1 = 0` und `E 0.2 = 1` sind?',
      code: `      U     E 0.0
      U     E 0.1
      U     E 0.2`,
      options: ['`1`', '`0`', 'undefiniert', 'abhängig vom vorherigen Netzwerk'],
      correct: 1,
      explanation: 'Erstabfrage setzt VKE := 1 (E 0.0). Dann VKE := 1 UND 0 = 0. Danach VKE := 0 UND 1 = 0. Ein einziges 0-Bit in einer UND-Kette reicht.',
    },
    {
      id: 'q2',
      prompt: 'Wovon hängt `A 4.1` ab, wenn `E 0.0 = 1` und `E 0.1 = 0` sind?',
      code: `      U     E 0.0
      =     A 4.0
      U     E 0.1
      =     A 4.1`,
      options: [
        'von `E 0.0 UND E 0.1`, also `A 4.1 = 0`',
        'nur von `E 0.1`, also `A 4.1 = 0`',
        'nur von `E 0.0`, also `A 4.1 = 1`',
        'von `A 4.0`, also `A 4.1 = 1`',
      ],
      correct: 1,
      explanation: 'Die Zuweisung `=` ist VKE-begrenzend und setzt `/ER := 0`. Das `U E 0.1` ist damit eine **Erstabfrage** und überschreibt das VKE. `A 4.1` hängt ausschließlich an `E 0.1`.',
    },
    {
      id: 'q3',
      prompt: 'Welche Adresse ist ungültig?',
      options: ['`E 0.7`', '`E 1.0`', '`E 0.8`', '`A 4.3`'],
      correct: 2,
      explanation: 'Bits werden innerhalb eines Bytes von `.0` bis `.7` adressiert. Nach `E 0.7` folgt `E 1.0`.',
    },
    {
      id: 'q4',
      prompt: 'Welche beiden Bytes belegt `MW 20`?',
      options: ['`MB 20` und `MB 21`', '`MB 20` und `MB 22`', '`MB 19` und `MB 20`', 'nur `MB 20`'],
      correct: 0,
      explanation: 'Ein Wort ist 16 Bit und beginnt beim angegebenen Byte: `MW 20` = `MB 20` + `MB 21`. Deshalb überlappt `MW 20` mit `MW 21`.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Fehler in diesem Netzwerk?',
      code: `NETZWERK 1: Motor freigeben
      U     "Start"
      U     "NotHalt_OK"
      =     "Motor"
      UN    "Stoerung"`,
      options: [
        '`UN` darf nicht nach einer Zuweisung stehen',
        'Die Störungsabfrage steht nach `=` und wirkt deshalb nicht mehr auf `"Motor"`',
        '`"NotHalt_OK"` müsste mit `O` verknüpft werden',
        'Ein Netzwerk darf nur zwei Abfragen enthalten',
      ],
      correct: 1,
      explanation: 'Nach `=` beginnt eine neue Erstabfrage. `UN "Stoerung"` verändert nur noch das VKE, ohne jemals zugewiesen zu werden – die Zeile ist wirkungslos. Sie muss **vor** die Zuweisung.',
    },
    {
      id: 'q6',
      prompt: 'Welche AWL-Folge setzt `A 4.0`, wenn der Start-Taster betätigt ist und keine Störung ansteht?',
      options: [
        '`U "Start"` / `U "Stoerung"` / `= A 4.0`',
        '`U "Start"` / `UN "Stoerung"` / `= A 4.0`',
        '`O "Start"` / `ON "Stoerung"` / `= A 4.0`',
        '`UN "Start"` / `UN "Stoerung"` / `= A 4.0`',
      ],
      correct: 1,
      explanation: '"Start betätigt" ist `U "Start"`, "keine Störung" ist die negierte UND-Abfrage `UN "Stoerung"`. Beide Bedingungen müssen gleichzeitig gelten, also UND.',
    },
    {
      id: 'q7',
      prompt: 'Warum stimmt der Signalzustand eines Eingangs innerhalb eines Zyklus nie "live" mit der Klemme überein?',
      options: [
        'Weil Eingänge erst nach dem ersten `U` gelesen werden',
        'Weil die CPU am Zyklusanfang das Prozessabbild der Eingänge (PAE) einmal einliest und im Zyklus nicht aktualisiert',
        'Weil Eingänge nur über `PE` adressierbar sind',
        'Weil das VKE die Eingänge überschreibt',
      ],
      correct: 1,
      explanation: 'Der zyklische Ablauf ist: PAE lesen → Anwenderprogramm → PAA schreiben. Innerhalb des Zyklus arbeitest du auf einem eingefrorenen Abbild. Nur `PE`/`PA` greifen direkt auf die Baugruppe zu.',
    },
    {
      id: 'q8',
      prompt: 'Welche Aussage über AWL ist richtig?',
      options: [
        'AWL ist bei S7-1200 die empfohlene Programmiersprache',
        'AWL entspricht der IEC-61131-3-Sprache ST (Structured Text)',
        'AWL entspricht der IEC-61131-3-Sprache IL; S7-1200 unterstützt AWL nicht, Siemens empfiehlt SCL',
        'AWL kann als einzige Sprache auf Bits zugreifen',
      ],
      correct: 2,
      explanation: 'AWL ist Siemens IL. S7-1200 unterstützt kein AWL, bei S7-1500 ist es nur noch möglich, nicht empfohlen. Für S7-300/400-Altanlagen bleibt AWL als Lesekompetenz relevant.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Erste Verknüpfung: Förderband',
      level: 1,
      description: `Schreibe **ein** Netzwerk, das den Bandmotor freigibt.

Der Motor läuft, wenn
- der Start-Taster betätigt ist **und**
- der Not-Halt-Kreis geschlossen ist **und**
- keine Störung ansteht.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Start_Band\` | E 0.0 | BOOL | Taster Start (Schließer) |
| \`NotHalt_OK\` | E 0.1 | BOOL | Not-Halt-Kreis geschlossen (1 = gut) |
| \`Stoerung\` | M 10.0 | BOOL | Sammelstörung |
| \`Motor_Band\` | A 4.0 | BOOL | Schütz K1 Bandmotor |

Adressiere **symbolisch** und kommentiere jede Zeile.`,
      starter: `NETZWERK 1
TITEL: Freigabe Bandmotor
// Motor laeuft bei Start, geschlossenem Not-Halt-Kreis und keiner Stoerung.

      // TODO: Verknuepfung schreiben
      // TODO: Ergebnis zuweisen`,
      solution: `NETZWERK 1
TITEL: Freigabe Bandmotor
// Motor laeuft bei Start, geschlossenem Not-Halt-Kreis und keiner Stoerung.

      U     "Start_Band"          // Start-Taster betaetigt
      U     "NotHalt_OK"          // Not-Halt-Kreis geschlossen
      UN    "Stoerung"            // keine Sammelstoerung
      =     "Motor_Band"          // Schuetz K1 ansteuern`,
      hints: [
        'Alle drei Bedingungen müssen gleichzeitig erfüllt sein – das ist eine UND-Kette (Reihenschaltung).',
        'Du brauchst `U` für positive Abfragen, `UN` für "darf nicht anstehen" und `=` für die Zuweisung.',
        'U Start → U NotHalt_OK → UN Stoerung → = Motor_Band',
        'Die erste Zeile ist eine Erstabfrage: `U "Start_Band"`. Danach verknüpfen alle weiteren Zeilen.',
      ],
    },
    {
      id: 'k2',
      title: 'Sammelstörung und Störlampe',
      level: 2,
      description: `Schreibe **zwei** Netzwerke:

1. **Sammelstörung bilden**: \`Sammelstoerung\` wird 1, sobald *mindestens eine* der drei Einzelstörungen ansteht.
2. **Störlampe ansteuern**: Die Lampe leuchtet, wenn die Sammelstörung ansteht **und** die Anlage eingeschaltet ist.

Achte darauf, dass die beiden Netzwerke durch die Zuweisung sauber getrennt sind (Erstabfrage!).

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Motorschutz\` | E 1.0 | BOOL | Motorschutzschalter ausgelöst |
| \`Ueberdruck\` | E 1.1 | BOOL | Druckwächter ausgelöst |
| \`Temp_hoch\` | E 1.2 | BOOL | Thermokontakt ausgelöst |
| \`Anlage_Ein\` | E 0.0 | BOOL | Hauptschalter Anlage |
| \`Sammelstoerung\` | M 10.0 | BOOL | Sammelmeldung |
| \`Stoerlampe\` | A 4.7 | BOOL | Meldeleuchte Störung |`,
      starter: `NETZWERK 1
TITEL: Sammelstoerung bilden
// Mindestens eine Einzelstoerung steht an.

      // TODO

NETZWERK 2
TITEL: Stoerlampe ansteuern
// Lampe nur bei eingeschalteter Anlage.

      // TODO`,
      solution: `NETZWERK 1
TITEL: Sammelstoerung bilden
// Mindestens eine Einzelstoerung steht an.

      O     "Motorschutz"         // Motorschutzschalter ausgeloest
      O     "Ueberdruck"          // Druckwaechter ausgeloest
      O     "Temp_hoch"           // Thermokontakt ausgeloest
      =     "Sammelstoerung"      // ODER-Verknuepfung aller Einzelmeldungen

NETZWERK 2
TITEL: Stoerlampe ansteuern
// Lampe nur bei eingeschalteter Anlage.

      U     "Sammelstoerung"      // Erstabfrage - neue Kette nach der Zuweisung
      U     "Anlage_Ein"          // Hauptschalter ein
      =     "Stoerlampe"          // Meldeleuchte`,
      hints: [
        '"Mindestens eine" ist eine ODER-Verknüpfung (Parallelschaltung), "beide zugleich" eine UND-Verknüpfung.',
        'Netzwerk 1 braucht `O`, Netzwerk 2 braucht `U`. Beide enden mit `=`.',
        'NW1: O Motorschutz → O Ueberdruck → O Temp_hoch → = Sammelstoerung. NW2: U Sammelstoerung → U Anlage_Ein → = Stoerlampe.',
        'Nach `= "Sammelstoerung"` ist `/ER = 0`, deshalb startet `U "Sammelstoerung"` als Erstabfrage eine neue, unabhängige Kette.',
      ],
    },
    {
      id: 'k3',
      title: 'Tor-Steuerung mit getrennten Netzwerken',
      level: 3,
      description: `Ein Rolltor hat zwei Fahrtrichtungen. Schreibe **drei** Netzwerke:

1. \`Tor_Auf\` ansteuern: Taster AUF betätigt, Endschalter oben **nicht** erreicht, keine Störung, und \`Tor_Zu\` darf **nicht** aktiv sein (gegenseitige Verriegelung).
2. \`Tor_Zu\` ansteuern: Taster ZU betätigt, Endschalter unten **nicht** erreicht, keine Störung, Lichtschranke frei, und \`Tor_Auf\` darf **nicht** aktiv sein.
3. \`Tor_Bewegt\` setzen, wenn eine der beiden Fahrtrichtungen aktiv ist.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Taster_Auf\` | E 0.0 | BOOL | Taster Tor AUF |
| \`Taster_Zu\` | E 0.1 | BOOL | Taster Tor ZU |
| \`ES_Oben\` | E 0.2 | BOOL | Endschalter oben erreicht |
| \`ES_Unten\` | E 0.3 | BOOL | Endschalter unten erreicht |
| \`Lichtschranke_frei\` | E 0.4 | BOOL | 1 = frei |
| \`Stoerung\` | M 10.0 | BOOL | Sammelstörung |
| \`Tor_Auf\` | A 4.0 | BOOL | Schütz Fahrt AUF |
| \`Tor_Zu\` | A 4.1 | BOOL | Schütz Fahrt ZU |
| \`Tor_Bewegt\` | M 10.1 | BOOL | Tor fährt |

**Hinweis:** Ein Schütz-Paar darf niemals gleichzeitig angesteuert werden – sonst Kurzschluss im Hauptstromkreis.`,
      starter: `NETZWERK 1
TITEL: Fahrt AUF
      // TODO

NETZWERK 2
TITEL: Fahrt ZU
      // TODO

NETZWERK 3
TITEL: Sammelmeldung Tor bewegt sich
      // TODO`,
      solution: `NETZWERK 1
TITEL: Fahrt AUF
// Gegenseitige Verriegelung gegen Tor_Zu (Schuetzverriegelung).

      U     "Taster_Auf"          // Taster AUF betaetigt
      UN    "ES_Oben"             // obere Endlage noch nicht erreicht
      UN    "Stoerung"            // keine Sammelstoerung
      UN    "Tor_Zu"              // Gegenrichtung nicht aktiv
      =     "Tor_Auf"             // Schuetz Fahrt AUF

NETZWERK 2
TITEL: Fahrt ZU
// Zusaetzlich Lichtschranke, weil beim Schliessen Quetschgefahr besteht.

      U     "Taster_Zu"           // Taster ZU betaetigt
      UN    "ES_Unten"            // untere Endlage noch nicht erreicht
      UN    "Stoerung"            // keine Sammelstoerung
      U     "Lichtschranke_frei"  // Torbereich frei
      UN    "Tor_Auf"             // Gegenrichtung nicht aktiv
      =     "Tor_Zu"              // Schuetz Fahrt ZU

NETZWERK 3
TITEL: Sammelmeldung Tor bewegt sich

      O     "Tor_Auf"             // Fahrt AUF aktiv
      O     "Tor_Zu"              // oder Fahrt ZU aktiv
      =     "Tor_Bewegt"`,
      hints: [
        'Jede Fahrtrichtung ist eine eigene UND-Kette. Die Verriegelung bedeutet: die jeweils andere Richtung mit `UN` abfragen.',
        'Endschalter "nicht erreicht" und "keine Störung" sind `UN`. "Lichtschranke frei" ist im Gutzustand 1, also `U`.',
        'NW1: U Taster_Auf → UN ES_Oben → UN Stoerung → UN Tor_Zu → = Tor_Auf. NW2 analog mit Lichtschranke. NW3: O Tor_Auf → O Tor_Zu → = Tor_Bewegt.',
        'Netzwerk 1 beginnt so:\n\n```text\n      U     "Taster_Auf"\n      UN    "ES_Oben"\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Code-Review: fehlerhafte Pressensteuerung',
      level: 4,
      description: `Der folgende Code einer Pressensteuerung enthält **vier** Fehler. Schreibe die korrigierte Version und begründe jede Korrektur im Kommentar.

\`\`\`text
NETZWERK 1
      U     E 0.8                 // Schutzgitter geschlossen
      U     E 0.1                 // Zweihand links
      =     A 4.0                 // Pressenhub
      U     E 0.2                 // Zweihand rechts

NETZWERK 2
      U     M 10.0                // Stoerung
      =     A 4.0                 // Pressenhub sperren
\`\`\`

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Schutzgitter_zu\` | E 1.0 | BOOL | Schutzgitter geschlossen (1 = zu) |
| \`Zweihand_links\` | E 0.1 | BOOL | Taster links |
| \`Zweihand_rechts\` | E 0.2 | BOOL | Taster rechts |
| \`Stoerung\` | M 10.0 | BOOL | Sammelstörung |
| \`Pressenhub\` | A 4.0 | BOOL | Ventil Pressenhub |

Die Presse darf nur fahren, wenn **beide** Taster gedrückt sind, das Schutzgitter geschlossen ist und **keine** Störung ansteht.`,
      starter: `NETZWERK 1
TITEL: Freigabe Pressenhub
// Korrigierte Fassung - alle Bedingungen in EINEM Netzwerk, EINE Zuweisung.

      // TODO`,
      solution: `NETZWERK 1
TITEL: Freigabe Pressenhub
// Korrigierte Fassung - alle Bedingungen in EINEM Netzwerk, EINE Zuweisung.
//
// Fehler 1: E 0.8 existiert nicht - Bits gehen nur von .0 bis .7.
//           Laut Zuordnungsliste ist das Schutzgitter E 1.0.
// Fehler 2: Die Abfrage "Zweihand rechts" stand NACH der Zuweisung.
//           Nach "=" beginnt eine Erstabfrage, die Zeile war wirkungslos.
// Fehler 3: A 4.0 wurde in zwei Netzwerken zugewiesen. Das zweite Netzwerk
//           ueberschreibt das erste - und wies bei Stoerung sogar 1 zu.
//           Richtig ist EINE Zuweisung mit "UN Stoerung" in der Kette.
// Fehler 4: Absolute Adressierung ohne Symbole. Symbolisch adressieren.

      U     "Schutzgitter_zu"     // Schutzgitter geschlossen
      U     "Zweihand_links"      // linker Taster gedrueckt
      U     "Zweihand_rechts"     // rechter Taster gedrueckt
      UN    "Stoerung"            // keine Sammelstoerung
      =     "Pressenhub"          // Ventil ansteuern`,
      hints: [
        'Prüfe systematisch: gültige Bitadressen, Reihenfolge rund um die Zuweisung, Mehrfachzuweisung desselben Ausgangs, Adressierungsart.',
        'Relevante Regeln: Bits nur `.0`–`.7`; `=` ist VKE-begrenzend; ein Ausgang darf nur an **einer** Stelle zugewiesen werden; `UN` für "darf nicht anstehen".',
        'Alle vier Bedingungen in eine UND-Kette: Schutzgitter UND links UND rechts UND NICHT Störung → = Pressenhub.',
        'Beginne so:\n\n```text\n      U     "Schutzgitter_zu"\n      U     "Zweihand_links"\n```\nund denke daran, das zweite Netzwerk komplett aufzulösen.',
      ],
    },
  ],
}

export default chapter
