# Kapitel 01 – KOP Grundlagen: Strompfad, Kontakt, Spule

## Mental Model

```text
  linke Sammelschiene                                 rechte Sammelschiene
         |                                                      |
         |      "Startbedingung"              "Ergebnis"        |
         +----| |--------------------------------( )------------+
```

KOP ist ein gezeichneter Stromlaufplan. Du liest jedes Netzwerk **von links nach rechts**: Von der linken Sammelschiene fließt gedachter Strom über Kontakte zur Spule. Kommt der Strom durch, wird die Spule **1**, sonst **0**. Es fließt kein echter Strom – die CPU rechnet das Ergebnis einmal pro Zyklus aus.

## Syntax / API

### Das Grundnetzwerk: ein Kontakt, eine Spule

```text
  Netzwerk 1: Lampe folgt Taster

     Taster                       Lampe
  ----| |------------------------( )----
```

```pascal
"Lampe" := "Taster";
```

Ein Schließer `| |` fragt ab: *"Ist der Operand 1?"* Ist er 1, leitet der Kontakt. Die Spule übernimmt das Ergebnis des Strompfads.

### Schließer – Abfrage auf Signalzustand 1

```text
  Netzwerk 1: Pumpe laeuft wenn Freigabe ansteht

     Freigabe                     Pumpe
  ----| |------------------------( )----
```

```pascal
"Pumpe" := "Freigabe";
```

Der Schließer (NO, *normally open*) ist offen, solange der Operand 0 ist. Er schließt bei **1**.

### Öffner – Abfrage auf Signalzustand 0

```text
  Netzwerk 1: Warnlampe wenn Tuer NICHT geschlossen

     TuerZu                       Warnung
  ----|/|------------------------( )----
```

```pascal
"Warnung" := NOT "TuerZu";
```

Der Öffner (NC, *normally closed*) leitet, solange der Operand **0** ist, und sperrt bei 1. Merksatz: **Schließer fragt auf 1 ab, Öffner fragt auf 0 ab.**

### Spule – Zuweisung des Verknüpfungsergebnisses

```text
  Netzwerk 1: Band laeuft nur mit Freigabe und ohne Stoerung

     Freigabe   Stoerung          Band
  ----| |-------|/|--------------( )----
```

```pascal
"Band" := "Freigabe" AND NOT "Stoerung";
```

Die Spule steht immer **ganz rechts** am Strompfad. Sie schreibt in jedem Zyklus – auch die 0. Eine Spule ist eine Zuweisung, kein Schalter, der hängen bleibt.

### Operanden: die Zuordnungsliste

| Kürzel (DE) | Kürzel (EN) | Bedeutung | Beispiel |
|---|---|---|---|
| E | I | Eingang (Input) | `E0.0` / `%I0.0` |
| A | Q | Ausgang (Output) | `A0.1` / `%Q0.1` |
| M | M | Merker (internes Bit) | `M10.0` / `%M10.0` |
| DB | DB | Datenbaustein | `"Daten".Zaehler` |

Eine Zuordnungsliste ordnet jedem Operanden einen **Symbolnamen** zu:

```text
  E0.0   S_Start      Taster Start (Schliesser verdrahtet)
  E0.1   S_Stopp      Taster Stopp (Oeffner verdrahtet)
  E0.2   S_NotHalt    Not-Halt (Oeffner verdrahtet)
  A0.0   K_Motor      Schuetz Bandmotor
  M10.0  F_Freigabe   Merker Anlagenfreigabe
```

Im Programm arbeitest du immer mit den Symbolnamen, nie mit `E0.0`.

### Verdrahtungslogik vs. Programmlogik (der Not-Halt-Fallstrick)

Ein Not-Halt wird **hardwareseitig als Öffner** verdrahtet. Im Ruhezustand (nicht gedrückt) liegt also **Signal 1** am Eingang an. Beim Drücken **und beim Drahtbruch** fällt das Signal auf 0.

```text
  Netzwerk 1: RICHTIG - Not-Halt mit Schliesser abfragen

     NotHalt    Start             Motor
  ----| |-------| |--------------( )----
```

```pascal
"Motor" := "NotHalt" AND "Start";
```

```text
  Netzwerk 1: FALSCH - Not-Halt mit Oeffner abfragen

     NotHalt    Start             Motor
  ----|/|-------| |--------------( )----
```

Mit dem Öffner läuft der Motor genau dann, wenn der Not-Halt gedrückt ist – und bei Drahtbruch läuft die Anlage weiter. **Ruhestromprinzip:** Hardware-Öffner wird im Programm mit Schließer abgefragt.

### Prozessabbild und Zyklus

```text
  +---------------------------------------------------+
  |  1. Prozessabbild der Eingaenge (PAE) einlesen     |
  |  2. Anwenderprogramm Netzwerk fuer Netzwerk rechnen|
  |  3. Prozessabbild der Ausgaenge (PAA) ausgeben     |
  |  4. Betriebssystem / Kommunikation -> zurueck zu 1 |
  +---------------------------------------------------+
```

