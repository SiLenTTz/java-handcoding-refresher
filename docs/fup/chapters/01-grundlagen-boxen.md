# Kapitel 01 – FUP Grundlagen: Boxen & Signalfluss

## Mental Model

```text
Netzwerk 1: Signalfluss von links nach rechts

   Operanden        Verknuepfungsboxen           Zuweisung
   (Eingaenge)                                   (Ausgang)

            +-------+
  "Start" --|       |
            |   &   |-----------------------( )  "Motor"
 "Bereit" --|       |
            +-------+

   Prozessabbild E  ->  Programmbearbeitung  ->  Prozessabbild A
```

FUP (Funktionsplan, englisch **FBD** – Function Block Diagram) zeichnet Logik als Kette von Boxen. Ein Signal startet links bei einem Operanden, läuft durch die Boxen und endet rechts an einer Zuweisung. Es gibt keine Stromschiene wie in KOP – nur Boxen und Verbindungslinien.

## Syntax / API

### Die Box: Name oben, Eingänge links, Ausgang rechts

```text
Netzwerk 1: Motor laeuft, wenn Start UND Bereit

            +-------+
  "Start" --|       |
            |   &   |------( )  "Motor"
 "Bereit" --|       |
            +-------+
```

```pascal
"Motor" := "Start" AND "Bereit";
```

Der Boxname steht in der Mitte (`&` für UND, `>=1` für ODER). Jede Linie links ist ein Eingang, die Linie rechts der Ausgang. Die runde Klammer `( )` ist die **Zuweisung** – sie schreibt das Ergebnis in einen Operanden.

### Operanden: absolut und symbolisch

```text
Netzwerk 2: Gleiche Logik, absolute Adressen

            +-------+
   %I0.0 ---|       |
            |   &   |------( )  %Q0.0
   %I0.1 ---|       |
            +-------+
```

```pascal
%Q0.0 := %I0.0 AND %I0.1;
```

| Kürzel (DE) | Kürzel (EN) | Bedeutung |
|---|---|---|
| E 0.0 | %I0.0 | Eingang, Bit 0 im Byte 0 |
| A 0.0 | %Q0.0 | Ausgang |
| M 10.0 | %M10.0 | Merker (internes Bit) |
| EW 64 | %IW64 | Eingangswort (16 Bit) |

In der **Zuordnungsliste** bekommt jede Adresse einen symbolischen Namen. Im Programm arbeitest du nur mit `"Start"`, nie mit `%I0.0`.

### Zuweisung am Ausgang

```text
Netzwerk 3: Mehrere Zuweisungen am selben Ergebnis

            +-------+
  "Start" --|       |---+--( )  "Motor"
            |   &   |   |
 "Bereit" --|       |   +--( )  "Lampe_Betrieb"
            +-------+
```

```pascal
"Motor"          := "Start" AND "Bereit";
"Lampe_Betrieb"  := "Start" AND "Bereit";
```

Ein Ausgangssignal darf auf mehrere Zuweisungen verzweigen. Die Zuweisung schreibt **jeden Zyklus** – auch `FALSE`.

### Verschachtelung: Box in Box

```text
Netzwerk 4: (Start ODER Tipp) UND Bereit

            +-------+
  "Start" --|       |
            |  >=1  |---+
   "Tipp" --|       |   |     +-------+
            +-------+   +-----|       |
                              |   &   |------( )  "Motor"
                   "Bereit" --|       |
                              +-------+
```

```pascal
"Motor" := ("Start" OR "Tipp") AND "Bereit";
```

Der Ausgang einer Box ist der Eingang der nächsten. Das entspricht exakt der Klammerung in SCL.

### Vergleich zu KOP

```text
KOP (Kontaktplan)                FUP (Funktionsplan)

 "Start"  "Bereit"   "Motor"             +-------+
---| |------| |-------( )---     "Start"-|   &   |---( ) "Motor"
                                "Bereit"-|       |
                                         +-------+
```

```pascal
"Motor" := "Start" AND "Bereit";
```

Gleiche Logik, andere Darstellung. In KOP ist **Reihe = UND** und **Parallelzweig = ODER**. In FUP ist beides eine Box mit mehreren Eingängen. Du kannst im TIA Portal zwischen KOP und FUP umschalten, solange das Netzwerk in beiden Sprachen darstellbar ist.

### Prozessabbild und Zyklus

```text
Netzwerk 5: Was in einem Zyklus passiert

  1. PAE lesen     Klemmen  ->  Prozessabbild der Eingaenge
  2. Programm      Netzwerk 1 .. Netzwerk n, von oben nach unten
  3. PAA schreiben Prozessabbild der Ausgaenge  ->  Klemmen
```

Innerhalb eines Zyklus ist `"Start"` **konstant** – auch wenn die Klemme in der Zwischenzeit umschaltet. Merker, die in Netzwerk 1 gesetzt werden, wirken in Netzwerk 2 **im selben Zyklus**; ein Merker, der erst in Netzwerk 5 gesetzt wird, wirkt in Netzwerk 1 erst im **nächsten** Zyklus.

