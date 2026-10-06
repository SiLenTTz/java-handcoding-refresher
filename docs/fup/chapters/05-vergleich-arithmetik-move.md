# Kapitel 05 – Vergleich, Arithmetik & MOVE

## Mental Model

```text
Netzwerk 1: Von Zahlen zu Bits und zurueck

   Wortwelt (Int/Real)        Bitwelt (Bool)        Wortwelt

      +--------+                                   +--------+
      |  CMP   |              +-------+            |  MOVE  |
  IN1-|   >=   |--------------|   &   |---- EN ----|EN   ENO|
  IN2-|  Int   |              |       |        IN -|      OUT|-- OUT
      +--------+              +-------+            +--------+

   Vergleichsbox       Verknuepfungslogik       Wert schreiben
   Wort  ->  Bit            Bit -> Bit            Bit steuert Wort
```

Vergleichsboxen sind die **Brücke von der Wortwelt in die Bitwelt**: Sie nehmen Zahlen und liefern ein Bit. Rechen- und MOVE-Boxen gehen den umgekehrten Weg: Ein Bit (`EN`) entscheidet, ob eine Operation auf Zahlen ausgeführt wird.

## Syntax / API

### Vergleichsbox als Eingangsbedingung

```text
Netzwerk 1: Pumpe ein, wenn Fuellstand unter 20 %

                  +--------+
   "Fuellstand" --|   <    |
                  |  Int   |----+        +-------+
            20 ---|        |    +--------|       |
                  +--------+             |   &   |------( )  "Pumpe"
                                "Hand" --|       |
                                         +-------+
```

```pascal
"Pumpe" := ("Fuellstand" < 20) AND "Hand";
```

Die Vergleichsbox hat zwei Werteingänge und einen Bit-Ausgang. Der Datentyp steht unter dem Operator und muss zu **beiden** Eingängen passen.

| Box | Bedeutung | SCL |
|---|---|---|
| `==` | gleich | `=` |
| `<>` | ungleich | `<>` |
| `>` / `>=` | größer / größer gleich | `>` / `>=` |
| `<` / `<=` | kleiner / kleiner gleich | `<` / `<=` |

### Bereichsprüfung: zwei Vergleiche in einer UND-Box

```text
Netzwerk 2: Temperatur im Sollfenster 60..80 Grad

                  +--------+
     "Temp_Ist" --|  >=    |
                  |  Real  |----+
          60.0 ---|        |    |     +-------+
                  +--------+    +-----|       |
                                      |   &   |------( )  "Temp_OK"
                  +--------+    +-----|       |
     "Temp_Ist" --|  <=    |    |     +-------+
                  |  Real  |----+
          80.0 ---|        |
                  +--------+
```

```pascal
"Temp_OK" := ("Temp_Ist" >= 60.0) AND ("Temp_Ist" <= 80.0);
```

### MOVE – Wert kopieren

```text
Netzwerk 3: Sollwert aus dem Rezept uebernehmen

                              +-----------+
                              |   MOVE    |
     "Rezept_gewaehlt" -------|EN      ENO|
      "Rezept".Soll_Temp -----|IN     OUT1|------  "Soll_Temp"
                              +-----------+
```

```pascal
IF "Rezept_gewaehlt" THEN
    "Soll_Temp" := "Rezept".Soll_Temp;
END_IF;
```

`MOVE` kopiert `IN` nach `OUT1`. Mehrere Ausgänge (`OUT1`, `OUT2`, …) sind möglich – derselbe Wert geht an mehrere Ziele.

### ADD, SUB, MUL, DIV

```text
Netzwerk 4: Gesamtmenge bilden

                              +-----------+
                              |    ADD    |
                              |    Int    |
          "Impuls" ----------|EN      ENO|
        "Menge_A" ----------|IN1     OUT|------  "Menge_Gesamt"
        "Menge_B" ----------|IN2        |
                              +-----------+
```

```pascal
IF "Impuls" THEN
    "Menge_Gesamt" := "Menge_A" + "Menge_B";
END_IF;
```

```text
Netzwerk 5: Prozentwert berechnen – Rechenboxen verketten

           +---------+                 +---------+
           |   MUL   |                 |   DIV   |
           |   Int   |                 |   Int   |
   "Ist" --|IN1   OUT|--------------IN1-|IN1   OUT|------ "Prozent"
     100 --|IN2      |                 |IN2      |
           |      ENO|------------- EN -|EN    ENO|
           +---------+                 +---------+
                              "Max" ----|IN2      |
```

```pascal
"Prozent" := ("Ist" * 100) / "Max";
```

