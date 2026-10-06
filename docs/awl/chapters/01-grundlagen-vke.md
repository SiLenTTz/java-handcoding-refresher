# Kapitel 01 – AWL Grundlagen & VKE

## Mental Model

```text
  E 0.0 ──┐
  E 0.1 ──┤   Verknüpfungskette   ──►  VKE (1 Bit)  ──►  = A 4.0
  M 10.0 ─┘        U / O / X                              (Zuweisung)
                                          ▲
                     jede Bit-Anweisung rechnet mit genau diesem einen Bit weiter
```

AWL ist eine **Registermaschine**: Jede Zeile ist eine Anweisung, die auf verstecktem Zustand
arbeitet. Für Bitlogik ist dieser Zustand das **VKE** (Verknüpfungsergebnis) – ein einziges Bit,
das von Zeile zu Zeile weitergereicht wird, bis es zugewiesen oder gespeichert wird. Du liest
AWL deshalb nie zeilenweise isoliert, sondern immer als Kette.

## Syntax / API

### Aufbau einer Anweisung

```text
U     E 0.0          // Operation + Operand
      Operation: was getan wird      (U = UND-Verknüpfung)
      Operand:   womit               (E 0.0 = Eingangsbit 0.0)

NOT                  // manche Operationen haben gar keinen Operanden
BEA                  // Bausteinende absolut
```

Eine Anweisung pro Zeile, Kommentar ab `//` bis Zeilenende. Groß-/Kleinschreibung ist egal,
üblich ist Großschreibung der Operationen.

### Operandenbereiche

| Bereich | Deutsch (SIMATIC) | Englisch (IEC) | Bedeutung |
|---|---|---|---|
| `E` | Eingang | `I` | Prozessabbild der Eingänge (PAE) |
| `A` | Ausgang | `Q` | Prozessabbild der Ausgänge (PAA) |
| `M` | Merker | `M` | globales Bitgedächtnis der CPU |
| `L` | Lokaldaten | `L` | temporäre Daten, nur im Baustein gültig |
| `DB` / `DI` | Datenbaustein | `DB` | globale bzw. Instanz-Daten |
| `T` / `Z` | Zeit / Zähler | `T` / `C` | S7-Timer und -Zähler |
| `PE` / `PA` | Peripherie | `PI` / `PQ` | direkter Zugriff am Prozessabbild vorbei |

Merke: Die CPU liest am Zyklusanfang die Eingänge **einmal** ins PAE und schreibt am Zyklusende
das PAA **einmal** auf die Ausgangskarten. Innerhalb des Zyklus siehst du also ein eingefrorenes Bild.

### Breiten: Bit, Byte, Wort, Doppelwort

```text
E 0.0        // Bit 0 im Eingangsbyte 0      (Bits laufen von .0 bis .7)
EB 0         // Eingangsbyte 0               (8 Bit)
EW 0         // Eingangswort 0  = EB 0 + EB 1  (16 Bit)
ED 0         // Eingangsdoppelwort 0 = EB 0..EB 3 (32 Bit)

MB 10 / MW 10 / MD 10     // dasselbe Schema für Merker
```

Achtung Überlappung: `MW 10` belegt `MB 10` **und** `MB 11`. `MW 10` und `MW 11` überschneiden
sich – eine klassische Fehlerquelle in gewachsenen Merkerbelegungen.

### Bit-Adressierung

```text
E 0.0   E 0.7   E 1.0        // gültig
E 0.8                        // UNGÜLTIG – ein Byte hat nur die Bits .0 bis .7
```

### Erste Verknüpfungen und die Zuweisung

```text
NETZWERK 1: Förderband freigeben

      U     E 0.0             // Start-Taster
      U     E 0.1             // Not-Halt nicht betätigt (Öffner, liefert 1 im Gutzustand)
      =     A 4.0             // Motor Förderband
```

`U` = UND, `O` = ODER, `UN` = UND NICHT, `=` = Zuweisung. Die Zuweisung schreibt das aktuelle
VKE in den Operanden und **beendet** die Verknüpfungskette.

