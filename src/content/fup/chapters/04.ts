import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '04',
  flashcards: [
    {
      id: 'f1',
      front: 'Welche vier Anschlüsse hat ein IEC-Timer?',
      back: '`IN` (Bool, Startbedingung) und `PT` (Time, Vorgabezeit) links; `Q` (Bool, Ausgang) und `ET` (Time, abgelaufene Zeit) rechts.',
    },
    {
      id: 'f2',
      front: 'Was macht `TON`?',
      back: '**Einschaltverzögerung**: `Q` wird `TRUE`, nachdem `IN` für die Dauer `PT` ununterbrochen `TRUE` war. Fällt `IN` vorher ab, startet `ET` wieder bei 0.',
    },
    {
      id: 'f3',
      front: 'Was macht `TOF`?',
      back: '**Ausschaltverzögerung**: `Q` wird sofort mit `IN` wahr und bleibt nach dem Abfall von `IN` noch `PT` lang wahr. Klassisch für Nachlauf von Lüftern und Absaugung.',
    },
    {
      id: 'f4',
      front: 'Was macht `TP` und was ist seine Besonderheit?',
      back: '**Impuls**: `Q` ist nach einer positiven Flanke an `IN` genau `PT` lang `TRUE`. `TP` ist **nicht nachtriggerbar** – ein zweiter Impuls während der Laufzeit hat keine Wirkung.',
    },
    {
      id: 'f5',
      front: 'Wie schreibt man Zeitliterale?',
      back: '`T#500ms`, `T#2s`, `T#1m30s`, `T#1h_15m`. Datentyp ist `Time` (32 Bit, 1 ms Auflösung). Ein `Int` an `PT` ist ein Typfehler.',
    },
    {
      id: 'f6',
      front: 'Warum muss ein Timer in **jedem** Zyklus aufgerufen werden?',
      back: 'Der Baustein aktualisiert `ET` und `Q` nur beim Aufruf. Wird das Netzwerk übersprungen (Sprung, bedingter FC-Aufruf), friert der Timer ein. Bedingungen gehören an `IN`, nicht vor den Aufruf.',
    },
    {
      id: 'f7',
      front: 'Was passiert, wenn zwei Timer denselben Instanz-DB nutzen?',
      back: 'Sie teilen sich `ET` und `Q` und überschreiben sich gegenseitig – das Verhalten ist unvorhersehbar. Jede Timer-Verwendung braucht eine **eigene Instanz**.',
    },
    {
      id: 'f8',
      front: 'Welche Anschlüsse hat ein `CTU` und was bedeuten sie?',
      back: '`CU` zählt bei positiver Flanke +1, `R` setzt `CV` auf 0, `PV` ist der Sollwert. `Q` ist `TRUE`, sobald `CV >= PV`; `CV` ist der aktuelle Zählstand.',
    },
    {
      id: 'f9',
      front: 'Zählt ein `CTU` über `PV` hinaus weiter?',
      back: 'Ja. `PV` ist nur die **Schaltschwelle** für `Q`, keine Obergrenze. `CV` läuft bis zum Maximum des Datentyps (`Int`: 32767) weiter.',
    },
    {
      id: 'f10',
      front: 'Was leisten `CTD` und `CTUD`?',
      back: '`CTD` zählt mit `CD` abwärts, `LD` lädt `PV` nach `CV`, `Q` kommt bei `CV <= 0`.\n`CTUD` kann beides und hat `QU` (`CV >= PV`) und `QD` (`CV <= 0`).',
    },
    {
      id: 'f11',
      front: 'Darf man `ET >= PT` statt `Q` auswerten?',
      back: 'Nein. Bei `TOF` ist die Logik genau umgekehrt, und `ET` wird beim Zurücksetzen gelöscht. `Q` ist das definierte Ergebnis des Bausteins.',
    },
    {
      id: 'f12',
      front: 'Kann ein Timer feiner auflösen als die Zykluszeit?',
      back: 'Nein. `Q` wird nur beim Bausteinaufruf aktualisiert. `T#1ms` bei 10 ms Zykluszeit bringt nichts – dafür braucht es einen Weckalarm-OB.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: '`"Motor"` wird `TRUE` und bleibt es. Wann wird `"Luefter"` wahr?',
      code: `Netzwerk 1:

                   +-----------+
                   |    TON    |
                   |"DB_Luefter"|
     "Motor" ------|IN        Q|------( )  "Luefter"
       T#5s  ------|PT       ET|
                   +-----------+`,
      options: [
        'sofort mit `"Motor"`',
        '5 Sekunden nachdem `"Motor"` wahr wurde',
        '5 Sekunden nachdem `"Motor"` abgefallen ist',
        'für genau 5 Sekunden, dann wieder falsch',
      ],
      correct: 1,
      explanation: '`TON` = Einschaltverzögerung. `ET` läuft hoch, solange `IN` wahr ist; bei `ET = PT` wird `Q` wahr und bleibt es, bis `IN` abfällt.',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Zeilen entsprechen diesem Netzwerk?',
      code: `Netzwerk 1:

                   +-----------+
                   |    TOF    |
                   | "DB_Nachl"|
     "Motor" ------|IN        Q|------( )  "Absaugung"
      T#10s  ------|PT       ET|
                   +-----------+`,
      options: [
        '`"Absaugung" := "DB_Nachl".Q;`',
        '`"DB_Nachl"(IN := "Motor", PT := T#10s); "Absaugung" := "DB_Nachl".Q;`',
        '`"Absaugung" := TOF("Motor", T#10s);`',
        '`"DB_Nachl".IN := "Motor"; "Absaugung" := "DB_Nachl".ET >= T#10s;`',
      ],
      correct: 1,
      explanation: 'In SCL muss die Instanz erst **aufgerufen** werden, danach wird `.Q` ausgewertet. Ohne Aufruf aktualisiert der Baustein nichts.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Fehler?',
      code: `Netzwerk 1:
                   +-----------+
     "Motor" ------|IN   TON  Q|------( ) "Luefter"
          5  ------|PT       ET|
                   +-----------+`,
      options: [
        '`TON` hat keinen Ausgang `ET`',
        '`PT` erwartet den Datentyp `Time` – korrekt wäre `T#5s`',
        '`IN` darf nicht direkt mit einem Bit beschaltet werden',
        'Kein Fehler – `5` wird automatisch als 5 Sekunden interpretiert',
      ],
      correct: 1,
      explanation: '`PT` ist vom Typ `Time`. Ein `Int`-Literal führt zu einem Typfehler beim Übersetzen. Richtig ist `T#5s`.',
    },
    {
      id: 'q4',
      prompt: 'Was ist das Problem an diesem Aufbau?',
      code: `Netzwerk 1:  TON  "DB_Zeit"   IN = "Motor"   PT = T#5s
Netzwerk 2:  TON  "DB_Zeit"   IN = "Pumpe"   PT = T#3s`,
      options: [
        'Ein Baustein darf nur einmal pro Programm verwendet werden',
        'Beide Timer nutzen denselben Instanz-DB und teilen sich `ET` und `Q`',
        '`PT` muss in beiden Netzwerken gleich sein',
        'Kein Problem – der DB wird automatisch dupliziert',
      ],
      correct: 1,
      explanation: 'Der Instanz-DB ist das Gedächtnis des Bausteins. Zwei Timer an einer Instanz überschreiben sich gegenseitig. Jeder braucht einen eigenen DB.',
    },
    {
      id: 'q5',
      prompt: 'Welche Box gehört an die markierte Stelle, damit `"Hupe"` beim Anlauf genau 2 Sekunden lang ertönt – auch wenn `"Start"` länger ansteht?',
      code: `Netzwerk 1:

                   +-----------+
                   |    ???    |
     "Start" ------|IN        Q|------( )  "Hupe"
       T#2s  ------|PT       ET|
                   +-----------+`,
      options: ['`TON`', '`TOF`', '`TP`', '`CTU`'],
      correct: 2,
      explanation: '`TP` erzeugt einen Impuls fester Länge, unabhängig davon, wie lange `IN` anliegt. `TON` würde erst nach 2 s einschalten und dann dauerhaft anstehen.',
    },
    {
      id: 'q6',
      prompt: '`"P_LS".Q` liefert 150 Flanken, `PV` ist 100. Welchen Wert hat `CV` und was macht `Q`?',
      code: `Netzwerk 1:

                    +-----------+
       "P_LS".Q ----|CU   CTU  Q|------( ) "Charge_voll"
        "Reset" ----|R        CV|------    "Ist_Anzahl"
            100 ----|PV         |
                    +-----------+`,
      options: [
        '`CV` = 100, `Q` = `TRUE`',
        '`CV` = 150, `Q` = `TRUE`',
        '`CV` = 150, `Q` = `FALSE`',
        '`CV` = 0, `Q` = `TRUE`',
      ],
      correct: 1,
      explanation: '`PV` ist nur die Schaltschwelle. `CV` zählt über 100 hinaus bis 150 weiter, `Q` bleibt `TRUE`, solange `CV >= PV`.',
    },
    {
      id: 'q7',
      prompt: 'Was passiert, wenn das Netzwerk mit dem Timer durch einen Sprung übersprungen wird?',
      options: [
        'Der Timer läuft im Hintergrund weiter',
        '`ET` bleibt stehen und `Q` wird nicht mehr aktualisiert – der Timer friert ein',
        'Der Timer wird automatisch zurückgesetzt',
        'Die CPU geht in STOP',
      ],
      correct: 1,
      explanation: 'IEC-Timer aktualisieren sich nur beim Aufruf. Deshalb gehört die Bedingung an den `IN`-Eingang, nicht vor den Bausteinaufruf.',
    },
    {
      id: 'q8',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `Netzwerk 1: Trockenlaufschutz

                                  +-----------+
              +-------+           |    TON    |
   "Pumpe" ---|   &   |-----------|IN  "DB_T" |
"Durchfluss"-o|       |    T#3s --|PT        Q|------(S) "Stoer_Trocken"
              +-------+           +-----------+`,
      options: [
        '`"DB_T"(IN := "Pumpe" OR "Durchfluss", PT := T#3s);`',
        '`"DB_T"(IN := "Pumpe" AND NOT "Durchfluss", PT := T#3s);`',
        '`"DB_T"(IN := NOT ("Pumpe" AND "Durchfluss"), PT := T#3s);`',
        '`"DB_T"(IN := "Pumpe", PT := T#3s); "Stoer_Trocken" := NOT "Durchfluss";`',
      ],
      correct: 1,
      explanation: 'Der `IN`-Eingang nimmt jedes Bit-Ergebnis an – hier den Ausgang der UND-Box mit negiertem `"Durchfluss"`. Danach: `IF "DB_T".Q THEN "Stoer_Trocken" := TRUE; END_IF;`',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Nachlauf der Absaugung',
      level: 1,
      description: `Zeichne das Netzwerk für einen Nachlauf.

**Aufgabe:** Die Absaugung soll zusammen mit dem Motor anlaufen und nach dem Ausschalten des Motors noch **10 Sekunden** weiterlaufen.

**Zuordnungsliste**

- \`"Motor"\` – Bool
- \`"Absaugung"\` – Bool
- \`"DB_Nachlauf"\` – Timer-Instanz

Zeichne das Netzwerk und schreibe die SCL-Entsprechung darunter.`,
      starter: `Netzwerk 1: Nachlauf Absaugung

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Nachlauf Absaugung

                     +--------------+
                     |     TOF      |
                     |"DB_Nachlauf" |
       "Motor" ------|IN           Q|------( )  "Absaugung"
        T#10s  ------|PT          ET|
                     +--------------+


SCL:
"DB_Nachlauf"(IN := "Motor", PT := T#10s);
"Absaugung" := "DB_Nachlauf".Q;`,
      hints: [
        'Sofort an, verzögert aus – das ist eine Ausschaltverzögerung.',
        'Du brauchst eine `TOF`-Box mit eigener Instanz. Anschlüsse: `IN`, `PT`, `Q`, `ET`.',
        '`"Motor"` an `IN`, `T#10s` an `PT`, den Ausgang `Q` auf die Zuweisung `( )` mit `"Absaugung"`.',
        'Gerüst:\n\n```text\n                     +--------------+\n                     |     ???      |\n       "Motor" ------|IN           Q|---( ) "Absaugung"\n        ?????  ------|PT          ET|\n                     +--------------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Timer-Netzwerk übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk nach SCL.

Denk daran: Der Bausteinaufruf und die Auswertung des Ausgangs sind in SCL **zwei** Zeilen. Der \`IN\`-Eingang hängt hier an einer UND-Box.`,
      given: `Netzwerk 1: Ueberwachung Endlage

                                   +------------+
              +-------+            |    TON     |
"Fahrbefehl" -|   &   |------------|IN "DB_Ueb" |
              |       |            |           Q|------(S)  "Stoer_Endlage"
"Endlage_err"-o       |   T#8s ----|PT        ET|
              +-------+            +------------+`,
      starter: `SCL:
// TODO`,
      solution: `SCL:
"DB_Ueb"(IN := "Fahrbefehl" AND NOT "Endlage_err", PT := T#8s);
IF "DB_Ueb".Q THEN
    "Stoer_Endlage" := TRUE;
END_IF;`,
      hints: [
        'Erst die Instanz aufrufen, dann den Ausgang auswerten.',
        'Der Ausdruck an `IN` ist die UND-Box mit negiertem zweiten Eingang. `(S)` wird zu `IF ... THEN x := TRUE; END_IF;`.',
        'Zeile 1: Aufruf mit `IN := <UND-Ausdruck>` und `PT := T#8s`. Zeile 2 bis 4: `IF "DB_Ueb".Q THEN` Setzen.',
        '```pascal\n"DB_Ueb"(IN := ... AND NOT ..., PT := T#8s);\nIF "DB_Ueb".Q THEN\n    ...\nEND_IF;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Behälterfüllung mit Zeitüberwachung',
      level: 3,
      description: `Zeichne die Netzwerke zu dieser SCL-Logik:

\`\`\`pascal
"DB_Fuellzeit"(IN := "Ventil_auf" AND NOT "Behaelter_voll", PT := T#45s);
IF "DB_Fuellzeit".Q THEN
    "Stoer_Fuellzeit" := TRUE;
END_IF;

"DB_Chargen"(CU := "P_Voll".Q, R := "Schicht_Reset", PV := 50);
"Schicht_fertig" := "DB_Chargen".Q;
\`\`\`

**Zuordnungsliste**

- \`"Ventil_auf"\`, \`"Behaelter_voll"\` – Bool
- \`"P_Voll"\` – P_TRIG-Instanz auf \`"Behaelter_voll"\`
- \`"DB_Fuellzeit"\` – TON-Instanz, \`"DB_Chargen"\` – CTU-Instanz
- \`"Stoer_Fuellzeit"\`, \`"Schicht_Reset"\`, \`"Schicht_fertig"\` – Bool

Zeichne zwei Netzwerke.`,
      starter: `Netzwerk 1: Fuellzeit ueberwachen

// TODO


Netzwerk 2: Chargen je Schicht zaehlen

// TODO`,
      solution: `Netzwerk 1: Fuellzeit ueberwachen

                                     +---------------+
                 +-------+           |      TON      |
  "Ventil_auf" --|       |-----------|IN"DB_Fuellzeit"|
                 |   &   |           |              Q|------(S) "Stoer_Fuellzeit"
"Behaelter_voll"-o       |  T#45s ---|PT           ET|
                 +-------+           +---------------+


Netzwerk 2: Chargen je Schicht zaehlen

                     +----------+        +--------------+
                     |  P_TRIG  |        |     CTU      |
                     | "P_Voll" |        | "DB_Chargen" |
"Behaelter_voll" ----|CLK      Q|--------|CU           Q|---( ) "Schicht_fertig"
                     +----------+        |            CV|---
                                         |              |
             "Schicht_Reset" ------------|R             |
                          50 ------------|PV            |
                                         +--------------+`,
      hints: [
        'Zwei getrennte Aufgaben – also zwei Netzwerke. Beide Bausteine brauchen ihre eigene Instanz.',
        'Netzwerk 1: `&`-Box mit negiertem zweitem Eingang auf `IN` einer `TON`-Box, Ausgang `Q` auf `(S)`. Netzwerk 2: `P_TRIG` vor dem `CU` eines `CTU`.',
        'In Netzwerk 1 bildet die UND-Box die Startbedingung für den Timer. In Netzwerk 2 erzeugt `P_TRIG` aus dem Zustand `"Behaelter_voll"` einen einzelnen Zählimpuls; `R` und `PV` beschalten.',
        'Gerüst Netzwerk 2:\n\n```text\n                     +----------+        +--------------+\n"Behaelter_voll" ----|CLK      Q|--------|CU   CTU     Q|---( ) "???"\n                     +----------+        |            CV|---\n                                         |R             |\n                                         |PV            |\n                                         +--------------+\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Ampelsteuerung mit Timer-Kette',
      level: 4,
      description: `Baue eine einfache Fußgängerampel.

**Aufgabe:** Nach Betätigung von \`"Anforderung"\` läuft folgender Ablauf:

1. \`"Auto_gelb"\` für 3 Sekunden
2. danach \`"Auto_rot"\` und \`"Fuss_gruen"\` für 15 Sekunden
3. danach zurück in den Grundzustand (\`"Auto_gruen"\`)

Zeichne die Netzwerke mit zwei \`TON\`-Bausteinen in Kette und gib die SCL-Entsprechung an.

**Zuordnungsliste**

- \`"Anforderung"\` – Bool (bereits gespeichert)
- \`"DB_T_Gelb"\`, \`"DB_T_Gruen"\` – TON-Instanzen
- \`"Auto_gelb"\`, \`"Auto_rot"\`, \`"Auto_gruen"\`, \`"Fuss_gruen"\` – Bool`,
      starter: `Netzwerk 1: Gelbphase

// TODO


Netzwerk 2: Fussgaengergruen

// TODO


Netzwerk 3: Ausgaenge

// TODO


SCL:
// TODO`,
      solution: `Netzwerk 1: Gelbphase – 3 s nach Anforderung

                     +--------------+
                     |     TON      |
                     | "DB_T_Gelb"  |
 "Anforderung" ------|IN           Q|------( )  "Gelb_abgelaufen"
         T#3s  ------|PT          ET|
                     +--------------+


Netzwerk 2: Fussgaengergruen – 15 s nach Gelbphase

                         +--------------+
                         |     TON      |
                         | "DB_T_Gruen" |
"Gelb_abgelaufen" -------|IN           Q|------( )  "Gruen_abgelaufen"
            T#15s  ------|PT          ET|
                         +--------------+


Netzwerk 3: Ausgaenge ansteuern

                           +-------+
     "Anforderung" --------|       |
                           |   &   |------( )  "Auto_gelb"
  "Gelb_abgelaufen" ------o|       |
                           +-------+

                           +-------+
 "Gelb_abgelaufen" --------|       |
                           |   &   |---+--( )  "Auto_rot"
"Gruen_abgelaufen" -------o|       |   |
                           +-------+   +--( )  "Fuss_gruen"

                           +-------+
     "Anforderung" -------o|       |
                           |  >=1  |------( )  "Auto_gruen"
"Gruen_abgelaufen" --------|       |
                           +-------+


SCL:
"DB_T_Gelb"(IN := "Anforderung", PT := T#3s);
"Gelb_abgelaufen" := "DB_T_Gelb".Q;

"DB_T_Gruen"(IN := "Gelb_abgelaufen", PT := T#15s);
"Gruen_abgelaufen" := "DB_T_Gruen".Q;

"Auto_gelb"  := "Anforderung" AND NOT "Gelb_abgelaufen";
"Auto_rot"   := "Gelb_abgelaufen" AND NOT "Gruen_abgelaufen";
"Fuss_gruen" := "Gelb_abgelaufen" AND NOT "Gruen_abgelaufen";
"Auto_gruen" := NOT "Anforderung" OR "Gruen_abgelaufen";`,
      hints: [
        'Eine Phasenfolge baust du, indem der Ausgang des ersten Timers den zweiten startet.',
        'Zwei `TON`-Bausteine mit eigenen Instanzen plus Verknüpfungsnetzwerke für die Lampen – jede Phase ist „Timer A abgelaufen UND Timer B noch nicht".',
        'Netzwerk 1: `"Anforderung"` an `IN` des ersten TON (3 s). Netzwerk 2: dessen `Q` an `IN` des zweiten TON (15 s). Netzwerk 3: Jede Lampe über eine `&`-Box aus „Phase begonnen" und negiertem „Phase beendet".',
        'Gerüst der Phasenlogik:\n\n```text\n                           +-------+\n "Gelb_abgelaufen" --------|   &   |---( ) "Auto_rot"\n"Gruen_abgelaufen" -------?|       |\n                           +-------+\n```',
      ],
    },
  ],
}

export default chapter
