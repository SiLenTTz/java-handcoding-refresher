# Kapitel 04 – Schleifen

## Mental Model

```text
In der SPS gilt: der ZYKLUS ist die eigentliche Schleife.

  Zyklus n     →  Programm einmal von oben nach unten
  Zyklus n+1   →  wieder von vorne
  ...

Eine FOR/WHILE-Schleife läuft dagegen KOMPLETT INNERHALB EINES Zyklus.
Sie verlängert damit direkt die Zykluszeit.

  Zykluszeit  >  Überwachungszeit (Watchdog)  →  CPU geht in STOP
```

- Schleifen in SCL sind ein Werkzeug für **Datenverarbeitung** (Array durchsuchen, Summe bilden), nicht für Ablaufsteuerung.
- Ablauf über die Zeit steuert man mit **Schrittketten** und **Timern**, nie mit `WHILE … warten`.

## Syntax / API

### FOR

```pascal
FOR tiIndex := 1 TO 10 DO
    aWerte[tiIndex] := 0;
END_FOR;
```

Mit Schrittweite `BY`:

```pascal
FOR tiIndex := 0 TO 100 BY 10 DO     // 0, 10, 20, ... 100
    ...
END_FOR;

FOR tiIndex := 10 TO 1 BY -1 DO      // rückwärts
    ...
END_FOR;
```

- Die Laufvariable muss `Int`/`DInt` sein und gehört in `VAR_TEMP`.
- Start-, End- und Schrittwert werden **einmal beim Eintritt** ausgewertet – eine Änderung im Rumpf verlängert die Schleife nicht.
- Die Laufvariable nach der Schleife nicht weiterverwenden: ihr Wert ist implementierungsabhängig.

### WHILE – kopfgesteuert

```pascal
tiIndex := 1;
WHILE (tiIndex <= MAX_INDEX) AND NOT txGefunden DO
    IF aAuftraege[tiIndex].iNummer = i_iSuchNummer THEN
        txGefunden := TRUE;
    ELSE
        tiIndex := tiIndex + 1;
    END_IF;
END_WHILE;
```

Die Bedingung wird **vor** dem ersten Durchlauf geprüft – der Rumpf kann also null Mal laufen.

### REPEAT … UNTIL – fußgesteuert

```pascal
tiIndex := 0;
REPEAT
    tiIndex := tiIndex + 1;
    trSumme := trSumme + aMesswerte[tiIndex];
UNTIL (tiIndex >= MAX_INDEX) OR (trSumme > GRENZE)
END_REPEAT;
```

Der Rumpf läuft **mindestens einmal**. Beachte: Hinter der `UNTIL`-Bedingung steht **kein** Semikolon, erst nach `END_REPEAT;`.

### EXIT und CONTINUE

```pascal
FOR tiIndex := 1 TO MAX_INDEX DO
    IF aWerte[tiIndex] = 0 THEN
        CONTINUE;                      // Rest des Rumpfs überspringen
    END_IF;

    IF aWerte[tiIndex] > GRENZE THEN
        tiTreffer := tiIndex;
        EXIT;                          // Schleife sofort verlassen
    END_IF;

    trSumme := trSumme + INT_TO_REAL(aWerte[tiIndex]);
END_FOR;
```

`EXIT` verlässt **nur die innerste** Schleife. `RETURN` verlässt dagegen den ganzen Baustein.

### Schleife über ein Array

```pascal
VAR
    aMesswerte : ARRAY[1..20] OF Real;
END_VAR
VAR_TEMP
    tiIndex : Int;
    trSumme : Real;
END_VAR

BEGIN
    trSumme := 0.0;
    FOR tiIndex := 1 TO 20 DO
        trSumme := trSumme + aMesswerte[tiIndex];
    END_FOR;
    q_rMittelwert := trSumme / 20.0;
END_FUNCTION_BLOCK
```

Robuster mit den Grenzen aus dem Array selbst:

```pascal
FOR tiIndex := LOWER_BOUND(ARR := aMesswerte, DIM := 1)
            TO UPPER_BOUND(ARR := aMesswerte, DIM := 1) DO
    ...
END_FOR;
```

### Verschachtelte Schleifen und Zykluszeit

```pascal
// 100 x 100 = 10 000 Durchläufe IN EINEM ZYKLUS – gefährlich
FOR tiZ := 1 TO 100 DO
    FOR tiS := 1 TO 100 DO
        aMatrix[tiZ, tiS] := 0;
    END_FOR;
END_FOR;
```

Faustregel: Mehr als ein paar hundert Durchläufe pro Zyklus gehören aufgeteilt – z. B. pro Zyklus nur ein Teilbereich, Position in einer statischen Variablen merken.

### Arbeit auf mehrere Zyklen verteilen

```pascal
VAR
    sStartIndex : Int := 1;
END_VAR
VAR CONSTANT
    PAKETGROESSE : Int := 20;
    MAX_INDEX    : Int := 1000;
END_VAR

BEGIN
    tiEnde := MIN(IN1 := sStartIndex + PAKETGROESSE - 1, IN2 := MAX_INDEX);

    FOR tiIndex := sStartIndex TO tiEnde DO
        aDaten[tiIndex] := 0;
    END_FOR;

    IF tiEnde >= MAX_INDEX THEN
        sStartIndex := 1;                  // fertig, von vorn
    ELSE
        sStartIndex := tiEnde + 1;         // nächstes Paket im nächsten Zyklus
    END_IF;
END_FUNCTION_BLOCK
```

## Typische Use Cases

