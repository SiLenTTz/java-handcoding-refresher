# Kapitel 03 – IF & CASE

## Mental Model

```text
IF   → beliebige BEDINGUNGEN, auch verschiedene Variablen
       "Wenn Druck zu hoch UND Hand nicht aktiv ..."

CASE → EIN Ausdruck, viele Werte
       "Je nachdem, in welchem Schritt die Kette gerade ist ..."

Faustregel:
  2–3 unabhängige Bedingungen  → IF / ELSIF
  Zustand, Schritt, Betriebsart → CASE
```

- Beide Anweisungen werden in **jedem Zyklus** komplett neu durchlaufen. Was im `ELSE`-Zweig nicht zurückgesetzt wird, bleibt vom letzten Zyklus stehen.
- Die Bedingung ist ein **boolescher Ausdruck** – das Ergebnis ist das VKE.

## Syntax / API

### IF / ELSIF / ELSE

```pascal
IF rDruckIst > DRUCK_MAX THEN
    q_xVentilAuf := TRUE;
    q_xAlarm     := TRUE;
ELSIF rDruckIst > DRUCK_WARN THEN
    q_xVentilAuf := TRUE;
    q_xAlarm     := FALSE;
ELSE
    q_xVentilAuf := FALSE;
    q_xAlarm     := FALSE;
END_IF;
```

- `ELSIF` ist **ein** Wort (nicht `ELSE IF`).
- Jeder `IF`-Block endet mit `END_IF;` – das Semikolon gehört dazu.
- Die Zweige werden **von oben nach unten** geprüft; der erste wahre gewinnt, der Rest wird übersprungen.

### Frühe Zuweisung statt Verschachtelung

```pascal
// Verschachtelt – schwer zu lesen
IF xBetriebsbereit THEN
    IF NOT xStoerung THEN
        IF rNiveau > NIVEAU_MIN THEN
            q_xPumpe := TRUE;
        END_IF;
    END_IF;
END_IF;

// Als ein Ausdruck – besser
q_xPumpe := xBetriebsbereit AND NOT xStoerung AND (rNiveau > NIVEAU_MIN);
```

Wenn am Ende nur **eine** boolesche Zuweisung steht, ist eine IF-Kaskade fast immer überflüssig.

### Grundstellung zuerst

```pascal
// Alle Ausgänge in Grundstellung, dann nur die Ausnahme setzen
q_xMotorLinks  := FALSE;
q_xMotorRechts := FALSE;

IF i_xTippenLinks THEN
    q_xMotorLinks := TRUE;
ELSIF i_xTippenRechts THEN
    q_xMotorRechts := TRUE;
END_IF;
```

Das ist das wichtigste Muster gegen „hängende“ Ausgänge: Erst alles löschen, dann gezielt setzen.

### CASE – Einzelwerte, Bereiche, Listen

```pascal
CASE iBetriebsart OF
    0:
        q_sMeldung := 'Aus';
    1, 2:                                  // Liste
        q_sMeldung := 'Hand';
    3..6:                                  // Bereich
        q_sMeldung := 'Automatik';
    7, 10..12:                             // Liste + Bereich gemischt
        q_sMeldung := 'Service';
    ELSE
        q_sMeldung := 'Unbekannt';
        q_xStoerung := TRUE;
END_CASE;
```

- Der CASE-Ausdruck muss ein **ganzzahliger** Typ sein (`Int`, `DInt`, `Byte`, `Word`) oder ein Aufzählungstyp.
- `Real`, `String` und `Bool` gehen nicht.
- Die Werte müssen **Konstanten** sein, keine Variablen.
- Mehrfach belegte Werte (`1: … 1..3: …`) sind ein Übersetzungsfehler.

### ELSE ist faktisch Pflicht

```pascal
CASE iSchritt OF
    10: ...
    20: ...
    30: ...
    ELSE
        // Unerwarteter Schritt: definiert in die Grundstellung
        iSchritt    := 0;
        q_xStoerung := TRUE;
END_CASE;
```

Ohne `ELSE` passiert bei einem unerwarteten Wert **gar nichts** – die Kette steht still, und niemand merkt warum.

### Schrittkette mit CASE

```pascal
CASE sSchritt OF
    SCHRITT_GRUND:                          // 0
        q_xVentilEin := FALSE;
        q_xRuehrer   := FALSE;
        IF i_xStart THEN
            sSchritt := SCHRITT_FUELLEN;
        END_IF;

    SCHRITT_FUELLEN:                        // 10
        q_xVentilEin := TRUE;
        IF i_rNiveau >= NIVEAU_SOLL THEN
            q_xVentilEin := FALSE;
            sSchritt     := SCHRITT_RUEHREN;
        END_IF;

    SCHRITT_RUEHREN:                        // 20
        q_xRuehrer := TRUE;
        IF sTimerRuehren.Q THEN
            q_xRuehrer := FALSE;
            sSchritt   := SCHRITT_ENTLEEREN;
        END_IF;

    SCHRITT_ENTLEEREN:                      // 30
        q_xAblauf := TRUE;
        IF i_rNiveau <= NIVEAU_LEER THEN
            q_xAblauf := FALSE;
            sSchritt  := SCHRITT_GRUND;
        END_IF;

    ELSE
        sSchritt    := SCHRITT_GRUND;
        q_xStoerung := TRUE;
END_CASE;
```

Konvention: Schrittnummern in **Zehnerschritten** (0, 10, 20, 30) vergeben – dann lassen sich später Zwischenschritte einfügen, ohne alles umzunummerieren.

### IF-Kaskade vs. CASE

