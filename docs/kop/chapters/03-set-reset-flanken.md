# Kapitel 03 – Set, Reset & Flanken

## Mental Model

```text
  Spule ( )            folgt dem Strompfad jeden Zyklus  -> Zuweisung
  Setzspule (S)        schreibt nur 1, nie 0             -> IF .. THEN x := TRUE
  Ruecksetzspule (R)   schreibt nur 0, nie 1             -> IF .. THEN x := FALSE

  Flanke |P|           1 Zyklus lang 1 bei 0 -> 1
  Flanke |N|           1 Zyklus lang 1 bei 1 -> 0
```

Eine normale Spule **beschreibt** den Operanden in jedem Zyklus. `(S)` und `(R)` **verändern** ihn nur bei Bedarf und lassen ihn sonst in Ruhe – der Zustand bleibt gespeichert, bis ihn jemand anders ändert.

## Syntax / API

### Spule vs. Setzspule vs. Rücksetzspule

```text
  Netzwerk 1: normale Spule - folgt dem Taster

     S_Taster                     M_Zustand
  ----| |------------------------( )----
```

```pascal
"M_Zustand" := "S_Taster";
```

```text
  Netzwerk 1: Setzspule - bleibt nach dem Loslassen 1

     S_Taster                     M_Zustand
  ----| |------------------------(S)----
```

```pascal
IF "S_Taster" THEN
    "M_Zustand" := TRUE;
END_IF;
```

```text
  Netzwerk 2: Ruecksetzspule

     S_Quittung                   M_Zustand
  ----| |------------------------(R)----
```

```pascal
IF "S_Quittung" THEN
    "M_Zustand" := FALSE;
END_IF;
```

Wichtig: `(S)` und `(R)` gehören **immer als Paar**. Ein Set ohne passendes Reset ist ein hängender Zustand.

### Reihenfolge entscheidet über den Vorrang

```text
  Netzwerk 1:
     Setzen                       M_Stoerung
  ----| |------------------------(S)----

  Netzwerk 2:
     Quittieren                   M_Stoerung
  ----| |------------------------(R)----
```

Beide Bedingungen gleichzeitig 1 → das **zuletzt bearbeitete Netzwerk** gewinnt. Hier also **Rücksetzen vorrangig**.

### SR-Baustein: Rücksetzen vorrangig

```text
  Netzwerk 1: Speicher mit Reset-Vorrang

                 +-------------+
                 |  M_Stoerung |
                 |     SR      |
     Melder      |             |      M_Lampe
  ----| |--------| S         Q |-----( )----
                 |             |
     Quittung    |             |
  ----| |--------| R1          |
                 +-------------+
```

```pascal
"M_Stoerung"("S" := "Melder", "R1" := "Quittung", "Q" => "M_Lampe");
// R1 liegt unten -> R1 gewinnt bei gleichzeitiger Ansteuerung
```

### RS-Baustein: Setzen vorrangig

```text
  Netzwerk 1: Speicher mit Set-Vorrang

                 +-------------+
                 |  M_Alarm    |
                 |     RS      |
     Quittung    |             |      M_Hupe
  ----| |--------| R         Q |-----( )----
                 |             |
     Melder      |             |
  ----| |--------| S1          |
                 +-------------+
```

**Merkregel:** Der Eingang mit der **1** im Namen (`R1` bzw. `S1`) steht unten und hat **Vorrang**.

### Steigende Flanke |P|

```text
  Netzwerk 1: Zaehlimpuls bei jedem Druecken

     S_Taster    M_FlankeTaster       M_Impuls
  ----| |---------|P|-----------------( )----
```

```pascal
"M_Impuls" := "S_Taster" AND NOT "M_FlankeTaster";
"M_FlankeTaster" := "S_Taster";
```

Der Kontakt `|P|` ist **genau einen Zyklus** lang leitend, wenn der Operand links von 0 auf 1 wechselt. Über dem `|P|` steht der **Flankenmerker** – er speichert den Zustand des letzten Zyklus.

### Fallende Flanke |N|

```text
  Netzwerk 1: Reaktion auf das Loslassen

     S_Taster    M_FlankeLos          M_Impuls
  ----| |---------|N|-----------------( )----
```

```pascal
"M_Impuls" := NOT "S_Taster" AND "M_FlankeLos";
"M_FlankeLos" := "S_Taster";
```

### Flanke + Set: das klassische Muster

```text
  Netzwerk 1: Auftrag mit Tastendruck starten

     S_Start   M_FlankeStart         M_AuftragAktiv
  ----| |--------|P|------------------(S)----

  Netzwerk 2: Auftrag beenden

     B_Fertig                        M_AuftragAktiv
  ----| |------------------------------(R)----
```

```pascal
IF "S_Start" AND NOT "M_FlankeStart" THEN
    "M_AuftragAktiv" := TRUE;
END_IF;
"M_FlankeStart" := "S_Start";

IF "B_Fertig" THEN
    "M_AuftragAktiv" := FALSE;
END_IF;
```

### Toggle: ein Taster, zwei Zustände

```text
  Netzwerk 1: Licht umschalten

     S_Taster   M_FlankeTog  M_Licht      M_Licht
  ----| |--------|P|----------|/|---------(S)----

  Netzwerk 2:

     S_Taster   M_FlankeTog2 M_Licht      M_Licht
  ----| |--------|P|----------| |---------(R)----
```

