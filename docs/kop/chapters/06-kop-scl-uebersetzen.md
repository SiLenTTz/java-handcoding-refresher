# Kapitel 06 – KOP ↔ SCL übersetzen

## Mental Model

```text
  KOP                                  SCL

  ----| |----            Schliesser    "A"
  ----|/|----            Oeffner       NOT "A"
  ---| |---| |---        Reihe         "A" AND "B"
  +--| |--+--| |--+      Parallel      "A" OR "B"
  ----( )----            Spule         "Y" := ...;
  ----(S)----            Setzspule     IF ... THEN "Y" := TRUE; END_IF;
  ----(R)----            Ruecksetzen   IF ... THEN "Y" := FALSE; END_IF;
  ----|P|----            Flanke pos.   "S" AND NOT "Fl"; "Fl" := "S";
  Box mit EN/ENO         Funktion      IF EN THEN "OUT" := f(IN1, IN2); END_IF;
```

Beide Sprachen beschreiben dieselbe Logik. Die Übersetzung ist **mechanisch**, solange es um Bitverknüpfungen geht – erst bei Schleifen und Strukturen wird es einseitig.

## Syntax / API

### Regel 1: Reihe → AND

```text
  Netzwerk 1:

     A          B          C          Y
  ----| |-------| |--------| |-------( )----
```

```pascal
"Y" := "A" AND "B" AND "C";
```

### Regel 2: Parallel → OR

```text
  Netzwerk 1:

     A                               Y
  +---| |---+---------------------( )----
  |         |
  | B       |
  +---| |---+
```

```pascal
"Y" := "A" OR "B";
```

### Regel 3: Öffner → NOT

```text
  Netzwerk 1:

     A          B          Y
  ----| |-------|/|-------( )----
```

```pascal
"Y" := "A" AND NOT "B";
```

### Regel 4: Verzweigung → Klammer

```text
  Netzwerk 1:

     A                    C          Y
  +---| |---+--------------| |------( )----
  |         |
  | B       |
  +---| |---+
```

```pascal
"Y" := ("A" OR "B") AND "C";
```

Ohne Klammer würde SCL wegen der Operatorrangfolge (`AND` bindet stärker als `OR`) etwas anderes rechnen: `"A" OR ("B" AND "C")`.

### Regel 5: Spule → Zuweisung

```text
  ----( )----
```

```pascal
"Y" := <Strompfadergebnis>;
```

Die Zuweisung schreibt **jeden Zyklus** – genau wie die Spule.

### Regel 6: Set/Reset → IF

```text
  Netzwerk 1:
     A                            Y
  ----| |------------------------(S)----

  Netzwerk 2:
     B                            Y
  ----| |------------------------(R)----
```

```pascal
IF "A" THEN
    "Y" := TRUE;
END_IF;

IF "B" THEN
    "Y" := FALSE;
END_IF;
```

Die **Reihenfolge** der `IF`-Blöcke entspricht der Reihenfolge der Netzwerke und bestimmt den Vorrang.

### Regel 7: Flanke → Signal AND NOT Flankenmerker

```text
  Netzwerk 1:

     S_Start   M_Fl_Start          M_Impuls
  ----| |--------|P|---------------( )----
```

```pascal
"M_Impuls" := "S_Start" AND NOT "M_Fl_Start";
"M_Fl_Start" := "S_Start";
```

Die Nachführung des Flankenmerkers **muss** direkt danach stehen, sonst stimmt die Auswertung im nächsten Zyklus nicht.

### Regel 8: Box → Funktionsaufruf unter EN-Bedingung

```text
  Netzwerk 1:

                     +-------------+
                     |  ADD  Int   |
     M_Rechnen       |             |
  ----| |------------| EN      ENO |----
     "A" -----------| IN1     OUT |---- "Summe"
     "B" -----------| IN2         |
                     +-------------+
```

```pascal
IF "M_Rechnen" THEN
    "Summe" := "A" + "B";
END_IF;
```

Timer und Zähler sind Instanzaufrufe:

```pascal
"IDB_Zeit"(IN := "Bedingung", PT := T#5s, Q => "M_Zeit_abgelaufen");
"IDB_Zaehler"(CU := "M_Impuls", R := "S_Reset", PV := 100, CV => "Stueckzahl");
```