```pascal
// IF-Kaskade über denselben Ausdruck – Signalrauschen
IF iSchritt = 0 THEN ...
ELSIF iSchritt = 10 THEN ...
ELSIF iSchritt = 20 THEN ...
END_IF;

// CASE – Absicht sofort erkennbar, Compiler erzeugt Sprungtabelle
CASE iSchritt OF
    0:  ...
    10: ...
    20: ...
END_CASE;
```

## Typische Use Cases

- **Betriebsartenumschaltung** (Aus / Hand / Automatik / Service) → `CASE`
- **Schrittkette** Behälterfüllung, Verpackungstakt → `CASE` mit Zehnerschritten
- **Grenzwertüberwachung** mit mehreren Stufen (Warnung / Alarm / Abschaltung) → `IF/ELSIF`
- **Ampelsteuerung** → `CASE` über die Phase
- **Störungsklassifizierung** über einen Fehlercode → `CASE` mit Bereichen

## Clean-Code-Empfehlungen

- Immer `ELSE` schreiben – auch wenn er nur einen Störmerker setzt.
- Ausgänge am Zweiganfang in Grundstellung bringen, statt überall Rücksetzungen zu verteilen.
- Schrittnummern als `VAR CONSTANT` mit sprechendem Namen (`SCHRITT_FUELLEN`), nicht als nackte Zahl.
- Verschachtelung maximal zwei Ebenen tief; tiefer → in eine eigene FC auslagern.
- Pro CASE-Zweig: erst Aktionen, dann Weiterschaltbedingung. Diese Reihenfolge immer gleich halten.
- Keine Doppelzuweisung desselben Ausgangs in mehreren CASE-Zweigen plus danach noch einmal.

## Häufige Fehler

```pascal
// FALSCH: ELSE IF getrennt geschrieben
IF a THEN ... ELSE IF b THEN ... END_IF; END_IF;
// RICHTIG
IF a THEN ... ELSIF b THEN ... END_IF;

// FALSCH: END_IF vergessen oder Semikolon fehlt
IF xA THEN q_x := TRUE END_IF
// RICHTIG
IF xA THEN q_x := TRUE; END_IF;

// FALSCH: Ausgang wird nie zurückgesetzt
IF rDruck > 6.0 THEN
    q_xAlarm := TRUE;
END_IF;                        // bleibt für immer TRUE
// RICHTIG
q_xAlarm := (rDruck > 6.0);

// FALSCH: CASE über Real
CASE rTemperatur OF            // Übersetzungsfehler
    20.0: ...
END_CASE;
// RICHTIG: IF-Kaskade mit Bereichen
IF rTemperatur < 20.0 THEN ... ELSIF rTemperatur < 50.0 THEN ... END_IF;

// FALSCH: CASE-Marken überlappen sich
CASE iCode OF
    1..5: ...
    3:    ...                  // 3 ist schon in 1..5 → Übersetzungsfehler
END_CASE;

// FALSCH: kein ELSE – Kette bleibt stumm stehen
CASE sSchritt OF
    0: ...
    10: ...
END_CASE;                      // sSchritt = 99 → nichts passiert, keine Meldung
// RICHTIG: ELSE mit definierter Grundstellung + Störmeldung

// FALSCH: Weiterschaltbedingung vor den Aktionen
SCHRITT_FUELLEN:
    IF i_rNiveau >= NIVEAU_SOLL THEN
        sSchritt := SCHRITT_RUEHREN;
    END_IF;
    q_xVentilEin := TRUE;      // Ventil geht noch einen Zyklus auf, obwohl weitergeschaltet
// RICHTIG: erst Aktionen, dann Weiterschaltbedingung

// FALSCH: Schritt in zwei Zweigen weiterschalten
SCHRITT_FUELLEN:
    sSchritt := SCHRITT_RUEHREN;
SCHRITT_RUEHREN:
    sSchritt := SCHRITT_ENTLEEREN;   // läuft im SELBEN Zyklus durch? Nein – aber verwirrt
```

## Interview-relevante Details

- Ein `CASE`-Zweig läuft **nicht** in den nächsten durch – es gibt kein `break` wie in C und kein Fall-Through.
- Der Compiler kann aus `CASE` eine Sprungtabelle bauen; eine IF-Kaskade wird sequenziell geprüft. Bei vielen Zweigen ist `CASE` schneller und zykluszeitstabiler.
- Nach einem Schrittwechsel wird der **neue** Schritt erst im nächsten Zyklus bearbeitet – genau das macht Schrittketten vorhersagbar.
- `IF` ohne `ELSE` ist in der SPS gefährlicher als in Hochsprachen, weil Ausgänge ihren Wert über Zyklen behalten.
- CASE-Marken müssen zur Übersetzungszeit bekannt sein; `CASE iX OF iGrenze: …` geht nicht.
- Für CASE über Betriebsarten lohnt sich ein eigener Aufzählungs-Datentyp (UDT/Enum) statt roher Zahlen.
- Die Grundstellung einer Schrittkette gehört in den Schritt 0 – und zusätzlich in den `ELSE`-Zweig.

## Zusammenfassung

- `IF … THEN … ELSIF … ELSE … END_IF;` – `ELSIF` ist ein Wort, `END_IF;` mit Semikolon.
- Ausgänge zuerst in Grundstellung, dann gezielt setzen – sonst hängen sie.
- Reine Bool-Zuweisungen direkt schreiben statt IF-Kaskade.
- `CASE <ganzzahliger Ausdruck> OF` mit Einzelwerten, Listen (`1, 2`) und Bereichen (`3..6`).
- `ELSE` immer schreiben: unerwarteter Zustand → Grundstellung + Störmeldung.
- Schrittketten: Zehnerschritte, benannte Konstanten, pro Zweig erst Aktionen, dann Weiterschaltbedingung.
- Gleicher Ausdruck, viele Werte → `CASE`; verschiedene Bedingungen → `IF`.