Beide Netzwerke brauchen einen **eigenen** Flankenmerker – `M_FlankeTog` und `M_FlankeTog2`.

## Typische Use Cases

- Störung speichern, bis sie quittiert wird → `(S)` auf Meldung, `(R)` auf Quittungstaster.
- Zählimpuls erzeugen: Taster → `|P|` → Zähleingang (sonst zählt der Zähler jeden Zyklus).
- Auftrag/Schritt starten und bis zur Fertigmeldung halten.
- Betriebsstundenzähler bei fallender Flanke des Motorschützes abspeichern.
- Reaktion auf das Loslassen eines Tasters → `|N|`.
- Einmalige Initialisierung beim Anlauf.

## Clean-Code-Empfehlungen

- Zu jedem `(S)` gehört ein sichtbares `(R)` – am besten im direkt folgenden Netzwerk.
- Flankenmerker konsequent benennen: `M_Fl_Start`, `M_Fl_Quittung` – ein Merker je Verwendungsstelle.
- Flankenmerker nie für andere Logik abfragen, sie sind reine Hilfsbits.
- SR/RS-Baustein statt zweier getrennter Set/Reset-Netzwerke, wenn der Vorrang wichtig und dokumentiert sein soll.
- Normale Spule bevorzugen, wenn der Zustand ohnehin jeden Zyklus berechnet wird. `(S)`/`(R)` nur, wenn wirklich gespeichert werden muss.
- Bei Set/Reset immer prüfen: Was passiert beim CPU-Neustart? Merker gegebenenfalls remanent setzen oder im Anlauf-OB definiert initialisieren.

## Häufige Fehler

```text
  FALSCH: zweimal derselbe Flankenmerker

  Netzwerk 1:
     TasterA     M_Flanke             M_ImpulsA
  ----| |----------|P|-----------------( )----

  Netzwerk 2:
     TasterB     M_Flanke             M_ImpulsB
  ----| |----------|P|-----------------( )----

  RICHTIG: je Flanke ein eigener Merker

  Netzwerk 1:
     TasterA     M_Fl_A               M_ImpulsA
  ----| |----------|P|-----------------( )----

  Netzwerk 2:
     TasterB     M_Fl_B               M_ImpulsB
  ----| |----------|P|-----------------( )----
```

Geteilte Flankenmerker löschen sich gegenseitig: Netzwerk 2 schreibt den Merker mit `TasterB`, Netzwerk 1 sieht dann eine Flanke, die es nie gab.

```text
  FALSCH: Set ohne Reset

     Stoerung                     M_Stoerung
  ----| |------------------------(S)----

  RICHTIG: Reset ergaenzen

     Stoerung                     M_Stoerung
  ----| |------------------------(S)----

     Quittung   NOT Stoerung      M_Stoerung
  ----| |--------|/|--------------(R)----
```

```text
  FALSCH: Set-Spule statt normaler Spule fuer einen Motor

     Start                        K_Motor
  ----| |------------------------(S)----

  RICHTIG: Selbsthaltung oder Set/Reset-Paar mit definiertem Aus
```

Ein `(S)` auf einen Antrieb ohne Reset lässt sich weder stoppen noch durch den Not-Halt beeinflussen.

```text
  FALSCH: Flanke hinter der Spule erwartet

     Taster                       M_Impuls    M_Fl
  ----| |------------------------( )-----------|P|----

  RICHTIG: Flankenkontakt steht IM Strompfad vor der Spule

     Taster      M_Fl             M_Impuls
  ----| |---------|P|-------------( )----
```

## Interview-relevante Details

- **`(S)`/`(R)` schreiben nur in eine Richtung.** Ist der Strompfad 0, passiert gar nichts – der alte Zustand bleibt.
- Set/Reset ist deshalb **nicht** doppelzuweisungskritisch: Mehrere `(S)`/`(R)`-Netzwerke auf denselben Operanden sind erlaubt und üblich.
- **SR = Reset dominant, RS = Set dominant.** Merkhilfe: der letzte Buchstabe im Namen bzw. der untere Eingang mit der 1 gewinnt.
- Ein Flankenmerker speichert den Zustand des **vorherigen Zyklus**. Deshalb liefert `|P|` genau einen Zyklus lang 1.
- Flanken sind der Grund, warum man Taster nicht direkt an Zähleingänge legt – sonst zählt die CPU zyklusschnell hoch.
- Beim **ersten Zyklus** nach dem Anlauf ist der Flankenmerker 0. Steht das Signal schon an, wird eine Flanke erkannt, die physikalisch keine war – im Anlauf-OB gegebenenfalls vorbelegen.
- `(S)`/`(R)` auf nicht-remanente Merker gehen bei Netz-Aus verloren. Remanenz wird in der Merkertabelle eingestellt.

## Zusammenfassung

- `( )` weist zu, `(S)` setzt nur, `(R)` setzt nur zurück – `(S)`/`(R)` immer als Paar.
- Bei getrennten Set/Reset-Netzwerken gewinnt das **zuletzt bearbeitete** Netzwerk.
- **SR** = Rücksetzen vorrangig (`R1` unten), **RS** = Setzen vorrangig (`S1` unten).
- `|P|` = steigende Flanke, `|N|` = fallende Flanke, jeweils genau einen Zyklus lang 1.
- Jeder Flankenkontakt braucht einen **eigenen, exklusiven** Flankenmerker.
- Typisches Muster: Flanke → Set, separates Netzwerk → Reset.
