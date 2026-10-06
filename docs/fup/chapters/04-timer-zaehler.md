# Kapitel 04 – Timer & Zähler

## Mental Model

```text
Netzwerk 1: IEC-Timer als Box mit vier Anschluessen

                +-----------+
                |    TON    |      IN  Startbedingung (Bool)
                | "DB_Timer"|      PT  Vorgabezeit    (Time)
      "IN" -----|IN        Q|---   Q   Ausgang        (Bool)
     T#5s  -----|PT       ET|---   ET  abgelaufene Zeit (Time)
                +-----------+

   TON  Einschaltverzoegerung   Q kommt PT nach IN
   TOF  Ausschaltverzoegerung   Q geht PT nach IN-Abfall
   TP   Impuls                  Q ist genau PT lang TRUE
```

Timer und Zähler sind **Bausteine mit Gedächtnis**. Jede Verwendung braucht eine eigene Instanz (Instanz-DB oder Multiinstanz), und der Baustein muss **jeden Zyklus** aufgerufen werden, damit er weiterlaufen kann.

## Syntax / API

### TON – Einschaltverzögerung

```text
Netzwerk 1: Luefter laeuft 5 s nach dem Motor an

                   +-----------+
                   |    TON    |
                   |"DB_Luefter"|
     "Motor" ------|IN        Q|------( )  "Luefter"
       T#5s  ------|PT       ET|
                   +-----------+
```

```pascal
"DB_Luefter"(IN := "Motor", PT := T#5s);
"Luefter" := "DB_Luefter".Q;
```

Solange `IN` wahr ist, läuft `ET` hoch. Erreicht `ET` den Wert `PT`, wird `Q` wahr und bleibt wahr, bis `IN` abfällt. Fällt `IN` vorher ab, wird `ET` auf `T#0s` zurückgesetzt – der Timer fängt von vorn an.

### TOF – Ausschaltverzögerung

```text
Netzwerk 2: Nachlauf der Absaugung

                   +-----------+
                   |    TOF    |
                   |"DB_Nachl" |
     "Motor" ------|IN        Q|------( )  "Absaugung"
      T#10s  ------|PT       ET|
                   +-----------+
```

```pascal
"DB_Nachl"(IN := "Motor", PT := T#10s);
"Absaugung" := "DB_Nachl".Q;
```

`Q` wird sofort mit `IN` wahr und bleibt nach dem Abfall von `IN` noch `PT` lang wahr.

### TP – Impuls fester Länge

```text
Netzwerk 3: Hupe 2 s beim Anlauf

                   +-----------+
                   |     TP    |
                   | "DB_Hupe" |
     "Start" ------|IN        Q|------( )  "Hupe"
       T#2s  ------|PT       ET|
                   +-----------+
```

```pascal
"DB_Hupe"(IN := "Start", PT := T#2s);
"Hupe" := "DB_Hupe".Q;
```

Der Impuls ist **nicht nachtriggerbar**: Ein zweiter `IN`-Impuls während des laufenden Impulses hat keine Wirkung.

### Zeitliterale

```text
   T#500ms        T#2s        T#1m30s       T#1h_15m
   T#0s           T#5S        T#2M_30S      (Gross-/Kleinschreibung egal)
```

`PT` hat den Datentyp `Time` (32 Bit, Auflösung 1 ms, max. ca. 24 Tage). Eine Vorgabe aus einem HMI legst du als `Time`-Variable an, nicht als `Int`.

### CTU – Vorwärtszähler

```text
Netzwerk 4: 100 Teile zaehlen

                    +-----------+
                    |    CTU    |
                    |"DB_Teile" |
       "P_LS".Q ----|CU        Q|------( )  "Charge_voll"
       "Reset" -----|R        CV|------       "Ist_Anzahl"
           100 -----|PV         |
                    +-----------+
```

```pascal
"DB_Teile"(CU := "P_LS".Q, R := "Reset", PV := 100);
"Charge_voll" := "DB_Teile".Q;
"Ist_Anzahl"  := "DB_Teile".CV;
```

