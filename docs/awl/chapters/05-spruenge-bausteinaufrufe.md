# Kapitel 05 – Sprünge & Bausteinaufrufe

## Mental Model

```text
      U     "Bedingung"
      SPBN  M001          ──┐   Sprung, wenn VKE = 0
      L     100             │   dieser Block wird ÜBERSPRUNGEN,
      T     "Sollwert"      │   wenn die Bedingung nicht erfüllt ist
M001: NOP   0             ◄─┘   Sprungmarke (max. 4 Zeichen, mit Doppelpunkt)
```

Sprünge sind in AWL das einzige Mittel für `IF`, `CASE` und `FOR`. Alles, was in SCL eine
Kontrollstruktur ist, wird hier zu einem Sprung auf eine Marke. Entsprechend schnell entsteht
Spaghetticode – darum gilt: so wenige Sprünge wie möglich.

## Syntax / API

### Die wichtigsten Sprungbefehle

| Befehl | Springt, wenn | Typische Verwendung |
|---|---|---|
| `SPA` | immer | unbedingter Sprung, Blockende überspringen |
| `SPB` | VKE = 1 | `IF bedingung THEN …` |
| `SPBN` | VKE = 0 | Bereich überspringen, wenn Bedingung **nicht** erfüllt |
| `SPBB` | VKE = 1, VKE → BIE | Sprung mit Ergebnissicherung |
| `SPBNB` | VKE = 0, VKE → BIE | Standardmuster für bedingte Bausteinaufrufe |
| `SPZ` / `SPN` | Ergebnis = 0 / ≠ 0 | nach Rechen- oder Vergleichsbefehl |
| `SPP` / `SPM` | Ergebnis > 0 / < 0 | Vorzeichenauswertung |
| `SPO` / `SPS` | `OV` / `OS` gesetzt | Überlaufbehandlung |
| `SPL` | Sprungverteiler | `CASE`-Ersatz über Akku 1 |
| `LOOP` | Akku 1 ≠ 0 nach Dekrement | Zählschleife |

`SPB`, `SPBN` & Co. sind VKE-begrenzend: Nach ihnen beginnt eine neue Erstabfrage.

### Sprungmarken

```text
M001: NOP   0               // Marke: max. 4 Zeichen, erstes Zeichen ein Buchstabe
ENDE: BEA                   // sprechende Marken sind erlaubt und besser
```

Marken müssen innerhalb des Bausteins eindeutig sein. Ein Sprung **über Bausteingrenzen hinweg
ist nicht möglich**. `NOP 0` ist der übliche Platzhalter, wenn an der Marke nichts zu tun ist.

### Bedingte Ausführung (IF-Ersatz)

```text
NETZWERK: Sollwert nur im Automatikbetrieb setzen
      U     "Automatik"
      SPBN  SKIP            // wenn NICHT Automatik -> überspringen
      L     "Rezept_Sollwert"
      T     "Sollwert"
SKIP: NOP   0
```

Das ist das Standardmuster, weil `L`/`T` sonst unbedingt laufen würden. Beachte die invertierte
Logik: Du springst über den Block, wenn die Bedingung **nicht** zutrifft.

### IF / ELSE

```text
      U     "Hand_Betrieb"
      SPBN  AUTO
      L     "Hand_Sollwert"
      T     "Sollwert"
      SPA   ENDE            // ELSE-Zweig überspringen
AUTO: L     "Auto_Sollwert"
      T     "Sollwert"
ENDE: NOP   0
```

### Sprungverteiler als CASE-Ersatz

```text
      L     "Betriebsart"   // 0, 1 oder 2
      SPL   DFLT            // Default, wenn Akku 1 > Anzahl der Sprünge
      SPA   BA0             // Akku 1 = 0
      SPA   BA1             // Akku 1 = 1
      SPA   BA2             // Akku 1 = 2
DFLT: SPA   ENDE
BA0:  ...
      SPA   ENDE            // ohne diesen Sprung läuft BA0 in BA1 hinein
BA1:  ...
ENDE: NOP   0
```

### Schleife mit LOOP

