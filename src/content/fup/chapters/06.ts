import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '06',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie viele SCL-Anweisungen entsprechen einem FUP-Netzwerk?',
      back: 'Genau **eine** – bei Bausteinaufrufen zwei (Aufruf + Auswertung des Ausgangs). Die Box ganz rechts vor der Zuweisung ist der äußerste Operator.',
    },
    {
      id: 'f2',
      front: 'Nenne die vier wichtigsten Übersetzungsregeln FUP → SCL.',
      back: '`&` → `AND`, `>=1` → `OR`, Kreis am Eingang → `NOT operand`, Zuweisung `( )` → `:=`. Box-Verschachtelung wird zur Klammer.',
    },
    {
      id: 'f3',
      front: 'Wie ist die Operatorpräzedenz in SCL?',
      back: '`NOT` > `AND` > `XOR` > `OR`. In FUP gibt es keine Präzedenz – die Struktur ist explizit. Deshalb entstehen beim Übersetzen Klammern.',
    },
    {
      id: 'f4',
      front: 'Wie übersetzt du einen negierten **Ausgang**?',
      back: 'Als `NOT ( ... )` um den gesamten Ausdruck – **nicht** als Negation der einzelnen Operanden.\n\n```pascal\n"Y" := NOT ("A" AND "B");   // richtig\n"Y" := NOT "A" AND NOT "B"; // falsch\n```',
    },
    {
      id: 'f5',
      front: 'Wie übersetzt du `SR` und `RS` nach SCL?',
      back: 'Der **dominante** (untere) Eingang wird zum ersten `IF`-Zweig:\n\n`SR` → `IF Reset THEN ... ELSIF Set THEN ...`\n`RS` → `IF Set THEN ... ELSIF Reset THEN ...`',
    },
    {
      id: 'f6',
      front: 'Wie übersetzt du einen Bausteinaufruf wie `TON` nach SCL?',
      back: 'Zwei Zeilen: erst die Instanz aufrufen, dann den Ausgang auswerten.\n\n```pascal\n"DB_Nachl"(IN := "Motor", PT := T#10s);\n"Absaugung" := "DB_Nachl".Q;\n```',
    },
    {
      id: 'f7',
      front: 'Wie gehst du vor, wenn du SCL → FUP übersetzt?',
      back: '1. Äußersten Operator bestimmen → letzte Box vor der Zuweisung.\n2. Operanden als Eingänge eintragen, `NOT` wird zum Kreis.\n3. Geklammerte Teilausdrücke werden eigene Boxen **links davon**.\n4. Variable links von `:=` wird die Zuweisung.',
    },
    {
      id: 'f8',
      front: 'Welche SCL-Konstrukte haben **keine** FUP-Entsprechung?',
      back: '`FOR`, `WHILE`, `REPEAT`, `CASE`, String-Verarbeitung und komplexe Ausdrücke mit temporären Zwischenwerten. FUP kennt nur Ausdrücke und Zuweisungen.',
    },
    {
      id: 'f9',
      front: 'Ist die Übersetzung in beide Richtungen immer möglich?',
      back: '**FUP → SCL immer**, weil FUP eine Teilmenge ist. **SCL → FUP nur** für den reinen Verknüpfungsteil ohne Kontrollstrukturen.',
    },
    {
      id: 'f10',
      front: 'Wann wählst du FUP, wann SCL?',
      back: 'FUP für bitorientierte Verriegelungen, Freigaben und Sicherheitslogik (Online-Status direkt am Netzwerk ablesbar). SCL für Berechnungen, Schrittketten, Rezepte, Arrays und Schleifen.',
    },
    {
      id: 'f11',
      front: 'Gibt es einen Laufzeitvorteil von FUP oder SCL?',
      back: 'Nein. Beide werden in denselben Maschinencode übersetzt. Die Wahl ist eine Frage der **Lesbarkeit und Wartbarkeit**, nicht der Performance.',
    },
    {
      id: 'f12',
      front: 'Warum sollte man benannte Zwischenergebnisse beim Übersetzen erhalten?',
      back: 'Weil sie in der Online-Diagnose sichtbar sind. Mehrere Netzwerke in eine lange SCL-Zeile zu quetschen macht die Fehlersuche an der Anlage deutlich schwerer.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1:

              +-------+
     "Haupt" -|       |
      "Tuer" -|   &   |------( )  "Freigabe"
   "Stoerung"-o       |
              +-------+`,
      options: [
        '`"Freigabe" := "Haupt" AND "Tuer" AND "Stoerung";`',
        '`"Freigabe" := "Haupt" AND "Tuer" AND NOT "Stoerung";`',
        '`"Freigabe" := NOT ("Haupt" AND "Tuer" AND "Stoerung");`',
        '`"Freigabe" := "Haupt" OR "Tuer" OR NOT "Stoerung";`',
      ],
      correct: 1,
      explanation: 'Der Kreis negiert nur diesen einen Eingang. Die Operanden werden in der Reihenfolge von oben nach unten mit `AND` verkettet.',
    },
    {
      id: 'q2',
      prompt: 'Wo ist der Fehler in der Übersetzung?',
      code: `Netzwerk 1:
              +-------+
    "Auto" ---|  >=1  |---+     +-------+
    "Hand" ---|       |   +-----|   &   |---( ) "Motor"
              +-------+  "Frei"-|       |
                                +-------+

Uebersetzung:
"Motor" := "Auto" OR "Hand" AND "Frei";`,
      options: [
        'Die Operanden stehen in der falschen Reihenfolge',
        'Die Klammer um den ODER-Teil fehlt – `AND` bindet stärker als `OR`',
        '`"Frei"` müsste negiert werden',
        'Kein Fehler – die Übersetzung ist korrekt',
      ],
      correct: 1,
      explanation: 'Ohne Klammer liest SCL `"Auto" OR ("Hand" AND "Frei")`. Korrekt ist `("Auto" OR "Hand") AND "Frei"`.',
    },
    {
      id: 'q3',
      prompt: 'Welche SCL-Übersetzung ist korrekt?',
      code: `Netzwerk 1:

              +-------+
       "A" ---|   &   |-----o( )  "Y"
       "B" ---|       |
              +-------+`,
      options: [
        '`"Y" := NOT "A" AND NOT "B";`',
        '`"Y" := NOT ("A" AND "B");`',
        '`"Y" := "A" AND NOT "B";`',
        '`"Y" := NOT "A" OR "B";`',
      ],
      correct: 1,
      explanation: 'Der Kreis sitzt am Ausgang – das gesamte Ergebnis wird invertiert. Nach De Morgan wäre das gleich `NOT "A" OR NOT "B"`, aber nicht `NOT "A" AND NOT "B"`.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler in dieser Übersetzung?',
      code: `Netzwerk 1:
                   +--------+
      "Start" -----|S     SR|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+

Uebersetzung:
IF "Start" THEN
    "Motor" := TRUE;
ELSIF "Stopp" THEN
    "Motor" := FALSE;
END_IF;`,
      options: [
        '`ELSIF` ist in SCL nicht erlaubt',
        'Der Vorrang ist gedreht – beim `SR` gewinnt `R1`, also muss `"Stopp"` in den ersten Zweig',
        'Die Zuweisung müsste `:=` statt `=` verwenden',
        'Kein Fehler – die Reihenfolge ist egal',
      ],
      correct: 1,
      explanation: '`SR` = Rücksetzen vorrangig (unterer Eingang `R1`). Der dominante Eingang gehört in den ersten `IF`-Zweig.',
    },
    {
      id: 'q5',
      prompt: 'Welche Box gehört an die markierte Stelle, damit das Netzwerk `"Y" := ("A" OR "B") AND NOT "C";` abbildet?',
      code: `Netzwerk 1:

              +-------+
       "A" ---|       |
              |  ???  |---+     +-------+
       "B" ---|       |   +-----|   &   |---( ) "Y"
              +-------+    "C" o|       |
                                +-------+`,
      options: ['`&`', '`>=1`', '`XOR`', '`SR`'],
      correct: 1,
      explanation: 'Die Klammer `("A" OR "B")` ist die innere Box – also eine `>=1`-Box, deren Ausgang in die äußere UND-Box läuft.',
    },
    {
      id: 'q6',
      prompt: 'Welche Übersetzung ist korrekt?',
      code: `Netzwerk 1:

                   +-----------+
                   |    TON    |
                   | "DB_Nachl"|
     "Motor" ------|IN        Q|------( )  "Absaugung"
      T#10s  ------|PT       ET|
                   +-----------+`,
      options: [
        '`"Absaugung" := "DB_Nachl".Q;`',
        '`"DB_Nachl"(IN := "Motor", PT := T#10s);` gefolgt von `"Absaugung" := "DB_Nachl".Q;`',
        '`"Absaugung" := TON("Motor", T#10s).Q;`',
        '`"DB_Nachl".Q := "Motor";`',
      ],
      correct: 1,
      explanation: 'In SCL sind Aufruf und Auswertung zwei Zeilen. Ohne den Aufruf aktualisiert der Baustein `Q` und `ET` nicht.',
    },
    {
      id: 'q7',
      prompt: 'Welches SCL-Konstrukt lässt sich **nicht** sinnvoll nach FUP übersetzen?',
      options: [
        '`"Y" := "A" AND NOT "B";`',
        '`IF "Stopp" THEN "Motor" := FALSE; END_IF;`',
        '`FOR i := 0 TO 9 DO "Summe" := "Summe" + "Werte"[i]; END_FOR;`',
        '`"Pumpe" := ("Fuellstand" < 20) AND "Hand";`',
      ],
      correct: 2,
      explanation: 'FUP kennt keine Schleifen. `IF ... THEN x := FALSE` ist eine `(R)`-Spule, Vergleiche sind Vergleichsboxen – nur `FOR` hat keine Entsprechung.',
    },
    {
      id: 'q8',
      prompt: 'Welche Aussage über FUP und SCL ist richtig?',
      options: [
        'FUP wird schneller abgearbeitet, weil es direkt in Maschinencode übersetzt wird',
        'Beide erzeugen denselben Code – die Wahl ist eine Frage von Lesbarkeit und Diagnosefähigkeit',
        'SCL kann keine Bausteine mit Instanz-DB aufrufen',
        'Ein SCL-Baustein lässt sich im TIA Portal jederzeit nach FUP umschalten',
      ],
      correct: 1,
      explanation: 'KOP ↔ FUP ist umschaltbar, SCL → FUP nicht. Laufzeitunterschiede gibt es keine – entscheidend ist, dass FUP den Signalfluss online sichtbar macht.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Netzwerk nach SCL',
      level: 1,
      description: `Übersetze das vorgegebene Netzwerk in **eine** SCL-Zeile.

Achte auf den negierten Eingang.`,
      given: `Netzwerk 1: Band freigeben

              +-------+
     "Haupt" -|       |
      "Tuer" -|   &   |------( )  "Freigabe_Band"
     "Quitt" -|       |
   "Stoerung"-o       |
              +-------+`,
      starter: `SCL:
"Freigabe_Band" := // TODO`,
      solution: `SCL:
"Freigabe_Band" := "Haupt" AND "Tuer" AND "Quitt" AND NOT "Stoerung";`,
      hints: [
        'Eine UND-Box ohne Verschachtelung wird zu einer einzigen Kette von `AND`.',
        '`&` → `AND`, Kreis am Eingang → `NOT` vor genau diesem Operanden.',
        'Operanden von oben nach unten abarbeiten, beim letzten ein `NOT` davorsetzen.',
        '`"Freigabe_Band" := "Haupt" AND ... AND NOT ...;`',
      ],
    },
    {
      id: 'k2',
      title: 'SCL nach FUP',
      level: 2,
      description: `Zeichne das FUP-Netzwerk zu dieser SCL-Zeile:

\`\`\`pascal
"Alarm" := ("Druck" > 8.0) AND NOT "Quittiert" AND "Anlage_Ein";
\`\`\`

**Zuordnungsliste**

- \`"Druck"\` – Real
- \`"Quittiert"\`, \`"Anlage_Ein"\`, \`"Alarm"\` – Bool

Vergiss die Vergleichsbox nicht – sie liefert das erste Bit.`,
      starter: `Netzwerk 1: Druckalarm

// TODO`,
      solution: `Netzwerk 1: Druckalarm

                 +--------+
      "Druck" ---|   >    |
                 |  Real  |----+       +-------+
          8.0 ---|        |    +-------|       |
                 +--------+            |   &   |------( )  "Alarm"
                      "Quittiert" ----o|       |
                     "Anlage_Ein" -----|       |
                                       +-------+`,
      hints: [
        'Der äußerste Operator ist `AND` – das wird die letzte Box vor der Zuweisung.',
        'Du brauchst eine Vergleichsbox `>` mit Datentyp `Real` und eine `&`-Box mit drei Eingängen.',
        'Der Vergleich geht als erster Eingang in die UND-Box, `"Quittiert"` negiert als zweiter, `"Anlage_Ein"` als dritter.',
        'Gerüst:\n\n```text\n                 +--------+\n      "Druck" ---|   ?    |\n                 |  Real  |----+       +-------+\n          ??? ---|        |    +-------|   &   |---( ) "Alarm"\n                 +--------+     "???" ?|       |\n                                 "???" -|       |\n                                       +-------+\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Baustein-Netzwerk in beide Richtungen',
      level: 3,
      description: `Übersetze das vorgegebene Netzwerk nach SCL **und** zeichne anschließend das Netzwerk für diese SCL-Logik:

\`\`\`pascal
IF "Tor_Zu_Tast" THEN
    "Tor_auf" := FALSE;
ELSIF "Tor_Auf_Tast" OR "Funk_Auf" THEN
    "Tor_auf" := TRUE;
END_IF;
\`\`\`

So übst du beide Richtungen in einer Aufgabe.`,
      given: `Netzwerk A (nach SCL uebersetzen):

                                  +-----------+
              +-------+           |    TON    |
   "Pumpe" ---|   &   |-----------|IN "DB_Tr" |
"Durchfluss"-o|       |    T#3s --|PT        Q|------(S) "Stoer_Trocken"
              +-------+           +-----------+`,
      starter: `SCL zu Netzwerk A:
// TODO


Netzwerk B (aus SCL zeichnen): Tor-Steuerung

// TODO`,
      solution: `SCL zu Netzwerk A:
"DB_Tr"(IN := "Pumpe" AND NOT "Durchfluss", PT := T#3s);
IF "DB_Tr".Q THEN
    "Stoer_Trocken" := TRUE;
END_IF;


Netzwerk B (aus SCL zeichnen): Tor-Steuerung

                        +-------+       +--------+
    "Tor_Auf_Tast" -----|       |       |      SR|
                        |  >=1  |-------|S       |------( )  "Tor_auf"
        "Funk_Auf" -----|       |       |        |
                        +-------+       |        |
      "Tor_Zu_Tast" ----------------- --|R1      |
                                        +--------+`,
      hints: [
        'Bausteinaufruf und Auswertung sind in SCL zwei Schritte. `IF ... ELSIF` mit Reset zuerst ist ein `SR`-Baustein.',
        'Netzwerk A: `IN` bekommt den UND-Ausdruck, `(S)` wird `IF ... THEN x := TRUE; END_IF;`. Netzwerk B: `>=1`-Box vor dem `S`-Eingang eines `SR`.',
        'In A: erst `"DB_Tr"(IN := ..., PT := T#3s);`, dann den Ausgang abfragen. In B: beide Einschaltquellen in die ODER-Box, deren Ausgang auf `S`, `"Tor_Zu_Tast"` direkt auf `R1`.',
        'Gerüst Netzwerk B:\n\n```text\n                        +-------+       +--------+\n    "Tor_Auf_Tast" -----|  >=1  |-------|?     SR|---( ) "???"\n        "Funk_Auf" -----|       |       |        |\n                        +-------+       |        |\n      "Tor_Zu_Tast" -------------------|?       |\n                                        +--------+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Fehlerhafte Übersetzung korrigieren',
      level: 4,
      description: `Ein Kollege hat ein FUP-Programm nach SCL übersetzt und dabei **drei** Fehler gemacht:

1. Fehlende Klammer – \`AND\` bindet stärker als \`OR\`.
2. Negierter Ausgang falsch aufgelöst (De Morgan missachtet).
3. Der Bausteinaufruf fehlt, nur \`.Q\` wird ausgewertet.

Schreibe die korrigierte SCL-Fassung aller drei Netzwerke.`,
      given: `Netzwerk 1:
              +-------+
    "Auto" ---|  >=1  |---+     +-------+
    "Hand" ---|       |   +-----|   &   |---( ) "Motor"
              +-------+ "Frei" -|       |
                                +-------+

Netzwerk 2:
              +-------+
   "Band_1" --|   &   |-----o( )  "Warnung"
   "Band_2" --|       |
              +-------+

Netzwerk 3:
                   +-----------+
                   |    TOF    |
                   | "DB_Nachl"|
     "Motor" ------|IN        Q|------( )  "Absaugung"
      T#10s  ------|PT       ET|
                   +-----------+


Fehlerhafte Uebersetzung:
"Motor"     := "Auto" OR "Hand" AND "Frei";
"Warnung"   := NOT "Band_1" AND NOT "Band_2";
"Absaugung" := "DB_Nachl".Q;`,
      starter: `Korrigierte SCL-Uebersetzung:

// Netzwerk 1
// TODO

// Netzwerk 2
// TODO

// Netzwerk 3
// TODO`,
      solution: `Korrigierte SCL-Uebersetzung:

// Netzwerk 1 – Klammer um den ODER-Teil
"Motor" := ("Auto" OR "Hand") AND "Frei";

// Netzwerk 2 – Negation gilt dem Gesamtergebnis
"Warnung" := NOT ("Band_1" AND "Band_2");
// gleichwertig: NOT "Band_1" OR NOT "Band_2"

// Netzwerk 3 – erst Instanz aufrufen, dann auswerten
"DB_Nachl"(IN := "Motor", PT := T#10s);
"Absaugung" := "DB_Nachl".Q;`,
      hints: [
        'Drei klassische Stolperfallen: Operatorpräzedenz, De Morgan und der vergessene Bausteinaufruf.',
        'Regeln: `AND` bindet stärker als `OR`; ein Kreis am Ausgang ist `NOT ( ... )`; Instanzen brauchen in SCL eine eigene Aufrufzeile.',
        'Netzwerk 1 braucht eine Klammer um den ODER-Teil. Netzwerk 2 klammert den UND-Ausdruck und setzt `NOT` davor. Netzwerk 3 bekommt die Aufrufzeile mit `IN` und `PT` vor die Auswertung.',
        '```pascal\n"Motor"   := ( ... OR ... ) AND ...;\n"Warnung" := NOT ( ... AND ... );\n"DB_Nachl"(IN := ..., PT := ...);\n```',
      ],
    },
  ],
}

export default chapter