| Anschluss | Bedeutung |
|---|---|
| `CU` | Count Up – zählt bei **jeder positiven Flanke** +1 |
| `R` | Reset – setzt `CV` auf 0 |
| `PV` | Preset Value – Sollwert |
| `Q` | wahr, sobald `CV >= PV` |
| `CV` | Current Value, aktueller Zählstand |

### CTD und CTUD

```text
Netzwerk 5: Rueckwaertszaehler – Restmenge

                    +-----------+
                    |    CTD    |
                    |"DB_Rest"  |
       "P_Teil".Q --|CD        Q|------( )  "Leer"
        "Laden" ----|LD      CV |
             50 ----|PV         |
                    +-----------+
```

```pascal
"DB_Rest"(CD := "P_Teil".Q, LD := "Laden", PV := 50);
"Leer" := "DB_Rest".Q;        // Q = TRUE sobald CV <= 0
```

`CTUD` vereint beides: `CU`, `CD`, `R`, `LD`, `PV` und die Ausgänge `QU` (`CV >= PV`), `QD` (`CV <= 0`) und `CV`.

### Timer als Eingangsbedingung

```text
Netzwerk 6: Trockenlaufschutz – Stoerung nach 3 s ohne Durchfluss

                                  +-----------+
                                  |    TON    |
              +-------+           |"DB_Trocken"|
   "Pumpe" ---|   &   |-----------|IN        Q|------(S)  "Stoer_Trocken"
"Durchfluss"-o|       |    T#3s --|PT       ET|
              +-------+           +-----------+
```

```pascal
"DB_Trocken"(IN := "Pumpe" AND NOT "Durchfluss", PT := T#3s);
IF "DB_Trocken".Q THEN "Stoer_Trocken" := TRUE; END_IF;
```

Der `IN`-Eingang nimmt jedes Bit-Ergebnis an – also auch den Ausgang einer UND-Box.

## Typische Use Cases

- **Anlaufwarnung**: `TP` auf die Hupe, danach Freigabe.
- **Nachlauf**: `TOF` für Lüfter, Absaugung, Kühlung.
- **Entprellen / Plausibilität**: `TON` mit `T#200ms` auf ein wackeliges Sensorsignal.
- **Überwachung**: `TON` startet mit der Bewegung, `Q` meldet „Endlage nicht erreicht".
- **Stückzahl**: `CTU` mit Flanke von der Lichtschranke, `Q` meldet „Charge voll".
- **Ampelphasen**: mehrere `TON` in Reihe, jeder startet den nächsten.

## Clean-Code-Empfehlungen

- Jeder Timer bekommt einen **sprechenden Instanznamen**: `"DB_Nachlauf_Absaugung"`, nicht `"DB1"`.
- Zeitwerte, die der Betreiber ändern soll, als `Time`-Variable in einem Parameter-DB führen – nicht als Literal im Netzwerk.
- Pro Netzwerk **ein** Timer. Timer-Ketten gehören in aufeinanderfolgende Netzwerke mit klaren Titeln.
- `ET` nur verwenden, wenn die Restzeit wirklich angezeigt wird – sonst unbeschaltet lassen.
- `CU` **immer** über eine Flanke ansteuern, nie direkt mit einem Sensorsignal.
- `R` eines Zählers an genau eine Quelle hängen; mehrere Reset-Gründe vorher in einer ODER-Box bündeln.

## Häufige Fehler

```text
FALSCH – Timer steht in einem Netzwerk, das nicht jeden Zyklus laeuft
(z. B. in einem per SPRUNG uebersprungenen Bereich oder in einem FC,
der nur bedingt aufgerufen wird)

   "Bedingung" --[ Sprung ueberspringt Netzwerk 7 ]
   Netzwerk 7:  TON wird nicht bearbeitet -> ET bleibt stehen, Q haengt
```

```text
RICHTIG – Timer immer bearbeiten, Bedingung auf IN legen

                   +-----------+
              +----|    TON    |
  "Bedingung"-|IN  |"DB_Zeit"  |
              |           Q    |------( )  "Fertig"
       T#5s --|PT        ET    |
              +-----------+
```

```pascal
"DB_Zeit"(IN := "Bedingung", PT := T#5s);   // laeuft jeden Zyklus
```

