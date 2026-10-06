# Kapitel 02 – Operatoren & Ausdrücke

## Mental Model

```text
Ausdruck  →  liefert einen WERT       z. B.  rA * 2.0 + rB
Anweisung →  macht etwas, endet mit ;  z. B.  rErg := rA * 2.0 + rB;

Rangfolge (oben bindet am stärksten):
  ( )
  **                       Potenz
  - (Vorzeichen) , NOT
  * , / , MOD , DIV
  + , -
  < , > , <= , >= 
  = , <>                   Gleichheit
  AND  ( &  ist dasselbe )
  XOR
  OR
```

- Alles, was einen Wert hat, ist ein Ausdruck – auch `xA AND xB`. Das Ergebnis eines booleschen Ausdrucks ist das **VKE** (Verknüpfungsergebnis).
- SCL ist **streng typisiert**: `Int` und `Real` sind nicht dasselbe, auch wenn die CPU vieles stillschweigend konvertiert.

## Syntax / API

### Zuweisung

```pascal
q_xMotor  := i_xStart;             // := ist Zuweisung
rSoll     := 12.5;
xGleich   := (iA = iB);            // = ist VERGLEICH, nicht Zuweisung
xUngleich := (iA <> iB);           // <> statt !=
```

Merksatz: `:=` schreibt, `=` fragt.

### Arithmetik

```pascal
iSumme   := iA + iB;
iDiff    := iA - iB;
iProdukt := iA * iB;
rQuotient:= rA / rB;               // Real-Division
iGanz    := iA / iB;               // Int/Int → abgeschnittene Int-Division!
iRest    := iA MOD iB;             // Rest der Division
iGanz2   := iA DIV iB;             // explizite Ganzzahldivision (IEC)
rPotenz  := rBasis ** 2.0;         // Potenz, Operanden Real
iNeg     := -iA;
```

- `7 / 2` ergibt bei `Int`-Operanden **3**, nicht 3.5. Nachkommastellen werden abgeschnitten, nicht gerundet.
- `MOD` behält in SCL das Vorzeichen des **Dividenden**: `-7 MOD 3 = -1`.
- Division durch 0 bei `Int` → CPU-Fehler (OB121 bzw. Stopp). Bei `Real` → `+inf` / `NaN`.

### Vergleichsoperatoren

```pascal
iA <  iB      iA <= iB
iA >  iB      iA >= iB
iA =  iB      iA <> iB
```

Vergleichbar sind nur typgleiche Operanden. `Time` lässt sich direkt vergleichen (`tIst >= T#5s`), `String` ebenfalls (lexikografisch).

### Boolesche Operatoren

```pascal
q_xFreigabe := i_xHandEin AND NOT i_xStoerung;
q_xMelden   := i_xStoer1 OR i_xStoer2 OR i_xStoer3;
q_xWechsel  := i_xA XOR i_xB;          // genau einer von beiden
q_xAus      := NOT i_xEin;
```

Dieselben Schlüsselwörter arbeiten auf `Byte`/`Word`/`DWord` **bitweise**:

```pascal
wMaske    := wStatus AND 16#00FF;      // untere 8 Bit ausblenden
wGesetzt  := wStatus OR  2#0000_0001;  // Bit 0 setzen
wGetoggelt:= wStatus XOR 16#FFFF;      // alle Bits invertieren
```

### Typkonvertierung

```pascal
// Explizit (so machen):
rWert   := INT_TO_REAL(iRoh);
iWert   := REAL_TO_INT(rMesswert);     // RUNDET kaufmännisch zur nächsten GERADEN Zahl
iAbschn := TRUNC(rMesswert);           // schneidet ab Richtung 0
iGerund := ROUND(rMesswert);           // rundet
diGross := INT_TO_DINT(iKlein);
rAusDI  := DINT_TO_REAL(diGross);
tZeit   := DINT_TO_TIME(diMillis);
diMs    := TIME_TO_DINT(tZeit);
sText   := INT_TO_STRING(iStueck);
```

| Funktion | Verhalten bei 2.5 | Verhalten bei 3.5 | bei −2.5 |
|---|---|---|---|
| `ROUND` / `REAL_TO_INT` | 2 | 4 | −2 |
| `TRUNC` | 2 | 3 | −2 |
| `CEIL` | 3 | 4 | −2 |
| `FLOOR` | 2 | 3 | −3 |

