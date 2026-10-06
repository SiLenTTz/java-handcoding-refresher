import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    { id: 'f1', front: 'Unterschied `=` und `S`/`R`?', back: '`=` ist **nicht speichernd**: Der Operand folgt dem VKE jeden Zyklus. `S`/`R` sind **speichernd** und wirken nur bei VKE = 1; bei VKE = 0 tun sie gar nichts.' },
    { id: 'f2', front: 'Was passiert bei `S M 10.0`, wenn das VKE 0 ist?', back: '**Nichts.** Der Merker behält seinen Wert. Das ist der entscheidende Unterschied zur Zuweisung, die bei VKE = 0 den Operanden löschen würde.' },
    { id: 'f3', front: 'Wie entsteht in AWL der Vorrang zwischen Setzen und Rücksetzen?', back: 'Allein durch die **Programmreihenfolge** – der zuletzt ausgeführte Befehl gewinnt. `S` vor `R` ergibt rücksetz-dominant (SR), `R` vor `S` ergibt setz-dominant (RS). In der Anlagentechnik ist **rücksetz-dominant** der Standard.' },
    { id: 'f4', front: 'Wie sieht eine Selbsthaltung in AWL aus?', back: '```text\nU(\nO     "Start_Taster"\nO     "Motor"          // Selbsthaltung\n)\nUN    "Stopp_Taster"\nUN    "Stoerung"\n=     "Motor"\n```\nVorteil: alle Bedingungen in einem Netzwerk, der Ausgang wird nur an einer Stelle beschrieben.' },
    { id: 'f5', front: 'Was machen `FP` und `FN`?', back: '`FP` liefert für **genau einen Zyklus** VKE = 1 bei steigender Flanke, `FN` bei fallender Flanke. Der angegebene Operand ist der **Flankenmerker**, der das VKE des Vorzyklus speichert.' },
    { id: 'f6', front: 'Was speichert der Flankenmerker bei `FP "FM_Taster"`?', back: 'Das VKE des **letzten Zyklus**. `FP` berechnet daraus `VKE UND NICHT Flankenmerker` und schreibt anschließend das aktuelle VKE in den Merker.' },
    { id: 'f7', front: 'Warum darf ein Flankenmerker nur einmal verwendet werden?', back: 'Weil er den Zustand genau einer Signalkette speichert. Zwei Auswertungen auf demselben Merker überschreiben sich gegenseitig – Flanken gehen verloren oder es entstehen Phantomimpulse. Konvention: `FM_<Signalname>`.' },
    { id: 'f8', front: 'Warum funktioniert ein Lokaldatenbit (`L`) nicht als Flankenmerker?', back: 'Lokaldaten werden bei jedem Bausteinaufruf neu belegt und enthalten Zufallswerte. Ein Flankenmerker braucht **statischen** Speicher: globaler Merker, DB-Bit oder `STAT`-Variable eines FB.' },
    { id: 'f9', front: 'Wie lange ist ein Flankenimpuls?', back: 'Genau **einen Zyklus**. Bausteine, die später im Zyklus laufen, sehen ihn noch; Bausteine, die vorher laufen, erst im Folgezyklus.' },
    { id: 'f10', front: 'Wozu dient `SAVE`?', back: '`SAVE` kopiert das VKE ins **BIE**-Bit (Binärergebnis). Da `BIE` von VKE-begrenzenden Befehlen nicht verändert wird, eignet es sich als Rückmeldung eines Bausteins:\n\n```text\nCALL  FC 10\nU     BIE\n=     "FC10_OK"\n```' },
    { id: 'f11', front: 'Wie quittiert man eine gespeicherte Störmeldung korrekt?', back: 'Mit Flanke, nicht mit Dauersignal:\n\n```text\nU     "Quittier_Taster"\nFP    "FM_Quittier"\nR     "Sammelstoerung"\n```\nSonst würde ein festgeklemmter Taster jede neue Störung sofort wieder löschen.' },
    { id: 'f12', front: 'Warum sollte man Ausgänge nicht direkt speichern?', back: 'Besser einen Merker speichern (`"Band_Freigabe"`) und den Ausgang am Ende daraus zuweisen. So kannst du Not-Halt, Simulation oder Handbetrieb zentral dazwischenschieben, ohne die Speicherlogik anzufassen.' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Welchen Wert hat `M 10.0` nach diesem Zyklus, wenn `E 0.0 = 0` ist und `M 10.0` vorher `1` war?',
      code: `      U     E 0.0
      S     M 10.0`,
      options: ['`0`', '`1`', 'undefiniert', 'Übersetzungsfehler'],
      correct: 1,
      explanation: '`S` wirkt nur bei VKE = 1. Bei VKE = 0 passiert gar nichts – der Merker behält seinen alten Wert `1`. Eine Zuweisung hätte ihn auf `0` gesetzt.',
    },
    {
      id: 'q2',
      prompt: 'Welcher Zustand stellt sich ein, wenn `Start = 1` **und** `Stopp = 1` gleichzeitig anliegen?',
      code: `      U     "Start"
      S     "Motor"
      U     "Stopp"
      R     "Motor"`,
      options: [
        '`Motor = 1`, weil `S` zuerst kommt',
        '`Motor = 0`, weil `R` zuletzt ausgeführt wird',
        '`Motor` flackert jeden Zyklus',
        'undefiniert – hängt von der CPU ab',
      ],
      correct: 1,
      explanation: 'In AWL gewinnt die zuletzt ausgeführte Anweisung. `R` steht hinten → rücksetz-dominant. Genau das will man in der Anlagentechnik für Stopp- und Störsignale.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Fehler?',
      code: `      U     "Start"
      =     "Motor"
      U     "Alarm"
      S     "Motor"`,
      options: [
        '`S` darf nicht nach `=` stehen',
        'Derselbe Operand wird zugewiesen **und** gesetzt – die Zuweisung löscht den Speicher in jedem Zyklus',
        '`"Alarm"` müsste mit `UN` abgefragt werden',
        'Kein Fehler, das ist rücksetz-dominant',
      ],
      correct: 1,
      explanation: 'Ein Operand darf entweder mit `=` oder mit `S`/`R` beschrieben werden, nie gemischt. Sobald `"Start"` abfällt, setzt die Zuweisung `"Motor"` auf 0 und der Speichereffekt ist weg.',
    },
    {
      id: 'q4',
      prompt: 'Der Taster wird gedrückt gehalten. Wie oft wird `Z 1` hochgezählt?',
      code: `      U     "Taster"
      ZV    Z 1`,
      options: [
        'genau einmal',
        'einmal pro Zyklus, solange gedrückt wird',
        'gar nicht',
        'zweimal (steigende und fallende Flanke)',
      ],
      correct: 1,
      explanation: 'Ohne Flankenauswertung ist das VKE jeden Zyklus 1 und der Zähler läuft hoch. Richtig ist `U "Taster"` / `FP "FM_Taster"` / `ZV Z 1`.',
    },
    {
      id: 'q5',
      prompt: 'Das Signal `E 0.0` wechselt in Zyklus 2 von 0 auf 1 und bleibt 1. In welchen Zyklen ist das VKE nach `FP` gleich 1?',
      code: `      U     E 0.0
      FP    M 12.0`,
      options: ['in allen Zyklen ab Zyklus 2', 'nur in Zyklus 2', 'nur in Zyklus 3', 'in keinem Zyklus'],
      correct: 1,
      explanation: '`FP` liefert `VKE UND NICHT Flankenmerker`. In Zyklus 2 ist der Merker noch 0 → Impuls. Ab Zyklus 3 ist der Merker 1 → VKE 0. Ein Flankenimpuls ist genau einen Zyklus lang.',
    },
    {
      id: 'q6',
      prompt: 'Wo ist der Fehler?',
      code: `      U     "Taster_A"
      FP    "FM_1"
      S     "Ziel_A"

      U     "Taster_B"
      FP    "FM_1"
      S     "Ziel_B"`,
      options: [
        '`FP` darf nicht vor `S` stehen',
        'Derselbe Flankenmerker wird zweimal verwendet – die Auswertungen stören sich gegenseitig',
        '`S` müsste `=` sein',
        '`FP` braucht immer eine Klammer',
      ],
      correct: 1,
      explanation: 'Ein Flankenmerker gehört zu genau einer Flankenauswertung. Geteilt gehen Impulse verloren oder es entstehen Phantomflanken. Konvention: `FM_Taster_A`, `FM_Taster_B`.',
    },
    {
      id: 'q7',
      prompt: 'Welche AWL-Folge realisiert eine Selbsthaltung mit rücksetz-dominantem Stopp (Stopp-Taster ist ein Öffner und liefert im Ruhezustand 1)?',
      options: [
        '`U "Start"` / `O "Motor"` / `U "Stopp_Oeffner"` / `= "Motor"`',
        '`U( O "Start" O "Motor" )` / `U "Stopp_Oeffner"` / `= "Motor"`',
        '`U( O "Start" O "Motor" )` / `UN "Stopp_Oeffner"` / `= "Motor"`',
        '`O "Start"` / `O "Motor"` / `O "Stopp_Oeffner"` / `= "Motor"`',
      ],
      correct: 2,
      explanation: 'Die ODER-Gruppe aus Start und Selbsthaltung muss geklammert werden. Ein Öffner liefert im **nicht betätigten** Zustand 1, also ist `U "Stopp_Oeffner"` richtig. Bei Betätigung wird er 0 und die Kette bricht ab.',
    },
    {
      id: 'q8',
      prompt: 'Wozu dient `SAVE` in diesem Baustein?',
      code: `      U     "Bereich_OK"
      U     "Parameter_gueltig"
      SAVE
      BEA`,
      options: [
        'Es speichert das VKE remanent über Netz-Aus hinweg',
        'Es kopiert das VKE ins BIE-Bit, damit der Aufrufer es nach `CALL` mit `U BIE` auswerten kann',
        'Es sichert alle Merker in einen DB',
        'Es setzt das VKE auf 1',
      ],
      correct: 1,
      explanation: '`SAVE` schreibt das VKE ins Binärergebnis `BIE`. Da `BIE` von VKE-begrenzenden Befehlen nicht verändert wird, überlebt es den Bausteinwechsel – das Standardmuster für OK/Fehler-Rückmeldungen.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Start/Stopp mit S und R',
      level: 1,
      description: `Schreibe die Ansteuerung einer Pumpe mit **Speicherfunktion**:

- Start-Taster setzt die Pumpe.
- Stopp-Taster setzt sie zurück.
- Das Rücksetzen muss **dominant** sein.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Start_Pumpe\` | E 0.0 | BOOL | Taster Start (Schließer) |
| \`Stopp_Pumpe\` | E 0.1 | BOOL | Taster Stopp (Schließer) |
| \`Pumpe\` | A 4.0 | BOOL | Schütz Pumpenmotor |`,
      starter: `NETZWERK 1
TITEL: Pumpe einschalten
      // TODO

NETZWERK 2
TITEL: Pumpe ausschalten (ruecksetz-dominant)
      // TODO`,
      solution: `NETZWERK 1
TITEL: Pumpe einschalten

      U     "Start_Pumpe"         // Start-Taster betaetigt
      S     "Pumpe"               // speichernd setzen

NETZWERK 2
TITEL: Pumpe ausschalten (ruecksetz-dominant)
// R steht HINTER S, deshalb gewinnt das Ruecksetzen,
// wenn beide Taster gleichzeitig betaetigt sind.

      U     "Stopp_Pumpe"         // Stopp-Taster betaetigt
      R     "Pumpe"               // speichernd ruecksetzen`,
      hints: [
        'Setzen und Rücksetzen sind zwei getrennte Verknüpfungsketten – `S` und `R` sind VKE-begrenzend.',
        'Du brauchst `U` + `S` und danach `U` + `R`.',
        'NW1: U Start_Pumpe → S Pumpe. NW2: U Stopp_Pumpe → R Pumpe.',
        'Rücksetz-dominant heißt: `R` muss **nach** `S` im Programm stehen, weil der letzte Befehl gewinnt.',
      ],
    },
    {
      id: 'k2',
      title: 'Selbsthaltung für das Förderband',
      level: 2,
      description: `Schreibe dieselbe Funktion als **Selbsthaltung in einem Netzwerk** – ohne \`S\`/\`R\`.

Das Band läuft, wenn
- der Start-Taster betätigt wurde **oder** das Band bereits läuft (Selbsthaltung),
- **und** der Stopp-Taster nicht betätigt ist,
- **und** keine Störung ansteht,
- **und** der Not-Halt-Kreis geschlossen ist.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Start_Band\` | E 0.0 | BOOL | Taster Start (Schließer) |
| \`Stopp_Band\` | E 0.1 | BOOL | Taster Stopp (Schließer, 1 = betätigt) |
| \`NotHalt_OK\` | E 0.2 | BOOL | Not-Halt-Kreis geschlossen |
| \`Stoerung\` | M 10.0 | BOOL | Sammelstörung |
| \`Motor_Band\` | A 4.0 | BOOL | Schütz Bandmotor |

Erkläre im Kommentar, warum die Selbsthaltung über den eigenen Ausgang läuft.`,
      starter: `NETZWERK 1
TITEL: Foerderband mit Selbsthaltung
// Einschaltbedingung ODER Selbsthaltung, danach alle Ausschaltbedingungen.

      // TODO`,
      solution: `NETZWERK 1
TITEL: Foerderband mit Selbsthaltung
// Einschaltbedingung ODER Selbsthaltung, danach alle Ausschaltbedingungen.
// Die ODER-Gruppe haelt sich ueber den eigenen Ausgang selbst, solange
// keine der nachfolgenden UND-Bedingungen die Kette unterbricht.

      U(
      O     "Start_Band"          // Einschaltbedingung
      O     "Motor_Band"          // Selbsthaltung ueber den eigenen Ausgang
      )
      UN    "Stopp_Band"          // Stopp-Taster nicht betaetigt
      UN    "Stoerung"            // keine Sammelstoerung
      U     "NotHalt_OK"          // Not-Halt-Kreis geschlossen
      =     "Motor_Band"`,
      hints: [
        'Selbsthaltung heißt: Das Ergebnis wird in der eigenen Einschaltbedingung mit ODER zurückgeführt.',
        'Du brauchst `U(` mit zwei `O`, dann `UN`/`UN`/`U` und am Ende `=`.',
        'U( O Start_Band O Motor_Band ) → UN Stopp_Band → UN Stoerung → U NotHalt_OK → = Motor_Band',
        'Achte auf die Polarität: `Stopp_Band` ist hier ein **Schließer** (1 = betätigt), deshalb `UN`. Ein Öffner wäre `U`.',
      ],
    },
    {
      id: 'k3',
      title: 'Störmeldung speichern und quittieren',
      level: 3,
      description: `Baue eine Störmeldeverarbeitung aus **drei** Netzwerken:

1. **Störung erfassen**: Sobald eine der drei Einzelstörungen ansteht, wird \`Stoerung_gespeichert\` gesetzt (speichernd, damit kurze Störimpulse nicht verloren gehen).
2. **Quittieren**: Auf die **steigende Flanke** des Quittier-Tasters wird \`Stoerung_gespeichert\` zurückgesetzt – aber nur, wenn **keine** Einzelstörung mehr ansteht.
3. **Hupe**: Die Hupe ertönt, solange eine gespeicherte Störung ansteht und sie noch nicht quittiert wurde.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Motorschutz\` | E 1.0 | BOOL | Motorschutz ausgelöst |
| \`Ueberdruck\` | E 1.1 | BOOL | Druckwächter ausgelöst |
| \`Temp_hoch\` | E 1.2 | BOOL | Thermokontakt ausgelöst |
| \`Quittier_Taster\` | E 0.7 | BOOL | Taster Quittieren |
| \`FM_Quittier\` | M 12.0 | BOOL | Flankenmerker Quittierung |
| \`Stoerung_aktiv\` | M 10.0 | BOOL | mindestens eine Störung steht an |
| \`Stoerung_gespeichert\` | M 10.1 | BOOL | gespeicherte Sammelstörung |
| \`Hupe\` | A 4.7 | BOOL | Signalhupe |

**Hinweis:** Das Quittieren mit Dauersignal wäre ein Fehler – ein festgeklemmter Taster würde jede neue Störung sofort löschen.`,
      starter: `NETZWERK 1
TITEL: Einzelstoerungen zusammenfassen und speichern
      // TODO

NETZWERK 2
TITEL: Quittieren auf Flanke
      // TODO

NETZWERK 3
TITEL: Hupe
      // TODO`,
      solution: `NETZWERK 1
TITEL: Einzelstoerungen zusammenfassen und speichern

      O     "Motorschutz"         // Einzelstoerung 1
      O     "Ueberdruck"          // Einzelstoerung 2
      O     "Temp_hoch"           // Einzelstoerung 3
      =     "Stoerung_aktiv"      // aktuelle Sammelmeldung (nicht speichernd)

      U     "Stoerung_aktiv"      // Erstabfrage - neue Kette
      S     "Stoerung_gespeichert" // speichern, damit kurze Impulse bleiben

NETZWERK 2
TITEL: Quittieren auf Flanke
// Flankenauswertung verhindert, dass ein festgeklemmter Taster
// jede neue Stoerung sofort wieder loescht.

      U     "Quittier_Taster"     // Taster betaetigt
      FP    "FM_Quittier"         // nur die steigende Flanke, genau 1 Zyklus
      UN    "Stoerung_aktiv"      // nur quittierbar, wenn Ursache behoben
      R     "Stoerung_gespeichert"

NETZWERK 3
TITEL: Hupe

      U     "Stoerung_gespeichert" // gespeicherte Stoerung steht an
      =     "Hupe"`,
      hints: [
        'Erfassen ist eine ODER-Kette, Speichern ein `S`, Quittieren ein `R` – und Quittieren braucht zwingend eine Flanke.',
        'Du brauchst `O`, `=`, `U` + `S`, dann `U` + `FP` + `UN` + `R`.',
        'NW1: ODER-Kette → Stoerung_aktiv, danach U Stoerung_aktiv → S Stoerung_gespeichert. NW2: U Quittier_Taster → FP FM_Quittier → UN Stoerung_aktiv → R Stoerung_gespeichert. NW3: U Stoerung_gespeichert → = Hupe.',
        'Netzwerk 2 beginnt so:\n\n```text\n      U     "Quittier_Taster"\n      FP    "FM_Quittier"\n```\nDer Flankenmerker `FM_Quittier` darf im ganzen Projekt nur hier vorkommen.',
      ],
    },
    {
      id: 'k4',
      title: 'Schrittkette: Tor auf/zu mit Flanken',
      level: 4,
      description: `Ein Rolltor soll mit **einem einzigen Taster** gesteuert werden (Toggle-Verhalten über eine kleine Schrittkette):

- Jeder **Tastendruck** (steigende Flanke!) schaltet den gewünschten Zielzustand um: offen ↔ geschlossen.
- \`Tor_Auf\` wird gesetzt, wenn der Zielzustand "offen" ist und der obere Endschalter noch nicht erreicht wurde.
- \`Tor_Zu\` wird gesetzt, wenn der Zielzustand "geschlossen" ist, der untere Endschalter noch nicht erreicht wurde und die Lichtschranke frei ist.
- Erreicht das Tor einen Endschalter, wird die jeweilige Fahrtrichtung **zurückgesetzt**.
- Die beiden Richtungen müssen **gegenseitig verriegelt** sein.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Taster\` | E 0.0 | BOOL | Taster Tor (Toggle) |
| \`ES_Oben\` | E 0.2 | BOOL | Endschalter oben |
| \`ES_Unten\` | E 0.3 | BOOL | Endschalter unten |
| \`Lichtschranke_frei\` | E 0.4 | BOOL | 1 = frei |
| \`FM_Taster\` | M 12.0 | BOOL | Flankenmerker Taster |
| \`Ziel_Offen\` | M 20.0 | BOOL | Zielzustand "Tor offen" |
| \`Tor_Auf\` | A 4.0 | BOOL | Schütz Fahrt AUF |
| \`Tor_Zu\` | A 4.1 | BOOL | Schütz Fahrt ZU |

**Tipp zum Toggle:** Mit \`S\`/\`R\` gerätst du in eine Falle – nach dem Rücksetzen ist die Setz-Bedingung sofort wieder erfüllt. Denk stattdessen an die Antivalenz aus Kapitel 02.`,
      starter: `NETZWERK 1
TITEL: Zielzustand umschalten (Toggle auf Flanke)
      // TODO

NETZWERK 2
TITEL: Fahrt AUF
      // TODO

NETZWERK 3
TITEL: Fahrt ZU
      // TODO`,
      solution: `NETZWERK 1
TITEL: Zielzustand umschalten (Toggle auf Flanke)
// Antivalenz-Trick: Ziel_Offen := Impuls XOR Ziel_Offen.
// Ohne Impuls (VKE = 0) bleibt der Zustand unveraendert, mit Impuls kippt er.
// Mit S/R wuerde man sich eine Falle bauen: Nach dem R waere die
// Setz-Bedingung im selben Zyklus sofort wieder erfuellt.

      U     "Taster"
      FP    "FM_Taster"           // genau ein Zyklus pro Tastendruck
      X     "Ziel_Offen"          // Impuls XOR aktueller Zustand
      =     "Ziel_Offen"          // kippt nur im Impulszyklus

NETZWERK 2
TITEL: Fahrt AUF
// Setzen bei Zielzustand "offen", Ruecksetzen in der Endlage.

      U     "Ziel_Offen"          // Zielzustand offen
      UN    "ES_Oben"             // obere Endlage noch nicht erreicht
      UN    "Tor_Zu"              // Gegenrichtung nicht aktiv (Verriegelung)
      =     "Tor_Auf"

NETZWERK 3
TITEL: Fahrt ZU

      UN    "Ziel_Offen"          // Zielzustand geschlossen
      UN    "ES_Unten"            // untere Endlage noch nicht erreicht
      U     "Lichtschranke_frei"  // Torbereich frei
      UN    "Tor_Auf"             // Gegenrichtung nicht aktiv (Verriegelung)
      =     "Tor_Zu"`,
      hints: [
        'Ein Toggle braucht genau einen Impuls pro Tastendruck – ohne `FP` schaltet der Zustand in jedem Zyklus um.',
        'Du brauchst `FP` für den Impuls und `X` für das Umschalten; die Fahrtrichtungen sind normale Zuweisungen mit `UN` auf die Gegenrichtung.',
        'NW1: U Taster → FP FM_Taster → X Ziel_Offen → = Ziel_Offen. NW2/NW3: Zielzustand UND Endschalter nicht erreicht UND Gegenrichtung inaktiv → Zuweisung.',
        'Die gegenseitige Verriegelung ist Pflicht: Zwei Schütze gleichzeitig angesteuert bedeutet Kurzschluss im Hauptstromkreis. Deshalb in jedem Netzwerk ein `UN` auf die jeweils andere Richtung.',
      ],
    },
  ],
}

export default chapter
