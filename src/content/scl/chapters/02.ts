import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '02',
  flashcards: [
    {
      id: 'f1',
      front: 'Unterschied zwischen `:=` und `=` in SCL?',
      back: '`:=` ist die **Zuweisung** (`q_xMotor := TRUE;`), `=` ist der **Vergleich** (`IF iZustand = 3 THEN`). Ungleich heißt `<>`, nicht `!=`.',
    },
    {
      id: 'f2',
      front: 'Was ergibt `7 / 2`, wenn beide Operanden `Int` sind?',
      back: '`3`. Bei Ganzzahl-Operanden wird abgeschnitten, nicht gerundet. Für 3.5 müssen beide Operanden `Real` sein: `INT_TO_REAL(7) / 2.0`.',
    },
    {
      id: 'f3',
      front: 'Wie rechnet man einen Prozentwert aus zwei `Int`-Variablen korrekt?',
      back: '```pascal\nrProzent := INT_TO_REAL(iIst) / INT_TO_REAL(iSoll) * 100.0;\n```\nNicht `iIst / iSoll * 100.0` – die Int-Division liefert vorher schon 0.',
    },
    {
      id: 'f4',
      front: 'Operatorrangfolge von `NOT`, `AND`, `XOR`, `OR`?',
      back: '`NOT` > `AND` > `XOR` > `OR`. Also ist `xA OR xB AND xC` dasselbe wie `xA OR (xB AND xC)` – wie Punkt vor Strich. Im Zweifel klammern.',
    },
    {
      id: 'f5',
      front: 'Was macht `REAL_TO_INT(2.5)` – und was `TRUNC(2.5)`?',
      back: '`REAL_TO_INT(2.5)` = **2** (IEC rundet zur nächsten geraden Zahl), `REAL_TO_INT(3.5)` = 4. `TRUNC(2.5)` = 2 (schneidet Richtung 0 ab). Kaufmännisch runden: `TRUNC(rWert + 0.5)`.',
    },
    {
      id: 'f6',
      front: 'Wann konvertiert SCL implizit?',
      back: 'Nur verlustfrei „nach oben“: `Int → DInt → Real`. Rückwärts (`Real → Int`, `DInt → Int`) muss **explizit** konvertiert werden, weil Information verloren gehen kann.',
    },
    {
      id: 'f7',
      front: 'Wie greift man auf einzelne Bits eines `Word` zu?',
      back: '```pascal\nxBit0  := wStatus.%X0;\nxBit15 := wStatus.%X15;\nbyLow  := dwWert.%B0;\nwLow   := dwWert.%W0;\n```',
    },
    {
      id: 'f8',
      front: 'Warum darf man `Real`-Werte nicht mit `=` vergleichen?',
      back: 'Gleitkommawerte sind nur näherungsweise gespeichert; `rIst = 10.0` trifft fast nie exakt zu. Stattdessen Toleranzband: `IF ABS(rIst - 10.0) < 0.01 THEN`.',
    },
    {
      id: 'f9',
      front: 'Was passiert bei Division durch 0?',
      back: 'Bei `Int`/`DInt`: Programmierfehler – ohne OB121 geht die CPU in STOP. Bei `Real`: Ergebnis ist `+inf`/`-inf` bzw. `NaN`, das Programm läuft weiter und rechnet mit Unsinn. Immer vorher auf 0 prüfen.',
    },
    {
      id: 'f10',
      front: 'Wofür ist `LIMIT` da?',
      back: '```pascal\nrSollBegrenzt := LIMIT(MN := 0.0, IN := rSoll, MX := 100.0);\n```\nBegrenzt einen Wert auf ein Intervall – sauberer als eine IF-Kaskade und Pflicht vor jeder Sollwertausgabe an einen Antrieb.',
    },
    {
      id: 'f11',
      front: 'Was ist der Unterschied zwischen `AND` auf `Bool` und `AND` auf `Word`?',
      back: 'Auf `Bool` ist es die logische UND-Verknüpfung (VKE). Auf `Byte`/`Word`/`DWord` arbeitet derselbe Operator **bitweise**: `wStatus AND 16#00FF` blendet die oberen 8 Bit aus.',
    },
    {
      id: 'f12',
      front: 'Wie vermeidet man einen Überlauf bei `iErg := iA * 1000;`?',
      back: 'Vor der Multiplikation hochkonvertieren: `diErg := INT_TO_DINT(iA) * 1000;`. Sonst rechnet die CPU in 16 Bit und das Zwischenergebnis läuft bei >32767 über.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Wert hat `rProzent` nach dem Zyklus?',
      code: `VAR_TEMP
    tiIst  : Int;
    tiSoll : Int;
END_VAR

BEGIN
    tiIst    := 30;
    tiSoll   := 100;
    rProzent := tiIst / tiSoll * 100.0;
END_FUNCTION_BLOCK`,
      options: ['`30.0`', '`0.3`', '`0.0`', '`3000.0`'],
      correct: 2,
      explanation:
        'Beide Operanden sind `Int`, also rechnet die CPU `30 / 100 = 0` (abgeschnitten). Erst danach wird mit 100.0 multipliziert → 0.0. Lösung: `INT_TO_REAL(tiIst) / INT_TO_REAL(tiSoll) * 100.0`.',
    },
    {
      id: 'q2',
      prompt: 'Warum lässt sich das nicht übersetzen?',
      code: `IF iBetriebsart := 2 THEN
    q_xAutomatik := TRUE;
END_IF;`,
      options: [
        '`IF` braucht immer einen `ELSE`-Zweig',
        '`:=` ist eine Zuweisung – `IF` erwartet einen booleschen Ausdruck, also `=`',
        '`iBetriebsart` muss `Bool` sein',
        'Zahlenliterale sind in Bedingungen nicht erlaubt',
      ],
      correct: 1,
      explanation:
        'In SCL ist `:=` die Zuweisung und `=` der Vergleich. Anders als in C ist eine Zuweisung kein Ausdruck – deshalb ist das hier ein harter Übersetzungsfehler und kein stiller Bug.',
    },
    {
      id: 'q3',
      prompt: 'Welchen Wert hat `xErgebnis`?',
      code: `VAR_TEMP
    txA : Bool;
    txB : Bool;
    txC : Bool;
END_VAR

BEGIN
    txA := FALSE;
    txB := TRUE;
    txC := TRUE;
    xErgebnis := txA OR txB AND txC;
END_FUNCTION_BLOCK`,
      options: ['`FALSE`', '`TRUE`', 'Übersetzungsfehler – Klammern sind Pflicht', 'Undefiniert'],
      correct: 1,
      explanation:
        '`AND` bindet stärker als `OR`, der Ausdruck ist also `FALSE OR (TRUE AND TRUE)` = `TRUE`. Wäre `(FALSE OR TRUE) AND TRUE` gemeint, käme zufällig dasselbe heraus – deshalb immer klammern.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat `iAnzeige`?',
      code: `iAnzeige := REAL_TO_INT(2.5);`,
      options: ['`3`', '`2`', '`2.5`', 'Übersetzungsfehler'],
      correct: 1,
      explanation:
        '`REAL_TO_INT` rundet nach IEC zur nächsten **geraden** Zahl: 2.5 → 2, aber 3.5 → 4. Für kaufmännisches Runden `TRUNC(rWert + 0.5)` verwenden.',
    },
    {
      id: 'q5',
      prompt: 'Wo ist der Fehler?',
      code: `IF rFuellstandIst = 75.0 THEN
    q_xZielErreicht := TRUE;
END_IF;`,
      options: [
        '`Real` lässt sich nicht mit `IF` prüfen',
        'Gleitkommawerte trifft man praktisch nie exakt – besser Toleranzband mit `ABS`',
        '`75.0` muss als `75` geschrieben werden',
        'Es fehlt ein `ELSE`-Zweig',
      ],
      correct: 1,
      explanation:
        'Messwerte und Rechenergebnisse sind nie bitgenau gleich einem Literal. Sauber: `IF ABS(rFuellstandIst - 75.0) < 0.1 THEN` oder ein Schwellwertvergleich mit `>=`.',
    },
    {
      id: 'q6',
      prompt: 'Welchen Wert hat `wErgebnis`?',
      code: `wStatus   := 2#0000_0000_1111_0000;
wErgebnis := wStatus AND 16#00FF;`,
      options: ['`16#00F0`', '`16#F000`', '`16#00FF`', '`16#0000`'],
      correct: 0,
      explanation:
        'Auf `Word` arbeitet `AND` bitweise. `16#00FF` lässt nur die unteren 8 Bit durch; von `2#1111_0000` (= `16#F0`) bleibt genau das übrig: `16#00F0`.',
    },
    {
      id: 'q7',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`rSoll := rVorgabe; IF rSoll > 100.0 THEN rSoll := 100.0; END_IF; IF rSoll < 0.0 THEN rSoll := 0.0; END_IF;`',
        '`rSoll := LIMIT(MN := 0.0, IN := rVorgabe, MX := 100.0);`',
        '`rSoll := MIN(IN1 := rVorgabe, IN2 := 100);`',
        '`rSoll := ABS(rVorgabe);`',
      ],
      correct: 1,
      explanation:
        '`LIMIT` drückt die Absicht in einer Zeile aus. Variante 1 funktioniert zwar, ist aber dreimal so lang; Variante 3 mischt `Real` und `Int` und fängt die Untergrenze nicht ab.',
    },
    {
      id: 'q8',
      prompt: 'Welchen Wert hat `diErgebnis` nach dem Zyklus?',
      code: `VAR_TEMP
    tiWert : Int;
END_VAR

BEGIN
    tiWert     := 100;
    diErgebnis := tiWert * 1000;
END_FUNCTION_BLOCK`,
      options: [
        '`100000`',
        'Ein überlaufener Wert, weil in 16 Bit gerechnet wird',
        '`32767`',
        'Die CPU geht in STOP',
      ],
      correct: 1,
      explanation:
        'Beide Operanden sind `Int`, also rechnet die CPU in 16 Bit und das Zwischenergebnis läuft über – erst danach wird nach `DInt` zugewiesen. Richtig: `INT_TO_DINT(tiWert) * 1000`.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Analogwert skalieren',
      level: 1,
      description: `Schreibe eine **FC** \`FC_SkaliereDruck\` mit Rückgabewert \`Real\`.

Schnittstelle:

- \`i_iRohwert : Int\` – Analogwert der Baugruppe, Bereich 0 … 27648
- Rückgabe: Druck in bar im Bereich 0.0 … 6.0

Anforderungen:

- Rohwertbereich und Druckbereich als \`VAR CONSTANT\`
- explizite Typkonvertierung
- Ergebnis auf 0.0 … 6.0 begrenzen (der Sensor kann übersteuern)`,
      starter: `FUNCTION "FC_SkaliereDruck" : Real
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_iRohwert : Int;                       // 0 .. 27648
END_VAR

VAR CONSTANT
    // TODO
END_VAR

BEGIN
    // TODO: Rohwert nach bar umrechnen und begrenzen
    #FC_SkaliereDruck := 0.0;
END_FUNCTION`,
      solution: `FUNCTION "FC_SkaliereDruck" : Real
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_iRohwert : Int;                       // 0 .. 27648
END_VAR

VAR CONSTANT
    ROHWERT_MAX : Real := 27648.0;          // Nennbereich der Analogbaugruppe
    DRUCK_MIN   : Real := 0.0;              // bar
    DRUCK_MAX   : Real := 6.0;              // bar
END_VAR

VAR_TEMP
    trDruck : Real;                         // bar, Zwischenergebnis
END_VAR

BEGIN
    // Erst nach Real konvertieren, sonst liefert die Int-Division 0.
    trDruck := INT_TO_REAL(i_iRohwert) / ROHWERT_MAX * DRUCK_MAX;

    // Uebersteuerung und Drahtbruch (negativer Rohwert) abfangen.
    #FC_SkaliereDruck := LIMIT(MN := DRUCK_MIN, IN := trDruck, MX := DRUCK_MAX);
END_FUNCTION`,
      hints: [
        'Die Umrechnung ist ein Dreisatz: Rohwert / Rohwert_max * Druck_max. Entscheidend ist, in welchem Typ gerechnet wird.',
        'Du brauchst `INT_TO_REAL`, Real-Literale mit Punkt und `LIMIT(MN := .., IN := .., MX := ..)`.',
        'Temp-Variable berechnen → `INT_TO_REAL(i_iRohwert) / 27648.0 * 6.0` → Ergebnis über `LIMIT` dem Rückgabewert zuweisen.',
        '```pascal\ntrDruck := INT_TO_REAL(i_iRohwert) / ROHWERT_MAX * DRUCK_MAX;\n#FC_SkaliereDruck := LIMIT(MN := DRUCK_MIN, IN := trDruck, MX := DRUCK_MAX);\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Freigabekette lesbar machen',
      level: 2,
      description: `Die folgende Zeile stammt aus einem Serienprojekt und ist unwartbar:

\`\`\`pascal
q_xPumpeFreigabe := i_xHandEin AND NOT i_xStoerung OR i_xAutoEin AND i_xNiveauOk AND NOT i_xStoerung AND i_xDruckOk;
\`\`\`

Baue das in einer **FC** \`FC_PumpenFreigabe\` so um, dass

- die Rangfolge durch **Klammern** sichtbar wird,
- die Teilbedingungen über benannte \`VAR_TEMP\`-Variablen dokumentiert sind (z. B. \`txHandbetriebOk\`, \`txAutomatikOk\`),
- das Verhalten exakt gleich bleibt.

Rückgabewert der FC ist \`Bool\`.`,
      starter: `FUNCTION "FC_PumpenFreigabe" : Bool
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xHandEin   : Bool;
    i_xAutoEin   : Bool;
    i_xNiveauOk  : Bool;
    i_xDruckOk   : Bool;
    i_xStoerung  : Bool;
END_VAR

VAR_TEMP
    // TODO: sprechende Teilbedingungen
END_VAR

BEGIN
    // TODO
    #FC_PumpenFreigabe := FALSE;
END_FUNCTION`,
      solution: `FUNCTION "FC_PumpenFreigabe" : Bool
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xHandEin   : Bool;                    // Schluesselschalter Hand
    i_xAutoEin   : Bool;                    // Betriebsart Automatik
    i_xNiveauOk  : Bool;                    // Niveauschalter Vorlagebehaelter
    i_xDruckOk   : Bool;                    // Druckwaechter Druckseite
    i_xStoerung  : Bool;                    // Sammelstoerung
END_VAR

VAR_TEMP
    txKeineStoerung : Bool;
    txHandbetriebOk : Bool;
    txAutomatikOk   : Bool;
END_VAR

BEGIN
    // Gemeinsame Bedingung einmal benennen statt zweimal verknuepfen.
    txKeineStoerung := NOT i_xStoerung;

    txHandbetriebOk := i_xHandEin;
    txAutomatikOk   := i_xAutoEin AND i_xNiveauOk AND i_xDruckOk;

    // AND bindet staerker als OR - die Klammer macht das sichtbar.
    #FC_PumpenFreigabe := txKeineStoerung AND (txHandbetriebOk OR txAutomatikOk);
END_FUNCTION`,
      hints: [
        'Zeichne die Bedingung als Baum: Was ist die Oder-Verzweigung (Hand vs. Automatik), was gilt für beide Zweige (keine Störung)?',
        '`AND` bindet stärker als `OR`. Benenne Teilausdrücke über `VAR_TEMP`-Bools.',
        'txKeineStoerung = NOT Störung; txAutomatikOk = Auto AND Niveau AND Druck; Ergebnis = keineStörung AND (Hand OR AutomatikOk).',
        '```pascal\n#FC_PumpenFreigabe := txKeineStoerung AND (txHandbetriebOk OR txAutomatikOk);\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Störwort auswerten und zählen',
      level: 3,
      description: `Schreibe einen **FB** \`FB_Stoerauswertung\`.

Schnittstelle:

- \`i_wStoerungen : Word\` – 16 Einzelstörungen, Bit 0 … Bit 15
- \`i_wMaskeKritisch : Word\` – Bitmaske der kritischen Störungen
- \`q_xSammelstoerung : Bool\` – TRUE, sobald irgendein Bit gesetzt ist
- \`q_xStoerungKritisch : Bool\` – TRUE, wenn eine **kritische** Störung ansteht
- \`q_iAnzahlStoerungen : Int\` – Anzahl gesetzter Bits

Anforderungen:

- Bitzugriffe über \`.%X0\` … \`.%X15\`, Anzahl über eine einfache Auswertung
- kritische Störungen über eine Bitmaske mit \`AND\`
- keine Magic Numbers im Anweisungsteil

Hinweis: Eine Schleife ist hier zwar erlaubt, geht aber auch ohne – du darfst die 16 Bits einzeln prüfen (Schleifen kommen in Kapitel 04).`,
      starter: `FUNCTION_BLOCK "FB_Stoerauswertung"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_wStoerungen   : Word;
    i_wMaskeKritisch: Word := 16#000F;      // Bit 0..3 sind kritisch
END_VAR

VAR_OUTPUT
    q_xSammelstoerung   : Bool;
    q_xStoerungKritisch : Bool;
    q_iAnzahlStoerungen : Int;
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Stoerauswertung"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_wStoerungen    : Word;                // 16 Einzelmeldungen
    i_wMaskeKritisch : Word := 16#000F;     // Bit 0..3 sind kritisch
END_VAR

VAR_OUTPUT
    q_xSammelstoerung   : Bool;
    q_xStoerungKritisch : Bool;
    q_iAnzahlStoerungen : Int;
END_VAR

VAR CONSTANT
    KEINE_STOERUNG : Word := 16#0000;
END_VAR

VAR_TEMP
    twKritisch : Word;                      // ausmaskierte kritische Bits
    tiAnzahl   : Int;
END_VAR

BEGIN
    // Sammelmeldung: irgendein Bit gesetzt?
    q_xSammelstoerung := (i_wStoerungen <> KEINE_STOERUNG);

    // Kritische Bits ausmaskieren - uebrig bleibt nur, was in der Maske steht.
    twKritisch          := i_wStoerungen AND i_wMaskeKritisch;
    q_xStoerungKritisch := (twKritisch <> KEINE_STOERUNG);

    // Gesetzte Bits zaehlen. BOOL_TO_INT liefert 0 oder 1.
    tiAnzahl :=
          BOOL_TO_INT(i_wStoerungen.%X0)  + BOOL_TO_INT(i_wStoerungen.%X1)
        + BOOL_TO_INT(i_wStoerungen.%X2)  + BOOL_TO_INT(i_wStoerungen.%X3)
        + BOOL_TO_INT(i_wStoerungen.%X4)  + BOOL_TO_INT(i_wStoerungen.%X5)
        + BOOL_TO_INT(i_wStoerungen.%X6)  + BOOL_TO_INT(i_wStoerungen.%X7)
        + BOOL_TO_INT(i_wStoerungen.%X8)  + BOOL_TO_INT(i_wStoerungen.%X9)
        + BOOL_TO_INT(i_wStoerungen.%X10) + BOOL_TO_INT(i_wStoerungen.%X11)
        + BOOL_TO_INT(i_wStoerungen.%X12) + BOOL_TO_INT(i_wStoerungen.%X13)
        + BOOL_TO_INT(i_wStoerungen.%X14) + BOOL_TO_INT(i_wStoerungen.%X15);

    q_iAnzahlStoerungen := tiAnzahl;
END_FUNCTION_BLOCK`,
      hints: [
        '"Irgendein Bit gesetzt" heißt: das ganze Wort ist ungleich 0. "Kritische Störung" heißt: nach dem Ausmaskieren ist noch etwas übrig.',
        'Du brauchst `AND` auf `Word` (bitweise), den Vergleich `<>` und den Bitzugriff `.%X0`.',
        'Sammel = Wort <> 0; Kritisch = (Wort AND Maske) <> 0; Anzahl = Summe aus BOOL_TO_INT über alle 16 Bits.',
        '```pascal\ntwKritisch          := i_wStoerungen AND i_wMaskeKritisch;\nq_xStoerungKritisch := (twKritisch <> KEINE_STOERUNG);\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Durchflussberechnung mit Schutz vor Rechenfehlern',
      level: 4,
      description: `Schreibe einen **FB** \`FB_Durchfluss\`, der aus einem Wirkdruck den Volumenstrom berechnet.

Schnittstelle:

- \`i_iWirkdruckRoh : Int\` – Rohwert 0 … 27648 entspricht 0 … 100 mbar
- \`i_rKennwert : Real\` – anlagenspezifischer Faktor (kann 0.0 sein!)
- \`i_diZaehlZyklusMs : DInt\` – Zykluszeit in ms
- \`q_rDurchfluss : Real\` – m³/h
- \`q_diGesamtmenge : DInt\` – aufsummierte Menge in Litern (statisch, remanent gedacht)
- \`q_xRechenfehler : Bool\` – TRUE, wenn die Berechnung nicht möglich war

Anforderungen:

- Volumenstrom = Kennwert * SQRT(Wirkdruck in mbar)
- negative Rohwerte (Drahtbruch) → Durchfluss 0.0, \`q_xRechenfehler := TRUE\`
- Kennwert 0.0 → \`q_xRechenfehler := TRUE\`, kein \`SQRT\` einer negativen Zahl
- Gesamtmenge pro Zyklus hochzählen: Liter = m³/h * 1000 / 3600 / 1000 * Zykluszeit_ms
- Überlauf der Gesamtmenge verhindern (bei \`DInt\`-Maximum stehenbleiben)
- alle Grenzwerte als \`VAR CONSTANT\``,
      starter: `FUNCTION_BLOCK "FB_Durchfluss"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_iWirkdruckRoh   : Int;
    i_rKennwert       : Real;
    i_diZaehlZyklusMs : DInt := 100;
END_VAR

VAR_OUTPUT
    q_rDurchfluss   : Real;
    q_diGesamtmenge : DInt;
    q_xRechenfehler : Bool;
END_VAR

VAR
    // TODO: remanente Summe
END_VAR

VAR CONSTANT
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Durchfluss"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_iWirkdruckRoh   : Int;                // 0 .. 27648 = 0 .. 100 mbar
    i_rKennwert       : Real;               // anlagenspezifisch, 0.0 = nicht parametriert
    i_diZaehlZyklusMs : DInt := 100;        // ms
END_VAR

VAR_OUTPUT
    q_rDurchfluss   : Real;                 // m3/h
    q_diGesamtmenge : DInt;                 // Liter
    q_xRechenfehler : Bool;
END_VAR

VAR
    srSummeLiter : Real := 0.0;             // Liter, REMANENT projektieren
END_VAR

VAR CONSTANT
    ROHWERT_MAX   : Real := 27648.0;
    DRUCK_MAX     : Real := 100.0;          // mbar
    LITER_MAX     : Real := 2000000000.0;   // knapp unter DInt-Maximum
    SEKUNDEN_H    : Real := 3600.0;
    MS_PRO_S      : Real := 1000.0;
END_VAR

VAR_TEMP
    trDruckMbar : Real;                     // mbar
    trLiterZyklus : Real;                   // Liter in diesem Zyklus
END_VAR

BEGIN
    q_xRechenfehler := FALSE;

    // Drahtbruch bzw. negativer Rohwert: SQRT waere undefiniert.
    IF i_iWirkdruckRoh < 0 THEN
        q_rDurchfluss   := 0.0;
        q_xRechenfehler := TRUE;

    // Nicht parametrierter Kennwert: Rechnung ergibt keinen sinnvollen Wert.
    ELSIF i_rKennwert <= 0.0 THEN
        q_rDurchfluss   := 0.0;
        q_xRechenfehler := TRUE;

    ELSE
        trDruckMbar   := INT_TO_REAL(i_iWirkdruckRoh) / ROHWERT_MAX * DRUCK_MAX;
        q_rDurchfluss := i_rKennwert * SQRT(trDruckMbar);
    END_IF;

    // Menge aufsummieren: m3/h -> Liter je Zyklus
    // m3/h * 1000 = l/h; / 3600 = l/s; / 1000 * Zyklus_ms  =>  kuerzt sich zu /3600
    trLiterZyklus := q_rDurchfluss
                     * MS_PRO_S
                     / SEKUNDEN_H
                     / MS_PRO_S
                     * DINT_TO_REAL(i_diZaehlZyklusMs);

    // In Real summieren und erst zur Ausgabe nach DInt wandeln -
    // so laeuft kein Zwischenergebnis ueber.
    srSummeLiter := LIMIT(MN := 0.0, IN := srSummeLiter + trLiterZyklus, MX := LITER_MAX);

    q_diGesamtmenge := REAL_TO_DINT(srSummeLiter);
END_FUNCTION_BLOCK`,
      hints: [
        'Alle Sonderfälle zuerst abfangen, bevor gerechnet wird: negativer Rohwert und Kennwert 0.0 dürfen nie bis zum `SQRT` bzw. zur Division durchkommen.',
        'Du brauchst `INT_TO_REAL`, `DINT_TO_REAL`, `SQRT`, `LIMIT` und `REAL_TO_DINT`.',
        'IF Rohwert < 0 → Fehler; ELSIF Kennwert <= 0.0 → Fehler; ELSE skalieren und `Kennwert * SQRT(Druck)` rechnen. Danach Menge in einer `Real`-Summe aufaddieren und mit `LIMIT` deckeln.',
        '```pascal\nsrSummeLiter := LIMIT(MN := 0.0,\n                      IN := srSummeLiter + trLiterZyklus,\n                      MX := LITER_MAX);\nq_diGesamtmenge := REAL_TO_DINT(srSummeLiter);\n```',
      ],
    },
  ],
}

export default chapter
