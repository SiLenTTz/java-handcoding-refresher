# Kapitel 06 – Timer, Zähler & Praxis

## Mental Model

```text
  Zeitwert laden        Timer starten         Timer abfragen
  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │ L  S5T#5S    │ ───► │ U "Start"    │ ───► │ U  T 1       │
  │ (Akku 1)     │      │ SE T 1       │      │ =  "Motor"   │
  └──────────────┘      └──────────────┘      └──────────────┘

  S7-Timer  T 1..T 255   –  global, begrenzt, S5TIME (max. 9990 s)
  IEC-Timer SFB 3/4/5    –  Instanz-DB, TIME (ms-genau), beliebig viele
```

Ein S7-Timer ist eine **Ressource der CPU**, kein Datenobjekt. Er wird mit einem Zeitwert aus
Akku 1 gestartet und danach wie ein Bit abgefragt. IEC-Timer sind dagegen normale Bausteine mit
eigener Instanz – und der Weg, den man heute geht.

## Syntax / API

### Die fünf S7-Timer

| Befehl | Name | Verhalten |
|---|---|---|
| `SI` | Impuls | Ausgang 1 ab Flanke, max. für die Zeitdauer; endet früher, wenn der Eingang abfällt |
| `SV` | Verlängerter Impuls | Ausgang 1 für die volle Zeitdauer, unabhängig vom Eingang |
| `SE` | Einschaltverzögerung | Ausgang wird erst nach Ablauf der Zeit 1, solange der Eingang ansteht |
| `SS` | Speichernde Einschaltverzögerung | wie `SE`, bleibt nach Ablauf aber 1 bis `R` |
| `SA` | Ausschaltverzögerung | Ausgang sofort 1, fällt erst nach Ablauf der Zeit ab |

```text
NETZWERK: Lüfter mit 30 s Nachlauf
      U     "Motor_Laeuft"
      L     S5T#30S
      SA    T 1                 // Ausschaltverzögerung
      U     T 1
      =     "Luefter"
```

Der Zeitwert muss **unmittelbar vor** dem Timerbefehl in Akku 1 stehen.

### Zeitwerte

```text
      L     S5T#5S              // 5 Sekunden
      L     S5T#1M30S           // 1 Minute 30 Sekunden
      L     S5T#500MS           // 500 Millisekunden
      L     MW 100              // Zeitwert aus einem Merkerwort (S5TIME-Format!)
```

S5TIME kennt vier Zeitbasen (10 ms, 100 ms, 1 s, 10 s) und einen dreistelligen BCD-Wert.
Daraus folgen Bereich **10 ms bis 9990 s** und eine Auflösung, die mit der Zeit gröber wird:
`S5T#9S` läuft in 100-ms-Schritten, `S5T#900S` in 10-s-Schritten.

### Timer abfragen, zurücksetzen, auslesen

```text
      U     T 1                 // Binärausgang des Timers
      =     "Zeit_abgelaufen"

      U     "Reset"
      R     T 1                 // Timer anhalten und löschen

      L     T 1                 // Restzeit binär (ohne Zeitbasis) in Akku 1
      LC    T 1                 // Restzeit als BCD inkl. Zeitbasis – für HMI-Anzeigen

      U     "Neustart"
      FR    T 1                 // Freigabe: Timer bei anstehendem Eingang neu starten
```

### Zähler

```text
NETZWERK: Stückzähler mit Vorwahl
      U     "Lichtschranke"
      FP    "FM_LS"             // IMMER mit Flanke zählen
      ZV    Z 1                 // vorwärts zählen

      U     "Ausschleusen"
      FP    "FM_Aus"
      ZR    Z 1                 // rückwärts zählen

      U     "Charge_Start"
      L     C#50                // Vorwahlwert
      S     Z 1                 // Zähler auf 50 setzen

      U     "Reset"
      R     Z 1                 // Zähler auf 0

      U     Z 1                 // 1, solange Zählwert > 0
      =     "Zaehler_nicht_leer"

      L     Z 1                 // Zählwert binär
      LC    Z 1                 // Zählwert als BCD (Anzeige)
```

S7-Zähler laufen von **0 bis 999** und sättigen an den Grenzen: `ZV` bei 999 und `ZR` bei 0
bewirken nichts mehr (kein Überlauf).

