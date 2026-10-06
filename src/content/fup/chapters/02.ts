import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    {
      id: 'f1',
      front: 'Welche drei logischen Grundboxen gibt es in FUP und was bedeuten ihre Symbole?',
      back: '`&` = UND (alle Eingänge wahr), `>=1` = ODER (mindestens einer wahr), `XOR` = Exklusiv-ODER (genau einer bzw. ungerade Anzahl).',
    },
    {
      id: 'f2',
      front: 'Wie wird ein einzelner Eingang negiert?',
      back: 'Mit einem kleinen Kreis direkt am Anschluss – in unserer Notation `-o|`. Das entspricht `NOT operand` und wirkt **nur** auf diesen Eingang.\n\n```text\n              +-------+\n   "Start" ---|   &   |---( ) "Motor"\n"Stoerung" --o|       |\n              +-------+\n```',
    },
    {
      id: 'f3',
      front: 'Was bedeutet ein Kreis **am Ausgang** der Box?',
      back: 'Das **Gesamtergebnis** wird invertiert: `"Y" := NOT ( ... );` – nicht die einzelnen Eingänge.',
    },
    {
      id: 'f4',
      front: 'Wie fügst du einer UND-Box eine vierte Bedingung hinzu?',
      back: 'Du **erweiterst die Box** um einen Eingang, statt eine zweite Box davorzuhängen. Eine Box mit vier Eingängen ist lesbarer als drei verkettete Zweier-Boxen.',
    },
    {
      id: 'f5',
      front: 'Formuliere De Morgan für FUP.',
      back: '`NOT (A OR B)` = `NOT A AND NOT B` und `NOT (A AND B)` = `NOT A OR NOT B`.\n\nIn FUP: ODER-Box mit negiertem Ausgang ≙ UND-Box mit negierten Eingängen.',
    },
    {
      id: 'f6',
      front: 'Warum wird ein Not-Aus-Signal im Programm **nicht** negiert?',
      back: 'Not-Aus ist hardwareseitig ein **Öffner**: Im Gutzustand liegt `TRUE` an, bei Betätigung oder Drahtbruch `FALSE`. Das Bit wird direkt in die UND-Box geführt.',
    },
    {
      id: 'f7',
      front: 'Übersetze: UND-Box mit `"A"`, `"B"` und negiertem `"C"`.',
      back: '```pascal\n"Y" := "A" AND "B" AND NOT "C";\n```',
    },
    {
      id: 'f8',
      front: 'Wann ist eine XOR-Box mit drei Eingängen wahr?',
      back: 'Wenn eine **ungerade Anzahl** Eingänge wahr ist (einer oder alle drei). XOR prüft die Parität, nicht „genau einer".',
    },
    {
      id: 'f9',
      front: 'Wie entsteht aus Box-Verschachtelung die Klammerung in SCL?',
      back: 'Die **innerste Box** (ganz links) ist die innerste Klammer, die letzte Box vor der Zuweisung ist der äußerste Operator.\n\n```pascal\n"Motor" := (("Auto" AND "Frei") OR "Hand") AND NOT "Stoer";\n```',
    },
    {
      id: 'f10',
      front: 'Ab wann wird ein FUP-Netzwerk unleserlich?',
      back: 'Ab etwa **drei Verschachtelungsebenen**. Dann Zwischenergebnisse auf benannte Merker legen oder den Baustein in SCL schreiben.',
    },
    {
      id: 'f11',
      front: 'Was passiert bei einem unbeschalteten Eingang einer UND-Box?',
      back: 'Der Compiler meldet einen **Fehler**. Er nimmt nicht stillschweigend `TRUE` an – unbeschaltete Eingänge müssen entfernt werden.',
    },
    {
      id: 'f12',
      front: 'Warum sollen Signalnamen positiv formuliert sein?',
      back: 'Weil die Negation im Netzwerk sonst zu einer doppelten Verneinung führt. `NOT "Tuer_nicht_offen"` ist unlesbar – `NOT "Tuer_zu"` ist sofort verständlich.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wann wird `"Motor"` wahr?',
      code: `Netzwerk 1:

                +-------+
    "Start" ----|       |
                |   &   |------( )  "Motor"
 "Stoerung" ---o|       |
                +-------+`,
      options: [
        'wenn `"Start"` und `"Stoerung"` beide wahr sind',
        'wenn `"Start"` wahr und `"Stoerung"` falsch ist',
        'wenn `"Start"` falsch und `"Stoerung"` wahr ist',
        'immer, weil ein Eingang negiert ist',
      ],
      correct: 1,
      explanation: 'Der Kreis negiert nur diesen Eingang: `"Motor" := "Start" AND NOT "Stoerung";`',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1:

              +-------+
       "A" ---|  >=1  |-----o( )  "Y"
       "B" ---|       |
              +-------+`,
      options: [
        '`"Y" := NOT "A" OR NOT "B";`',
        '`"Y" := NOT ("A" OR "B");`',
        '`"Y" := NOT "A" OR "B";`',
        '`"Y" := "A" OR NOT "B";`',
      ],
      correct: 1,
      explanation: 'Der Kreis steht am **Ausgang** – das gesamte ODER-Ergebnis wird invertiert. Nach De Morgan ist das gleichbedeutend mit `NOT "A" AND NOT "B"`.',
    },
    {
      id: 'q3',
      prompt: 'Welches Netzwerk ist **äquivalent** zu `"Y" := NOT "A" AND NOT "B";`?',
      options: [
        'UND-Box mit negiertem Ausgang',
        'ODER-Box mit negiertem Ausgang',
        'XOR-Box ohne Negation',
        'ODER-Box mit negierten Eingängen',
      ],
      correct: 1,
      explanation: 'De Morgan: `NOT A AND NOT B` = `NOT (A OR B)`. Also ODER-Box, Kreis am Ausgang.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler?',
      code: `Netzwerk 1: Motor freigeben

              +-------+
   "Start" ---|       |
              |   &   |------( )  "Motor"
  "NotAus" --o|       |
              +-------+

Zuordnungsliste:
  "NotAus"  %I0.7  Bool  – Not-Aus-Taster, OEFFNER-Kontakt`,
      options: [
        'Die UND-Box braucht einen dritten Eingang',
        '`"NotAus"` ist ein Öffner und liefert im Gutzustand `TRUE` – die Negation sperrt den Motor dauerhaft',
        '`"NotAus"` müsste an einer ODER-Box hängen',
        'Kein Fehler – Sicherheitssignale werden immer negiert',
      ],
      correct: 1,
      explanation: 'Öffner-Kontakte liefern im unbetätigten Zustand `TRUE`. Sie werden **ohne** Negation in die UND-Box geführt: `"Motor" := "Start" AND "NotAus";`',
    },
    {
      id: 'q5',
      prompt: 'Welche Box gehört an die markierte Stelle, damit `"Licht"` bei einer Wechselschaltung korrekt arbeitet (Umlegen eines beliebigen Schalters toggelt das Licht)?',
      code: `Netzwerk 1:

              +-------+
 "Schalt_1" --|       |
              |  ???  |------( )  "Licht"
 "Schalt_2" --|       |
              +-------+`,
      options: ['`&`', '`>=1`', '`XOR`', '`SR`'],
      correct: 2,
      explanation: 'Bei einer Wechselschaltung ist das Licht an, wenn **genau einer** der Schalter wahr ist – das ist `XOR`.',
    },
    {
      id: 'q6',
      prompt: 'Welches Verhalten hat dieses Netzwerk?',
      code: `Netzwerk 1:

              +-------+
       "A" --o|       |
              |   &   |------( )  "Y"
       "B" --o|       |
              +-------+`,
      options: [
        '`"Y"` ist wahr, wenn mindestens einer von beiden falsch ist',
        '`"Y"` ist wahr, wenn beide falsch sind',
        '`"Y"` ist wahr, wenn genau einer falsch ist',
        '`"Y"` ist immer falsch',
      ],
      correct: 1,
      explanation: '`"Y" := NOT "A" AND NOT "B";` – beide Eingänge müssen `FALSE` sein. Äquivalent zu `NOT ("A" OR "B")`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist besser lesbar?',
      code: `Variante A:
        +---+           +---+          +---+
   A ---| & |---+  +----| & |---+ +----| & |---( ) "Y"
   B ---|   |   +--|    |   |   +-|    |   |
        +---+   C -+----+---+   D -+   +---+

Variante B:
              +-------+
       "A" ---|       |
       "B" ---|   &   |------( )  "Y"
       "C" ---|       |
       "D" ---|       |
              +-------+`,
      options: [
        'Variante A – kleine Boxen sind übersichtlicher',
        'Variante B – eine Box mit vier Eingängen statt drei verketteter Zweier-Boxen',
        'Beide sind gleich gut',
        'Variante A, weil sie weniger Speicher braucht',
      ],
      correct: 1,
      explanation: 'Gleichartige Bedingungen gehören in **eine** Box. Verkettete Zweier-Boxen erzeugen nur optisches Rauschen – der erzeugte Code ist identisch.',
    },
    {
      id: 'q8',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1:

              +-------+
    "Auto" ---|       |
              |   &   |---+
"Freigabe" ---|       |   |      +-------+
              +-------+   +------|       |
                                 |  >=1  |---+
                      "Hand" ----|       |   |     +-------+
                                 +-------+   +-----|   &   |---( ) "Motor"
                                     "Stoerung" --o|       |
                                                   +-------+`,
      options: [
        '`"Motor" := "Auto" AND "Freigabe" OR "Hand" AND NOT "Stoerung";`',
        '`"Motor" := (("Auto" AND "Freigabe") OR "Hand") AND NOT "Stoerung";`',
        '`"Motor" := ("Auto" AND ("Freigabe" OR "Hand")) AND NOT "Stoerung";`',
        '`"Motor" := NOT (("Auto" AND "Freigabe") OR "Hand" OR "Stoerung");`',
      ],
      correct: 1,
      explanation: 'Von links nach rechts: erst `AND`, dessen Ergebnis mit `"Hand"` ins `OR`, dessen Ergebnis mit `NOT "Stoerung"` ins äußere `AND`. Jede Box-Schachtelung wird eine Klammer.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Negation am Eingang',
      level: 1,
      description: `Zeichne das Netzwerk für eine Pumpensteuerung.

**Aufgabe:** \`"Pumpe"\` läuft, wenn \`"Freigabe"\` wahr ist **und** \`"Trockenlauf"\` **nicht** ansteht.

**Zuordnungsliste**

- \`"Freigabe"\` – Bool
- \`"Trockenlauf"\` – Bool, Störbit (TRUE = Störung)
- \`"Pumpe"\` – Bool

Zeichne das Netzwerk und schreibe die SCL-Zeile darunter.`,
      starter: `Netzwerk 1: Pumpe freigeben

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Pumpe freigeben

                  +-------+
    "Freigabe" ---|       |
                  |   &   |------( )  "Pumpe"
 "Trockenlauf" --o|       |
                  +-------+


SCL:
"Pumpe" := "Freigabe" AND NOT "Trockenlauf";`,
      hints: [
        'Eine Bedingung muss erfüllt, eine darf **nicht** erfüllt sein – also UND mit einer Negation.',
        'Du brauchst eine `&`-Box. Die Negation ist kein eigener Baustein, sondern ein Kreis `o` am Eingang.',
        'Oben `"Freigabe"` normal in die Box, unten `"Trockenlauf"` mit `-o|` negiert. Ausgang auf die Zuweisung.',
        'Gerüst:\n\n```text\n                  +-------+\n    "Freigabe" ---|   &   |---( ) "Pumpe"\n "Trockenlauf" --?|       |\n                  +-------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Netzwerk mit Negation übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk in **eine** SCL-Zeile.

Achte darauf, wo die Kreise sitzen: am Eingang oder am Ausgang.`,
      given: `Netzwerk 1: Lampe "Anlage steht"

              +-------+
   "Band_1" --|       |
              |  >=1  |-----o( )  "Lampe_Stillstand"
   "Band_2" --|       |
   "Pumpe"  --|       |
              +-------+`,
      starter: `SCL:
"Lampe_Stillstand" := // TODO`,
      solution: `SCL:
"Lampe_Stillstand" := NOT ("Band_1" OR "Band_2" OR "Pumpe");

// Gleichwertig nach De Morgan:
// "Lampe_Stillstand" := NOT "Band_1" AND NOT "Band_2" AND NOT "Pumpe";`,
      hints: [
        'Der Kreis sitzt vor der Zuweisung – er invertiert das Gesamtergebnis, nicht die einzelnen Eingänge.',
        '`>=1` wird `OR`, der Kreis am Ausgang wird `NOT ( ... )`.',
        'Erst alle drei Operanden mit `OR` verketten, dann das Ganze klammern und ein `NOT` davorsetzen.',
        '`"Lampe_Stillstand" := NOT ( ... OR ... OR ... );`',
      ],
    },
    {
      id: 'k3',
      title: 'Zweihandbedienung als Netzwerk',
      level: 3,
      description: `Zeichne das FUP-Netzwerk zu dieser SCL-Zeile:

\`\`\`pascal
"Presse_ab" := "Taster_links" AND "Taster_rechts" AND "Schutzgitter_zu" AND NOT "Stoerung";
\`\`\`

**Zuordnungsliste**

- \`"Taster_links"\`, \`"Taster_rechts"\` – Bool, Zweihandtaster
- \`"Schutzgitter_zu"\` – Bool
- \`"Stoerung"\` – Bool, Sammelstörung
- \`"Presse_ab"\` – Bool

Nutze **eine** UND-Box mit vier Eingängen.`,
      starter: `Netzwerk 1: Zweihandbedienung Presse

// TODO`,
      solution: `Netzwerk 1: Zweihandbedienung Presse

                       +-------+
    "Taster_links" ----|       |
   "Taster_rechts" ----|   &   |------( )  "Presse_ab"
 "Schutzgitter_zu" ----|       |
        "Stoerung" ---o|       |
                       +-------+`,
      hints: [
        'Vier Bedingungen, alle mit `AND` verknüpft – also genau eine Box.',
        'Die Box wird auf vier Eingänge **erweitert**, nicht in mehrere Boxen zerlegt. `NOT "Stoerung"` wird ein Kreis am Eingang.',
        'Die ersten drei Operanden normal untereinander in die `&`-Box, der vierte (`"Stoerung"`) mit `-o|`. Ausgang auf die Zuweisung.',
        'Gerüst:\n\n```text\n                       +-------+\n    "Taster_links" ----|       |\n   "Taster_rechts" ----|   &   |---( ) "???"\n "Schutzgitter_zu" ----|       |\n        "Stoerung" ---?|       |\n                       +-------+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'De Morgan und Verschachtelung korrigieren',
      level: 4,
      description: `Der Programmierer wollte ausdrücken:

> \`"Warnung"\` soll kommen, wenn **nicht beide** Bänder gleichzeitig laufen, aber nur solange die Anlage eingeschaltet ist.

Also: \`"Warnung" := NOT ("Band_1" AND "Band_2") AND "Anlage_Ein";\`

Das vorgegebene Netzwerk macht etwas anderes. Finde den Fehler, zeichne das **korrigierte** Netzwerk und schreibe darunter, welche Logik das fehlerhafte Netzwerk tatsächlich hatte.`,
      given: `Netzwerk 1: Warnung (FEHLERHAFT)

                  +-------+
     "Band_1" ---o|       |
                  |   &   |---+
     "Band_2" ---o|       |   |     +-------+
                  +-------+   +-----|       |
                                    |   &   |------( )  "Warnung"
                    "Anlage_Ein" ---|       |
                                    +-------+`,
      starter: `Netzwerk 1: Warnung (korrigiert)

// TODO


Tatsaechliche Logik des fehlerhaften Netzwerks:
// TODO`,
      solution: `Netzwerk 1: Warnung (korrigiert)

                  +-------+
     "Band_1" ----|       |
                  |   &   |---o---+
     "Band_2" ----|       |       |     +-------+
                  +-------+       +-----|       |
                                        |   &   |------( )  "Warnung"
                        "Anlage_Ein" ---|       |
                                        +-------+


Tatsaechliche Logik des fehlerhaften Netzwerks:
"Warnung" := NOT "Band_1" AND NOT "Band_2" AND "Anlage_Ein";
// = Warnung nur, wenn BEIDE Baender stehen

Korrekte Logik:
"Warnung" := NOT ("Band_1" AND "Band_2") AND "Anlage_Ein";
// = Warnung, sobald mindestens ein Band steht`,
      hints: [
        'De Morgan beachten: `NOT (A AND B)` ist **nicht** dasselbe wie `NOT A AND NOT B`.',
        'Die Negation muss vom Eingang an den **Ausgang** der inneren UND-Box wandern.',
        'Innere `&`-Box mit `"Band_1"` und `"Band_2"` ohne Eingangsnegation; der Ausgang der Box wird negiert und geht als Eingang in die äußere `&`-Box zusammen mit `"Anlage_Ein"`.',
        'Gerüst der inneren Box:\n\n```text\n                  +-------+\n     "Band_1" ----|   &   |---?---+\n     "Band_2" ----|       |       |\n                  +-------+       |\n```',
      ],
    },
  ],
}

export default chapter
