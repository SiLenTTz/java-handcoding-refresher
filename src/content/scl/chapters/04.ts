import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie lautet die FOR-Syntax mit Schrittweite?',
      back: '```pascal\nFOR tiIndex := 0 TO 100 BY 10 DO\n    ...\nEND_FOR;\n```\nRückwärts mit `BY -1`. Die Laufvariable ist `Int`/`DInt` und gehört in `VAR_TEMP`.',
    },
    {
      id: 'f2',
      front: 'Warum ist `WHILE NOT i_xSensor DO ; END_WHILE;` in der SPS fatal?',
      back: 'Das Prozessabbild wird nur am **Zyklusanfang** eingelesen – der Eingang ändert sich innerhalb der Schleife nie. Die CPU läuft in die Zykluszeitüberwachung und geht in STOP. Warten gehört in eine Schrittkette mit Timer.',
    },
    {
      id: 'f3',
      front: 'Unterschied `WHILE` und `REPEAT`?',
      back: '`WHILE` prüft **vor** dem Durchlauf (kann 0-mal laufen), `REPEAT … UNTIL` prüft **danach** (läuft mindestens einmal). Hinter der `UNTIL`-Bedingung steht kein Semikolon.',
    },
    {
      id: 'f4',
      front: 'Was machen `EXIT`, `CONTINUE` und `RETURN`?',
      back: '`EXIT` verlässt die **innerste** Schleife, `CONTINUE` überspringt den Rest des aktuellen Durchlaufs, `RETURN` verlässt den **gesamten Baustein**.',
    },
    {
      id: 'f5',
      front: 'Wie verlässt man zwei verschachtelte Schleifen auf einmal?',
      back: 'Gar nicht direkt – `EXIT` wirkt nur innen. Merker setzen, innen `EXIT`, und in der äußeren Schleife den Merker prüfen und ebenfalls `EXIT` auslösen (oder `RETURN`, wenn der Baustein fertig ist).',
    },
    {
      id: 'f6',
      front: 'Wie macht man eine Schleife unabhängig von fest verdrahteten Array-Grenzen?',
      back: '```pascal\nFOR tiIndex := LOWER_BOUND(ARR := aWerte, DIM := 1)\n            TO UPPER_BOUND(ARR := aWerte, DIM := 1) DO\n```\nAlternativ Grenzen als `VAR CONSTANT` definieren und überall verwenden.',
    },
    {
      id: 'f7',
      front: 'Wann werden Start- und Endwert einer FOR-Schleife ausgewertet?',
      back: 'Genau **einmal beim Eintritt**. Eine Änderung der Grenzvariablen im Rumpf verlängert oder verkürzt die Schleife nicht – anders als bei `WHILE`.',
    },
    {
      id: 'f8',
      front: 'Warum muss eine Temp-Summe vor der Schleife auf 0 gesetzt werden?',
      back: '`VAR_TEMP` liegt im L-Stack und enthält beim Aufruf Restwerte. Ohne `trSumme := 0.0;` summierst du auf zufälligen Müll auf.',
    },
    {
      id: 'f9',
      front: 'Was passiert bei einem Array-Zugriff außerhalb der Grenzen?',
      back: 'Bei optimierten Bausteinen meldet die CPU einen Zugriffsfehler (OB121); ohne diesen OB geht sie in STOP. Deshalb: Index immer gegen die Array-Grenzen prüfen bzw. `LIMIT` verwenden.',
    },
    {
      id: 'f10',
      front: 'Wie verteilt man eine große Verarbeitung auf mehrere Zyklen?',
      back: 'Startindex in einer **statischen** Variablen merken, pro Zyklus nur ein Paket (z. B. 20 Elemente) bearbeiten und den Startindex weiterschalten. So bleibt die Zykluszeit konstant.',
    },
    {
      id: 'f11',
      front: 'Welche Schleifengröße ist pro Zyklus unkritisch?',
      back: 'Eine pauschale Zahl gibt es nicht, aber: wenige hundert einfache Durchläufe sind in der Praxis unproblematisch. Verschachtelte Schleifen mit Tausenden Durchläufen gehören aufgeteilt oder in einen Weckalarm-OB.',
    },
    {
      id: 'f12',
      front: 'Warum gibt es in SCL keine Schleife über eine dynamische Länge?',
      back: 'Es gibt keine dynamische Speicherverwaltung – Array-Grenzen stehen zur Übersetzungszeit fest. Dadurch ist die maximale Laufzeit jeder Schleife im Voraus berechenbar, was für Echtzeitfähigkeit entscheidend ist.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wie oft wird der Rumpf durchlaufen?',
      code: `FOR tiIndex := 0 TO 100 BY 25 DO
    tiZaehler := tiZaehler + 1;
END_FOR;`,
      options: ['`4`', '`5`', '`25`', '`101`'],
      correct: 1,
      explanation: 'Die Werte sind 0, 25, 50, 75, 100 – also fünf Durchläufe. Die Obergrenze ist **einschließlich**.',
    },
    {
      id: 'q2',
      prompt: 'Warum geht die CPU bei diesem Code in STOP?',
      code: `WHILE NOT "Sensor_Endlage" DO
    ;
END_WHILE;
q_xGreiferAuf := TRUE;`,
      options: [
        '`WHILE` ist in SCL nicht erlaubt',
        'Das Prozessabbild wird nicht aktualisiert – die Bedingung kann sich nie ändern, die Zykluszeitüberwachung läuft ab',
        'Ein leerer Rumpf ist ein Übersetzungsfehler',
        '`q_xGreiferAuf` wird nie beschrieben',
      ],
      correct: 1,
      explanation:
        'Eingänge werden nur am Zyklusanfang ins PAE gelesen. Innerhalb des Zyklus bleibt der Wert konstant → Endlosschleife → Watchdog. Warten gehört in eine Schrittkette mit Timer.',
    },
    {
      id: 'q3',
      prompt: 'Welchen Wert hat `tiAnzahl` nach der Schleife?',
      code: `tiAnzahl := 0;
FOR tiIndex := 1 TO 5 DO
    IF tiIndex = 3 THEN
        CONTINUE;
    END_IF;
    IF tiIndex = 5 THEN
        EXIT;
    END_IF;
    tiAnzahl := tiAnzahl + 1;
END_FOR;`,
      options: ['`5`', '`4`', '`3`', '`2`'],
      correct: 2,
      explanation:
        'Index 1 und 2 zählen (2), Index 3 wird durch `CONTINUE` übersprungen, Index 4 zählt (3), bei Index 5 bricht `EXIT` vor dem Hochzählen ab → 3.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler?',
      code: `VAR
    aWerte : ARRAY[1..10] OF Int;
END_VAR

BEGIN
    FOR tiIndex := 0 TO 10 DO
        aWerte[tiIndex] := 0;
    END_FOR;
END_FUNCTION_BLOCK`,
      options: [
        'Der Index 0 liegt außerhalb der Array-Grenzen – Zugriffsfehler',
        'Arrays dürfen nicht mit 1 beginnen',
        '`FOR` braucht zwingend ein `BY`',
        'Die Schleife läuft rückwärts',
      ],
      correct: 0,
      explanation:
        'Das Array ist als `ARRAY[1..10]` deklariert. Der Zugriff auf Index 0 löst bei optimierten Bausteinen einen Zugriffsfehler aus (OB121, sonst STOP). Sauber: Grenzen über `LOWER_BOUND`/`UPPER_BOUND` holen.',
    },
    {
      id: 'q5',
      prompt: 'Warum lässt sich das nicht übersetzen?',
      code: `REPEAT
    tiIndex := tiIndex + 1;
UNTIL tiIndex > 10;
END_REPEAT;`,
      options: [
        '`REPEAT` gibt es in SCL nicht',
        'Hinter der `UNTIL`-Bedingung steht kein Semikolon – das kommt erst nach `END_REPEAT`',
        '`tiIndex` muss `DInt` sein',
        'Die Bedingung muss vor dem Rumpf stehen',
      ],
      correct: 1,
      explanation:
        'Die Syntax lautet `REPEAT … UNTIL <Bedingung> END_REPEAT;`. Das Semikolon nach der Bedingung ist einer der häufigsten Tippfehler in SCL.',
    },
    {
      id: 'q6',
      prompt: 'Welchen Wert hat `trMittelwert` nach dem Zyklus?',
      code: `VAR_TEMP
    tiIndex : Int;
    trSumme : Real;
END_VAR

BEGIN
    FOR tiIndex := 1 TO 10 DO
        trSumme := trSumme + 2.0;
    END_FOR;
    trMittelwert := trSumme / 10.0;
END_FUNCTION_BLOCK`,
      options: [
        '`2.0`',
        'Unbestimmt – `trSumme` ist `VAR_TEMP` und wurde nicht initialisiert',
        '`20.0`',
        '`0.0`',
      ],
      correct: 1,
      explanation:
        'Temp-Variablen liegen im L-Stack und starten mit Restwerten des vorherigen Bausteins. Vor jeder Summation gehört `trSumme := 0.0;`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist sauber, um ein Array nach einem Wert zu durchsuchen?',
      options: [
        '`FOR tiI := 1 TO 100 DO IF a[tiI] = iSuche THEN tiTreffer := tiI; END_IF; END_FOR;`',
        '`FOR tiI := 1 TO 100 DO IF a[tiI] = iSuche THEN tiTreffer := tiI; EXIT; END_IF; END_FOR;`',
        '`WHILE a[tiI] <> iSuche DO tiI := tiI + 1; END_WHILE;`',
        '`REPEAT tiI := tiI + 1; UNTIL a[tiI] = iSuche END_REPEAT;`',
      ],
      correct: 1,
      explanation:
        'Variante 2 bricht beim Treffer ab und hat eine feste Obergrenze. Variante 1 läuft unnötig weiter und liefert den **letzten** Treffer. Variante 3 und 4 haben keine Grenzprüfung und laufen über das Array hinaus.',
    },
    {
      id: 'q8',
      prompt: 'Welchen Wert hat `tiIndex` nach dem ersten Durchlauf der äußeren Schleife?',
      code: `FOR tiZeile := 1 TO 3 DO
    FOR tiIndex := 1 TO 3 DO
        IF aMatrix[tiZeile, tiIndex] = 0 THEN
            EXIT;
        END_IF;
    END_FOR;
END_FOR;`,
      options: [
        '`EXIT` verlässt beide Schleifen, `tiZeile` bleibt 1',
        '`EXIT` verlässt nur die innere Schleife – die äußere läuft weiter',
        'Übersetzungsfehler: `EXIT` ist in verschachtelten Schleifen verboten',
        'Beide Schleifen laufen ohne Abbruch durch',
      ],
      correct: 1,
      explanation:
        '`EXIT` wirkt immer nur auf die innerste Schleife. Für den Abbruch beider Ebenen braucht man einen Merker, der in der äußeren Schleife ebenfalls geprüft wird – oder `RETURN`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Mittelwert über ein Messwert-Array',
      level: 1,
      description: `Schreibe eine **FC** \`FC_Mittelwert\` mit Rückgabewert \`Real\`.

Schnittstelle:

- \`io_aMesswerte : ARRAY[1..20] OF Real\` als \`VAR_IN_OUT\` (Referenz statt Kopie)
- Rückgabe: arithmetischer Mittelwert

Anforderungen:

- \`FOR\`-Schleife über alle Elemente
- Summe vor der Schleife initialisieren
- Array-Grenzen nicht hart im Code, sondern über \`VAR CONSTANT\``,
      starter: `FUNCTION "FC_Mittelwert" : Real
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aMesswerte : ARRAY[1..20] OF Real;
END_VAR

VAR_TEMP
    // TODO
END_VAR

BEGIN
    // TODO
    #FC_Mittelwert := 0.0;
END_FUNCTION`,
      solution: `FUNCTION "FC_Mittelwert" : Real
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aMesswerte : ARRAY[1..20] OF Real;   // als Referenz, keine Kopie
END_VAR

VAR CONSTANT
    IDX_MIN : Int := 1;
    IDX_MAX : Int := 20;
END_VAR

VAR_TEMP
    tiIndex : Int;
    trSumme : Real;
END_VAR

BEGIN
    // TEMP-Variablen enthalten Restwerte -> immer initialisieren.
    trSumme := 0.0;

    FOR tiIndex := IDX_MIN TO IDX_MAX DO
        trSumme := trSumme + io_aMesswerte[tiIndex];
    END_FOR;

    #FC_Mittelwert := trSumme / INT_TO_REAL(IDX_MAX - IDX_MIN + 1);
END_FUNCTION`,
      hints: [
        'Zwei Schritte: aufsummieren, dann durch die Anzahl teilen. Überlege, womit die Summe startet.',
        '`FOR tiIndex := IDX_MIN TO IDX_MAX DO` und eine `VAR_TEMP`-Summe vom Typ `Real`.',
        'trSumme := 0.0 → FOR über alle Indizes, Summe aufaddieren → Rückgabewert = Summe / Anzahl.',
        '```pascal\ntrSumme := 0.0;\nFOR tiIndex := IDX_MIN TO IDX_MAX DO\n    trSumme := trSumme + io_aMesswerte[tiIndex];\nEND_FOR;\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Maximum mit Index suchen',
      level: 2,
      description: `Schreibe einen **FB** \`FB_MaxSuche\`.

Schnittstelle:

- \`io_aWerte : ARRAY[1..50] OF Int\` (\`VAR_IN_OUT\`)
- \`i_iAnzahlGueltig : Int\` – nur die ersten n Elemente sind belegt (1 … 50)
- \`q_iMaxWert : Int\`
- \`q_iMaxIndex : Int\`
- \`q_xGueltig : Bool\` – FALSE, wenn \`i_iAnzahlGueltig\` außerhalb 1 … 50 liegt

Anforderungen:

- Grenzen prüfen, **bevor** auf das Array zugegriffen wird
- \`FOR\`-Schleife ab Index 2, mit dem ersten Element als Startwert
- bei ungültiger Anzahl: Ausgänge auf 0 und \`q_xGueltig := FALSE\`, Schleife gar nicht erst betreten`,
      starter: `FUNCTION_BLOCK "FB_MaxSuche"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aWerte : ARRAY[1..50] OF Int;
END_VAR

VAR_INPUT
    i_iAnzahlGueltig : Int;
END_VAR

VAR_OUTPUT
    q_iMaxWert  : Int;
    q_iMaxIndex : Int;
    q_xGueltig  : Bool;
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_MaxSuche"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aWerte : ARRAY[1..50] OF Int;
END_VAR

VAR_INPUT
    i_iAnzahlGueltig : Int;                 // 1 .. 50
END_VAR

VAR_OUTPUT
    q_iMaxWert  : Int;
    q_iMaxIndex : Int;
    q_xGueltig  : Bool;
END_VAR

VAR CONSTANT
    IDX_MIN : Int := 1;
    IDX_MAX : Int := 50;
END_VAR

VAR_TEMP
    tiIndex : Int;
END_VAR

BEGIN
    // Grundstellung
    q_iMaxWert  := 0;
    q_iMaxIndex := 0;
    q_xGueltig  := FALSE;

    // Grenzen PRUEFEN, bevor irgendein Array-Zugriff passiert.
    IF (i_iAnzahlGueltig >= IDX_MIN) AND (i_iAnzahlGueltig <= IDX_MAX) THEN

        // Erstes Element als Startwert - so ist kein kuenstliches Minimum noetig.
        q_iMaxWert  := io_aWerte[IDX_MIN];
        q_iMaxIndex := IDX_MIN;

        FOR tiIndex := IDX_MIN + 1 TO i_iAnzahlGueltig DO
            IF io_aWerte[tiIndex] > q_iMaxWert THEN
                q_iMaxWert  := io_aWerte[tiIndex];
                q_iMaxIndex := tiIndex;
            END_IF;
        END_FOR;

        q_xGueltig := TRUE;
    END_IF;
END_FUNCTION_BLOCK`,
      hints: [
        'Warum ist „erstes Element als Startwert“ besser als ein künstlicher Startwert wie −32768?',
        'Du brauchst eine Gültigkeitsprüfung mit `IF`, danach eine `FOR`-Schleife ab Index 2 und einen Vergleich mit `>`.',
        'Grundstellung → IF Anzahl im gültigen Bereich → Max = erstes Element, Index = 1 → FOR ab 2 bis Anzahl → bei größerem Wert Max und Index merken → q_xGueltig := TRUE.',
        '```pascal\nq_iMaxWert  := io_aWerte[IDX_MIN];\nq_iMaxIndex := IDX_MIN;\nFOR tiIndex := IDX_MIN + 1 TO i_iAnzahlGueltig DO\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Schieberegister für die Qualitätsverfolgung',
      level: 3,
      description: `Am Förderband wird jedes Teil geprüft. Das Ergebnis soll dem Teil über 10 Bandpositionen folgen.

Schreibe einen **FB** \`FB_Schieberegister\`.

Schnittstelle:

- \`i_xTakt : Bool\` – ein Takt = eine Bandposition weiter (bereits flankenausgewertet)
- \`i_xNeuerWert : Bool\` – Prüfergebnis des neuen Teils (TRUE = i.O.)
- \`q_xAusgeschoben : Bool\` – Ergebnis des Teils, das die letzte Position verlässt
- \`q_iAnzahlNiO : Int\` – wie viele n.i.O.-Teile stecken aktuell im Register

Anforderungen:

- statisches \`ARRAY[1..10] OF Bool\`
- beim Takt: von **hinten nach vorne** schieben, damit nichts überschrieben wird
- Position 1 bekommt den neuen Wert
- \`q_iAnzahlNiO\` wird **jeden** Zyklus neu gezählt, nicht nur beim Takt`,
      starter: `FUNCTION_BLOCK "FB_Schieberegister"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xTakt      : Bool;
    i_xNeuerWert : Bool;
END_VAR

VAR_OUTPUT
    q_xAusgeschoben : Bool;
    q_iAnzahlNiO    : Int;
END_VAR

VAR
    saPositionen : ARRAY[1..10] OF Bool;
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Schieberegister"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xTakt      : Bool;                    // flankenausgewertet, 1 Zyklus lang TRUE
    i_xNeuerWert : Bool;                    // TRUE = Teil i.O.
END_VAR

VAR_OUTPUT
    q_xAusgeschoben : Bool;                 // Ergebnis des herausfallenden Teils
    q_iAnzahlNiO    : Int;                  // n.i.O.-Teile im Register
END_VAR

VAR
    saPositionen : ARRAY[1..10] OF Bool;    // Position 1 = Einlauf, 10 = Auslauf
END_VAR

VAR CONSTANT
    POS_MIN : Int := 1;
    POS_MAX : Int := 10;
END_VAR

VAR_TEMP
    tiIndex  : Int;
    tiAnzahl : Int;
END_VAR

BEGIN
    IF i_xTakt THEN
        // Letzte Position faellt heraus - ZUERST sichern.
        q_xAusgeschoben := saPositionen[POS_MAX];

        // Von HINTEN nach vorne schieben, sonst ueberschreibt man die Quelle.
        FOR tiIndex := POS_MAX TO POS_MIN + 1 BY -1 DO
            saPositionen[tiIndex] := saPositionen[tiIndex - 1];
        END_FOR;

        // Einlaufposition bekommt das neue Pruefergebnis.
        saPositionen[POS_MIN] := i_xNeuerWert;
    END_IF;

    // Zaehlung laeuft in JEDEM Zyklus - sonst zeigt das HMI einen alten Stand.
    tiAnzahl := 0;
    FOR tiIndex := POS_MIN TO POS_MAX DO
        IF NOT saPositionen[tiIndex] THEN
            tiAnzahl := tiAnzahl + 1;
        END_IF;
    END_FOR;

    q_iAnzahlNiO := tiAnzahl;
END_FUNCTION_BLOCK`,
      hints: [
        'Spiele das Schieben auf Papier durch: Was passiert, wenn du von Position 1 nach 10 kopierst statt umgekehrt?',
        'Du brauchst eine rückwärts laufende Schleife (`BY -1`), ein statisches `ARRAY[1..10] OF Bool` und eine zweite Zählschleife.',
        'IF Takt → letzten Wert sichern → FOR 10 DOWNTO 2: Pos[i] := Pos[i-1] → Pos[1] := neuer Wert. Danach immer: Zähler auf 0, FOR 1 bis 10, n.i.O. zählen.',
        '```pascal\nFOR tiIndex := POS_MAX TO POS_MIN + 1 BY -1 DO\n    saPositionen[tiIndex] := saPositionen[tiIndex - 1];\nEND_FOR;\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Rezeptsuche mit Zykluszeit-Schutz',
      level: 4,
      description: `Ein Rezeptspeicher enthält 1000 Datensätze. Eine komplette Suche pro Zyklus würde die Zykluszeit sprengen.

Schreibe einen **FB** \`FB_Rezeptsuche\`, der die Suche **paketweise über mehrere Zyklen** verteilt.

Schnittstelle:

- \`io_aRezepte : ARRAY[1..1000] OF DInt\` (\`VAR_IN_OUT\`) – enthält Auftragsnummern
- \`i_xStarten : Bool\` – startet eine neue Suche (Suchlauf beginnt wieder bei 1)
- \`i_diSuchNummer : DInt\`
- \`q_xFertig : Bool\` – TRUE, wenn der Suchlauf beendet ist
- \`q_xGefunden : Bool\`
- \`q_iTrefferIndex : Int\` – 0, wenn nicht gefunden
- \`q_iFortschritt : Int\` – zuletzt geprüfter Index, für das HMI

Anforderungen:

- maximal 50 Datensätze pro Zyklus (\`VAR CONSTANT PAKETGROESSE\`)
- statischer Suchzeiger, der den Fortschritt über Zyklen hinweg merkt
- Treffer beendet die Suche sofort (\`EXIT\`)
- die Suche darf nicht von selbst neu starten, wenn sie fertig ist
- keine Array-Zugriffe außerhalb von 1 … 1000`,
      starter: `FUNCTION_BLOCK "FB_Rezeptsuche"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aRezepte : ARRAY[1..1000] OF DInt;
END_VAR

VAR_INPUT
    i_xStarten    : Bool;
    i_diSuchNummer: DInt;
END_VAR

VAR_OUTPUT
    q_xFertig       : Bool;
    q_xGefunden     : Bool;
    q_iTrefferIndex : Int;
    q_iFortschritt  : Int;
END_VAR

VAR
    // TODO: Suchzeiger und Laufzustand
END_VAR

VAR CONSTANT
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Rezeptsuche"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aRezepte : ARRAY[1..1000] OF DInt;   // Auftragsnummern
END_VAR

VAR_INPUT
    i_xStarten     : Bool;                  // neue Suche anstossen
    i_diSuchNummer : DInt;
END_VAR

VAR_OUTPUT
    q_xFertig       : Bool;
    q_xGefunden     : Bool;
    q_iTrefferIndex : Int;                  // 0 = nicht gefunden
    q_iFortschritt  : Int;
END_VAR

VAR
    siSuchzeiger : Int  := 1;               // naechster zu pruefender Index
    sxLaeuft     : Bool := FALSE;           // Suchlauf aktiv?
END_VAR

VAR CONSTANT
    IDX_MIN      : Int := 1;
    IDX_MAX      : Int := 1000;
    PAKETGROESSE : Int := 50;               // max. Pruefungen je Zyklus
END_VAR

VAR_TEMP
    tiIndex : Int;
    tiEnde  : Int;                          // letzter Index dieses Pakets
END_VAR

BEGIN
    // Neue Suche: Zustand komplett zuruecksetzen.
    IF i_xStarten THEN
        siSuchzeiger    := IDX_MIN;
        sxLaeuft        := TRUE;
        q_xFertig       := FALSE;
        q_xGefunden     := FALSE;
        q_iTrefferIndex := 0;
    END_IF;

    IF sxLaeuft THEN
        // Paketende begrenzen - so bleibt der Zugriff garantiert im Array.
        tiEnde := MIN(IN1 := siSuchzeiger + PAKETGROESSE - 1, IN2 := IDX_MAX);

        FOR tiIndex := siSuchzeiger TO tiEnde DO
            IF io_aRezepte[tiIndex] = i_diSuchNummer THEN
                q_xGefunden     := TRUE;
                q_iTrefferIndex := tiIndex;
                EXIT;                       // Treffer -> Rest des Pakets sparen
            END_IF;
        END_FOR;

        q_iFortschritt := tiEnde;

        IF q_xGefunden OR (tiEnde >= IDX_MAX) THEN
            // Fertig: Lauf anhalten, damit die Suche nicht von selbst neu startet.
            sxLaeuft  := FALSE;
            q_xFertig := TRUE;
        ELSE
            siSuchzeiger := tiEnde + 1;     // naechstes Paket im naechsten Zyklus
        END_IF;
    END_IF;
END_FUNCTION_BLOCK`,
      hints: [
        'Der Suchzeiger ist das Gedächtnis zwischen den Zyklen – überlege, was beim Start zurückgesetzt und was weitergeschaltet werden muss.',
        'Du brauchst statische Variablen (`VAR`), `MIN(IN1 := .., IN2 := ..)` für das Paketende und `EXIT` beim Treffer.',
        'IF Starten → Zeiger 1, läuft TRUE. IF läuft → Ende = MIN(Zeiger + Paket − 1, 1000) → FOR Zeiger..Ende mit EXIT bei Treffer → wenn gefunden oder Ende erreicht: anhalten und fertig melden, sonst Zeiger := Ende + 1.',
        '```pascal\ntiEnde := MIN(IN1 := siSuchzeiger + PAKETGROESSE - 1, IN2 := IDX_MAX);\nFOR tiIndex := siSuchzeiger TO tiEnde DO\n```',
      ],
    },
  ],
}

export default chapter