### Auf einen bestimmten Zählwert reagieren

```text
      L     Z 1
      L     50
      >=I
      =     "Charge_voll"
```

### IEC-Timer und -Zähler
```text
// Einschaltverzögerung nach IEC: TON = SFB 4
      CALL  SFB 4, DB 4 (
            IN    := "Start_Band",
            PT    := T#10S,
            Q     := "Band_Freigabe",
            ET    := MD 20 )

// Vorwärtszähler nach IEC: CTU = SFB 0
      CALL  SFB 0, DB 10 (
            CU    := "Lichtschranke",
            R     := "Reset",
            PV    := 50,
            Q     := "Charge_voll",
            CV    := MW 30 )
```

| IEC | SFB | Entspricht S7 |
|---|---|---|
| `TP` | SFB 3 | `SV` |
| `TON` | SFB 4 | `SE` |
| `TOF` | SFB 5 | `SA` |
| `CTU` | SFB 0 | `ZV` |
| `CTD` | SFB 1 | `ZR` |
| `CTUD` | SFB 2 | `ZV` + `ZR` |

Vorteile der IEC-Variante: `TIME` ist millisekundengenau und linear, die Instanz liegt in einem
DB (also beliebig viele, remanent projektierbar), und `ET`/`CV` liefern den aktuellen Wert direkt
als `TIME` bzw. `INT`. Die S7-Timer `T 1..T 255` sind dagegen eine **globale, knappe Ressource** –
zwei Bausteine, die beide `T 5` benutzen, sabotieren sich gegenseitig.

### Praxis: Schrittkette weiterschalten

```text
NETZWERK: Schritt 1 -> Schritt 2 nach 3 s
      U     "Schritt_1"
      L     S5T#3S
      SE    T 20
      U     T 20
      U     "Schritt_1"
      S     "Schritt_2"        // neuen Schritt setzen
      R     "Schritt_1"        // alten Schritt zurücksetzen
```

Die Ausgänge werden **nicht** hier, sondern in einem eigenen Netzwerk aus den Schrittbits
gebildet – ein Ausgang, eine Zuweisung.

### Praxis: Blinkende Störmeldung mit dem Taktmerkerbyte

```text
// Taktmerkerbyte MB 100 in der Hardwarekonfiguration projektiert
//   M 100.5 = 1 Hz,  M 100.7 = 0,5 Hz,  M 100.3 = 2 Hz
      U     "Sammelstoerung"
      UN    "Quittiert"
      U     M 100.5             // blinkt bei unquittierter Störung
      O
      U     "Sammelstoerung"
      U     "Quittiert"         // Dauerlicht nach Quittierung
      =     "Stoerlampe"
```

## Typische Use Cases

- Nachlaufzeit für Lüfter, Absaugung, Kühlung → `SA`.
- Anlaufverzögerung / Entprellen eines Sensors → `SE`.
- Impuls fester Länge für Ventil oder Hupe → `SV`.
- Überwachungszeit: "Tor muss in 10 s zu sein, sonst Störung" → `SE` + Störbit.
- Stückzahl pro Charge, Palettenzähler, Werkzeugstandzeit → `ZV`/`ZR`.
- Zweihandbedienung an einer Presse → Zeitfenster + UND-Verriegelung.
- Schrittketten für Ampeln, Tore, Takt- und Transferstraßen.

## Clean-Code-Empfehlungen

- Timer- und Zählernummern zentral in der Zuordnungsliste vergeben und symbolisch benennen
  (`"T_Nachlauf_Luefter"`), nie "mal eben T 5 nehmen".
- Zeitwerte als Parameter oder DB-Variable, nicht als Konstante im Netzwerk verstreut.
- Pro Timer genau **eine** Startstelle – ein Timer an zwei Stellen gestartet ist nicht debugbar.
- Zähler immer flankengesteuert ansteuern.
- Für neue Bausteine die IEC-Varianten (`SFB 3/4/5`, `SFB 0/1/2`) nehmen: wiederverwendbar,
  weil die Instanz mit dem FB mitwandert.
- Schrittketten mit je einem Merker pro Schritt und sauberem "Setzen neu / Rücksetzen alt".
- Timer nie in übersprungene Programmteile legen (siehe Kapitel 05).

## Häufige Fehler

