# Kapitel 06 – Arrays, Structs & Timer

## Mental Model

```text
ARRAY   gleiche Dinge, über einen INDEX erreichbar
        aTemperaturen[1..8] OF Real         "Zone 1 bis 8"

STRUCT  verschiedene Dinge, die ZUSAMMENGEHÖREN
        stAuftrag.iNummer / .rMenge / .sKunde

UDT     ein STRUCT mit Namen, projektweit wiederverwendbar
        ARRAY[1..20] OF "UDT_Auftrag"       ← die Kombination ist das Ziel

TIMER   IEC-Baustein MIT Gedächtnis → braucht eine Instanz
        TON = Einschaltverzögerung, TOF = Ausschaltverzögerung, TP = Impuls
```

- Alle Größen stehen zur Übersetzungszeit fest. Es gibt keine Listen, die wachsen.
- Timer und Zähler sind **Funktionsbausteine**, keine Anweisungen – sie brauchen eine Instanz pro Verwendung.

## Syntax / API

### ARRAY

```pascal
VAR
    aTemperaturen : ARRAY[1..8] OF Real;
    aStoerbits    : ARRAY[0..15] OF Bool;
    aMeldungen    : ARRAY[1..5] OF String[32];
    aMatrix       : ARRAY[1..3, 1..4] OF Int;        // mehrdimensional
    aStartwerte   : ARRAY[1..4] OF Int := [10, 20, 30, 40];
    aNullen       : ARRAY[1..100] OF Int := [100(0)]; // 100-mal die 0
END_VAR

BEGIN
    aTemperaturen[3]  := 72.5;
    aMatrix[2, 3]     := 7;
    tiGroesse         := UPPER_BOUND(ARR := aTemperaturen, DIM := 1);
END_FUNCTION_BLOCK
```

- Untergrenze frei wählbar: `ARRAY[1..8]` (zählt wie Menschen) oder `ARRAY[0..15]` (passt zu Bitnummern).
- Index außerhalb der Grenzen → Zugriffsfehler (OB121), ohne diesen OB geht die CPU in STOP.

### STRUCT und UDT

```pascal
VAR
    stAuftrag : STRUCT
        iNummer : Int;
        rMenge  : Real;
        sKunde  : String[20];
        xAktiv  : Bool;
    END_STRUCT;
END_VAR

BEGIN
    stAuftrag.iNummer := 4711;
    stAuftrag.rMenge  := 250.0;
END_FUNCTION_BLOCK
```

Als **PLC-Datentyp (UDT)** wird dieselbe Struktur projektweit wiederverwendbar:

```pascal
TYPE "UDT_Auftrag"
VERSION : 0.1
STRUCT
    iNummer : Int;
    rMenge  : Real;
    sKunde  : String[20];
    xAktiv  : Bool;
END_STRUCT;
END_TYPE
```

```pascal
VAR
    stAktuell   : "UDT_Auftrag";
    aAuftraege  : ARRAY[1..20] OF "UDT_Auftrag";     // ARRAY OF STRUCT
END_VAR

BEGIN
    aAuftraege[5].iNummer := 4711;
    stAktuell             := aAuftraege[5];           // ganze Struktur kopieren
END_FUNCTION_BLOCK
```

UDTs sind das wichtigste Werkzeug gegen Schnittstellen mit 20 Einzelparametern:

```pascal
VAR_IN_OUT
    io_stAuftrag : "UDT_Auftrag";        // ein Parameter statt vier
END_VAR
```

### IEC-Timer

```pascal
VAR
    sTimerNachlauf : TON;        // On-Delay: Q kommt verzögert
    sTimerAbfall   : TOF;        // Off-Delay: Q bleibt verzögert
    sTimerImpuls   : TP;         // Pulse: Q für feste Dauer
END_VAR

BEGIN
    sTimerNachlauf(IN := i_xMotorLaeuft, PT := T#5s);
    IF sTimerNachlauf.Q THEN
        q_xLuefterAus := TRUE;
    END_IF;

    q_tRestzeit := sTimerNachlauf.PT - sTimerNachlauf.ET;
END_FUNCTION_BLOCK
```

| Timer | Verhalten |
|---|---|
| `TON` | `IN` wird TRUE → nach `PT` wird `Q` TRUE. `IN` fällt → `Q` sofort FALSE. |
| `TOF` | `IN` wird TRUE → `Q` sofort TRUE. `IN` fällt → `Q` erst nach `PT` FALSE. |
| `TP` | Flanke an `IN` → `Q` genau `PT` lang TRUE, unabhängig von `IN`. |

Ausgänge: `Q` (Bool) und `ET` (Time, abgelaufene Zeit).