```text
// 8 Merkerbytes auf 0 setzen
      L     8               // Schleifenzähler in Akku 1
NEXT: T     "Zaehler"       // Zähler sichern
      ...                   // Schleifenrumpf
      L     "Zaehler"
      LOOP  NEXT            // Akku 1 - 1; springt, solange Ergebnis <> 0
```

`LOOP` dekrementiert das untere Wort von Akku 1 und springt, solange es ungleich 0 ist. Weil die
CPU eine Zykluszeitüberwachung hat, darfst du hier **keine** unbegrenzten Schleifen bauen –
sonst geht die CPU in STOP.

### Bausteinende

```text
      BE                    // physisches Bausteinende (letzte Anweisung, wird nicht programmiert)
      BEA                   // Bausteinende absolut: sofort zurück zum Aufrufer
      U     "Keine_Freigabe"
      BEB                   // Bausteinende bedingt: zurück, wenn VKE = 1
```

`BEB` ganz oben im Baustein ist das AWL-Pendant zum Guard-Clause-Pattern:

```text
NETZWERK 1: Frühzeitiger Ausstieg
      UN    "Anlage_Bereit"
      BEB                   // nicht bereit -> Baustein verlassen
```

### Bausteinaufrufe

```text
// FC ohne Parameter
      UC    FC 10           // unbedingt aufrufen
      U     "Freigabe"
      CC    FC 11           // bedingt aufrufen (VKE = 1)

// FC mit Parametern
      CALL  FC 20 (
            Motor_Ein   := "Start_Band",
            Drehzahl    := MW 100,
            Laeuft      := "Band_Laeuft",
            Fehlercode  := MW 102 )

// FB mit Instanz-DB
      CALL  FB 30, DB 30 (
            Ein         := "Start",
            Zeitwert    := S5T#10S,
            Aus         := "Motor" )
```

Parametertypen: `IN` (nur lesen), `OUT` (nur schreiben), `IN_OUT` (beides), `STAT` (nur FB,
im Instanz-DB gespeichert), `TEMP` (Lokaldaten, jeden Aufruf neu).

Bedingter Aufruf **mit** Parametern geht nicht direkt – dafür nimmt man `SPBNB`:

```text
      U     "Freigabe"
      SPBNB M001            // springt, wenn VKE = 0; VKE wird ins BIE gerettet
      CALL  FC 20 ( Motor_Ein := "Start_Band" )
M001: U     BIE             // VKE wiederherstellen
```

### Rückmeldung über BIE

```text
      CALL  FC 20 ( ... )
      U     BIE
      =     "FC20_OK"       // der FC hat intern SAVE benutzt
```

## Typische Use Cases

- Rechenblöcke nur bei gültigen Eingangswerten ausführen (`SPBN`).
- Betriebsartenumschaltung Hand/Automatik/Einrichten (`SPL` oder verschachtelte `SPBN`).
- Guard Clause am Bausteinanfang: nicht bereit → `BEB`.
- Wiederverwendbare Funktionen: Grenzwertüberwachung, Skalierung, Störmeldeverarbeitung als FC.
- Antriebsbaustein mit Instanzdaten (Zustände, Timer) als FB.
- Datenbereiche initialisieren mit `LOOP`.

## Clean-Code-Empfehlungen

- Sprünge nur **vorwärts** und nur **kurz** – über wenige Netzwerke, nie quer durch den Baustein.
- Sprechende Marken: `ENDE`, `AUTO`, `FEHL` statt `M001`, `M002`.
- Statt vieler Sprünge lieber einen eigenen FC schreiben: Ein Baustein hat einen Namen, eine
  Schnittstelle und ist testbar – eine Sprungmarke nicht.
- Jeder Sprung bekommt einen Kommentar, der die Bedingung in Klartext nennt.
- Rückwärtssprünge nur für `LOOP` mit bekannter, kleiner Obergrenze.
- Bausteinschnittstellen symbolisch und vollständig kommentieren; keine "heimliche" Kommunikation
  über globale Merker.
- Prüfe bei jedem übersprungenen Bereich: Welche Ausgänge, Timer oder Zähler werden dadurch
  **nicht** bearbeitet?