```text
// FALSCH: Zeitwert nicht direkt vor dem Timerbefehl geladen
      L     S5T#5S
      U     "Start"
      SE    T 1              // Akku 1 kann inzwischen überschrieben sein
// RICHTIG
      U     "Start"
      L     S5T#5S
      SE    T 1

// FALSCH: Zählen ohne Flanke
      U     "Lichtschranke"
      ZV    Z 1              // zählt in jedem Zyklus hoch, solange das Signal ansteht
// RICHTIG
      U     "Lichtschranke"
      FP    "FM_LS"
      ZV    Z 1

// FALSCH: derselbe Timer in zwei Bausteinen
      SE    T 5              // in FC 10
      SA    T 5              // in FC 20 -> beide überschreiben sich
// RICHTIG: Nummern zentral vergeben oder IEC-Timer mit Instanz-DB nehmen

// FALSCH: Einschaltverzögerung statt Ausschaltverzögerung
      U     "Motor_Laeuft"
      L     S5T#30S
      SE    T 1              // Lüfter startet 30 s SPÄTER statt 30 s nachzulaufen
// RICHTIG
      SA    T 1

// FALSCH: Zählerwert direkt mit LC vergleichen
      LC    Z 1              // BCD-Format
      L     50               // Binärwert -> Vergleich liefert Unsinn
// RICHTIG
      L     Z 1
      L     50
      >=I
```

## Interview-relevante Details

- Die fünf S7-Timer in der Reihenfolge `SI`, `SV`, `SE`, `SS`, `SA` – wer die Unterschiede sauber
  erklären kann, hat die Frage meistens schon bestanden.
- `SE` (Einschaltverzögerung) braucht ein **statisches** Startsignal; `SS` und `SV` reagieren auf
  die **Flanke** und laufen danach selbstständig weiter.
- S5TIME: BCD-Wert 0…999 plus Zeitbasis → Bereich 10 ms…9990 s, Auflösung sinkt mit der Dauer.
- S7-Timer/Zähler sind **globale CPU-Ressourcen** mit fester Anzahl. Deshalb sind FCs mit festen
  Timernummern nicht mehrfach instanziierbar – ein Hauptgrund für FB + IEC-Timer.
- `L T 1` liefert den Binärwert ohne Zeitbasis, `LC T 1` den BCD-Wert mit Zeitbasis.
- S7-Zähler zählen 0…999 und sättigen; IEC-`CTU` zählt in `INT` und hat ein `Q`-Bit mit `PV`.
- `FR` (Freigabe) startet einen Timer bei weiterhin anstehendem Eingangssignal neu – wird selten
  gebraucht, taucht aber in Altprogrammen auf.
- Dieselbe Logik in SCL:
  ```text
  // AWL                            // SCL
  U     "Start"                     "TON_Band"(IN := Start,
  L     S5T#10S                                PT := T#10S);
  SE    T 1                         Band_Frei := "TON_Band".Q;
  U     T 1
  =     "Band_Frei"
  ```
- AWL wird von **S7-1200 gar nicht** unterstützt und bei S7-1500 nur noch geduldet. Neue Logik
  schreibt man in SCL, AWL liest man – und genau das ist die Kompetenz, die in Instandhaltung
  und Retrofit-Projekten weiterhin Geld wert ist.

## Zusammenfassung

- S7-Timer: Zeitwert in Akku 1 laden, dann `SI`/`SV`/`SE`/`SS`/`SA`, danach mit `U T n` abfragen.
- S5TIME reicht von 10 ms bis 9990 s; `R` löscht, `L`/`LC` lesen die Restzeit.
- Zähler: `ZV`/`ZR` immer flankengesteuert, `S` mit `C#`-Vorwahl, `R` zum Löschen, Bereich 0…999.
- IEC-Timer (`SFB 3/4/5`) und IEC-Zähler (`SFB 0/1/2`) arbeiten mit Instanz-DB und `TIME`/`INT` –
  die bessere Wahl für wiederverwendbare Bausteine.
- Praxisklassiker: Nachlaufzeit, Zweihandbedienung, Schrittkette, blinkende Störmeldung über das
  Taktmerkerbyte.
- Timernummern zentral verwalten, nie doppelt starten, nie in übersprungene Bereiche legen.
- AWL bleibt als Lesekompetenz für Altanlagen wichtig; neu geschrieben wird in SCL.