### Gegenrichtung: SCL → KOP

Lies den SCL-Ausdruck von außen nach innen:

```pascal
"K_Motor" := ("S_Start" OR "K_Motor") AND "S_Stopp" AND NOT "M_Stoerung";
```

1. Außen steht `AND` → Reihenschaltung von drei Blöcken.
2. Der erste Block ist eine Klammer mit `OR` → Verzweigung mit zwei Zweigen.
3. `NOT` → Öffner.
4. `:=` → Spule ganz rechts.

```text
  Netzwerk 1:

     S_Start            S_Stopp  M_Stoerung      K_Motor
  +---| |---+-------------| |-------|/|---------( )----
  |         |
  | K_Motor |
  +---| |---+
```

### Was sich nicht übersetzen lässt

| SCL-Konstrukt | In KOP |
|---|---|
| `FOR` / `WHILE` / `REPEAT` | nicht darstellbar |
| `CASE` | nur umständlich über Vergleicher-Ketten |
| `ARRAY`-Indizierung mit Laufvariable | nur über indirekte Adressierung, sehr unübersichtlich |
| `STRUCT`/`STRING`-Verarbeitung | praktisch nicht |
| frühe Rückkehr (`RETURN`) | über Sprungmarken, schlecht lesbar |
| verschachtelte `IF`-Ketten | explodiert in viele Netzwerke |

Umgekehrt lässt sich **jedes** KOP-Netzwerk nach SCL übersetzen. Die Übersetzung ist also nur in eine Richtung vollständig.

### Wann KOP, wann SCL?

| Nimm KOP, wenn … | Nimm SCL, wenn … |
|---|---|
| es um Bitverknüpfungen geht | gerechnet wird (Formeln, Skalierung) |
| Verriegelungen und Freigaben | Schleifen über Arrays nötig sind |
| die Instandhaltung im Live-Betrieb mitliest | Schrittketten mit `CASE` abgebildet werden |
| Schaltpläne 1:1 abgebildet werden | Stringverarbeitung oder Kommunikation |
| Störungsanzeigen und Meldungen | Rezepte und Datenverwaltung |

Der Grund für KOP in der Praxis ist die **Online-Diagnose**: Der durchgeschaltete Strompfad wird farbig dargestellt, Instandhalter sehen sofort, welcher Kontakt blockiert.

### Lesbarkeit großer Netzwerke

```text
  SCHLECHT: alles in ein Netzwerk

     A    B    C    D    E    F    G    H    I         Y
  ---| |--| |--| |--| |--| |--|/|--| |--| |--| |------( )----

  BESSER: Teilergebnisse benennen

  Netzwerk 1: Sicherheitskette
     A    B    C                  M_Sicherheit
  ---| |--| |--| |---------------( )----

  Netzwerk 2: Betriebsbedingungen
     D    E    F                  M_Betrieb
  ---| |--| |--|/|---------------( )----

  Netzwerk 3: Freigabe
     M_Sicherheit M_Betrieb  G    H    I     Y
  ---| |----------| |-------| |--| |--| |---( )----
```

Faustregel: maximal **sechs bis acht** Elemente pro Strompfad, maximal **zwei** Verzweigungsebenen.

## Typische Use Cases

- Bestehende KOP-Programme dokumentieren oder in einer Code-Review erklären.
- Logik aus einem Lastenheft (Prosa oder Pseudocode) erst als SCL notieren, dann als KOP zeichnen.
- Hybridprojekte: Verriegelungen in KOP, Rezept- und Rechenbausteine in SCL.
- Migration: alte AWL-Bausteine über KOP nach SCL überführen.
- Prüfungs- und Interviewfragen: "Übersetze dieses Netzwerk."

## Clean-Code-Empfehlungen

