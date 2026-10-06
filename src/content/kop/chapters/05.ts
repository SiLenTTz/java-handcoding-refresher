import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '05',
  flashcards: [
    {
      id: 'f1',
      front: 'Ist ein Vergleicher ein Kontakt oder eine Box?',
      back: 'Logisch ein **Kontakt**. Er leitet, wenn die Bedingung stimmt, und lässt sich wie jeder Kontakt in Reihe (`AND`) und parallel (`OR`) schalten.',
    },
    {
      id: 'f2',
      front: 'Welche sechs Vergleichsoperationen gibt es?',
      back: '`==` gleich, `<>` ungleich, `>` größer, `>=` größer gleich, `<` kleiner, `<=` kleiner gleich. Der Datentyp steht in der Box und muss zu beiden Operanden passen.',
    },
    {
      id: 'f3',
      front: 'Welche SCL-Zeile entspricht diesem Netzwerk?\n\n```text\n     +---------+     +---------+        M_ImFenster\n  ---|  Temp   |-----|  Temp   |-------( )----\n     |   >=    |     |   <=    |\n     |   20    |     |   30    |\n     +---------+     +---------+\n```',
      back: '```pascal\n"M_ImFenster" := ("Temp" >= 20) AND ("Temp" <= 30);\n```',
    },
    {
      id: 'f4',
      front: 'Was bedeutet `EN` an einer Box?',
      back: '**Enable**: Die Box wird nur bearbeitet, wenn an `EN` Strom ankommt. Bei `EN` = 0 passiert gar nichts – `OUT` behält seinen alten Wert.',
    },
    {
      id: 'f5',
      front: 'Was bedeutet `ENO`?',
      back: '**Enable Out**: 1, wenn `EN` = 1 **und** die Operation fehlerfrei durchlief (kein Überlauf, keine Division durch null). Damit lassen sich Boxen verketten oder Fehler auswerten.',
    },
    {
      id: 'f6',
      front: 'Was passiert mit `OUT`, wenn `EN` = 0 ist?',
      back: '`OUT` behält den **alten Wert**. Es wird nicht auf 0 gesetzt. Ein veralteter Wert sieht dadurch aus wie ein gültiges Ergebnis – häufigste Fehlerquelle bei Boxen.',
    },
    {
      id: 'f7',
      front: 'Was macht `MOVE` und wie lautet die SCL-Entsprechung?',
      back: '`MOVE` **kopiert** einen Wert von `IN` nach `OUT1`.\n\n```pascal\nIF "Bedingung" THEN\n    "Ziel" := "Quelle";\nEND_IF;\n```',
    },
    {
      id: 'f8',
      front: 'Was liefert `7 / 2` bei Datentyp `Int`?',
      back: '`3` – die Int-Division **schneidet ab**, sie rundet nicht. Für `3.5` muss der Datentyp `Real` sein.',
    },
    {
      id: 'f9',
      front: 'Warum vor jeder Division den Divisor prüfen?',
      back: 'Bei `IN2 = 0` wird `ENO` = 0, `OUT` bleibt unverändert und die CPU meldet einen Fehler – je nach Konfiguration bis hin zu STOP. Deshalb Vergleicher `<> 0` vor die Box setzen.',
    },
    {
      id: 'f10',
      front: 'Warum sollte man `Real`-Werte nicht mit `==` vergleichen?',
      back: 'Wegen Rundungsfehlern in der Gleitkommadarstellung trifft eine exakte Gleichheit praktisch nie zu. Stattdessen ein Toleranzfenster mit `>=` und `<=` verwenden.',
    },
    {
      id: 'f11',
      front: 'Wie verkettet man zwei Mathe-Boxen in einem Netzwerk?',
      back: 'Der `ENO`-Ausgang der ersten Box speist den `EN`-Eingang der zweiten. Das Zwischenergebnis geht von `OUT` der ersten auf `IN1` der zweiten. Ab drei Operationen besser SCL verwenden.',
    },
    {
      id: 'f12',
      front: 'Womit rechnet man Analogrohwerte in physikalische Werte um?',
      back: '`NORM_X` normiert den Rohwert auf `0.0..1.0`, `SCALE_X` skaliert daraus den physikalischen Wert zwischen `MIN` und `MAX`.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wann wird `K_Luefter` wahr?',
      code: `  Netzwerk 1:

     +---------+                 K_Luefter
  ---|  Temp   |----------------( )----
     |   >=    |
     |   80    |
     +---------+`,
      options: [
        'nur bei `Temp` = 80',
        'bei `Temp` größer als 80, aber nicht bei genau 80',
        'bei `Temp` größer oder gleich 80',
        'nie, ein Vergleicher braucht einen Kontakt davor',
      ],
      correct: 2,
      explanation: '`>=` schließt den Grenzwert ein. Der Vergleicher wirkt als Kontakt und kann allein im Strompfad stehen.',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Zeile entspricht diesem Netzwerk?',
      code: `  Netzwerk 1:

     Freigabe   +---------+            K_Heizung
  ----| |-------|  Temp   |-----------( )----
                |   <     |
                |   18    |
                +---------+`,
      options: [
        '`"K_Heizung" := "Freigabe" OR ("Temp" < 18);`',
        '`"K_Heizung" := "Freigabe" AND ("Temp" < 18);`',
        '`IF "Temp" < 18 THEN "K_Heizung" := TRUE; END_IF;`',
        '`"K_Heizung" := "Temp" < 18;`',
      ],
      correct: 1,
      explanation: 'Kontakt und Vergleicher stehen in Reihe – das ist eine UND-Verknüpfung. Die Spule ist eine Zuweisung, kein `IF`.',
    },
    {
      id: 'q3',
      prompt: '`M_Rechnen` ist 0. Welchen Wert hat `Gesamt` nach diesem Zyklus?',
      code: `  Netzwerk 1:

                     +-------------+
                     |  ADD  Int   |
     M_Rechnen       |             |
  ----| |------------| EN      ENO |----
     "MengeA" -------| IN1     OUT |---- "Gesamt"
     "MengeB" -------| IN2         |
                     +-------------+`,
      options: [
        '`0`',
        'den alten Wert aus dem letzten Zyklus, in dem `EN` = 1 war',
        '`MengeA + MengeB`',
        'undefiniert, die CPU geht in STOP',
      ],
      correct: 1,
      explanation: 'Bei `EN` = 0 wird die Box übersprungen. `OUT` wird **nicht** genullt, sondern behält den alten Wert. `ENO` ist 0.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler im Netzwerk?',
      code: `  Netzwerk 1: Durchschnitt berechnen

                     +-------------+
                     |  DIV  Int   |
  -------------------| EN      ENO |----
     "Summe" --------| IN1     OUT |---- "Schnitt"
     "Anzahl" -------| IN2         |
                     +-------------+`,
      options: [
        '`DIV` gibt es nur für `Real`',
        '`EN` ist unbeschaltet und `Anzahl` wird nicht auf 0 geprüft – Division durch null möglich',
        '`IN1` und `IN2` sind vertauscht',
        '`ENO` muss auf eine Spule gelegt werden',
      ],
      correct: 1,
      explanation: 'Mit dauerhaft gesetztem `EN` rechnet die Box in jedem Zyklus – auch wenn `Anzahl` = 0 ist. Vor die Box gehört ein Vergleicher `Anzahl <> 0`.',
    },
    {
      id: 'q5',
      prompt: '`Summe` = 7, `Anzahl` = 2, Datentyp `Int`. Welchen Wert hat `Schnitt`?',
      options: ['`3.5`', '`4`', '`3`', '`0`, Division nicht möglich'],
      correct: 2,
      explanation: 'Die Int-Division schneidet die Nachkommastellen ab. Für `3.5` müsste der Datentyp `Real` sein.',
    },
    {
      id: 'q6',
      prompt: 'Welches Netzwerk entspricht `"M_Alarm" := ("Temp" < 5) OR ("Temp" > 95);`?',
      options: [
        '```text\n     +---------+     +---------+     M_Alarm\n  ---|  Temp   |-----|  Temp   |----( )----\n     |    <    |     |    >    |\n     |    5    |     |   95    |\n     +---------+     +---------+\n```',
        '```text\n     +---------+                     M_Alarm\n  +--|  Temp   |--------------------( )----\n  |  |    <    |\n  |  |    5    |\n  |  +---------+\n  |  +---------+\n  +--|  Temp   |\n     |    >    |\n     |   95    |\n     +---------+\n```',
        '```text\n     +---------+                     M_Alarm\n  ---|  Temp   |--------------------(S)----\n     |   <>    |\n     |    5    |\n     +---------+\n```',
        '```text\n     +---------+                     M_Alarm\n  ---|  Temp   |--------------------( )----\n     |   >=    |\n     |    5    |\n     +---------+\n```',
      ],
      correct: 1,
      explanation: '`OR` wird als Parallelschaltung gezeichnet. Die erste Option wäre `AND` und damit nie erfüllt.',
    },
    {
      id: 'q7',
      prompt: 'Die Füllstandsmeldung soll bei **genau** 100 % und darüber kommen. Wo ist der Fehler?',
      code: `  Netzwerk 1:

     +---------+                 M_Voll
  ---| Fuell   |----------------( )----
     |    >    |
     |  100    |
     +---------+`,
      options: [
        'Der Vergleicher muss eine Spule sein',
        '`>` schließt den Grenzwert 100 aus – richtig wäre `>=`',
        '`Fuell` muss links stehen',
        'Kein Fehler, `>` ist korrekt',
      ],
      correct: 1,
      explanation: 'Der Klassiker bei Grenzwerten: Bei genau 100 meldet `>` nicht. Immer überlegen, ob der Grenzwert dazugehören soll.',
    },
    {
      id: 'q8',
      prompt: 'Welche SCL-Entsprechung hat dieses Netzwerk?',
      code: `  Netzwerk 1:

                     +-------------+
                     |    MOVE     |
     S_Uebernehmen   |             |
  ----| |------------| EN      ENO |----
     "Soll_HMI" -----| IN     OUT1 |---- "Soll_aktiv"
                     +-------------+`,
      options: [
        '`"Soll_aktiv" := "Soll_HMI";`',
        '`IF "S_Uebernehmen" THEN "Soll_aktiv" := "Soll_HMI"; END_IF;`',
        '`IF "S_Uebernehmen" THEN "Soll_HMI" := "Soll_aktiv"; END_IF;`',
        '`"Soll_aktiv" := "S_Uebernehmen";`',
      ],
      correct: 1,
      explanation: '`EN` wird zur `IF`-Bedingung, `IN` ist die Quelle und `OUT1` das Ziel. Ohne die Bedingung würde jeden Zyklus kopiert.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Grenzwertüberwachung zeichnen',
      level: 1,
      description: `Zeichne ein Netzwerk: Die Warnlampe leuchtet, sobald die Temperatur **80 Grad oder mehr** erreicht.

**Zuordnungsliste**

\`\`\`text
  MW10   Temp         Temperatur in Grad (Int)
  A0.0   H_Warnung    Warnlampe
\`\`\`

Schreibe darunter die SCL-Zeile.`,
      starter: `  Netzwerk 1: Temperaturwarnung

  ----
  // TODO: Vergleicher und Spule

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Temperaturwarnung

     +---------+                 H_Warnung
  ---|  Temp   |----------------( )----
     |   >=    |
     |   80    |
     +---------+

  SCL:
  "H_Warnung" := "Temp" >= 80;`,
      hints: [
        'Ein Vergleicher ist logisch ein Kontakt und darf allein im Strompfad stehen.',
        '"80 Grad oder mehr" schließt den Grenzwert ein – welcher Operator ist das?',
        'Zeichne eine Vergleicherbox mit `Temp` oben, dem Operator in der Mitte und `80` unten. Rechts davon die Spule auf `H_Warnung`.',
        '```text\n     +---------+                 H_Warnung\n  ---|  Temp   |----------------( )----\n     |   ??    |\n     |   80    |\n     +---------+\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Boxnetzwerk nach SCL übersetzen',
      level: 2,
      description: `Übersetze beide Netzwerke in SCL. Achte darauf, dass \`EN\` zur Bedingung wird.

**Zuordnungsliste**

\`\`\`text
  M10.0  M_Rechnen       Rechenfreigabe
  M10.1  S_Uebernehmen   Taster Sollwert uebernehmen
  MW20   MengeA          Teilmenge A (Int)
  MW22   MengeB          Teilmenge B (Int)
  MW24   Gesamt          Gesamtmenge (Int)
  MW30   Soll_HMI        Sollwert vom Panel (Int)
  MW32   Soll_aktiv      aktiver Sollwert (Int)
\`\`\``,
      given: `  Netzwerk 1: Gesamtmenge

                     +-------------+
                     |  ADD  Int   |
     M_Rechnen       |             |
  ----| |------------| EN      ENO |----
     "MengeA" -------| IN1     OUT |---- "Gesamt"
     "MengeB" -------| IN2         |
                     +-------------+

  Netzwerk 2: Sollwert uebernehmen

                     +-------------+
                     |    MOVE     |
     S_Uebernehmen   |             |
  ----| |------------| EN      ENO |----
     "Soll_HMI" -----| IN     OUT1 |---- "Soll_aktiv"
                     +-------------+`,
      starter: `  SCL:
  // TODO: Netzwerk 1
  // TODO: Netzwerk 2`,
      solution: `  SCL:
  IF "M_Rechnen" THEN
      "Gesamt" := "MengeA" + "MengeB";
  END_IF;

  IF "S_Uebernehmen" THEN
      "Soll_aktiv" := "Soll_HMI";
  END_IF;`,
      hints: [
        'Der `EN`-Eingang entscheidet, ob die Box überhaupt rechnet.',
        'Eine bedingte Berechnung wird in SCL zu `IF ... THEN ... END_IF;`.',
        'Netzwerk 1: `IF "M_Rechnen" THEN` und darin die Summe nach `Gesamt`. Netzwerk 2 analog mit einer einfachen Zuweisung.',
        '```pascal\nIF "M_Rechnen" THEN\n    "Gesamt" := ??? + ???;\nEND_IF;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Division ohne Schutz korrigieren',
      level: 3,
      description: `Das vorgegebene Netzwerk berechnet den Durchschnitt. Bei leerer Charge ist \`Anzahl\` = 0 und die CPU meldet einen Rechenfehler.

Korrigiere das Netzwerk: Die Division darf nur laufen, wenn \`Anzahl\` ungleich null ist. Werte außerdem \`ENO\` aus und setze bei Fehler den Merker \`M_RechenFehler\`.

**Zuordnungsliste**

\`\`\`text
  MW40   Summe           Gesamtmenge (Int)
  MW42   Anzahl          Stueckzahl (Int)
  MW44   Schnitt         Durchschnitt (Int)
  M10.2  M_RechenFehler  Rechenfehler aufgetreten
\`\`\``,
      given: `  Netzwerk 1: FEHLERHAFT

                     +-------------+
                     |  DIV  Int   |
  -------------------| EN      ENO |----
     "Summe" --------| IN1     OUT |---- "Schnitt"
     "Anzahl" -------| IN2         |
                     +-------------+`,
      starter: `  Netzwerk 1: Durchschnitt (korrigiert)

  ----
  // TODO

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Durchschnitt (korrigiert)

     +---------+     +-------------+
     | Anzahl  |     |  DIV  Int   |      M_RechenFehler
  ---|   <>    |-----| EN      ENO |---------|/|---------( )----
     |    0    |     |             |
     +---------+     | IN1     OUT |---- "Schnitt"
        "Summe" -----|             |
       "Anzahl" -----| IN2         |
                     +-------------+

  SCL:
  IF "Anzahl" <> 0 THEN
      "Schnitt" := "Summe" / "Anzahl";
      "M_RechenFehler" := FALSE;
  ELSE
      "M_RechenFehler" := TRUE;
  END_IF;`,
      hints: [
        'Die Box darf nur rechnen, wenn der Divisor gültig ist – welcher Eingang steuert das?',
        'Ein Vergleicher ist ein Kontakt und kann direkt vor `EN` in den Strompfad.',
        'Setze eine Vergleicherbox `Anzahl <> 0` links vor die DIV-Box. Hinter `ENO` kommt ein Öffner und darauf die Spule `M_RechenFehler`.',
        '```text\n     +---------+     +-------------+\n     | Anzahl  |     |  DIV  Int   |      M_RechenFehler\n  ---|   ??    |-----| EN      ENO |---------|?|---------( )----\n     |    0    |     | IN1     OUT |---- "Schnitt"\n     +---------+     | IN2         |\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Behälterfüllung mit Toleranzfenster',
      level: 4,
      description: `Setze die folgende SCL-Logik in **vier** KOP-Netzwerke um.

\`\`\`pascal
// Restmenge bis zum Sollwert
IF "M_Freigabe" THEN
    "Rest" := "Soll" - "Ist";
END_IF;

// Ventil auf, solange noch mehr als 2 Liter fehlen
"K_Ventil" := "M_Freigabe" AND ("Rest" > 2);

// Im Toleranzfenster: Fuellung gilt als fertig
"M_Fertig" := ("Ist" >= "Soll" - 2) AND ("Ist" <= "Soll" + 2);

// Ueberfuellung melden
"M_Ueberfuellt" := "Ist" > "Soll" + 2;
\`\`\`

**Zuordnungsliste**

\`\`\`text
  M10.0  M_Freigabe     Anlagenfreigabe
  MW50   Soll           Sollmenge in Liter (Int)
  MW52   Ist            Istmenge in Liter (Int)
  MW54   Rest           Restmenge (Int)
  MW56   Soll_min       Soll - 2 (bereits berechnet, Int)
  MW58   Soll_max       Soll + 2 (bereits berechnet, Int)
  A0.0   K_Ventil       Einlassventil
  M10.1  M_Fertig       Fuellung fertig
  M10.2  M_Ueberfuellt  Ueberfuellung
\`\`\`

**Hinweis:** Verwende für die Toleranzgrenzen die bereits berechneten Variablen \`Soll_min\` und \`Soll_max\`, damit du keine zusätzlichen Rechenboxen brauchst.`,
      starter: `  Netzwerk 1: Restmenge berechnen
  ----
  // TODO

  Netzwerk 2: Ventil ansteuern
  ----
  // TODO

  Netzwerk 3: Fuellung fertig
  ----
  // TODO

  Netzwerk 4: Ueberfuellung
  ----
  // TODO`,
      solution: `  Netzwerk 1: Restmenge berechnen

                     +-------------+
                     |  SUB  Int   |
     M_Freigabe      |             |
  ----| |------------| EN      ENO |----
                     |             |
       "Soll" -------| IN1     OUT |---- "Rest"
        "Ist" -------| IN2         |
                     +-------------+

  Netzwerk 2: Ventil ansteuern

     M_Freigabe   +---------+            K_Ventil
  ----| |---------|  Rest   |-----------( )----
                  |    >    |
                  |    2    |
                  +---------+

  Netzwerk 3: Fuellung fertig

     +-----------+     +-----------+        M_Fertig
  ---|    Ist    |-----|    Ist    |-------( )----
     |    >=     |     |    <=     |
     | Soll_min  |     | Soll_max  |
     +-----------+     +-----------+

  Netzwerk 4: Ueberfuellung

     +-----------+                 M_Ueberfuellt
  ---|    Ist    |----------------( )----
     |     >     |
     | Soll_max  |
     +-----------+`,
      hints: [
        'Vier Zuweisungen → vier Netzwerke. Nur die erste braucht eine Box, die anderen kommen mit Vergleichern aus.',
        'Ein Toleranzfenster sind zwei Vergleicher in Reihe (`AND`). Ein Vergleicher kann auch eine Variable als zweiten Operanden haben.',
        'Netzwerk 1: SUB-Box mit `EN` von `M_Freigabe`, `IN1` = Soll, `IN2` = Ist, `OUT` = Rest. Netzwerk 2: Schließer plus Vergleicher `Rest > 2`. Netzwerk 3: zwei Vergleicher in Reihe gegen `Soll_min` und `Soll_max`. Netzwerk 4: ein Vergleicher `Ist > Soll_max`.',
        '```text\n  Netzwerk 3:\n     +-----------+     +-----------+        M_Fertig\n  ---|    Ist    |-----|    Ist    |-------( )----\n     |    ??     |     |    ??     |\n     | Soll_min  |     | Soll_max  |\n     +-----------+     +-----------+\n```',
      ],
    },
  ],
}

export default chapter
