# Kapitel 04 – Timer & Zähler

## Mental Model

```text
  TON  Einschaltverzoegerung   IN ___----------____   Q ___---___
                                       |<-PT->|

  TOF  Ausschaltverzoegerung   IN ___----____         Q ___--------___
                                          |<-PT->|

  TP   Impuls                  IN ___-__________      Q ___-----___
                                      |<--PT-->|
```

Timer und Zähler sind **Boxen** mit Instanzdaten. Sie merken sich ihren Zustand zwischen den Zyklen – deshalb braucht jede Box ihre eigene Instanz. Der Eingang `IN` ist kein Trigger, sondern ein **Zustand**, der anstehen muss.

## Syntax / API

### TON – Einschaltverzögerung

```text
  Netzwerk 1: Luefter laeuft 5 s nach dem Start an

                   +-------------------+
                   |  "IDB_Luefter"    |
                   |       TON         |
     Freigabe      |                   |        K_Luefter
  ----| |----------| IN              Q |-------( )----
                   |                   |
        T#5s ------| PT             ET |------ "Rest"
                   +-------------------+
```

```pascal
"IDB_Luefter"(IN := "Freigabe", PT := T#5s, Q => "K_Luefter", ET => "Rest");
```

`Q` wird 1, nachdem `IN` **ununterbrochen** für `PT` angestanden hat. Fällt `IN` vorher ab, startet die Zeit beim nächsten Mal wieder bei null.

### TOF – Ausschaltverzögerung

```text
  Netzwerk 1: Nachlauf 10 s

                   +-------------------+
                   |  "IDB_Nachlauf"   |
                   |       TOF         |
     Band          |                   |        K_Absaugung
  ----| |----------| IN              Q |-------( )----
                   |                   |
       T#10s ------| PT             ET |
                   +-------------------+
```

```pascal
"IDB_Nachlauf"(IN := "Band", PT := T#10s, Q => "K_Absaugung");
```

`Q` wird **sofort** 1, wenn `IN` kommt, und fällt erst `PT` nach dem Abfallen von `IN` ab.

### TP – Impuls

```text
  Netzwerk 1: Hupe 3 s lang

                   +-------------------+
                   |  "IDB_Hupe"       |
                   |       TP          |
     Start         |                   |        H_Hupe
  ----| |----------| IN              Q |-------( )----
                   |                   |
        T#3s ------| PT             ET |
                   +-------------------+
```

```pascal
"IDB_Hupe"(IN := "Start", PT := T#3s, Q => "H_Hupe");
```

`Q` ist **genau `PT` lang** 1, unabhängig davon, wie lange `IN` ansteht. Während die Zeit läuft, wird ein erneutes `IN` ignoriert (nicht nachtriggerbar).

### Parameter und Zeitliterale

| Parameter | Richtung | Typ | Bedeutung |
|---|---|---|---|
| `IN` | Eingang | `BOOL` | Startbedingung (Zustand, kein Impuls) |
| `PT` | Eingang | `TIME` | Preset Time, die Sollzeit |
| `Q` | Ausgang | `BOOL` | Timer-Ausgang |
| `ET` | Ausgang | `TIME` | Elapsed Time, abgelaufene Zeit |

Zeitliterale: `T#500ms`, `T#5s`, `T#1m30s`, `T#2h`, `T#1d2h3m4s`. Auflösung 1 ms, Maximum rund 24 Tage.

### Timer in der Selbsthaltung

```text
  Netzwerk 1: Band startet, stoppt nach 30 s automatisch

     S_Start            M_ZeitAus      M_Band
  +---| |---+-------------|/|---------( )----
  |         |
  | M_Band  |
  +---| |---+

  Netzwerk 2: Abschaltzeit

                   +-------------------+
                   |  "IDB_Laufzeit"   |
                   |       TON         |
     M_Band        |                   |        M_ZeitAus
  ----| |----------| IN              Q |-------( )----
                   |                   |
       T#30s ------| PT             ET |
                   +-------------------+
```