Die Verkettung läuft über `OUT → IN1` **und** `ENO → EN`. Nur so wird die zweite Box übersprungen, wenn die erste einen Fehler meldet.

### EN und ENO

```text
Netzwerk 6: EN unbeschaltet – Box rechnet jeden Zyklus

                              +-----------+
                              |    ADD    |
                              |    Int    |
                       (frei)-|EN      ENO|
          "A" --------------|IN1     OUT|------  "Summe"
          "B" --------------|IN2        |
                              +-----------+
```

```pascal
"Summe" := "A" + "B";     // keine Bedingung, laeuft immer
```

- **`EN` unbeschaltet** → die Box wird in **jedem Zyklus** ausgeführt. Das ist bei reinen Rechenoperationen meist gewollt.
- **`EN` beschaltet** → die Box rechnet nur, wenn `EN` wahr ist. `OUT` behält sonst den **alten Wert** – es wird nicht auf 0 gesetzt.
- **`ENO`** ist `TRUE`, wenn die Box ohne Fehler gelaufen ist. Bei Überlauf oder Division durch null wird `ENO` `FALSE`.

### Datentypen an den Eingängen

```text
Netzwerk 7: Typkonflikt vermeiden – erst wandeln, dann rechnen

         +-----------+           +-----------+
         |CONV Int   |           |    MUL    |
         |  to Real  |           |   Real    |
  "Int"--|IN     OUT |-------IN1-|IN1    OUT |------ "Ergebnis_Real"
         +-----------+           |IN2        |
                          1.5 ---|           |
                                 +-----------+
```

```pascal
"Ergebnis_Real" := INT_TO_REAL("Int") * 1.5;
```

`Int` und `Real` lassen sich nicht direkt mischen. `CONV` (bzw. `INT_TO_REAL`, `REAL_TO_INT`) wandelt explizit. `REAL_TO_INT` **rundet** kaufmännisch, `TRUNC` schneidet ab.

## Typische Use Cases

- **Grenzwertüberwachung**: `CMP >` auf Druck, Temperatur, Füllstand.
- **Behälterfüllung**: `<` startet die Pumpe, `>=` stoppt sie (mit Hysterese, siehe unten).
- **Stückzahl prüfen**: `CMP ==` auf den `CV`-Ausgang eines Zählers.
- **Rezeptverwaltung**: `MOVE` kopiert Sollwerte aus einem Rezept-DB in die Arbeitsvariablen.
- **Skalierung**: `NORM_X` + `SCALE_X` statt handgerechneter Dreisatz-Ketten.
- **Betriebsstundenzähler**: `ADD` mit `EN` von einem Sekundentakt.

## Clean-Code-Empfehlungen

- Vergleichswerte als **benannte Konstanten** oder Parameter-DB-Variablen führen: `"Param".Grenze_oben` statt `80`.
- Immer mit **Hysterese** arbeiten: Ein einzelner Vergleich an der Schaltschwelle lässt das Ventil flattern.
- Pro Netzwerk eine fachliche Berechnung. Lange Rechenketten gehören nach SCL.
- Datentypen explizit wandeln, nicht auf implizite Konvertierung hoffen.
- Division immer gegen Division durch null absichern – per `CMP <> 0` auf `EN` oder über `ENO`.
- `MOVE` mit `EN` nur dort, wo der alte Wert bewusst stehenbleiben soll; sonst `EN` offenlassen.

## Häufige Fehler

```text
FALSCH – eine Schwelle fuer Ein und Aus (Ventil flattert)

                  +--------+
   "Fuellstand" --|   <    |
                  |  Int   |-----------------( )  "Pumpe"
            50 ---|        |
                  +--------+

Bei Fuellstand = 50 schaltet die Pumpe im Zyklustakt ein und aus.
```

```text
RICHTIG – Hysterese ueber SR-Baustein

                  +--------+          +--------+
   "Fuellstand" --|   <    |          |      SR|
                  |  Int   |----------|S       |---( )  "Pumpe"
            20 ---|        |          |        |
                  +--------+          |        |
                  +--------+          |        |
   "Fuellstand" --|   >=   |----------|R1      |
                  |  Int   |          +--------+
            80 ---|        |
                  +--------+
```

```pascal
IF "Fuellstand" >= 80 THEN
    "Pumpe" := FALSE;
ELSIF "Fuellstand" < 20 THEN
    "Pumpe" := TRUE;
END_IF;
```

