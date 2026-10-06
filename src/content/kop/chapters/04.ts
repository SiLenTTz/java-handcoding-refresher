import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    {
      id: 'f1',
      front: 'Was macht ein `TON`?',
      back: '**Einschaltverzögerung**: `Q` wird 1, nachdem `IN` ununterbrochen für `PT` angestanden hat. Fällt `IN` vorher ab, startet die Zeit beim nächsten Mal wieder bei null.',
    },
    {
      id: 'f2',
      front: 'Was macht ein `TOF`?',
      back: '**Ausschaltverzögerung**: `Q` wird sofort 1, wenn `IN` kommt, und fällt erst `PT` **nach** dem Abfallen von `IN` wieder ab. Typisch für Nachlaufzeiten.',
    },
    {
      id: 'f3',
      front: 'Was macht ein `TP` und was ist dabei besonders?',
      back: '**Impuls**: `Q` ist genau `PT` lang 1, unabhängig von der Dauer von `IN`. Der `TP` ist **nicht nachtriggerbar** – ein zweiter Impuls während der laufenden Zeit verlängert nichts.',
    },
    {
      id: 'f4',
      front: 'Die vier Parameter eines IEC-Timers?',
      back: '`IN` (BOOL, Startbedingung als **Zustand**), `PT` (TIME, Sollzeit), `Q` (BOOL, Ausgang), `ET` (TIME, abgelaufene Zeit).',
    },
    {
      id: 'f5',
      front: 'Wie schreibt man Zeitliterale?',
      back: '`T#500ms`, `T#5s`, `T#1m30s`, `T#2h`, `T#1d2h3m4s`. Auflösung 1 ms, Maximum rund 24 Tage.',
    },
    {
      id: 'f6',
      front: 'Welche SCL-Zeile entspricht diesem Netzwerk?\n\n```text\n                   +-------------------+\n                   |  "IDB_Luefter"    |\n                   |       TON         |\n     Freigabe      |                   |        K_Luefter\n  ----| |----------| IN              Q |-------( )----\n        T#5s ------| PT             ET |\n                   +-------------------+\n```',
      back: '```pascal\n"IDB_Luefter"(IN := "Freigabe", PT := T#5s, Q => "K_Luefter");\n```',
    },
    {
      id: 'f7',
      front: 'Warum braucht jeder Timer eigene Instanzdaten?',
      back: 'Der Instanz-DB speichert den Zustand zwischen den Zyklen (Startzeitpunkt, `ET`, `Q`). Zwei Netzwerke am selben Instanz-DB überschreiben sich gegenseitig.',
    },
    {
      id: 'f8',
      front: 'Die Parameter eines `CTU`?',
      back: '`CU` (Zähleingang, **flankengesteuert**), `R` (Reset auf 0), `PV` (Preset Value), `Q` (1 wenn `CV >= PV`), `CV` (aktueller Zählerstand).',
    },
    {
      id: 'f9',
      front: 'Was ist der Unterschied zwischen `CTD` und `CTU`?',
      back: '`CTD` zählt mit `CD` **herunter**, `Q` wird 1 bei `CV <= 0`. Statt `R` hat er `LD`, das `PV` nach `CV` lädt. `CTUD` kann beides und hat `QU` und `QD`.',
    },
    {
      id: 'f10',
      front: 'Warum gehört vor den Zähleingang `CU` ein `|P|`-Kontakt?',
      back: 'Damit im Netzwerk sichtbar ist, wann gezählt wird, und damit aus Verknüpfungen stammende Dauersignale nicht zyklisch hochzählen. Ein Taster ohne Flanke zählt in jedem Zyklus.',
    },
    {
      id: 'f11',
      front: 'Was passiert mit einem Timer in einem Zweig, der nicht jeden Zyklus bearbeitet wird?',
      back: 'Er **friert ein**: `ET` bleibt stehen, `Q` behält seinen letzten Wert. Timerboxen müssen zyklisch bearbeitet werden – gesteuert wird über `IN`, nicht über den Aufruf.',
    },
    {
      id: 'f12',
      front: 'Wie genau ist ein SPS-Timer?',
      back: 'Begrenzt durch die **Zykluszeit**: `Q` kann bis zu einen Zyklus später kommen, als `PT` es vorgibt. Für Zeiten im Bereich der Zykluszeit sind Timer ungeeignet.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: '`Freigabe` steht 3 Sekunden an und fällt dann ab. Was macht `K_Luefter`?',
      code: `  Netzwerk 1:

                   +-------------------+
                   |  "IDB_Luefter"    |
                   |       TON         |
     Freigabe      |                   |        K_Luefter
  ----| |----------| IN              Q |-------( )----
        T#5s ------| PT             ET |
                   +-------------------+`,
      options: [
        'Er geht nach 3 s an und bleibt an',
        'Er geht gar nicht an, die Zeit wurde nicht erreicht',
        'Er geht nach 5 s an',
        'Er geht sofort an und 5 s später aus',
      ],
      correct: 1,
      explanation: 'Der `TON` braucht `IN` **ununterbrochen** für `PT`. Nach 3 s fällt `IN` ab, `ET` wird zurückgesetzt, `Q` bleibt 0.',
    },
    {
      id: 'q2',
      prompt: 'Welcher Timer erzeugt eine Hupe, die bei jedem Start genau 3 Sekunden ertönt – egal wie lange der Starttaster gedrückt wird?',
      options: ['`TON`', '`TOF`', '`TP`', '`TONR`'],
      correct: 2,
      explanation: 'Nur der `TP` erzeugt einen Impuls fester Länge, unabhängig von der Dauer von `IN`. Beim `TON` bliebe `Q` an, solange `IN` ansteht.',
    },
    {
      id: 'q3',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `  Netzwerk 1:

                   +-------------------+
                   |  "IDB_Nachlauf"   |
                   |       TOF         |
     Band          |                   |        K_Absaugung
  ----| |----------| IN              Q |-------( )----
       T#10s ------| PT             ET |
                   +-------------------+`,
      options: [
        '`"K_Absaugung" := "Band";`',
        '`"IDB_Nachlauf"(IN := "Band", PT := T#10s, Q => "K_Absaugung");`',
        '`"IDB_Nachlauf"(IN := "K_Absaugung", PT := T#10s, Q => "Band");`',
        '`IF "Band" THEN "K_Absaugung" := TRUE; END_IF;`',
      ],
      correct: 1,
      explanation: 'Eingänge mit `:=`, Ausgänge mit `=>`. Die Instanz steht vorn, der Bausteintyp ergibt sich aus der Deklaration der Instanz.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler im Netzwerk?',
      code: `  Netzwerk 1: Stueckzaehler

                   +-------------------+
                   |  "IDB_Stueck"     |
                   |       CTU         |
     S_Taster      |                   |        M_Voll
  ----| |----------| CU              Q |-------( )----
     S_Reset       |                   |
  ----| |----------| R              CV |
          100 -----| PV                |
                   +-------------------+`,
      options: [
        '`PV` muss ein TIME-Literal sein',
        '`R` und `CU` sind vertauscht',
        'Vor `CU` fehlt eine Flankenauswertung `|P|` – der Zähler zählt sonst in jedem Zyklus',
        '`Q` darf nicht auf einen Merker gelegt werden',
      ],
      correct: 2,
      explanation: 'Ein direkt verdrahteter Taster erzeugt ein Dauersignal. Mit `|P|` und eigenem Flankenmerker wird daraus genau ein Zählimpuls pro Tastendruck.',
    },
    {
      id: 'q5',
      prompt: '`S_Start` wird kurz gedrückt. Wann fällt `M_Band` wieder ab?',
      code: `  Netzwerk 1:
     S_Start            M_ZeitAus      M_Band
  +---| |---+-------------|/|---------( )----
  |         |
  | M_Band  |
  +---| |---+

  Netzwerk 2:
                   +-------------------+
                   |  "IDB_Laufzeit"   |
                   |       TON         |
     M_Band        |                   |        M_ZeitAus
  ----| |----------| IN              Q |-------( )----
       T#30s ------| PT             ET |
                   +-------------------+`,
      options: [
        'sofort beim Loslassen des Tasters',
        'nach 30 Sekunden',
        'gar nicht, es fehlt ein Stopptaster',
        'nach einem Zyklus',
      ],
      correct: 1,
      explanation: 'Die Selbsthaltung hält `M_Band`. Der `TON` läuft mit `IN := M_Band` und setzt nach 30 s `M_ZeitAus` – der Öffner unterbricht die Selbsthaltung.',
    },
    {
      id: 'q6',
      prompt: 'Was passiert, wenn beim `TP` während der laufenden Zeit ein zweiter Impuls auf `IN` kommt?',
      options: [
        'Die Zeit startet neu (nachtriggerbar)',
        'Die Zeit wird verdoppelt',
        'Nichts – der `TP` ist nicht nachtriggerbar, `Q` bleibt genau `PT` lang 1',
        '`Q` fällt sofort ab',
      ],
      correct: 2,
      explanation: 'Der IEC-`TP` ignoriert weitere Impulse, solange die Zeit läuft. Für nachtriggerbares Verhalten braucht man zusätzliche Logik.',
    },
    {
      id: 'q7',
      prompt: 'Ein Timer liegt in einem Bausteinzweig, der nur bei Automatikbetrieb aufgerufen wird. Was passiert beim Umschalten auf Hand, während die Zeit läuft?',
      options: [
        'Der Timer läuft im Hintergrund weiter',
        'Der Timer wird automatisch zurückgesetzt',
        'Der Timer friert ein – `ET` bleibt stehen und `Q` behält seinen Wert',
        'Die CPU geht in STOP',
      ],
      correct: 2,
      explanation: 'IEC-Timer werden nur beim Bearbeiten der Box aktualisiert. Deshalb Boxen immer zyklisch bearbeiten und über `IN` steuern.',
    },
    {
      id: 'q8',
      prompt: 'Die Pumpe läuft. Der Druckschalter muss innerhalb von 5 s kommen, sonst Trockenlaufstörung. Welche Kombination ist richtig?',
      options: [
        '`TOF` mit `IN := "K_Pumpe"`, `Q` setzt die Störung',
        '`TON` mit `IN := "K_Pumpe" AND NOT "B_Druck"`, `Q` setzt die Störung',
        '`TP` mit `IN := "B_Druck"`, `Q` setzt die Störung',
        '`CTU` mit `PV := 5`, `Q` setzt die Störung',
      ],
      correct: 1,
      explanation: 'Die Störbedingung lautet "Pumpe läuft und Druck fehlt". Steht dieser Zustand 5 s ununterbrochen an, meldet der `TON`. Kommt der Druck früher, fällt `IN` ab und die Zeit wird zurückgesetzt.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Lüfter mit Einschaltverzögerung',
      level: 1,
      description: `Zeichne ein Netzwerk: Nach der Freigabe soll der Lüfter mit **5 Sekunden Verzögerung** anlaufen.

**Zuordnungsliste**

\`\`\`text
  M10.0  M_Freigabe     Anlagenfreigabe
  A0.0   K_Luefter      Schuetz Luefter
  DB1    IDB_Luefter    Instanzdaten TON
\`\`\`

Schreibe darunter die SCL-Entsprechung.`,
      starter: `  Netzwerk 1: Luefter mit Anlaufverzoegerung

  ----
  // TODO: TON-Box zeichnen

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Luefter mit Anlaufverzoegerung

                   +-------------------+
                   |  "IDB_Luefter"    |
                   |       TON         |
     M_Freigabe    |                   |        K_Luefter
  ----| |----------| IN              Q |-------( )----
                   |                   |
        T#5s ------| PT             ET |
                   +-------------------+

  SCL:
  "IDB_Luefter"(IN := "M_Freigabe", PT := T#5s, Q => "K_Luefter");`,
      hints: [
        'Verzögertes Einschalten ist die Aufgabe des `TON`.',
        'Die Box braucht `IN`, `PT`, `Q` und optional `ET`. Über der Box steht der Instanzname.',
        'Links vom `IN` kommt ein Schließer auf `M_Freigabe`, an `PT` das Literal `T#5s`, rechts von `Q` die Spule auf `K_Luefter`.',
        '```text\n                   +-------------------+\n                   |  "IDB_Luefter"    |\n                   |       ???         |\n     M_Freigabe    |                   |        K_Luefter\n  ----| |----------| IN              Q |-------( )----\n        ???? ------| PT             ET |\n                   +-------------------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Timer-Netzwerk nach SCL übersetzen',
      level: 2,
      description: `Übersetze beide Netzwerke in SCL.

**Zuordnungsliste**

\`\`\`text
  A0.0   K_Band         Schuetz Band
  A0.1   K_Absaugung    Schuetz Absaugung
  M10.0  M_Vorwarnung   Vorwarnung laeuft
  DB1    IDB_Nachlauf   Instanzdaten TOF
  DB2    IDB_Hupe       Instanzdaten TP
\`\`\``,
      given: `  Netzwerk 1: Absaugung mit 10 s Nachlauf

                   +-------------------+
                   |  "IDB_Nachlauf"   |
                   |       TOF         |
     K_Band        |                   |        K_Absaugung
  ----| |----------| IN              Q |-------( )----
       T#10s ------| PT             ET |
                   +-------------------+

  Netzwerk 2: Anlaufwarnung 3 s

                   +-------------------+
                   |  "IDB_Hupe"       |
                   |       TP          |
     M_Vorwarnung  |                   |        H_Hupe
  ----| |----------| IN              Q |-------( )----
        T#3s ------| PT             ET |
                   +-------------------+`,
      starter: `  SCL:
  // TODO: Netzwerk 1
  // TODO: Netzwerk 2`,
      solution: `  SCL:
  "IDB_Nachlauf"(IN := "K_Band", PT := T#10s, Q => "K_Absaugung");
  "IDB_Hupe"(IN := "M_Vorwarnung", PT := T#3s, Q => "H_Hupe");`,
      hints: [
        'Ein Timeraufruf in SCL beginnt mit dem Instanznamen in Anführungszeichen.',
        'Eingänge werden mit `:=` versorgt, Ausgänge mit `=>` abgegriffen.',
        'Schreibe je Netzwerk eine Zeile: Instanzname, dann in Klammern `IN := ...`, `PT := ...`, `Q => ...`.',
        '`"IDB_Nachlauf"(IN := "K_Band", PT := ???, Q => ???);`',
      ],
    },
    {
      id: 'k3',
      title: 'Zählerfehler korrigieren',
      level: 3,
      description: `Der Stückzähler zählt bei jedem Werkstück nicht um eins, sondern um mehrere hundert hoch. Außerdem lässt er sich nicht zurücksetzen.

Korrigiere das Netzwerk und erkläre den Fehler in einem Kommentar.

**Zuordnungsliste**

\`\`\`text
  E0.0   B_Lichtschranke  Sensor Werkstueck
  E0.1   S_Reset          Taster Zaehler loeschen
  M20.0  M_Fl_Zaehl       Flankenmerker Zaehlimpuls
  M10.0  M_ChargeVoll     Charge vollstaendig
  MW12   Stueckzahl       aktueller Zaehlerstand
  DB3    IDB_Stueck       Instanzdaten CTU
\`\`\``,
      given: `  Netzwerk 1: FEHLERHAFT

                   +-------------------+
                   |  "IDB_Stueck"     |
                   |       CTU         |
     B_Lichtschr.  |                   |        M_ChargeVoll
  ----| |----------| CU              Q |-------( )----
                   |                   |
                   | R              CV |------ Stueckzahl
          100 -----| PV                |
                   +-------------------+`,
      starter: `  Netzwerk 1: Stueckzaehler (korrigiert)

  ----
  // TODO

  // Begruendung:
  // TODO`,
      solution: `  Netzwerk 1: Stueckzaehler (korrigiert)

                   +-------------------+
                   |  "IDB_Stueck"     |
                   |       CTU         |
     B_Lichtschr. M_Fl_Zaehl           |        M_ChargeVoll
  ----| |-----|P|--| CU              Q |-------( )----
                   |                   |
     S_Reset       |                   |
  ----| |----------| R              CV |------ Stueckzahl
                   |                   |
          100 -----| PV                |
                   +-------------------+

  // Begruendung:
  // 1. Ohne |P| steht das Sensorsignal mehrere Zyklen lang an und der
  //    Zaehler zaehlt in JEDEM dieser Zyklen hoch.
  // 2. Der Eingang R war unbeschaltet - ohne Reset-Quelle laesst sich der
  //    Zaehlerstand nicht auf 0 setzen.

  SCL:
  "IDB_Stueck"(CU := "M_Impuls_Zaehl", R := "S_Reset", PV := 100,
               Q => "M_ChargeVoll", CV => "Stueckzahl");`,
      hints: [
        'Zwei getrennte Probleme: ein Eingang ist falsch angesteuert, ein anderer gar nicht.',
        'Der Zähleingang `CU` braucht genau einen Impuls pro Werkstück. Der Eingang `R` braucht eine Quelle.',
        'Setze einen `|P|`-Kontakt mit eigenem Flankenmerker zwischen Sensor und `CU`. Verdrahte `S_Reset` über einen Schließer auf `R`.',
        '```text\n     B_Lichtschr. M_Fl_Zaehl           |        M_ChargeVoll\n  ----| |-----|?|--| CU              Q |-------( )----\n     ???????       |                   |\n  ----| |----------| R              CV |------ Stueckzahl\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Pumpe mit Trockenlaufschutz',
      level: 4,
      description: `Setze die folgende SCL-Logik in **drei** KOP-Netzwerke um.

\`\`\`pascal
// Pumpe mit Selbsthaltung, Aus-Vorrang
"K_Pumpe" := ("S_Start" OR "K_Pumpe") AND "S_Stopp" AND NOT "M_Trockenlauf";

// Druck muss innerhalb von 5 s aufgebaut sein
"IDB_Druck"(IN := "K_Pumpe" AND NOT "B_Druck", PT := T#5s, Q => "M_KeinDruck");

// Stoerung speichern, quittierbar
IF "M_KeinDruck" THEN
    "M_Trockenlauf" := TRUE;
END_IF;
IF "S_Quittung" THEN
    "M_Trockenlauf" := FALSE;
END_IF;
\`\`\`

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Start         Starttaster
  E0.1   S_Stopp         Stopptaster (Oeffner verdrahtet, Ruhe = 1)
  E0.2   B_Druck         Druckschalter (1 = Druck vorhanden)
  E0.3   S_Quittung      Quittiertaster
  A0.0   K_Pumpe         Schuetz Pumpe
  M10.0  M_KeinDruck     Druckueberwachung ausgeloest
  M10.1  M_Trockenlauf   gespeicherte Stoerung
  DB4    IDB_Druck       Instanzdaten TON
\`\`\`

**Hinweis:** Der Trockenlauf-Merker muss in zwei Netzwerken gesetzt bzw. zurückgesetzt werden – das sind insgesamt vier Netzwerke, wenn du Set und Reset trennst.`,
      starter: `  Netzwerk 1: Pumpe Selbsthaltung
  ----
  // TODO

  Netzwerk 2: Druckueberwachung
  ----
  // TODO

  Netzwerk 3: Stoerung setzen
  ----
  // TODO

  Netzwerk 4: Stoerung quittieren
  ----
  // TODO`,
      solution: `  Netzwerk 1: Pumpe Selbsthaltung

     S_Start            S_Stopp  M_Trockenlauf    K_Pumpe
  +---| |---+-------------| |-------|/|---------( )----
  |         |
  | K_Pumpe |
  +---| |---+

  Netzwerk 2: Druckueberwachung (Trockenlauf nach 5 s)

                              +-------------------+
                              |  "IDB_Druck"      |
                              |       TON         |
     K_Pumpe    B_Druck       |                   |     M_KeinDruck
  ----| |--------|/|----------| IN              Q |----( )----
                              |                   |
                   T#5s ------| PT             ET |
                              +-------------------+

  Netzwerk 3: Stoerung setzen

     M_KeinDruck                  M_Trockenlauf
  ----| |------------------------(S)----

  Netzwerk 4: Stoerung quittieren

     S_Quittung                   M_Trockenlauf
  ----| |------------------------(R)----`,
      hints: [
        'Vier Aufgaben, vier Netzwerke: Selbsthaltung, Zeitüberwachung, Störung setzen, Störung quittieren.',
        'Die Timer-Bedingung ist eine UND-Verknüpfung aus "Pumpe läuft" und "kein Druck" – die kommt links vom `IN` als Kontaktkette.',
        'Netzwerk 1: `S_Start` parallel zum Haltekontakt `K_Pumpe`, dann `S_Stopp` als Schließer (Öffner verdrahtet!) und `M_Trockenlauf` als Öffner, dann die Spule. Netzwerk 2: Schließer `K_Pumpe` und Öffner `B_Druck` vor der TON-Box. Netzwerk 3 und 4 sind ein Set/Reset-Paar.',
        '```text\n  Netzwerk 2:\n     K_Pumpe    B_Druck       |                   |     M_KeinDruck\n  ----| |--------|?|----------| IN              Q |----( )----\n                   T#?s ------| PT             ET |\n```',
      ],
    },
  ],
}

export default chapter