- Die CPU liest alle Eingänge **einmal** am Zyklusanfang. Ändert sich ein Eingang mitten im Zyklus, merkt das Programm es erst im nächsten Zyklus.
- Ausgänge werden erst am **Zyklusende** physikalisch geschrieben.
- Netzwerke laufen **streng von oben nach unten**. Das untere Netzwerk überschreibt das obere.

## Typische Use Cases

- Direkte Abbildung eines Schalters auf eine Lampe oder ein Schütz.
- Freigabelogik: Anlage läuft nur, wenn Not-Halt ok, Schutztür zu, Hauptschalter ein.
- Störungsmeldung: Lampe leuchtet, wenn ein Zustand **nicht** erfüllt ist (Öffner).
- Zwischenergebnisse als Merker ablegen und in mehreren Netzwerken wiederverwenden.
- Handbetrieb/Automatik: ein Merker als Betriebsartenbit, das überall abgefragt wird.

## Clean-Code-Empfehlungen

- Immer Symbolnamen statt absoluter Adressen – `"S_NotHalt"` statt `E0.2`.
- Ein Netzwerk = ein Gedanke. Lieber vier kurze Netzwerke als eins mit zwölf Kontakten.
- Jedem Netzwerk einen aussagekräftigen Titel geben: *"Netzwerk 3: Bandfreigabe"*.
- Signalnamen positiv formulieren (`"TuerZu"` statt `"TuerNichtZu"`) – doppelte Verneinung mit Öffner wird sonst unlesbar.
- Eingänge nicht direkt mehrfach verteilen: einmal zu einem Merker verdichten, dann den Merker verwenden.
- Reihenfolge der Netzwerke bewusst wählen: Erst Freigaben rechnen, dann Verbraucher ansteuern.

## Häufige Fehler

```text
  FALSCH: Spule mitten im Strompfad

     Start        Motor       Stopp
  ----| |--------( )----------|/|----

  RICHTIG: Spule am Ende, Bedingungen davor

     Start      Stopp             Motor
  ----| |-------|/|--------------( )----
```

```text
  FALSCH: Not-Halt (Hardware-Oeffner) im Programm als Oeffner

     NotHalt                      Motor
  ----|/|------------------------( )----

  RICHTIG: Ruhestromprinzip, Abfrage auf 1

     NotHalt                      Motor
  ----| |------------------------( )----
```

```text
  FALSCH: derselbe Ausgang in zwei Netzwerken (Doppelzuweisung)

  Netzwerk 1:
     Hand                         Motor
  ----| |------------------------( )----

  Netzwerk 2:
     Auto                         Motor
  ----| |------------------------( )----

  RICHTIG: eine Spule, beide Bedingungen in einem Netzwerk (Kapitel 02)
```

Bei der Doppelzuweisung gewinnt immer **das letzte Netzwerk** – Netzwerk 1 ist wirkungslos.

## Interview-relevante Details

- **Schließer/Öffner im Programm** haben nichts mit der Verdrahtung zu tun: `| |` fragt auf 1 ab, `|/|` auf 0, unabhängig davon, wie der Geber gebaut ist.
- **Ruhestromprinzip**: sicherheitsrelevante Geber (Not-Halt, Schutztür, Endlage) werden als Öffner verdrahtet, damit Drahtbruch wie "ausgelöst" wirkt.
- **Prozessabbild**: Das Programm arbeitet auf einer Kopie (PAE/PAA). Direktzugriffe (`%I0.0:P`) umgehen das, sind aber die Ausnahme.
- **Zykluszeit** bestimmt die Reaktionszeit: Ein Signal, das kürzer als ein Zyklus ansteht, kann übersehen werden – deshalb gibt es Flanken (Kapitel 03).
- Ein Not-Halt darf im Programm **niemals** die alleinige Sicherheitsfunktion sein; die Abschaltung erfolgt hardwareseitig bzw. über F-CPU.
- KOP, FUP, AWL und SCL beschreiben dieselbe Logik. KOP ist auf Bitverknüpfungen optimiert, SCL auf Rechnen und Schleifen.

## Zusammenfassung

- Ein Netzwerk läuft von der linken Sammelschiene über Kontakte zur Spule ganz rechts.
- `| |` Schließer = Abfrage auf 1, `|/|` Öffner = Abfrage auf 0, `( )` Spule = Zuweisung.
- Operanden: E/I Eingang, A/Q Ausgang, M Merker – im Programm immer über Symbolnamen.
- Hardware-Öffner (Not-Halt) wird im Programm mit **Schließer** abgefragt (Ruhestromprinzip).
- Die CPU arbeitet zyklisch: PAE lesen → Programm rechnen → PAA schreiben.
- Jede Spule schreibt jeden Zyklus; derselbe Ausgang darf nur **einmal** zugewiesen werden.
