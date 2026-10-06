import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    {
      id: 'f1',
      front: 'Welche Verknüpfung entsteht durch eine Reihenschaltung von Kontakten?',
      back: '**UND (AND)** – der Strom muss durch alle Kontakte.\n\n```text\n     A         B        Y\n  ----| |------| |-----( )----\n```\n\n`"Y" := "A" AND "B";`',
    },
    {
      id: 'f2',
      front: 'Welche Verknüpfung entsteht durch eine Parallelschaltung (Verzweigung)?',
      back: '**ODER (OR)** – es genügt ein leitender Weg.\n\n```text\n     A              Y\n  +---| |---+-------( )----\n  |         |\n  | B       |\n  +---| |---+\n```',
    },
    {
      id: 'f3',
      front: 'Wie entspricht eine Verzweigung der SCL-Syntax?',
      back: 'Eine Verzweigung ist eine **Klammer**. Sie öffnet, wo sich der Pfad teilt, und schließt, wo die Zweige zusammenlaufen: `("Hand" OR "Auto") AND "Freigabe"`.',
    },
    {
      id: 'f4',
      front: 'Wie sieht eine Selbsthaltung mit vorrangigem Aus aus?',
      back: '```text\n     Start              Stopp          Motor\n  +---| |---+-------------|/|---------( )----\n  |         |\n  | Motor   |\n  +---| |---+\n```\n\n`"Motor" := ("Start" OR "Motor") AND NOT "Stopp";`',
    },
    {
      id: 'f5',
      front: 'Was macht den Haltekontakt einer Selbsthaltung aus?',
      back: 'Er fragt den **eigenen Ausgang** (bzw. Merker) parallel zum Starttaster ab. Dadurch bleibt das Ergebnis im nächsten Zyklus erhalten, auch wenn der Taster losgelassen wird.',
    },
    {
      id: 'f6',
      front: 'Wodurch unterscheiden sich Aus-Vorrang und Ein-Vorrang bei der Selbsthaltung?',
      back: 'Durch die **Position des Stopp-Kontakts**:\n\n- hinter der Verzweigung → **Aus-Vorrang** (Standard, sicher)\n- im Halteweg → **Ein-Vorrang** (Start gewinnt, solange er ansteht)',
    },
    {
      id: 'f7',
      front: 'Welche SCL-Zeile gehört zur Selbsthaltung mit vorrangigem Ein?',
      back: '`"Motor" := "Start" OR ("Motor" AND NOT "Stopp");` – `Stopp` wirkt nur auf den Haltezweig.',
    },
    {
      id: 'f8',
      front: 'Darf ein Netzwerk mehrere Spulen enthalten?',
      back: 'Ja – mehrere Spulen können parallel am selben Strompfad hängen. Verboten ist nur, denselben **Operanden** mehrfach zuzuweisen (Doppelzuweisung).',
    },
    {
      id: 'f9',
      front: 'Was ist eine Doppelzuweisung und warum ist sie gefährlich?',
      back: 'Derselbe Ausgang bekommt in mehreren Netzwerken eine Spule. Es gewinnt immer das **letzte** Netzwerk. TIA meldet das nur als Hinweis in der Querverweisliste – der Fehler fällt erst in der Anlage auf.',
    },
    {
      id: 'f10',
      front: 'Welches Netzwerk entspricht `"Motor" := ("Auto" AND "Start") OR "Hand";`?',
      back: '```text\n     Auto       Start               Motor\n  +---| |-------| |---+-------------( )----\n  |                   |\n  | Hand              |\n  +---| |-------------+\n```',
    },
    {
      id: 'f11',
      front: 'Warum funktioniert eine Selbsthaltung überhaupt?',
      back: 'Weil die CPU **zyklisch** rechnet: Der im letzten Zyklus geschriebene Ausgangszustand steht im nächsten Zyklus als Eingangsbedingung des Haltekontakts zur Verfügung.',
    },
    {
      id: 'f12',
      front: 'Übersteht eine Selbsthaltung einen Spannungsausfall?',
      back: 'Nein. Ausgänge und nicht-remanente Merker gehen auf 0. Für Zustände, die den Neustart überleben sollen, braucht man **remanente Merker** oder Set/Reset auf remanente Operanden.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `  Netzwerk 1:

     Hand               Freigabe       Motor
  +---| |---+-------------| |---------( )----
  |         |
  | Auto    |
  +---| |---+`,
      options: [
        '`"Motor" := "Hand" OR "Auto" AND "Freigabe";`',
        '`"Motor" := ("Hand" OR "Auto") AND "Freigabe";`',
        '`"Motor" := "Hand" AND "Auto" AND "Freigabe";`',
        '`"Motor" := "Hand" OR ("Auto" AND "Freigabe");`',
      ],
      correct: 1,
      explanation: 'Die Verzweigung ist eine Klammer. `Freigabe` liegt hinter der Zusammenführung und wirkt damit auf das gesamte ODER-Ergebnis.',
    },
    {
      id: 'q2',
      prompt: '`Start` wird kurz gedrückt und wieder losgelassen, `Stopp` bleibt unbetätigt (Signal 0). Was macht `Motor`?',
      code: `  Netzwerk 1:

     Start              Stopp          Motor
  +---| |---+-------------|/|---------( )----
  |         |
  | Motor   |
  +---| |---+`,
      options: [
        'Er geht nur für einen Zyklus an',
        'Er bleibt dauerhaft an, bis `Stopp` kommt',
        'Er geht gar nicht an',
        'Er blinkt im Zyklustakt',
      ],
      correct: 1,
      explanation: 'Der parallele Haltekontakt auf `Motor` übernimmt, sobald die Spule einmal 1 war. Das ist die Selbsthaltung.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Fehler im Netzwerk?',
      code: `  Netzwerk 1: Selbsthaltung

     Start              Stopp          Motor
  +---| |---+-------------|/|---------( )----
  |         |
  | Start   |
  +---| |---+`,
      options: [
        '`Stopp` müsste ein Schließer sein',
        'Der Haltekontakt fragt `Start` statt den eigenen Ausgang `Motor` ab',
        'Die Verzweigung gehört hinter `Stopp`',
        'Es fehlt eine zweite Spule',
      ],
      correct: 1,
      explanation: 'Ohne Rückführung auf den eigenen Ausgang gibt es keine Haltung – der Motor fällt beim Loslassen des Tasters sofort ab.',
    },
    {
      id: 'q4',
      prompt: '`Start` und `Stopp` werden **gleichzeitig** betätigt. Was macht `Motor`?',
      code: `  Netzwerk 1:

     Start                            Motor
  +---| |--------------+-------------( )----
  |                    |
  | Motor     Stopp    |
  +---| |------|/|-----+`,
      options: [
        'Motor = 0, Aus hat Vorrang',
        'Motor = 1, Ein hat Vorrang',
        'Motor wechselt jeden Zyklus',
        'Die CPU geht in STOP',
      ],
      correct: 1,
      explanation: '`Stopp` liegt nur im Halteweg. Der obere Zweig mit `Start` führt am Stopp-Kontakt vorbei → **Ein-Vorrang**.',
    },
    {
      id: 'q5',
      prompt: 'Welches Netzwerk entspricht `"Y" := ("A" AND "B") OR ("C" AND "D");`?',
      options: [
        '```text\n  ----| |----| |----| |----| |----( )----\n```',
        '```text\n  +---| |----| |---+---( )----\n  |                |\n  |   C      D     |\n  +---| |----| |---+\n```',
        '```text\n  +---| |---+----| |----( )----\n  |         |\n  +---| |---+\n```',
        '```text\n  ----| |----+---| |---( )----\n             |\n             +---|/|---\n```',
      ],
      correct: 1,
      explanation: 'Zwei UND-Ketten werden parallel geführt. Jeder Zweig ist eine Klammer, die Parallelschaltung ist das `OR` dazwischen.',
    },
    {
      id: 'q6',
      prompt: 'Der Stopp-Taster ist hardwareseitig als **Öffner** verdrahtet (Ruhezustand = 1). Welches Netzwerk stoppt den Motor korrekt?',
      options: [
        '```text\n     Start              Stopp          Motor\n  +---| |---+-------------|/|---------( )----\n  |         |\n  | Motor   |\n  +---| |---+\n```',
        '```text\n     Start              Stopp          Motor\n  +---| |---+-------------| |---------( )----\n  |         |\n  | Motor   |\n  +---| |---+\n```',
        '```text\n     Start              Stopp          Motor\n  +---|/|---+-------------|/|---------( )----\n  |         |\n  | Motor   |\n  +---| |---+\n```',
        '```text\n     Stopp              Start          Motor\n  +---|/|---+-------------| |---------( )----\n  |         |\n  | Motor   |\n  +---| |---+\n```',
      ],
      correct: 1,
      explanation: 'Der Hardware-Öffner liefert im Ruhezustand 1. Gedrückt → 0. Abfrage mit **Schließer** `| |`: leitet im Ruhezustand, sperrt beim Drücken. Ein zusätzliches `|/|` würde die Logik invertieren.',
    },
    {
      id: 'q7',
      prompt: '`Hand` = 1, `Auto` = 0. Welchen Wert hat `Motor` am Zyklusende?',
      code: `  Netzwerk 1:
     Hand                         Motor
  ----| |------------------------( )----

  Netzwerk 2:
     Auto                         Motor
  ----| |------------------------( )----`,
      options: ['`1`', '`0`', 'abwechselnd 0 und 1', 'Compile-Fehler'],
      correct: 1,
      explanation: 'Doppelzuweisung: Netzwerk 2 überschreibt Netzwerk 1. Richtig wäre **ein** Netzwerk mit `Hand` und `Auto` parallel.',
    },
    {
      id: 'q8',
      prompt: 'Was beschreibt dieses Netzwerk?',
      code: `  Netzwerk 1:

     Freigabe                     Band
  ----| |---+--------------------( )----
            |
            |                     Luefter
            +--------------------( )----`,
      options: [
        'Eine Doppelzuweisung – nicht erlaubt',
        'Zwei parallele Spulen, beide folgen derselben Bedingung',
        'Eine Selbsthaltung',
        '`Band` schaltet `Luefter` in Reihe',
      ],
      correct: 1,
      explanation: 'Mehrere Spulen an einem Strompfad sind erlaubt, solange es verschiedene Operanden sind. Entspricht zwei SCL-Zuweisungen mit derselben rechten Seite.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Freigabekette zeichnen',
      level: 1,
      description: `Zeichne ein Netzwerk: Die Pumpe läuft nur, wenn Not-Halt in Ordnung **und** Schutztür zu **und** keine Störung ansteht.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_NotHalt    Not-Halt (Oeffner verdrahtet, Ruhe = 1)
  E0.1   B_TuerZu     Schutztuer geschlossen
  E0.2   S_Stoerung   Sammelstoerung (1 = Stoerung)
  A0.0   K_Pumpe      Schuetz Pumpe
\`\`\`

Schreibe darunter die passende SCL-Zeile.`,
      starter: `  Netzwerk 1: Pumpenfreigabe

  ----
  // TODO

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Pumpenfreigabe

     S_NotHalt  B_TuerZu   S_Stoerung        K_Pumpe
  ----| |-------| |--------|/|--------------( )----

  SCL:
  "K_Pumpe" := "S_NotHalt" AND "B_TuerZu" AND NOT "S_Stoerung";`,
      hints: [
        'Alle drei Bedingungen müssen gleichzeitig erfüllt sein – das ist eine UND-Verknüpfung.',
        'UND zeichnet man als Reihenschaltung. Die Störung ist aktiv bei 1, du brauchst sie aber invertiert.',
        'Drei Kontakte hintereinander, dann die Spule. Die ersten beiden sind Schließer, der dritte ein Öffner.',
        '```text\n     S_NotHalt  B_TuerZu   S_Stoerung        K_Pumpe\n  ----| |-------| |--------|?|--------------( )----\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Selbsthaltung mit Aus-Vorrang',
      level: 2,
      description: `Zeichne die Bandsteuerung: Mit \`S_Start\` läuft das Band an und bleibt an. Mit \`S_Stopp\` geht es aus. **Aus muss Vorrang haben.**

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Start      Starttaster (Schliesser, Impuls)
  E0.1   S_Stopp      Stopptaster (Oeffner verdrahtet, Ruhe = 1)
  A0.0   K_Band       Schuetz Bandmotor
\`\`\`

**Achtung:** \`S_Stopp\` ist als Öffner verdrahtet. Überlege, welcher Kontakttyp im Programm richtig ist.`,
      starter: `  Netzwerk 1: Band Selbsthaltung

  ----
  // TODO: Start parallel zum Haltekontakt, danach Stopp, dann Spule

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Band Selbsthaltung

     S_Start            S_Stopp        K_Band
  +---| |---+-------------| |---------( )----
  |         |
  | K_Band  |
  +---| |---+

  SCL:
  "K_Band" := ("S_Start" OR "K_Band") AND "S_Stopp";

  // S_Stopp ist als Oeffner verdrahtet: Ruhe = 1, gedrueckt = 0.
  // Deshalb Abfrage mit Schliesser - keine zusaetzliche Negation.`,
      hints: [
        'Eine Selbsthaltung braucht einen Haltekontakt, der den eigenen Ausgang abfragt.',
        'Start und Haltekontakt liegen parallel (ODER). Der Stopp-Kontakt liegt in Reihe dahinter (UND).',
        'Zeichne `S_Start` oben, darunter in einer Verzweigung `K_Band`. Beide laufen zusammen, danach kommt `S_Stopp` und ganz rechts die Spule `K_Band`.',
        '```text\n     S_Start            S_Stopp        K_Band\n  +---| |---+-------------|?|---------( )----\n  |         |\n  | ?????   |\n  +---| |---+\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Ein-Vorrang in Aus-Vorrang umbauen',
      level: 3,
      description: `Das vorgegebene Netzwerk hat **Ein-Vorrang**: Wenn \`S_Start\` und \`S_Stopp\` gleichzeitig betätigt werden, läuft der Motor weiter. Das ist für einen Antrieb nicht zulässig.

Baue das Netzwerk auf **Aus-Vorrang** um und schreibe beide SCL-Varianten zum Vergleich auf.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Start      Starttaster
  E0.1   S_Stopp      Stopptaster (im Programm als Oeffner abgefragt)
  A0.0   K_Motor      Schuetz Motor
\`\`\``,
      given: `  Netzwerk 1: Ein-Vorrang (umzubauen)

     S_Start                          K_Motor
  +---| |--------------+-------------( )----
  |                    |
  | K_Motor   S_Stopp  |
  +---| |------|/|-----+`,
      starter: `  Netzwerk 1: Motor Selbsthaltung mit Aus-Vorrang

  ----
  // TODO

  SCL vorher (Ein-Vorrang):
  // TODO

  SCL nachher (Aus-Vorrang):
  // TODO`,
      solution: `  Netzwerk 1: Motor Selbsthaltung mit Aus-Vorrang

     S_Start            S_Stopp        K_Motor
  +---| |---+-------------|/|---------( )----
  |         |
  | K_Motor |
  +---| |---+

  SCL vorher (Ein-Vorrang):
  "K_Motor" := "S_Start" OR ("K_Motor" AND NOT "S_Stopp");

  SCL nachher (Aus-Vorrang):
  "K_Motor" := ("S_Start" OR "K_Motor") AND NOT "S_Stopp";`,
      hints: [
        'Der Unterschied zwischen Ein- und Aus-Vorrang steckt allein in der Position des Stopp-Kontakts.',
        'Aus-Vorrang bedeutet: Der Stopp-Kontakt muss **alle** Wege unterbrechen können.',
        'Hole den Stopp-Kontakt aus dem Halteweg heraus und setze ihn hinter die Zusammenführung der Verzweigung, direkt vor die Spule.',
        '```text\n     S_Start            S_Stopp        K_Motor\n  +---| |---+-------------|/|---------( )----\n  |         |\n  | ?????   |\n  +---| |---+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Tor mit Hand- und Automatikbetrieb',
      level: 4,
      description: `Setze die folgende Logik in **zwei** Netzwerke um:

\`\`\`pascal
"M_Freigabe" := "S_NotHalt" AND NOT "S_Stoerung";
"K_TorAuf"   := "M_Freigabe"
                AND (("B_Betriebsart_Auto" AND "B_FahrzeugDa")
                     OR ("B_Betriebsart_Hand" AND "S_TasterAuf"))
                AND NOT "B_EndlageAuf";
\`\`\`

**Zuordnungsliste**

\`\`\`text
  E0.0   S_NotHalt            Not-Halt (Ruhe = 1)
  E0.1   S_Stoerung           Sammelstoerung
  E0.2   B_Betriebsart_Auto   Wahlschalter Automatik
  E0.3   B_Betriebsart_Hand   Wahlschalter Hand
  E0.4   B_FahrzeugDa         Induktionsschleife
  E0.5   S_TasterAuf          Taster Tor auf
  E0.6   B_EndlageAuf         Endschalter oben erreicht
  A0.0   K_TorAuf             Motor Tor auf
  M10.0  M_Freigabe           Anlagenfreigabe
\`\`\``,
      starter: `  Netzwerk 1: Anlagenfreigabe
  ----
  // TODO

  Netzwerk 2: Tor auf fahren
  ----
  // TODO`,
      solution: `  Netzwerk 1: Anlagenfreigabe

     S_NotHalt  S_Stoerung        M_Freigabe
  ----| |-------|/|--------------( )----

  Netzwerk 2: Tor auf fahren

     M_Freigabe  B_Betriebsart_Auto  B_FahrzeugDa          B_EndlageAuf   K_TorAuf
  ----| |-----+------| |---------------| |-------+------------|/|---------( )----
              |                                 |
              | B_Betriebsart_Hand S_TasterAuf  |
              +------| |---------------| |------+`,
      hints: [
        'Zwei SCL-Zuweisungen → zwei Netzwerke. Der Merker aus Netzwerk 1 wird in Netzwerk 2 als Schließer abgefragt.',
        'Die beiden Betriebsarten sind je eine UND-Kette. Beide zusammen bilden ein ODER, also eine Verzweigung mit zwei Zweigen.',
        'Zeichne links `M_Freigabe`, dann öffnest du die Verzweigung. Oberer Zweig: Auto + FahrzeugDa. Unterer Zweig: Hand + TasterAuf. Nach der Zusammenführung kommt der Öffner auf `B_EndlageAuf` und dann die Spule.',
        '```text\n     M_Freigabe  B_Betriebsart_Auto  B_FahrzeugDa          B_EndlageAuf   K_TorAuf\n  ----| |-----+------| |---------------| |-------+------------|?|---------( )----\n              |                                 |\n              | ?????              ?????        |\n              +------| |---------------| |------+\n```',
      ],
    },
  ],
}

export default chapter
