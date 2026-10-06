import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '06',
  flashcards: [
    {
      id: 'f1',
      front: 'Wie deklariert man ein- und mehrdimensionale Arrays?',
      back: '```pascal\naZonen  : ARRAY[1..8] OF Real;\naBits   : ARRAY[0..15] OF Bool;\naMatrix : ARRAY[1..3, 1..4] OF Int;\naInit   : ARRAY[1..4] OF Int := [10, 20, 30, 40];\naNullen : ARRAY[1..100] OF Int := [100(0)];\n```',
    },
    {
      id: 'f2',
      front: 'Wann STRUCT, wann ARRAY?',
      back: '`ARRAY` für **gleichartige** Dinge, die über einen Index erreichbar sind (8 Temperaturzonen). `STRUCT` für **verschiedene** Dinge, die zusammengehören (Auftragsnummer + Menge + Kunde).',
    },
    {
      id: 'f3',
      front: 'Was ist ein UDT und warum lohnt er sich?',
      back: 'Ein PLC-Datentyp: ein benanntes `STRUCT`, das projektweit verwendbar ist. Vorteil: Eine Schnittstelle mit 15 Einzelparametern wird zu einem Parameter – und Änderungen gelten überall.',
    },
    {
      id: 'f4',
      front: 'Unterschied TON, TOF und TP?',
      back: '`TON`: `IN` TRUE → `Q` **nach** `PT` TRUE (Einschaltverzögerung). `TOF`: `IN` fällt → `Q` bleibt noch `PT` lang TRUE (Nachlauf). `TP`: Flanke an `IN` → `Q` genau `PT` lang TRUE, nicht retriggerbar.',
    },
    {
      id: 'f5',
      front: 'Wie ruft man einen IEC-Timer auf und wertet ihn aus?',
      back: '```pascal\nsTimerNachlauf(IN := i_xMotor, PT := T#2m);\nq_xLuefter  := sTimerNachlauf.Q;\nq_tAbgelaufen := sTimerNachlauf.ET;\n```\nErst aufrufen, dann `Q`/`ET` lesen.',
    },
    {
      id: 'f6',
      front: 'Warum darf eine Timer-Instanz nur einmal pro Zyklus aufgerufen werden?',
      back: 'Jeder Aufruf überschreibt `IN` und `PT` in der Instanz. Zwei Aufrufe derselben Instanz mit unterschiedlichen Werten ergeben ein unvorhersagbares Timerverhalten. Pro Zeitfunktion eine eigene Instanz.',
    },
    {
      id: 'f7',
      front: 'Welche Ein- und Ausgänge hat ein `CTU`?',
      back: 'Eingänge: `CU` (Zählimpuls, flankengesteuert), `R` (Reset), `PV` (Vorwahlwert). Ausgänge: `QU` (TRUE bei `CV >= PV`) und `CV` (aktueller Stand).',
    },
    {
      id: 'f8',
      front: 'Muss man das Signal an `CU` eines CTU selbst flankenauswerten?',
      back: 'Nein. Die IEC-Zähler werten die steigende Flanke an `CU`/`CD` **selbst** aus. Ein zusätzlicher `R_TRIG` davor führt zu doppelter Auswertung und verlorenen Impulsen.',
    },
    {
      id: 'f9',
      front: 'Wie baut man eine steigende Flanke ohne `R_TRIG`?',
      back: '```pascal\ntxFlanke    := i_xTaster AND NOT sxTasterAlt;\nsxTasterAlt := i_xTaster;    // IMMER nachfuehren\n```\n`sxTasterAlt` muss **statisch** sein, sonst gibt es keine Flanke.',
    },
    {
      id: 'f10',
      front: 'Was ist der häufigste Fehler bei manueller Flankenauswertung?',
      back: 'Das Nachführen des Altwerts vergessen. Dann ist die Bedingung in **jedem** Zyklus wahr und der Zähler läuft mit Zykluszeit hoch statt pro Tastendruck.',
    },
    {
      id: 'f11',
      front: 'Wie schreibt man TIME-Literale?',
      back: '`T#500ms`, `T#5s`, `T#1m30s`, `T#2h15m`, `T#1d_2h_30m_15s_500ms`. Time-Arithmetik ist erlaubt (`tA + tB`, `tA / 2`), Umrechnung über `TIME_TO_DINT` in Millisekunden.',
    },
    {
      id: 'f12',
      front: 'Warum ist `PT := T#10ms` bei 100 ms Zykluszeit sinnlos?',
      back: 'Der Timer läuft zwar unabhängig vom Zyklus, aber `Q` wird erst beim nächsten Bausteinaufruf **ausgewertet**. Die effektive Auflösung ist die Zykluszeit – für kürzere Zeiten braucht es einen Weckalarm-OB.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wo ist der Fehler?',
      code: `VAR
    aZonen : ARRAY[1..8] OF Real;
END_VAR

BEGIN
    aZonen[i_iZoneNummer] := i_rSollwert;
END_FUNCTION_BLOCK`,
      options: [
        'Arrays dürfen nicht mit variablem Index angesprochen werden',
        '`i_iZoneNummer` wird nicht auf 1 … 8 geprüft – bei 0 oder 99 gibt es einen Zugriffsfehler',
        'Der Array-Typ muss `Int` sein',
        'Kein Fehler',
      ],
      correct: 1,
      explanation:
        'Ein Index aus der Prozessperipherie oder vom HMI ist nie vertrauenswürdig. Sauber: `aZonen[LIMIT(MN := 1, IN := i_iZoneNummer, MX := 8)] := …;` oder vorher mit `IF` prüfen.',
    },
    {
      id: 'q2',
      prompt: 'Welchen Wert hat `q_xLuefter` 30 Sekunden nachdem der Motor abgeschaltet wurde?',
      code: `sTimer(IN := i_xMotorLaeuft, PT := T#2m);
q_xLuefter := sTimer.Q;

// sTimer ist vom Typ TOF`,
      options: [
        '`FALSE` – der Lüfter geht mit dem Motor aus',
        '`TRUE` – TOF hält `Q` noch 2 Minuten nach dem Abschalten',
        '`TRUE` – aber erst 2 Minuten nach dem Einschalten',
        'Der Timer läuft nicht, weil `IN` FALSE ist',
      ],
      correct: 1,
      explanation:
        '`TOF` ist die Ausschaltverzögerung: `Q` kommt sofort mit `IN` und fällt erst `PT` nach dem Abfallen von `IN`. Genau das Muster für Motornachlauf und Lüfter.',
    },
    {
      id: 'q3',
      prompt: 'Warum zählt `sdiZaehler` zehnmal pro Sekunde statt einmal pro Tastendruck?',
      code: `VAR
    sxTasterAlt : Bool;
    sdiZaehler  : DInt;
END_VAR

BEGIN
    IF i_xTaster AND NOT sxTasterAlt THEN
        sdiZaehler := sdiZaehler + 1;
    END_IF;
END_FUNCTION_BLOCK`,
      options: [
        '`sxTasterAlt` wird nie nachgeführt – die Bedingung bleibt dauerhaft wahr',
        '`sdiZaehler` muss `Int` sein',
        'Die Flanke muss mit `OR` gebildet werden',
        '`sxTasterAlt` müsste `VAR_TEMP` sein',
      ],
      correct: 0,
      explanation:
        'Ohne `sxTasterAlt := i_xTaster;` am Ende bleibt der Altwert FALSE, die Bedingung ist in jedem Zyklus erfüllt und der Zähler läuft mit Zykluszeit hoch (bei 100 ms also zehnmal pro Sekunde).',
    },
    {
      id: 'q4',
      prompt: 'Warum funktioniert dieser Code nicht wie gedacht?',
      code: `sTimer(IN := i_xStartA, PT := T#5s);
sTimer(IN := i_xStartB, PT := T#2s);

IF sTimer.Q THEN
    q_xFertig := TRUE;
END_IF;`,
      options: [
        'Timer dürfen nur im OB aufgerufen werden',
        'Dieselbe Instanz wird zweimal pro Zyklus aufgerufen – der zweite Aufruf überschreibt `IN` und `PT`',
        '`PT` darf nicht als Literal angegeben werden',
        '`Q` muss vor dem Aufruf gelesen werden',
      ],
      correct: 1,
      explanation:
        'Eine Timer-Instanz hat genau einen Zustand. Für zwei unabhängige Zeiten braucht es zwei Instanzen (z. B. `sTimerA : TON;` und `sTimerB : TON;`).',
    },
    {
      id: 'q5',
      prompt: 'Welchen Wert hat `sZaehler.CV` nach 5 Tastendrücken, wenn `PV := 100`?',
      code: `sZaehler(CU := i_xTeilErkannt,
         R  := FALSE,
         PV := 100);
q_iStueck := sZaehler.CV;

// sZaehler ist vom Typ CTU`,
      options: ['`100`', '`5`', '`0`', 'So viele Zyklen, wie der Taster gedrückt war'],
      correct: 1,
      explanation:
        '`CTU` wertet die steigende Flanke an `CU` selbst aus und zählt pro Flanke genau einen Schritt. `PV` ist nur der Vergleichswert für `QU`, nicht die Obergrenze des Zählens.',
    },
    {
      id: 'q6',
      prompt: 'Welche Variante ist sauber?',
      options: [
        '`VAR_INPUT i_aAuftraege : ARRAY[1..100] OF "UDT_Auftrag"; END_VAR`',
        '`VAR_IN_OUT io_aAuftraege : ARRAY[1..100] OF "UDT_Auftrag"; END_VAR`',
        '`VAR_INPUT i_iNummer : Int; i_rMenge : Real; i_sKunde : String[20]; i_xAktiv : Bool; END_VAR` je Auftrag',
        '`VAR_TEMP t_aAuftraege : ARRAY[1..100] OF "UDT_Auftrag"; END_VAR`',
      ],
      correct: 1,
      explanation:
        '`VAR_IN_OUT` übergibt eine Referenz – keine Kopie von 100 Strukturen pro Aufruf. Variante 1 kostet Zykluszeit, Variante 3 bläht die Schnittstelle auf, Variante 4 sprengt den Lokaldatenstack.',
    },
    {
      id: 'q7',
      prompt: 'Wo ist der Fehler?',
      code: `sFlanke(CLK := i_xTeilErkannt);
sZaehler(CU := sFlanke.Q, PV := 100);

// sFlanke : R_TRIG;  sZaehler : CTU;`,
      options: [
        '`R_TRIG` braucht keinen `CLK`-Parameter',
        'Doppelte Flankenauswertung – `CTU` wertet die Flanke an `CU` bereits selbst aus',
        '`CTU` braucht zwingend einen `R`-Parameter',
        'Kein Fehler, das ist die empfohlene Variante',
      ],
      correct: 1,
      explanation:
        '`sFlanke.Q` ist nur einen Zyklus lang TRUE – der CTU sieht davon zwar eine Flanke, aber die Kette ist überflüssig und täuscht eine Notwendigkeit vor, die es nicht gibt. Direkt `CU := i_xTeilErkannt` verdrahten.',
    },
    {
      id: 'q8',
      prompt: 'Was passiert, wenn während des laufenden Impulses eine neue Flanke an `IN` kommt?',
      code: `sImpuls(IN := i_xAnlaufwarnung, PT := T#3s);
q_xHupe := sImpuls.Q;

// sImpuls ist vom Typ TP`,
      options: [
        'Der Impuls wird auf 3 s neu gestartet (retriggerbar)',
        'Der Impuls wird ignoriert – `TP` ist nicht retriggerbar, `Q` bleibt genau 3 s TRUE',
        'Der Impuls bricht sofort ab',
        'Der Impuls verlängert sich auf 6 s',
      ],
      correct: 1,
      explanation:
        '`TP` erzeugt pro erkannter Flanke genau einen Impuls fester Länge. Flanken während des laufenden Impulses wirken nicht – ideal für Anlaufwarnungen und Hupen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Temperaturzonen auswerten',
      level: 1,
      description: `Schreibe einen **FB** \`FB_Ofenzonen\`, der 8 Temperaturzonen überwacht.

Schnittstelle:

- \`io_aTemperaturen : ARRAY[1..8] OF Real\` (\`VAR_IN_OUT\`)
- \`i_rGrenzeMax : Real\`
- \`q_rMaxWert : Real\`, \`q_iMaxZone : Int\`
- \`q_rMittelwert : Real\`
- \`q_xUebertemperatur : Bool\`

Anforderungen:

- eine \`FOR\`-Schleife, die Summe und Maximum **gemeinsam** ermittelt
- Array-Grenzen als \`VAR CONSTANT\`
- \`q_xUebertemperatur\` ist TRUE, sobald eine Zone die Grenze überschreitet`,
      starter: `FUNCTION_BLOCK "FB_Ofenzonen"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aTemperaturen : ARRAY[1..8] OF Real;
END_VAR

VAR_INPUT
    i_rGrenzeMax : Real := 250.0;           // Grad C
END_VAR

VAR_OUTPUT
    q_rMaxWert         : Real;
    q_iMaxZone         : Int;
    q_rMittelwert      : Real;
    q_xUebertemperatur : Bool;
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Ofenzonen"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aTemperaturen : ARRAY[1..8] OF Real; // Grad C je Zone
END_VAR

VAR_INPUT
    i_rGrenzeMax : Real := 250.0;           // Grad C
END_VAR

VAR_OUTPUT
    q_rMaxWert         : Real;
    q_iMaxZone         : Int;
    q_rMittelwert      : Real;
    q_xUebertemperatur : Bool;
END_VAR

VAR CONSTANT
    ZONE_MIN : Int := 1;
    ZONE_MAX : Int := 8;
END_VAR

VAR_TEMP
    tiZone  : Int;
    trSumme : Real;
END_VAR

BEGIN
    // Startwerte: erste Zone als Maximum, Summe auf 0.
    trSumme    := 0.0;
    q_rMaxWert := io_aTemperaturen[ZONE_MIN];
    q_iMaxZone := ZONE_MIN;

    FOR tiZone := ZONE_MIN TO ZONE_MAX DO
        trSumme := trSumme + io_aTemperaturen[tiZone];

        IF io_aTemperaturen[tiZone] > q_rMaxWert THEN
            q_rMaxWert := io_aTemperaturen[tiZone];
            q_iMaxZone := tiZone;
        END_IF;
    END_FOR;

    q_rMittelwert      := trSumme / INT_TO_REAL(ZONE_MAX - ZONE_MIN + 1);
    q_xUebertemperatur := (q_rMaxWert > i_rGrenzeMax);
END_FUNCTION_BLOCK`,
      hints: [
        'Summe und Maximum lassen sich in einem Durchlauf bestimmen – überlege, womit beide starten.',
        'Du brauchst eine `FOR`-Schleife, eine `VAR_TEMP`-Summe und einen Vergleich mit `>`.',
        'Summe 0.0, Max = Zone 1 → FOR 1..8: aufsummieren und bei größerem Wert Max + Zonennummer merken → danach Mittelwert und Übertemperatur-Flag.',
        '```pascal\nIF io_aTemperaturen[tiZone] > q_rMaxWert THEN\n    q_rMaxWert := io_aTemperaturen[tiZone];\n    q_iMaxZone := tiZone;\nEND_IF;\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Pumpensteuerung mit Nachlauf und Anlaufwarnung',
      level: 2,
      description: `Schreibe einen **FB** \`FB_Pumpe\` mit drei IEC-Timern als Multiinstanzen.

Schnittstelle:

- \`i_xAnforderung : Bool\` – Pumpe soll laufen
- \`i_xTrockenlauf : Bool\` – Sensor meldet zu wenig Medium
- \`i_tAnlaufwarnung : Time := T#3s\`
- \`i_tNachlauf : Time := T#30s\`
- \`i_tStoerVerzoegerung : Time := T#2s\`
- \`q_xPumpe : Bool\`, \`q_xHupe : Bool\`, \`q_xStoerung : Bool\`, \`q_tRestNachlauf : Time\`

Anforderungen:

- \`TP\` für die Hupe: genau \`i_tAnlaufwarnung\` lang bei Anforderung
- \`TOF\` für den Nachlauf: Pumpe läuft nach wegfallender Anforderung noch weiter
- \`TON\` für die Störverzögerung: Trockenlauf erst melden, wenn er \`i_tStoerVerzoegerung\` ansteht
- Störung schaltet die Pumpe sofort ab – auch im Nachlauf
- \`q_tRestNachlauf\` = \`PT − ET\` des Nachlauf-Timers`,
      starter: `FUNCTION_BLOCK "FB_Pumpe"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xAnforderung       : Bool;
    i_xTrockenlauf       : Bool;
    i_tAnlaufwarnung     : Time := T#3s;
    i_tNachlauf          : Time := T#30s;
    i_tStoerVerzoegerung : Time := T#2s;
END_VAR

VAR_OUTPUT
    q_xPumpe        : Bool;
    q_xHupe         : Bool;
    q_xStoerung     : Bool;
    q_tRestNachlauf : Time;
END_VAR

VAR
    // TODO: drei Timer-Instanzen
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Pumpe"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xAnforderung       : Bool;            // Pumpe soll laufen
    i_xTrockenlauf       : Bool;            // Sensor Trockenlaufschutz
    i_tAnlaufwarnung     : Time := T#3s;
    i_tNachlauf          : Time := T#30s;
    i_tStoerVerzoegerung : Time := T#2s;
END_VAR

VAR_OUTPUT
    q_xPumpe        : Bool;
    q_xHupe         : Bool;
    q_xStoerung     : Bool;
    q_tRestNachlauf : Time;
END_VAR

VAR
    sTimerHupe     : TP;                    // Impuls, nicht retriggerbar
    sTimerNachlauf : TOF;                   // Ausschaltverzoegerung
    sTimerStoerung : TON;                   // Einschaltverzoegerung = Entprellung
END_VAR

BEGIN
    // --- Stoerung erst nach Verzoegerung melden (Signalrauschen ausblenden) ---
    sTimerStoerung(IN := i_xTrockenlauf, PT := i_tStoerVerzoegerung);
    q_xStoerung := sTimerStoerung.Q;

    // --- Anlaufwarnung: fester Impuls bei Anforderung ---
    sTimerHupe(IN := i_xAnforderung, PT := i_tAnlaufwarnung);
    q_xHupe := sTimerHupe.Q;

    // --- Nachlauf: Q kommt sofort, faellt erst PT nach der Anforderung ---
    sTimerNachlauf(IN := i_xAnforderung, PT := i_tNachlauf);

    // Stoerung hat Vorrang und beendet auch den Nachlauf.
    q_xPumpe := sTimerNachlauf.Q AND NOT q_xStoerung;

    q_tRestNachlauf := sTimerNachlauf.PT - sTimerNachlauf.ET;
END_FUNCTION_BLOCK`,
      hints: [
        'Ordne jedem Verhalten den passenden Timertyp zu: fester Impuls, verzögertes Abschalten, verzögertes Melden.',
        'Du brauchst `TP`, `TOF` und `TON` als Multiinstanzen in `VAR`, jeweils einmal pro Zyklus aufgerufen.',
        'Störtimer aufrufen und `Q` als Störung übernehmen → Hupentimer aufrufen → Nachlauftimer aufrufen → Pumpe = Nachlauf.Q AND NOT Störung → Restzeit = PT − ET.',
        '```pascal\nsTimerNachlauf(IN := i_xAnforderung, PT := i_tNachlauf);\nq_xPumpe := sTimerNachlauf.Q AND NOT q_xStoerung;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Auftragsverwaltung mit ARRAY OF UDT',
      level: 3,
      description: `Ein Global-DB hält 20 Fertigungsaufträge als \`ARRAY[1..20] OF "UDT_Auftrag"\`.

Schreibe einen **FB** \`FB_Auftragsverwaltung\`:

- \`io_aAuftraege : ARRAY[1..20] OF "UDT_Auftrag"\` (\`VAR_IN_OUT\`)
- \`i_xNaechstenHolen : Bool\` – flankenausgewertet übergeben
- \`i_xFertigmelden : Bool\` – flankenausgewertet übergeben
- \`q_stAktuell : "UDT_Auftrag"\` – aktuell bearbeiteter Auftrag
- \`q_iAktuellerIndex : Int\` – 0, wenn keiner aktiv
- \`q_iOffeneAuftraege : Int\`
- \`q_rOffeneMenge : Real\`
- \`q_xKeinAuftragFrei : Bool\`

Anforderungen:

- „Nächsten holen“ sucht den ersten Auftrag mit \`xAktiv = TRUE\` und \`xFertig = FALSE\` und merkt sich dessen Index **statisch**
- „Fertigmelden“ setzt \`xFertig := TRUE\` beim aktuellen Index und gibt den Platz frei
- offene Aufträge und offene Restmenge werden **jeden** Zyklus neu gezählt
- kein Array-Zugriff mit Index 0`,
      given: `TYPE "UDT_Auftrag"
VERSION : 0.1
STRUCT
    iNummer : Int;          // Auftragsnummer
    rMenge  : Real;         // Sollmenge
    sKunde  : String[20];
    xAktiv  : Bool;         // Platz belegt
    xFertig : Bool;         // abgearbeitet
END_STRUCT;
END_TYPE`,
      starter: `FUNCTION_BLOCK "FB_Auftragsverwaltung"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aAuftraege : ARRAY[1..20] OF "UDT_Auftrag";
END_VAR

VAR_INPUT
    i_xNaechstenHolen : Bool;
    i_xFertigmelden   : Bool;
END_VAR

VAR_OUTPUT
    q_stAktuell        : "UDT_Auftrag";
    q_iAktuellerIndex  : Int;
    q_iOffeneAuftraege : Int;
    q_rOffeneMenge     : Real;
    q_xKeinAuftragFrei : Bool;
END_VAR

VAR
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Auftragsverwaltung"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_IN_OUT
    io_aAuftraege : ARRAY[1..20] OF "UDT_Auftrag";
END_VAR

VAR_INPUT
    i_xNaechstenHolen : Bool;               // bereits flankenausgewertet
    i_xFertigmelden   : Bool;               // bereits flankenausgewertet
END_VAR

VAR_OUTPUT
    q_stAktuell        : "UDT_Auftrag";
    q_iAktuellerIndex  : Int;               // 0 = kein Auftrag aktiv
    q_iOffeneAuftraege : Int;
    q_rOffeneMenge     : Real;
    q_xKeinAuftragFrei : Bool;
END_VAR

VAR
    siAktuellerIndex : Int := 0;            // Gedaechtnis ueber Zyklen
END_VAR

VAR CONSTANT
    IDX_MIN     : Int := 1;
    IDX_MAX     : Int := 20;
    KEIN_INDEX  : Int := 0;
END_VAR

VAR_TEMP
    tiIndex  : Int;
    tiAnzahl : Int;
    trMenge  : Real;
END_VAR

BEGIN
    // --- Fertigmeldung zuerst: der Platz wird frei, bevor neu gesucht wird ---
    IF i_xFertigmelden AND (siAktuellerIndex >= IDX_MIN) THEN
        io_aAuftraege[siAktuellerIndex].xFertig := TRUE;
        siAktuellerIndex := KEIN_INDEX;
    END_IF;

    // --- Naechsten offenen Auftrag suchen ---
    IF i_xNaechstenHolen THEN
        siAktuellerIndex   := KEIN_INDEX;
        q_xKeinAuftragFrei := TRUE;

        FOR tiIndex := IDX_MIN TO IDX_MAX DO
            IF io_aAuftraege[tiIndex].xAktiv AND NOT io_aAuftraege[tiIndex].xFertig THEN
                siAktuellerIndex   := tiIndex;
                q_xKeinAuftragFrei := FALSE;
                EXIT;                       // erster Treffer genuegt
            END_IF;
        END_FOR;
    END_IF;

    // --- Aktuellen Auftrag ausgeben, Index 0 sauber abfangen ---
    IF siAktuellerIndex >= IDX_MIN THEN
        q_stAktuell := io_aAuftraege[siAktuellerIndex];   // ganze Struktur kopieren
    END_IF;
    q_iAktuellerIndex := siAktuellerIndex;

    // --- Bestand jeden Zyklus neu ermitteln ---
    tiAnzahl := 0;
    trMenge  := 0.0;
    FOR tiIndex := IDX_MIN TO IDX_MAX DO
        IF io_aAuftraege[tiIndex].xAktiv AND NOT io_aAuftraege[tiIndex].xFertig THEN
            tiAnzahl := tiAnzahl + 1;
            trMenge  := trMenge + io_aAuftraege[tiIndex].rMenge;
        END_IF;
    END_FOR;

    q_iOffeneAuftraege := tiAnzahl;
    q_rOffeneMenge     := trMenge;
END_FUNCTION_BLOCK`,
      hints: [
        'Der aktuelle Index ist das einzige echte Gedächtnis – alles andere lässt sich jederzeit aus dem Array neu berechnen.',
        'Du brauchst `VAR` für den Index, `EXIT` in der Suchschleife, Strukturzugriff mit Punkt und eine Strukturzuweisung `q_stAktuell := io_aAuftraege[i];`.',
        'Erst Fertigmeldung verarbeiten → dann bei „holen“ die Suchschleife mit EXIT → dann aktuellen Auftrag ausgeben (nur bei Index >= 1) → zum Schluss Bestandsschleife über alle 20 Plätze.',
        '```pascal\nIF io_aAuftraege[tiIndex].xAktiv AND NOT io_aAuftraege[tiIndex].xFertig THEN\n    siAktuellerIndex := tiIndex;\n    EXIT;\nEND_IF;\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Palettierstation mit Zähler, Timern und Flanken',
      level: 4,
      description: `Schreibe einen **FB** \`FB_Palettierstation\`, der eine komplette Station abbildet.

Schnittstelle:

- \`i_xLichtschranke : Bool\` – ein Teil passiert (roh, **nicht** entprellt)
- \`i_xPalettenwechselFertig : Bool\`
- \`i_xStart : Bool\`, \`i_xStopp : Bool\`
- \`i_iTeileProPalette : Int := 100\`
- \`i_tEntprellung : Time := T#50ms\`
- \`i_tWechselWarnung : Time := T#5s\`
- \`q_xBandLaeuft : Bool\`, \`q_xWechselAnfordern : Bool\`, \`q_xWarnhupe : Bool\`
- \`q_iTeileAktuell : Int\`, \`q_diTeileGesamt : DInt\`, \`q_iPalettenGesamt : Int\`
- \`q_sStatus : String[24]\`

Anforderungen:

- Lichtschranke mit \`TON\` entprellen, danach mit \`R_TRIG\` flankenauswerten
- \`CTU\` zählt die Teile der aktuellen Palette (\`PV := i_iTeileProPalette\`)
- bei \`QU\`: Band anhalten, \`q_xWechselAnfordern\` setzen, \`TP\`-Warnhupe auslösen
- \`i_xPalettenwechselFertig\` setzt den Zähler zurück, erhöht \`q_iPalettenGesamt\` und startet das Band wieder
- \`q_diTeileGesamt\` zählt über alle Paletten hinweg (statisch, remanent gedacht)
- \`i_xStopp\` hält das Band jederzeit an
- alle Instanzen als Multiinstanz, jede genau einmal pro Zyklus aufgerufen`,
      starter: `FUNCTION_BLOCK "FB_Palettierstation"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xLichtschranke         : Bool;
    i_xPalettenwechselFertig : Bool;
    i_xStart                 : Bool;
    i_xStopp                 : Bool;
    i_iTeileProPalette       : Int  := 100;
    i_tEntprellung           : Time := T#50ms;
    i_tWechselWarnung        : Time := T#5s;
END_VAR

VAR_OUTPUT
    q_xBandLaeuft       : Bool;
    q_xWechselAnfordern : Bool;
    q_xWarnhupe         : Bool;
    q_iTeileAktuell     : Int;
    q_diTeileGesamt     : DInt;
    q_iPalettenGesamt   : Int;
    q_sStatus           : String[24];
END_VAR

VAR
    // TODO: Timer, Flanken, Zaehler, Zustand
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Palettierstation"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xLichtschranke         : Bool;        // roh, prellt
    i_xPalettenwechselFertig : Bool;
    i_xStart                 : Bool;
    i_xStopp                 : Bool;
    i_iTeileProPalette       : Int  := 100;
    i_tEntprellung           : Time := T#50ms;
    i_tWechselWarnung        : Time := T#5s;
END_VAR

VAR_OUTPUT
    q_xBandLaeuft       : Bool;
    q_xWechselAnfordern : Bool;
    q_xWarnhupe         : Bool;
    q_iTeileAktuell     : Int;
    q_diTeileGesamt     : DInt;
    q_iPalettenGesamt   : Int;
    q_sStatus           : String[24];
END_VAR

VAR
    sTimerEntprell : TON;                   // Lichtschranke beruhigen
    sFlankeTeil    : R_TRIG;                // genau ein Impuls je Teil
    sZaehlerTeile  : CTU;                   // Teile der aktuellen Palette
    sTimerHupe     : TP;                    // Warnimpuls beim Wechsel
    sFlankeWechsel : R_TRIG;                // Quittierung Palettenwechsel

    sxFreigabe       : Bool := FALSE;       // Selbsthaltung Start/Stopp
    sxWechselNoetig  : Bool := FALSE;
    sdiTeileGesamt   : DInt := 0;           // REMANENT projektieren
    siPalettenGesamt : Int  := 0;           // REMANENT projektieren
END_VAR

VAR_TEMP
    txTeilImpuls   : Bool;
    txWechselFlanke: Bool;
    txZaehlerReset : Bool;
END_VAR

BEGIN
    // --- 1) Selbsthaltung Band: Stopp hat Vorrang ---
    IF i_xStopp THEN
        sxFreigabe := FALSE;
    ELSIF i_xStart THEN
        sxFreigabe := TRUE;
    END_IF;

    // --- 2) Lichtschranke entprellen und flankenauswerten ---
    sTimerEntprell(IN := i_xLichtschranke, PT := i_tEntprellung);
    sFlankeTeil(CLK := sTimerEntprell.Q);
    txTeilImpuls := sFlankeTeil.Q;

    // --- 3) Palettenwechsel quittiert? ---
    sFlankeWechsel(CLK := i_xPalettenwechselFertig);
    txWechselFlanke := sFlankeWechsel.Q;

    IF txWechselFlanke AND sxWechselNoetig THEN
        siPalettenGesamt := siPalettenGesamt + 1;
        sxWechselNoetig  := FALSE;
    END_IF;

    // Reset des Zaehlers genau im Quittierzyklus.
    txZaehlerReset := txWechselFlanke;

    // --- 4) Teilezaehler (CTU wertet die Flanke an CU selbst aus,
    //        deshalb bekommt er hier bewusst den bereits erzeugten Einzelimpuls) ---
    sZaehlerTeile(CU := txTeilImpuls,
                  R  := txZaehlerReset,
                  PV := i_iTeileProPalette);

    // Gesamtzaehler laeuft unabhaengig von der Palette weiter.
    IF txTeilImpuls THEN
        sdiTeileGesamt := sdiTeileGesamt + 1;
    END_IF;

    // --- 5) Palette voll? ---
    IF sZaehlerTeile.QU THEN
        sxWechselNoetig := TRUE;
    END_IF;

    // --- 6) Warnhupe: fester Impuls beim Anfordern des Wechsels ---
    sTimerHupe(IN := sxWechselNoetig, PT := i_tWechselWarnung);

    // --- 7) Ausgaenge einmal am Ende schreiben ---
    q_xBandLaeuft       := sxFreigabe AND NOT sxWechselNoetig;
    q_xWechselAnfordern := sxWechselNoetig;
    q_xWarnhupe         := sTimerHupe.Q;
    q_iTeileAktuell     := sZaehlerTeile.CV;
    q_diTeileGesamt     := sdiTeileGesamt;
    q_iPalettenGesamt   := siPalettenGesamt;

    IF NOT sxFreigabe THEN
        q_sStatus := 'Gestoppt';
    ELSIF sxWechselNoetig THEN
        q_sStatus := 'Palettenwechsel';
    ELSE
        q_sStatus := 'Produktion';
    END_IF;
END_FUNCTION_BLOCK`,
      hints: [
        'Zerlege die Station in Signalaufbereitung (entprellen, Flanke), Zählung, Zustand (Freigabe, Wechsel nötig) und Ausgabe – in genau dieser Reihenfolge.',
        'Du brauchst `TON`, `R_TRIG`, `CTU`, `TP` als Multiinstanzen sowie statische Bools und Zähler für Freigabe, Wechselanforderung und Gesamtsummen.',
        'Selbsthaltung → Entprelltimer → R_TRIG → Wechselquittierung auswerten → CTU mit Reset → bei QU Wechsel anfordern → TP-Hupe → am Ende alle Ausgänge und den Status schreiben.',
        '```pascal\nsTimerEntprell(IN := i_xLichtschranke, PT := i_tEntprellung);\nsFlankeTeil(CLK := sTimerEntprell.Q);\nsZaehlerTeile(CU := sFlankeTeil.Q,\n              R  := txZaehlerReset,\n              PV := i_iTeileProPalette);\n```',
      ],
    },
  ],
}

export default chapter
