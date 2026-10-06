# Kapitel 06 – FUP ↔ SCL übersetzen

## Mental Model

```text
Netzwerk 1: Ein Netzwerk ist eine Anweisung

            +-------+            +-------+
  "Start" --|       |            |       |
            |  >=1  |------------|   &   |------( )  "Motor"
  "Motor" --|       |            |       |
            +-------+  "Stopp" -o|       |
                                 +-------+

   von links nach rechts lesen   =   von innen nach aussen klammern

   "Motor" := ("Start" OR "Motor") AND NOT "Stopp";
```

Jedes FUP-Netzwerk ist **genau eine SCL-Anweisung**. Die Box ganz rechts vor der Zuweisung ist der äußerste Operator, die Boxen links davon sind die Klammern.

## Syntax / API

### Die Übersetzungstabelle

| FUP | SCL | Hinweis |
|---|---|---|
| `&`-Box | `AND` | Eingänge mit `AND` verketten |
| `>=1`-Box | `OR` | Eingänge mit `OR` verketten |
| `XOR`-Box | `XOR` | |
| negierter Eingang `-o\|` | `NOT operand` | gilt nur für diesen Eingang |
| negierter Ausgang `-o( )` | `NOT (...)` | gesamtes Ergebnis klammern |
| Zuweisung `( )` | `:=` | eine Anweisung pro Netzwerk |
| `(S)` / `(R)` | `IF ... THEN x := TRUE/FALSE; END_IF;` | |
| `SR`-Baustein | `IF Reset THEN ... ELSIF Set THEN ...` | Reset zuerst |
| `RS`-Baustein | `IF Set THEN ... ELSIF Reset THEN ...` | Set zuerst |
| Box-Verschachtelung | Klammer `( )` | innerste Box = innerste Klammer |
| Funktionsbaustein (TON, CTU) | `"Instanz"(IN := ..., PT := ...);` | Instanzname vor der Klammer |
| Vergleichsbox | `(a > b)` | als Teilausdruck klammern |
| `EN`-Eingang | `IF EN THEN ... END_IF;` | |

### FUP → SCL: einfache Verknüpfung

```text
Netzwerk 1: Foerderband freigeben

              +-------+
     "Haupt" -|       |
      "Tuer" -|   &   |------( )  "Freigabe"
     "Quitt" -|       |
   "Stoerung"-o       |
              +-------+
```

```pascal
"Freigabe" := "Haupt" AND "Tuer" AND "Quitt" AND NOT "Stoerung";
```

Regel: Operanden in der Reihenfolge von **oben nach unten** abarbeiten, negierte Eingänge bekommen ein `NOT` davor.

### FUP → SCL: Verschachtelung

```text
Netzwerk 2: (Auto UND Freigabe) ODER Hand, nie bei Stoerung

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

Vorgehen: Von der Zuweisung nach links gehen. Jede Box, die in eine andere Box mündet, wird eine Klammer.

### FUP → SCL: Speicher

```text
Netzwerk 3: Tor-Steuerung mit SR

                   +--------+
      "Auf_Tast" --|S     SR|
                   |        |---( )  "Tor_auf"
       "Zu_Tast" --|R1      |
                   +--------+
```

```pascal
IF "Zu_Tast" THEN
    "Tor_auf" := FALSE;
ELSIF "Auf_Tast" THEN
    "Tor_auf" := TRUE;
END_IF;
```

Der **dominante** Eingang (unten) wird in SCL zum **ersten** `IF`-Zweig.

### FUP → SCL: Bausteinaufruf

```text
Netzwerk 4: Nachlauf der Absaugung

                   +-----------+
                   |    TOF    |
                   | "DB_Nachl"|
     "Motor" ------|IN        Q|------( )  "Absaugung"
      T#10s  ------|PT       ET|
                   +-----------+
