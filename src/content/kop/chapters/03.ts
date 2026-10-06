import type { ChapterContent } from '../../types'

const chapter: ChapterContent = {
  id: '03',
  flashcards: [
    {
      id: 'f1',
      front: 'Unterschied zwischen `( )` und `(S)`?',
      back: '`( )` weist den Zustand des Strompfads **jeden Zyklus** zu (auch die 0). `(S)` schreibt nur eine **1** und lässt den Operanden sonst unverändert.',
    },
    {
      id: 'f2',
      front: 'Welche SCL-Entsprechung hat eine Setzspule?',
      back: '```pascal\nIF "Bedingung" THEN\n    "Operand" := TRUE;\nEND_IF;\n```\n\nDie Rücksetzspule `(R)` entsprechend mit `:= FALSE`.',
    },
    {
      id: 'f3',
      front: 'Warum gehören `(S)` und `(R)` immer als Paar zusammen?',
      back: 'Ein `(S)` ohne `(R)` erzeugt einen Zustand, den niemand mehr löschen kann. Der Operand bleibt bis zum nächsten CPU-Neustart auf 1.',
    },
    {
      id: 'f4',
      front: 'Zwei getrennte Netzwerke setzen und rücksetzen denselben Merker. Beide Bedingungen sind gleichzeitig 1 – wer gewinnt?',
      back: 'Das **zuletzt bearbeitete** Netzwerk. Die CPU arbeitet von oben nach unten, das letzte Schreiben bleibt stehen.',
    },
    {
      id: 'f5',
      front: 'Was ist der Unterschied zwischen SR und RS?',
      back: '**SR** = Rücksetzen vorrangig (`R1` liegt unten). **RS** = Setzen vorrangig (`S1` liegt unten). Merkhilfe: Der untere Eingang mit der **1** im Namen gewinnt.',
    },
    {
      id: 'f6',
      front: 'Was macht der Kontakt `|P|`?',
      back: 'Er ist **genau einen Zyklus** lang leitend, wenn das Signal links von 0 auf 1 wechselt (steigende Flanke). Über dem Kontakt steht der Flankenmerker.',
    },
    {
      id: 'f7',
      front: 'Was macht der Kontakt `|N|`?',
      back: 'Fallende Flanke: einen Zyklus lang leitend beim Wechsel von **1 auf 0**. Typisch für Reaktionen auf das Loslassen eines Tasters.',
    },
    {
      id: 'f8',
      front: 'Welche SCL-Zeilen entsprechen diesem Netzwerk?\n\n```text\n     S_Taster    M_Fl             M_Impuls\n  ----| |---------|P|-------------( )----\n```',
      back: '```pascal\n"M_Impuls" := "S_Taster" AND NOT "M_Fl";\n"M_Fl" := "S_Taster";\n```',
    },
    {
      id: 'f9',
      front: 'Warum darf ein Flankenmerker nur **einmal** verwendet werden?',
      back: 'Der Merker speichert den Zustand des letzten Zyklus für genau **ein** Signal. Teilen sich zwei Flanken denselben Merker, überschreiben sie sich gegenseitig und erzeugen Phantom-Flanken bzw. verschluckte Impulse.',
    },
    {
      id: 'f10',
      front: 'Warum legt man einen Taster nicht direkt auf den Zähleingang `CU`?',
      back: 'Weil der Zähler dann in **jedem Zyklus** zählt, solange der Taster gedrückt ist. Zwischen Taster und `CU` gehört ein `|P|`-Kontakt.',
    },
    {
      id: 'f11',
      front: 'Sind mehrere `(S)`/`(R)`-Spulen auf denselben Operanden eine Doppelzuweisung?',
      back: 'Nein. `(S)` und `(R)` schreiben nur in eine Richtung und nur bei erfüllter Bedingung. Mehrere Set-/Reset-Stellen auf denselben Operanden sind üblich – bei normalen Spulen `( )` dagegen verboten.',
    },
    {
      id: 'f12',
      front: 'Was passiert mit einer Flanke im **ersten Zyklus** nach dem Anlauf?',
      back: 'Der Flankenmerker ist 0. Steht das Signal bereits an, erkennt die CPU eine Flanke, die es physikalisch nie gab. Bei Bedarf im Anlauf-OB vorbelegen.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      prompt: '`S_Taster` wird kurz gedrückt und losgelassen. Welchen Wert hat `M_Zustand` danach?',
      code: `  Netzwerk 1:

     S_Taster                     M_Zustand
  ----| |------------------------(S)----`,
      options: ['`0`', '`1`', 'wechselt jeden Zyklus', 'undefiniert'],
      correct: 1,
      explanation: 'Die Setzspule schreibt nur die 1. Beim Loslassen passiert nichts – der Zustand bleibt gespeichert, bis ein `(R)` ihn löscht.',
    },
    {
      id: 'q2',
      prompt: 'Welche SCL-Zeilen entsprechen diesem Netzwerk?',
      code: `  Netzwerk 1:

     S_Start    M_Fl_Start          M_Auftrag
  ----| |--------|P|------------------(S)----`,
      options: [
        '`"M_Auftrag" := "S_Start";`',
        '`IF "S_Start" THEN "M_Auftrag" := TRUE; END_IF;`',
        '`IF "S_Start" AND NOT "M_Fl_Start" THEN "M_Auftrag" := TRUE; END_IF;\n"M_Fl_Start" := "S_Start";`',
        '`"M_Auftrag" := "S_Start" AND "M_Fl_Start";`',
      ],
      correct: 2,
      explanation: 'Die Flanke ist `Signal AND NOT Flankenmerker`, danach wird der Merker nachgeführt. Die Setzspule wird zum `IF ... THEN := TRUE`.',
    },
    {
      id: 'q3',
      prompt: '`Melder` und `Quittung` sind **gleichzeitig** 1. Welchen Wert hat `M_Stoerung` am Ende des Zyklus?',
      code: `  Netzwerk 1:
     Melder                       M_Stoerung
  ----| |------------------------(S)----

  Netzwerk 2:
     Quittung                     M_Stoerung
  ----| |------------------------(R)----`,
      options: ['`1`', '`0`', 'abwechselnd', 'Compile-Fehler wegen Doppelzuweisung'],
      correct: 1,
      explanation: 'Netzwerk 2 wird zuletzt bearbeitet und setzt zurück. Bei getrennten Set/Reset-Netzwerken gewinnt immer das untere.',
    },
    {
      id: 'q4',
      prompt: 'Wo ist der Fehler?',
      code: `  Netzwerk 1:
     TasterA     M_Flanke             M_ImpulsA
  ----| |----------|P|-----------------( )----

  Netzwerk 2:
     TasterB     M_Flanke             M_ImpulsB
  ----| |----------|P|-----------------( )----`,
      options: [
        '`|P|` darf nicht direkt hinter einem Schließer stehen',
        'Beide Netzwerke teilen sich denselben Flankenmerker `M_Flanke`',
        'Es fehlt eine Setzspule',
        'Kein Fehler, Flankenmerker sind wiederverwendbar',
      ],
      correct: 1,
      explanation: 'Ein Flankenmerker speichert den Vorzyklus-Zustand genau eines Signals. Geteilt führt das zu Phantom-Flanken und verschluckten Impulsen – je Flanke ein eigener Merker.',
    },
    {
      id: 'q5',
      prompt: 'Wie lange ist `M_Impuls` wahr, wenn `S_Taster` fünf Sekunden gedrückt bleibt?',
      code: `  Netzwerk 1:

     S_Taster    M_Fl                 M_Impuls
  ----| |---------|P|-----------------( )----`,
      options: [
        'fünf Sekunden',
        'genau einen Zyklus',
        'bis zum nächsten Reset',
        'gar nicht, `|P|` braucht eine Setzspule',
      ],
      correct: 1,
      explanation: '`|P|` leitet nur in dem Zyklus, in dem der Flankenmerker noch den alten Zustand 0 hat. Im nächsten Zyklus ist der Merker nachgeführt.',
    },
    {
      id: 'q6',
      prompt: 'Beide Eingänge des Bausteins sind gleichzeitig 1. Welchen Wert hat `Q`?',
      code: `  Netzwerk 1:

                 +-------------+
                 |  M_Stoerung |
                 |     SR      |
     Melder      |             |      M_Lampe
  ----| |--------| S         Q |-----( )----
                 |             |
     Quittung    |             |
  ----| |--------| R1          |
                 +-------------+`,
      options: ['`Q = 1`, Setzen hat Vorrang', '`Q = 0`, Rücksetzen hat Vorrang', '`Q` bleibt unverändert', '`Q` wechselt jeden Zyklus'],
      correct: 1,
      explanation: 'Beim **SR**-Baustein liegt `R1` unten und ist dominant. Für Set-Vorrang nimmt man den **RS**-Baustein mit `S1` unten.',
    },
    {
      id: 'q7',
      prompt: 'Wo ist der Fehler in dieser Motorsteuerung?',
      code: `  Netzwerk 1:

     S_Start                      K_Motor
  ----| |------------------------(S)----`,
      options: [
        'Es fehlt ein `|P|` vor der Spule',
        'Es gibt kein `(R)` – der Motor lässt sich nie abschalten, auch nicht über Not-Halt',
        '`(S)` ist für Ausgänge nicht erlaubt',
        'Kein Fehler, `(S)` ist die übliche Motoransteuerung',
      ],
      correct: 1,
      explanation: 'Eine Setzspule ohne Rücksetzspule erzeugt einen Zustand, den keine Logik mehr löscht. Für Antriebe Selbsthaltung oder ein vollständiges Set/Reset-Paar verwenden.',
    },
    {
      id: 'q8',
      prompt: 'Welches Element brauchst du, um bei jedem Tastendruck genau einen Zählimpuls zu erzeugen?',
      options: [
        '`|/|` Öffner vor dem Zähleingang',
        '`|P|` steigende Flanke mit eigenem Flankenmerker vor dem Zähleingang',
        '`(S)` Setzspule auf den Zähleingang',
        'Nichts – der Zähler erkennt Flanken selbst',
      ],
      correct: 1,
      explanation: 'Ohne Flanke zählt der CTU in jedem Zyklus hoch, solange der Taster gedrückt ist. `|P|` begrenzt das auf einen Zyklus.',
    },
  ],
  katas: [
    {
      id: 'k1',
      title: 'Störung speichern und quittieren',
      level: 1,
      description: `Zeichne zwei Netzwerke: Eine Störmeldung soll gespeichert werden, bis sie quittiert wird.

**Zuordnungsliste**

\`\`\`text
  E0.0   B_Melder     Stoermelder (1 = Stoerung)
  E0.1   S_Quittung   Quittiertaster
  M10.0  M_Stoerung   gespeicherte Stoerung
\`\`\`

Schreibe darunter die SCL-Entsprechung.`,
      starter: `  Netzwerk 1: Stoerung speichern
  ----
  // TODO

  Netzwerk 2: Stoerung quittieren
  ----
  // TODO

  SCL:
  // TODO`,
      solution: `  Netzwerk 1: Stoerung speichern

     B_Melder                     M_Stoerung
  ----| |------------------------(S)----

  Netzwerk 2: Stoerung quittieren

     S_Quittung                   M_Stoerung
  ----| |------------------------(R)----

  SCL:
  IF "B_Melder" THEN
      "M_Stoerung" := TRUE;
  END_IF;

  IF "S_Quittung" THEN
      "M_Stoerung" := FALSE;
  END_IF;`,
      hints: [
        'Gespeichert heißt: Der Zustand bleibt, auch wenn das auslösende Signal verschwindet.',
        'Dafür brauchst du eine Setzspule `(S)` und eine Rücksetzspule `(R)` auf denselben Merker.',
        'Netzwerk 1: Schließer auf `B_Melder`, Spule `(S)` auf `M_Stoerung`. Netzwerk 2: Schließer auf `S_Quittung`, Spule `(R)` auf `M_Stoerung`.',
        '```text\n     B_Melder                     M_Stoerung\n  ----| |------------------------(?)----\n```',
      ],
    },
    {
      id: 'k2',
      title: 'Flankennetzwerk nach SCL übersetzen',
      level: 2,
      description: `Übersetze das vorgegebene Netzwerk in SCL. Denk daran: Der Flankenmerker muss nachgeführt werden.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Start        Starttaster
  M20.0  M_Fl_Start     Flankenmerker Start
  M10.0  M_Auftrag      Auftrag aktiv
  E0.1   B_Fertig       Fertigmeldung
\`\`\``,
      given: `  Netzwerk 1: Auftrag starten

     S_Start    M_Fl_Start          M_Auftrag
  ----| |--------|P|------------------(S)----

  Netzwerk 2: Auftrag beenden

     B_Fertig                        M_Auftrag
  ----| |----------------------------(R)----`,
      starter: `  SCL:
  // TODO: Netzwerk 1
  // TODO: Flankenmerker nachfuehren
  // TODO: Netzwerk 2`,
      solution: `  SCL:
  IF "S_Start" AND NOT "M_Fl_Start" THEN
      "M_Auftrag" := TRUE;
  END_IF;
  "M_Fl_Start" := "S_Start";

  IF "B_Fertig" THEN
      "M_Auftrag" := FALSE;
  END_IF;`,
      hints: [
        'Eine steigende Flanke ist "Signal jetzt 1, im letzten Zyklus aber 0".',
        'Der Flankenmerker hält den Zustand des Vorzyklus. Die Flankenbedingung lautet `Signal AND NOT Flankenmerker`.',
        'Erst das `IF` mit der Flankenbedingung und `:= TRUE`, danach in einer eigenen Zeile den Flankenmerker auf das aktuelle Signal setzen. Netzwerk 2 wird ein zweites `IF` mit `:= FALSE`.',
        '```pascal\nIF "S_Start" AND NOT "M_Fl_Start" THEN\n    "M_Auftrag" := TRUE;\nEND_IF;\n"M_Fl_Start" := ???;\n```',
      ],
    },
    {
      id: 'k3',
      title: 'Fehlerhafte Flankenauswertung korrigieren',
      level: 3,
      description: `Im vorgegebenen Programm zählen zwei Taster auf zwei verschiedene Impulsmerker. In der Praxis fehlen Impulse und es entstehen Impulse ohne Tastendruck.

Finde den Fehler, korrigiere beide Netzwerke und erkläre in einem Kommentar, was schiefging.

**Zuordnungsliste**

\`\`\`text
  E0.0   S_TasterA    Taster A
  E0.1   S_TasterB    Taster B
  M20.0  M_Flanke     Flankenmerker (gemeinsam benutzt)
  M10.0  M_ImpulsA    Impuls A
  M10.1  M_ImpulsB    Impuls B
\`\`\``,
      given: `  Netzwerk 1: FEHLERHAFT

     S_TasterA   M_Flanke             M_ImpulsA
  ----| |----------|P|-----------------( )----

  Netzwerk 2: FEHLERHAFT

     S_TasterB   M_Flanke             M_ImpulsB
  ----| |----------|P|-----------------( )----`,
      starter: `  Netzwerk 1: Impuls A (korrigiert)
  ----
  // TODO

  Netzwerk 2: Impuls B (korrigiert)
  ----
  // TODO

  // Begruendung:
  // TODO`,
      solution: `  Netzwerk 1: Impuls A (korrigiert)

     S_TasterA   M_Fl_A               M_ImpulsA
  ----| |----------|P|-----------------( )----

  Netzwerk 2: Impuls B (korrigiert)

     S_TasterB   M_Fl_B               M_ImpulsB
  ----| |----------|P|-----------------( )----

  // Begruendung:
  // Ein Flankenmerker speichert den Vorzyklus-Zustand GENAU EINES Signals.
  // Teilen sich zwei Flanken denselben Merker, ueberschreibt Netzwerk 2 den
  // Merker mit dem Zustand von S_TasterB. Netzwerk 1 vergleicht dann im
  // naechsten Zyklus gegen einen fremden Zustand -> Phantom-Flanken und
  // verschluckte Impulse. Jede Flankenauswertung braucht ihren eigenen Merker.

  SCL:
  "M_ImpulsA" := "S_TasterA" AND NOT "M_Fl_A";
  "M_Fl_A" := "S_TasterA";
  "M_ImpulsB" := "S_TasterB" AND NOT "M_Fl_B";
  "M_Fl_B" := "S_TasterB";`,
      hints: [
        'Der Fehler liegt nicht in der Struktur des Netzwerks, sondern in der Belegung eines Operanden.',
        'Schau dir an, welcher Merker über den beiden `|P|`-Kontakten steht.',
        'Gib jeder Flankenauswertung einen eigenen Flankenmerker, zum Beispiel `M_Fl_A` und `M_Fl_B`. Die Netzwerkstruktur bleibt sonst unverändert.',
        '```text\n     S_TasterA   M_Fl_A               M_ImpulsA\n  ----| |----------|P|-----------------( )----\n\n     S_TasterB   ??????               M_ImpulsB\n  ----| |----------|P|-----------------( )----\n```',
      ],
    },
    {
      id: 'k4',
      title: 'Licht-Toggle mit einem Taster',
      level: 4,
      description: `Ein einziger Taster soll das Licht abwechselnd ein- und ausschalten (Stromstoßschalter).

Setze die folgende Logik in **zwei** KOP-Netzwerke um und beachte, dass jede Flanke ihren eigenen Merker braucht.

\`\`\`pascal
// Einschalten, wenn das Licht aus ist
IF "S_Taster" AND NOT "M_Fl_Ein" AND NOT "M_Licht" THEN
    "M_Licht" := TRUE;
END_IF;
"M_Fl_Ein" := "S_Taster";

// Ausschalten, wenn das Licht an ist
IF "S_Taster" AND NOT "M_Fl_Aus" AND "M_Licht" THEN
    "M_Licht" := FALSE;
END_IF;
"M_Fl_Aus" := "S_Taster";
\`\`\`

**Zuordnungsliste**

\`\`\`text
  E0.0   S_Taster     Taster Licht
  M20.0  M_Fl_Ein     Flankenmerker Einschaltzweig
  M20.1  M_Fl_Aus     Flankenmerker Ausschaltzweig
  M10.0  M_Licht      Zustand Licht
  A0.0   H_Licht      Lampe
\`\`\`

Ergänze ein drittes Netzwerk, das \`M_Licht\` auf den Ausgang \`H_Licht\` ausgibt.

**Denkfrage für den Kommentar:** Warum ist die Reihenfolge der beiden Netzwerke hier kritisch?`,
      starter: `  Netzwerk 1: Licht einschalten
  ----
  // TODO

  Netzwerk 2: Licht ausschalten
  ----
  // TODO

  Netzwerk 3: Ausgang
  ----
  // TODO

  // Warum ist die Reihenfolge kritisch?
  // TODO`,
      solution: `  Netzwerk 1: Licht einschalten

     S_Taster   M_Fl_Ein    M_Licht       M_Licht
  ----| |---------|P|---------|/|---------(S)----

  Netzwerk 2: Licht ausschalten

     S_Taster   M_Fl_Aus    M_Licht       M_Licht
  ----| |---------|P|---------| |---------(R)----

  Netzwerk 3: Ausgang

     M_Licht                      H_Licht
  ----| |------------------------( )----

  // Warum ist die Reihenfolge kritisch?
  // Netzwerk 1 setzt M_Licht im selben Zyklus, in dem die Flanke auftritt.
  // Netzwerk 2 sieht danach bereits M_Licht = 1 und wuerde sofort wieder
  // zuruecksetzen - deshalb MUSS Netzwerk 2 den zweiten, eigenen
  // Flankenmerker M_Fl_Aus benutzen, der im selben Zyklus ebenfalls schon
  // nachgefuehrt wurde. Dadurch ist die Flankenbedingung in Netzwerk 2
  // nicht mehr erfuellt und das Licht bleibt an.
  // Sauberer und wartungsfreundlicher: EIN Netzwerk mit Flanke auf einen
  // Impulsmerker, danach die Toggle-Logik gegen diesen Impulsmerker.`,
      hints: [
        'Ein Toggle braucht zwei Zweige: einschalten, wenn aus – ausschalten, wenn an.',
        'Jeder Zweig besteht aus Taster, Flankenkontakt `|P|` mit eigenem Merker, dem Zustandskontakt auf `M_Licht` und einer `(S)`- bzw. `(R)`-Spule.',
        'Netzwerk 1: `S_Taster` → `|P|` mit `M_Fl_Ein` → Öffner auf `M_Licht` → `(S)` auf `M_Licht`. Netzwerk 2 spiegelverkehrt: Schließer auf `M_Licht` → `(R)`. Netzwerk 3 reicht `M_Licht` an `H_Licht` durch.',
        '```text\n  Netzwerk 1:\n     S_Taster   M_Fl_Ein    M_Licht       M_Licht\n  ----| |---------|P|---------|?|---------(?)----\n\n  Netzwerk 2:\n     S_Taster   ???????     M_Licht       M_Licht\n  ----| |---------|P|---------| |---------(R)----\n```',
      ],
    },
  ],
}

export default chapter