- **Mittelwert** über ein Messwert-Array bilden
- **Maximum/Minimum** und dessen Index suchen
- Array **initialisieren** oder löschen (Rezeptpuffer)
- **Schieberegister**: Werte um eine Position verschieben (Qualitätsverfolgung am Band)
- Störwort auf gesetzte Bits **durchsuchen** und erste Meldung ermitteln
- Rezeptliste nach einer Auftragsnummer **durchsuchen** (mit `EXIT` beim Treffer)

## Clean-Code-Empfehlungen

- Laufvariable in `VAR_TEMP` deklarieren und nur innerhalb der Schleife verwenden.
- Array-Grenzen über `VAR CONSTANT` oder `LOWER_BOUND`/`UPPER_BOUND` statt als Zahl im Code.
- Bei Suchschleifen mit `EXIT` arbeiten, statt sinnlos bis zum Ende weiterzulaufen.
- Eine Schleife pro Aufgabe; zwei Dinge gleichzeitig zu berechnen macht sie unlesbar.
- Schleifenlänge **begrenzbar** halten: eine Obergrenze gehört immer in die Abbruchbedingung, auch bei `WHILE`.
- Lange Verarbeitungen über mehrere Zyklen verteilen statt die Zykluszeit zu sprengen.

## Häufige Fehler

```pascal
// FALSCH: Warten mit WHILE – blockiert den Zyklus, Watchdog schlägt zu
WHILE NOT i_xSensorErreicht DO
    ;                                    // Eingang wird im Zyklus NIE aktualisiert!
END_WHILE;
// RICHTIG: Schrittkette + Timer

// FALSCH: Laufvariable im Rumpf verändert
FOR tiIndex := 1 TO 10 DO
    tiIndex := tiIndex + 1;              // verwirrend, Verhalten je nach Compiler
END_FOR;

// FALSCH: Array-Grenzen überschritten
VAR aWerte : ARRAY[1..10] OF Int; END_VAR
FOR tiIndex := 0 TO 10 DO                // Index 0 existiert nicht
    aWerte[tiIndex] := 0;                // Zugriffsfehler
END_FOR;
// RICHTIG
FOR tiIndex := 1 TO 10 DO

// FALSCH: WHILE ohne garantierte Abbruchbedingung
WHILE aWerte[tiIndex] <> 0 DO
    tiIndex := tiIndex + 1;              // läuft über das Array hinaus
END_WHILE;
// RICHTIG: Obergrenze mit in die Bedingung
WHILE (tiIndex <= MAX_INDEX) AND (aWerte[tiIndex] <> 0) DO

// FALSCH: Semikolon hinter UNTIL
REPEAT
    tiIndex := tiIndex + 1;
UNTIL tiIndex > 10;                      // Übersetzungsfehler
END_REPEAT;
// RICHTIG
UNTIL tiIndex > 10
END_REPEAT;

// FALSCH: EXIT soll beide Schleifen verlassen
FOR tiZ := 1 TO 10 DO
    FOR tiS := 1 TO 10 DO
        IF gefunden THEN EXIT; END_IF;   // verlässt nur die INNERE
    END_FOR;
END_FOR;
// RICHTIG: Merker setzen und in der äußeren Schleife ebenfalls prüfen

// FALSCH: Summe nicht initialisiert
FOR tiIndex := 1 TO 10 DO
    trSumme := trSumme + aWerte[tiIndex];   // trSumme ist TEMP → Startwert unbekannt
END_FOR;
// RICHTIG
trSumme := 0.0;
```

## Interview-relevante Details

- **Eingänge werden während einer Schleife nicht aktualisiert.** Das Prozessabbild wird nur am Zyklusanfang eingelesen – Warteschleifen auf einen Sensor blockieren die CPU bis zum Watchdog-STOP.
- Die **Zykluszeitüberwachung** (standardmäßig oft 150 ms) ist kein Vorschlag: Wird sie überschritten, ruft die CPU OB80 auf oder geht in STOP.
- `FOR` wertet die Grenzen genau einmal beim Eintritt aus – anders als `WHILE`.
- `EXIT` bezieht sich auf die innerste Schleife, `RETURN` verlässt den Baustein, `CONTINUE` springt zum nächsten Durchlauf.
- `REPEAT` läuft mindestens einmal; `WHILE` kann null Mal laufen.
- Es gibt keine dynamischen Arrays – die Obergrenze steht zur Übersetzungszeit fest, deshalb ist die maximale Schleifenlänge immer bekannt und abschätzbar.
- Bei zeitkritischen Aufgaben kann eine Schleife in einen **Weckalarm-OB** (z. B. OB30) verlagert werden, damit sie die Hauptzykluszeit nicht dominiert.

## Zusammenfassung

- `FOR … TO … BY … DO … END_FOR;`, `WHILE … DO … END_WHILE;`, `REPEAT … UNTIL … END_REPEAT;`
- Hinter `UNTIL` steht kein Semikolon.
- `EXIT` verlässt die innerste Schleife, `CONTINUE` überspringt den Rest des Durchlaufs, `RETURN` den Baustein.
- Schleifen sind für **Daten**, nicht für Ablauf oder Warten – dafür Schrittkette und Timer.
- Jede Schleife braucht eine garantierte Obergrenze; sonst drohen Endlosschleife und Watchdog-STOP.
- Array-Grenzen über Konstanten oder `LOWER_BOUND`/`UPPER_BOUND` absichern.
- Große Datenmengen paketweise über mehrere Zyklen verarbeiten.
