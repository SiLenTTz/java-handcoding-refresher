import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie liest man ein KOP-Netzwerk?',
      back: 'Von der **linken Sammelschiene** nach rechts: gedachter Strom fließt über die Kontakte zur **Spule ganz rechts**. Kommt der Strom durch, wird die Spule 1.',
    },
    {
      id: 'f2',
      front: 'Was fragt ein Schließer `| |` ab?',
      back: 'Abfrage auf **Signalzustand 1**. Der Kontakt leitet, wenn der Operand 1 ist.\n\n```text\n     Freigabe                     Pumpe\n  ----| |------------------------( )----\n```',
    },
    {
      id: 'f3',
      front: 'Was fragt ein Öffner `|/|` ab?',
      back: 'Abfrage auf **Signalzustand 0**. Der Kontakt leitet, solange der Operand 0 ist. SCL-Äquivalent: `NOT "Operand"`.',
    },
    {
      id: 'f4',
      front: 'Welche SCL-Zeile entspricht diesem Netzwerk?\n\n```text\n     Freigabe   Stoerung          Band\n  ----| |-------|/|--------------( )----\n```',
      back: '```pascal\n"Band" := "Freigabe" AND NOT "Stoerung";\n```',
    },
    {
      id: 'f5',
      front: 'Was bedeuten E/A/M bzw. I/Q/M?',
      back: '**E/I** = Eingang, **A/Q** = Ausgang, **M** = Merker (internes Bit). Im Programm immer über Symbolnamen aus der Zuordnungsliste ansprechen, nie über `E0.0`.',
    },
    {
      id: 'f6',
      front: 'Warum wird ein Not-Halt als Hardware-Öffner verdrahtet, im Programm aber mit Schließer abgefragt?',
      back: '**Ruhestromprinzip**: Im Ruhezustand liegt 1 an. Drücken *und* Drahtbruch erzeugen 0 → die Freigabe fällt weg. Mit `|/|` würde ein Drahtbruch die Anlage freigeben.',
    },
    {
      id: 'f7',
      front: 'Was ist das Prozessabbild (PAE/PAA)?',
      back: 'Eine Kopie der Ein-/Ausgänge. Die CPU liest alle Eingänge **am Zyklusanfang** (PAE) und schreibt alle Ausgänge **am Zyklusende** (PAA). Das Programm arbeitet dazwischen nur auf der Kopie.',
    },
    {
      id: 'f8',
      front: 'Die vier Schritte des SPS-Zyklus?',
      back: '1. PAE einlesen\n2. Anwenderprogramm Netzwerk für Netzwerk rechnen\n3. PAA ausgeben\n4. Betriebssystem/Kommunikation → zurück zu 1',
    },
    {
      id: 'f9',
      front: 'Was passiert, wenn derselbe Ausgang in zwei Netzwerken eine Spule bekommt?',
      back: '**Doppelzuweisung.** Es gewinnt immer das **letzte** Netzwerk, weil die PAA erst am Zyklusende ausgegeben wird. Das erste Netzwerk ist wirkungslos.',
    },
    {
      id: 'f10',
      front: 'Darf eine Spule mitten im Strompfad stehen?',
      back: 'Nein. Die Spule steht **ganz rechts** am Ende des Strompfads. Alle Bedingungen stehen links davon.',
    },
    {
      id: 'f11',
      front: 'Was passiert bei Drahtbruch an einem als Schließer verdrahteten Startaster?',
      back: 'Das Signal bleibt 0 – der Start funktioniert nicht mehr. Das ist ungefährlich. Gefährlich wäre Drahtbruch an einem Signal, das zum **Abschalten** gebraucht wird – deshalb dort Öffner-Verdrahtung.',
    },
    {
      id: 'f12',
      front: 'Warum reagiert die Anlage nicht sofort auf eine Signaländerung?',
      back: 'Wegen des Zyklus: Ein Eingang, der sich mitten im Zyklus ändert, wird erst beim nächsten PAE-Einlesen wirksam. Die Reaktionszeit beträgt im Worst Case rund **zwei Zykluszeiten**.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wann wird die Spule `Warnung` wahr?',
      code: `  Netzwerk 1:

     TuerZu                       Warnung
  ----|/|------------------------( )----`,
      options: [
        'wenn `TuerZu` = 1',
        'wenn `TuerZu` = 0',
        'nie, ein Öffner darf nicht allein stehen',
        'bei jeder Änderung von `TuerZu`',
      ],
      correct: 1,
      explanation: 'Der Öffner `|/|` leitet bei Signalzustand **0**. `Warnung` entspricht `NOT "TuerZu"`.',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `  Netzwerk 1:

     Freigabe   Stoerung          Band
  ----| |-------|/|--------------( )----`,
      options: [
        '`"Band" := "Freigabe" OR NOT "Stoerung";`',
        '`"Band" := NOT "Freigabe" AND "Stoerung";`',
        '`"Band" := "Freigabe" AND NOT "Stoerung";`',
        '`IF "Freigabe" THEN "Band" := TRUE; END_IF;`',
      ],
      correct: 2,
      explanation: 'Kontakte hintereinander = Reihenschaltung = `AND`. Der Öffner wird zu `NOT`. Die Spule ist eine Zuweisung mit `:=`, kein `IF`.',
    },
    {
      id: 'q3',
      prompt: 'Der Not-Halt ist hardwareseitig als Öffner verdrahtet. Was passiert in diesem Netzwerk bei **Drahtbruch**?',
      code: `  Netzwerk 1:

     NotHalt    Start             Motor
  ----| |-------| |--------------( )----`,
      options: [
        'Der Motor läuft weiter, Drahtbruch wird nicht erkannt',
        'Das Signal fällt auf 0, der Motor schaltet ab – sicherer Zustand',
        'Die CPU geht in STOP',
        'Der Motor startet ungewollt',
      ],
      correct: 1,
      explanation: 'Ruhestromprinzip: Der Öffner liefert im Ruhezustand 1. Drahtbruch → 0 → der Schließer `| |` sperrt → Motor aus.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler im Netzwerk?',
      code: `  Netzwerk 1:

     Start        Motor       Stopp
  ----| |--------( )----------|/|----`,
      options: [
        '`Stopp` muss ein Schließer sein',
        '`Start` fehlt ein zweiter Kontakt',
        'Die Spule steht mitten im Strompfad – sie gehört ganz nach rechts',
        'Kein Fehler, das ist eine gültige Reihenfolge',
      ],
      correct: 2,
      explanation: 'Eine Spule schließt den Strompfad ab. Alle Bedingungen stehen links davon: `----| |----|/|----( )----`.',
    },
    {
      id: 'q5',
      prompt: '`Hand` = 1 und `Auto` = 0. Welchen Wert hat `Motor` am Ende des Zyklus?',
      code: `  Netzwerk 1:
     Hand                         Motor
  ----| |------------------------( )----

  Netzwerk 2:
     Auto                         Motor
  ----| |------------------------( )----`,
      options: ['`1`', '`0`', 'wechselt jeden Zyklus', 'undefiniert'],
      correct: 1,
      explanation: 'Doppelzuweisung: Netzwerk 2 überschreibt das Ergebnis von Netzwerk 1. Ausgegeben wird der Wert des **letzten** Netzwerks, also 0.',
    },
    {
      id: 'q6',
      prompt: 'Welches Netzwerk entspricht `"Lampe" := NOT "Quittiert";`?',
      options: [
        '```text\n  ----| |----( )----\n```',
        '```text\n  ----|/|----( )----\n```',
        '```text\n  ----|P|----( )----\n```',
        '```text\n  ----| |----(R)----\n```',
      ],
      correct: 1,
      explanation: '`NOT` im Strompfad wird zum Öffner `|/|`. `|P|` wäre eine Flanke, `(R)` eine Rücksetzspule.',
    },
    {
      id: 'q7',
      prompt: 'Ein Taster wird für 2 ms gedrückt, die Zykluszeit beträgt 10 ms. Was passiert?',
      options: [
        'Die SPS erkennt den Taster garantiert',
        'Die SPS löst einen Interrupt aus',
        'Der Taster kann komplett übersehen werden, weil er zwischen zwei PAE-Einlesungen liegt',
        'Das Prozessabbild speichert das Signal bis zum nächsten Zyklus',
      ],
      correct: 2,
      explanation: 'Eingänge werden nur einmal pro Zyklus in die PAE kopiert. Signale kürzer als die Zykluszeit können verloren gehen – deshalb Hardware-Zwischenspeicher oder schnelle Eingänge.',
    },
    {
      id: 'q8',
      prompt: 'Was ist die Aufgabe der Zuordnungsliste?',
      options: [
        'Sie legt die Reihenfolge der Netzwerke fest',
        'Sie ordnet absoluten Adressen (`E0.0`, `A0.1`) Symbolnamen und Kommentare zu',
        'Sie definiert die Zykluszeit der CPU',
        'Sie enthält die Instanzdaten der Timer',
      ],
      correct: 1,
      explanation: 'Die Zuordnungsliste (PLC-Variablentabelle) verbindet Adresse, Symbolname, Datentyp und Kommentar. Programmiert wird gegen die Symbolnamen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Erstes Netzwerk: Lampe folgt Taster',
      level: 1,
      description: `Zeichne ein Netzwerk, das die Lampe einschaltet, solange der Taster gedrückt ist.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Taster     Taster (Schliesser verdrahtet)
  A0.0   H_Lampe      Meldeleuchte
\`\`\`

Zeichne das Netzwerk als ASCII und schreibe darunter die passende SCL-Zeile.`,
      starter: `  Netzwerk 1: Lampe folgt Taster

  ----
  // TODO: Kontakt und Spule einzeichnen

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Lampe folgt Taster

     S_Taster                     H_Lampe
  ----| |------------------------( )----

  SCL:
  "H_Lampe" := "S_Taster";`,
      hints: [
        'Ein Strompfad geht von der linken Sammelschiene zur Spule ganz rechts.',
        'Du brauchst genau zwei Elemente: einen Schließer `| |` und eine Spule `( )`.',
        'Links der Schließer auf `S_Taster`, rechts am Ende die Spule auf `H_Lampe`. Darüber die Symbolnamen schreiben.',
        '```text\n     S_Taster                     H_Lampe\n  ----| |------------------------(?)----\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Netzwerk nach SCL übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk in eine SCL-Zuweisung.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_NotHalt    Not-Halt (Oeffner verdrahtet)
  E0.1   B_TuerZu     Schutztuer geschlossen
  E0.2   S_Stoerung   Sammelstoerung (Schliesser)
  A0.0   K_Pumpe      Schuetz Pumpe
\`\`\``,
      given: `  Netzwerk 1: Pumpenfreigabe

     S_NotHalt  B_TuerZu   S_Stoerung        K_Pumpe
  ----| |-------| |--------|/|--------------( )----`,
      starter: `  SCL:
  // TODO: eine Zuweisung`,
      solution: `  SCL:
  "K_Pumpe" := "S_NotHalt" AND "B_TuerZu" AND NOT "S_Stoerung";`,
      hints: [
        'Kontakte hintereinander im selben Strompfad sind eine Reihenschaltung.',
        'Reihenschaltung → `AND`, Öffner → `NOT`, Spule → `:=`.',
        'Nimm die Kontakte von links nach rechts und verbinde sie mit `AND`. Den Öffner mit `NOT` davor.',
        '`"K_Pumpe" := "S_NotHalt" AND "B_TuerZu" AND NOT ... ;`',
      ],
    },
    {
      id: 'k3',
      title: 'Fehlerhaftes Not-Halt-Netzwerk korrigieren',
      level: 3,
      description: `Der Not-Halt ist hardwareseitig als **Öffner** verdrahtet. Im folgenden Netzwerk läuft der Motor nur, wenn der Not-Halt **gedrückt** ist – und bei Drahtbruch läuft er weiter.

Korrigiere das Netzwerk und begründe die Änderung in einem Kommentar.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_NotHalt    Not-Halt (Oeffner verdrahtet, Ruhezustand = 1)
  E0.1   S_Start      Starttaster (Schliesser)
  A0.0   K_Motor      Schuetz Motor
\`\`\``,
      given: `  Netzwerk 1: FEHLERHAFT

     S_NotHalt  S_Start           K_Motor
  ----|/|-------| |--------------( )----`,
      starter: `  Netzwerk 1: Motorfreigabe (korrigiert)

  ----
  // TODO: Netzwerk korrigiert zeichnen
  // TODO: Begruendung als Kommentar`,
      solution: `  Netzwerk 1: Motorfreigabe (korrigiert)

     S_NotHalt  S_Start           K_Motor
  ----| |-------| |--------------( )----

  // Ruhestromprinzip: Der Not-Halt ist als Oeffner verdrahtet und liefert
  // im Ruhezustand 1. Deshalb wird er im Programm mit einem SCHLIESSER
  // abgefragt. Druecken ODER Drahtbruch erzeugen 0 -> Motor faellt ab.

  SCL:
  "K_Motor" := "S_NotHalt" AND "S_Start";`,
      hints: [
        'Trenne Verdrahtungslogik von Programmlogik: Wie das Signal erzeugt wird, hat nichts damit zu tun, wie du es abfragst.',
        'Der Hardware-Öffner liefert im Ruhezustand 1. Welcher Kontakttyp leitet bei 1?',
        'Tausche den Öffner `|/|` auf `S_NotHalt` gegen einen Schließer `| |`. Der Rest bleibt.',
        '```text\n     S_NotHalt  S_Start           K_Motor\n  ----|?|-------| |--------------( )----\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Behälterfüllung: SCL als Netzwerke zeichnen',
      level: 4,
      description: `Setze die folgende SCL-Logik in **drei** KOP-Netzwerke um. Achte auf die richtige Reihenfolge – der Merker muss berechnet sein, bevor er verwendet wird.

\`\`\`pascal
"M_Freigabe" := "S_NotHalt" AND NOT "S_Stoerung";
"K_Ventil"   := "M_Freigabe" AND NOT "B_Voll";
"H_Voll"     := "B_Voll";
\`\`\`

**Zuordnungsliste**

\`\`\`text
  E0.0   S_NotHalt    Not-Halt (Oeffner verdrahtet)
  E0.1   S_Stoerung   Sammelstoerung
  E0.2   B_Voll       Niveauschalter oben
  A0.0   K_Ventil     Einlassventil
  A0.1   H_Voll       Meldeleuchte "voll"
  M10.0  M_Freigabe   Anlagenfreigabe
\`\`\``,
      starter: `  Netzwerk 1: Anlagenfreigabe
  ----
  // TODO

  Netzwerk 2: Einlassventil
  ----
  // TODO

  Netzwerk 3: Meldeleuchte voll
  ----
  // TODO`,
      solution: `  Netzwerk 1: Anlagenfreigabe

     S_NotHalt  S_Stoerung        M_Freigabe
  ----| |-------|/|--------------( )----

  Netzwerk 2: Einlassventil

     M_Freigabe B_Voll            K_Ventil
  ----| |-------|/|--------------( )----

  Netzwerk 3: Meldeleuchte voll

     B_Voll                       H_Voll
  ----| |------------------------( )----`,
      hints: [
        'Jede SCL-Zuweisung wird genau ein Netzwerk mit genau einer Spule.',
        '`AND` → Kontakte hintereinander, `NOT` → Öffner `|/|`, `:=` → Spule `( )`.',
        'Netzwerk 1 rechnet den Merker `M_Freigabe`. Netzwerk 2 fragt diesen Merker als Schließer ab und ergänzt den Öffner auf `B_Voll`. Netzwerk 3 ist eine einfache Durchreichung.',
        '```text\n  Netzwerk 2: Einlassventil\n\n     M_Freigabe B_Voll            K_Ventil\n  ----| |-------|?|--------------( )----\n```',
      ],
    },
  ],
}

export default chapter