### Erstabfrage – der wichtigste Mechanismus

Das Statuswort enthält ein Bit `/ER` (Erstabfragebit). Ist es `0`, so ist die nächste Bit-Abfrage
eine **Erstabfrage**: Das VKE wird mit dem Abfrageergebnis **überschrieben**, der alte Wert spielt
keine Rolle. Danach steht `/ER = 1`, und jede weitere Abfrage wird mit dem VKE **verknüpft**.

```text
      U     E 0.0             // Erstabfrage: VKE := E 0.0
      U     E 0.1             // Verknüpfung: VKE := VKE UND E 0.1
      =     A 4.0             // VKE-begrenzend: schreibt A 4.0, setzt /ER := 0

      U     E 0.2             // wieder Erstabfrage – neue, unabhängige Kette
      =     A 4.1
```

VKE-begrenzende Operationen sind u. a. `=`, `S`, `R`, `SPB`, `SPBN`, `CALL`, `BEB`.
Genau deshalb kannst du mehrere Netzwerke hintereinanderschreiben, ohne dass sie sich mischen.

### Das Statuswort in Kurzform

| Bit | Name | Bedeutung |
|---|---|---|
| `/ER` | Erstabfragebit | `0` → nächste Abfrage ist Erstabfrage |
| `VKE` | Verknüpfungsergebnis | das Arbeitsbit der Bitlogik |
| `STA` | Status | Signalzustand des zuletzt adressierten Bits (nur fürs Debuggen) |
| `OR` | ODER-Bit | merkt ein erfülltes UND innerhalb einer ODER-Kette |
| `OV` / `OS` | Überlauf / gespeicherter Überlauf | Arithmetikfehler, `OS` bleibt stehen |
| `A1` / `A0` | Anzeigenbits | Ergebnis von Vergleichen und Rechenoperationen |
| `BIE` | Binärergebnis | Baustein-Rückgabebit, mit `SAVE` beschreibbar |

Im Alltag brauchst du `/ER`, `VKE`, `A1/A0` und `BIE`. Die restlichen Bits siehst du nur in der
Statusanzeige beim Beobachten.

### Absolut vs. symbolisch

```text
      U     E 0.0                        // absolut – sagt nichts über die Funktion
      U     "Start_Band"                 // symbolisch – aus der Zuordnungsliste

// Zuordnungsliste (Symboltabelle)
// Symbol          Operand   Datentyp   Kommentar
// Start_Band      E 0.0     BOOL       Taster Start Förderband (Schließer)
// NotHalt_OK      E 0.1     BOOL       Not-Halt-Kreis geschlossen (Öffner-Logik)
// Motor_Band      A 4.0     BOOL       Schütz K1 Bandmotor
```

Symbolisch ist Pflicht für wartbaren Code. Absolute Adressen gehören in die Zuordnungsliste und
in den Klemmenplan – nicht in die Logik.

### Netzwerke und Kommentare

```text
NETZWERK 1
TITEL: Freigabe Förderband
// Das Band läuft, wenn der Start-Taster gedrückt ist, der Not-Halt-Kreis
// geschlossen ist und keine Störung ansteht.

      U     "Start_Band"
      U     "NotHalt_OK"
      UN    "Stoerung"
      =     "Motor_Band"
```

Ein Netzwerk = eine abgeschlossene Aussage. Netzwerktitel und Kommentar sind in AWL kein Luxus,
sondern der einzige Weg, die Absicht lesbar zu machen.

## Typische Use Cases

- Verriegelungen und Freigaben ("Band läuft nur, wenn …") als kurze UND-Ketten.
- Sammelstörmeldung aus vielen Einzelmeldungen als ODER-Kette.
- Handbetrieb/Automatik-Umschaltung über Merker.
- Altanlagen lesen und verstehen: S7-300/400-Programme sind oft komplett in AWL geschrieben.
- Stellen, an denen SCL früher nicht verfügbar war: bitweise Tricks, Statuswort-Auswertung.

