import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '05',
  flashcards: [
    {
      id: 'f1',
      front: 'FC vs. FB in einem Satz?',
      back: 'Die **FC** ist zustandslos (nur `VAR_TEMP`), der **FB** hat mit seinem **Instanz-DB** ein Gedächtnis über Zyklen hinweg (`VAR`).',
    },
    {
      id: 'f2',
      front: 'Welches Bild hilft beim Verständnis von FB und Instanz-DB?',
      back: '**FB = Klasse, Instanz-DB = Objekt.** Drei Förderbänder brauchen einen FB und drei Instanz-DBs (oder drei Multiinstanzen) – jede Instanz hat ihren eigenen Zustand.',
    },
    {
      id: 'f3',
      front: 'Wie definiert und setzt man den Rückgabewert einer FC?',
      back: '```pascal\nFUNCTION "FC_Skalieren" : Real\n...\nBEGIN\n    #FC_Skalieren := trWert;\nEND_FUNCTION\n```\nOhne Rückgabewert: Typ `Void`.',
    },
    {
      id: 'f4',
      front: 'Wie sieht ein FB-Aufruf mit Parameterversorgung aus?',
      back: '```pascal\n"DB_Motor_Band1"(i_xEin   := "Start_Band1",\n                 i_xStoer := "Stoer_Band1",\n                 q_xMotor => "Schuetz_Band1");\n```\nEingänge mit `:=`, Ausgänge mit `=>`.',
    },
    {
      id: 'f5',
      front: 'Was ist eine Multiinstanz?',
      back: 'Ein FB (oder Timer) wird als **statische Variable** innerhalb eines anderen FB deklariert: `sMotor1 : "FB_Motor";`. Der Zustand liegt dann im Instanz-DB des übergeordneten Bausteins – ein DB statt vieler.',
    },
    {
      id: 'f6',
      front: 'Was passiert, wenn zwei Förderbänder denselben Instanz-DB benutzen?',
      back: 'Sie teilen sich den Zustand – der zweite Aufruf überschreibt die statischen Variablen des ersten. Ergebnis: sporadisch „springende“ Motoren. Jede physische Einheit braucht eine eigene Instanz.',
    },
    {
      id: 'f7',
      front: 'Warum gehört ein großes Array in `VAR_IN_OUT` statt in `VAR_INPUT`?',
      back: '`VAR_INPUT` **kopiert** den Wert bei jedem Aufruf (Laufzeit + Speicher). `VAR_IN_OUT` übergibt eine **Referenz**; der Baustein arbeitet direkt auf den Originaldaten.',
    },
    {
      id: 'f8',
      front: 'Was steht im Instanz-DB – und was nicht?',
      back: 'Drin: `VAR_INPUT`, `VAR_OUTPUT`, `VAR` (statisch) und Zeiger auf `VAR_IN_OUT`. Nicht drin: `VAR_TEMP` – die liegen im Lokaldatenstack.',
    },
    {
      id: 'f9',
      front: 'Warum darf ein wiederverwendbarer FB keine globalen Variablen direkt lesen?',
      back: 'Mit `IF "DB_Anlage".xFreigabe THEN` ist der Baustein an genau dieses Projekt gebunden. Alles, was er braucht, gehört über die **Schnittstelle** hinein – dann läuft er in jedem Projekt.',
    },
    {
      id: 'f10',
      front: 'Was passiert, wenn man bei einem FB einen `VAR_INPUT` nicht versorgt?',
      back: 'Es bleibt der Wert im Instanz-DB stehen (letzter Wert bzw. Startwert) – der Baustein rechnet still mit alten Daten. Bei einer FC ist eine fehlende Versorgung dagegen ein Übersetzungsfehler.',
    },
    {
      id: 'f11',
      front: 'Warum ist `q_iZaehler := q_iZaehler + 1;` in einem FB schlechter Stil?',
      back: 'Ausgangsparameter sind zur Weitergabe da, nicht als Gedächtnis. Sauber: in einer statischen Variablen zählen und am Ende einmal ausgeben (`q_diZaehler := sdiZaehler;`).',
    },
    {
      id: 'f12',
      front: 'Wofür ist OB100 da?',
      back: 'OB100 ist der **Anlauf-OB**: Er läuft einmal nach NETZ-EIN bzw. STOP→RUN. Dort gehören Initialisierungen hin, die nicht über die Remanenz abgedeckt sind – nicht in den zyklischen OB1.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Warum lässt sich das nicht übersetzen?',
      code: `FUNCTION "FC_Stueckzaehler" : Int
VAR
    sAnzahl : Int;
END_VAR

BEGIN
    sAnzahl := sAnzahl + 1;
    #FC_Stueckzaehler := sAnzahl;
END_FUNCTION`,
      options: [
        'Eine FC darf keinen `Int`-Rückgabewert haben',
        'Eine FC hat keinen Instanz-DB – statische Variablen (`VAR`) sind nicht erlaubt',
        'Der Rückgabewert muss `q_` heißen',
        '`#` ist vor dem Bausteinnamen unzulässig',
      ],
      correct: 1,
      explanation:
        'Die FC besitzt nur `VAR_TEMP`. Für einen Zähler braucht es einen FB mit statischer Variable oder einen Global-DB.',
    },
    {
      id: 'q2',
      prompt: 'Wo ist der Fehler?',
      code: `"DB_Motor"(i_xEin := "Start_Band1", q_xMotor => "Schuetz_Band1");
"DB_Motor"(i_xEin := "Start_Band2", q_xMotor => "Schuetz_Band2");`,
      options: [
        'Ein FB darf nur einmal pro Zyklus aufgerufen werden',
        'Beide Bänder nutzen denselben Instanz-DB – der zweite Aufruf überschreibt den Zustand des ersten',
        '`=>` ist für Ausgänge nicht erlaubt',
        'Die Aufrufe müssen in verschiedenen OBs stehen',
      ],
      correct: 1,
      explanation:
        'Der Instanz-DB ist das Gedächtnis der Instanz. Zwei physisch getrennte Bänder brauchen zwei Instanz-DBs (oder zwei Multiinstanzen) – sonst teilen sie Flankenmerker und Zustände.',
    },
    {
      id: 'q3',
      prompt: 'Was ist an diesem Aufruf falsch?',
      code: `"DB_Motor_Band1"(i_xEin   := "Start_Band1",
                 q_xMotor := "Schuetz_Band1");`,
      options: [
        'Ausgangsparameter werden mit `=>` versorgt, nicht mit `:=`',
        'Der Instanz-DB darf nicht in Anführungszeichen stehen',
        'Es fehlt der Parameter `i_xAus`',
        'Kein Fehler',
      ],
      correct: 0,
      explanation:
        '`:=` schreibt **in** den Baustein hinein (Eingänge), `=>` holt einen Wert **heraus** (Ausgänge). Die Pfeilrichtung macht den Datenfluss sichtbar.',
    },
    {
      id: 'q4',
      prompt: 'Welchen Wert hat `q_diStarts` beim dritten Tastendruck?',
      code: `VAR
    sdiStarts : DInt;
    sxEinAlt  : Bool;
END_VAR

BEGIN
    IF i_xEin AND NOT sxEinAlt THEN
        sdiStarts := sdiStarts + 1;
    END_IF;
    sxEinAlt   := i_xEin;
    q_diStarts := sdiStarts;
END_FUNCTION_BLOCK`,
      options: [
        '`3` – die Flankenauswertung zählt jeden Tastendruck genau einmal',
        'So viele Zyklen, wie der Taster gedrückt war',
        '`1` – statische Variablen werden jeden Zyklus zurückgesetzt',
        '`0` – `sxEinAlt` verhindert jedes Zählen',
      ],
      correct: 0,
      explanation:
        '`i_xEin AND NOT sxEinAlt` ist genau einen Zyklus lang TRUE (steigende Flanke). Ohne diesen Flankenmerker würde pro gedrücktem Zyklus gezählt – bei 100 ms Zykluszeit also zehnmal pro Sekunde.',
    },
    {
      id: 'q5',
      prompt: 'Welche Variante ist sauber für einen wiederverwendbaren Bibliotheksbaustein?',
      options: [
        '`IF "DB_Anlage".xFreigabe THEN q_xMotor := TRUE; END_IF;`',
        '`IF i_xFreigabe THEN q_xMotor := TRUE; END_IF;` mit `i_xFreigabe` als `VAR_INPUT`',
        '`IF %M10.0 THEN q_xMotor := TRUE; END_IF;`',
        '`IF "Freigabe_Global" THEN q_xMotor := TRUE; END_IF;`',
      ],
      correct: 1,
      explanation:
        'Nur über die Schnittstelle bleibt der Baustein projektunabhängig. Jeder direkte Zugriff auf Global-DBs, Merker oder PLC-Variablen bindet ihn an ein konkretes Projekt.',
    },
    {
      id: 'q6',
      prompt: 'Was liegt NICHT im Instanz-DB eines FB?',
      options: [
        '`VAR_INPUT`-Parameter',
        '`VAR_OUTPUT`-Parameter',
        '`VAR`-Variablen (statisch)',
        '`VAR_TEMP`-Variablen',
      ],
      correct: 3,
      explanation:
        'Temp-Variablen liegen im Lokaldatenstack und existieren nur während des Aufrufs. Alles andere – inklusive der Zeiger auf `VAR_IN_OUT` – steht im Instanz-DB und ist dort online beobachtbar.',
    },
    {
      id: 'q7',
      prompt: 'Welchen Effekt hat diese Deklaration bei 1000 Elementen und 10 ms Zykluszeit?',
      code: `VAR_INPUT
    i_aMesswerte : ARRAY[1..1000] OF Real;
END_VAR`,
      options: [
        'Keinen – Arrays werden immer als Referenz übergeben',
        'Das Array wird bei **jedem** Aufruf komplett kopiert (4000 Byte) und belastet Zykluszeit und Speicher',
        'Übersetzungsfehler: Arrays sind in `VAR_INPUT` verboten',
        'Das Array wird nur beim ersten Aufruf kopiert',
      ],
      correct: 1,
      explanation:
        '`VAR_INPUT` arbeitet mit Wertübergabe. Große Strukturen gehören nach `VAR_IN_OUT` – dort wird nur ein Zeiger übergeben.',
    },
    {
      id: 'q8',
      prompt: 'Welchen Vorteil hat die Multiinstanz gegenüber einzelnen Instanz-DBs?',
      code: `VAR
    sMotorBand1 : "FB_Motor";
    sMotorBand2 : "FB_Motor";
    sTimerAnlauf: TON;
END_VAR`,
      options: [
        'Die Bausteine laufen schneller',
        'Der Zustand aller Teilbausteine liegt in einem Instanz-DB – keine DB-Flut, zusammengehörige Daten bleiben beisammen',
        'Multiinstanzen brauchen keinen Speicher',
        'Nur mit Multiinstanz lassen sich Timer verwenden',
      ],
      correct: 1,
      explanation:
        'Die Multiinstanz kapselt den Zustand im übergeordneten Instanz-DB. Das ist der Normalfall in modernen TIA-Projekten; Einzelinstanzen nimmt man, wenn der Baustein von außen gut beobachtbar sein soll.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'FC zur Grenzwertprüfung',
      level: 1,
      description: `Schreibe eine **FC** \`FC_InToleranz\` mit Rückgabewert \`Bool\`.

Schnittstelle:

- \`i_rIstwert : Real\`
- \`i_rSollwert : Real\`
- \`i_rToleranz : Real\` – zulässige Abweichung nach oben und unten

Rückgabe: \`TRUE\`, wenn der Istwert innerhalb des Toleranzbandes liegt.

Anforderungen:

- keine statischen Variablen (das wäre in einer FC ohnehin ein Fehler)
- Abweichung über \`ABS\` statt über zwei Vergleiche
- negative Toleranz abfangen: dann \`FALSE\` zurückgeben`,
      starter: `FUNCTION "FC_InToleranz" : Bool
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_rIstwert  : Real;
    i_rSollwert : Real;
    i_rToleranz : Real;
END_VAR

VAR_TEMP
    // TODO
END_VAR

BEGIN
    // TODO
    #FC_InToleranz := FALSE;
END_FUNCTION`,
      solution: `FUNCTION "FC_InToleranz" : Bool
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_rIstwert  : Real;                     // gemessener Wert
    i_rSollwert : Real;                     // Zielwert
    i_rToleranz : Real;                     // zulaessige Abweichung (+/-)
END_VAR

VAR_TEMP
    trAbweichung : Real;
END_VAR

BEGIN
    // Unsinnige Parametrierung darf nie "in Ordnung" melden.
    IF i_rToleranz < 0.0 THEN
        #FC_InToleranz := FALSE;
        RETURN;
    END_IF;

    // Ein ABS statt zwei Vergleichen - haelt die Absicht sichtbar.
    trAbweichung   := ABS(i_rIstwert - i_rSollwert);
    #FC_InToleranz := (trAbweichung <= i_rToleranz);
END_FUNCTION`,
      hints: [
        '„Innerhalb der Toleranz“ heißt: Der Betrag der Abweichung ist kleiner oder gleich der Toleranz.',
        'Du brauchst `ABS(..)`, den Vergleich `<=` und `RETURN` für den Sonderfall.',
        'Erst negative Toleranz abfangen und mit RETURN aussteigen, dann Abweichung berechnen und das Ergebnis des Vergleichs direkt zuweisen.',
        '```pascal\ntrAbweichung   := ABS(i_rIstwert - i_rSollwert);\n#FC_InToleranz := (trAbweichung <= i_rToleranz);\n```',
      ],
    },
    {
      id: 'k2',
      title: 'FB_Motor mit Start/Stopp und Startzähler',
      level: 2,
      description: `Schreibe einen **FB** \`FB_Motor\`, der sich als Bibliotheksbaustein für beliebig viele Motoren eignet.

Schnittstelle:

- \`i_xEin : Bool\` – Taster Ein (Schließer)
- \`i_xAus : Bool\` – Taster Aus (bereits als Schließer aufbereitet)
- \`i_xStoerung : Bool\` – Motorschutz gefallen
- \`i_xQuittieren : Bool\`
- \`q_xMotor : Bool\` – Schützansteuerung
- \`q_xStoerung : Bool\` – gespeicherte Störung
- \`q_diStarts : DInt\` – Anzahl Motorstarts (remanent gedacht)

Anforderungen:

- Selbsthaltung über eine **statische** Variable
- Störung speichert sich und verhindert den Start; Quittieren nur möglich, wenn die Störungsursache weg ist
- Startzähler zählt **pro Flanke**, nicht pro Zyklus (Flankenmerker als statische Variable)
- kein Zugriff auf globale Daten`,
      starter: `FUNCTION_BLOCK "FB_Motor"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xEin        : Bool;
    i_xAus        : Bool;
    i_xStoerung   : Bool;
    i_xQuittieren : Bool;
END_VAR

VAR_OUTPUT
    q_xMotor    : Bool;
    q_xStoerung : Bool;
    q_diStarts  : DInt;
END_VAR

VAR
    // TODO: Selbsthaltung, Stoerspeicher, Flankenmerker, Zaehler
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Motor"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xEin        : Bool;                   // Taster Ein
    i_xAus        : Bool;                   // Taster Aus (als Schliesser aufbereitet)
    i_xStoerung   : Bool;                   // Motorschutz gefallen
    i_xQuittieren : Bool;
END_VAR

VAR_OUTPUT
    q_xMotor    : Bool;
    q_xStoerung : Bool;
    q_diStarts  : DInt;
END_VAR

VAR
    sxLaeuft        : Bool;                 // Selbsthaltung
    sxStoerGespeich : Bool;                 // gespeicherte Stoerung
    sxEinAlt        : Bool;                 // Flankenmerker Taster Ein
    sdiStarts       : DInt;                 // REMANENT projektieren
END_VAR

VAR_TEMP
    txEinFlanke : Bool;
END_VAR

BEGIN
    // --- Stoerung speichern (kommt sofort, geht nur mit Quittierung) ---
    IF i_xStoerung THEN
        sxStoerGespeich := TRUE;
    ELSIF i_xQuittieren THEN
        sxStoerGespeich := FALSE;           // nur quittierbar, wenn Ursache weg ist
    END_IF;

    // --- Steigende Flanke des Ein-Tasters ---
    txEinFlanke := i_xEin AND NOT sxEinAlt;
    sxEinAlt    := i_xEin;

    // --- Selbsthaltung: Ausschalten hat immer Vorrang ---
    IF sxStoerGespeich OR i_xAus THEN
        sxLaeuft := FALSE;
    ELSIF txEinFlanke THEN
        sxLaeuft  := TRUE;
        sdiStarts := sdiStarts + 1;         // genau einmal je Tastendruck
    END_IF;

    // --- Ausgaenge einmal am Ende schreiben ---
    q_xMotor    := sxLaeuft;
    q_xStoerung := sxStoerGespeich;
    q_diStarts  := sdiStarts;
END_FUNCTION_BLOCK`,
      hints: [
        'Drei unabhängige Zustände: läuft der Motor, steht eine Störung an, und war der Taster im letzten Zyklus schon gedrückt?',
        'Du brauchst statische Bools (`VAR`), eine Flankenauswertung `i_xEin AND NOT sxEinAlt` und eine IF/ELSIF-Kaskade mit Ausschalt-Vorrang.',
        'Störspeicher setzen/quittieren → Flanke bilden und Merker nachführen → IF Störung ODER Aus → läuft FALSE, ELSIF Flanke → läuft TRUE und zählen → am Ende Ausgänge schreiben.',
        '```pascal\ntxEinFlanke := i_xEin AND NOT sxEinAlt;\nsxEinAlt    := i_xEin;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Anlagenbaustein mit Multiinstanzen',
      level: 3,
      description: `Schreibe einen **FB** \`FB_Bandstrasse\`, der drei Förderbänder über Multiinstanzen des \`FB_Motor\` aus Kata 2 steuert.

Schnittstelle:

- \`i_xAnlageEin : Bool\`, \`i_xAnlageAus : Bool\`, \`i_xQuittieren : Bool\`
- \`i_axBandStoerung : ARRAY[1..3] OF Bool\` – Motorschutz je Band
- \`q_axSchuetz : ARRAY[1..3] OF Bool\`
- \`q_xSammelstoerung : Bool\`
- \`q_diStartsGesamt : DInt\`

Anforderungen:

- drei Multiinstanzen \`sMotor1\`, \`sMotor2\`, \`sMotor3\` vom Typ \`"FB_Motor"\`
- die Anlagentaster wirken auf **alle** Bänder gleichzeitig
- \`q_xSammelstoerung\` ist TRUE, sobald eine Instanz Störung meldet
- \`q_diStartsGesamt\` ist die Summe der Startzähler
- keine globalen Zugriffe

Hinweis: Du rufst die Instanzen mit ihren Parametern auf und liest Ausgänge danach über \`sMotor1.q_xStoerung\` aus.`,
      given: `// Schnittstelle des bereits vorhandenen Bausteins:
FUNCTION_BLOCK "FB_Motor"
VAR_INPUT
    i_xEin        : Bool;
    i_xAus        : Bool;
    i_xStoerung   : Bool;
    i_xQuittieren : Bool;
END_VAR
VAR_OUTPUT
    q_xMotor    : Bool;
    q_xStoerung : Bool;
    q_diStarts  : DInt;
END_VAR`,
      starter: `FUNCTION_BLOCK "FB_Bandstrasse"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xAnlageEin     : Bool;
    i_xAnlageAus     : Bool;
    i_xQuittieren    : Bool;
    i_axBandStoerung : ARRAY[1..3] OF Bool;
END_VAR

VAR_OUTPUT
    q_axSchuetz       : ARRAY[1..3] OF Bool;
    q_xSammelstoerung : Bool;
    q_diStartsGesamt  : DInt;
END_VAR

VAR
    // TODO: drei Multiinstanzen
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Bandstrasse"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xAnlageEin     : Bool;
    i_xAnlageAus     : Bool;
    i_xQuittieren    : Bool;
    i_axBandStoerung : ARRAY[1..3] OF Bool; // Motorschutz je Band
END_VAR

VAR_OUTPUT
    q_axSchuetz       : ARRAY[1..3] OF Bool;
    q_xSammelstoerung : Bool;
    q_diStartsGesamt  : DInt;
END_VAR

VAR
    // Multiinstanzen: der Zustand aller drei Motoren liegt in DIESEM Instanz-DB.
    sMotor1 : "FB_Motor";
    sMotor2 : "FB_Motor";
    sMotor3 : "FB_Motor";
END_VAR

BEGIN
    // Jede Instanz bekommt ihre eigene Stoerung, aber dieselben Anlagentaster.
    sMotor1(i_xEin        := i_xAnlageEin,
            i_xAus        := i_xAnlageAus,
            i_xStoerung   := i_axBandStoerung[1],
            i_xQuittieren := i_xQuittieren,
            q_xMotor      => q_axSchuetz[1]);

    sMotor2(i_xEin        := i_xAnlageEin,
            i_xAus        := i_xAnlageAus,
            i_xStoerung   := i_axBandStoerung[2],
            i_xQuittieren := i_xQuittieren,
            q_xMotor      => q_axSchuetz[2]);

    sMotor3(i_xEin        := i_xAnlageEin,
            i_xAus        := i_xAnlageAus,
            i_xStoerung   := i_axBandStoerung[3],
            i_xQuittieren := i_xQuittieren,
            q_xMotor      => q_axSchuetz[3]);

    // Ausgaenge der Instanzen NACH dem Aufruf auswerten.
    q_xSammelstoerung := sMotor1.q_xStoerung
                      OR sMotor2.q_xStoerung
                      OR sMotor3.q_xStoerung;

    q_diStartsGesamt := sMotor1.q_diStarts
                      + sMotor2.q_diStarts
                      + sMotor3.q_diStarts;
END_FUNCTION_BLOCK`,
      hints: [
        'Eine Multiinstanz ist einfach eine statische Variable vom Typ des FB. Jede Instanz hat ihren eigenen kompletten Zustand.',
        'Deklaration: `sMotor1 : "FB_Motor";` in `VAR`. Aufruf: `sMotor1(i_xEin := …, q_xMotor => …);`. Auslesen danach über `sMotor1.q_xStoerung`.',
        'Drei Instanzen deklarieren → alle drei mit denselben Tastern, aber eigener Störung aufrufen → danach Sammelstörung mit OR und Startsumme mit + bilden.',
        '```pascal\nsMotor1(i_xEin      := i_xAnlageEin,\n        i_xStoerung := i_axBandStoerung[1],\n        q_xMotor    => q_axSchuetz[1]);\nq_xSammelstoerung := sMotor1.q_xStoerung OR sMotor2.q_xStoerung;\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Ringpuffer als wiederverwendbarer Baustein',
      level: 4,
      description: `Schreibe einen **FB** \`FB_Ringpuffer\`, der Messwerte in einen vom Aufrufer bereitgestellten Puffer schreibt.

Schnittstelle:

- \`i_xSchreiben : Bool\` – flankenausgewertet übergeben, ein Takt = ein Wert
- \`i_rWert : Real\`
- \`i_xLoeschen : Bool\`
- \`io_aPuffer : ARRAY[1..100] OF Real\` (\`VAR_IN_OUT\`) – gehört dem Aufrufer
- \`q_iSchreibIndex : Int\` – nächster Schreibplatz
- \`q_iAnzahlGueltig : Int\` – wie viele Plätze sind belegt (max. 100)
- \`q_xUeberlauf : Bool\` – TRUE, sobald mindestens einmal überschrieben wurde
- \`q_rMittelwert : Real\` – über die gültigen Werte

Anforderungen:

- Schreibindex als **statische** Variable, läuft von 1 bis 100 und dann wieder auf 1
- der Puffer selbst liegt beim Aufrufer – darum \`VAR_IN_OUT\`
- \`i_xLoeschen\` setzt Index, Anzahl und Überlauf zurück und nullt den Puffer
- Mittelwert nur über die tatsächlich belegten Plätze
- keine Array-Zugriffe außerhalb der Grenzen
- erkläre im Kommentar, warum der Baustein ein FB und keine FC ist`,
      starter: `FUNCTION_BLOCK "FB_Ringpuffer"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xSchreiben : Bool;
    i_rWert      : Real;
    i_xLoeschen  : Bool;
END_VAR

VAR_IN_OUT
    io_aPuffer : ARRAY[1..100] OF Real;
END_VAR

VAR_OUTPUT
    q_iSchreibIndex  : Int;
    q_iAnzahlGueltig : Int;
    q_xUeberlauf     : Bool;
    q_rMittelwert    : Real;
END_VAR

VAR
    // TODO
END_VAR

BEGIN
    // TODO
    ;
END_FUNCTION_BLOCK`,
      solution: `FUNCTION_BLOCK "FB_Ringpuffer"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

// FB und nicht FC: Schreibindex, Belegung und Ueberlaufkennung muessen ueber
// Zyklen hinweg erhalten bleiben - dafuer braucht es einen Instanz-DB.

VAR_INPUT
    i_xSchreiben : Bool;                    // bereits flankenausgewertet
    i_rWert      : Real;
    i_xLoeschen  : Bool;
END_VAR

VAR_IN_OUT
    io_aPuffer : ARRAY[1..100] OF Real;     // Referenz: Puffer gehoert dem Aufrufer
END_VAR

VAR_OUTPUT
    q_iSchreibIndex  : Int;
    q_iAnzahlGueltig : Int;
    q_xUeberlauf     : Bool;
    q_rMittelwert    : Real;
END_VAR

VAR
    siSchreibIndex : Int  := 1;             // naechster Schreibplatz
    siAnzahl       : Int  := 0;             // belegte Plaetze
    sxUeberlauf    : Bool := FALSE;
END_VAR

VAR CONSTANT
    IDX_MIN : Int := 1;
    IDX_MAX : Int := 100;
END_VAR

VAR_TEMP
    tiIndex : Int;
    trSumme : Real;
END_VAR

BEGIN
    // --- Loeschen hat Vorrang ---
    IF i_xLoeschen THEN
        FOR tiIndex := IDX_MIN TO IDX_MAX DO
            io_aPuffer[tiIndex] := 0.0;
        END_FOR;
        siSchreibIndex := IDX_MIN;
        siAnzahl       := 0;
        sxUeberlauf    := FALSE;

    // --- Einen Wert ablegen ---
    ELSIF i_xSchreiben THEN
        io_aPuffer[siSchreibIndex] := i_rWert;

        // Belegung waechst nur bis zur Puffergroesse.
        IF siAnzahl < IDX_MAX THEN
            siAnzahl := siAnzahl + 1;
        END_IF;

        // Index ringfoermig weiterschalten - NIE ueber IDX_MAX hinaus.
        IF siSchreibIndex >= IDX_MAX THEN
            siSchreibIndex := IDX_MIN;
            sxUeberlauf    := TRUE;         // ab jetzt wird ueberschrieben
        ELSE
            siSchreibIndex := siSchreibIndex + 1;
        END_IF;
    END_IF;

    // --- Mittelwert nur ueber belegte Plaetze ---
    trSumme := 0.0;
    IF siAnzahl > 0 THEN
        FOR tiIndex := IDX_MIN TO siAnzahl DO
            trSumme := trSumme + io_aPuffer[tiIndex];
        END_FOR;
        q_rMittelwert := trSumme / INT_TO_REAL(siAnzahl);
    ELSE
        q_rMittelwert := 0.0;
    END_IF;

    q_iSchreibIndex  := siSchreibIndex;
    q_iAnzahlGueltig := siAnzahl;
    q_xUeberlauf     := sxUeberlauf;
END_FUNCTION_BLOCK`,
      hints: [
        'Drei Dinge müssen den Zyklus überleben: Wohin wird als Nächstes geschrieben, wie viel ist belegt, und wurde schon einmal überschrieben?',
        'Du brauchst `VAR` für den Zustand, `VAR_IN_OUT` für den Puffer, eine Division durch 0 abfangen und zwei `FOR`-Schleifen.',
        'IF Löschen → Puffer nullen und Zustand zurücksetzen; ELSIF Schreiben → Wert ablegen, Anzahl bis 100 hochzählen, Index ringförmig weiterschalten (bei 100 → 1 und Überlauf setzen). Danach Mittelwert über die ersten `siAnzahl` Plätze.',
        '```pascal\nIF siSchreibIndex >= IDX_MAX THEN\n    siSchreibIndex := IDX_MIN;\n    sxUeberlauf    := TRUE;\nELSE\n    siSchreibIndex := siSchreibIndex + 1;\nEND_IF;\n```',
      ],
    },
  ],
}

export default chapter
