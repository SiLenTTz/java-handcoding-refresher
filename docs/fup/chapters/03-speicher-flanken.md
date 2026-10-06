# Kapitel 03 – Speicher & Flanken (SR, RS, P_TRIG)

## Mental Model

```text
Netzwerk 1: Drei Arten, einen Ausgang zu schreiben

   ( )   Zuweisung       schreibt JEDEN Zyklus den aktuellen Wert
   (S)   Setzen          schreibt nur TRUE, nie FALSE
   (R)   Ruecksetzen     schreibt nur FALSE, nie TRUE

           +--------+
           |   SR   |          SR: Ruecksetzen vorrangig (R1 unten)
      S ---|S      Q|---( )    RS: Setzen       vorrangig (S1 unten)
     R1 ---|R1      |
           +--------+
```

Eine Zuweisung hat **kein Gedächtnis** – sie folgt dem Eingang. Set/Reset und die SR/RS-Bausteine speichern den Zustand über Zyklen hinweg. Flankenbausteine machen aus einem *Zustand* ein **Ereignis**, das genau einen Zyklus lang wahr ist.

## Syntax / API

### Zuweisung vs. Set/Reset-Spule

```text
Netzwerk 1: Zuweisung – Motor folgt dem Taster

              +-------+
   "Start" ---|   &   |------( )  "Motor"
  "Bereit" ---|       |
              +-------+
```

```pascal
"Motor" := "Start" AND "Bereit";   // Taster los -> Motor aus
```

```text
Netzwerk 2: Set und Reset – Motor bleibt an

              +-------+
   "Start" ---|   &   |------(S)  "Motor"
  "Bereit" ---|       |
              +-------+

   "Stopp" -----------------(R)  "Motor"
```

```pascal
IF "Start" AND "Bereit" THEN "Motor" := TRUE;  END_IF;
IF "Stopp"              THEN "Motor" := FALSE; END_IF;
```

`(S)` und `(R)` schreiben nur in eine Richtung. Wenn beide im selben Zyklus aktiv sind, gewinnt die Anweisung, die **weiter unten** im Programm steht.

### SR-Baustein: Rücksetzen vorrangig

```text
Netzwerk 3: Motor-Selbsthaltung, Aus hat Vorrang

                   +--------+
      "Start" -----|S     SR|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+
```

```pascal
IF "Stopp" THEN
    "Motor" := FALSE;
ELSIF "Start" THEN
    "Motor" := TRUE;
END_IF;
```

Beim **SR** heißt der untere Eingang `R1` – der untere Eingang ist immer der dominante. Bei gleichzeitigem `S` und `R1` wird zurückgesetzt. Das ist die sichere Wahl für Antriebe.

### RS-Baustein: Setzen vorrangig

```text
Netzwerk 4: Stoermeldung halten, Melden hat Vorrang

                   +--------+
      "Quitt" -----|R     RS|
                   |        |---( )  "Stoerung_gespeichert"
  "Stoer_roh" -----|S1      |
                   +--------+
```

```pascal
IF "Stoer_roh" THEN
    "Stoerung_gespeichert" := TRUE;
ELSIF "Quitt" THEN
    "Stoerung_gespeichert" := FALSE;
END_IF;
```

Merkhilfe: Der **untere** Eingang gewinnt. `SR` → unten `R1` → Reset dominant. `RS` → unten `S1` → Set dominant.

### Selbsthaltung als Box-Variante

```text
Netzwerk 5: Selbsthaltung ohne SR-Baustein

            +-------+            +-------+
  "Start" --|       |            |       |
            |  >=1  |------------|   &   |------( )  "Motor"
  "Motor" --|       |            |       |
            +-------+  "Stopp" -o|       |
                                 +-------+
```

```pascal
"Motor" := ("Start" OR "Motor") AND NOT "Stopp";
```

