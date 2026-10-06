import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '06',
  flashcards: [
    {
      id: 'f1',
      front: 'Die vier Grundregeln der Übersetzung KOP → SCL?',
      back: '**Reihe** → `AND`, **Parallel** → `OR`, **Öffner** → `NOT`, **Verzweigung** → Klammer.',
    },
    {
      id: 'f2',
      front: 'Wie wird eine normale Spule `( )` übersetzt?',
      back: 'Als **Zuweisung**: `"Y" := <Strompfadergebnis>;` – nicht als `IF`. Die Zuweisung schreibt jeden Zyklus, genau wie die Spule.',
    },
    {
      id: 'f3',
      front: 'Wie werden Setz- und Rücksetzspule übersetzt?',
      back: '```pascal\nIF "A" THEN\n    "Y" := TRUE;\nEND_IF;\n\nIF "B" THEN\n    "Y" := FALSE;\nEND_IF;\n```\n\nDie Reihenfolge der `IF`-Blöcke bestimmt den Vorrang – wie die Netzwerkreihenfolge.',
    },
    {
      id: 'f4',
      front: 'Wie wird ein `|P|`-Flankenkontakt in SCL übersetzt?',
      back: '```pascal\n"M_Impuls" := "S_Start" AND NOT "M_Fl";\n"M_Fl" := "S_Start";\n```\n\nZwei Zeilen: Auswertung **und** Nachführung des Flankenmerkers.',
    },
    {
      id: 'f5',
      front: 'Wie wird eine Box mit `EN` übersetzt?',
      back: 'Die `EN`-Bedingung wird zur `IF`-Bedingung:\n\n```pascal\nIF "M_Rechnen" THEN\n    "Summe" := "A" + "B";\nEND_IF;\n```',
    },
    {
      id: 'f6',
      front: 'Warum braucht `("A" OR "B") AND "C"` zwingend Klammern?',
      back: 'Weil `AND` in SCL **stärker bindet** als `OR`. Ohne Klammern ergäbe sich `"A" OR ("B" AND "C")` – eine völlig andere Logik.',
    },
    {
      id: 'f7',
      front: 'Welche SCL-Konstrukte lassen sich **nicht** nach KOP übersetzen?',
      back: '`FOR`/`WHILE`/`REPEAT`, `CASE` (nur umständlich), Array-Indizierung mit Laufvariable, `STRING`- und `STRUCT`-Verarbeitung, frühe Rückkehr.',
    },
    {
      id: 'f8',
      front: 'In welche Richtung ist die Übersetzung immer vollständig möglich?',
      back: '**KOP → SCL** geht immer. SCL → KOP scheitert an Schleifen, Strings, Strukturen und komplexen Verzweigungen.',
    },
    {
      id: 'f9',
      front: 'Wie liest man einen SCL-Ausdruck, um ihn als KOP zu zeichnen?',
      back: 'Von **außen nach innen**: Der äußerste Operator bestimmt die Grundstruktur (`AND` → Reihe, `OR` → Verzweigung), Klammern werden zu Verzweigungsblöcken, `NOT` zu Öffnern, `:=` zur Spule ganz rechts.',
    },
    {
      id: 'f10',
      front: 'Warum wird KOP in der Instandhaltung bevorzugt?',
      back: 'Wegen der **Online-Diagnose**: Der durchgeschaltete Strompfad wird farbig dargestellt. Man sieht sofort, welcher Kontakt die Freigabe blockiert. Das ist ein Wartungs-, kein Programmierargument.',
    },
    {
      id: 'f11',
      front: 'Wofür nimmt man SCL statt KOP?',
      back: 'Für Rechnen und Skalierung, Schleifen über Arrays, Schrittketten mit `CASE`, Stringverarbeitung, Kommunikation und Rezeptverwaltung.',
    },
    {
      id: 'f12',
      front: 'Faustregel für lesbare Netzwerke?',
      back: 'Maximal **sechs bis acht** Elemente pro Strompfad und höchstens **zwei** Verzweigungsebenen. Größere Logik über benannte Merker in Teilnetzwerke zerlegen.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `  Netzwerk 1:

     A                    C          Y
  +---| |---+--------------| |------( )----
  |         |
  | B       |
  +---| |---+`,
      options: [
        '`"Y" := "A" OR "B" AND "C";`',
        '`"Y" := ("A" OR "B") AND "C";`',
        '`"Y" := "A" AND "B" AND "C";`',
        '`"Y" := "A" OR ("B" AND "C");`',
      ],
      correct: 1,
      explanation: 'Die Verzweigung ist eine Klammer. Ohne sie würde `AND` stärker binden und `"A" OR ("B" AND "C")` ergeben – Option 1 und 4 sind identisch und beide falsch.',
    },
    {
      id: 'q2',
      prompt: 'Welche Übersetzung ist korrekt?',
      code: `  Netzwerk 1:

     A          Y
  ----| |------( )----`,
      options: [
        '`IF "A" THEN "Y" := TRUE; END_IF;`',
        '`"Y" := "A";`',
        '`IF "A" THEN "Y" := TRUE; ELSE "Y" := "Y"; END_IF;`',
        '`"Y" := "A" AND NOT "Y";`',
      ],
      correct: 1,
      explanation: 'Eine normale Spule ist eine Zuweisung. Die `IF`-Variante entspräche einer Setzspule `(S)` – `Y` würde nie wieder abfallen.',
    },
    {
      id: 'q3',
      prompt: 'Welches Netzwerk entspricht `"K_Motor" := ("S_Start" OR "K_Motor") AND NOT "S_Stopp";`?',
      options: [
        '```text\n     S_Start    K_Motor   S_Stopp    K_Motor\n  ----| |-------| |-------|/|-------( )----\n```',
        '```text\n     S_Start            S_Stopp        K_Motor\n  +---| |---+-------------|/|---------( )----\n  |         |\n  | K_Motor |\n  +---| |---+\n```',
        '```text\n     S_Start                          K_Motor\n  +---| |--------------+-------------( )----\n  |                    |\n  | K_Motor   S_Stopp  |\n  +---| |------|/|-----+\n```',
        '```text\n     S_Start    S_Stopp            K_Motor\n  ----| |-------|/|-----------------(S)----\n```',
      ],
      correct: 1,
      explanation: 'Die Klammer mit `OR` wird zur Verzweigung, `NOT "S_Stopp"` zum Öffner **hinter** der Zusammenführung. Option 3 wäre Ein-Vorrang: `"S_Start" OR ("K_Motor" AND NOT "S_Stopp")`.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler in dieser Übersetzung?',
      code: `  Netzwerk 1:

     S_Start   M_Fl               M_Impuls
  ----| |--------|P|---------------( )----

  SCL:
  "M_Impuls" := "S_Start" AND NOT "M_Fl";`,
      options: [
        'Die Flankenbedingung müsste `"S_Start" AND "M_Fl"` lauten',
        'Es fehlt die Nachführung `"M_Fl" := "S_Start";`',
        '`M_Impuls` müsste mit `IF` gesetzt werden',
        'Kein Fehler, die Übersetzung ist vollständig',
      ],
      correct: 1,
      explanation: 'Ohne Nachführung bleibt der Flankenmerker 0 und `M_Impuls` wäre dauerhaft 1, solange `S_Start` ansteht. In KOP erledigt der `|P|`-Kontakt beides.',
    },
    {
      id: 'q5',
      prompt: 'Welches SCL-Konstrukt lässt sich **nicht** sinnvoll als KOP darstellen?',
      options: [
        '`"Y" := "A" AND NOT "B";`',
        '`IF "A" THEN "Y" := TRUE; END_IF;`',
        '`FOR i := 0 TO 99 DO "Summe" := "Summe" + "Werte"[i]; END_FOR;`',
        '`"IDB_Zeit"(IN := "A", PT := T#5s, Q => "Y");`',
      ],
      correct: 2,
      explanation: 'Schleifen gibt es in KOP nicht. Bitlogik, bedingte Zuweisungen und Instanzaufrufe lassen sich dagegen direkt zeichnen.',
    },
    {
      id: 'q6',
      prompt: 'Wo ist der Fehler in dieser Übersetzung?',
      code: `  Netzwerk 1:

                     +-------------+
     M_Rechnen       |  ADD  Int   |
  ----| |------------| EN      ENO |----
     "A" ------------| IN1     OUT |---- "Summe"
     "B" ------------| IN2         |
                     +-------------+

  SCL:
  "Summe" := "A" + "B";`,
      options: [
        '`ADD` heißt in SCL `ADD_INT`',
        'Die `EN`-Bedingung `M_Rechnen` fehlt – die Zeile rechnet in jedem Zyklus',
        '`IN1` und `IN2` sind vertauscht',
        '`ENO` muss auf eine Spule gelegt werden',
      ],
      correct: 1,
      explanation: '`EN` wird zur `IF`-Bedingung. Ohne sie rechnet die Zuweisung immer – bei `EN` = 0 würde die Box dagegen gar nicht bearbeitet.',
    },
    {
      id: 'q7',
      prompt: 'Für welche Aufgabe ist KOP die bessere Wahl?',
      options: [
        'Mittelwert über ein Array mit 500 Messwerten bilden',
        'Verriegelungs- und Freigabelogik, die Instandhalter online diagnostizieren sollen',
        'Schrittkette mit 20 Schritten über `CASE`',
        'Telegramme aus einem String zerlegen',
      ],
      correct: 1,
      explanation: 'KOP glänzt bei Bitverknüpfungen und Online-Diagnose. Schleifen, `CASE`-Schrittketten und Stringverarbeitung gehören in SCL.',
    },
    {
      id: 'q8',
      prompt: 'Welche SCL-Zeilen entsprechen diesen beiden Netzwerken?',
      code: `  Netzwerk 1:
     B_Melder                     M_Stoerung
  ----| |------------------------(S)----

  Netzwerk 2:
     S_Quittung                   M_Stoerung
  ----| |------------------------(R)----`,
      options: [
        '`"M_Stoerung" := "B_Melder" AND NOT "S_Quittung";`',
        '`IF "B_Melder" THEN "M_Stoerung" := TRUE; END_IF;\nIF "S_Quittung" THEN "M_Stoerung" := FALSE; END_IF;`',
        '`IF "S_Quittung" THEN "M_Stoerung" := FALSE; END_IF;\nIF "B_Melder" THEN "M_Stoerung" := TRUE; END_IF;`',
        '`"M_Stoerung" := "B_Melder" OR "S_Quittung";`',
      ],
      correct: 1,
      explanation: 'Set und Reset werden je ein `IF`-Block. Die Reihenfolge muss der Netzwerkreihenfolge entsprechen – Option 3 hätte den umgekehrten Vorrang.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Netzwerk nach SCL übersetzen',
      level: 1,
      description: `Übersetze das vorgegebene Netzwerk in **eine** SCL-Zeile. Achte auf die Klammern.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Hand       Wahlschalter Hand
  E0.1   S_Auto       Wahlschalter Automatik
  E0.2   M_Freigabe   Anlagenfreigabe
  A0.0   K_Band       Schuetz Band
\`\`\``,
      given: `  Netzwerk 1: Bandansteuerung

     S_Hand             M_Freigabe     K_Band
  +---| |---+-------------| |---------( )----
  |         |
  | S_Auto  |
  +---| |---+`,
      starter: `  SCL:
  // TODO`,
      solution: `  SCL:
  "K_Band" := ("S_Hand" OR "S_Auto") AND "M_Freigabe";`,
      hints: [
        'Die Verzweigung bildet eine ODER-Gruppe, danach folgt ein weiterer Kontakt in Reihe.',
        'Verzweigung → Klammer, Reihe → `AND`, Spule → `:=`.',
        'Schreibe zuerst die geklammerte ODER-Gruppe, verknüpfe sie mit `AND` und dem letzten Kontakt und weise das Ganze der Spule zu.',
        '`"K_Band" := (??? OR ???) AND ???;`',
      ],
    },
    {
      id: 'k2',
      title: 'SCL als Netzwerk zeichnen',
      level: 2,
      description: `Zeichne das KOP-Netzwerk zu dieser SCL-Zeile.

\`\`\`pascal
"K_Pumpe" := ("S_Start" OR "K_Pumpe") AND "S_Stopp" AND NOT "M_Stoerung";
\`\`\`

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Start      Starttaster
  E0.1   S_Stopp      Stopptaster (Oeffner verdrahtet, Ruhe = 1)
  M10.0  M_Stoerung   gespeicherte Stoerung
  A0.0   K_Pumpe      Schuetz Pumpe
\`\`\``,
      starter: `  Netzwerk 1: Pumpe Selbsthaltung

  ----
  // TODO`,
      solution: `  Netzwerk 1: Pumpe Selbsthaltung

     S_Start            S_Stopp  M_Stoerung     K_Pumpe
  +---| |---+-------------| |-------|/|--------( )----
  |         |
  | K_Pumpe |
  +---| |---+`,
      hints: [
        'Lies den Ausdruck von außen nach innen: Der äußerste Operator ist `AND`.',
        'Die Klammer mit `OR` wird zur Verzweigung, `NOT` zum Öffner, `:=` zur Spule ganz rechts.',
        'Zeichne links die Verzweigung mit `S_Start` oben und dem Haltekontakt `K_Pumpe` unten. Nach der Zusammenführung folgen `S_Stopp` als Schließer und `M_Stoerung` als Öffner, dann die Spule.',
        '```text\n     S_Start            S_Stopp  M_Stoerung     K_Pumpe\n  +---| |---+-------------| |-------|?|--------( )----\n  |         |\n  | ???????  |\n  +---| |---+\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Fehlerhafte Übersetzung korrigieren',
      level: 3,
      description: `Ein Kollege hat drei Netzwerke nach SCL übersetzt. Alle drei Zeilen sind falsch.

Finde jeden Fehler, schreibe die korrigierte SCL und kommentiere jeweils kurz, was falsch war.

**Zuordnungsliste**

\`\`\`text
  E0.0   A, B, C      Bedingungen
  M20.0  M_Fl         Flankenmerker
  M10.0  Y1, Y2, Y3   Ergebnisse
\`\`\``,
      given: `  Netzwerk 1:
     A                    C          Y1
  +---| |---+--------------| |------( )----
  |         |
  | B       |
  +---| |---+

  FALSCHE Uebersetzung:  "Y1" := "A" OR "B" AND "C";

  Netzwerk 2:
     A          Y2
  ----| |------( )----

  FALSCHE Uebersetzung:  IF "A" THEN "Y2" := TRUE; END_IF;

  Netzwerk 3:
     A         M_Fl              Y3
  ----| |--------|P|------------( )----

  FALSCHE Uebersetzung:  "Y3" := "A" AND NOT "M_Fl";`,
      starter: `  SCL korrigiert:
  // Netzwerk 1
  // TODO

  // Netzwerk 2
  // TODO

  // Netzwerk 3
  // TODO`,
      solution: `  SCL korrigiert:
  // Netzwerk 1
  // Falsch war: fehlende Klammer. AND bindet staerker als OR, deshalb
  // ergab die alte Zeile "A" OR ("B" AND "C").
  "Y1" := ("A" OR "B") AND "C";

  // Netzwerk 2
  // Falsch war: eine normale Spule wurde als Setzspule uebersetzt.
  // Mit IF faellt Y2 nie wieder ab.
  "Y2" := "A";

  // Netzwerk 3
  // Falsch war: die Nachfuehrung des Flankenmerkers fehlte.
  // Ohne sie bleibt M_Fl auf 0 und Y3 ist dauerhaft 1.
  "Y3" := "A" AND NOT "M_Fl";
  "M_Fl" := "A";`,
      hints: [
        'Drei verschiedene Fehlertypen: Operatorrangfolge, Spulentyp und Vollständigkeit.',
        'Prüfe bei Netzwerk 1 die Bindungsstärke von `AND` und `OR`, bei Netzwerk 2 den Unterschied zwischen `( )` und `(S)`, bei Netzwerk 3 die Anzahl der nötigen Zeilen.',
        'Netzwerk 1 braucht eine Klammer um die ODER-Gruppe. Netzwerk 2 ist eine einfache Zuweisung ohne `IF`. Netzwerk 3 braucht eine zweite Zeile, die den Flankenmerker auf das aktuelle Signal setzt.',
        '```pascal\n"Y1" := (??? OR ???) AND "C";\n"Y2" := "A";\n"Y3" := "A" AND NOT "M_Fl";\n"M_Fl" := ???;\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Zweihandbedienung in beide Richtungen',
      level: 4,
      description: `Eine Presse darf nur fahren, wenn **beide** Hände am Taster sind und die Anlage freigegeben ist. Zusätzlich darf die Presse nicht fahren, wenn das Lichtgitter unterbrochen ist.

**Teil A:** Zeichne die drei Netzwerke als KOP.

**Teil B:** Schreibe die vollständige SCL-Entsprechung.

**Teil C:** Beantworte in einem Kommentar, warum der Impuls-Timer in SCL leichter zu lesen ist, das Verriegelungsnetzwerk aber in KOP.

\`\`\`pascal
// Netzwerk 1: Sicherheitskette
"M_Sicher" := "S_NotHalt" AND "B_Lichtgitter" AND NOT "M_Stoerung";

// Netzwerk 2: Zweihandueberwachung - beide Taster innerhalb von 500 ms
"IDB_Zweihand"(IN := "S_HandL" XOR "S_HandR", PT := T#500ms, Q => "M_Zeitfehler");

// Netzwerk 3: Pressenfreigabe
"K_Presse" := "M_Sicher" AND "S_HandL" AND "S_HandR" AND NOT "M_Zeitfehler";
\`\`\`

**Zuordnungsliste**

\`\`\`text
  E0.0   S_NotHalt       Not-Halt (Ruhe = 1)
  E0.1   B_Lichtgitter   Lichtgitter frei (1 = frei)
  E0.2   S_HandL         Taster linke Hand
  E0.3   S_HandR         Taster rechte Hand
  M10.0  M_Stoerung      gespeicherte Stoerung
  M10.1  M_Sicher        Sicherheitskette ok
  M10.2  M_Zeitfehler    Zweihandzeit ueberschritten
  A0.0   K_Presse        Pressenventil
  DB1    IDB_Zweihand    Instanzdaten TON
\`\`\`

**Hinweis:** \`XOR\` lässt sich in KOP als zwei parallele Zweige zeichnen: (L und nicht R) oder (nicht L und R).`,
      starter: `  Teil A - KOP:

  Netzwerk 1: Sicherheitskette
  ----
  // TODO

  Netzwerk 2: Zweihandueberwachung
  ----
  // TODO

  Netzwerk 3: Pressenfreigabe
  ----
  // TODO

  Teil B - SCL:
  // TODO

  Teil C - Begruendung:
  // TODO`,
      solution: `  Teil A - KOP:

  Netzwerk 1: Sicherheitskette

     S_NotHalt  B_Lichtgitter  M_Stoerung      M_Sicher
  ----| |---------| |------------|/|---------( )----

  Netzwerk 2: Zweihandueberwachung (XOR als zwei Parallelzweige)

     S_HandL   S_HandR      +-------------------+
  +---| |-------|/|-----+   |  "IDB_Zweihand"   |
  |                     |   |       TON         |
  |                     +---| IN              Q |----( )----
  |  S_HandL   S_HandR  |   |                   |   M_Zeitfehler
  +---|/|-------| |-----+   |                   |
                 T#500ms ---| PT             ET |
                            +-------------------+

  Netzwerk 3: Pressenfreigabe

     M_Sicher   S_HandL   S_HandR   M_Zeitfehler    K_Presse
  ----| |--------| |-------| |---------|/|---------( )----

  Teil B - SCL:
  "M_Sicher" := "S_NotHalt" AND "B_Lichtgitter" AND NOT "M_Stoerung";

  "IDB_Zweihand"(IN := "S_HandL" XOR "S_HandR",
                 PT := T#500ms,
                 Q => "M_Zeitfehler");

  "K_Presse" := "M_Sicher" AND "S_HandL" AND "S_HandR"
                AND NOT "M_Zeitfehler";

  Teil C - Begruendung:
  // Der XOR-Ausdruck ist in SCL eine einzige, direkt lesbare Zeile.
  // In KOP muss er als zwei parallele UND-Zweige gezeichnet werden und
  // belegt eine halbe Bildschirmseite - die Absicht "genau einer von
  // beiden" ist aus der Zeichnung nicht mehr unmittelbar ablesbar.
  //
  // Die Verriegelungsnetzwerke 1 und 3 sind dagegen reine UND-Ketten.
  // In KOP sieht die Instandhaltung online sofort, welcher Kontakt die
  // Freigabe blockiert - bei einer SCL-Zeile muesste man den Wert jeder
  // einzelnen Variablen beobachten. Deshalb: Verriegelung in KOP,
  // Rechen- und Sonderoperationen in SCL.`,
      hints: [
        'Drei Zuweisungen → drei Netzwerke. Nur Netzwerk 2 enthält eine Box.',
        '`XOR` bedeutet "genau einer von beiden". In KOP sind das zwei parallele Zweige: links Schließer plus Öffner, rechts Öffner plus Schließer.',
        'Netzwerk 1 und 3 sind reine Kontaktketten mit einem Öffner am Ende. Netzwerk 2 baut links die XOR-Verzweigung auf, führt sie auf `IN` der TON-Box und legt `Q` auf die Spule `M_Zeitfehler`.',
        '```text\n  Netzwerk 2:\n     S_HandL   S_HandR      +-------------------+\n  +---| |-------|?|-----+   |  "IDB_Zweihand"   |\n  |                     |   |       TON         |\n  |                     +---| IN              Q |----( )----\n  |  S_HandL   S_HandR  |   |                   |   M_Zeitfehler\n  +---|?|-------| |-----+   |  PT := ??????     |\n                            +-------------------+\n```',
      ],
    },
  ],
}

export default chapter
