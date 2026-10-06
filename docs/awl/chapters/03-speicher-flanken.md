# Kapitel 03 – Speicher & Flanken

## Mental Model

```text
  =   A 4.0     nicht speichernd:  A 4.0 folgt dem VKE 1:1, jeden Zyklus neu
  S   M 10.0    speichernd setzen: nur bei VKE = 1 wird gesetzt, sonst nichts
  R   M 10.0    speichernd rücksetzen: nur bei VKE = 1 wird gelöscht, sonst nichts

  FP  M 12.0    VKE := 1 für genau EINEN Zyklus bei steigender Flanke
  FN  M 12.1    VKE := 1 für genau EINEN Zyklus bei fallender Flanke
                M 12.x ist der FLANKENMERKER – er speichert das VKE des Vorzyklus
```

Der entscheidende Unterschied: `=` beschreibt den Operanden **immer**, `S`/`R` nur bei VKE = 1.
Und: Flankenauswertung braucht einen eigenen Merker, der nichts anderes tut, als den alten
Zustand zu merken.

## Syntax / API

### Zuweisung vs. Speicherfunktion

```text
// nicht speichernd – Tippbetrieb
      U     "Tipp_Taster"
      =     "Motor"                // Motor läuft nur, solange gedrückt wird

// speichernd – Ein/Aus mit zwei Tastern
      U     "Start_Taster"
      S     "Motor"                // setzen
      U     "Stopp_Taster"
      R     "Motor"                // rücksetzen
```

Beide Zeilenpaare sind eigene Verknüpfungsketten: `S` und `R` sind VKE-begrenzend, nach ihnen
beginnt wieder eine Erstabfrage.

### Vorrang: wer gewinnt, wenn beides gleichzeitig ansteht?

Bei AWL entscheidet die **Reihenfolge im Programm**: Die zuletzt ausgeführte Anweisung gewinnt,
weil sie im selben Zyklus das Ergebnis der vorherigen überschreibt.

```text
// Rücksetz-dominant (SR-Verhalten) – für Sicherheitsfunktionen
      U     "Start"
      S     "Motor"
      U     "Stopp"
      R     "Motor"                // R steht hinten → R gewinnt

// Setz-dominant (RS-Verhalten)
      U     "Stopp"
      R     "Motor"
      U     "Start"
      S     "Motor"                // S steht hinten → S gewinnt
```

Faustregel in der Anlagentechnik: **Rücksetzen dominant**. Ein Stopp- oder Störsignal muss sich
immer durchsetzen.

### Selbsthaltung ohne S/R

```text
NETZWERK: Selbsthaltung Bandmotor
      U(
      O     "Start_Taster"         // einschalten
      O     "Motor"                // Selbsthaltung über den eigenen Ausgang
      )
      UN    "Stopp_Taster"         // Öffner-Logik: 1 = nicht betätigt
      UN    "Stoerung"
      =     "Motor"
```

Das ist die klassische Schützschaltung in Software. Vorteil gegenüber `S`/`R`: Alle Bedingungen
stehen in **einem** Netzwerk, der Ausgang wird nur an einer Stelle beschrieben.

### Flankenauswertung mit FP und FN

```text
      U     "Quittier_Taster"
      FP    "FM_Quittier"          // Flankenmerker, nur für diese eine Flanke
      R     "Sammelstoerung"       // läuft genau einen Zyklus lang

      U     "Schutztuer_zu"
      FN    "FM_Tuer"              // fallende Flanke: Tür wurde geöffnet
      S     "Tuer_Alarm"
```

Ablauf von `FP M 12.0`:

```text
Zyklus   VKE davor   M 12.0 (alt)   VKE nach FP   M 12.0 (neu)
  1          0            0              0             0
  2          1            0              1   <- Impuls  1
  3          1            1              0             1
  4          0            1              0             0
  5          1            0              1   <- Impuls  1
```

Der Flankenmerker speichert also schlicht das VKE des letzten Zyklus; `FP` liefert
`VKE UND NICHT Flankenmerker`.

### Warum Flankenmerker exklusiv sein müssen

```text
// FALSCH: derselbe Flankenmerker an zwei Stellen
      U     "Taster_A"
      FP    "FM_1"
      S     "Ziel_A"

      U     "Taster_B"
      FP    "FM_1"                 // überschreibt den Zustand von Taster_A
      S     "Ziel_B"
```

Beide Auswertungen teilen sich den Speicher und stören sich gegenseitig: Flanken gehen verloren
oder es entstehen Phantomimpulse. **Ein Flankenmerker gehört zu genau einer Flankenauswertung.**
Namenskonvention hilft: `FM_<Signalname>`.

### SAVE und das Binärergebnis

```text
      U     "Bereich_OK"
      U     "Parameter_gueltig"
      SAVE                         // VKE ins BIE-Bit sichern
      BEA                          // Baustein beenden, BIE bleibt stehen

// im aufrufenden Baustein:
      CALL  FC 10
      U     BIE                    // Rückmeldung des FC auswerten
      =     "FC10_OK"
```