Der Ausgang wird auf einen Eingang zurückgeführt – das ist die klassische Selbsthaltung. Sie ist **ausdominant**: `"Stopp"` sperrt die UND-Box sofort. Funktional identisch zum SR-Baustein, aber ohne eigene Instanz.

### Flanken: P_TRIG und N_TRIG

```text
Netzwerk 6: Positive Flanke – ein Zyklus bei 0 -> 1

                   +---------+
      "Taster" ----|CLK P_TRIG|---(S)  "Motor"
                   |         Q|
                   +---------+
                        |
                  "M_Flanke_Taster"   <- Flankenmerker unter der Box
```

```pascal
"P_Taster"(CLK := "Taster");          // Instanz P_TRIG
IF "P_Taster".Q THEN "Motor" := TRUE; END_IF;
```

```text
Netzwerk 7: Negative Flanke – ein Zyklus bei 1 -> 0

                   +---------+
   "Lichtband" ----|CLK N_TRIG|---(S)  "Teil_gezaehlt"
                   |         Q|
                   +---------+
                        |
                  "M_Flanke_LB"
```

```pascal
"N_LB"(CLK := "Lichtband");
IF "N_LB".Q THEN "Teil_gezaehlt" := TRUE; END_IF;
```

`P_TRIG`/`N_TRIG` brauchen einen **Flankenmerker**, in dem der Zustand des letzten Zyklus steht. Dieser Merker darf im gesamten Programm **nur ein einziges Mal** verwendet werden.

### R_TRIG und F_TRIG

```text
Netzwerk 8: R_TRIG als Baustein mit Instanz-DB

                 +----------+
                 |  R_TRIG  |
                 | "DB_Flanke_Start"
    "Start" -----|CLK      Q|------(S)  "Motor"
                 +----------+
```

```pascal
"DB_Flanke_Start"(CLK := "Start");
IF "DB_Flanke_Start".Q THEN "Motor" := TRUE; END_IF;
```

`R_TRIG`/`F_TRIG` sind die IEC-Varianten mit **Instanz-DB** statt Flankenmerker. Verhalten identisch; in Bibliotheksbausteinen sind sie die bessere Wahl, weil jede Instanz ihr eigenes Gedächtnis mitbringt.

## Typische Use Cases

- **Tor auf / Tor zu** über zwei Taster → SR mit Zu-Vorrang.
- **Störung speichern bis Quittierung** → RS, Setzen vorrangig.
- **Tippbetrieb** → reine Zuweisung, kein Speicher.
- **Zähler weiterschalten pro Teil** → N_TRIG auf die Lichtschranke (Kapitel 04).
- **Einmalige Initialisierung nach Anlauf** → P_TRIG auf ein Freigabebit.
- **Umschalten per Taster (Toggle)** → P_TRIG + XOR auf das Zustandsbit.

## Clean-Code-Empfehlungen

- Für Antriebe grundsätzlich **SR** (Aus-Vorrang) nehmen, für Meldungen **RS** (Melden-Vorrang).
- Jedes `(S)` braucht ein eindeutiges, auffindbares `(R)`. Beide gehören in benachbarte Netzwerke.
- Flankenmerker konsequent benennen: `"M_Fl_Start"`, `"M_Fl_LS1"` – so fällt Doppelverwendung auf.
- Keine Flanke auf ein Signal, das ohnehin nur einen Zyklus lang ansteht.
- Selbsthaltung über `>=1`/`&` nur in einfachen Netzwerken; bei mehreren Set-Quellen ist der SR-Baustein lesbarer.
- Ein gespeichertes Bit niemals zusätzlich per `( )` zuweisen – das löscht die Haltung.

## Häufige Fehler

```text
FALSCH – derselbe Flankenmerker an zwei Bausteinen

Netzwerk 1:                        Netzwerk 2:
    +---------+                        +---------+
 A -|CLK P_TRIG|---(S) "X"       B ----|CLK P_TRIG|---(S) "Y"
    |         Q|                       |         Q|
    +---------+                        +---------+
      "M_Fl"                             "M_Fl"     <- gleicher Merker!

Beide Bausteine ueberschreiben sich gegenseitig -> zufaellige Flanken.
```

