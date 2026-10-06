# Kapitel 05 – FC, FB & Instanz-DB

## Mental Model

```text
OB  (Organisationsbaustein)   ← Einstiegspunkt, ruft die CPU zyklisch auf
 │                              OB1 = Hauptzyklus, OB30ff = Weckalarm, OB100 = Anlauf
 ├─ FC  (Funktion)             ← KEIN Gedächtnis. Gleiche Eingänge → gleiches Ergebnis.
 │                              Wie eine statische Methode.
 └─ FB  (Funktionsbaustein)    ← MIT Gedächtnis im Instanz-DB.
       └─ Instanz-DB           ← Wie ein Objekt: FB = Klasse, Instanz-DB = Objekt.

DB  (Datenbaustein)
 ├─ Global-DB                  ← freie Datenablage, von überall lesbar
 └─ Instanz-DB                 ← gehört genau zu einem FB-Aufruf
```

- **FB = Klasse, Instanz-DB = Objekt.** Drei Förderbänder → ein FB, drei Instanz-DBs.
- Eine FC hat keinen Speicher. Alles, was sich über Zyklen merken soll, braucht einen FB oder einen Global-DB.

## Syntax / API

### FC mit Rückgabewert

```pascal
FUNCTION "FC_Skalieren" : Real
VAR_INPUT
    i_iRohwert : Int;
    i_rMax     : Real;
END_VAR
VAR_TEMP
    trWert : Real;                 // FC kennt nur TEMP
END_VAR

BEGIN
    trWert := INT_TO_REAL(i_iRohwert) / 27648.0 * i_rMax;
    #FC_Skalieren := trWert;        // Rückgabewert heißt wie der Baustein
END_FUNCTION
```

Aufruf:

```pascal
rDruck := "FC_Skalieren"(i_iRohwert := "Druck_Roh", i_rMax := 6.0);
```

Eine FC ohne Rückgabewert bekommt den Typ `Void`:

```pascal
FUNCTION "FC_Grundstellung" : Void
```

### FB mit Instanz-DB

```pascal
FUNCTION_BLOCK "FB_Motor"
VAR_INPUT
    i_xEin   : Bool;
    i_xAus   : Bool;
    i_xStoer : Bool;
END_VAR
VAR_OUTPUT
    q_xMotor  : Bool;
    q_diStarts: DInt;
END_VAR
VAR
    sxLaeuft    : Bool;             // statisch → Instanz-DB
    sxEinAlt    : Bool;             // für die Flanke
    sdiStarts   : DInt;
END_VAR

BEGIN
    IF i_xStoer OR i_xAus THEN
        sxLaeuft := FALSE;
    ELSIF i_xEin AND NOT sxEinAlt THEN     // steigende Flanke
        sxLaeuft  := TRUE;
        sdiStarts := sdiStarts + 1;
    END_IF;

    sxEinAlt   := i_xEin;
    q_xMotor   := sxLaeuft;
    q_diStarts := sdiStarts;
END_FUNCTION_BLOCK
```

Aufruf mit eigenem Instanz-DB:

```pascal
"DB_Motor_Band1"(i_xEin   := "Taster_Band1_Ein",
                 i_xAus   := "Taster_Band1_Aus",
                 i_xStoer := "Stoerung_Band1",
                 q_xMotor => "Schuetz_Band1");

"DB_Motor_Band2"(i_xEin   := "Taster_Band2_Ein", ...);
```

Beachte die Pfeile: `:=` versorgt Eingänge, `=>` nimmt Ausgänge entgegen.

### Multiinstanz

Ein FB, der selbst Bausteine mit Gedächtnis braucht, legt diese als **statische Variablen** an:

```pascal
FUNCTION_BLOCK "FB_Anlage"
VAR
    sMotorBand1 : "FB_Motor";       // Multiinstanz
    sMotorBand2 : "FB_Motor";
    sTimerAnlauf: TON;              // IEC-Timer ebenfalls als Multiinstanz
END_VAR

BEGIN
    sMotorBand1(i_xEin := i_xStartBand1, q_xMotor => q_xSchuetzBand1);
    sMotorBand2(i_xEin := i_xStartBand2, q_xMotor => q_xSchuetzBand2);

    sTimerAnlauf(IN := i_xAnlauf, PT := T#5s);
    IF sTimerAnlauf.Q THEN
        ...
    END_IF;
END_FUNCTION_BLOCK
```

Vorteil: nur **ein** Instanz-DB für die ganze Anlage statt vieler Einzel-DBs. Das ist der Normalfall in modernen TIA-Projekten.

### Parameterarten im Vergleich

| Art | Richtung | Übergabe | Typisch für |
|---|---|---|---|
| `VAR_INPUT` | rein | Kopie (Wert) | Taster, Sollwerte, Parameter |
| `VAR_OUTPUT` | raus | Kopie (Wert) | Schütze, Statusbits, Ergebnisse |
| `VAR_IN_OUT` | rein + raus | **Referenz** | Arrays, Structs, Zähler, Puffer |

```pascal
VAR_IN_OUT
    io_aPuffer : ARRAY[1..100] OF Real;    // Referenz: keine Kopie, keine L-Stack-Last
    io_diZaehler : DInt;                   // Wert wird gelesen UND zurückgeschrieben
END_VAR
```

### Statisch vs. temporär

```pascal
VAR          sZaehler : Int;  END_VAR    // Instanz-DB, überlebt den Zyklus, online beobachtbar
VAR_TEMP     tZaehler : Int;  END_VAR    // L-Stack, Startwert undefiniert, nach dem Aufruf weg
```

Merksatz: Alles, was im nächsten Zyklus noch gebraucht wird, ist **statisch**. Alles andere ist **temporär**.

### Aufruf aus dem OB

```pascal
ORGANIZATION_BLOCK "Main"
BEGIN
    // FC: Ergebnis sofort verwenden
    "DB_Prozess".rDruck := "FC_Skalieren"(i_iRohwert := "Druck_Roh", i_rMax := 6.0);

    // FB: braucht eine Instanz
    "DB_Motor_Band1"(i_xEin := "Start_Band1", q_xMotor => "Schuetz_Band1");
END_ORGANIZATION_BLOCK
```

## Typische Use Cases

- **FC**: Skalierung, Umrechnung, Grenzwertprüfung, Checksumme – alles ohne Gedächtnis.
- **FB**: Motorsteuerung, Ventilsteuerung, Schrittkette, Timer-Logik, Betriebsstundenzähler.
- **Multiinstanz**: Anlagenbaustein, der 8 identische Stationen enthält.
- **Global-DB**: Rezeptdaten, Anlagenparameter, Schnittstelle zum HMI.
- **Bibliotheksbaustein**: ein `FB_Motor`, der in 20 Projekten unverändert läuft.

## Clean-Code-Empfehlungen

- Ein Baustein, eine Aufgabe. `FB_Anlage` mit 2000 Zeilen ist keine Kapselung.
- Keine globalen Variablen direkt im FB lesen/schreiben – alles über die Schnittstelle. Nur so ist der Baustein wiederverwendbar.
- Instanz-DBs sprechend benennen: `DB_Motor_Band1`, nicht `DB17`.
- Multiinstanz der Einzel-DB-Flut vorziehen.
- Beim Aufruf **alle** Parameter benannt versorgen (`i_xEin := …`), nie positionsabhängig.
- Schnittstelle schmal halten: lieber ein UDT als 15 einzelne Eingänge.
- Nach Änderungen an der Schnittstelle Instanz-DBs neu generieren – sonst gibt es Inkonsistenzen beim Laden.

## Häufige Fehler