### IEC-Zähler

```pascal
VAR
    sZaehlerAuf : CTU;           // Count Up
    sZaehlerAb  : CTD;           // Count Down
    sZaehlerBi  : CTUD;          // Up/Down
END_VAR

BEGIN
    sZaehlerAuf(CU := i_xTeilErkannt,      // zählt bei STEIGENDER Flanke
                R  := i_xReset,
                PV := 100);

    IF sZaehlerAuf.QU THEN                 // CV >= PV
        q_xPaletteVoll := TRUE;
    END_IF;

    q_iStueck := sZaehlerAuf.CV;           // aktueller Zählerstand
END_FUNCTION_BLOCK
```

| Zähler | Eingänge | Ausgänge |
|---|---|---|
| `CTU` | `CU`, `R`, `PV` | `QU` (CV ≥ PV), `CV` |
| `CTD` | `CD`, `LD`, `PV` | `QD` (CV ≤ 0), `CV` |
| `CTUD` | `CU`, `CD`, `R`, `LD`, `PV` | `QU`, `QD`, `CV` |

Die IEC-Zähler werten die Flanke an `CU`/`CD` **selbst** aus – ein zusätzlicher Flankenmerker ist nicht nötig.

### Flankenauswertung

Mit IEC-Bausteinen:

```pascal
VAR
    sFlankeStart : R_TRIG;       // steigende Flanke
    sFlankeStopp : F_TRIG;       // fallende Flanke
END_VAR

BEGIN
    sFlankeStart(CLK := i_xTaster);
    IF sFlankeStart.Q THEN
        sdiStarts := sdiStarts + 1;        // genau einmal je Tastendruck
    END_IF;
END_FUNCTION_BLOCK
```

Manuell, ohne Zusatzbaustein:

```pascal
VAR
    sxTasterAlt : Bool;
END_VAR
VAR_TEMP
    txFlanke : Bool;
END_VAR

BEGIN
    txFlanke    := i_xTaster AND NOT sxTasterAlt;      // steigend
    // fallend:    NOT i_xTaster AND sxTasterAlt
    sxTasterAlt := i_xTaster;                          // IMMER nachführen
END_FUNCTION_BLOCK
```

### TIME-Literale

```pascal
T#500ms
T#5s
T#1m30s
T#2h15m
T#1d_2h_30m_15s_500ms
tSumme := tA + tB;                   // Time-Arithmetik ist erlaubt
tHalb  := tA / 2;
diMs   := TIME_TO_DINT(tA);          // in Millisekunden
```

## Typische Use Cases

- **Temperaturzonen** eines Ofens: `ARRAY[1..8] OF Real` plus Schleife für Min/Max.
- **Auftragsliste**: `ARRAY[1..20] OF "UDT_Auftrag"` im Global-DB, Zugriff über einen Index.
- **Motornachlauf**: `TOF` – Lüfter läuft nach dem Abschalten noch 2 Minuten.
- **Anlaufwarnung**: `TP` – Hupe genau 3 s, egal wie lange der Taster gedrückt wird.
- **Entprellen / Störverzögerung**: `TON` – Störung erst melden, wenn sie 500 ms ansteht.
- **Palettenzähler**: `CTU` mit `PV := 100` und Reset nach dem Palettenwechsel.
- **Tastendruck zählen**: `R_TRIG` statt direkter Abfrage.

## Clean-Code-Empfehlungen

- UDT statt loser Einzelvariablen, sobald Daten zusammengehören.
- Array-Grenzen als `VAR CONSTANT` oder über `LOWER_BOUND`/`UPPER_BOUND` ansprechen.
- Timer- und Zählerinstanzen sprechend benennen: `sTimerNachlaufLuefter`, nicht `T1`.
- Timerzeiten als `VAR_INPUT` oder Konstante parametrieren, nie als Literal mitten im Code.
- Flankenmerker **immer** am Ende des Bausteins nachführen – sonst feuert die Flanke dauerhaft oder nie.
- Jede Timer-Instanz nur **einmal pro Zyklus** aufrufen.
- Strukturen als `VAR_IN_OUT` übergeben (Referenz), nicht als `VAR_INPUT` (Kopie).

## Häufige Fehler

