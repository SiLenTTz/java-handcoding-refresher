import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '05',
  flashcards: [
    {
      id: 'f1',
      front: 'Was leistet eine Vergleichsbox in FUP?',
      back: 'Sie ist die **Brücke von der Wortwelt in die Bitwelt**: zwei Werteingänge (`Int`, `Real`, …), ein Bit-Ausgang, der direkt als Eingangsbedingung in eine Verknüpfungsbox geht.',
    },
    {
      id: 'f2',
      front: 'Welche Vergleichsoperatoren gibt es und wie heißen sie in SCL?',
      back: '`==` → `=`, `<>` → `<>`, `>` → `>`, `>=` → `>=`, `<` → `<`, `<=` → `<=`. Der Datentyp steht unter dem Operator in der Box.',
    },
    {
      id: 'f3',
      front: 'Was bedeutet ein **unbeschalteter** `EN`-Eingang?',
      back: 'Die Box wird in **jedem Zyklus** ausgeführt. `EN` offen heißt „immer", nicht „nie" – das ist die klassische Prüfungsfrage.',
    },
    {
      id: 'f4',
      front: 'Was passiert mit `OUT`, wenn `EN` `FALSE` ist?',
      back: '`OUT` behält den **alten Wert**. Die Box setzt nichts zurück und schreibt keine 0 – nachgelagerte Logik rechnet sonst mit veralteten Daten.',
    },
    {
      id: 'f5',
      front: 'Wofür ist `ENO` da?',
      back: '`ENO` ist `TRUE`, wenn die Box fehlerfrei gelaufen ist, und `FALSE` bei Überlauf oder Division durch null. Beim Verketten `ENO` auf das `EN` der Folgebox führen.',
    },
    {
      id: 'f6',
      front: 'Was macht die `MOVE`-Box?',
      back: 'Sie kopiert `IN` nach `OUT1`. Mehrere Ausgänge (`OUT1`, `OUT2`, …) sind möglich – derselbe Wert geht an mehrere Ziele.\n\n```pascal\n"Soll_Temp" := "Rezept".Soll_Temp;\n```',
    },
    {
      id: 'f7',
      front: 'Wie verkettest du zwei Rechenboxen korrekt?',
      back: 'Über **zwei** Verbindungen: `OUT` → `IN1` der nächsten Box **und** `ENO` → `EN`. Nur so wird die zweite Box bei einem Fehler der ersten übersprungen.',
    },
    {
      id: 'f8',
      front: 'Warum darf man `Int` und `Real` nicht mischen?',
      back: 'Die Box erwartet an beiden Eingängen denselben Datentyp. Wandle explizit mit `CONV` bzw. `INT_TO_REAL` / `REAL_TO_INT`.',
    },
    {
      id: 'f9',
      front: 'Unterschied `REAL_TO_INT` und `TRUNC`?',
      back: '`REAL_TO_INT` **rundet** (kaufmännisch, Round-half-to-even), `TRUNC` **schneidet ab**. `REAL_TO_INT(2.5)` = 2, `REAL_TO_INT(3.5)` = 4, `TRUNC(3.9)` = 3.',
    },
    {
      id: 'f10',
      front: 'Warum braucht eine Schaltschwelle eine Hysterese?',
      back: 'Ein einzelner Vergleich schaltet genau an der Grenze im Zyklustakt hin und her. Mit zwei Schwellen (z. B. ein bei `< 20`, aus bei `>= 80`) und einem `SR`-Baustein bleibt das Ventil ruhig.',
    },
    {
      id: 'f11',
      front: 'Warum vergleicht man `Real`-Werte nie mit `==`?',
      back: 'Gleitkommawerte treffen einen Vergleichswert praktisch nie exakt. Stattdessen ein **Toleranzband** aus `>=` und `<=` in einer UND-Box prüfen.',
    },
    {
      id: 'f12',
      front: 'Wie skaliert man einen Analogwert sauber?',
      back: 'Mit `NORM_X` (Rohwert 0…27648 auf 0.0…1.0 normieren) und anschließend `SCALE_X` (auf den physikalischen Bereich rechnen) – nicht von Hand mit MUL/DIV.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wann wird `"Pumpe"` wahr?',
      code: `Netzwerk 1:

                  +--------+
   "Fuellstand" --|   <    |
                  |  Int   |----+        +-------+
            20 ---|        |    +--------|   &   |---( ) "Pumpe"
                  +--------+     "Hand" -|       |
                                         +-------+`,
      options: [
        'wenn `"Fuellstand"` kleiner 20 **oder** `"Hand"` wahr ist',
        'wenn `"Fuellstand"` kleiner 20 **und** `"Hand"` wahr ist',
        'wenn `"Fuellstand"` größer 20 und `"Hand"` wahr ist',
        'immer, weil die Vergleichsbox kein `EN` hat',
      ],
      correct: 1,
      explanation: 'Der Bit-Ausgang der Vergleichsbox geht als Eingang in die UND-Box: `"Pumpe" := ("Fuellstand" < 20) AND "Hand";`',
    },
    {
      id: 'q2',
      prompt: '`"Freigabe"` ist `FALSE`. Welchen Wert hat `"Summe"`?',
      code: `Netzwerk 1:

                              +-----------+
                              |    ADD    |
                              |    Int    |
          "Freigabe" --------|EN      ENO|
                "A" --------|IN1     OUT|------  "Summe"
                "B" --------|IN2        |
                              +-----------+`,
      options: [
        '`0`',
        'den letzten berechneten Wert – `OUT` bleibt unverändert',
        '`"A" + "B"`, EN wird ignoriert',
        'undefiniert, die CPU geht in STOP',
      ],
      correct: 1,
      explanation: 'Bei `EN = FALSE` wird die Box nicht ausgeführt. `OUT` wird **nicht** zurückgesetzt – der alte Wert bleibt stehen. Deshalb immer eine Gültigkeitsinformation mitführen.',
    },
    {
      id: 'q3',
      prompt: 'Was bedeutet ein unbeschalteter `EN`-Eingang?',
      options: [
        'Die Box wird nie ausgeführt',
        'Die Box wird in jedem Zyklus ausgeführt',
        'Die Box wird nur beim Anlauf einmal ausgeführt',
        'Der Compiler meldet einen Fehler',
      ],
      correct: 1,
      explanation: '`EN` offen = „immer ausführen". Das ist bei reinen Rechenoperationen meist genau das Gewünschte.',
    },
    {
      id: 'q4',
      prompt: 'Welches Ergebnis liefert dieses Netzwerk?',
      code: `Netzwerk 1:

           +---------+
           |   DIV   |
           |   Int   |
     "7" --|IN1   OUT|------  "Ergebnis"
     "3" --|IN2      |
           +---------+`,
      options: ['`2.33`', '`2`', '`3`', '`ENO` wird `FALSE`'],
      correct: 1,
      explanation: 'Int-Division schneidet ab: 7 / 3 = 2. Für Nachkommastellen vorher mit `CONV` nach `Real` wandeln.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Fehler?',
      code: `Netzwerk 1:

                  +--------+
   "Fuellstand" --|   <    |
                  |  Int   |-----------------( )  "Pumpe"
            50 ---|        |
                  +--------+`,
      options: [
        'Die Vergleichsbox braucht einen `EN`-Eingang',
        'Eine einzige Schaltschwelle lässt die Pumpe am Grenzwert im Zyklustakt flattern',
        '`<` darf nicht mit `Int` verwendet werden',
        'Kein Fehler – das ist die Standardlösung',
      ],
      correct: 1,
      explanation: 'Bei `"Fuellstand"` = 50 wechselt das Ergebnis ständig. Lösung: zwei Schwellen (`< 20` auf `S`, `>= 80` auf `R1`) an einem `SR`-Baustein.',
    },
    {
      id: 'q6',
      prompt: 'Welche Box gehört an die markierte Stelle, damit der Sollwert nur beim Rezeptwechsel übernommen wird?',
      code: `Netzwerk 1:

                              +-----------+
                              |    ???    |
     "Rezept_gewaehlt" -------|EN      ENO|
      "Rezept".Soll_Temp -----|IN     OUT1|------  "Soll_Temp"
                              +-----------+`,
      options: ['`ADD`', '`MOVE`', '`CMP ==`', '`CONV`'],
      correct: 1,
      explanation: '`MOVE` kopiert `IN` nach `OUT1`. Mit beschaltetem `EN` passiert das nur bei aktivem Rezeptwechsel – sonst bleibt der alte Sollwert stehen.',
    },
    {
      id: 'q7',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1:

                  +--------+
     "Temp_Ist" --|  >=    |
                  |  Real  |----+
          60.0 ---|        |    |     +-------+
                  +--------+    +-----|   &   |---( ) "Temp_OK"
                  +--------+    +-----|       |
     "Temp_Ist" --|  <=    |    |     +-------+
                  |  Real  |----+
          80.0 ---|        |
                  +--------+`,
      options: [
        '`"Temp_OK" := "Temp_Ist" >= 60.0 OR "Temp_Ist" <= 80.0;`',
        '`"Temp_OK" := ("Temp_Ist" >= 60.0) AND ("Temp_Ist" <= 80.0);`',
        '`"Temp_OK" := "Temp_Ist" = 70.0;`',
        '`"Temp_OK" := NOT (("Temp_Ist" < 60.0) AND ("Temp_Ist" > 80.0));`',
      ],
      correct: 1,
      explanation: 'Zwei Vergleichsboxen liefern je ein Bit, die UND-Box verknüpft sie. Das ist die Standard-Bereichsprüfung.',
    },
    {
      id: 'q8',
      prompt: 'Warum sollte `ENO` beim Verketten auf das nächste `EN` geführt werden?',
      code: `Netzwerk 1:

           +---------+                 +---------+
           |   MUL   |                 |   DIV   |
   "Ist" --|IN1   OUT|--------------IN1-|IN1   OUT|------ "Prozent"
     100 --|IN2      |                 |IN2      |
           |      ENO|------------- EN -|EN    ENO|
           +---------+                 +---------+
                              "Max" ----|IN2      |`,
      options: [
        'Damit die zweite Box schneller rechnet',
        'Damit die zweite Box übersprungen wird, wenn die erste einen Fehler (z. B. Überlauf) meldet',
        '`ENO` ist Pflicht, sonst meldet der Compiler einen Fehler',
        'Damit `OUT` der ersten Box zurückgesetzt wird',
      ],
      correct: 1,
      explanation: 'Ohne die `ENO → EN`-Verdrahtung rechnet die Folgebox mit einem undefinierten Zwischenergebnis weiter. Die Kette bricht dann nicht sauber ab.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Grenzwertüberwachung',
      level: 1,
      description: `Zeichne das Netzwerk für eine Druckwarnung.

**Aufgabe:** \`"Warnung"\` soll kommen, wenn \`"Druck_Ist"\` **größer als 6.0** ist und \`"Quittiert"\` **nicht** gesetzt ist.

**Zuordnungsliste**

- \`"Druck_Ist"\` – Real, Druck in bar
- \`"Quittiert"\` – Bool
- \`"Warnung"\` – Bool

Zeichne das Netzwerk und schreibe die SCL-Zeile darunter.`,
      starter: `Netzwerk 1: Druckwarnung

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Druckwarnung

                 +--------+
  "Druck_Ist" ---|   >    |
                 |  Real  |----+       +-------+
          6.0 ---|        |    +-------|       |
                 +--------+            |   &   |------( )  "Warnung"
                      "Quittiert" ----o|       |
                                       +-------+


SCL:
"Warnung" := ("Druck_Ist" > 6.0) AND NOT "Quittiert";`,
      hints: [
        'Ein Zahlenvergleich liefert ein Bit – dieses Bit wird Eingang einer Verknüpfungsbox.',
        'Du brauchst eine Vergleichsbox `>` mit Datentyp `Real` und eine `&`-Box mit einem negierten Eingang.',
        'Links die Vergleichsbox mit `"Druck_Ist"` und `6.0`. Ihr Ausgang geht in die UND-Box, `"Quittiert"` kommt negiert dazu. Ausgang auf die Zuweisung.',
        'Gerüst:\n\n```text\n                 +--------+\n  "Druck_Ist" ---|   ?    |\n                 |  Real  |----+       +-------+\n          ??? ---|        |    +-------|   &   |---( ) "Warnung"\n                 +--------+     "???" ?|       |\n                                       +-------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Rechennetzwerk übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk nach SCL.

Achte auf \`EN\`: Der Wert wird nur unter einer Bedingung berechnet.`,
      given: `Netzwerk 1: Restmenge berechnen

                              +-----------+
                              |    SUB    |
                              |    Int    |
      "Charge_aktiv" --------|EN      ENO|------( ) "Rest_gueltig"
         "Soll_Menge" -------|IN1     OUT|------    "Rest_Menge"
          "Ist_Menge" -------|IN2        |
                              +-----------+`,
      starter: `SCL:
// TODO`,
      solution: `SCL:
"Rest_gueltig" := FALSE;
IF "Charge_aktiv" THEN
    "Rest_Menge"   := "Soll_Menge" - "Ist_Menge";
    "Rest_gueltig" := TRUE;
END_IF;`,
      hints: [
        'Ein beschalteter `EN`-Eingang wird in SCL zu einer `IF`-Bedingung.',
        '`SUB` ist `-`, `IN1` ist der Minuend, `IN2` der Subtrahend. `ENO` meldet, ob gerechnet wurde.',
        'Setze `"Rest_gueltig"` zuerst auf `FALSE`, rechne dann im `IF`-Zweig und setze die Gültigkeit dort auf `TRUE`.',
        '```pascal\n"Rest_gueltig" := FALSE;\nIF "Charge_aktiv" THEN\n    "Rest_Menge" := ... - ...;\n    ...\nEND_IF;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Prozentwert als Netzwerk',
      level: 3,
      description: `Zeichne das FUP-Netzwerk zu dieser SCL-Zeile:

\`\`\`pascal
"Fuell_Prozent" := ("Ist_Menge" * 100) / "Max_Menge";
\`\`\`

**Zuordnungsliste**

- \`"Ist_Menge"\`, \`"Max_Menge"\`, \`"Fuell_Prozent"\` – Int

Nutze zwei verkettete Rechenboxen und verbinde \`ENO\` der ersten Box auf \`EN\` der zweiten.`,
      starter: `Netzwerk 1: Fuellstand in Prozent

// TODO`,
      solution: `Netzwerk 1: Fuellstand in Prozent

              +---------+                   +---------+
              |   MUL   |                   |   DIV   |
              |   Int   |                   |   Int   |
"Ist_Menge" --|IN1   OUT|---------------IN1--|IN1   OUT|------ "Fuell_Prozent"
        100 --|IN2      |                   |         |
              |      ENO|---------------EN---|EN    ENO|
              +---------+                   +---------+
                              "Max_Menge" ---|IN2      |
                                             +---------+`,
      hints: [
        'Die Klammer in SCL wird zur ersten Box – ihr Ergebnis speist die zweite.',
        'Du brauchst eine `MUL`-Box und eine `DIV`-Box, beide mit Datentyp `Int`.',
        '`"Ist_Menge"` und `100` in die MUL-Box. Deren `OUT` geht auf `IN1` der DIV-Box, `"Max_Menge"` auf `IN2`. Zusätzlich `ENO` der MUL-Box auf `EN` der DIV-Box.',
        'Gerüst:\n\n```text\n              +---------+                   +---------+\n"Ist_Menge" --|IN1   OUT|---------------IN1--|IN1   OUT|--- "???"\n        ??? --|IN2      |                   |IN2      |\n              |      ENO|---------------EN---|EN    ENO|\n              +---------+                   +---------+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Behälterfüllung mit Hysterese korrigieren',
      level: 4,
      description: `Das vorgegebene Netzwerk hat **zwei** Fehler:

1. Nur eine Schaltschwelle – die Pumpe flattert am Grenzwert.
2. Die Temperaturfreigabe vergleicht einen \`Real\`-Wert mit \`==\`.

Schreibe beide Netzwerke korrekt:

- Pumpe **ein** bei \`"Fuellstand" < 20\`, **aus** bei \`"Fuellstand" >= 80\` – über einen \`SR\`-Baustein.
- \`"Temp_OK"\` soll wahr sein, wenn \`"Temp_Ist"\` im Band **72.4 bis 72.6** liegt.

Gib zu beiden Netzwerken die SCL-Entsprechung an.`,
      given: `Netzwerk 1: Pumpe (FEHLERHAFT)

                  +--------+
   "Fuellstand" --|   <    |
                  |  Int   |-----------------( )  "Pumpe"
            50 ---|        |
                  +--------+

Netzwerk 2: Temperaturfreigabe (FEHLERHAFT)

                  +--------+
     "Temp_Ist" --|   ==   |
                  |  Real  |-----------------( )  "Temp_OK"
          72.5 ---|        |
                  +--------+`,
      starter: `Netzwerk 1: Pumpe mit Hysterese

// TODO


Netzwerk 2: Temperaturfreigabe mit Toleranzband

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Pumpe mit Hysterese

                  +--------+          +--------+
   "Fuellstand" --|   <    |          |      SR|
                  |  Int   |----------|S       |------( )  "Pumpe"
            20 ---|        |          |        |
                  +--------+          |        |
                  +--------+          |        |
   "Fuellstand" --|   >=   |----------|R1      |
                  |  Int   |          +--------+
            80 ---|        |
                  +--------+


Netzwerk 2: Temperaturfreigabe mit Toleranzband

                  +--------+
     "Temp_Ist" --|   >=   |----+
                  |  Real  |    |     +-------+
          72.4 ---|        |    +-----|       |
                  +--------+          |   &   |------( )  "Temp_OK"
                  +--------+    +-----|       |
     "Temp_Ist" --|   <=   |    |     +-------+
                  |  Real  |----+
          72.6 ---|        |
                  +--------+


SCL:
IF "Fuellstand" >= 80 THEN
    "Pumpe" := FALSE;
ELSIF "Fuellstand" < 20 THEN
    "Pumpe" := TRUE;
END_IF;

"Temp_OK" := ("Temp_Ist" >= 72.4) AND ("Temp_Ist" <= 72.6);`,
      hints: [
        'Eine Hysterese braucht **zwei** Schwellen und ein Gedächtnis. Gleitkommawerte treffen einen Vergleichswert nie exakt.',
        'Netzwerk 1: zwei Vergleichsboxen auf `S` und `R1` eines `SR`-Bausteins. Netzwerk 2: zwei Vergleichsboxen (`>=` und `<=`) in einer `&`-Box.',
        'In Netzwerk 1 schaltet `< 20` die Pumpe ein (`S`), `>= 80` schaltet sie aus (`R1`) – Ausschalten ist beim SR vorrangig. In Netzwerk 2 prüfst du Unter- und Obergrenze und verknüpfst beide Bits mit UND.',
        'Gerüst Netzwerk 1:\n\n```text\n                  +--------+          +--------+\n   "Fuellstand" --|   ?    |----------|S     SR|---( ) "Pumpe"\n            ??? --|  Int   |          |        |\n                  +--------+          |        |\n   "Fuellstand" --|   ?    |----------|R1      |\n            ??? --|  Int   |          +--------+\n                  +--------+\n```',
      ],
    },
  ],
}

export default chapter