```text
RICHTIG – je Flanke ein eigener Merker

Netzwerk 1: "M_Fl_A"        Netzwerk 2: "M_Fl_B"
```

```text
FALSCH – Zuweisung statt Set loescht die Selbsthaltung

Netzwerk 1:
                   +--------+
      "Start" -----|S     SR|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+

Netzwerk 5:
     "Hand" ----------------------( )  "Motor"   <- ueberschreibt jeden Zyklus
```

```text
RICHTIG – zweite Quelle auf den S-Eingang fuehren

                        +-------+       +--------+
            "Start" ----|       |       |      SR|
                        |  >=1  |-------|S       |---( )  "Motor"
             "Hand" ----|       |       |        |
                        +-------+       |        |
              "Stopp" ----------------- |R1      |
                                        +--------+
```

```pascal
IF "Stopp" THEN
    "Motor" := FALSE;
ELSIF "Start" OR "Hand" THEN
    "Motor" := TRUE;
END_IF;
```

```text
FALSCH – Dauersignal statt Flanke am Zaehler

                                      +--------+
   "Lichtschranke" --------------------|CU   CTU|
                                       +--------+

Solange das Teil die Schranke verdeckt, zaehlt die CPU jeden Zyklus hoch.
```

```text
RICHTIG – Flanke davorschalten

                   +---------+        +--------+
"Lichtschranke" ---|CLK P_TRIG|-------|CU   CTU|
                   |         Q|       +--------+
                   +---------+
                    "M_Fl_LS"
```

```pascal
"P_LS"(CLK := "Lichtschranke");
"Zaehler"(CU := "P_LS".Q, PV := 100);
```

## Interview-relevante Details

- **SR vs. RS**: Der **untere** Eingang ist der dominante (`R1` beim SR, `S1` beim RS). Bei gleichzeitiger Ansteuerung entscheidet er.
- **Set/Reset-Spulen vs. SR-Baustein**: Bei Spulen entscheidet die **Programmreihenfolge**, beim Baustein die fest verdrahtete Priorität. Der Baustein ist eindeutiger.
- **Warum braucht eine Flanke einen Merker?** Die CPU muss den Zustand des **vorherigen Zyklus** kennen. Der Flankenmerker ist dieses Gedächtnis.
- **P_TRIG/N_TRIG vs. R_TRIG/F_TRIG**: funktional gleich. P_TRIG arbeitet mit einem Bit-Merker, R_TRIG mit einem Instanz-DB und ist der IEC-Standardbaustein.
- **Flanke in einem FB mit mehreren Instanzen**: Flankenmerker aus dem Merkerbereich wären für alle Instanzen gemeinsam – deshalb dort `R_TRIG` als Multiinstanz verwenden.
- **Remanenz**: Merker können remanent sein und überleben einen Spannungsausfall. Für Flankenmerker ist das unerwünscht.
- **Selbsthaltung mit Rückführung** ist in SCL eine Zeile: `"Motor" := ("Start" OR "Motor") AND NOT "Stopp";`

## Zusammenfassung

- `( )` folgt dem Signal, `(S)`/`(R)` speichern in eine Richtung.
- `SR` = Rücksetzen vorrangig, `RS` = Setzen vorrangig; der untere Eingang gewinnt.
- Selbsthaltung geht auch ohne Baustein: Ausgang auf ODER-Eingang zurückführen, Stopp negiert in die UND-Box.
- `P_TRIG`/`N_TRIG` liefern an `Q` genau **einen Zyklus** `TRUE`.
- Jeder Flankenmerker wird **genau einmal** im Programm verwendet.
- `R_TRIG`/`F_TRIG` sind die Instanz-DB-Variante – Pflicht in wiederverwendbaren FBs.
- Zähler und Setz-Operationen immer über eine Flanke ansteuern, nie mit Dauersignal.
