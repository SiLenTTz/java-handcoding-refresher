import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    {
      id: 'f1',
      front: 'Unterschied zwischen `( )`, `(S)` und `(R)`?',
      back: '`( )` **Zuweisung** – schreibt jeden Zyklus den aktuellen Wert (auch `FALSE`).\n`(S)` **Setzen** – schreibt nur `TRUE`.\n`(R)` **Rücksetzen** – schreibt nur `FALSE`.',
    },
    {
      id: 'f2',
      front: 'Welcher Eingang ist beim `SR`-Baustein dominant?',
      back: 'Der **untere**: `R1`. `SR` heißt **Rücksetzen vorrangig** – bei gleichzeitigem `S` und `R1` wird der Ausgang `FALSE`.',
    },
    {
      id: 'f3',
      front: 'Welcher Eingang ist beim `RS`-Baustein dominant?',
      back: 'Der **untere**: `S1`. `RS` heißt **Setzen vorrangig** – bei gleichzeitigem `R` und `S1` wird der Ausgang `TRUE`.',
    },
    {
      id: 'f4',
      front: 'Wie übersetzt du einen `SR`-Baustein nach SCL?',
      back: '```pascal\nIF "Stopp" THEN\n    "Motor" := FALSE;\nELSIF "Start" THEN\n    "Motor" := TRUE;\nEND_IF;\n```\n\nDer dominante Eingang wird zum **ersten** `IF`-Zweig.',
    },
    {
      id: 'f5',
      front: 'Zeichne eine Selbsthaltung ohne SR-Baustein.',
      back: '```text\n            +-------+            +-------+\n  "Start" --|  >=1  |------------|   &   |---( ) "Motor"\n  "Motor" --|       |            |       |\n            +-------+  "Stopp" -o|       |\n                                 +-------+\n```\n\n```pascal\n"Motor" := ("Start" OR "Motor") AND NOT "Stopp";\n```',
    },
    {
      id: 'f6',
      front: 'Was liefert `P_TRIG` am Ausgang `Q`?',
      back: 'Genau **einen Zyklus** `TRUE`, wenn `CLK` von `FALSE` auf `TRUE` wechselt (positive Flanke). Danach wieder `FALSE`, auch wenn `CLK` wahr bleibt.',
    },
    {
      id: 'f7',
      front: 'Warum braucht ein Flankenbaustein einen Flankenmerker?',
      back: 'Er muss den Zustand des **vorherigen Zyklus** kennen, um den Wechsel zu erkennen. Der Merker ist dieses Gedächtnis.',
    },
    {
      id: 'f8',
      front: 'Was passiert, wenn derselbe Flankenmerker an zwei Bausteinen hängt?',
      back: 'Beide überschreiben sich gegenseitig – es entstehen **zufällige, gelegentlich fehlende oder doppelte Flanken**. Jeder Flankenmerker darf nur einmal im Programm vorkommen.',
    },
    {
      id: 'f9',
      front: 'Unterschied `P_TRIG`/`N_TRIG` zu `R_TRIG`/`F_TRIG`?',
      back: 'Funktional gleich. `P_TRIG`/`N_TRIG` nutzen einen **Bit-Merker**, `R_TRIG`/`F_TRIG` einen **Instanz-DB**. In wiederverwendbaren FBs sind `R_TRIG`/`F_TRIG` Pflicht, weil jede Instanz ihr eigenes Gedächtnis braucht.',
    },
    {
      id: 'f10',
      front: 'Warum muss ein Zähleingang `CU` über eine Flanke angesteuert werden?',
      back: 'Ein Dauersignal würde in **jedem Zyklus** hochzählen. Die Flanke liefert genau einen Impuls pro Ereignis.',
    },
    {
      id: 'f11',
      front: 'Was passiert, wenn `(S)` und `(R)` für dasselbe Bit im selben Zyklus aktiv sind?',
      back: 'Es gewinnt die Anweisung, die **weiter unten** im Programm steht – die Priorität hängt von der Netzwerkreihenfolge ab. Beim SR/RS-Baustein ist die Priorität dagegen fest verdrahtet.',
    },
    {
      id: 'f12',
      front: 'Welchen Speicherbaustein nimmst du für einen Antrieb und welchen für eine Störmeldung?',
      back: 'Antrieb → **SR** (Aus hat Vorrang, sicherer Zustand gewinnt).\nStörmeldung → **RS** (Melden hat Vorrang, Störung darf nicht wegquittiert werden, solange sie ansteht).',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: '`"Start"` und `"Stopp"` sind im selben Zyklus beide `TRUE`. Welchen Wert hat `"Motor"`?',
      code: `Netzwerk 1:

                   +--------+
      "Start" -----|S     SR|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+`,
      options: ['`TRUE`', '`FALSE`', 'der Wert bleibt unverändert', 'undefiniert'],
      correct: 1,
      explanation: 'Beim `SR` ist der untere Eingang `R1` dominant – Rücksetzen gewinnt. `"Motor"` wird `FALSE`.',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Übersetzung ist korrekt?',
      code: `Netzwerk 1:

                   +--------+
      "Quitt" -----|R     RS|
                   |        |---( )  "Stoerung_gespeichert"
  "Stoer_roh" -----|S1      |
                   +--------+`,
      options: [
        '`IF "Quitt" THEN x := FALSE; ELSIF "Stoer_roh" THEN x := TRUE; END_IF;`',
        '`IF "Stoer_roh" THEN x := TRUE; ELSIF "Quitt" THEN x := FALSE; END_IF;`',
        '`x := "Stoer_roh" AND NOT "Quitt";`',
        '`x := "Stoer_roh" OR "Quitt";`',
      ],
      correct: 1,
      explanation: '`RS` = Setzen vorrangig, der untere Eingang `S1` gewinnt. Also kommt `"Stoer_roh"` in den ersten `IF`-Zweig.',
    },
    {
      id: 'q3',
      prompt: 'Wie oft wird `"Zaehler"` hochgezählt, wenn ein Werkstück die Lichtschranke 2 Sekunden lang verdeckt (Zykluszeit 5 ms)?',
      code: `Netzwerk 1:

                                       +--------+
   "Lichtschranke" ---------------------|CU   CTU|
                                        +--------+`,
      options: ['einmal', 'zweimal', 'ca. 400-mal – einmal pro Zyklus', 'gar nicht'],
      correct: 2,
      explanation: '`CU` reagiert auf das Signal, nicht auf das Ereignis. Ohne vorgeschaltete `P_TRIG` zählt die CPU in jedem Zyklus weiter: 2000 ms / 5 ms = 400.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler?',
      code: `Netzwerk 1:                        Netzwerk 2:
    +----------+                       +----------+
 A -|CLK P_TRIG|---(S) "X"       B ----|CLK P_TRIG|---(S) "Y"
    |         Q|                       |         Q|
    +----------+                       +----------+
      "M_Fl"                             "M_Fl"`,
      options: [
        '`P_TRIG` darf nicht an `(S)` angeschlossen werden',
        'Beide Bausteine nutzen denselben Flankenmerker und überschreiben sich gegenseitig',
        '`P_TRIG` braucht einen Instanz-DB statt eines Merkers',
        'Kein Fehler – Flankenmerker dürfen geteilt werden',
      ],
      correct: 1,
      explanation: 'Der Flankenmerker speichert den Vorzyklus-Zustand von `CLK`. Zwei Bausteine an einem Merker liefern zufällige Flanken. Jeder braucht einen eigenen.',
    },
    {
      id: 'q5',
      prompt: 'Welche Box gehört an die markierte Stelle, damit `"Motor"` bei gleichzeitigem Start und Stopp **ausgeschaltet** bleibt?',
      code: `Netzwerk 1:

                   +--------+
      "Start" -----|S    ???|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+`,
      options: ['`RS`', '`SR`', '`TON`', '`XOR`'],
      correct: 1,
      explanation: 'Der untere Eingang heißt `R1` – das ist die Beschriftung des `SR`-Bausteins. `SR` = Rücksetzen vorrangig, der sichere Zustand gewinnt.',
    },
    {
      id: 'q6',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1:

            +-------+            +-------+
  "Start" --|       |            |       |
            |  >=1  |------------|   &   |------( )  "Motor"
  "Motor" --|       |            |       |
            +-------+  "Stopp" -o|       |
                                 +-------+`,
      options: [
        '`"Motor" := "Start" OR "Motor" AND NOT "Stopp";`',
        '`"Motor" := ("Start" OR "Motor") AND NOT "Stopp";`',
        '`"Motor" := "Start" AND "Motor" AND NOT "Stopp";`',
        '`"Motor" := NOT ("Start" OR "Motor" OR "Stopp");`',
      ],
      correct: 1,
      explanation: 'Klassische Selbsthaltung: Der Ausgang wird auf einen ODER-Eingang zurückgeführt, `"Stopp"` sperrt negiert die UND-Box. Die Klammer ist zwingend, weil `AND` sonst stärker bindet.',
    },
    {
      id: 'q7',
      prompt: 'Wo ist der Fehler?',
      code: `Netzwerk 1:
                   +--------+
      "Start" -----|S     SR|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+

Netzwerk 5:
     "Hand" ----------------------( )  "Motor"`,
      options: [
        'Der SR-Baustein braucht einen Instanz-DB',
        'Netzwerk 5 weist `"Motor"` direkt zu und löscht damit die Selbsthaltung jeden Zyklus',
        '`"Hand"` müsste negiert werden',
        'Kein Fehler – beide Netzwerke wirken wie ein ODER',
      ],
      correct: 1,
      explanation: 'Die Zuweisung `( )` schreibt jeden Zyklus – auch `FALSE`. Richtig ist, `"Hand"` über eine ODER-Box auf den `S`-Eingang zu führen.',
    },
    {
      id: 'q8',
      prompt: '`"Taster"` wird 3 Sekunden lang gedrückt gehalten. Wie lange ist `"Q"` wahr?',
      code: `Netzwerk 1:

                   +----------+
     "Taster" -----|CLK P_TRIG|--- "Q"
                   |         Q|
                   +----------+
                     "M_Fl_T"`,
      options: ['3 Sekunden', 'einen Zyklus', 'bis zur nächsten negativen Flanke', 'gar nicht'],
      correct: 1,
      explanation: '`P_TRIG` macht aus einem Zustand ein Ereignis: `Q` ist genau einen Zyklus lang `TRUE`, unabhängig davon, wie lange `CLK` anliegt.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Selbsthaltung mit SR-Baustein',
      level: 1,
      description: `Zeichne das Netzwerk für eine Motorsteuerung mit Speicher.

**Aufgabe:** \`"Motor"\` wird mit \`"Taster_Start"\` eingeschaltet und bleibt an. \`"Taster_Stopp"\` schaltet ihn aus. Bei gleichzeitiger Betätigung soll der Motor **ausgehen**.

**Zuordnungsliste**

- \`"Taster_Start"\` – Bool, Schließer
- \`"Taster_Stopp"\` – Bool, Schließer
- \`"Motor"\` – Bool

Zeichne das Netzwerk und schreibe die SCL-Entsprechung darunter.`,
      starter: `Netzwerk 1: Motor-Selbsthaltung

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Motor-Selbsthaltung

                        +--------+
      "Taster_Start" ---|S     SR|
                        |        |------( )  "Motor"
      "Taster_Stopp" ---|R1      |
                        +--------+


SCL:
IF "Taster_Stopp" THEN
    "Motor" := FALSE;
ELSIF "Taster_Start" THEN
    "Motor" := TRUE;
END_IF;`,
      hints: [
        'Der Zustand muss über Zyklen hinweg gespeichert werden, und Ausschalten hat Vorrang.',
        'Du brauchst den `SR`-Baustein – der untere Eingang `R1` ist dominant.',
        '`"Taster_Start"` auf den oberen Eingang `S`, `"Taster_Stopp"` auf den unteren `R1`. Der Ausgang geht auf die Zuweisung `( )` mit `"Motor"`.',
        'Gerüst:\n\n```text\n                        +--------+\n      "Taster_Start" ---|?     SR|\n                        |        |---( ) "Motor"\n      "Taster_Stopp" ---|?       |\n                        +--------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Speicher-Netzwerk übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk nach SCL.

Achte auf den Vorrang: Welcher Eingang gewinnt bei gleichzeitiger Ansteuerung?`,
      given: `Netzwerk 1: Stoerung speichern

                       +--------+
        "Quittieren" --|R     RS|
                       |        |------( )  "Stoer_gespeichert"
  "Motorschutz_ausg" --|S1      |
                       +--------+`,
      starter: `SCL:
// TODO`,
      solution: `SCL:
IF "Motorschutz_ausg" THEN
    "Stoer_gespeichert" := TRUE;
ELSIF "Quittieren" THEN
    "Stoer_gespeichert" := FALSE;
END_IF;`,
      hints: [
        'Beim Baustein entscheidet der untere Eingang bei gleichzeitiger Ansteuerung.',
        'Es ist ein `RS`-Baustein: unten steht `S1`, also ist **Setzen** vorrangig.',
        'Der dominante Eingang wird zum ersten `IF`-Zweig, der andere zum `ELSIF`.',
        '```pascal\nIF "Motorschutz_ausg" THEN\n    ...\nELSIF ...\nEND_IF;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Teile zählen mit Flanke',
      level: 3,
      description: `Zeichne das Netzwerk zu dieser Aufgabe.

**Aufgabe:** Jedes Werkstück, das die Lichtschranke verdeckt, soll **genau einmal** gezählt werden. Das Zählsignal geht an den Eingang \`CU\` des Zählers \`"DB_Teile"\`.

**Zuordnungsliste**

- \`"Lichtschranke"\` – Bool, TRUE solange ein Teil die Schranke verdeckt
- \`"M_Fl_LS"\` – Bool, Flankenmerker
- \`"DB_Teile"\` – CTU-Instanz
- \`"Reset_Charge"\` – Bool
- Sollwert \`PV\` = 100

Zeichne das Netzwerk mit \`P_TRIG\` und \`CTU\` und schreibe die SCL-Entsprechung darunter.`,
      starter: `Netzwerk 1: Teile zaehlen

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Teile zaehlen

                     +----------+        +-----------+
                     | P_TRIG   |        |    CTU    |
                     |          |        | "DB_Teile"|
 "Lichtschranke" ----|CLK      Q|--------|CU        Q|------( )  "Charge_voll"
                     +----------+        |         CV|------     "Ist_Anzahl"
                        "M_Fl_LS"        |           |
                    "Reset_Charge" ------|R          |
                               100 ------|PV         |
                                         +-----------+


SCL:
"P_LS"(CLK := "Lichtschranke");
"DB_Teile"(CU := "P_LS".Q, R := "Reset_Charge", PV := 100);
"Charge_voll" := "DB_Teile".Q;
"Ist_Anzahl"  := "DB_Teile".CV;`,
      hints: [
        'Ein Dauersignal am Zähleingang zählt jeden Zyklus hoch – du brauchst ein Ereignis statt eines Zustands.',
        'Schalte `P_TRIG` (mit eigenem Flankenmerker) zwischen die Lichtschranke und den `CU`-Eingang des `CTU`.',
        'Links `"Lichtschranke"` an `CLK` der `P_TRIG`-Box. Deren `Q` auf `CU` des Zählers. `"Reset_Charge"` an `R`, `100` an `PV`. `Q` und `CV` rechts auswerten.',
        'Gerüst:\n\n```text\n                     +----------+        +-----------+\n "Lichtschranke" ----|CLK      Q|--------|CU   CTU  Q|---( ) "???"\n                     +----------+        |         CV|---\n                        "M_Fl_LS"        |R          |\n                                         |PV         |\n                                         +-----------+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Fehlerhafte Speicherlogik korrigieren',
      level: 4,
      description: `Das vorgegebene Programm hat **zwei** Fehler:

1. Netzwerk 5 weist \`"Tor_auf"\` direkt zu und zerstört damit die Selbsthaltung aus Netzwerk 1.
2. Der Zähler in Netzwerk 8 wird ohne Flanke angesteuert.

Schreibe beide Teile korrekt: Führe die zweite Einschaltquelle über eine ODER-Box auf den \`S\`-Eingang und schalte vor den Zähleingang eine \`P_TRIG\`-Box. Gib zu beiden Netzwerken auch die SCL-Entsprechung an.`,
      given: `Netzwerk 1: Tor-Steuerung (FEHLERHAFT)
                   +--------+
   "Taster_Auf" ---|S     SR|
                   |        |------( )  "Tor_auf"
   "Taster_Zu"  ---|R1      |
                   +--------+

Netzwerk 5:
   "Funk_Auf" --------------------( )  "Tor_auf"

Netzwerk 8: Durchfahrten zaehlen (FEHLERHAFT)
                                   +-----------+
   "Lichtschranke" -----------------|CU   CTU  Q|---( ) "Wartung_faellig"
                           1000 ----|PV       CV|
                                    +-----------+`,
      starter: `Netzwerk 1: Tor-Steuerung (korrigiert)

// TODO


Netzwerk 8: Durchfahrten zaehlen (korrigiert)

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Tor-Steuerung (korrigiert)

                      +-------+       +--------+
      "Taster_Auf" ---|       |       |      SR|
                      |  >=1  |-------|S       |------( )  "Tor_auf"
        "Funk_Auf" ---|       |       |        |
                      +-------+       |        |
       "Taster_Zu" ------------------ |R1      |
                                      +--------+


Netzwerk 8: Durchfahrten zaehlen (korrigiert)

                     +----------+        +-----------+
                     | P_TRIG   |        |    CTU    |
                     |          |        |"DB_Durchf"|
 "Lichtschranke" ----|CLK      Q|--------|CU        Q|---( ) "Wartung_faellig"
                     +----------+        |         CV|---
                        "M_Fl_LS"        |           |
                  "Wartung_quitt" -------|R          |
                             1000 -------|PV         |
                                         +-----------+


SCL:
IF "Taster_Zu" THEN
    "Tor_auf" := FALSE;
ELSIF "Taster_Auf" OR "Funk_Auf" THEN
    "Tor_auf" := TRUE;
END_IF;

"P_LS"(CLK := "Lichtschranke");
"DB_Durchf"(CU := "P_LS".Q, R := "Wartung_quitt", PV := 1000);
"Wartung_faellig" := "DB_Durchf".Q;`,
      hints: [
        'Ein gespeichertes Bit darf nie zusätzlich per `( )` zugewiesen werden, und Zähleingänge brauchen ein Ereignis statt eines Zustands.',
        'Netzwerk 1: `>=1`-Box vor dem `S`-Eingang des `SR`. Netzwerk 8: `P_TRIG` zwischen Lichtschranke und `CU`, plus ein `R`-Eingang.',
        'Beide Einschaltquellen in die ODER-Box, deren Ausgang auf `S`. `"Taster_Zu"` bleibt direkt an `R1`. Beim Zähler kommt die Flankenbox davor und der Reset wird verdrahtet.',
        'Gerüst Netzwerk 1:\n\n```text\n                      +-------+       +--------+\n      "Taster_Auf" ---|  >=1  |-------|S     SR|---( ) "Tor_auf"\n        "Funk_Auf" ---|       |       |        |\n                      +-------+       |        |\n       "Taster_Zu" ---------------- --|R1      |\n                                      +--------+\n```',
      ],
    },
  ],
}

export default chapter
