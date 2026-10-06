# Kapitel 02 – Logische Boxen & Negation

## Mental Model

```text
Netzwerk 1: Die drei Grundboxen

      +-------+        +-------+        +-------+
   A -|       |     A -|       |     A -|       |
      |   &   |-       |  >=1  |-       |  XOR  |-
   B -|       |     B -|       |     B -|       |
      +-------+        +-------+        +-------+

   alle wahr        mindestens einer    genau einer
   AND              OR                  XOR
```

Jede Box ist eine Wahrheitstabelle mit beliebig vielen Eingängen. Negation ist **kein eigener Baustein**, sondern ein kleiner Kreis `o` direkt an einem Eingang oder am Ausgang.

## Syntax / API

### UND-Box mit mehreren Eingängen

```text
Netzwerk 1: Freigabe Foerderband

              +-------+
  "Haupt" ----|       |
   "Tuer" ----|   &   |------( )  "Freigabe_Band"
 "Bereit" ----|       |
 "Quitt." ----|       |
              +-------+
```

```pascal
"Freigabe_Band" := "Haupt" AND "Tuer" AND "Bereit" AND "Quitt.";
```

Eine Box wird nicht gestapelt, sondern **erweitert**: im TIA Portal mit dem Symbol „Eingang einfügen". Acht Bedingungen = eine Box mit acht Eingängen.

### ODER-Box: Sammelstörung

```text
Netzwerk 2: Sammelstoerung

                   +-------+
 "Stoer_Motor" ----|       |
 "Stoer_Pumpe" ----|  >=1  |------( )  "Sammelstoerung"
 "Stoer_Netz"  ----|       |
                   +-------+
```

```pascal
"Sammelstoerung" := "Stoer_Motor" OR "Stoer_Pumpe" OR "Stoer_Netz";
```

### XOR: genau einer

```text
Netzwerk 3: Wechselschaltung Hallenlicht

              +-------+
 "Schalt_1" --|       |
              |  XOR  |------( )  "Licht"
 "Schalt_2" --|       |
              +-------+
```

```pascal
"Licht" := "Schalt_1" XOR "Schalt_2";
```

Bei mehr als zwei Eingängen gilt: XOR ist wahr, wenn eine **ungerade** Anzahl Eingänge wahr ist.

### Negation am Eingang

```text
Netzwerk 4: Motor laeuft, solange keine Stoerung ansteht

                +-------+
    "Start" ----|       |
                |   &   |------( )  "Motor"
 "Stoerung" ---o|       |
                +-------+
```

```pascal
"Motor" := "Start" AND NOT "Stoerung";
```

Der Kreis `o` invertiert **nur diesen einen Eingang**. Das ist das wichtigste Werkzeug für Öffner-Kontakte: Ein Not-Aus-Taster ist hardwareseitig ein Öffner, liefert im Gutzustand also `TRUE`.

### Negation am Ausgang

```text
Netzwerk 5: Lampe "Anlage steht"

              +-------+
    "Band" ---|       |
              |  >=1  |-----o( )  "Lampe_Stillstand"
   "Pumpe" ---|       |
              +-------+
```

```pascal
"Lampe_Stillstand" := NOT ("Band" OR "Pumpe");
```

Der Kreis vor der Zuweisung invertiert das Gesamtergebnis.

### Verschachtelung

```text
Netzwerk 6: (Auto UND Freigabe) ODER Hand, aber nie bei Stoerung

              +-------+
    "Auto" ---|       |
              |   &   |---+
"Freigabe" ---|       |   |      +-------+
              +-------+   +------|       |
                                 |  >=1  |---+
                      "Hand" ----|       |   |     +-------+
                                 +-------+   +-----|       |
                                                   |   &   |---( ) "Motor"
                                     "Stoerung" --o|       |
                                                   +-------+
```

```pascal
"Motor" := (("Auto" AND "Freigabe") OR "Hand") AND NOT "Stoerung";
```

### De Morgan in FUP

```text
Variante A: ODER mit negiertem Ausgang

              +-------+
       "A" ---|  >=1  |-----o( )  "Y"
       "B" ---|       |
              +-------+

Variante B: UND mit negierten Eingaengen   (identisches Verhalten)

              +-------+
       "A" --o|   &   |------( )  "Y"
       "B" --o|       |
              +-------+
```

```pascal
"Y" := NOT ("A" OR "B");          // Variante A
"Y" := NOT "A" AND NOT "B";       // Variante B
```

De Morgan: `NOT (A OR B) = NOT A AND NOT B` und `NOT (A AND B) = NOT A OR NOT B`. Wähle die Variante, die der **fachlichen Aussage** entspricht: „Weder Band noch Pumpe läuft" → Variante A.

## Typische Use Cases