```pascal
// FALSCH: statische Variable in einer FC
FUNCTION "FC_Zaehler" : Int
VAR
    sZaehler : Int;                  // Übersetzungsfehler – FC hat keinen Speicher
END_VAR

// FALSCH: FB ohne Instanz aufgerufen
"FB_Motor"(i_xEin := xStart);        // Übersetzungsfehler: Instanz fehlt
// RICHTIG
"DB_Motor_Band1"(i_xEin := xStart);

// FALSCH: ein Instanz-DB für zwei Bänder
"DB_Motor"(i_xEin := "Start_Band1", q_xMotor => "Schuetz_Band1");
"DB_Motor"(i_xEin := "Start_Band2", q_xMotor => "Schuetz_Band2");
// Band 2 überschreibt den Zustand von Band 1!
// RICHTIG: je Band ein eigener Instanz-DB oder je eine Multiinstanz

// FALSCH: Ausgangsparameter mit := statt =>
"DB_Motor_Band1"(i_xEin := xStart, q_xMotor := "Schuetz");   // falsche Richtung
// RICHTIG
"DB_Motor_Band1"(i_xEin := xStart, q_xMotor => "Schuetz");

// FALSCH: globale Variable direkt im FB
IF "DB_Anlage".xFreigabe THEN ...    // Baustein ist nicht mehr wiederverwendbar
// RICHTIG: als VAR_INPUT durchreichen

// FALSCH: großes Array als VAR_INPUT
VAR_INPUT
    i_aMesswerte : ARRAY[1..1000] OF Real;   // wird bei JEDEM Aufruf kopiert
END_VAR
// RICHTIG
VAR_IN_OUT
    io_aMesswerte : ARRAY[1..1000] OF Real;  // Referenz

// FALSCH: VAR_OUTPUT lesen und weiterverrechnen
q_iZaehler := q_iZaehler + 1;        // Ausgang ist kein Gedächtnis
// RICHTIG: statisch zählen, am Ende ausgeben
sdiZaehler := sdiZaehler + 1;
q_diZaehler := sdiZaehler;
```

## Interview-relevante Details

- **FC vs. FB in einem Satz**: Die FC ist zustandslos, der FB hat mit dem Instanz-DB ein Gedächtnis.
- Ein FB kann mehrfach instanziiert werden – das ist der SPS-Weg zu Wiederverwendbarkeit, vergleichbar mit Objekten.
- Der Instanz-DB enthält INPUT-, OUTPUT-, IN_OUT- (als Zeiger) und STATIC-Variablen, **nicht** die TEMP-Variablen.
- `VAR_IN_OUT` übergibt eine Referenz; der aufgerufene Baustein schreibt direkt in die Originaldaten des Aufrufers.
- Bei nicht versorgten `VAR_INPUT`-Parametern eines FB bleibt der Wert aus dem Instanz-DB stehen (der letzte oder der Startwert) – bei einer FC ist Nichtversorgung ein Fehler.
- `VAR_OUTPUT` eines FB behält seinen Wert zwischen den Aufrufen, weil er im Instanz-DB liegt – trotzdem ist er kein Ersatz für eine statische Variable.
- Multiinstanz spart DBs und hält zusammengehörige Zustände beieinander; Einzelinstanzen sind besser online beobachtbar.
- OB100 (Anlauf) läuft einmal nach NETZ-EIN – dort gehören Initialisierungen hin, die nicht remanent sein dürfen.
- Eine FC kann einen FB **nicht** als Multiinstanz enthalten, weil ihr der Speicher fehlt.

## Zusammenfassung

- OB ruft auf, FC rechnet ohne Gedächtnis, FB merkt sich Zustand im Instanz-DB.
- FB = Klasse, Instanz-DB = Objekt. Pro Anlagenteil eine eigene Instanz.
- Rückgabewert einer FC: `FUNCTION "Name" : Typ` und `#Name := …;`
- Aufruf: Eingänge mit `:=`, Ausgänge mit `=>`, immer benannt.
- `VAR_INPUT`/`VAR_OUTPUT` kopieren, `VAR_IN_OUT` übergibt eine Referenz – große Daten gehören dorthin.
- Statisch = überlebt den Zyklus, temporär = Startwert undefiniert.
- Multiinstanz statt DB-Flut; keine globalen Zugriffe im Baustein, alles über die Schnittstelle.
