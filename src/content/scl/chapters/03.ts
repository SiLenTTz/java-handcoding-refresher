import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie lautet die vollständige IF-Syntax in SCL?',
      back: '```pascal\nIF bedingung THEN\n    ...\nELSIF andere THEN\n    ...\nELSE\n    ...\nEND_IF;\n```\n`ELSIF` ist **ein** Wort, `END_IF;` endet mit Semikolon.',
    },
    {
      id: 'f2',
      front: 'Warum bleibt `q_xAlarm` hier für immer TRUE?',
      back: '```pascal\nIF rDruck > 6.0 THEN\n    q_xAlarm := TRUE;\nEND_IF;\n```\nEs fehlt der Rücksetzzweig. Ausgänge behalten ihren Wert über Zyklen. Besser: `q_xAlarm := (rDruck > 6.0);`',
    },
    {
      id: 'f3',
      front: 'Welche Typen darf der CASE-Ausdruck haben?',
      back: 'Nur ganzzahlige Typen (`Int`, `DInt`, `Byte`, `Word`, `SInt`, …) oder Aufzählungstypen. **Nicht** `Real`, `String` oder `Bool`.',
    },
    {
      id: 'f4',
      front: 'Wie schreibt man Listen und Bereiche in CASE-Marken?',
      back: '```pascal\nCASE iCode OF\n    0:          ...   // Einzelwert\n    1, 2:       ...   // Liste\n    3..6:       ...   // Bereich\n    7, 10..12:  ...   // gemischt\n    ELSE        ...\nEND_CASE;\n```',
    },
    {
      id: 'f5',
      front: 'Warum ist der `ELSE`-Zweig in einem CASE praktisch Pflicht?',
      back: 'Bei einem unerwarteten Wert passiert sonst **gar nichts** – die Schrittkette bleibt stumm stehen. Im `ELSE` gehört: Grundstellung einnehmen und einen Störmerker setzen.',
    },
    {
      id: 'f6',
      front: 'Gibt es in SCL Fall-Through zwischen CASE-Zweigen?',
      back: 'Nein. Es wird genau **ein** Zweig ausgeführt, danach geht es hinter `END_CASE;` weiter. Ein `break` wie in C gibt es nicht und ist auch nicht nötig.',
    },
    {
      id: 'f7',
      front: 'Wie ersetzt man eine dreifach verschachtelte IF-Kaskade mit einer einzigen Bool-Zuweisung?',
      back: '```pascal\nq_xPumpe := xBereit AND NOT xStoerung AND (rNiveau > NIVEAU_MIN);\n```\nWenn am Ende nur eine boolesche Zuweisung steht, ist die Kaskade überflüssig.',
    },
    {
      id: 'f8',
      front: 'Was ist das Muster „Grundstellung zuerst“?',
      back: 'Alle betroffenen Ausgänge am Anfang auf `FALSE` setzen und danach nur die Ausnahme setzen. So kann kein Ausgang „hängenbleiben“, weil ein Rücksetzpfad vergessen wurde.',
    },
    {
      id: 'f9',
      front: 'Warum vergibt man Schrittnummern in Zehnerschritten?',
      back: 'Damit sich später Zwischenschritte (z. B. 15) einfügen lassen, ohne die ganze Kette umzunummerieren. Dazu gehören sprechende Konstanten: `SCHRITT_FUELLEN : Int := 10;`.',
    },
    {
      id: 'f10',
      front: 'In welcher Reihenfolge stehen Aktionen und Weiterschaltbedingung in einem Schritt?',
      back: 'Erst die **Aktionen** des Schritts, dann die **Weiterschaltbedingung**. Umgekehrt würde die Aktion noch einen Zyklus nachlaufen, obwohl schon weitergeschaltet wurde.',
    },
    {
      id: 'f11',
      front: 'Wann `CASE`, wann `IF`?',
      back: '`CASE`: **ein** ganzzahliger Ausdruck wird gegen viele Werte geprüft (Schritt, Betriebsart, Fehlercode). `IF`: verschiedene, voneinander unabhängige Bedingungen oder Vergleiche auf `Real`.',
    },
    {
      id: 'f12',
      front: 'Wann wird ein neu gesetzter Schritt bearbeitet?',
      back: 'Erst im **nächsten Zyklus**. Der laufende Zyklus verlässt das CASE nach dem aktuellen Zweig. Genau das macht Schrittketten deterministisch und entprellt die Weiterschaltung.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Warum lässt sich das nicht übersetzen?',
      code: `CASE rTemperatur OF
    20.0: q_xHeizung := TRUE;
    50.0: q_xHeizung := FALSE;
    ELSE  q_xStoerung := TRUE;
END_CASE;`,
      options: [
        'CASE braucht mindestens drei Zweige',
        'Der CASE-Ausdruck muss ganzzahlig sein – `Real` ist nicht erlaubt',
        '`ELSE` darf keine Anweisung enthalten',
        'Real-Literale brauchen ein `T#`-Präfix',
      ],
      correct: 1,
      explanation:
        'CASE arbeitet mit ganzzahligen Typen oder Aufzählungen. Für Gleitkomma-Schwellwerte nimmt man eine `IF/ELSIF`-Kaskade mit `<`/`>=`.',
    },
    {
      id: 'q2',
      prompt: 'Welchen Wert hat `q_xAlarm`, nachdem der Druck von 7.0 wieder auf 3.0 gefallen ist?',
      code: `IF rDruckIst > 6.0 THEN
    q_xAlarm := TRUE;
END_IF;`,
      options: [
        '`FALSE` – der Alarm wird automatisch zurückgenommen',
        '`TRUE` – es gibt keinen Rücksetzpfad',
        'Übersetzungsfehler, weil `ELSE` fehlt',
        'Abwechselnd `TRUE` und `FALSE`',
      ],
      correct: 1,
      explanation:
        'Ausgänge behalten ihren Wert über Zyklen hinweg. Ohne `ELSE` bzw. ohne Grundstellung bleibt der Alarm für immer stehen – der häufigste Anfängerfehler in der SPS.',
    },
    {
      id: 'q3',
      prompt: 'Warum lässt sich dieses CASE nicht übersetzen?',
      code: `CASE iFehlercode OF
    1..10:  q_sKlasse := 'Warnung';
    5:      q_sKlasse := 'Sonderfall';
    11..20: q_sKlasse := 'Stoerung';
    ELSE    q_sKlasse := 'Unbekannt';
END_CASE;`,
      options: [
        'Bereiche und Einzelwerte dürfen nicht gemischt werden',
        'Der Wert 5 ist bereits durch `1..10` abgedeckt – Marken dürfen sich nicht überlappen',
        'Strings sind in CASE-Zweigen nicht erlaubt',
        '`ELSE` muss als erster Zweig stehen',
      ],
      correct: 1,
      explanation:
        'Jede CASE-Marke darf nur einmal vorkommen. Überlappende Bereiche sind ein Übersetzungsfehler – anders als bei einer IF-Kaskade, wo einfach der erste Treffer gewinnt.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat `q_xMotorLinks` am Ende des Zyklus, wenn beide Tipptaster gedrückt sind?',
      code: `q_xMotorLinks  := FALSE;
q_xMotorRechts := FALSE;

IF i_xTippenLinks THEN
    q_xMotorLinks := TRUE;
ELSIF i_xTippenRechts THEN
    q_xMotorRechts := TRUE;
END_IF;`,
      options: [
        '`TRUE` – der erste zutreffende Zweig gewinnt, Rechts bleibt `FALSE`',
        '`FALSE` – bei zwei Tastern wird nichts gesetzt',
        'Beide werden `TRUE`',
        'Undefiniert',
      ],
      correct: 0,
      explanation:
        '`ELSIF` wird nur geprüft, wenn alle vorherigen Bedingungen `FALSE` waren. Die Kaskade schließt Links und Rechts also sauber gegeneinander aus – genau so verriegelt man Drehrichtungen.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`IF xBereit THEN IF NOT xStoerung THEN IF rNiveau > 10.0 THEN q_xPumpe := TRUE; END_IF; END_IF; END_IF;`',
        '`q_xPumpe := xBereit AND NOT xStoerung AND (rNiveau > 10.0);`',
        '`IF xBereit AND NOT xStoerung AND rNiveau > 10.0 THEN q_xPumpe := TRUE; END_IF;`',
        '`CASE xBereit OF TRUE: q_xPumpe := TRUE; END_CASE;`',
      ],
      correct: 1,
      explanation:
        'Das Ergebnis ist eine einzige boolesche Zuweisung – dafür braucht es kein IF. Variante 1 und 3 lassen die Pumpe zusätzlich hängen (kein Rücksetzpfad), Variante 4 ist mit `Bool` gar nicht übersetzbar.',
    },
    {
      id: 'q6',
      prompt: 'Welchen Wert hat `sSchritt` nach genau **einem** Zyklus, wenn `i_xStart = TRUE` und das Niveau sofort erreicht ist?',
      code: `CASE sSchritt OF
    0:
        IF i_xStart THEN
            sSchritt := 10;
        END_IF;
    10:
        q_xVentil := TRUE;
        IF i_rNiveau >= 100.0 THEN
            sSchritt := 20;
        END_IF;
    ELSE
        sSchritt := 0;
END_CASE;`,
      options: ['`0`', '`10`', '`20`', '`30`'],
      correct: 1,
      explanation:
        'Pro Zyklus wird genau **ein** CASE-Zweig abgearbeitet – es gibt kein Fall-Through. Schritt 10 kommt erst im nächsten Zyklus dran. Deshalb braucht eine Schrittkette pro Schritt mindestens einen Zyklus.',
    },
    {
      id: 'q7',
      prompt: 'Wo ist der Fehler in diesem Schritt?',
      code: `SCHRITT_FUELLEN:
    IF i_rNiveau >= NIVEAU_SOLL THEN
        sSchritt := SCHRITT_RUEHREN;
    END_IF;
    q_xVentilEin := TRUE;`,
      options: [
        'Die Weiterschaltbedingung steht vor der Aktion – das Ventil wird noch im Umschaltzyklus geöffnet',
        '`SCHRITT_FUELLEN` darf keine Konstante sein',
        'Es fehlt ein `END_CASE;`',
        'Kein Fehler – die Reihenfolge ist egal',
      ],
      correct: 0,
      explanation:
        'Weil SCL von oben nach unten abgearbeitet wird, setzt die letzte Zeile das Ventil auch dann noch auf TRUE, wenn gerade weitergeschaltet wurde. Konvention: erst Aktionen, dann Weiterschaltbedingung.',
    },
    {
      id: 'q8',
      prompt: 'Welchen Wert hat `q_sMeldung`, wenn `iBetriebsart = 8` ist?',
      code: `CASE iBetriebsart OF
    0:         q_sMeldung := 'Aus';
    1, 2:      q_sMeldung := 'Hand';
    3..6:      q_sMeldung := 'Automatik';
    7, 10..12: q_sMeldung := 'Service';
END_CASE;`,
      options: [
        "`'Service'`",
        "`'Unbekannt'`",
        'Den Wert aus dem vorherigen Zyklus – es gibt keinen `ELSE`-Zweig',
        'Leerstring',
      ],
      correct: 2,
      explanation:
        '8 liegt in keiner Marke, also wird kein Zweig ausgeführt und `q_sMeldung` bleibt unverändert. Genau deshalb gehört in jedes CASE ein `ELSE` mit definiertem Verhalten und Störmeldung.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Grenzwertüberwachung mit drei Stufen',
      level: 1,
      description: `Schreibe eine **FC** \`FC_Druckueberwachung\` ohne Rückgabewert (\`Void\`).

Schnittstelle:

- \`i_rDruckIst : Real\` – bar
- \`q_xWarnung : Bool\` (VAR_OUTPUT) – ab 5.0 bar
- \`q_xAlarm : Bool\` (VAR_OUTPUT) – ab 6.0 bar
- \`q_xAbschaltung : Bool\` (VAR_OUTPUT) – ab 7.0 bar
- \`q_iStufe : Int\` (VAR_OUTPUT) – 0 = ok, 1 = Warnung, 2 = Alarm, 3 = Abschaltung

Anforderungen:

- Grenzwerte als \`VAR CONSTANT\`
- die Ausgänge müssen sich **selbstständig zurücksetzen**, wenn der Druck wieder fällt
- \`IF/ELSIF/ELSE\`, höchster Grenzwert zuerst prüfen`,
      starter: `FUNCTION "FC_Druckueberwachung" : Void
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_rDruckIst : Real;                     // bar
END_VAR

VAR_OUTPUT
    q_xWarnung     : Bool;
    q_xAlarm       : Bool;
    q_xAbschaltung : Bool;
    q_iStufe       : Int;
END_VAR

VAR CONSTANT
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION`,
      solution: `FUNCTION "FC_Druckueberwachung" : Void
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_rDruckIst : Real;                     // bar
END_VAR

VAR_OUTPUT
    q_xWarnung     : Bool;
    q_xAlarm       : Bool;
    q_xAbschaltung : Bool;
    q_iStufe       : Int;                   // 0=ok 1=Warnung 2=Alarm 3=Abschaltung
END_VAR

VAR CONSTANT
    GRENZE_WARNUNG : Real := 5.0;           // bar
    GRENZE_ALARM   : Real := 6.0;           // bar
    GRENZE_ABSCHALT: Real := 7.0;           // bar
END_VAR

BEGIN
    // Grundstellung: alles aus. Danach nur die zutreffende Stufe setzen.
    q_xWarnung     := FALSE;
    q_xAlarm       := FALSE;
    q_xAbschaltung := FALSE;

    // Hoechsten Grenzwert zuerst pruefen, sonst gewinnt immer die Warnung.
    IF i_rDruckIst >= GRENZE_ABSCHALT THEN
        q_xAbschaltung := TRUE;
        q_xAlarm       := TRUE;
        q_xWarnung     := TRUE;
        q_iStufe       := 3;

    ELSIF i_rDruckIst >= GRENZE_ALARM THEN
        q_xAlarm   := TRUE;
        q_xWarnung := TRUE;
        q_iStufe   := 2;

    ELSIF i_rDruckIst >= GRENZE_WARNUNG THEN
        q_xWarnung := TRUE;
        q_iStufe   := 1;

    ELSE
        q_iStufe := 0;
    END_IF;
END_FUNCTION`,
      hints: [
        'Überlege, was passiert, wenn du den kleinsten Grenzwert zuerst prüfst – welcher Zweig gewinnt dann bei 8.0 bar?',
        'Du brauchst `IF/ELSIF/ELSE`, `>=` und Konstanten in `VAR CONSTANT`.',
        'Erst alle drei Bool-Ausgänge auf FALSE, dann von oben nach unten: Abschaltung → Alarm → Warnung → ELSE Stufe 0.',
        '```pascal\nq_xWarnung := FALSE; q_xAlarm := FALSE; q_xAbschaltung := FALSE;\nIF i_rDruckIst >= GRENZE_ABSCHALT THEN\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Betriebsartenumschaltung mit CASE',
      level: 2,
      description: `Schreibe einen **FB** \`FB_Betriebsart\`.

Schnittstelle:

- \`i_iBetriebsart : Int\` – 0 = Aus, 1 = Hand, 2 = Tippen, 3…6 = Automatik-Variante, 10…12 = Service
- \`i_xStoerung : Bool\`
- \`q_xMotorFreigabe : Bool\`
- \`q_xServiceAktiv : Bool\`
- \`q_sMeldung : String[20]\` – Klartext für das HMI
- \`q_xUngueltigeBetriebsart : Bool\`

Anforderungen:

- \`CASE\` mit Einzelwerten, Liste und Bereich
- \`ELSE\`-Zweig setzt Freigabe zurück, meldet \`'Ungueltig'\` und setzt \`q_xUngueltigeBetriebsart\`
- bei anstehender Störung ist die Motorfreigabe **immer** \`FALSE\`, unabhängig von der Betriebsart`,
      starter: `FUNCTION_BLOCK "FB_Betriebsart"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_iBetriebsart : Int;
    i_xStoerung    : Bool;
END_VAR

VAR_OUTPUT
    q_xMotorFreigabe        : Bool;
    q_xServiceAktiv         : Bool;
    q_sMeldung              : String[20];
    q_xUngueltigeBetriebsart: Bool;
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Betriebsart"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_iBetriebsart : Int;                   // 0=Aus 1=Hand 2=Tippen 3..6=Auto 10..12=Service
    i_xStoerung    : Bool;
END_VAR

VAR_OUTPUT
    q_xMotorFreigabe         : Bool;
    q_xServiceAktiv          : Bool;
    q_sMeldung               : String[20];
    q_xUngueltigeBetriebsart : Bool;
END_VAR

BEGIN
    // Grundstellung aller Ausgaenge - danach setzt jeder Zweig nur noch seine Ausnahme.
    q_xMotorFreigabe         := FALSE;
    q_xServiceAktiv          := FALSE;
    q_xUngueltigeBetriebsart := FALSE;

    CASE i_iBetriebsart OF
        0:
            q_sMeldung := 'Aus';

        1:
            q_xMotorFreigabe := TRUE;
            q_sMeldung       := 'Hand';

        2:
            q_xMotorFreigabe := TRUE;
            q_sMeldung       := 'Tippen';

        3..6:
            q_xMotorFreigabe := TRUE;
            q_sMeldung       := 'Automatik';

        10..12:
            q_xServiceAktiv := TRUE;
            q_sMeldung      := 'Service';

        ELSE
            q_sMeldung               := 'Ungueltig';
            q_xUngueltigeBetriebsart := TRUE;
    END_CASE;

    // Sicherheitsbedingung ueberschreibt JEDE Betriebsart - bewusst nach dem CASE.
    IF i_xStoerung THEN
        q_xMotorFreigabe := FALSE;
        q_sMeldung       := 'Stoerung';
    END_IF;
END_FUNCTION_BLOCK`,
      hints: [
        'Zwei Ebenen: Das CASE entscheidet die Betriebsart, die Störung ist eine übergeordnete Verriegelung.',
        '`CASE i_iBetriebsart OF` mit Marken `0:`, `1:`, `2:`, `3..6:`, `10..12:` und `ELSE`. Danach ein `IF` für die Störung.',
        'Zuerst Grundstellung aller Ausgänge, dann CASE, dann die Störungsverriegelung – so kann sie nichts übersehen.',
        '```pascal\nIF i_xStoerung THEN\n    q_xMotorFreigabe := FALSE;\n    q_sMeldung       := \'Stoerung\';\nEND_IF;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Ampelsteuerung als Schrittkette',
      level: 3,
      description: `Schreibe einen **FB** \`FB_Ampel\` als Schrittkette mit \`CASE\`.

Phasen (Deutschland): Rot → Rot/Gelb → Grün → Gelb → Rot

Schnittstelle:

- \`i_xFreigabe : Bool\` – FALSE schaltet auf Blinken Gelb (Grundstellung)
- \`i_xPhaseAbgelaufen : Bool\` – Zeitsignal, das den Schrittwechsel auslöst (Timer kommt in Kapitel 06)
- \`i_xBlinktakt : Bool\` – 1-Hz-Takt für Gelbblinken
- \`q_xRot\`, \`q_xGelb\`, \`q_xGruen : Bool\`
- \`q_iPhase : Int\` – aktuelle Schrittnummer für das HMI

Anforderungen:

- Schrittnummern als \`VAR CONSTANT\` in Zehnerschritten (0, 10, 20, 30, 40)
- statische Schrittvariable \`sSchritt\`
- pro Zweig: erst Lampen setzen, dann Weiterschaltbedingung
- \`ELSE\`-Zweig → Grundstellung
- Fehlt die Freigabe, blinkt Gelb und die Kette steht auf Schritt 0`,
      starter: `FUNCTION_BLOCK "FB_Ampel"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xFreigabe        : Bool;
    i_xPhaseAbgelaufen : Bool;
    i_xBlinktakt       : Bool;
END_VAR

VAR_OUTPUT
    q_xRot   : Bool;
    q_xGelb  : Bool;
    q_xGruen : Bool;
    q_iPhase : Int;
END_VAR

VAR
    sSchritt : Int := 0;
END_VAR

VAR CONSTANT
    // TODO: Schrittnummern
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Ampel"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xFreigabe        : Bool;              // FALSE = Anlage aus -> Gelbblinken
    i_xPhaseAbgelaufen : Bool;              // Timer-Ausgang der aktuellen Phase
    i_xBlinktakt       : Bool;              // 1 Hz Taktmerker
END_VAR

VAR_OUTPUT
    q_xRot   : Bool;
    q_xGelb  : Bool;
    q_xGruen : Bool;
    q_iPhase : Int;
END_VAR

VAR
    sSchritt : Int := 0;                    // aktuelle Phase, nicht remanent
END_VAR

VAR CONSTANT
    SCHRITT_GRUND   : Int := 0;             // Gelbblinken
    SCHRITT_ROT     : Int := 10;
    SCHRITT_ROTGELB : Int := 20;
    SCHRITT_GRUEN   : Int := 30;
    SCHRITT_GELB    : Int := 40;
END_VAR

BEGIN
    // Grundstellung aller Lampen - jeder Zweig schaltet nur noch ein, was er braucht.
    q_xRot   := FALSE;
    q_xGelb  := FALSE;
    q_xGruen := FALSE;

    // Fehlende Freigabe wirft die Kette jederzeit in die Grundstellung.
    IF NOT i_xFreigabe THEN
        sSchritt := SCHRITT_GRUND;
    END_IF;

    CASE sSchritt OF

        SCHRITT_GRUND:
            q_xGelb := i_xBlinktakt;        // Gelb blinkt im Takt
            IF i_xFreigabe THEN
                sSchritt := SCHRITT_ROT;
            END_IF;

        SCHRITT_ROT:
            q_xRot := TRUE;
            IF i_xPhaseAbgelaufen THEN
                sSchritt := SCHRITT_ROTGELB;
            END_IF;

        SCHRITT_ROTGELB:
            q_xRot  := TRUE;
            q_xGelb := TRUE;
            IF i_xPhaseAbgelaufen THEN
                sSchritt := SCHRITT_GRUEN;
            END_IF;

        SCHRITT_GRUEN:
            q_xGruen := TRUE;
            IF i_xPhaseAbgelaufen THEN
                sSchritt := SCHRITT_GELB;
            END_IF;

        SCHRITT_GELB:
            q_xGelb := TRUE;
            IF i_xPhaseAbgelaufen THEN
                sSchritt := SCHRITT_ROT;    // Zyklus schliesst sich
            END_IF;

        ELSE
            // Unerwartete Schrittnummer: definiert in die Grundstellung.
            sSchritt := SCHRITT_GRUND;
    END_CASE;

    q_iPhase := sSchritt;
END_FUNCTION_BLOCK`,
      hints: [
        'Die Freigabe ist keine Phase, sondern eine übergeordnete Bedingung – sie gehört vor das CASE.',
        'Du brauchst `VAR CONSTANT` für die Schrittnummern, eine statische `sSchritt` und `CASE sSchritt OF` mit `ELSE`.',
        'Grundstellung Lampen → IF NOT Freigabe → Schritt 0 → CASE mit 5 Zweigen (je Lampen setzen, dann `IF i_xPhaseAbgelaufen THEN sSchritt := …`) → `q_iPhase := sSchritt`.',
        '```pascal\nSCHRITT_ROTGELB:\n    q_xRot  := TRUE;\n    q_xGelb := TRUE;\n    IF i_xPhaseAbgelaufen THEN\n        sSchritt := SCHRITT_GRUEN;\n    END_IF;\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Behälterfüllung mit Störungsbehandlung',
      level: 4,
      description: `Schreibe einen **FB** \`FB_Behaelterfuellung\` als vollständige Schrittkette.

Ablauf: Grundstellung → Füllen → Rühren → Entleeren → zurück zur Grundstellung

Schnittstelle:

- \`i_xStart : Bool\`, \`i_xStopp : Bool\`, \`i_xQuittieren : Bool\`
- \`i_rNiveau : Real\` – 0.0 … 100.0 %
- \`i_xRuehrzeitAbgelaufen : Bool\`
- \`i_xMotorschutzOk : Bool\` – FALSE = Störung
- \`q_xVentilZulauf\`, \`q_xRuehrwerk\`, \`q_xVentilAblauf : Bool\`
- \`q_iSchritt : Int\`, \`q_xStoerung : Bool\`, \`q_sStatus : String[24]\`

Anforderungen:

- Schrittnummern als Konstanten in Zehnerschritten, zusätzlich ein \`SCHRITT_STOERUNG := 99\`
- Füllen bis 90 %, Entleeren bis unter 5 %
- Motorschutz-Störung bricht **aus jedem Schritt heraus** in den Störschritt ab
- Störschritt: alle Aktoren aus, Verlassen nur über \`i_xQuittieren\` **und** wieder gesundem Motorschutz
- \`i_xStopp\` führt aus jedem Schritt zurück in die Grundstellung
- \`ELSE\`-Zweig mit definierter Reaktion`,
      starter: `FUNCTION_BLOCK "FB_Behaelterfuellung"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xStart              : Bool;
    i_xStopp              : Bool;
    i_xQuittieren         : Bool;
    i_rNiveau             : Real;           // %
    i_xRuehrzeitAbgelaufen: Bool;
    i_xMotorschutzOk      : Bool;
END_VAR

VAR_OUTPUT
    q_xVentilZulauf : Bool;
    q_xRuehrwerk    : Bool;
    q_xVentilAblauf : Bool;
    q_iSchritt      : Int;
    q_xStoerung     : Bool;
    q_sStatus       : String[24];
END_VAR

VAR
    sSchritt : Int := 0;
END_VAR

VAR CONSTANT
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Behaelterfuellung"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xStart               : Bool;
    i_xStopp               : Bool;
    i_xQuittieren          : Bool;
    i_rNiveau              : Real;          // %
    i_xRuehrzeitAbgelaufen : Bool;          // Timer-Ausgang Ruehrphase
    i_xMotorschutzOk       : Bool;          // FALSE = Motorschutzschalter gefallen
END_VAR

VAR_OUTPUT
    q_xVentilZulauf : Bool;
    q_xRuehrwerk    : Bool;
    q_xVentilAblauf : Bool;
    q_iSchritt      : Int;
    q_xStoerung     : Bool;
    q_sStatus       : String[24];
END_VAR

VAR
    sSchritt : Int := 0;
END_VAR

VAR CONSTANT
    SCHRITT_GRUND     : Int  := 0;
    SCHRITT_FUELLEN   : Int  := 10;
    SCHRITT_RUEHREN   : Int  := 20;
    SCHRITT_ENTLEEREN : Int  := 30;
    SCHRITT_STOERUNG  : Int  := 99;
    NIVEAU_VOLL       : Real := 90.0;       // %
    NIVEAU_LEER       : Real := 5.0;        // %
END_VAR

BEGIN
    // 1) Grundstellung aller Aktoren. Jeder Zweig setzt nur, was er wirklich braucht.
    q_xVentilZulauf := FALSE;
    q_xRuehrwerk    := FALSE;
    q_xVentilAblauf := FALSE;

    // 2) Uebergeordnete Abbruchbedingungen VOR dem CASE - gelten aus jedem Schritt.
    IF NOT i_xMotorschutzOk THEN
        sSchritt := SCHRITT_STOERUNG;
    ELSIF i_xStopp AND (sSchritt <> SCHRITT_STOERUNG) THEN
        sSchritt := SCHRITT_GRUND;
    END_IF;

    // 3) Eigentliche Kette.
    CASE sSchritt OF

        SCHRITT_GRUND:
            q_sStatus   := 'Grundstellung';
            q_xStoerung := FALSE;
            IF i_xStart THEN
                sSchritt := SCHRITT_FUELLEN;
            END_IF;

        SCHRITT_FUELLEN:
            q_xVentilZulauf := TRUE;
            q_sStatus       := 'Fuellen';
            IF i_rNiveau >= NIVEAU_VOLL THEN
                sSchritt := SCHRITT_RUEHREN;
            END_IF;

        SCHRITT_RUEHREN:
            q_xRuehrwerk := TRUE;
            q_sStatus    := 'Ruehren';
            IF i_xRuehrzeitAbgelaufen THEN
                sSchritt := SCHRITT_ENTLEEREN;
            END_IF;

        SCHRITT_ENTLEEREN:
            q_xVentilAblauf := TRUE;
            q_sStatus       := 'Entleeren';
            IF i_rNiveau <= NIVEAU_LEER THEN
                sSchritt := SCHRITT_GRUND;
            END_IF;

        SCHRITT_STOERUNG:
            // Alle Aktoren bleiben durch die Grundstellung oben aus.
            q_xStoerung := TRUE;
            q_sStatus   := 'Stoerung Motorschutz';
            IF i_xQuittieren AND i_xMotorschutzOk THEN
                q_xStoerung := FALSE;
                sSchritt    := SCHRITT_GRUND;
            END_IF;

        ELSE
            // Unerwartete Schrittnummer ist selbst eine Stoerung.
            q_sStatus := 'Ungueltiger Schritt';
            sSchritt  := SCHRITT_STOERUNG;
    END_CASE;

    q_iSchritt := sSchritt;
END_FUNCTION_BLOCK`,
      hints: [
        'Trenne drei Ebenen: Grundstellung der Aktoren, übergeordnete Abbruchbedingungen, eigentliche Schrittkette.',
        'Abbruchbedingungen gehören als `IF/ELSIF` **vor** das CASE – nur so wirken sie aus jedem Schritt heraus.',
        'Aktoren FALSE → IF NOT Motorschutz → Schritt 99, ELSIF Stopp → Schritt 0 → CASE mit 0/10/20/30/99/ELSE → `q_iSchritt := sSchritt`.',
        '```pascal\nSCHRITT_STOERUNG:\n    q_xStoerung := TRUE;\n    IF i_xQuittieren AND i_xMotorschutzOk THEN\n        q_xStoerung := FALSE;\n        sSchritt    := SCHRITT_GRUND;\n    END_IF;\n```',
      ],
    },
  ],
}

export default chapter