```text
FALSCH – EN beschaltet, alter Wert bleibt unbemerkt stehen

                              +-----------+
                              |    DIV    |
          "Freigabe" --------|EN      ENO|
            "Soll" ---------|IN1     OUT|------  "Faktor"
           "Teiler" --------|IN2        |
                              +-----------+

Wird "Freigabe" FALSE, behaelt "Faktor" den letzten Wert –
und die nachgelagerte Logik rechnet mit veralteten Daten weiter.
```

```text
RICHTIG – Gueltigkeit mitfuehren

                              +-----------+
                              |    DIV    |
          "Freigabe" --------|EN      ENO|------( )  "Faktor_gueltig"
            "Soll" ---------|IN1     OUT|------  "Faktor"
           "Teiler" --------|IN2        |
                              +-----------+
```

```pascal
"Faktor_gueltig" := FALSE;
IF "Freigabe" AND "Teiler" <> 0 THEN
    "Faktor"         := "Soll" / "Teiler";
    "Faktor_gueltig" := TRUE;
END_IF;
```

```text
FALSCH – Int-Division verliert die Nachkommastellen

           +---------+
           |   DIV   |
           |   Int   |
     "7" --|IN1   OUT|------  "Ergebnis"      -> 2, nicht 2.33
     "3" --|IN2      |
           +---------+
```

```text
RICHTIG – vor der Division nach Real wandeln

         +-----------+          +---------+
         |CONV Int   |          |   DIV   |
         |  to Real  |          |  Real   |
    7 ---|IN     OUT |------IN1-|IN1   OUT|------  "Ergebnis_Real"
         +-----------+          |IN2      |
                          3.0 --|         |
                                +---------+
```

```pascal
"Ergebnis_Real" := INT_TO_REAL(7) / 3.0;   // 2.333...
```

```text
FALSCH – Real mit == vergleichen

                  +--------+
     "Temp_Ist" --|   ==   |
                  |  Real  |-----------------( )  "Erreicht"
          72.5 ---|        |
                  +--------+

Gleitkommawerte treffen den Vergleichswert praktisch nie exakt.
```

```text
RICHTIG – Toleranzband pruefen

                  +--------+
     "Temp_Ist" --|   >=   |----+
                  |  Real  |    |     +-------+
          72.4 ---|        |    +-----|   &   |---( )  "Erreicht"
                  +--------+    +-----|       |
                  +--------+    |     +-------+
     "Temp_Ist" --|   <=   |----+
                  |  Real  |
          72.6 ---|        |
                  +--------+
```

```pascal
"Erreicht" := ("Temp_Ist" >= 72.4) AND ("Temp_Ist" <= 72.6);
```

## Interview-relevante Details

- **`EN` unbeschaltet heißt „immer ausführen"** – nicht „nie ausführen". Das ist die klassische Fangfrage.
- **`OUT` behält bei `EN = FALSE` den alten Wert.** Die Box setzt nichts zurück.
- **`ENO` weiterverdrahten**: Nur mit `ENO → EN` wird eine Folgebox bei einem Fehler übersprungen. Ohne Verdrahtung rechnet sie mit Müll weiter.
- **Int-Überlauf**: `Int` geht bis 32767. Bei Überlauf wird `ENO` `FALSE` und `OUT` ist undefiniert – bei Mengenberechnungen `DInt` nehmen.
- **`REAL_TO_INT` rundet**, `TRUNC` schneidet ab. `REAL_TO_INT(2.5)` ergibt 2 (Round-half-to-even), `REAL_TO_INT(3.5)` ergibt 4.
- **Skalierung analoger Werte**: `NORM_X` normiert den Rohwert (z. B. 0…27648) auf 0.0…1.0, `SCALE_X` rechnet daraus den physikalischen Wert. Nie von Hand ausmultiplizieren.
- **Vergleichsbox hat keinen `EN`-Eingang** – sie ist reine Logik und läuft immer.

## Zusammenfassung

- Vergleichsboxen (`==`, `<>`, `>`, `>=`, `<`, `<=`) wandeln Zahlen in ein Bit und dienen als Eingangsbedingung.
- Der Datentyp unter dem Operator muss zu beiden Eingängen passen.
- `MOVE` kopiert `IN` nach `OUT1`; mehrere Ausgänge sind möglich.
- `ADD`, `SUB`, `MUL`, `DIV` rechnen mit `IN1`/`IN2` → `OUT`.
- `EN` unbeschaltet = läuft jeden Zyklus; `EN = FALSE` lässt `OUT` unverändert.
- `ENO` meldet Fehler und sollte beim Verketten an das nächste `EN` gehen.
- `Int` und `Real` nie mischen – explizit mit `CONV` wandeln.
- Schaltschwellen immer mit Hysterese, Real nie mit `==` vergleichen.