## Häufige Fehler

```text
// FALSCH: Sprunglogik invertiert
      U     "Automatik"
      SPB   SKIP            // springt, WENN Automatik -> der Block läuft nie im Automatik
      L     100
      T     "Sollwert"
SKIP: NOP   0
// RICHTIG
      U     "Automatik"
      SPBN  SKIP

// FALSCH: Sprung über eine Ausgangszuweisung
      U     "Stoerung"
      SPB   ENDE
      U     "Start"
      =     "Motor"         // bei Störung wird der Ausgang NICHT bearbeitet
ENDE: NOP   0               // -> Motor behält seinen letzten Zustand und läuft weiter!
// RICHTIG: Störung in die Verknüpfung aufnehmen
      U     "Start"
      UN    "Stoerung"
      =     "Motor"

// FALSCH: Marke zu lang
      SPA   ENDE_NETZWERK   // max. 4 Zeichen
// RICHTIG
      SPA   ENDE

// FALSCH: bedingter Aufruf mit Parametern über CC
      U     "Freigabe"
      CC    FC 20 ( Motor := "Start" )   // CC kennt keine Parameterliste
// RICHTIG
      U     "Freigabe"
      SPBNB M001
      CALL  FC 20 ( Motor := "Start" )
M001: U     BIE

// FALSCH: LOOP ohne Abbruchsicherung
      L     0
NEXT: ...
      LOOP  NEXT            // 0 - 1 = 65535 Durchläufe -> Zykluszeit-Fehler, CPU STOP

// FALSCH: nach SPBN wird das alte VKE erwartet
      U     "A"
      SPBN  M001
      U     "B"             // das ist eine ERSTABFRAGE, "A" ist weg
```

## Interview-relevante Details

- Sprünge sind **bausteinlokal**. Es gibt keinen Sprung von FC 10 nach FC 11.
- Marken: maximal 4 Zeichen, erstes Zeichen ein Buchstabe, eindeutig im Baustein.
- `SPBN` ist der häufigste Sprung, weil AWL kein `IF` kennt – die Bedingung wird invertiert.
- Übersprungene Bereiche werden **gar nicht** bearbeitet: Ausgänge frieren auf ihrem letzten Wert
  ein. Das ist die Ursache vieler "Geister"-Fehler in Altanlagen.
- `UC`/`CC` rufen ohne Parameter auf, `CALL` mit Parametern. `CALL` ist immer unbedingt.
- `SPBNB` rettet das VKE ins BIE und stellt es nach dem Sprungziel mit `U BIE` wieder her –
  das ist das offizielle Muster für bedingte Aufrufe mit Parametern.
- FC haben kein Gedächtnis, FB haben einen Instanz-DB (`STAT`-Daten). Timer, Zähler und
  Zustandsautomaten gehören deshalb in einen FB.
- `BEA` beendet immer, `BEB` nur bei VKE = 1. `BE` ist die physische letzte Anweisung und wird
  vom Editor erzeugt.
- In SCL wären `IF`/`CASE`/`FOR` direkt vorhanden, inklusive `EXIT` und `CONTINUE`. Sprünge sind
  der stärkste Grund, Logik mit Verzweigungen nicht mehr in AWL zu schreiben.

## Zusammenfassung

- `SPA` springt immer, `SPB`/`SPBN` abhängig vom VKE; `SPBNB` rettet das VKE zusätzlich ins BIE.
- Marken haben maximal 4 Zeichen, sind bausteinlokal und enden mit `:`.
- `IF` wird zu `SPBN` + Marke, `IF/ELSE` zu `SPBN` + `SPA`, `CASE` zu `SPL`.
- `LOOP` ist die Zählschleife über Akku 1 – immer mit sinnvoller Obergrenze.
- `UC`/`CC` ohne Parameter, `CALL` mit Parametern; FB brauchen einen Instanz-DB.
- `BEA`/`BEB` verlassen den Baustein; `BEB` eignet sich als Guard Clause.
- Übersprungene Zuweisungen behalten ihren alten Zustand – Sprünge sind die größte Fehlerquelle
  und der stärkste Grund für SCL.
