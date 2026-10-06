# Kapitel 02 – Reihe, Parallel & Verzweigung

## Mental Model

```text
  REIHE = UND                        PARALLEL = ODER

     A         B        Y               A              Y
  ----| |------| |-----( )----      +---| |---+-------( )----
                                    |         |
  Strom muss durch BEIDE               B      |
                                    +---| |---+

                                    Strom braucht nur EINEN Weg
```

Hintereinander im selben Strompfad = **UND**. Übereinander in einer Verzweigung = **ODER**. Jedes beliebig komplexe Netzwerk ist nur eine Schachtelung dieser beiden Muster.

## Syntax / API

### Reihenschaltung = AND

```text
  Netzwerk 1: Freigabe nur wenn alles passt

     NotHalt    TuerZu     Hauptschalter     Freigabe
  ----| |-------| |--------| |--------------( )----
```

```pascal
"Freigabe" := "NotHalt" AND "TuerZu" AND "Hauptschalter";
```

### Parallelschaltung = OR

```text
  Netzwerk 1: Lampe von drei Stellen schalten

     TasterA                        Lampe
  +---| |---+-------------------------( )----
  |         |
  | TasterB |
  +---| |---+
  |         |
  | TasterC |
  +---| |---+
```

```pascal
"Lampe" := "TasterA" OR "TasterB" OR "TasterC";
```

### Gemischt: ODER vor UND

```text
  Netzwerk 1: (Hand ODER Auto) UND Freigabe

     Hand               Freigabe       Motor
  +---| |---+-------------| |---------( )----
  |         |
  | Auto    |
  +---| |---+
```

```pascal
"Motor" := ("Hand" OR "Auto") AND "Freigabe";
```

Die Verzweigung wirkt wie eine **Klammer**. Wo die Verzweigung endet, endet die Klammer.

### Gemischt: UND innerhalb eines ODER-Zweigs

```text
  Netzwerk 1: Automatik mit Startbedingung ODER Handbetrieb

     Auto       Start               Motor
  +---| |-------| |---+-------------( )----
  |                   |
  | Hand              |
  +---| |-------------+
```

```pascal
"Motor" := ("Auto" AND "Start") OR "Hand";
```

### Selbsthaltung mit vorrangigem Aus

Die wichtigste Grundschaltung der SPS-Technik:

```text
  Netzwerk 1: Selbsthaltung, Aus hat Vorrang

     Start              Stopp          Motor
  +---| |---+-------------|/|---------( )----
  |         |
  | Motor   |
  +---| |---+
```

```pascal
"Motor" := ("Start" OR "Motor") AND NOT "Stopp";
```

Der zweite Zweig fragt den **eigenen Ausgang** ab – das ist die Rückführung, die den Zustand hält. `Stopp` steht **hinter** der Verzweigung und kann die Haltung immer unterbrechen: **Aus-Vorrang** (die sichere Variante).

### Selbsthaltung mit vorrangigem Ein

```text
  Netzwerk 1: Selbsthaltung, Ein hat Vorrang

     Start                            Motor
  +---| |--------------+-------------( )----
  |                    |
  | Motor     Stopp    |
  +---| |------|/|-----+
```

```pascal
"Motor" := "Start" OR ("Motor" AND NOT "Stopp");
```

Hier liegt `Stopp` **im Halteweg**. Solange `Start` ansteht, bleibt der Motor an, auch wenn `Stopp` gedrückt wird: **Ein-Vorrang**. Für Antriebe praktisch nie gewünscht.

### Mehrere Spulen in einem Netzwerk

```text
  Netzwerk 1: zwei Verbraucher mit derselben Bedingung

     Freigabe                     Band
  ----| |---+--------------------( )----
            |
            |                     Luefter
            +--------------------( )----
```

```pascal
"Band"    := "Freigabe";
"Luefter" := "Freigabe";
```

Erlaubt und übersichtlich – aber nur, wenn die Bedingung wirklich identisch ist.

### Spule mitten im Pfad: die Zwischenspule

```text
  Netzwerk 1: Zwischenergebnis mitschreiben

     Freigabe             M_Zwischen     Band
  ----| |---+------------( )---+--------( )----
            |                  |
            +------------------+
```

Technisch möglich, aber schwer lesbar. Besser: eigener Merker in einem eigenen Netzwerk.

## Typische Use Cases

- Freigabekette: Not-Halt UND Tür UND Hauptschalter UND keine Störung.
- Sammelstörung: Störung1 ODER Störung2 ODER Störung3.
- Start/Stopp mit Selbsthaltung für Motoren, Pumpen, Bänder.
- Betriebsarten: `(Hand AND Tipptaste) OR (Auto AND Startbedingung)`.
- Zweihandbedienung: beide Taster in Reihe (siehe Kapitel 03 für die Zeitüberwachung).
- Mehrere Meldeleuchten aus derselben Bedingung über parallele Spulen.