```

```pascal
"DB_Nachl"(IN := "Motor", PT := T#10s);
"Absaugung" := "DB_Nachl".Q;
```

Der Aufruf und die Auswertung des Ausgangs sind in SCL **zwei Zeilen**. In FUP ist es ein Netzwerk.

### SCL → FUP: rückwärts

```pascal
"Warnung" := ("Druck" > 6.0) AND NOT "Quittiert";
```

```text
Netzwerk 5: Druckwarnung

                 +--------+
      "Druck" ---|   >    |
                 |  Real  |----+       +-------+
          6.0 ---|        |    +-------|       |
                 +--------+            |   &   |------( )  "Warnung"
                      "Quittiert" ----o|       |
                                       +-------+
```

Vorgehen rückwärts:
1. Äußersten Operator bestimmen (hier `AND`) → das ist die **letzte Box** vor der Zuweisung.
2. Jeden Operanden als Eingang eintragen; `NOT` wird zum Kreis am Eingang.
3. Geklammerte Teilausdrücke werden eigene Boxen **links davon**.
4. Die Variable links von `:=` wird die Zuweisung rechts.

### Grenzen der Übersetzung

```pascal
// Hat KEINE FUP-Entsprechung:
FOR i := 0 TO 9 DO
    "Summe" := "Summe" + "Werte"[i];
END_FOR;

CASE "Schritt" OF
    0: "Aktion" := "Start";
    1: "Aktion" := "Fahren";
END_CASE;

WHILE "Suchen" DO ... END_WHILE;
```

FUP kennt keine Schleifen, keine `CASE`-Anweisung, keine lokalen temporären Berechnungen in Ausdrücken und keine String-Verarbeitung. Diese Konstrukte lassen sich nur umständlich mit Sprüngen und Zählern nachbilden – dafür ist SCL da.

Umgekehrt gilt: **Jedes FUP-Netzwerk lässt sich nach SCL übersetzen.** Die Richtung FUP → SCL ist immer möglich, SCL → FUP nur für den Verknüpfungs-Teil.

## Typische Use Cases

- **Code-Review**: Ein FUP-Netzwerk in SCL aufschreiben, um die Logik eindeutig zu prüfen.
- **Migration**: Alte FUP-Bausteine Netzwerk für Netzwerk nach SCL überführen.
- **Dokumentation**: Die SCL-Zeile als Kommentar über das Netzwerk schreiben.
- **Fehlersuche**: Komplexe Verschachtelung in SCL ausschreiben – Klammerfehler werden sofort sichtbar.
- **Mischbetrieb**: Verknüpfungslogik in FUP (gut online beobachtbar), Rechnen und Ablaufsteuerung in SCL.
- **Prüfungssituation**: Netzwerk lesen und die Wahrheitstabelle über die SCL-Form herleiten.

## Clean-Code-Empfehlungen

- Pro Baustein **eine** Sprache. Mischen innerhalb eines FBs macht die Wartung schwer.
- FUP für bitorientierte Verriegelungen, Freigaben und Sicherheitslogik – dort ist der Online-Status direkt am Netzwerk ablesbar.
- SCL für Berechnungen, Schrittketten, Rezepte, Arrays und alles mit Schleifen.
- Eine SCL-Zeile, die länger als ~100 Zeichen wird, ist als FUP-Netzwerk oft lesbarer – und umgekehrt.
- Beim Übersetzen die **Operandennamen unverändert** lassen; nur die Struktur ändert sich.
- Nach der Übersetzung immer gegenprüfen: gleiche Anzahl Operanden, gleiche Negationen, gleiches Zielbit.

## Häufige Fehler

```text
FALSCH – Klammern beim Uebersetzen vergessen

              +-------+
    "Auto" ---|       |
              |  >=1  |---+     +-------+
    "Hand" ---|       |   +-----|   &   |---( ) "Motor"
              +-------+   "Frei"|       |
                                +-------+
```

```pascal
// FALSCH
"Motor" := "Auto" OR "Hand" AND "Frei";    // AND bindet staerker!
// RICHTIG
"Motor" := ("Auto" OR "Hand") AND "Frei";
```

In SCL bindet `AND` stärker als `OR`. Ohne Klammer entsteht `"Auto" OR ("Hand" AND "Frei")` – eine völlig andere Logik.

```text
FALSCH – Negation am Ausgang als Negation der Eingaenge uebersetzt

              +-------+
       "A" ---|   &   |-----o( )  "Y"
       "B" ---|       |
              +-------+
```

```pascal
// FALSCH
"Y" := NOT "A" AND NOT "B";
// RICHTIG
"Y" := NOT ("A" AND "B");
```

```text
FALSCH – SR-Vorrang beim Uebersetzen gedreht

                   +--------+
      "Start" -----|S     SR|
                   |        |---( )  "Motor"
      "Stopp" -----|R1      |
                   +--------+
```

```pascal
// FALSCH – Start gewinnt bei Gleichzeitigkeit
IF "Start" THEN
    "Motor" := TRUE;
ELSIF "Stopp" THEN
    "Motor" := FALSE;
END_IF;

// RICHTIG – SR heisst: Ruecksetzen vorrangig
IF "Stopp" THEN
    "Motor" := FALSE;
ELSIF "Start" THEN
    "Motor" := TRUE;
END_IF;
```

```text
FALSCH – Bausteinaufruf aus der SCL-Uebersetzung weggelassen

```

```pascal
// FALSCH – Instanz wird nie aufgerufen, .Q bleibt stehen
"Absaugung" := "DB_Nachl".Q;

// RICHTIG – erst aufrufen, dann auswerten
"DB_Nachl"(IN := "Motor", PT := T#10s);
"Absaugung" := "DB_Nachl".Q;
```

```text
FALSCH – mehrere FUP-Netzwerke in eine SCL-Zeile gequetscht

Netzwerk 1: "Freigabe" := ...
Netzwerk 2: "Motor"    := "Freigabe" AND ...

zusammengefasst zu einer Zeile -> der Zwischenwert "Freigabe" fehlt
der Diagnose und wird nirgends mehr angezeigt.
```

```pascal
// RICHTIG – benannte Zwischenergebnisse erhalten
"Freigabe" := "Haupt" AND "Tuer" AND NOT "Stoerung";
"Motor"    := "Freigabe" AND "Start";
```

## Interview-relevante Details

- **Operatorpräzedenz in SCL**: `NOT` > `AND` > `XOR` > `OR`. In FUP gibt es keine Präzedenz – die Struktur ist explizit. Deshalb entstehen beim Übersetzen Klammern.
- **Warum ist FUP → SCL immer möglich, SCL → FUP nicht?** FUP ist eine Teilmenge: nur Ausdrücke und Zuweisungen, keine Kontrollstrukturen.
- **Online-Beobachtung**: In FUP färbt das TIA Portal jede Verbindungslinie ein – man sieht sofort, welcher Eingang die Verknüpfung blockiert. In SCL sieht man nur das Ergebnis der Zeile. Für Inbetriebnahme ist das ein echtes Argument für FUP.
- **Sprachumschaltung**: KOP ↔ FUP geht im TIA Portal pro Baustein hin und zurück. SCL → FUP geht **nicht**.
- **Dominanz bei Set/Reset-Spulen** wird durch die Programmreihenfolge bestimmt, beim SR/RS-Baustein durch den unteren Eingang. Beim Übersetzen genau hinsehen.
- **Bausteinaufrufe** brauchen in SCL eine eigene Zeile mit der Instanz; in FUP sind Aufruf und Ergebnisauswertung ein Netzwerk.
- **Codegröße**: Beide Sprachen werden in denselben MC7+-Code übersetzt. Es gibt keinen Laufzeitvorteil der einen über die andere.

## Zusammenfassung

- Ein FUP-Netzwerk = eine SCL-Anweisung.
- `&` → `AND`, `>=1` → `OR`, `XOR` → `XOR`, Kreis am Eingang → `NOT`, `( )` → `:=`.
- Verschachtelte Boxen werden zu Klammern; `AND` bindet stärker als `OR`.
- Negierter Ausgang ist `NOT (...)`, nicht `NOT a AND NOT b`.
- `SR` → `IF Reset ... ELSIF Set`, `RS` → `IF Set ... ELSIF Reset`.
- Bausteine: in SCL erst `"Instanz"(...)` aufrufen, dann `.Q` auswerten.
- FUP → SCL geht immer; SCL → FUP nur ohne Schleifen, `CASE` und Strings.
- FUP für Verriegelungen und Inbetriebnahme, SCL für Rechnen und Ablaufsteuerung.