`REAL_TO_INT` rundet nach IEC **zur nächsten geraden Zahl** (Banker's Rounding) – das überrascht fast jeden.

### Implizite Konvertierung

```pascal
rWert := iRoh;          // geht (Int → Real, verlustfrei) – aber unleserlich
iWert := rMesswert;     // FEHLER bzw. Datenverlust: Real → Int ist nicht implizit erlaubt
diA   := iB;            // geht (Int → DInt)
iB    := diA;           // geht NICHT implizit (könnte überlaufen)
```

Regel: Implizit nur „nach oben“ (kleiner → größer, verlustfrei). Alles andere explizit schreiben.

### Bitzugriffe

```pascal
xBit0   := wStatus.%X0;        // Bit 0 eines Word
xBit15  := wStatus.%X15;
byLow   := dwWert.%B0;         // Byte 0 eines DWord
wLow    := dwWert.%W0;         // Word 0 eines DWord
"DB_Daten".wStoerung.%X3 := TRUE;
```

Bei optimierten Bausteinen funktioniert der Scheibenzugriff (`.%X0`) weiterhin, nur die absolute Byte-Adressierung entfällt.

### Mathematische Funktionen

```pascal
rAbs  := ABS(rWert);
rWurz := SQRT(rWert);
rLn   := LN(rWert);
rSin  := SIN(rWinkelRad);
rMin  := MIN(IN1 := rA, IN2 := rB);
rMax  := MAX(IN1 := rA, IN2 := rB);
rBegr := LIMIT(MN := 0.0, IN := rSoll, MX := 100.0);   // Begrenzer
```

`LIMIT` ist in der Praxis Gold wert: Sollwerte immer begrenzen, bevor sie an den Antrieb gehen.

## Typische Use Cases

- **Analogwert skalieren**: Rohwert `0…27648` → `0.0…10.0 bar`.
- **Freigabekette**: `q_xFreigabe := xHandEin AND xSicherheit AND NOT xStoerung;`
- **Sammelstörung**: `q_xSammel := wStoerungen <> 16#0000;`
- **Prozentrechnung** mit `Real`, dann `ROUND` für die Anzeige am HMI.
- **Begrenzung** von Sollwerten mit `LIMIT`.
- **Bitmaske** auswerten: `IF wStatus AND 16#0004 <> 0 THEN …`

## Clean-Code-Empfehlungen

- Klammern setzen, auch wenn die Rangfolge passt: `IF (xA AND xB) OR xC THEN`.
- Lange Freigabeketten in benannte Zwischenvariablen zerlegen (`tSicherheitOk`, `tBetriebsartOk`).
- Konvertierungen **immer explizit** schreiben – so sieht der Leser, dass hier ein Typwechsel passiert.
- Real-Literale mit Punkt (`100.0`), nie `100` in Real-Ausdrücken.
- Magische Zahlen in `VAR CONSTANT` auslagern (`ROHWERT_MAX : Int := 27648`).
- Sollwerte mit `LIMIT` begrenzen, statt hinterher mit IF zu korrigieren.

## Häufige Fehler

```pascal
// FALSCH: Int-Division verliert alles
rProzent := iIst / iSoll * 100.0;          // 30/100 = 0 → 0.0
// RICHTIG: zuerst konvertieren
rProzent := INT_TO_REAL(iIst) / INT_TO_REAL(iSoll) * 100.0;

// FALSCH: Zuweisung statt Vergleich
IF iZustand := 3 THEN                      // Übersetzungsfehler
// RICHTIG
IF iZustand = 3 THEN

// FALSCH: Ungleich wie in C
IF iA != iB THEN
// RICHTIG
IF iA <> iB THEN

// FALSCH: Rangfolge missverstanden
xErg := xA OR xB AND xC;                   // = xA OR (xB AND xC)
// RICHTIG (wenn anders gemeint)
xErg := (xA OR xB) AND xC;

// FALSCH: Rundung unterschätzt
iAnzeige := REAL_TO_INT(2.5);              // ergibt 2, nicht 3!
// RICHTIG, wenn immer abschneiden gewünscht ist
iAnzeige := TRUNC(2.5);                    // 2
// RICHTIG, wenn kaufmännisch aufgerundet werden soll
iAnzeige := TRUNC(2.5 + 0.5);              // 3

// FALSCH: Real auf Gleichheit prüfen
IF rIst = 10.0 THEN                        // trifft wegen Rundung fast nie zu
// RICHTIG: Toleranzband
IF ABS(rIst - 10.0) < 0.01 THEN

// FALSCH: Division durch 0 nicht abgefangen
rQuotient := rA / rB;                      // rB = 0.0 → inf
// RICHTIG
IF rB <> 0.0 THEN rQuotient := rA / rB; ELSE rQuotient := 0.0; END_IF;

// FALSCH: Überlauf durch Zwischenergebnis
iErg := iA * 1000;                         // iA = 100 → 100000 passt nicht in Int
// RICHTIG
diErg := INT_TO_DINT(iA) * 1000;
```

## Interview-relevante Details

- **Rangfolge**: `NOT` > `AND` > `XOR` > `OR`. `AND` bindet stärker als `OR` – wie `*` vor `+`.
- SCL kennt **kein Short-Circuit** im Sinne garantierter Auswertungsreihenfolge: Verlass dich nicht darauf, dass der rechte Operand bei `xA AND xB` ungeprüft bleibt.
- `DIV` und `/` verhalten sich bei Ganzzahlen gleich (Abschneiden); `DIV` macht die Absicht sichtbar.
- `MOD` mit negativem Dividenden liefert ein negatives Ergebnis – für „ringförmige“ Indizes vorher ins Positive bringen.
- Division durch Null: `Int` → Programmierfehler (OB121 nötig, sonst STOP), `Real` → `+/-inf`, keine Exception.
- `Real`-Vergleiche nie mit `=`, immer mit Toleranzband (Epsilon).
- Implizite Konvertierung existiert nur verlustfrei „nach oben“; TIA warnt sonst oder bricht ab (abhängig von der IEC-Prüfung in den Bausteineigenschaften).
- Die IEC-Prüfung lässt sich pro Baustein abschalten – das verbirgt echte Typfehler und sollte **an** bleiben.

## Zusammenfassung

- `:=` zuweisen, `=` vergleichen, `<>` statt `!=`.
- Int-Division schneidet ab: vor Prozentrechnungen nach `Real` konvertieren.
- Rangfolge: Klammern > `**` > `NOT` > `* / MOD DIV` > `+ -` > Vergleiche > `AND` > `XOR` > `OR`.
- Konvertierung explizit: `INT_TO_REAL`, `REAL_TO_INT`, `TRUNC`, `ROUND`, `TIME_TO_DINT`.
- `REAL_TO_INT` rundet zur nächsten geraden Zahl – `TRUNC` schneidet ab.
- Bitzugriff über `.%X0`, `.%B0`, `.%W0`; `AND`/`OR`/`XOR` arbeiten auf Word bitweise.
- `LIMIT`, `MIN`, `MAX`, `ABS` statt selbstgebauter IF-Kaskaden.
