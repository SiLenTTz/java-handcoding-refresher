import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '01',
  flashcards: [
    {
      id: 'f1',
      front: 'Welche Deklarationsbereiche gibt es in einem FB – und wofür?',
      back: '`VAR_INPUT` (lesen), `VAR_OUTPUT` (schreiben), `VAR_IN_OUT` (lesen + schreiben, als Referenz), `VAR` (statisch, liegt im Instanz-DB), `VAR_TEMP` (nur dieser Zyklus, L-Stack), `VAR CONSTANT` (symbolische Konstante).',
    },
    {
      id: 'f2',
      front: 'Warum darf man `VAR_TEMP` nicht als Gedächtnis benutzen?',
      back: 'Temp-Variablen liegen im Lokaldatenstack und werden bei jedem Aufruf neu belegt. Ihr Inhalt beim Zyklusstart ist **undefiniert**. Gedächtnis gibt es nur über `VAR` (Instanz-DB) oder einen Global-DB.',
    },
    {
      id: 'f3',
      front: 'Wertebereich von `Int` und `DInt`?',
      back: '`Int`: 16 Bit, −32768 … 32767. `DInt`: 32 Bit, −2 147 483 648 … 2 147 483 647. Stückzahlen und Betriebsstunden gehören in `DInt`.',
    },
    {
      id: 'f4',
      front: 'Wie schreibt man Zeit-, Hex-, Binär- und String-Literale?',
      back: '```pascal\ntWarte := T#5s;        // auch T#1h30m, T#500ms\nbyMaske := 16#FF;\nwMuster := 2#1010_1010;\nsText   := \'Behaelter voll\';\n```',
    },
    {
      id: 'f5',
      front: 'Warum ist `rDruck := 5;` ein Problem?',
      back: '`5` ist ein Int-Literal, `rDruck` ist `Real`. TIA meldet einen Typkonflikt bzw. konvertiert implizit. Real-Literale immer mit Dezimalpunkt schreiben: `rDruck := 5.0;`.',
    },
    {
      id: 'f6',
      front: 'Was bedeutet Remanenz – und was gehört remanent?',
      back: 'Remanente Daten überleben NETZ-AUS und Neustart. Remanent: Anlagenzustand wie Betriebsstunden, Stückzahlen, Rezeptnummer. Nicht remanent: Hilfsbits, Flankenmerker, Zwischenwerte.',
    },
    {
      id: 'f7',
      front: 'Was ist das Prozessabbild (PAE/PAA)?',
      back: 'Die CPU liest alle Eingänge **einmal** am Zyklusanfang ins PAE und schreibt die Ausgänge **einmal** am Zyklusende aus dem PAA. Innerhalb eines Zyklus sind die Eingangswerte deshalb konstant.',
    },
    {
      id: 'f8',
      front: 'Warum gehören große Arrays und Structs nach `VAR_IN_OUT`?',
      back: '`VAR_IN_OUT` übergibt eine **Referenz** (Zeiger), `VAR_INPUT` kopiert den Wert. Bei großen Strukturen spart die Referenz Laufzeit und Lokaldaten.',
    },
    {
      id: 'f9',
      front: 'Wie groß ist `Time` und wie ist es intern abgelegt?',
      back: '`Time` ist intern ein `DInt` in Millisekunden → Bereich ca. −24d20h31m23s648ms … +24d. Für längere Zeiten `LTime` oder selbst in `DInt`-Sekunden rechnen.',
    },
    {
      id: 'f10',
      front: 'Symbolik vs. Absolutadresse – was nimmt man wann?',
      back: 'Immer Symbole aus der PLC-Variablentabelle (`"Taster_Start"`). Absolutadressen (`%I0.0`, `%Q4.1`, `%MW10`) nur zum Verstehen alter Programme; optimierte Bausteine der S7-1200/1500 haben gar keine.',
    },
    {
      id: 'f11',
      front: 'Was passiert bei `iStueck := iStueck + 1;` wenn `iStueck` ein `Int` mit Wert 32767 ist?',
      back: 'Überlauf: der Wert springt auf −32768. Die CPU meldet das bei Standard-Arithmetik nicht als Fehler. Lösung: `DInt` verwenden oder vorher auf das Maximum prüfen.',
    },
    {
      id: 'f12',
      front: 'Warum ist `Real` für Stückzahlen und Geldbeträge ungeeignet?',
      back: '`Real` hat nur ca. 7 signifikante Stellen und speichert 0.1 nicht exakt. Für abzählbare Größen `Int`/`DInt` nehmen, für Geld in Cent als `DInt` rechnen.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Wert hat `tZaehler` im 100. Zyklus?',
      code: `VAR_TEMP
    tZaehler : Int;
END_VAR

BEGIN
    tZaehler := tZaehler + 1;
END_FUNCTION_BLOCK`,
      options: [
        '`100`',
        '`1`',
        'Undefiniert – der L-Stack wird bei jedem Aufruf neu belegt',
        '`0`, weil Temp-Variablen immer auf 0 gesetzt werden',
      ],
      correct: 2,
      explanation:
        '`VAR_TEMP` liegt im Lokaldatenstack und enthält beim Aufruf die Reste des vorherigen Bausteins. Für einen Zähler braucht man `VAR` (statisch, Instanz-DB).',
    },
    {
      id: 'q2',
      prompt: 'Warum lässt sich dieser Deklarationsteil nicht übersetzen?',
      code: `FUNCTION "FC_Summe" : Int
VAR
    sZwischensumme : Int;
END_VAR`,
      options: [
        'Eine FC darf keinen Rückgabewert haben',
        'Eine FC hat keine statischen Variablen – nur `VAR_TEMP`',
        '`Int` ist als Rückgabetyp nicht erlaubt',
        'Der Bausteinname darf keine Anführungszeichen haben',
      ],
      correct: 1,
      explanation:
        'Nur ein FB besitzt mit dem Instanz-DB einen Speicher für statische Variablen. In einer FC sind lokale Variablen immer temporär (`VAR_TEMP`).',
    },
    {
      id: 'q3',
      prompt: 'Welchen Wert hat `rErgebnis` nach dem Zyklus?',
      code: `VAR_TEMP
    tDruck : Real;
END_VAR

VAR_OUTPUT
    rErgebnis : Real;
END_VAR

BEGIN
    tDruck    := 16#10;
    rErgebnis := tDruck;
END_FUNCTION_BLOCK`,
      options: ['`10.0`', '`16.0`', '`0.0`', '`1.6`'],
      correct: 1,
      explanation:
        '`16#10` ist hexadezimal und entspricht dezimal 16. Hex-Literale sind in der Praxis für Bitmasken gedacht – in Real-Zuweisungen sind sie verwirrend.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler?',
      code: `VAR
    sMeldung : String[20];
END_VAR

BEGIN
    sMeldung := "Stoerung Band 1";
END_FUNCTION_BLOCK`,
      options: [
        'String-Literale stehen in einfachen Anführungszeichen (`\'…\'`), doppelte sind für Bausteinnamen reserviert',
        'Der String ist zu kurz deklariert',
        'Strings dürfen keine Leerzeichen enthalten',
        'Ein String darf nicht `VAR` sein, nur `VAR_TEMP`',
      ],
      correct: 0,
      explanation:
        'In SCL sind `\'…\'` Zeichenketten und `"…"` referenzieren Bausteine bzw. PLC-Variablen. TIA sucht hier nach einem Baustein namens `Stoerung Band 1`.',
    },
    {
      id: 'q5',
      prompt: 'Welche Deklaration ist für einen Betriebsstundenzähler sauber?',
      options: [
        '`tBetriebsstunden : Int;` in `VAR_TEMP`',
        '`sBetriebsstunden : Real;` in `VAR`, nicht remanent',
        '`sBetriebsstunden : DInt;` in `VAR`, remanent',
        '`i_diBetriebsstunden : DInt;` in `VAR_INPUT`',
      ],
      correct: 2,
      explanation:
        'Der Zähler braucht Gedächtnis über Zyklen (`VAR`), überlebt NETZ-AUS (remanent) und darf nicht überlaufen (`DInt`, nicht `Int`). `Real` wäre für abzählbare Größen falsch.',
    },
    {
      id: 'q6',
      prompt: 'Welchen Wert hat `q_xMotor` am Zyklusende?',
      code: `BEGIN
    q_xMotor := TRUE;
    // ... 200 Zeilen Code ...
    q_xMotor := i_xFreigabe;
END_FUNCTION_BLOCK`,
      options: [
        'Immer `TRUE`',
        'Den Wert von `i_xFreigabe` – die letzte Zuweisung gewinnt',
        '`TRUE` ODER `i_xFreigabe`',
        'Übersetzungsfehler wegen Doppelzuweisung',
      ],
      correct: 1,
      explanation:
        'SCL wird von oben nach unten abgearbeitet; nur der zuletzt geschriebene Wert landet im PAA. Doppelzuweisungen auf einen Ausgang sind der Klassiker unter den Inbetriebnahme-Fehlern – pro Ausgang genau eine Zuweisungsstelle.',
    },
    {
      id: 'q7',
      prompt: 'Ein Analogwert steht als `Int` (0…27648) in `%IW64`. Welche Variante ist sauber?',
      options: [
        '`rDruck := %IW64 / 27648 * 10;`',
        '`rDruck := INT_TO_REAL("Druck_Roh") / 27648.0 * 10.0;`',
        '`rDruck := "Druck_Roh";`',
        '`rDruck := REAL_TO_INT("Druck_Roh") * 10;`',
      ],
      correct: 1,
      explanation:
        'Symbolisch zugreifen, explizit nach `Real` konvertieren und mit Real-Literalen rechnen. Variante 1 nutzt eine Absolutadresse und würde als Int-Division 0 ergeben.',
    },
    {
      id: 'q8',
      prompt: 'Welche Aussage zum Prozessabbild stimmt?',
      options: [
        'Eingänge werden bei jedem Zugriff direkt von der Baugruppe gelesen',
        'Eingänge werden einmal am Zyklusanfang gelesen und sind im Zyklus konstant',
        'Ausgänge werden sofort bei der Zuweisung an die Klemme geschrieben',
        'Das Prozessabbild gibt es nur bei nicht optimierten Bausteinen',
      ],
      correct: 1,
      explanation:
        'PAE wird am Zyklusanfang aktualisiert, PAA am Zyklusende ausgegeben. Direktzugriff auf die Peripherie geht nur bewusst über `:P` (z. B. `"Not_Aus":P`).',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Deklarationsteil für ein Förderband',
      level: 1,
      description: `Schreibe den **Deklarationsteil** eines Funktionsbausteins \`FB_Foerderband\`.

Schnittstelle:

- Eingänge: Starttaster, Stoptaster, Freigabe (alle \`Bool\`), Sollgeschwindigkeit in m/s (\`Real\`, Startwert 1.0)
- Ausgänge: Motor ein (\`Bool\`), Störung (\`Bool\`)
- Durchgang: Stückzähler (\`DInt\`) – wird von außen auch zurückgesetzt
- Statisch: Gesamtlaufzeit (\`Time\`), Anzahl Anläufe (\`DInt\`, remanent gedacht)
- Konstante: maximale Geschwindigkeit 2.5 m/s
- Temporär: Zwischenwert für eine Berechnung (\`Real\`)

Nutze die üblichen Präfixe (\`i_\`, \`q_\`, \`io_\`, \`s\`, \`t\`) und kommentiere Einheiten.`,
      starter: `FUNCTION_BLOCK "FB_Foerderband"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    // TODO
END_VAR

VAR_OUTPUT
    // TODO
END_VAR

BEGIN
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Foerderband"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xStart        : Bool;                 // Taster Start (Schliesser)
    i_xStop         : Bool;                 // Taster Stop (Oeffner, TRUE = ok)
    i_xFreigabe     : Bool;                 // Freigabe uebergeordnete Steuerung
    i_rSollTempo    : Real := 1.0;          // m/s
END_VAR

VAR_OUTPUT
    q_xMotorEin     : Bool;                 // Schuetz Bandmotor
    q_xStoerung     : Bool;                 // Sammelstoermeldung
END_VAR

VAR_IN_OUT
    io_diStueckzahl : DInt;                 // Stueck, wird extern quittiert
END_VAR

VAR
    sGesamtlaufzeit : Time;                 // Summe Laufzeit, remanent
    sdiAnlaeufe     : DInt;                 // Anzahl Motorstarts, remanent
END_VAR

VAR CONSTANT
    MAX_TEMPO       : Real := 2.5;          // m/s, mechanisches Limit
END_VAR

VAR_TEMP
    trTempoBegrenzt : Real;                 // m/s, Zwischenwert
END_VAR

BEGIN
    ;
END_FUNCTION_BLOCK`,
      hints: [
        'Überlege für jede Variable: Kommt sie von außen rein, geht sie raus, oder braucht der Baustein sie nur für sich?',
        'Die Bereiche heißen `VAR_INPUT`, `VAR_OUTPUT`, `VAR_IN_OUT`, `VAR`, `VAR CONSTANT`, `VAR_TEMP`.',
        'Reihenfolge: INPUT → OUTPUT → IN_OUT → VAR → CONSTANT → TEMP, danach `BEGIN`.',
        '```pascal\nVAR_IN_OUT\n    io_diStueckzahl : DInt;\nEND_VAR\n\nVAR CONSTANT\n    MAX_TEMPO : Real := 2.5;\nEND_VAR\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Passende Datentypen wählen',
      level: 2,
      description: `Ein Global-DB \`DB_Anlagendaten\` soll folgende Werte halten. Wähle für jeden Wert den **kleinsten passenden** Typ, setze sinnvolle Startwerte und markiere im Kommentar, was remanent sein muss.

1. Betriebsstunden der Pumpe (bis 500 000 h)
2. Aktueller Behälterdruck in bar (0.0 … 6.0)
3. Sammelstörwort mit 16 Einzelmeldungen
4. Letzte Störmeldung als Text (max. 40 Zeichen)
5. Nachlaufzeit des Lüfters (Sekundenbereich)
6. Aktuelle Rezeptnummer (1 … 50)
7. Anlage in Automatik (ja/nein)
8. Tagesstückzahl (bis 2 Mio.)

Begründe die Wahl jeweils kurz im Kommentar.`,
      starter: `DATA_BLOCK "DB_Anlagendaten"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR
    // TODO: 8 Variablen mit passendem Typ, Startwert und Kommentar
END_VAR

BEGIN

END_DATA_BLOCK`,
      solution: `DATA_BLOCK "DB_Anlagendaten"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR
    diBetriebsstunden : DInt   := 0;        // h, Int wuerde bei 32767 ueberlaufen -> REMANENT
    rDruckIst         : Real   := 0.0;      // bar, physikalischer Messwert -> nicht remanent
    wSammelstoerung   : Word   := 16#0000;  // 16 Einzelbits, Bitzugriff ueber .%X0 .. .%X15
    sLetzteStoerung   : String[40] := '';   // Klartext fuer HMI -> REMANENT
    tNachlaufLuefter  : Time   := T#30s;    // Sekundenbereich passt locker in Time
    iRezeptNummer     : Int    := 1;        // 1..50, Int reicht -> REMANENT
    xAutomatikAktiv   : Bool   := FALSE;    // Betriebsart, nach NETZ-EIN bewusst FALSE
    diStueckzahlTag   : DInt   := 0;        // bis 2 Mio -> DInt zwingend, REMANENT
END_VAR

BEGIN

END_DATA_BLOCK`,
      hints: [
        'Frage pro Wert: Wie groß wird er maximal, und ist er abzählbar oder physikalisch gemessen?',
        'Zur Auswahl stehen `Bool`, `Word`, `Int`, `DInt`, `Real`, `Time`, `String[n]`.',
        'Alles über 32767 → `DInt`. Messwerte mit Nachkommastellen → `Real`. 16 Bitmeldungen → `Word`.',
        '```pascal\ndiBetriebsstunden : DInt := 0;   // REMANENT\nwSammelstoerung   : Word := 16#0000;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Absolut nach symbolisch umbauen',
      level: 3,
      description: `Der folgende Code stammt aus einem alten S7-300-Programm und arbeitet mit Absolutadressen. Baue ihn so um, dass er

- ausschließlich **symbolische** Namen aus einer PLC-Variablentabelle verwendet,
- Konstanten statt Zahlenliteralen nutzt,
- Einheiten kommentiert
- und die übliche Präfix-Konvention einhält.

Schreibe zusätzlich in Kommentaren die zugehörige **Symboltabelle** (Name, Typ, Adresse) oben in den Baustein.

Alter Code:

\`\`\`pascal
IF %I0.0 AND NOT %I0.1 THEN
    %M10.0 := TRUE;
END_IF;
IF %IW64 > 20000 THEN
    %Q4.0 := TRUE;
END_IF;
\`\`\``,
      starter: `FUNCTION "FC_Behaelter" : Void
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

// Symboltabelle:
// TODO

BEGIN
    // TODO: symbolische Fassung des alten Codes
    ;
END_FUNCTION`,
      solution: `FUNCTION "FC_Behaelter" : Void
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

// Symboltabelle (PLC-Variablen):
//   "Taster_Start"      Bool  %I0.0   Schliesser Start
//   "Not_Aus_Ok"        Bool  %I0.1   Oeffner, TRUE = ausgeloest
//   "Mrk_Anlage_Laeuft" Bool  %M10.0  Hilfsmerker Betrieb
//   "Fuellstand_Roh"    Int   %IW64   Analogwert 0..27648
//   "Ventil_Ablauf"     Bool  %Q4.0   Magnetventil Ablauf

VAR CONSTANT
    GRENZE_FUELLSTAND : Int := 20000;   // Rohwert, entspricht ca. 72 %
END_VAR

BEGIN
    // Anlage freigeben, solange Start gedrueckt und Not-Aus nicht ausgeloest ist
    IF "Taster_Start" AND NOT "Not_Aus_Ok" THEN
        "Mrk_Anlage_Laeuft" := TRUE;
    END_IF;

    // Ablaufventil oeffnen, wenn der Behaelter zu voll wird
    IF "Fuellstand_Roh" > GRENZE_FUELLSTAND THEN
        "Ventil_Ablauf" := TRUE;
    END_IF;
END_FUNCTION`,
      hints: [
        'Jede Absolutadresse bekommt einen Namen, der sagt, was das Signal in der Anlage bedeutet – nicht, wo es verdrahtet ist.',
        'Symbolische PLC-Variablen stehen in doppelten Anführungszeichen, Konstanten gehören in `VAR CONSTANT`.',
        'Erst Symboltabelle als Kommentarblock, dann `VAR CONSTANT`, dann die beiden IF-Anweisungen mit den neuen Namen.',
        '```pascal\nVAR CONSTANT\n    GRENZE_FUELLSTAND : Int := 20000;\nEND_VAR\n\nIF "Taster_Start" AND NOT "Not_Aus_Ok" THEN\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Zyklusfeste Initialisierung und Remanenz',
      level: 4,
      description: `Schreibe einen FB \`FB_Betriebsstunden\`, der die Laufzeit einer Pumpe zählt.

Anforderungen:

- Eingang: \`i_xPumpeLaeuft\` (\`Bool\`), \`i_xReset\` (\`Bool\`), \`i_tZykluszeit\` (\`Time\`, Zykluszeit des aufrufenden OB)
- Ausgänge: \`q_diBetriebsstunden\` (\`DInt\`, volle Stunden), \`q_xWartungFaellig\` (\`Bool\`)
- Statisch und **remanent**: Millisekunden-Summe als \`DInt\`
- Konstante: Wartungsintervall 2000 Stunden
- Beim ersten Zyklus nach NETZ-EIN darf **nichts** zurückgesetzt werden – die Summe muss erhalten bleiben
- \`i_xReset\` setzt die Summe auf 0

Hinweis: \`TIME_TO_DINT(i_tZykluszeit)\` liefert die Zykluszeit in Millisekunden. 1 Stunde = 3 600 000 ms. Kommentiere, **welche** Variablen remanent projektiert werden müssen und warum.`,
      starter: `FUNCTION_BLOCK "FB_Betriebsstunden"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xPumpeLaeuft : Bool;
    i_xReset       : Bool;
    i_tZykluszeit  : Time := T#100ms;
END_VAR

VAR_OUTPUT
    // TODO
END_VAR

VAR
    // TODO: remanente Millisekunden-Summe
END_VAR

VAR CONSTANT
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Betriebsstunden"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xPumpeLaeuft : Bool;                  // Rueckmeldung Motorschuetz
    i_xReset       : Bool;                  // Zaehler loeschen (z. B. nach Wartung)
    i_tZykluszeit  : Time := T#100ms;       // Zykluszeit des aufrufenden OB
END_VAR

VAR_OUTPUT
    q_diBetriebsstunden : DInt;             // volle Stunden
    q_xWartungFaellig   : Bool;             // TRUE ab Erreichen des Intervalls
END_VAR

VAR
    // REMANENT projektieren: muss NETZ-AUS ueberleben, sonst ist die Wartungshistorie weg
    sdiSummeMs : DInt := 0;                 // aufsummierte Laufzeit in ms
END_VAR

VAR CONSTANT
    MS_PRO_STUNDE    : DInt := 3600000;     // ms
    WARTUNGSINTERVALL: DInt := 2000;        // h
END_VAR

VAR_TEMP
    tdiZyklusMs : DInt;                     // ms, nur Zwischenwert -> bewusst TEMP
END_VAR

BEGIN
    // Kein "Erstzyklus-Init": der Startwert 0 gilt nur beim Urloeschen,
    // nach NETZ-EIN liefert die Remanenz den letzten Stand zurueck.

    IF i_xReset THEN
        sdiSummeMs := 0;
    ELSIF i_xPumpeLaeuft THEN
        tdiZyklusMs := TIME_TO_DINT(i_tZykluszeit);
        // Ueberlauf vermeiden: DInt reicht fuer ca. 596 Stunden in ms,
        // deshalb volle Stunden abschneiden und als Stunden weiterzaehlen.
        sdiSummeMs := sdiSummeMs + tdiZyklusMs;
    END_IF;

    q_diBetriebsstunden := sdiSummeMs / MS_PRO_STUNDE;
    q_xWartungFaellig   := q_diBetriebsstunden >= WARTUNGSINTERVALL;
END_FUNCTION_BLOCK`,
      hints: [
        'Gedächtnis über NETZ-AUS hinweg = statische Variable im Instanz-DB mit gesetzter Remanenz. Ein „Erstzyklus-Init“ würde genau das zerstören.',
        'Du brauchst `VAR` (statisch), `VAR CONSTANT` für 3600000 und 2000 sowie `TIME_TO_DINT` für die Zykluszeit.',
        'IF Reset → Summe 0; ELSIF Pumpe läuft → Summe += Zykluszeit in ms. Danach Stunden = Summe / 3600000 und Wartungsflag setzen.',
        '```pascal\nIF i_xReset THEN\n    sdiSummeMs := 0;\nELSIF i_xPumpeLaeuft THEN\n    sdiSummeMs := sdiSummeMs + TIME_TO_DINT(i_tZykluszeit);\nEND_IF;\n```',
      ],
    },
  ],
}

export default chapter