## Typische Use Cases

- **Freigabelogik**: mehrere Bedingungen mit einer UND-Box bündeln (`"Bereit" AND "Tuer_zu" AND "NOT Stoerung"`).
- **Sammelmeldung**: viele Störbits mit einer ODER-Box auf eine Lampe legen.
- **Betriebsartenwahl**: Hand/Auto über ODER-Boxen zusammenführen.
- **Statusanzeige**: ein Zwischenergebnis auf Merker *und* Lampe verzweigen.
- **Zweihandbedienung**: zwei Taster in einer UND-Box – die Basis für Kapitel 03.

## Clean-Code-Empfehlungen

- Jedes Netzwerk bekommt einen **Titel**, der die Absicht beschreibt ("Förderband freigeben"), nicht die Technik ("UND von E0.0 und E0.1").
- Ein Netzwerk = eine Aussage. Lieber fünf kleine Netzwerke als ein Monster.
- Nur **symbolische Namen** verwenden, absolute Adressen bleiben in der Zuordnungsliste.
- Namenskonvention durchhalten: `"Taster_Start"`, `"Motor_Band1"`, `"Stoerung_Sammel"`.
- Ein Ausgang wird **nur an einer Stelle** zugewiesen – sonst gewinnt immer das letzte Netzwerk.
- Zwischenergebnisse auf benannte Merker legen, statt zehn Boxen zu verschachteln.

## Häufige Fehler

```text
FALSCH – "Motor" wird in zwei Netzwerken zugewiesen

Netzwerk 1:                      Netzwerk 7:
            +-------+                        +-------+
  "Start" --|   &   |---( ) "Motor"  "Hand" -|   &   |---( ) "Motor"
 "Bereit" --|       |             "Freigabe"-|       |
            +-------+                        +-------+

Netzwerk 1 ist wirkungslos: Netzwerk 7 ueberschreibt das Bit im selben Zyklus.
```

```text
RICHTIG – beide Quellen in einer ODER-Box zusammenfuehren

Netzwerk 1: Motor Hand oder Automatik

            +-------+
  "Auto" ---|       |
            |  >=1  |------( )  "Motor"
  "Hand" ---|       |
            +-------+
```

```pascal
"Motor" := "Auto" OR "Hand";
```

```text
FALSCH – Reihenfolge missachtet (Merker wirkt erst naechsten Zyklus)

Netzwerk 1:  "Freigabe" --| & |---( ) "Motor"
Netzwerk 2:  "Bereit"   --| & |---( ) "Freigabe"

"Freigabe" wird NACH seiner Verwendung berechnet -> 1 Zyklus Verzoegerung.
```

```text
RICHTIG – erst rechnen, dann verwenden

Netzwerk 1:  "Bereit"   --| & |---( ) "Freigabe"
Netzwerk 2:  "Freigabe" --| & |---( ) "Motor"
```

## Interview-relevante Details

- **FUP vs. KOP**: identische Mächtigkeit. FUP ist übersichtlicher bei vielen Eingängen an einer Verknüpfung (eine Box mit 8 Eingängen statt 8 Kontakten in Reihe) und bei Bausteinen mit mehreren Ausgängen. KOP ist näher am Stromlaufplan und bei Elektrikern beliebter.
- **FUP vs. SCL**: FUP ist bitorientierte Verknüpfungslogik, SCL kann Schleifen, Strukturen und komplexe Berechnungen. Alles, was in FUP geht, geht in SCL – umgekehrt nicht.
- **Prozessabbild**: Das Programm liest nicht direkt die Klemme, sondern das PAE. Direktzugriff gibt es über `:P` (z. B. `%I0.0:P`), das umgeht das Prozessabbild.
- **Zykluszeit**: Ein Durchlauf dauert typisch wenige Millisekunden. Signale, die kürzer sind als ein Zyklus, werden nicht erkannt – darum Flankenbausteine (Kapitel 03).
- **Nicht jedes SCL-Programm lässt sich nach FUP zurückwandeln** – FUP kennt keine Schleifen und keine `CASE`-Anweisung.
- **S7-1200/1500**: optimierte Bausteine, symbolischer Zugriff, Datentypen `Bool`, `Int`, `Real`, `Time`.

## Zusammenfassung

- FUP zeichnet Logik als Boxen; das Signal fließt **links nach rechts**.
- Operanden stehen links an den Eingängen, die Zuweisung `( )` steht rechts.
- `&` ist die UND-Box, `>=1` die ODER-Box; Boxen lassen sich verschachteln.
- Verschachtelung in FUP entspricht Klammerung in SCL.
- KOP und FUP sind gleich mächtig – FUP gewinnt bei breiten Verknüpfungen.
- Die CPU arbeitet zyklisch: PAE lesen → Programm → PAA schreiben.
- Ein Ausgang wird nur an **einer** Stelle zugewiesen; Netzwerkreihenfolge ist relevant.