```pascal
"M_Band" := ("S_Start" OR "M_Band") AND NOT "M_ZeitAus";
"IDB_Laufzeit"(IN := "M_Band", PT := T#30s, Q => "M_ZeitAus");
```

### CTU – Vorwärtszähler

```text
  Netzwerk 1: Stueckzaehler

                   +-------------------+
                   |  "IDB_Stueck"     |
                   |       CTU         |
     B_Sensor M_Fl |                   |        M_Charge_voll
  ----| |-----|P|--| CU              Q |-------( )----
                   |                   |
     S_Reset       |                   |
  ----| |----------| R              CV |------ "Stueckzahl"
                   |                   |
          100 -----| PV                |
                   +-------------------+
```

```pascal
"IDB_Stueck"(CU := "M_Impuls", R := "S_Reset", PV := 100,
             Q => "M_Charge_voll", CV => "Stueckzahl");
```

| Parameter | Bedeutung |
|---|---|
| `CU` | Count Up – zählt bei **steigender Flanke** |
| `CD` | Count Down (bei CTD/CTUD) |
| `R` | Reset, setzt `CV` auf 0 |
| `LD` | Load (bei CTD/CTUD), lädt `PV` nach `CV` |
| `PV` | Preset Value, Sollwert |
| `Q` | 1, sobald `CV >= PV` (bei CTU) |
| `CV` | Current Value, aktueller Zählerstand |

### CTD und CTUD

```text
  Netzwerk 1: Restmenge herunterzaehlen

                   +-------------------+
                   |  "IDB_Rest"       |
                   |       CTD         |
     M_Entnahme    |                   |        M_Leer
  ----| |----------| CD              Q |-------( )----
                   |                   |
     S_Nachfuellen |                   |
  ----| |----------| LD             CV |------ "Rest"
                   |                   |
           50 -----| PV                |
                   +-------------------+
```

Beim **CTD** wird `Q` = 1, wenn `CV <= 0`. `LD` lädt `PV` in `CV`. Der **CTUD** hat `CU`, `CD`, `R`, `LD`, `PV`, `QU`, `QD` und `CV`.

### Obwohl der Zähler flankengesteuert ist: trotzdem `|P|`

Der Zähleingang `CU` reagiert selbst auf die steigende Flanke des Eingangssignals. In der Praxis setzt man trotzdem oft einen expliziten `|P|`-Kontakt davor, wenn das Signal aus einer Verknüpfung stammt, damit im Programm sichtbar ist, wann gezählt wird.

## Typische Use Cases

- Anlaufwarnung: Hupe 3 s per `TP`, danach Motor frei.
- Nachlauf: Absaugung läuft 10 s per `TOF` nach dem Band weiter.
- Entprellen: Signal muss 100 ms per `TON` anstehen, bevor es gilt.
- Zweihandbedienung: beide Taster müssen innerhalb von 500 ms gedrückt werden (`TP` + Reihenschaltung).
- Trockenlaufschutz: Pumpe läuft, Druckschalter muss innerhalb von 5 s kommen, sonst Störung.
- Chargenzählung mit `CTU` und Sammelmeldung bei `CV >= PV`.
- Taktgeber: zwei `TON` gegeneinander verschaltet ergeben ein Blinklicht.

## Clean-Code-Empfehlungen

- Instanznamen sprechend wählen: `"IDB_Nachlauf_Absaugung"` statt `"IEC_Timer_0_DB"`.
- `PT`-Werte nicht hart ins Netzwerk schreiben, sondern als Parameter in einem Datenbaustein – dann sind sie ohne Codeänderung anpassbar.
- Ein Timer pro Aufgabe. Denselben Instanz-DB in zwei Netzwerken zu verwenden ist ein schwer zu findender Fehler.
- `ET` nur verdrahten, wenn du die Restzeit wirklich anzeigst.
- Zähler immer mit einer definierten Reset-Quelle versehen (Chargenwechsel, Schichtende, Quittung).
- Zeitkritische Logik nicht über Zykluszählerei lösen – dafür gibt es Timer.

