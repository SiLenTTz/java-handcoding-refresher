# Kapitel 05 – Vergleicher, Mathe & MOVE

## Mental Model

```text
  Vergleicher = ein KONTAKT        Mathebox = eine BOX mit EN/ENO

     +-------+                     +-------------+
     | Temp  |                     |     ADD     |
  ---|  >=   |---( )----        ---| EN      ENO |---
     |  80   |                     |             |
     +-------+                     | IN1    OUT  |---
                                   | IN2         |
                                   +-------------+
```

Ein Vergleicher ist ein **Kontakt**: Er leitet, wenn die Bedingung stimmt – genau wie `| |`. Eine Mathe- oder MOVE-Box steht **im Strompfad**: Sie rechnet nur, wenn `EN` Strom bekommt, und gibt über `ENO` weiter.

## Syntax / API

### Vergleicher als Kontakt

```text
  Netzwerk 1: Luefter ab 80 Grad

     +---------+                 K_Luefter
  ---|  Temp   |----------------( )----
     |   >=    |
     |   80    |
     +---------+
```

```pascal
"K_Luefter" := "Temp" >= 80;
```

Die sechs Vergleichsoperationen: `==`, `<>`, `>`, `>=`, `<`, `<=`. Der Datentyp steht in der Box (`Int`, `Real`, `DInt`, `Time` …) und muss zu beiden Operanden passen.

### Vergleicher in Reihe und parallel

```text
  Netzwerk 1: Temperatur im Fenster 20..30 Grad

     +---------+     +---------+        M_ImFenster
  ---|  Temp   |-----|  Temp   |-------( )----
     |   >=    |     |   <=    |
     |   20    |     |   30    |
     +---------+     +---------+
```

```pascal
"M_ImFenster" := ("Temp" >= 20) AND ("Temp" <= 30);
```

```text
  Netzwerk 1: Alarm bei Unter- ODER Ueberschreitung

     +---------+                        M_Alarm
  +--|  Temp   |----------------------( )----
  |  |   <     |
  |  |    5    |
  |  +---------+
  |
  |  +---------+
  +--|  Temp   |
     |   >     |
     |   95    |
     +---------+
```

```pascal
"M_Alarm" := ("Temp" < 5) OR ("Temp" > 95);
```

### Vergleicher mit Bedingung kombinieren

```text
  Netzwerk 1: Heizung nur bei Freigabe und zu kalt

     Freigabe   +---------+            K_Heizung
  ----| |-------|  Temp   |-----------( )----
                |   <     |
                |   18    |
                +---------+
```

```pascal
"K_Heizung" := "Freigabe" AND ("Temp" < 18);
```

### MOVE – Wert kopieren

```text
  Netzwerk 1: Sollwert uebernehmen

                     +-------------+
                     |    MOVE     |
     S_Uebernehmen   |             |
  ----| |------------| EN      ENO |----
                     |             |
     "Sollwert_HMI" -| IN     OUT1 |---- "Sollwert_aktiv"
                     +-------------+
```

```pascal
IF "S_Uebernehmen" THEN
    "Sollwert_aktiv" := "Sollwert_HMI";
END_IF;
```

`MOVE` kopiert einen Wert. Mit mehreren `OUT`-Anschlüssen (`OUT1`, `OUT2` …) auch an mehrere Ziele.

### ADD / SUB / MUL / DIV

```text
  Netzwerk 1: Gesamtmenge berechnen

                     +-------------+
                     |  ADD  Int   |
     M_Rechnen       |             |
  ----| |------------| EN      ENO |----
                     |             |
     "MengeA" -------| IN1     OUT |---- "Gesamt"
     "MengeB" -------| IN2         |
                     +-------------+
```

```pascal
IF "M_Rechnen" THEN
    "Gesamt" := "MengeA" + "MengeB";
END_IF;
```