## Clean-Code-Empfehlungen

- Ein Netzwerk pro fachlicher Aussage, maximal 10–15 Zeilen.
- Immer symbolisch adressieren, Symbole sprechend benennen (`NotHalt_OK`, nicht `M1`).
- Operationen in Spalten ausrichten, Operanden untereinander – AWL lebt von Blocksatz.
- Netzwerktitel beschreibt das *Was*, der Kommentar das *Warum*.
- Merkerbereiche dokumentieren und blockweise reservieren, damit sich `MW`/`MB` nicht überlappen.
- Für neue Projekte: nimm SCL. AWL nur dort, wo der Bestand es erzwingt.

## Häufige Fehler

```text
// FALSCH: Bitnummer größer 7
      U     E 0.8
// RICHTIG
      U     E 1.0

// FALSCH: Not-Halt als Schließer abgefragt – Drahtbruch wirkt wie "alles gut"
      U     "NotHalt_Taster"
// RICHTIG: Not-Halt ist hardwareseitig ein Öffner, im Gutzustand liegt 1 an
      U     "NotHalt_OK"

// FALSCH: angenommen, das VKE lebt über die Zuweisung hinaus weiter
      U     E 0.0
      =     A 4.0
      U     E 0.1          // das ist eine ERSTABFRAGE, kein "UND E 0.1"
      =     A 4.1          // A 4.1 hängt NUR an E 0.1

// FALSCH: überlappende Merkerworte
      L     MW 10
      L     MW 11          // teilt sich MB 11 mit MW 10
// RICHTIG: im 2er-Raster vergeben
      L     MW 10
      L     MW 12

// FALSCH: Ausgang in zwei Netzwerken zugewiesen – das letzte gewinnt immer
      =     A 4.0
      ...
      =     A 4.0
// RICHTIG: eine Zuweisung pro Ausgang, Bedingungen vorher verknüpfen
```

## Interview-relevante Details

- **VKE** ist genau 1 Bit. Alles, was mit `U`/`O`/`X` passiert, verändert nur dieses Bit.
- **Erstabfrage** entsteht durch `/ER = 0`; VKE-begrenzende Befehle (`=`, `S`, `R`, `SPB`, `CALL`)
  setzen `/ER` zurück. Ohne dieses Wissen kann man AWL nicht lesen.
- `=` ist **nicht** speichernd: Wird das VKE `0`, wird der Ausgang sofort `0`.
- Prozessabbild: `E`/`A` werden einmal pro Zyklus aktualisiert, `PE`/`PA` greifen sofort auf die
  Baugruppe zu (langsamer, aber zyklusunabhängig).
- `STA` ist **nicht** das VKE: Es zeigt den Signalzustand des adressierten Bits und dient nur der
  Diagnose.
- AWL ist Siemens-Dialekt der IEC-61131-3-**IL** (Instruction List). IL wurde in der Norm
  mittlerweile als "deprecated" eingestuft.
- **S7-1200 unterstützt kein AWL.** Bei S7-1500 ist AWL noch möglich, Siemens empfiehlt aber SCL.
  Lesekompetenz bleibt trotzdem wertvoll: Tausende S7-300/400-Anlagen laufen weiter.

## Zusammenfassung

- Eine AWL-Anweisung besteht aus Operation und Operand; das VKE ist das zentrale Arbeitsbit.
- Erstabfrage überschreibt das VKE, jede Folgeabfrage verknüpft es.
- VKE-begrenzende Befehle (`=`, `S`, `R`, Sprünge, `CALL`) beenden die Kette.
- Operandenbereiche: `E`, `A`, `M`, `L`, `DB`, `T`, `Z`, `PE`/`PA`; Breiten Bit/`B`/`W`/`D`.
- Bit-Adressen gehen nur von `.0` bis `.7`; Wortadressen überlappen sich.
- Symbolische Adressierung über die Zuordnungsliste ist Pflicht, Netzwerke strukturieren das Programm.
- AWL ist für Neuentwicklung out, für Bestandsanlagen unverzichtbar.