`SAVE` rettet das VKE über die VKE-begrenzenden Befehle hinweg. Typische Verwendung: Fehler- oder
OK-Rückmeldung eines FC an den Aufrufer.

## Typische Use Cases

- **Start/Stopp mit Selbsthaltung**: Förderband, Pumpe, Lüfter.
- **Störmeldung speichern und quittieren**: `S` bei Störung, `R` auf Flanke des Quittiertasters.
- **Einmalaktion pro Tastendruck**: Zähler erhöhen, Rezept laden, Schritt weiterschalten – immer
  mit `FP`.
- **Schrittkette**: Schritt setzen, Vorgängerschritt zurücksetzen.
- **Tor auf/zu**: zwei Speicherbits, gegenseitig verriegelt.

## Clean-Code-Empfehlungen

- Pro Speicherbit genau **ein** Setz- und **ein** Rücksetz-Netzwerk, direkt untereinander.
- Rücksetzen hinten – also rücksetz-dominant – außer es gibt einen dokumentierten Grund.
- Flankenmerker nach dem Signal benennen (`FM_Quittier`) und in der Zuordnungsliste eintragen.
- Nie den gleichen Ausgang mit `=` **und** `S`/`R` beschreiben.
- Ausgänge möglichst nicht speichern: Speichere einen Merker (`"Band_Freigabe"`) und weise den
  Ausgang am Ende zu. So kannst du Not-Halt und Simulation zentral dazwischenschieben.
- Selbsthaltung bevorzugen, wenn alle Bedingungen in ein Netzwerk passen – sonst `S`/`R`.

## Häufige Fehler

```text
// FALSCH: Ausgang mal zugewiesen, mal gesetzt
      U     "Start"
      =     "Motor"
      U     "Alarm"
      S     "Motor"                // die Zuweisung löscht den Speicher jeden Zyklus

// FALSCH: Setzen dominant, obwohl Stopp gewinnen muss
      U     "Stopp"
      R     "Motor"
      U     "Start"
      S     "Motor"                // Dauer-Start überfährt den Stopp
// RICHTIG
      U     "Start"
      S     "Motor"
      U     "Stopp"
      R     "Motor"

// FALSCH: Zähler ohne Flanke erhöhen
      U     "Taster"
      ZV    Z 1                    // zählt in JEDEM Zyklus, solange gedrückt
// RICHTIG
      U     "Taster"
      FP    "FM_Taster"
      ZV    Z 1

// FALSCH: Flankenmerker mehrfach benutzt
      FP    "FM_Universal"         // an drei Stellen im Projekt -> Impulse gehen verloren
// RICHTIG: je Auswertung ein eigener Merker

// FALSCH: Flankenmerker wird woanders auch beschrieben
      U     "Irgendwas"
      =     "FM_Quittier"          // zerstört die Flankenerkennung

// FALSCH: Selbsthaltung über einen Taster, der als Öffner verdrahtet ist
      U(
      O     "Start"
      O     "Motor"
      )
      U     "Stopp_Oeffner"        // liefert 1, wenn NICHT betätigt – hier ist U richtig
      =     "Motor"                // mit UN wäre der Motor nie gelaufen
```

## Interview-relevante Details

- `=` ist nicht speichernd, `S`/`R` sind speichernd und wirken **nur** bei VKE = 1.
- Bei VKE = 0 tun `S` und `R` gar nichts – sie lassen den Operanden unverändert.
- Vorrang entsteht in AWL allein durch die Programmreihenfolge (anders als bei den Bausteinen
  `SR`/`RS` in FUP/KOP, wo der Vorrang durch den Bausteintyp festgelegt ist).
- `FP`/`FN` brauchen einen Flankenmerker mit **statischem** Speicher – ein Lokaldatenbit (`L`)
  funktioniert nicht, weil es jeden Zyklus neu belegt wird.
- Ein Flankenimpuls ist genau **einen Zyklus** lang; wer ihn in einem später ausgeführten
  Baustein auswertet, bekommt ihn noch, wer früher läuft, erst im Folgezyklus.
- Remanenz: Merker können als remanent projektiert werden und überstehen Netz-Aus. Für
  Sicherheitsfunktionen ist das meistens unerwünscht.
- `SAVE` schreibt ins BIE; `U BIE` nach `CALL` ist das klassische Fehler-Rückmeldemuster.
- In SCL schreibst du dasselbe als `IF Start THEN Motor := TRUE; END_IF;` bzw. nutzt `R_TRIG` –
  deutlich kürzer und ohne manuelle Flankenmerkerverwaltung.

## Zusammenfassung

- `=` folgt dem VKE, `S`/`R` speichern und reagieren nur auf VKE = 1.
- Der zuletzt programmierte Befehl gewinnt – Rücksetz-dominant ist der Standard in der Anlagentechnik.
- Selbsthaltung bündelt Ein-, Halte- und Ausschaltbedingung in einem Netzwerk.
- `FP`/`FN` erzeugen Ein-Zyklus-Impulse und benötigen je einen exklusiven Flankenmerker.
- Flankenmerker nie mehrfach verwenden und nie anderweitig beschreiben.
- `SAVE` rettet das VKE ins BIE und dient der Rückmeldung aus Bausteinen.