```text
  Netzwerk 1: Mittelwert aus zwei Messwerten

                     +-------------+        +-------------+
                     |  ADD  Real  |        |  DIV  Real  |
     M_Rechnen       |             |        |             |
  ----| |------------| EN      ENO |--------| EN      ENO |----
                     |             |        |             |
     "Mess1" --------| IN1     OUT |---+----| IN1     OUT |---- "Mittel"
     "Mess2" --------| IN2         |   |    |             |
                     +-------------+   |2.0-| IN2         |
                                       |    +-------------+
```

```pascal
IF "M_Rechnen" THEN
    "Mittel" := ("Mess1" + "Mess2") / 2.0;
END_IF;
```

Boxen lassen sich **in Reihe** schalten: `ENO` der ersten Box speist `EN` der zweiten. Das Zwischenergebnis läuft über eine Temp-Variable oder direkt auf den `IN` der Folgebox.

### EN und ENO

| Anschluss | Bedeutung |
|---|---|
| `EN` | Enable – die Box rechnet nur, wenn hier Strom ankommt |
| `ENO` | Enable Out – 1, wenn `EN` = 1 **und** die Operation fehlerfrei war |

```text
  Netzwerk 1: Division mit Fehlerauswertung

                     +-------------+
                     |  DIV  Int   |
     M_Rechnen       |             |        M_RechenFehler
  ----| |------------| EN      ENO |---------|/|------( )----
                     |             |
     "Summe" --------| IN1     OUT |---- "Schnitt"
     "Anzahl" -------| IN2         |
                     +-------------+
```

Ist `EN` = 0, wird die Box **gar nicht bearbeitet**: `OUT` behält seinen alten Wert, `ENO` ist 0. Das ist der häufigste Stolperstein – ein "alter" Wert sieht aus wie ein Rechenfehler.

### Division durch null

Bei `DIV` mit `IN2 = 0` wird `ENO` = 0 und `OUT` bleibt unverändert (die CPU geht bei Int-Division in den Fehlerpfad, je nach Konfiguration sogar in STOP). Deshalb vorher prüfen:

```text
  Netzwerk 1: Division nur bei gueltigem Divisor

     +---------+          +-------------+
  ---| Anzahl  |----------|  DIV  Int   |
     |   <>    |          |             |
     |    0    |          | EN      ENO |----
     +---------+          |             |
        "Summe" ----------| IN1     OUT |---- "Schnitt"
        "Anzahl" ---------| IN2         |
                          +-------------+
```

```pascal
IF "Anzahl" <> 0 THEN
    "Schnitt" := "Summe" / "Anzahl";
END_IF;
```

## Typische Use Cases

- Grenzwertüberwachung: Temperatur, Druck, Füllstand mit `>=` / `<=`.
- Toleranzfenster: zwei Vergleicher in Reihe.
- Sollwertübernahme vom HMI mit `MOVE` bei Flanke.
- Stückzahl-Soll/Ist-Vergleich: `CV >= PV` manuell nachbilden.
- Skalierung eines Analogwerts: `NORM_X` / `SCALE_X` bzw. `SUB` + `MUL` + `DIV`.
- Betriebsstunden summieren.
- Rezeptdaten aus einem DB in Arbeitsvariablen kopieren.

## Clean-Code-Empfehlungen

- Grenzwerte als benannte Konstanten oder DB-Variablen, nicht als Literale im Netzwerk: `"Param".Temp_Max` statt `80`.
- Datentypen bewusst wählen: Messwerte `Real`, Stückzahlen `Int`/`DInt`. Gemischte Typen vermeiden.
- Vor jeder Division prüfen, ob der Divisor ungleich null ist.
- `EN` nicht unbeschaltet lassen, wenn der Wert nur unter Bedingungen gültig ist – sonst rechnet die Box jeden Zyklus.
- Rechenketten mit mehr als zwei Boxen gehören in **SCL**, nicht in KOP.
- Ergebnisvariablen definiert initialisieren, damit "alter Wert" nicht wie "gültiges Ergebnis" aussieht.
- `ENO` auswerten, wenn ein Fehlschlag Konsequenzen hat.

