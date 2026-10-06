import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    {
      id: 'f1',
      front: 'In welche Richtung fließt das Signal in einem FUP-Netzwerk?',
      back: 'Immer **von links nach rechts**: Operanden links an den Box-Eingängen, Verknüpfungsboxen in der Mitte, Zuweisung `( )` ganz rechts.',
    },
    {
      id: 'f2',
      front: 'Wofür steht `&` und wofür `>=1` in einer FUP-Box?',
      back: '`&` ist die **UND**-Box (alle Eingänge müssen wahr sein), `>=1` ist die **ODER**-Box (mindestens ein Eingang wahr).',
    },
    {
      id: 'f3',
      front: 'Was bedeutet das Symbol `( )` am rechten Rand eines Netzwerks?',
      back: 'Die **Zuweisung**. Sie schreibt das Verknüpfungsergebnis in den angegebenen Operanden – und zwar **jeden Zyklus**, auch `FALSE`.',
    },
    {
      id: 'f4',
      front: 'Übersetze dieses Netzwerk nach SCL.',
      back: '```text\n            +-------+\n  "Start" --|   &   |------( ) "Motor"\n "Bereit" --|       |\n            +-------+\n```\n\n```pascal\n"Motor" := "Start" AND "Bereit";\n```',
    },
    {
      id: 'f5',
      front: 'Was bedeuten E, A und M bzw. %I, %Q und %M?',
      back: '`E`/`%I` = Eingang (Klemme), `A`/`%Q` = Ausgang (Klemme), `M`/`%M` = Merker (internes Bit ohne Hardwarebezug). Beispiel: `E0.0` = `%I0.0`.',
    },
    {
      id: 'f6',
      front: 'Was ist die Zuordnungsliste?',
      back: 'Die Tabelle, die jeder absoluten Adresse (`%I0.0`) einen **symbolischen Namen** (`"Taster_Start"`) und einen Datentyp zuordnet. Im Programm arbeitest du nur mit den Symbolen.',
    },
    {
      id: 'f7',
      front: 'Welche drei Schritte macht die CPU in jedem Zyklus?',
      back: '1. **PAE lesen** – Klemmenzustände ins Prozessabbild der Eingänge.\n2. **Programm bearbeiten** – Netzwerk für Netzwerk von oben nach unten.\n3. **PAA schreiben** – Prozessabbild der Ausgänge auf die Klemmen.',
    },
    {
      id: 'f8',
      front: 'Warum ändert sich ein Eingangsbit innerhalb eines Zyklus nicht?',
      back: 'Das Programm liest nicht die Klemme, sondern das **Prozessabbild**, das einmal am Zyklusanfang eingefroren wird. Damit ist die Logik über den ganzen Zyklus konsistent.',
    },
    {
      id: 'f9',
      front: 'Wie wird in FUP verschachtelt, und was entspricht das in SCL?',
      back: 'Der **Ausgang einer Box wird Eingang der nächsten**. Das entspricht exakt einer Klammer in SCL:\n\n```pascal\n"Motor" := ("Start" OR "Tipp") AND "Bereit";\n```',
    },
    {
      id: 'f10',
      front: 'Was passiert, wenn derselbe Ausgang in zwei Netzwerken zugewiesen wird?',
      back: 'Das **letzte** Netzwerk im Zyklus gewinnt – die frühere Zuweisung ist wirkungslos. Regel: ein Ausgang, eine Zuweisungsstelle.',
    },
    {
      id: 'f11',
      front: 'Wann ist FUP übersichtlicher als KOP?',
      back: 'Bei **vielen Eingängen an einer Verknüpfung** (eine Box mit 8 Eingängen statt 8 Kontakten in Reihe) und bei Bausteinen mit mehreren Ein- und Ausgängen wie TON oder CTU.',
    },
    {
      id: 'f12',
      front: 'Warum ist die Reihenfolge der Netzwerke relevant?',
      back: 'Netzwerke laufen von oben nach unten. Ein Merker, der **nach** seiner Verwendung berechnet wird, wirkt erst im nächsten Zyklus – das ergibt eine unbeabsichtigte Zyklusverzögerung.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wann wird `"Motor"` wahr?',
      code: `Netzwerk 1:

            +-------+
  "Start" --|       |
            |   &   |------( )  "Motor"
 "Bereit" --|       |
            +-------+`,
      options: [
        'wenn `"Start"` ODER `"Bereit"` wahr ist',
        'wenn `"Start"` UND `"Bereit"` wahr sind',
        'wenn genau eines von beiden wahr ist',
        'wenn beide falsch sind',
      ],
      correct: 1,
      explanation: '`&` ist die UND-Box: Alle Eingänge müssen wahr sein. In SCL: `"Motor" := "Start" AND "Bereit";`',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1:

            +-------+
  "Start" --|       |
            |  >=1  |---+
   "Tipp" --|       |   |     +-------+
            +-------+   +-----|       |
                              |   &   |------( )  "Motor"
                   "Bereit" --|       |
                              +-------+`,
      options: [
        '`"Motor" := "Start" OR "Tipp" AND "Bereit";`',
        '`"Motor" := ("Start" OR "Tipp") AND "Bereit";`',
        '`"Motor" := "Start" AND "Tipp" AND "Bereit";`',
        '`"Motor" := "Start" OR ("Tipp" AND "Bereit");`',
      ],
      correct: 1,
      explanation: 'Die ODER-Box liefert ein Zwischenergebnis, das in die UND-Box läuft – das ist eine Klammer. Ohne Klammer würde `AND` stärker binden und eine andere Logik ergeben.',
    },
    {
      id: 'q3',
      prompt: 'Welche Aussage über das Prozessabbild ist richtig?',
      options: [
        'Das Programm liest bei jedem Zugriff direkt die Klemme',
        'Das PAE wird einmal pro Zyklus gelesen und bleibt während der Bearbeitung konstant',
        'Das PAA wird nach jedem Netzwerk auf die Klemmen geschrieben',
        'Merker werden ebenfalls im PAE abgebildet',
      ],
      correct: 1,
      explanation: 'PAE wird am Zyklusanfang gelesen, PAA am Zyklusende geschrieben. Direktzugriff auf die Klemme gibt es nur über den Zusatz `:P`.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler?',
      code: `Netzwerk 1:
            +-------+
  "Start" --|   &   |------( )  "Motor"
 "Bereit" --|       |
            +-------+

Netzwerk 7:
            +-------+
   "Hand" --|   &   |------( )  "Motor"
"Freigabe"--|       |
            +-------+`,
      options: [
        'UND-Boxen dürfen nur zwei Eingänge haben',
        '`"Motor"` wird zweimal zugewiesen – Netzwerk 7 überschreibt Netzwerk 1',
        'Netzwerk 7 darf keine Nummer über 5 haben',
        'Kein Fehler, beide Netzwerke wirken zusammen wie ein ODER',
      ],
      correct: 1,
      explanation: 'Die Zuweisung schreibt jeden Zyklus. Netzwerk 1 ist wirkungslos. Richtig wäre, beide Quellen in einer ODER-Box zusammenzuführen.',
    },
    {
      id: 'q5',
      prompt: 'Welche Box gehört an die markierte Stelle, damit `"Sammelstoerung"` bei **mindestens einer** Störung wahr wird?',
      code: `Netzwerk 1:

                  +-------+
 "Stoer_Motor" ---|       |
 "Stoer_Pumpe" ---|  ???  |------( )  "Sammelstoerung"
 "Stoer_Netz"  ---|       |
                  +-------+`,
      options: ['`&`', '`>=1`', '`XOR`', '`MOVE`'],
      correct: 1,
      explanation: '`>=1` heißt „mindestens ein Eingang ist wahr" – die ODER-Box. In SCL: `"Stoer_Motor" OR "Stoer_Pumpe" OR "Stoer_Netz"`.',
    },
    {
      id: 'q6',
      prompt: 'Was ist der Unterschied zwischen KOP und FUP?',
      options: [
        'KOP kann Bausteine aufrufen, FUP nicht',
        'FUP ist mächtiger als KOP und kennt zusätzlich Schleifen',
        'Beide sind gleich mächtig – nur die Darstellung unterscheidet sich',
        'KOP läuft schneller, weil es direkt in Maschinencode übersetzt wird',
      ],
      correct: 2,
      explanation: 'KOP und FUP erzeugen denselben Code. In KOP ist Reihe = UND und Parallelzweig = ODER, in FUP ist beides eine Box. Das TIA Portal kann pro Baustein umschalten.',
    },
    {
      id: 'q7',
      prompt: 'Welche Reihenfolge der Netzwerke ist korrekt, wenn `"Motor"` das Zwischenergebnis `"Freigabe"` nutzt?',
      code: `Variante A:
  Netzwerk 1: "Freigabe" --| & |---( ) "Motor"
  Netzwerk 2: "Bereit"   --| & |---( ) "Freigabe"

Variante B:
  Netzwerk 1: "Bereit"   --| & |---( ) "Freigabe"
  Netzwerk 2: "Freigabe" --| & |---( ) "Motor"`,
      options: [
        'Variante A – die Reihenfolge spielt keine Rolle',
        'Variante B – `"Freigabe"` muss berechnet sein, bevor es verwendet wird',
        'Variante A – Merker werden immer zuerst ausgewertet',
        'Beide sind gleichwertig, weil das PAA erst am Zyklusende geschrieben wird',
      ],
      correct: 1,
      explanation: 'Merker wirken sofort im selben Zyklus – aber nur, wenn sie vorher berechnet wurden. Variante A erzeugt eine Verzögerung von einem Zyklus.',
    },
    {
      id: 'q8',
      prompt: 'Was ist an diesem Netzwerk gut gelöst?',
      code: `Netzwerk 1: Band freigeben

            +-------+
  "Start" --|       |---+--( )  "Motor"
            |   &   |   |
 "Bereit" --|       |   +--( )  "Lampe_Betrieb"
            +-------+`,
      options: [
        'Nichts – ein Ausgang darf nicht verzweigen',
        'Das Verknüpfungsergebnis wird auf zwei Zuweisungen verzweigt statt doppelt gezeichnet',
        'Die Lampe wird invertiert angesteuert',
        'Die Box arbeitet als ODER, weil zwei Zuweisungen dranhängen',
      ],
      correct: 1,
      explanation: 'Ein Ergebnis darf auf mehrere Zuweisungen verzweigen. Das spart ein zweites Netzwerk und hält die Logik an einer Stelle.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Erstes Netzwerk zeichnen',
      level: 1,
      description: `Zeichne das Netzwerk für eine einfache Bandfreigabe.

**Aufgabe:** \`"Motor_Band"\` soll laufen, wenn \`"Taster_Start"\` **und** \`"Anlage_Bereit"\` wahr sind.

**Zuordnungsliste**

- \`"Taster_Start"\` – %I0.0, Bool
- \`"Anlage_Bereit"\` – %I0.1, Bool
- \`"Motor_Band"\` – %Q0.0, Bool

Zeichne das Netzwerk in ASCII und schreibe darunter die passende SCL-Zeile.`,
      starter: `Netzwerk 1: Foerderband freigeben

// TODO: UND-Box mit zwei Eingaengen und einer Zuweisung zeichnen


SCL:
// TODO`,
      solution: `Netzwerk 1: Foerderband freigeben

                    +-------+
   "Taster_Start" --|       |
                    |   &   |------( )  "Motor_Band"
  "Anlage_Bereit" --|       |
                    +-------+


SCL:
"Motor_Band" := "Taster_Start" AND "Anlage_Bereit";`,
      hints: [
        'Zwei Bedingungen, die beide erfüllt sein müssen – das ist eine UND-Verknüpfung.',
        'Du brauchst genau eine Box mit dem Symbol `&` und die Zuweisung `( )`.',
        'Links die beiden Operanden untereinander, in der Mitte die Box mit `&`, rechts eine Linie zur Zuweisung mit dem Operandennamen daneben.',
        'Gerüst:\n\n```text\n                    +-------+\n   "Taster_Start" --|       |\n                    |   ?   |------( )  "???"\n  "Anlage_Bereit" --|       |\n                    +-------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Netzwerk nach SCL übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk in **eine** SCL-Zeile.

Achte auf die Klammerung: Die ODER-Box liefert ein Zwischenergebnis, das in die UND-Box läuft.`,
      given: `Netzwerk 1: Pumpe ansteuern

            +-------+
   "Auto" --|       |
            |  >=1  |---+
   "Hand" --|       |   |     +-------+
            +-------+   +-----|       |
                              |   &   |------( )  "Pumpe"
                 "Freigabe" --|       |
                              +-------+`,
      starter: `SCL:
"Pumpe" := // TODO`,
      solution: `SCL:
"Pumpe" := ("Auto" OR "Hand") AND "Freigabe";`,
      hints: [
        'Lies das Netzwerk von rechts nach links: Die letzte Box vor der Zuweisung ist der äußerste Operator.',
        'ODER-Box `>=1` wird `OR`, UND-Box `&` wird `AND`, die Zuweisung `( )` wird `:=`.',
        'Die ODER-Box ist in die UND-Box eingebettet – das ist eine Klammer. Äußerer Operator ist `AND`.',
        '`"Pumpe" := ( ... OR ... ) AND ...;`',
      ],
    },
    {
      id: 'k3',
      title: 'SCL als Netzwerk zeichnen',
      level: 3,
      description: `Zeichne das FUP-Netzwerk zu dieser SCL-Zeile:

\`\`\`pascal
"Lampe_Betrieb" := ("Band_1" OR "Band_2" OR "Band_3") AND "Haupt_Ein";
\`\`\`

**Zuordnungsliste**

- \`"Band_1"\`, \`"Band_2"\`, \`"Band_3"\` – Bool, Rückmeldung der Bandmotoren
- \`"Haupt_Ein"\` – Bool, Hauptschalter
- \`"Lampe_Betrieb"\` – Bool, Betriebsleuchte

Nutze **eine** ODER-Box mit drei Eingängen – nicht zwei verkettete Zweier-Boxen.`,
      starter: `Netzwerk 1: Betriebsleuchte

// TODO`,
      solution: `Netzwerk 1: Betriebsleuchte

               +-------+
   "Band_1" ---|       |
   "Band_2" ---|  >=1  |---+
   "Band_3" ---|       |   |     +-------+
               +-------+   +-----|       |
                                 |   &   |------( )  "Lampe_Betrieb"
                   "Haupt_Ein" --|       |
                                 +-------+`,
      hints: [
        'Die Klammer in SCL ist die innere Box – sie steht links und speist die äußere Box.',
        'Du brauchst eine `>=1`-Box mit drei Eingängen und eine `&`-Box mit zwei Eingängen.',
        'Links die drei Bänder in die ODER-Box. Deren Ausgang geht als erster Eingang in die UND-Box, `"Haupt_Ein"` als zweiter. Ausgang der UND-Box auf die Zuweisung.',
        'Gerüst:\n\n```text\n               +-------+\n   "Band_1" ---|       |\n   "Band_2" ---|  >=1  |---+\n   "Band_3" ---|       |   |     +-------+\n               +-------+   +-----|   &   |---( ) "???"\n                     "???" ------|       |\n                                 +-------+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Fehlerhaftes Programm korrigieren',
      level: 4,
      description: `In diesem Programm stecken **zwei** Fehler:

1. \`"Motor"\` wird in zwei Netzwerken zugewiesen.
2. Das Zwischenergebnis \`"Freigabe"\` wird verwendet, bevor es berechnet wird.

Schreibe das Programm so um, dass es korrekt ist: ein Netzwerk für \`"Freigabe"\`, danach **ein** Netzwerk für \`"Motor"\`, das Automatik- und Handbetrieb über eine ODER-Box zusammenführt. Gib zu jedem Netzwerk auch die SCL-Zeile an.`,
      given: `Netzwerk 1: Motor Automatik
            +-------+
"Freigabe" -|   &   |------( )  "Motor"
    "Auto" -|       |
            +-------+

Netzwerk 2: Motor Hand
            +-------+
    "Hand" -|   &   |------( )  "Motor"
"Freigabe" -|       |
            +-------+

Netzwerk 3: Freigabe bilden
            +-------+
  "Haupt" --|   &   |------( )  "Freigabe"
   "Tuer" --|       |
            +-------+`,
      starter: `Netzwerk 1: Freigabe bilden

// TODO


Netzwerk 2: Motor – Automatik oder Hand

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Freigabe bilden

              +-------+
    "Haupt" --|       |
              |   &   |------( )  "Freigabe"
     "Tuer" --|       |
              +-------+


Netzwerk 2: Motor – Automatik oder Hand

              +-------+
     "Auto" --|       |
              |  >=1  |---+
     "Hand" --|       |   |     +-------+
              +-------+   +-----|       |
                                |   &   |------( )  "Motor"
                 "Freigabe" ----|       |
                                +-------+


SCL:
"Freigabe" := "Haupt" AND "Tuer";
"Motor"    := ("Auto" OR "Hand") AND "Freigabe";`,
      hints: [
        'Ein Ausgang darf nur an einer Stelle zugewiesen werden, und Zwischenergebnisse müssen vor ihrer Verwendung berechnet sein.',
        'Du brauchst zwei Netzwerke: eine `&`-Box für `"Freigabe"`, danach eine `>=1`-Box plus eine `&`-Box für `"Motor"`.',
        'Netzwerk 1 bildet `"Freigabe"` aus `"Haupt"` und `"Tuer"`. Netzwerk 2 fasst `"Auto"` und `"Hand"` in einer ODER-Box zusammen und verknüpft das Ergebnis per UND mit `"Freigabe"`.',
        'Gerüst Netzwerk 2:\n\n```text\n              +-------+\n     "Auto" --|  >=1  |---+\n     "Hand" --|       |   |     +-------+\n              +-------+   +-----|   &   |---( ) "Motor"\n                 "???" ---------|       |\n                                +-------+\n```',
      ],
    },
  ],
}

export default chapter
