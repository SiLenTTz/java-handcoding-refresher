import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '06',
  flashcards: [
    { id: 'f1', front: 'Nenne die fünf S7-Timer.', back: '`SI` Impuls, `SV` verlängerter Impuls, `SE` Einschaltverzögerung, `SS` speichernde Einschaltverzögerung, `SA` Ausschaltverzögerung.' },
    { id: 'f2', front: 'Wie startet man einen S7-Timer?', back: 'Zeitwert **unmittelbar vor** dem Timerbefehl nach Akku 1 laden:\n\n```text\nU     "Start"\nL     S5T#5S\nSE    T 1\nU     T 1\n=     "Freigabe"\n```' },
    { id: 'f3', front: 'Welchen Bereich und welche Auflösung hat S5TIME?', back: '**10 ms bis 9990 s**. Der Wert besteht aus einem dreistelligen BCD-Wert und einer von vier Zeitbasen (10 ms, 100 ms, 1 s, 10 s). Je länger die Zeit, desto gröber die Auflösung.' },
    { id: 'f4', front: 'Welcher Timer eignet sich für einen Lüfternachlauf?', back: '`SA` (Ausschaltverzögerung): Der Ausgang geht sofort auf 1 und fällt erst nach Ablauf der Zeit ab. `SE` würde den Lüfter stattdessen verspätet **einschalten**.' },
    { id: 'f5', front: 'Unterschied `SE` und `SS`?', back: '`SE` braucht ein **statisches** Startsignal und fällt sofort zurück, wenn der Eingang abfällt. `SS` startet auf die **Flanke**, läuft selbstständig weiter und bleibt nach Ablauf auf 1, bis man ihn mit `R` zurücksetzt.' },
    { id: 'f6', front: 'Unterschied `L T 1` und `LC T 1`?', back: '`L T 1` lädt den Restzeitwert **binär** ohne Zeitbasis (zum Rechnen und Vergleichen). `LC T 1` lädt ihn als **BCD inklusive Zeitbasis** – für HMI-Anzeigen.' },
    { id: 'f7', front: 'Wie zählt man korrekt mit `ZV`?', back: 'Immer flankengesteuert:\n\n```text\nU     "Lichtschranke"\nFP    "FM_LS"\nZV    Z 1\n```\nOhne `FP` zählt der Zähler in jedem Zyklus hoch, solange das Signal ansteht.' },
    { id: 'f8', front: 'Welchen Wertebereich haben S7-Zähler?', back: '**0 bis 999**. Sie sättigen an den Grenzen: `ZV` bei 999 und `ZR` bei 0 bewirken nichts mehr, es gibt keinen Überlauf.' },
    { id: 'f9', front: 'Was liefert `U Z 1`?', back: '`1`, solange der Zählwert **größer als 0** ist. Für einen konkreten Vergleich muss man laden: `L Z 1` / `L 50` / `>=I`.' },
    { id: 'f10', front: 'Welche SFBs sind die IEC-Timer und -Zähler?', back: 'Timer: `TP` = SFB 3, `TON` = SFB 4, `TOF` = SFB 5. Zähler: `CTU` = SFB 0, `CTD` = SFB 1, `CTUD` = SFB 2. Alle brauchen einen Instanz-DB.' },
    { id: 'f11', front: 'Warum sind IEC-Timer den S7-Timern vorzuziehen?', back: 'S7-Timer `T 1..T 255` sind eine **globale, knappe Ressource** – ein FC mit fester Timernummer ist nicht mehrfach instanziierbar. IEC-Timer liegen im Instanz-DB, nutzen `TIME` (ms-genau, linear) und liefern mit `ET` die abgelaufene Zeit direkt.' },
    { id: 'f12', front: 'Wofür nutzt man das Taktmerkerbyte?', back: 'Für Blinklicht und langsame Takte ohne eigenen Timer. In der Hardwarekonfiguration wird z. B. `MB 100` projektiert: `M 100.5` = 1 Hz, `M 100.7` = 0,5 Hz, `M 100.3` = 2 Hz.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wann wird `A 4.0` gesetzt, wenn `"Start"` dauerhaft ansteht?',
      code: `      U     "Start"
      L     S5T#5S
      SE    T 1
      U     T 1
      =     A 4.0`,
      options: [
        'sofort, und fällt nach 5 s ab',
        'nach 5 s, und bleibt 1, solange `"Start"` ansteht',
        'für genau 5 s nach der Flanke',
        'gar nicht, `SE` braucht eine Flanke',
      ],
      correct: 1,
      explanation: '`SE` ist die Einschaltverzögerung: Der Timerausgang wird nach Ablauf der Zeit 1 und bleibt 1, solange das Startsignal ansteht. Fällt `"Start"` ab, geht auch `T 1` sofort auf 0.',
    },
    {
      id: 'q2',
      prompt: 'Wo ist der Fehler?',
      code: `      L     S5T#5S
      U     "Start"
      SE    T 1`,
      options: [
        '`SE` gibt es nicht, es heißt `SD`',
        'Der Zeitwert muss **unmittelbar vor** dem Timerbefehl geladen werden – `U "Start"` kann Akku 1 beeinflussen',
        '`S5T#5S` ist kein gültiger Zeitwert',
        '`U` darf nicht zwischen `L` und `SE` stehen, weil es das VKE zerstört',
      ],
      correct: 1,
      explanation: 'Die Reihenfolge ist: Startbedingung verknüpfen, dann Zeitwert laden, dann Timerbefehl. Steht das `L` zu früh, kann Akku 1 bis zum Timerbefehl bereits überschrieben sein.',
    },
    {
      id: 'q3',
      prompt: 'Der Lüfter soll nach dem Abschalten des Motors noch 30 s nachlaufen. Welche Folge ist richtig?',
      options: [
        '`U "Motor_Laeuft"` / `L S5T#30S` / `SE T 1` / `U T 1` / `= "Luefter"`',
        '`U "Motor_Laeuft"` / `L S5T#30S` / `SA T 1` / `U T 1` / `= "Luefter"`',
        '`U "Motor_Laeuft"` / `L S5T#30S` / `SI T 1` / `U T 1` / `= "Luefter"`',
        '`UN "Motor_Laeuft"` / `L S5T#30S` / `SE T 1` / `U T 1` / `= "Luefter"`',
      ],
      correct: 1,
      explanation: '`SA` (Ausschaltverzögerung) zieht sofort an und fällt erst 30 s nach Wegfall des Eingangssignals ab – genau das Nachlaufverhalten. `SE` würde den Lüfter stattdessen 30 s zu spät einschalten.',
    },
    {
      id: 'q4',
      prompt: 'Die Lichtschranke wird 2 Sekunden lang unterbrochen, die Zykluszeit beträgt 10 ms. Welchen Wert hat `Z 1` danach?',
      code: `      U     "Lichtschranke"
      ZV    Z 1`,
      options: ['`1`', '`2`', '`200` (bzw. gesättigt bei 999)', '`0`'],
      correct: 2,
      explanation: 'Ohne Flankenauswertung zählt `ZV` in **jedem Zyklus** mit VKE = 1 hoch: 2 s / 10 ms = 200 Impulse. Richtig wäre `U "Lichtschranke"` / `FP "FM_LS"` / `ZV Z 1`.',
    },
    {
      id: 'q5',
      prompt: 'Was steht nach dieser Folge in Akku 1, wenn `Z 1` den Zählwert 42 hat?',
      code: `      L     Z 1`,
      options: ['`42` als Binärwert', '`16#0042` als BCD', 'der Vorwahlwert', '`1`, weil der Zähler ungleich 0 ist'],
      correct: 0,
      explanation: '`L Z 1` lädt den Zählwert **binär** – damit kann man direkt vergleichen. `LC Z 1` würde `16#0042` als BCD liefern, was man nur zur Anzeige verwendet.',
    },
    {
      id: 'q6',
      prompt: 'Wo ist der Fehler?',
      code: `      LC    Z 1
      L     50
      >=I
      =     "Charge_voll"`,
      options: [
        '`>=I` gibt es nicht',
        '`LC` liefert BCD, `L 50` ist binär – der Vergleich ist unsinnig; richtig ist `L Z 1`',
        'Der Vergleich müsste `<=I` heißen',
        '`LC` darf nicht auf Zähler angewendet werden',
      ],
      correct: 1,
      explanation: 'BCD und Binär dürfen nicht gemischt verglichen werden. `LC` ist ausschließlich für Anzeigen (z. B. 7-Segment oder HMI) gedacht.',
    },
    {
      id: 'q7',
      prompt: 'Welche AWL-Folge entspricht dem SCL-Code `"TON_Band"(IN := Start, PT := T#10S); Band_Frei := "TON_Band".Q;`?',
      options: [
        '`U "Start"` / `L T#10S` / `SE T 1` / `U T 1` / `= "Band_Frei"`',
        '`CALL SFB 4, DB 4 ( IN := "Start", PT := T#10S, Q := "Band_Frei" )`',
        '`CALL SFB 5, DB 5 ( IN := "Start", PT := T#10S, Q := "Band_Frei" )`',
        '`U "Start"` / `L S5T#10S` / `SS T 1` / `U T 1` / `= "Band_Frei"`',
      ],
      correct: 1,
      explanation: '`TON` ist SFB 4 und wird mit Instanz-DB aufgerufen. SFB 5 wäre `TOF` (Ausschaltverzögerung). Die S7-Variante mit `SE` ist funktional ähnlich, nutzt aber S5TIME und eine globale Timernummer.',
    },
    {
      id: 'q8',
      prompt: 'Warum ist ein FC mit fest einprogrammiertem `T 5` problematisch?',
      options: [
        'Weil Timer nur in OBs verwendet werden dürfen',
        'Weil S7-Timer globale CPU-Ressourcen sind – zwei Aufrufe desselben FC teilen sich `T 5` und überschreiben sich gegenseitig',
        'Weil `T 5` bereits vom Betriebssystem belegt ist',
        'Weil FCs keine Timer aufrufen können',
      ],
      correct: 1,
      explanation: 'Ein FC ist ohne Instanzdaten nicht mehrfach verwendbar, sobald er feste Timer-/Zählernummern benutzt. Lösung: FB mit IEC-Timer im Instanz-DB – oder Timernummer als Parameter übergeben.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Lüfternachlauf',
      level: 1,
      description: `Der Lüfter einer Absaugung soll nach dem Abschalten des Motors noch **30 Sekunden** nachlaufen.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Motor_Laeuft\` | A 4.0 | BOOL | Rückmeldung Hauptantrieb |
| \`T_Nachlauf\` | T 1 | TIMER | Nachlaufzeit Lüfter |
| \`Luefter\` | A 4.1 | BOOL | Schütz Lüfter |

Wähle den **richtigen** der fünf Timertypen und begründe die Wahl im Kommentar.`,
      starter: `NETZWERK 1
TITEL: Luefternachlauf 30 s

      // TODO`,
      solution: `NETZWERK 1
TITEL: Luefternachlauf 30 s
// SA = Ausschaltverzoegerung: Der Timerausgang geht SOFORT auf 1 und
// faellt erst 30 s nach Wegfall des Eingangssignals ab.
// SE waere falsch - damit wuerde der Luefter 30 s zu SPAET anlaufen.

      U     "Motor_Laeuft"        // Startbedingung
      L     S5T#30S               // Zeitwert unmittelbar vor dem Timerbefehl
      SA    "T_Nachlauf"          // Ausschaltverzoegerung
      U     "T_Nachlauf"          // Timerausgang abfragen
      =     "Luefter"`,
      hints: [
        '"Sofort an, verzögert aus" beschreibt genau einen der fünf Timertypen.',
        'Du brauchst `U`, `L S5T#…`, den Timerbefehl `SA` und eine Abfrage `U T n` mit Zuweisung.',
        'U Motor_Laeuft → L S5T#30S → SA T_Nachlauf → U T_Nachlauf → = Luefter',
        'Die Reihenfolge ist immer: Startbedingung verknüpfen, **dann** Zeitwert laden, **dann** Timerbefehl. Ein `L` dazwischen würde Akku 1 zerstören.',
      ],
    },
    {
      id: 'k2',
      title: 'Stückzähler mit Chargenmeldung',
      level: 2,
      description: `Eine Lichtschranke zählt Teile auf einem Förderband.

**Anforderungen**

1. Jedes Teil zählt \`Z_Stueck\` um 1 hoch – zuverlässig, unabhängig davon, wie lange die Lichtschranke unterbrochen ist.
2. Der Taster \`Charge_Reset\` setzt den Zähler zurück (auf Flanke).
3. \`Charge_voll\` wird 1, sobald **50 Teile oder mehr** gezählt wurden.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Lichtschranke\` | E 2.0 | BOOL | Teil erkannt |
| \`Charge_Reset\` | E 2.1 | BOOL | Taster Charge zurücksetzen |
| \`FM_LS\` | M 12.0 | BOOL | Flankenmerker Lichtschranke |
| \`FM_Reset\` | M 12.1 | BOOL | Flankenmerker Reset |
| \`Z_Stueck\` | Z 1 | COUNTER | Stückzähler |
| \`Charge_voll\` | M 20.0 | BOOL | 50 Teile erreicht |`,
      starter: `NETZWERK 1
TITEL: Teile zaehlen
      // TODO

NETZWERK 2
TITEL: Charge zuruecksetzen
      // TODO

NETZWERK 3
TITEL: Chargenmeldung bei 50 Teilen
      // TODO`,
      solution: `NETZWERK 1
TITEL: Teile zaehlen
// Ohne FP wuerde der Zaehler in JEDEM Zyklus hochzaehlen,
// solange die Lichtschranke unterbrochen ist.

      U     "Lichtschranke"       // Teil erkannt
      FP    "FM_LS"               // genau ein Impuls pro Teil
      ZV    "Z_Stueck"            // vorwaerts zaehlen

NETZWERK 2
TITEL: Charge zuruecksetzen

      U     "Charge_Reset"
      FP    "FM_Reset"            // nur die steigende Flanke
      R     "Z_Stueck"            // Zaehler auf 0

NETZWERK 3
TITEL: Chargenmeldung bei 50 Teilen
// "U Z 1" wuerde nur "Zaehlwert > 0" liefern - fuer einen konkreten
// Vergleich muss der Zaehlwert BINAER geladen werden.

      L     "Z_Stueck"            // binaerer Zaehlwert
      L     50
      >=I                         // Zaehlwert >= 50
      =     "Charge_voll"`,
      hints: [
        'Zähleingänge brauchen immer eine Flanke. Für einen konkreten Zählwert reicht `U Z n` nicht aus.',
        'Du brauchst `FP`, `ZV`, `R` sowie `L Z n`, `L 50` und `>=I`.',
        'NW1: U Lichtschranke → FP FM_LS → ZV Z_Stueck. NW2: U Charge_Reset → FP FM_Reset → R Z_Stueck. NW3: L Z_Stueck → L 50 → >=I → = Charge_voll.',
        'Achte auf `L` statt `LC`: `LC` liefert BCD und darf nicht mit einer Binärkonstante verglichen werden.',
      ],
    },
    {
      id: 'k3',
      title: 'Zweihandbedienung mit Zeitfenster',
      level: 3,
      description: `An einer Presse müssen **beide** Taster innerhalb von **500 ms** betätigt werden, sonst gibt es keine Freigabe. Danach müssen beide Taster während des gesamten Hubs gedrückt bleiben.

**Anforderungen**

1. Sobald **einer** der beiden Taster betätigt wird, startet ein Zeitfenster von 500 ms (verlängerter Impuls – das Fenster läuft unabhängig davon, ob der Taster losgelassen wird).
2. \`Pressenhub\` wird freigegeben, wenn **beide** Taster gedrückt sind, das Zeitfenster noch läuft, das Schutzgitter geschlossen ist und keine Störung ansteht.
3. \`Zweihand_Fehler\` wird gesetzt, wenn das Zeitfenster abgelaufen ist und trotzdem nur **einer** der beiden Taster gedrückt ist.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Taster_links\` | E 0.0 | BOOL | Zweihandtaster links |
| \`Taster_rechts\` | E 0.1 | BOOL | Zweihandtaster rechts |
| \`Schutzgitter_zu\` | E 1.0 | BOOL | Schutzgitter geschlossen |
| \`Stoerung\` | M 10.0 | BOOL | Sammelstörung |
| \`T_Fenster\` | T 10 | TIMER | Zeitfenster 500 ms |
| \`Pressenhub\` | A 4.0 | BOOL | Ventil Pressenhub |
| \`Zweihand_Fehler\` | M 20.1 | BOOL | Zeitfenster verletzt |

**Tipp:** Für Punkt 3 hilft die Antivalenz aus Kapitel 02.`,
      starter: `NETZWERK 1
TITEL: Zeitfenster starten
      // TODO

NETZWERK 2
TITEL: Freigabe Pressenhub
      // TODO

NETZWERK 3
TITEL: Zweihandfehler
      // TODO`,
      solution: `NETZWERK 1
TITEL: Zeitfenster starten
// SV (verlaengerter Impuls) startet auf die Flanke und laeuft die volle
// Zeit, auch wenn der Taster zwischendurch losgelassen wird.
// Mit SE wuerde das Fenster bei jedem Tastenprellen neu beginnen.

      O     "Taster_links"        // einer der beiden Taster reicht zum Start
      O     "Taster_rechts"
      L     S5T#500MS
      SV    "T_Fenster"           // Zeitfenster 500 ms

NETZWERK 2
TITEL: Freigabe Pressenhub
// Beide Taster muessen WAEHREND des Fensters und waehrend des gesamten
// Hubs gedrueckt bleiben - deshalb hier eine reine UND-Kette.

      U     "Taster_links"
      U     "Taster_rechts"
      U     "T_Fenster"           // Zeitfenster laeuft noch
      U     "Schutzgitter_zu"
      UN    "Stoerung"
      =     "Pressenhub"

NETZWERK 3
TITEL: Zweihandfehler
// Antivalenz: genau einer der beiden Taster gedrueckt,
// und das Zeitfenster ist bereits abgelaufen.

      U     "Taster_links"
      X     "Taster_rechts"       // genau einer von beiden
      UN    "T_Fenster"           // Zeitfenster abgelaufen
      =     "Zweihand_Fehler"`,
      hints: [
        'Das Zeitfenster muss auch dann weiterlaufen, wenn der erste Taster kurz loslässt – das schließt die Einschaltverzögerung aus.',
        'Du brauchst `O`/`O` + `L S5T#500MS` + `SV`, eine UND-Kette mit `U T n` und für den Fehler `X` + `UN`.',
        'NW1: O links → O rechts → L S5T#500MS → SV T_Fenster. NW2: U links → U rechts → U T_Fenster → U Schutzgitter_zu → UN Stoerung → = Pressenhub. NW3: U links → X rechts → UN T_Fenster → = Zweihand_Fehler.',
        'Netzwerk 1 beginnt so:\n\n```text\n      O     "Taster_links"\n      O     "Taster_rechts"\n      L     S5T#500MS\n      SV    "T_Fenster"\n```\nIn einer echten Anlage übernimmt diese Funktion ein zertifizierter Sicherheitsbaustein – hier geht es um das AWL-Muster.',
      ],
    },
    {
      id: 'k4',
      title: 'Ampel-Schrittkette mit IEC-Timern',
      level: 4,
      description: `Programmiere eine Fußgängerampel als Schrittkette in einem **FB** – mit **IEC-Timern** statt S7-Timern, damit der Baustein mehrfach instanziierbar ist.

**Ablauf**

| Schritt | Zustand | Dauer | Weiter nach |
|---|---|---|---|
| 0 | Grundstellung: Fahrzeug grün, Fußgänger rot | — | Anforderung |
| 1 | Fahrzeug gelb | 3 s | Schritt 2 |
| 2 | Fahrzeug rot, Fußgänger grün | 10 s | Schritt 3 |
| 3 | Fahrzeug rot, Fußgänger rot (Räumzeit) | 2 s | Schritt 0 |

**Anforderungen**

1. Je ein \`STAT\`-Bit pro Schritt; beim Weiterschalten wird der neue Schritt gesetzt und der alte zurückgesetzt.
2. Die Anforderungstaste wirkt nur in Schritt 0 und muss flankenausgewertet werden.
3. Nutze \`SFB 4 (TON)\` mit je einer eigenen Instanz als \`STAT\`-Multiinstanz.
4. Schreibe am Ende ein Netzwerk, das die Ausgänge aus den Schrittbits bildet.

**Schnittstelle des FB "Ampel"**

| Name | Art | Typ |
|---|---|---|
| \`Anforderung\` | IN | BOOL |
| \`Kfz_Gruen\` | OUT | BOOL |
| \`Kfz_Gelb\` | OUT | BOOL |
| \`Kfz_Rot\` | OUT | BOOL |
| \`FG_Gruen\` | OUT | BOOL |
| \`FG_Rot\` | OUT | BOOL |
| \`Schritt_0\` … \`Schritt_3\` | STAT | BOOL |
| \`FM_Anf\` | STAT | BOOL |
| \`T_Gelb\`, \`T_Gruen\`, \`T_Raeum\` | STAT | SFB 4 (TON) |

**Vergleich:** Überlege dir beim Schreiben, wie viele Zeilen dieselbe Kette in SCL bräuchte.`,
      starter: `// ---------- FB "Ampel" ----------
NETZWERK 1
TITEL: Grundstellung herstellen
// Beim ersten Aufruf ist kein Schritt gesetzt.
      // TODO

NETZWERK 2
TITEL: Schritt 0 -> 1 (Anforderung)
      // TODO

NETZWERK 3
TITEL: Schritt 1 -> 2 (3 s Gelb)
      // TODO

NETZWERK 4
TITEL: Schritt 2 -> 3 (10 s Fussgaenger gruen)
      // TODO

NETZWERK 5
TITEL: Schritt 3 -> 0 (2 s Raeumzeit)
      // TODO

NETZWERK 6
TITEL: Ausgaenge aus den Schrittbits bilden
      // TODO`,
      solution: `// ---------- FB "Ampel" ----------
NETZWERK 1
TITEL: Grundstellung herstellen
// Ist kein Schritt aktiv (erster Aufruf nach Neustart), Schritt 0 setzen.

      UN    #Schritt_0
      UN    #Schritt_1
      UN    #Schritt_2
      UN    #Schritt_3
      S     #Schritt_0

NETZWERK 2
TITEL: Schritt 0 -> 1 (Anforderung)
// Flankenauswertung: Dauerdruck auf die Taste darf die Kette
// nicht mehrfach weiterschalten.

      U     #Anforderung
      FP    #FM_Anf
      U     #Schritt_0
      S     #Schritt_1
      R     #Schritt_0

NETZWERK 3
TITEL: Schritt 1 -> 2 (3 s Gelb)
// IEC-Timer als Multiinstanz: Der Timer gehoert zum Instanz-DB des FB,
// deshalb ist der Baustein beliebig oft instanziierbar - anders als
// bei einem festen "SE T 1".

      CALL  #T_Gelb (
            IN := #Schritt_1,
            PT := T#3S )

      U     #T_Gelb.Q
      U     #Schritt_1
      S     #Schritt_2
      R     #Schritt_1

NETZWERK 4
TITEL: Schritt 2 -> 3 (10 s Fussgaenger gruen)

      CALL  #T_Gruen (
            IN := #Schritt_2,
            PT := T#10S )

      U     #T_Gruen.Q
      U     #Schritt_2
      S     #Schritt_3
      R     #Schritt_2

NETZWERK 5
TITEL: Schritt 3 -> 0 (2 s Raeumzeit)

      CALL  #T_Raeum (
            IN := #Schritt_3,
            PT := T#2S )

      U     #T_Raeum.Q
      U     #Schritt_3
      S     #Schritt_0
      R     #Schritt_3

NETZWERK 6
TITEL: Ausgaenge aus den Schrittbits bilden
// Ausgaenge werden NUR hier beschrieben - ein Ausgang, eine Zuweisung.

      U     #Schritt_0
      =     #Kfz_Gruen

      U     #Schritt_1
      =     #Kfz_Gelb

      U(
      O     #Schritt_2
      O     #Schritt_3
      )
      =     #Kfz_Rot

      U     #Schritt_2
      =     #FG_Gruen

      U(
      O     #Schritt_0
      O     #Schritt_1
      O     #Schritt_3
      )
      =     #FG_Rot

// ---------- Vergleich: dieselbe Weiterschaltung in SCL ----------
// #T_Gelb(IN := #Schritt_1, PT := T#3S);
// IF #Schritt_1 AND #T_Gelb.Q THEN
//     #Schritt_1 := FALSE;
//     #Schritt_2 := TRUE;
// END_IF;
//
// Vier Zeilen statt zwoelf - und der Zustandsautomat laesst sich
// mit CASE #Schritt OF ... sogar auf eine einzige INT-Variable reduzieren.`,
      hints: [
        'Eine Schrittkette ist immer dasselbe Muster: Weiterschaltbedingung UND aktueller Schritt → neuen Schritt setzen, alten zurücksetzen. Ausgänge werden separat aus den Schrittbits gebildet.',
        'Du brauchst `S`/`R` für die Schrittbits, `FP` für die Anforderung, `CALL #Instanz ( IN := …, PT := … )` für die IEC-Timer und `#Instanz.Q` zum Abfragen.',
        'Pro Übergang: `U #Timer.Q` → `U #Schritt_n` → `S #Schritt_n+1` → `R #Schritt_n`. Der Timer wird mit `IN := #Schritt_n` angesteuert, läuft also nur im jeweiligen Schritt.',
        'Netzwerk 3 beginnt so:\n\n```text\n      CALL  #T_Gelb (\n            IN := #Schritt_1,\n            PT := T#3S )\n\n      U     #T_Gelb.Q\n      U     #Schritt_1\n```\nDie Grundstellung in Netzwerk 1 ist nötig, weil nach einem Neustart alle `STAT`-Bits auf 0 stehen und die Kette sonst nie anläuft.',
      ],
    },
  ],
}

export default chapter