## Häufige Fehler

```text
  FALSCH: EN unbeschaltet, Ergebnis gilt als immer gueltig

                     +-------------+
                     |  DIV  Int   |
  -------------------| EN      ENO |----
     "Summe" --------| IN1     OUT |---- "Schnitt"
     "Anzahl" -------| IN2         |
                     +-------------+

  RICHTIG: Divisor pruefen und EN nur dann setzen

     +---------+     +-------------+
  ---| Anzahl  |-----|  DIV  Int   |
     |   <>    |     | EN      ENO |----
     |    0    |     | IN1     OUT |---- "Schnitt"
     +---------+     | IN2         |
                     +-------------+
```

```text
  FALSCH: Vergleicher als Box ans Ende gezeichnet

                     +---------+
  -------------------|  Temp   |----
                     |   >=    |
                     |   80    |
                     +---------+
  -> ein Vergleicher ist ein KONTAKT, keine Spule. Es fehlt das Ziel.

  RICHTIG: Vergleicher im Strompfad, Spule am Ende

     +---------+                 K_Luefter
  ---|  Temp   |----------------( )----
     |   >=    |
     |   80    |
     +---------+
```

```text
  FALSCH: >= und > verwechselt bei Grenzwerten

     +---------+                 M_Voll
  ---| Fuell   |----------------( )----
     |   >     |
     |  100    |
     +---------+
  -> bei genau 100 % meldet die Anlage NICHT voll

  RICHTIG: >= verwenden, wenn der Grenzwert dazugehoeren soll
```

```text
  FALSCH: Int-Division erwartet Nachkommastellen

     "Summe" = 7, "Anzahl" = 2, Typ Int  ->  OUT = 3, nicht 3.5

  RICHTIG: Typ Real verwenden oder bewusst mit MOD weiterrechnen
```

## Interview-relevante Details

- Ein Vergleicher ist **logisch ein Kontakt** – er lässt sich in Reihe und parallel schalten wie jeder andere Kontakt.
- `EN` = 0 heißt: Die Box wird übersprungen. `OUT` behält den **alten** Wert, `ENO` wird 0. Das ist kein Nullsetzen.
- `ENO` ist 1 nur, wenn `EN` = 1 **und** die Operation ohne Fehler durchlief (kein Überlauf, keine Division durch null).
- Bei `Int` wird abgeschnitten, nicht gerundet: `7 / 2 = 3`. Für Nachkommastellen `Real` verwenden.
- `Real`-Vergleiche auf Gleichheit (`==`) sind wegen Rundungsfehlern unzuverlässig – besser ein Toleranzfenster.
- `MOVE` kopiert, es verschiebt nichts. Für Bereiche gibt es `MOVE_BLK` und `UMOVE_BLK` (unterbrechungsfrei).
- Boxen in Reihe (`ENO` → `EN`) sind in KOP möglich, machen das Netzwerk aber schnell unlesbar – ab drei Operationen auf SCL wechseln.
- Analogwerte werden mit `NORM_X` (Rohwert → 0.0..1.0) und `SCALE_X` (0.0..1.0 → physikalischer Wert) umgerechnet.

## Zusammenfassung

- Vergleicher sind **Kontakte**: `==`, `<>`, `>`, `>=`, `<`, `<=` – kombinierbar in Reihe (`AND`) und parallel (`OR`).
- Mathe- und MOVE-Boxen liegen **im Strompfad** und haben `EN`/`ENO`.
- `EN` = 0 → Box wird nicht bearbeitet, `OUT` behält den alten Wert, `ENO` = 0.
- `MOVE` kopiert einen Wert, entspricht `"Ziel" := "Quelle";` unter einer `IF`-Bedingung.
- Vor jeder Division den Divisor auf `<> 0` prüfen.
- `Int`-Division schneidet ab; für Nachkommastellen `Real` verwenden.
- Längere Rechenketten gehören in SCL.