## Häufige Fehler

```text
  FALSCH: Timer in einem Zweig, der nicht jeden Zyklus bearbeitet wird
          (z. B. in einem Baustein, der nur bedingt aufgerufen wird)

  Der Timer "friert" ein: ET bleibt stehen, Q haengt.

  RICHTIG: Timerbox immer zyklisch bearbeiten, die Bedingung
           ueber IN steuern - nicht ueber den Aufruf.

                   +-------------------+
                   |  "IDB_Zeit"       |
                   |       TON         |
     Bedingung     |                   |        Q_Zeit
  ----| |----------| IN              Q |-------( )----
       T#5s -------| PT             ET |
                   +-------------------+
```

```text
  FALSCH: Taster ohne Flanke auf CU

     S_Taster                    (CTU) CU
  ----| |----------------------------------
  -> zaehlt in JEDEM Zyklus hoch, solange gedrueckt

  RICHTIG: Flanke davor

     S_Taster   M_Fl_Zaehl        (CTU) CU
  ----| |---------|P|----------------------
```

```text
  FALSCH: TON als Impulsgeber missbraucht

     Start                        TON   Q      H_Hupe
  ----| |----------------------------------- ( )----
  -> Q bleibt 1, solange IN ansteht - die Hupe geht nie aus

  RICHTIG: TP verwenden, Q ist genau PT lang 1
```

```text
  FALSCH: zwei Netzwerke auf denselben Instanz-DB

  Netzwerk 1:  "IDB_Zeit" TON mit IN := Band1
  Netzwerk 2:  "IDB_Zeit" TON mit IN := Band2

  RICHTIG: je Aufgabe ein eigener Instanz-DB
```

## Interview-relevante Details

- **IN ist ein Zustand, kein Trigger.** Beim `TON` startet die Zeit neu, sobald `IN` abfällt und wieder kommt – es wird nicht aufaddiert.
- **TP ist nicht nachtriggerbar**: Ein zweiter Impuls während der laufenden Zeit verlängert nichts.
- Die IEC-Timer sind `TON`, `TOF`, `TP`, `TONR` (speichernd, mit `R`-Eingang). Die alten S5-Timer (`S_EVERZ` …) gibt es noch, sollten in neuen Projekten aber nicht verwendet werden.
- Die Genauigkeit eines Timers ist durch die **Zykluszeit** begrenzt: `Q` kann bis zu einen Zyklus später kommen als `PT`.
- Ein Timer in einem **nicht aufgerufenen** Bausteinzweig wird nicht bearbeitet – `ET` bleibt stehen und `Q` behält seinen Wert. Klassiker bei `IF`-Zweigen in SCL und bei bedingten Bausteinaufrufen.
- `CTU` zählt bei `CV = 32767` (INT) nicht weiter – er läuft nicht über.
- Instanzdaten: Ein Multiinstanz-Timer liegt im Instanz-DB des aufrufenden FB; ein Einzelinstanz-Timer bekommt einen eigenen DB.

## Zusammenfassung

- `TON` verzögert das Einschalten, `TOF` das Ausschalten, `TP` erzeugt einen Impuls fester Länge.
- Parameter: `IN` (Zustand), `PT` (Sollzeit), `Q` (Ausgang), `ET` (abgelaufene Zeit).
- Zeitliterale: `T#500ms`, `T#5s`, `T#1m30s`.
- Jeder Timer und Zähler braucht **eigene Instanzdaten**.
- `CTU`: `CU` (flankengesteuert), `R`, `PV`, `Q` (bei `CV >= PV`), `CV`. `CTD` zählt runter, `CTUD` beides.
- Timer müssen **zyklisch bearbeitet** werden – steuern über `IN`, nicht über den Aufruf.
