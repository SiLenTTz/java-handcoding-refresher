import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '05',
  flashcards: [
    { id: 'f1', front: 'Unterschied `SPA`, `SPB`, `SPBN`?', back: '`SPA` springt **immer**, `SPB` bei **VKE = 1**, `SPBN` bei **VKE = 0**. `SPB`/`SPBN` sind VKE-begrenzend: nach ihnen beginnt eine Erstabfrage.' },
    { id: 'f2', front: 'Wie sieht ein `IF` in AWL aus?', back: 'Über die **invertierte** Bedingung:\n\n```text\nU     "Automatik"\nSPBN  SKIP\nL     100\nT     "Sollwert"\nSKIP: NOP   0\n```\nDu springst über den Block, wenn die Bedingung **nicht** zutrifft.' },
    { id: 'f3', front: 'Welche Regeln gelten für Sprungmarken?', back: 'Maximal **4 Zeichen**, erstes Zeichen ein Buchstabe, eindeutig im Baustein, abgeschlossen mit `:`. Sprünge über Bausteingrenzen gibt es **nicht**.' },
    { id: 'f4', front: 'Was macht `LOOP`?', back: 'Dekrementiert das untere Wort von Akku 1 um 1 und springt zur Marke, solange das Ergebnis **ungleich 0** ist. Achtung: Bei Startwert 0 läuft die Schleife 65535-mal → Zykluszeitfehler und CPU-STOP.' },
    { id: 'f5', front: 'Unterschied `UC`, `CC` und `CALL`?', back: '`UC` ruft **unbedingt** ohne Parameter, `CC` **bedingt** (VKE = 1) ohne Parameter, `CALL` ruft **immer** auf und ist die einzige Form mit Parameterliste.' },
    { id: 'f6', front: 'Wie ruft man einen FC mit Parametern **bedingt** auf?', back: 'Über `SPBNB`:\n\n```text\nU     "Freigabe"\nSPBNB M001\nCALL  FC 20 ( Motor := "Start" )\nM001: U     BIE\n```\n`SPBNB` rettet das VKE ins BIE; `U BIE` stellt es danach wieder her.' },
    { id: 'f7', front: 'Unterschied FC und FB?', back: 'Ein **FC** hat kein Gedächtnis (nur `TEMP`), ein **FB** hat einen **Instanz-DB** mit `STAT`-Daten. Timer, Zähler und Zustandsautomaten gehören deshalb in einen FB.' },
    { id: 'f8', front: 'Wie sieht ein FB-Aufruf aus?', back: '```text\nCALL  FB 30, DB 30 (\n      Ein      := "Start",\n      Zeitwert := S5T#10S,\n      Aus      := "Motor" )\n```\nDer zweite Operand ist der Instanz-DB.' },
    { id: 'f9', front: 'Unterschied `BEA` und `BEB`?', back: '`BEA` beendet den Baustein **immer**, `BEB` nur bei **VKE = 1**. `BEB` ganz oben ist das AWL-Pendant zur Guard Clause:\n\n```text\nUN    "Anlage_Bereit"\nBEB\n```' },
    { id: 'f10', front: 'Was ist die größte Gefahr beim Überspringen von Programmteilen?', back: 'Übersprungene Zuweisungen werden **gar nicht** bearbeitet – Ausgänge frieren auf ihrem letzten Zustand ein. Ein bei Störung übersprungener Motorausgang läuft also weiter. Besser: die Bedingung in die Verknüpfung aufnehmen.' },
    { id: 'f11', front: 'Wie ersetzt man ein `CASE` in AWL?', back: 'Mit dem Sprungverteiler `SPL`:\n\n```text\nL     "Betriebsart"\nSPL   DFLT\nSPA   BA0\nSPA   BA1\nSPA   BA2\nDFLT: SPA   ENDE\n```\nAkku 1 bestimmt, welche der folgenden `SPA`-Zeilen ausgeführt wird.' },
    { id: 'f12', front: 'Welche Parameterarten gibt es bei Bausteinen?', back: '`IN` (nur lesen), `OUT` (nur schreiben), `IN_OUT` (beides), `STAT` (nur FB, im Instanz-DB remanent über Aufrufe hinweg) und `TEMP` (Lokaldaten, bei jedem Aufruf neu und uninitialisiert).' },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: 'Wird `"Sollwert"` beschrieben, wenn `"Automatik" = 1` ist?',
      code: `      U     "Automatik"
      SPBN  SKIP
      L     100
      T     "Sollwert"
SKIP: NOP   0`,
      options: [
        'Ja – `SPBN` springt nur bei VKE = 0',
        'Nein – `SPBN` springt bei VKE = 1',
        'Nur wenn `"Automatik"` vorher 0 war',
        'Übersetzungsfehler: `NOP 0` ist keine gültige Anweisung',
      ],
      correct: 0,
      explanation: '`SPBN` = "Sprung bei VKE = 0". Bei `"Automatik" = 1` wird nicht gesprungen, der Block läuft. Das ist das Standardmuster für ein `IF`.',
    },
    {
      id: 'q2',
      prompt: 'Welchen Wert hat das VKE nach der letzten Zeile, wenn `E 0.0 = 1` und `E 0.1 = 0` sind?',
      code: `      U     E 0.0
      SPBN  M001
      U     E 0.1
M001: NOP   0`,
      options: ['`1`', '`0`', 'unverändert `1`', 'undefiniert'],
      correct: 1,
      explanation: '`SPBN` ist VKE-begrenzend. Weil `E 0.0 = 1` ist, wird nicht gesprungen; `U E 0.1` ist dann eine **Erstabfrage** und überschreibt das VKE mit 0.',
    },
    {
      id: 'q3',
      prompt: 'Wo ist der Fehler?',
      code: `      U     "Stoerung"
      SPB   ENDE
      U     "Start"
      =     "Motor"
ENDE: NOP   0`,
      options: [
        '`SPB` darf nicht auf `ENDE` springen',
        'Bei Störung wird die Zuweisung übersprungen – `"Motor"` behält seinen letzten Zustand und läuft weiter',
        'Die Marke `ENDE` ist zu lang',
        'Kein Fehler, bei Störung wird der Motor abgeschaltet',
      ],
      correct: 1,
      explanation: 'Übersprungene Zuweisungen werden gar nicht bearbeitet – der Ausgang friert ein. Richtig: `U "Start"` / `UN "Stoerung"` / `= "Motor"`.',
    },
    {
      id: 'q4',
      prompt: 'Welche Marke ist ungültig?',
      options: ['`M001:`', '`ENDE:`', '`AUTO:`', '`ENDE_NW:`'],
      correct: 3,
      explanation: 'Sprungmarken dürfen in AWL maximal **4 Zeichen** lang sein. `ENDE_NW` hat 7.',
    },
    {
      id: 'q5',
      prompt: 'Welche AWL-Folge entspricht `IF Hand THEN Sollwert := 50; ELSE Sollwert := 100; END_IF;`?',
      options: [
        '`U "Hand"` / `SPB AUTO` / `L 50` / `T "Sollwert"` / `AUTO: L 100` / `T "Sollwert"`',
        '`U "Hand"` / `SPBN AUTO` / `L 50` / `T "Sollwert"` / `SPA ENDE` / `AUTO: L 100` / `T "Sollwert"` / `ENDE: NOP 0`',
        '`U "Hand"` / `L 50` / `T "Sollwert"` / `UN "Hand"` / `L 100` / `T "Sollwert"`',
        '`U "Hand"` / `SPBN ENDE` / `L 50` / `L 100` / `T "Sollwert"` / `ENDE: NOP 0`',
      ],
      correct: 1,
      explanation: 'Der THEN-Zweig läuft, wenn nicht gesprungen wird. Danach muss der ELSE-Zweig mit `SPA ENDE` übersprungen werden – sonst würden beide Zweige ausgeführt. Variante 3 scheitert daran, dass `L`/`T` VKE-unabhängig sind.',
    },
    {
      id: 'q6',
      prompt: 'Wo ist der Fehler?',
      code: `      U     "Freigabe"
      CC    FC 20 ( Motor := "Start" )`,
      options: [
        '`CC` kennt keine Parameterliste – für bedingte Aufrufe mit Parametern braucht man `SPBNB` + `CALL`',
        '`CC` muss `UC` heißen',
        'FC-Nummern über 10 sind nicht erlaubt',
        'Vor `CC` darf kein `U` stehen',
      ],
      correct: 0,
      explanation: '`UC`/`CC` rufen ohne Parameter auf. Mit Parametern geht nur `CALL`, und das ist immer unbedingt. Muster: `U "Freigabe"` / `SPBNB M001` / `CALL FC 20 (…)` / `M001: U BIE`.',
    },
    {
      id: 'q7',
      prompt: 'Wie oft wird der Schleifenrumpf durchlaufen?',
      code: `      L     0
NEXT: L     MW 10
      L     1
      +I
      T     MW 10
      LOOP  NEXT`,
      options: ['gar nicht', 'einmal', '65535-mal – die CPU geht in STOP', '10-mal'],
      correct: 2,
      explanation: '`LOOP` dekrementiert Akku 1: 0 - 1 ergibt 65535 (Unterlauf im Wort). Zusätzlich zerstören `L MW 10` und `L 1` den Schleifenzähler. Ein `LOOP` braucht immer einen geprüften Startwert und ein Sichern/Wiederherstellen des Zählers.',
    },
    {
      id: 'q8',
      prompt: 'Warum gehört ein Zustandsautomat mit Timern in einen FB und nicht in einen FC?',
      options: [
        'Weil FCs keine Parameter haben',
        'Weil ein FB einen Instanz-DB mit `STAT`-Daten hat und seinen Zustand über Aufrufe hinweg behält',
        'Weil FCs nicht in OB 1 aufgerufen werden dürfen',
        'Weil FBs schneller abgearbeitet werden',
      ],
      correct: 1,
      explanation: 'Ein FC kennt nur `TEMP`-Daten, die bei jedem Aufruf neu und uninitialisiert sind. Zustände, Flankenmerker und IEC-Timer brauchen statischen Speicher – also einen FB mit Instanz-DB.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Bedingter Transfer',
      level: 1,
      description: `Der Sollwert soll **nur im Automatikbetrieb** überschrieben werden.

Schreibe ein Netzwerk, das bei \`Automatik = 1\` den Wert \`100\` nach \`Sollwert\` transferiert – und bei \`Automatik = 0\` den bisherigen Wert **unangetastet** lässt.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Automatik\` | E 0.1 | BOOL | Betriebsartenwahl Automatik |
| \`Sollwert\` | MW 20 | INT | aktiver Sollwert |

**Denkanstoß:** \`L\` und \`T\` sind VKE-unabhängig.`,
      starter: `NETZWERK 1
TITEL: Sollwert nur im Automatikbetrieb setzen

      // TODO`,
      solution: `NETZWERK 1
TITEL: Sollwert nur im Automatikbetrieb setzen
// L und T laufen unbedingt - die Bedingung muss daher als Sprung
// um den Block herum realisiert werden.

      U     "Automatik"           // Bedingung pruefen
      SPBN  SKIP                  // wenn NICHT Automatik -> Block ueberspringen
      L     100                   // Sollwert-Konstante
      T     "Sollwert"
SKIP: NOP   0                     // Sprungziel`,
      hints: [
        'Da `L`/`T` immer ausgeführt werden, musst du den Block per Sprung umgehen.',
        'Du brauchst `SPBN`, eine Marke mit maximal 4 Zeichen und `NOP 0` als Platzhalter.',
        'U Automatik → SPBN SKIP → L 100 → T Sollwert → SKIP: NOP 0',
        'Achte auf die invertierte Logik: `SPBN` springt bei VKE = **0**, also genau dann, wenn kein Automatikbetrieb aktiv ist.',
      ],
    },
    {
      id: 'k2',
      title: 'IF / ELSE: Sollwert nach Betriebsart',
      level: 2,
      description: `Setze den Sollwert abhängig von der Betriebsart:

- Handbetrieb → \`Hand_Sollwert\`
- sonst → \`Auto_Sollwert\`

Es darf **immer nur ein** Zweig ausgeführt werden.

**Zuordnungsliste**

| Symbol | Operand | Typ | Kommentar |
|---|---|---|---|
| \`Hand_Betrieb\` | E 0.0 | BOOL | Wahlschalter Hand |
| \`Hand_Sollwert\` | MW 10 | INT | Sollwert Handbetrieb |
| \`Auto_Sollwert\` | MW 12 | INT | Sollwert Automatik |
| \`Sollwert\` | MW 20 | INT | aktiver Sollwert |`,
      starter: `NETZWERK 1
TITEL: Sollwert nach Betriebsart
// THEN-Zweig und ELSE-Zweig duerfen sich nicht ueberlappen.

      // TODO`,
      solution: `NETZWERK 1
TITEL: Sollwert nach Betriebsart
// THEN-Zweig und ELSE-Zweig duerfen sich nicht ueberlappen:
// Nach dem THEN-Zweig muss der ELSE-Zweig per SPA uebersprungen werden.

      U     "Hand_Betrieb"
      SPBN  AUTO                  // kein Handbetrieb -> ELSE-Zweig

      L     "Hand_Sollwert"       // THEN-Zweig
      T     "Sollwert"
      SPA   ENDE                  // ELSE-Zweig ueberspringen

AUTO: L     "Auto_Sollwert"       // ELSE-Zweig
      T     "Sollwert"

ENDE: NOP   0`,
      hints: [
        'Ohne den unbedingten Sprung nach dem THEN-Zweig läuft der ELSE-Zweig immer mit und überschreibt das Ergebnis.',
        'Du brauchst `SPBN` für die Verzweigung, `SPA` zum Überspringen des ELSE-Zweigs und zwei Marken.',
        'U Hand_Betrieb → SPBN AUTO → [THEN] → SPA ENDE → AUTO: [ELSE] → ENDE: NOP 0',
        'Gerüst:\n\n```text\n      U     "Hand_Betrieb"\n      SPBN  AUTO\n      L     "Hand_Sollwert"\n      T     "Sollwert"\n      SPA   ENDE\nAUTO: ...\n```',
      ],
    },
    {
      id: 'k3',
      title: 'FC mit Parametern und Rückmeldung',
      level: 3,
      description: `Du rufst einen Grenzwert-FC auf, der prüft, ob ein Messwert im zulässigen Band liegt.

**Schnittstelle von FC 20 "Grenzwert_Pruefung"**

| Parameter | Art | Typ | Bedeutung |
|---|---|---|---|
| \`Messwert\` | IN | INT | zu prüfender Wert |
| \`Min\` | IN | INT | untere Grenze |
| \`Max\` | IN | INT | obere Grenze |
| \`Im_Band\` | OUT | BOOL | Wert liegt im Band |

Der FC meldet zusätzlich über \`SAVE\`/\`BIE\`, ob die Parametrierung plausibel war (\`Min < Max\`).

**Aufgabe**

1. Rufe \`FC 20\` **nur** auf, wenn \`Messung_freigegeben = 1\` ist – und zwar **mit Parametern**.
2. Werte nach dem Aufruf das \`BIE\` aus und lege es in \`Parametrierung_OK\` ab.
3. Schreibe zusätzlich den Rumpf von \`FC 20\` in AWL: \`Im_Band\` setzen und am Ende \`SAVE\` auf die Plausibilität.

**Zuordnungsliste (aufrufender Baustein)**

| Symbol | Operand | Typ |
|---|---|---|
| \`Messung_freigegeben\` | E 0.0 | BOOL |
| \`Druck\` | MW 30 | INT |
| \`Druck_im_Band\` | M 31.2 | BOOL |
| \`Parametrierung_OK\` | M 31.3 | BOOL |`,
      starter: `// ---------- Aufrufender Baustein (OB 1) ----------
NETZWERK 1
TITEL: Grenzwertpruefung bedingt aufrufen
      // TODO

// ---------- FC 20 "Grenzwert_Pruefung" ----------
NETZWERK 1
TITEL: Wert im Band pruefen
      // TODO

NETZWERK 2
TITEL: Plausibilitaet der Parametrierung melden
      // TODO`,
      solution: `// ---------- Aufrufender Baustein (OB 1) ----------
NETZWERK 1
TITEL: Grenzwertpruefung bedingt aufrufen
// CALL ist immer unbedingt. Fuer einen bedingten Aufruf MIT Parametern
// ist SPBNB das offizielle Muster: Es rettet das VKE ins BIE,
// nach dem Sprungziel wird es mit "U BIE" wiederhergestellt.

      U     "Messung_freigegeben"
      SPBNB M001
      CALL  FC 20 (
            Messwert := "Druck",
            Min      := 200,
            Max      := 800,
            Im_Band  := "Druck_im_Band" )
M001: U     BIE                   // Rueckmeldung des FC auswerten
      =     "Parametrierung_OK"

// ---------- FC 20 "Grenzwert_Pruefung" ----------
NETZWERK 1
TITEL: Wert im Band pruefen

      U(
      L     #Messwert
      L     #Min
      >=I                         // Messwert >= Min
      )
      U(
      L     #Messwert
      L     #Max
      <=I                         // Messwert <= Max
      )
      =     #Im_Band

NETZWERK 2
TITEL: Plausibilitaet der Parametrierung melden
// Min muss kleiner als Max sein, sonst ist der Baustein falsch parametriert.

      L     #Min
      L     #Max
      <I                          // Min < Max
      SAVE                        // VKE ins BIE sichern
      BEA`,
      hints: [
        'Ein `CALL` ist immer unbedingt. Für einen bedingten Aufruf mit Parametern gibt es ein festes Muster mit `SPBNB`.',
        'Du brauchst `SPBNB`, `CALL FC 20 ( … )`, `U BIE` und im FC `U(`/`)`, Vergleichsbefehle sowie `SAVE`.',
        'Aufruf: U Messung_freigegeben → SPBNB M001 → CALL FC 20 (…) → M001: U BIE → = Parametrierung_OK. FC: zwei geklammerte Vergleiche → = #Im_Band; danach L #Min / L #Max / <I / SAVE.',
        'Im FC werden Schnittstellenparameter mit `#` adressiert, z. B. `L #Messwert`. `SPBNB` springt bei VKE = 0 und legt das VKE gleichzeitig ins BIE.',
      ],
    },
    {
      id: 'k4',
      title: 'Betriebsartenverteiler mit SPL',
      level: 4,
      description: `Eine Anlage hat vier Betriebsarten, codiert als INT in \`Betriebsart\`:

| Wert | Betriebsart | Aktion |
|---|---|---|
| 0 | Aus | alle Ausgänge zurücksetzen |
| 1 | Hand | \`Sollwert := Hand_Sollwert\` |
| 2 | Automatik | \`Sollwert := Auto_Sollwert\` |
| 3 | Einrichten | \`Sollwert := 10\` (Schleichfahrt) |
| sonst | ungültig | \`Betriebsart_ungueltig\` setzen, \`Sollwert := 0\` |

Schreibe den Verteiler mit \`SPL\`. Jeder Zweig muss sauber zum gemeinsamen Ende springen.

**Zuordnungsliste**

| Symbol | Operand | Typ |
|---|---|---|
| \`Betriebsart\` | MW 50 | INT |
| \`Hand_Sollwert\` | MW 10 | INT |
| \`Auto_Sollwert\` | MW 12 | INT |
| \`Sollwert\` | MW 20 | INT |
| \`Antrieb\` | A 4.0 | BOOL |
| \`Betriebsart_ungueltig\` | M 31.7 | BOOL |

**Hinweis:** \`SPL\` wertet Akku 1 aus und führt die *n*-te darauffolgende Zeile aus. Ist der Wert größer als die Anzahl der Sprungzeilen, wird die bei \`SPL\` angegebene Default-Marke angesprungen.`,
      starter: `NETZWERK 1
TITEL: Betriebsartenverteiler
      // TODO`,
      solution: `NETZWERK 1
TITEL: Betriebsartenverteiler
// SPL ist der CASE-Ersatz in AWL: Akku 1 waehlt die n-te Folgezeile.
// Jeder Zweig MUSS mit SPA ENDE abschliessen, sonst laeuft er in den
// naechsten Zweig hinein ("Fall-Through" wie in C ohne break).

      SET
      R     "Betriebsart_ungueltig" // Meldung zuruecksetzen

      L     "Betriebsart"
      SPL   UNGL                  // Default, wenn Akku 1 > 3
      SPA   BA0                   // Betriebsart 0: Aus
      SPA   BA1                   // Betriebsart 1: Hand
      SPA   BA2                   // Betriebsart 2: Automatik
      SPA   BA3                   // Betriebsart 3: Einrichten

UNGL: SET
      S     "Betriebsart_ungueltig"
      L     0
      T     "Sollwert"
      CLR
      =     "Antrieb"
      SPA   ENDE

BA0:  L     0                     // Aus
      T     "Sollwert"
      CLR
      =     "Antrieb"
      SPA   ENDE

BA1:  L     "Hand_Sollwert"       // Hand
      T     "Sollwert"
      SPA   ENDE

BA2:  L     "Auto_Sollwert"       // Automatik
      T     "Sollwert"
      SPA   ENDE

BA3:  L     10                    // Einrichten: Schleichfahrt
      T     "Sollwert"

ENDE: NOP   0`,
      hints: [
        'Ein Sprungverteiler ist ein `CASE` ohne `break`: Ohne abschließenden Sprung läuft jeder Zweig in den nächsten hinein.',
        'Du brauchst `L`, `SPL` mit Default-Marke, je einen `SPA` pro Fall, pro Zweig ein `SPA ENDE` sowie `SET`/`CLR` für die Bitausgaben.',
        'L Betriebsart → SPL UNGL → SPA BA0 … SPA BA3 → UNGL: … → BA0: … SPA ENDE → … → BA3: … → ENDE: NOP 0',
        'Der Kopf sieht so aus:\n\n```text\n      L     "Betriebsart"\n      SPL   UNGL\n      SPA   BA0\n      SPA   BA1\n```\nDenk daran, `"Betriebsart_ungueltig"` am Anfang zurückzusetzen – sonst bleibt die Meldung stehen.',
      ],
    },
  ],
}

export default chapter