```pascal
// FALSCH: Index außerhalb der Grenzen
VAR aZonen : ARRAY[1..8] OF Real; END_VAR
aZonen[i_iZone] := 80.0;                 // i_iZone könnte 0 oder 99 sein
// RICHTIG: Index begrenzen
aZonen[LIMIT(MN := 1, IN := i_iZone, MX := 8)] := 80.0;

// FALSCH: Timer-Instanz zweimal pro Zyklus aufgerufen
sTimer(IN := xA, PT := T#5s);
sTimer(IN := xB, PT := T#2s);            // zweiter Aufruf überschreibt alles
// RICHTIG: zwei Instanzen

// FALSCH: Timer ohne Aufruf abgefragt
IF sTimer.Q THEN ...                      // Timer läuft nie, Q bleibt FALSE
// RICHTIG: erst aufrufen, dann Q auswerten
sTimer(IN := xStart, PT := T#5s);
IF sTimer.Q THEN ...

// FALSCH: TON zum Nachlaufen verwendet
sTimer(IN := i_xMotor, PT := T#2m);
q_xLuefter := sTimer.Q;                   // Lüfter startet erst nach 2 min
// RICHTIG: TOF
sTimerNachlauf(IN := i_xMotor, PT := T#2m);
q_xLuefter := sTimerNachlauf.Q;

// FALSCH: Flankenmerker nicht nachgeführt
txFlanke := i_xTaster AND NOT sxTasterAlt;
IF txFlanke THEN sdiZaehler := sdiZaehler + 1; END_IF;
// sxTasterAlt := i_xTaster;   ← vergessen → zählt in JEDEM Zyklus

// FALSCH: Zeit als Zahl
sTimer(IN := xStart, PT := 5000);         // Int ist kein Time
// RICHTIG
sTimer(IN := xStart, PT := T#5s);

// FALSCH: IEC-Zähler zusätzlich flankenausgewertet
sFlanke(CLK := i_xTeil);
sZaehler(CU := sFlanke.Q, PV := 100);     // doppelte Flankenauswertung
// RICHTIG: CTU wertet die Flanke selbst aus
sZaehler(CU := i_xTeil, PV := 100);

// FALSCH: großes ARRAY OF STRUCT als VAR_INPUT
VAR_INPUT
    i_aAuftraege : ARRAY[1..100] OF "UDT_Auftrag";   // Kopie bei jedem Aufruf
END_VAR
// RICHTIG
VAR_IN_OUT
    io_aAuftraege : ARRAY[1..100] OF "UDT_Auftrag";
```

## Interview-relevante Details

- `TON`, `TOF`, `TP`, `CTU` sind **Funktionsbausteine** mit eigener Instanz – jede Verwendung braucht eine Multiinstanz oder einen Instanz-DB.
- Die Zeitbasis der IEC-Timer ist unabhängig von der Zykluszeit, aber die **Auflösung** ist es nicht: `Q` wird erst im nächsten Zyklusdurchlauf sichtbar. Mit 100 ms Zykluszeit ist `T#10ms` sinnlos.
- Der klassische S7-Timer (`S_EVERZ` / `SD`) ist durch die IEC-Timer abgelöst – IEC-Timer sind portabel und zählen nicht gegen ein CPU-Timer-Kontingent.
- `ET` läuft bei `TON` bis `PT` und bleibt dort stehen; nach Rücksetzen von `IN` wird `ET` sofort 0.
- `TP` ist nicht retriggerbar: Eine neue Flanke während des laufenden Impulses verlängert ihn nicht.
- `R_TRIG`/`F_TRIG` speichern den Vorzustand in ihrer Instanz – auch sie brauchen pro Signal eine eigene Instanz.
- UDTs sind versioniert: Nach einer Änderung müssen alle verwendenden Bausteine neu übersetzt und die DBs neu generiert werden.
- `ARRAY OF STRUCT` liegt zusammenhängend im Speicher; in optimierten Bausteinen übernimmt die CPU die Ausrichtung selbst, bei Standardzugriff entstehen Füllbytes.
- Bei einer Strukturzuweisung (`stA := stB;`) wird die **komplette** Struktur kopiert – bei großen UDTs ein echter Laufzeitfaktor.

## Zusammenfassung

- `ARRAY[u..o] OF Typ`, mehrdimensional mit `ARRAY[1..3, 1..4]`, Grenzen über `LOWER_BOUND`/`UPPER_BOUND`.
- `STRUCT … END_STRUCT` für zusammengehörige Daten, als **UDT** projektweit wiederverwendbar.
- `ARRAY OF UDT` ist das Standardmuster für Auftrags- und Rezeptlisten.
- `TON` verzögert das Einschalten, `TOF` das Ausschalten, `TP` erzeugt einen festen Impuls.
- `CTU`/`CTD`/`CTUD` zählen flankengesteuert; `QU` bei `CV >= PV`.
- `R_TRIG`/`F_TRIG` oder manueller Flankenmerker – den Altwert immer nachführen.
- Zeiten als `T#`-Literale; jede Timer-Instanz genau einmal pro Zyklus aufrufen.