```text
FALSCH – derselbe Instanz-DB an zwei Timern

Netzwerk 1:  TON "DB_Zeit"   IN = "Motor"
Netzwerk 2:  TON "DB_Zeit"   IN = "Pumpe"    <- gleiche Instanz!

Beide teilen sich ET und Q -> unvorhersehbares Verhalten.
```

```text
RICHTIG – je Timer eine eigene Instanz

Netzwerk 1:  TON "DB_Zeit_Motor"
Netzwerk 2:  TON "DB_Zeit_Pumpe"
```

```text
FALSCH – PV als Int-Literal an PT

                   +-----------+
     "Motor" ------|IN   TON  Q|---( ) "X"
          5  ------|PT       ET|          <- 5 ist Int, PT erwartet Time
                   +-----------+
```

```text
RICHTIG – Zeitliteral verwenden

          T#5s  ---|PT       ET|
```

```pascal
"DB_X"(IN := "Motor", PT := T#5s);
```

```text
FALSCH – Zaehler ohne Flanke und ohne Reset

                    +-----------+
    "Lichtschr." ---|CU   CTU  Q|---( ) "Voll"
             100 ---|PV       CV|
                    +-----------+

Zaehlt jeden Zyklus hoch; CV laeuft bei 32767 ueber und wird nie geloescht.
```

```text
RICHTIG – Flanke am CU, Reset verdrahtet

                   +---------+       +-----------+
   "Lichtschr." ---|CLK P_TRIG|------|CU   CTU  Q|---( ) "Voll"
                   |         Q|      |         CV|
                   +---------+ "Q"--|R          |
                    "M_Fl_LS"   100--|PV         |
                                     +-----------+
```

```pascal
"P_LS"(CLK := "Lichtschr.");
"DB_Z"(CU := "P_LS".Q, R := "Charge_quittiert", PV := 100);
```

## Interview-relevante Details

- **TON, TOF, TP** sind IEC-Timer mit Instanz-DB. Die alten S5-Timer (`S_EVERZ`, `SE`) brauchen keinen DB, sind aber in S7-1200/1500 nicht mehr zu empfehlen.
- **Warum muss der Timer jeden Zyklus aufgerufen werden?** Der Baustein vergleicht bei jedem Aufruf die Systemzeit mit seinem Startzeitpunkt. Ohne Aufruf wird `Q` nie aktualisiert – der Timer „friert ein".
- **`Q` vs. `ET`**: `Q` ist das Ergebnis, `ET` die Laufzeit. `ET >= PT` ist kein Ersatz für `Q` – bei `TOF` ist die Logik umgekehrt.
- **TP ist nicht nachtriggerbar** – für einen nachtriggerbaren Impuls braucht es `TP` plus zusätzliche Logik oder einen `TONR`.
- **`PV` bei CTU** ist nur die Schaltschwelle, keine Obergrenze: `CV` zählt über `PV` hinaus weiter bis zum Maximum des Datentyps.
- **Zählerdatentyp**: Standard ist `Int` (bis 32767). Für größere Stückzahlen `CTU_DINT` verwenden.
- **Auflösung**: Ein Timer kann nicht feiner auflösen als die Zykluszeit. `T#1ms` bei 10 ms Zyklus ist sinnlos – dafür gibt es Weckalarm-OBs.

## Zusammenfassung

- `TON` verzögert das Einschalten, `TOF` das Ausschalten, `TP` erzeugt einen festen Impuls.
- Anschlüsse: `IN`, `PT` (Time) links; `Q` (Bool), `ET` (Time) rechts.
- Zeitliterale schreibt man `T#5s`, `T#500ms`, `T#1m30s`.
- `CTU` zählt bei positiver Flanke an `CU` hoch, `Q` kommt bei `CV >= PV`, `R` löscht.
- `CTD` zählt runter, `CTUD` kann beides.
- Jede Timer- und Zählerverwendung braucht eine **eigene Instanz**.
- Der Baustein muss **jeden Zyklus** aufgerufen werden – Bedingungen gehören an `IN`, nicht vor den Aufruf.
- Zähleingänge immer über `P_TRIG` ansteuern.