- **Öffner einlesen**: Not-Aus, Endschalter und Motorschutz kommen als Öffner – Negation am Eingang.
- **Verriegelung**: `"Ventil_auf" AND NOT "Ventil_zu"` verhindert gleichzeitiges Ansteuern.
- **Sammelmeldung**: ODER-Box über alle Störbits.
- **Betriebsbereit-Lampe**: UND-Box über alle Freigaben, Negation für „nicht bereit".
- **Wechselschaltung / Plausibilitätsprüfung**: XOR – genau ein Signal muss anliegen.

## Clean-Code-Empfehlungen

- Maximal **zwei bis drei Verschachtelungsebenen** pro Netzwerk. Darüber hinaus Zwischenergebnis auf einen benannten Merker legen.
- Negation **am Eingang** statt eines separaten NOT-Netzwerks – das spart ein Bit und eine Zeile.
- Signalnamen positiv formulieren: `"Tuer_zu"` statt `"Tuer_nicht_offen"`. Doppelte Verneinung ist die häufigste Lesefalle.
- Bei Öffnern den Hardware-Typ im Namen führen: `"NotAus_Oeffner"` – dann ist die Negation im Netzwerk sofort plausibel.
- Gleichartige Bedingungen in **einer** Box bündeln statt in Ketten aus Zweier-Boxen.
- Netzwerktitel schreibt die Aussage im Klartext: „Band nur bei geschlossener Tür und ohne Störung".

## Häufige Fehler

```text
FALSCH – UND-Kette aus Zweier-Boxen, unnoetig breit

        +---+                +---+               +---+
  A ----| & |---+      +-----| & |---+     +-----| & |---( ) "Y"
  B ----|   |   +------|   | |       |     |     |   |
        +---+   C -----+---+ +-------+  D -+     +---+
```

```text
RICHTIG – eine Box mit vier Eingaengen

              +-------+
       "A" ---|       |
       "B" ---|   &   |------( )  "Y"
       "C" ---|       |
       "D" ---|       |
              +-------+
```

```pascal
"Y" := "A" AND "B" AND "C" AND "D";
```

```text
FALSCH – Not-Aus-Oeffner nicht negiert gedacht

              +-------+
   "Start" ---|       |
              |   &   |------( )  "Motor"
  "NotAus" --o|       |      <- NotAus ist ein OEFFNER: im Gutzustand TRUE
              +-------+         die Negation sperrt den Motor dauerhaft
```

```text
RICHTIG – Oeffner ohne Negation auswerten

              +-------+
   "Start" ---|       |
              |   &   |------( )  "Motor"
  "NotAus" ---|       |      <- TRUE = Kreis geschlossen = frei
              +-------+
```

```pascal
"Motor" := "Start" AND "NotAus";   // NotAus = TRUE bedeutet "nicht gedrueckt"
```

```text
FALSCH – Negation des Ergebnisses statt der Eingaenge gemeint

              +-------+
       "A" --o|   &   |------( )  "Y"      liefert NOT A AND NOT B
       "B" --o|       |
              +-------+

Gewollt war aber "nicht beide gleichzeitig" = NOT (A AND B).
```

```text
RICHTIG – Negation am Ausgang

              +-------+
       "A" ---|   &   |-----o( )  "Y"
       "B" ---|       |
              +-------+
```

```pascal
"Y" := NOT ("A" AND "B");
```

## Interview-relevante Details

- **Negation kostet keinen eigenen Baustein** – sie ist ein Attribut des Anschlusses. In AWL entspricht das `UN` statt `U`.
- **Öffner vs. Schließer**: Sicherheitsrelevante Signale (Not-Aus, Schutztür, Motorschutz) werden immer als Öffner verdrahtet, damit ein Drahtbruch zum sicheren Zustand führt. Im Programm werden sie daher **nicht** negiert.
- **De Morgan** ist die Standardfrage: `NOT (A AND B)` ≠ `NOT A AND NOT B`.
- **Leere Eingänge**: Ein unbeschalteter Eingang einer UND-Box wird vom Compiler als Fehler gemeldet, nicht stillschweigend als `TRUE` angenommen.
- **XOR mit mehreren Eingängen** ist erlaubt und prüft auf ungerade Parität – in der Praxis selten, oft ein Hinweis auf unklare Logik.
- **Lesbarkeitsgrenze**: Ab etwa drei Ebenen Verschachtelung ist ein FUP-Netzwerk schwerer zu lesen als die SCL-Zeile. Dann ist SCL die bessere Wahl (Kapitel 06).

## Zusammenfassung

- `&` = UND, `>=1` = ODER, `XOR` = genau einer – jeweils mit beliebig vielen Eingängen.
- Eingänge **erweitern** statt Boxen zu ketten.
- Negation ist ein Kreis `o` am Eingang (`NOT A`) oder am Ausgang (`NOT (...)`).
- Verschachtelung in FUP = Klammerung in SCL.
- De Morgan erlaubt das Umformen – wähle die fachlich lesbarere Form.
- Öffner-Signale wie Not-Aus werden **nicht** negiert.
- Ab drei Ebenen: Zwischenergebnis auf Merker oder nach SCL wechseln.