- Pro Netzwerk eine SCL-Zeile – wenn die Übersetzung länger wird, ist das Netzwerk zu groß.
- Klammern in SCL auch dann setzen, wenn die Rangfolge sie nicht erzwingt: `("A" OR "B") AND "C"` liest sich besser.
- Beim Übersetzen nach KOP die Klammerstruktur zuerst aufzeichnen, dann die Kontakte eintragen.
- Symbolnamen in beiden Sprachen identisch halten – sie stammen ohnehin aus derselben Zuordnungsliste.
- Kommentare im Netzwerk beschreiben das **Warum**, nicht die Kontaktkette.
- Sprachwahl pro Baustein, nicht pro Netzwerk: gemischte Bausteine sind schwer zu warten.

## Häufige Fehler

```text
  FALSCH uebersetzt: Klammer vergessen

     A                    C          Y
  +---| |---+--------------| |------( )----
  |         |
  | B       |
  +---| |---+

  -> "Y" := "A" OR "B" AND "C";        FALSCH
     AND bindet staerker: ergibt "A" OR ("B" AND "C")

  RICHTIG:
     "Y" := ("A" OR "B") AND "C";
```

```text
  FALSCH uebersetzt: Spule als IF

     A          Y
  ----| |------( )----

  -> IF "A" THEN "Y" := TRUE; END_IF;   FALSCH
     Damit faellt Y nie wieder ab - das waere eine Setzspule.

  RICHTIG:
     "Y" := "A";
```

```text
  FALSCH uebersetzt: Flankenmerker nicht nachgefuehrt

     S_Start   M_Fl               M_Impuls
  ----| |--------|P|---------------( )----

  -> "M_Impuls" := "S_Start" AND NOT "M_Fl";    unvollstaendig

  RICHTIG:
     "M_Impuls" := "S_Start" AND NOT "M_Fl";
     "M_Fl" := "S_Start";
```

```text
  FALSCH uebersetzt: EN-Bedingung weggelassen

                     +-------------+
     M_Rechnen       |  ADD  Int   |
  ----| |------------| EN      ENO |----
     "A" -----------| IN1     OUT |---- "Summe"
     "B" -----------| IN2         |
                     +-------------+

  -> "Summe" := "A" + "B";              FALSCH
     rechnet jeden Zyklus, auch ohne Freigabe

  RICHTIG:
     IF "M_Rechnen" THEN
         "Summe" := "A" + "B";
     END_IF;
```

## Interview-relevante Details

- Die Übersetzung KOP → SCL ist **immer** möglich, SCL → KOP nicht (Schleifen, Strings, Strukturen).
- `AND` bindet in SCL stärker als `OR` – wer Klammern vergisst, ändert die Logik.
- Eine Spule entspricht einer **Zuweisung**, keine `IF`-Anweisung. Nur `(S)`/`(R)` werden zu `IF`.
- Bei Set/Reset entscheidet die **Reihenfolge** der `IF`-Blöcke über den Vorrang, genau wie die Netzwerkreihenfolge in KOP.
- Flanken brauchen in SCL zwei Zeilen: Auswertung und Nachführung des Merkers. In KOP steckt beides im `|P|`-Kontakt.
- Timer/Zähler sind in beiden Sprachen **Instanzaufrufe** – die Instanzdaten sind identisch.
- KOP wird in der Instandhaltung bevorzugt, weil der Signalfluss online farblich sichtbar ist. Das ist ein Wartungs-, kein Programmierargument.
- TIA kann KOP ↔ FUP automatisch umschalten, aber **nicht** automatisch nach SCL. Umgekehrt lässt sich ein SCL-Baustein nie als KOP anzeigen.

## Zusammenfassung

- Reihe → `AND`, Parallel → `OR`, Öffner → `NOT`, Verzweigung → Klammer.
- Spule → `:=`, Setzspule/Rücksetzspule → `IF ... THEN ... := TRUE/FALSE; END_IF;`.
- Flanke → `Signal AND NOT Flankenmerker`, danach `Flankenmerker := Signal;`.
- Box mit `EN` → `IF`-Bedingung um die Berechnung herum.
- `AND` bindet stärker als `OR` – Klammern beim Übersetzen immer prüfen.
- KOP → SCL geht immer; SCL → KOP scheitert an Schleifen, `CASE`, Strings und Strukturen.
- KOP für Verriegelungen und Diagnose, SCL für Rechnen, Schleifen und Schrittketten.