## Clean-Code-Empfehlungen

- Freigaben einmal in einen Merker rechnen und überall diesen Merker abfragen.
- Verzweigungen nicht tiefer als zwei Ebenen schachteln – sonst Netzwerk aufteilen.
- Den Halte-Kontakt der Selbsthaltung direkt unter den Start-Kontakt zeichnen, nie irgendwo mittendrin.
- Immer **Aus-Vorrang** wählen, außer es gibt einen ausdrücklichen Grund dagegen.
- Netzwerktitel beschreiben das Ergebnis, nicht die Technik: *"Netzwerk 2: Band Selbsthaltung"*.
- Bei mehr als etwa sechs Kontakten pro Netzwerk: Teilergebnisse in Merker auslagern.

## Häufige Fehler

```text
  FALSCH: Stopp im Halteweg, obwohl Aus-Vorrang gewollt ist

     Start                            Motor
  +---| |--------------+-------------( )----
  |                    |
  | Motor     Stopp    |
  +---| |------|/|-----+

  RICHTIG: Stopp hinter der Verzweigung

     Start              Stopp          Motor
  +---| |---+-------------|/|---------( )----
  |         |
  | Motor   |
  +---| |---+
```

```text
  FALSCH: Haltekontakt auf den Starttaster statt auf den Ausgang

     Start              Stopp          Motor
  +---| |---+-------------|/|---------( )----
  |         |
  | Start   |
  +---| |---+

  RICHTIG: der Haltekontakt fragt den EIGENEN Ausgang ab (Motor)
```

```text
  FALSCH: Doppelzuweisung auf denselben Ausgang

  Netzwerk 1:
     Hand                         Motor
  ----| |------------------------( )----

  Netzwerk 2:
     Auto                         Motor
  ----| |------------------------( )----

  RICHTIG: ein Netzwerk, beide Bedingungen parallel

     Hand                         Motor
  +---| |---+--------------------( )----
  |         |
  | Auto    |
  +---| |---+
```

```text
  FALSCH: Stopp als Schliesser abgefragt, obwohl Oeffner verdrahtet

     Start              Stopp          Motor
  +---| |---+-------------| |---------( )----
  |         |
  | Motor   |
  +---| |---+

  RICHTIG: Hardware-Oeffner -> im Programm Oeffner-Logik ueber Schliesser-
  Abfrage ist Unsinn. Richtig ist: Stopp liefert im Ruhezustand 1,
  also Abfrage mit Schliesser | | und KEINE zusaetzliche Negation.
```

Der letzte Punkt ist der Klassiker: Erst die Verdrahtung klären, dann den Kontakttyp wählen. Bei Stopp-Taster als Öffner verdrahtet steht im Ruhezustand 1 an → Abfrage mit `| |`, nicht mit `|/|`.

## Interview-relevante Details

- **Reihe = AND, Parallel = OR** – das ist die komplette Übersetzungsregel für Bitlogik.
- Eine Verzweigung entspricht in SCL einer **Klammer**. Wer die Klammer falsch setzt, ändert die Logik.
- Bei der Selbsthaltung entscheidet die **Position des Stopp-Kontakts** über Aus- oder Ein-Vorrang.
- Die Selbsthaltung funktioniert nur, weil die CPU zyklisch rechnet: Der im letzten Zyklus geschriebene Ausgang wird im nächsten Zyklus wieder abgefragt.
- Eine Selbsthaltung übersteht **keinen** Spannungsausfall (Ausgänge werden 0). Für remanente Zustände braucht man remanente Merker oder Set/Reset (Kapitel 03).
- Doppelzuweisung ist in TIA kein Compile-Fehler, sondern nur eine Warnung in der Querverweisliste – deshalb aktiv danach suchen.
- Mehrere Spulen in einem Netzwerk sind erlaubt; mehrere Spulen auf **denselben Operanden** nie.

## Zusammenfassung

- Kontakte in Reihe = `AND`, Kontakte parallel = `OR`.
- Verzweigungen sind Klammern; wo sie zusammenlaufen, schließt die Klammer.
- Selbsthaltung: `("Start" OR "Motor") AND NOT "Stopp"` – Haltekontakt fragt den eigenen Ausgang ab.
- Stopp **hinter** der Verzweigung = Aus-Vorrang (Standard). Stopp **im Halteweg** = Ein-Vorrang.
- Mehrere Spulen pro Netzwerk sind erlaubt, derselbe Operand darf aber nur **einmal** zugewiesen werden.
- Komplexe Logik in Merker-Teilergebnisse zerlegen statt in ein Riesennetzwerk zwängen.
