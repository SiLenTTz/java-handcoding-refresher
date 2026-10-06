# Kapitel 01 – SCL Grundlagen & Datentypen

## Mental Model

```text
SPS-Zyklus (immer wieder, ewig):

  Prozessabbild der Eingänge lesen (PAE)
        ↓
  Anwenderprogramm abarbeiten   ← hier steht dein SCL-Code
        ↓
  Prozessabbild der Ausgänge schreiben (PAA)
        ↓
  Kommunikation / Selbsttest → zurück nach oben
```

- Dein Baustein läuft **nicht einmal**, sondern alle paar Millisekunden erneut von oben nach unten.
- Eine Variable behält ihren Wert über Zyklen hinweg nur, wenn sie **statisch** ist (VAR im FB) – `VAR_TEMP` ist bei jedem Zyklusstart Müll bzw. 0.
- Es gibt **keine dynamische Speicherverwaltung**: kein `new`, keine Listen, die wachsen. Alles ist zur Übersetzungszeit fest reserviert.

## Syntax / API

### Aufbau eines Bausteins

```pascal
FUNCTION_BLOCK "FB_Foerderband"
{ S7_Optimized_Access := 'TRUE' }
VERSION : 0.1

VAR_INPUT
    i_xStart      : Bool;              // Taster Start
    i_xStop       : Bool;              // Taster Stop (Öffner!)
    i_rSollTempo  : Real := 1.0;       // m/s
END_VAR

VAR_OUTPUT
    q_xMotorEin   : Bool;
    q_xStoerung   : Bool;
END_VAR

VAR_IN_OUT
    io_iStueckzahl : Int;              // wird gelesen UND geschrieben
END_VAR

VAR
    sLaufzeit     : Time;              // statisch: überlebt den Zyklus
    sAnlaufZaehler: DInt;
END_VAR

VAR CONSTANT
    MAX_TEMPO     : Real := 2.5;
END_VAR

VAR_TEMP
    tDiff         : Real;              // nur innerhalb dieses Zyklus gültig
END_VAR

BEGIN
    // Anweisungsteil
END_FUNCTION_BLOCK
```

### Die Deklarationsbereiche

| Bereich | Bedeutung | Lebensdauer |
|---|---|---|
| `VAR_INPUT` | Eingangsparameter, nur lesen | pro Aufruf |
| `VAR_OUTPUT` | Ausgangsparameter, schreiben | pro Aufruf |
| `VAR_IN_OUT` | Durchgangsparameter (Referenz), lesen **und** schreiben | pro Aufruf |
| `VAR` | statische Variablen (nur FB) – liegen im Instanz-DB | über Zyklen hinweg |
| `VAR_TEMP` | Lokaldaten im L-Stack | nur dieser Aufruf |
| `VAR CONSTANT` | symbolische Konstanten | übersetzungszeitlich |

### Elementare Datentypen

```pascal
VAR
    xMotorEin   : Bool;        // TRUE / FALSE, 1 Bit
    byStatus    : Byte;        // 8 Bit, 16#00 .. 16#FF
    wMuster     : Word;        // 16 Bit, 16#0000 .. 16#FFFF
    dwRohdaten  : DWord;       // 32 Bit
    iStueck     : Int;         // 16 Bit, -32768 .. 32767
    diZaehler   : DInt;        // 32 Bit, -2147483648 .. 2147483647
    rDruck      : Real;        // 32 Bit Gleitkomma, ca. 7 Stellen genau
    lrPraezise  : LReal;       // 64 Bit Gleitkomma (nur S7-1500)
    tWartezeit  : Time;        // -24d20h31m23s648ms, intern DInt in ms
    sMeldung    : String[32];  // max. 32 Zeichen + 2 Byte Kopf
    cTrenner    : Char;        // 1 Zeichen
END_VAR
```

### Literale und Initialisierung

```pascal
iStueck     := 0;
iStueck     := 16#7F;              // hexadezimal = 127
wMuster     := 2#1010_1010;        // binär
rDruck      := 1.5;                // Real IMMER mit Punkt
rDruck      := 1.0E-3;
tWartezeit  := T#5s;               // auch T#1h30m, T#500ms
sMeldung    := 'Behaelter voll';   // einfache Anführungszeichen!
cTrenner    := ';';
```

- Ohne Startwert initialisiert die CPU auf `0`, `FALSE`, `T#0ms` bzw. `''`.
- Startwerte in der Deklaration gelten beim **Urlöschen/Neustart**, nicht bei jedem Zyklus.

### Remanenz

```pascal
// Im Instanz-DB bzw. Global-DB spaltenweise "Remanenz" anhaken:
// sBetriebsstunden : DInt  → remanent  → überlebt NETZ-AUS
// sTaktzaehler     : Int   → nicht rem.→ nach NETZ-AUS wieder Startwert
```

Remanent gehört alles, was den Anlagenzustand beschreibt: Betriebsstundenzähler, Stückzahlen, Rezeptnummern. **Nicht** remanent: Hilfsbits, Flankenmerker, Zwischenwerte.

### Symbolik vs. Absolutadressen

```pascal
// Absolut (vermeiden):
%I0.0   := ...   // Eingang Byte 0, Bit 0   (deutsch: E 0.0)
%Q4.1   := ...   // Ausgang                 (deutsch: A 4.1)
%M10.0  := ...   // Merker
%IW64            // Eingangswort, z. B. Analogwert

// Symbolisch (so machen):
"Taster_Start"     : Bool  %I0.0
"Motor_Band_1"     : Bool  %Q4.1
"Fuellstand_Roh"   : Int   %IW64
```

Ab S7-1200/1500 arbeitet man mit **optimierten Bausteinen**: Dort gibt es gar keine Absolutadresse mehr, nur noch Symbole.

### Namenskonventionen (Praxis)

```pascal
i_xStart          // Input, Bool
q_xMotor          // Output, Bool
io_iZaehler       // InOut, Int
s<Name>           // Static
t<Name>           // Temp
MAX_DRUCK         // Konstante: GROSS_MIT_UNTERSTRICH
"DB_Rezepte"      // Bausteine in Anführungszeichen
```

Präfixe `x` (Bool), `i`/`di` (Int/DInt), `r` (Real), `t` (Time), `s` (String) sind in der Siemens-Welt üblich und machen Typfehler sofort sichtbar.

## Typische Use Cases

- **Förderband-FB** mit `VAR_INPUT` für Taster, `VAR_OUTPUT` für Motor, `VAR` für Laufzeit.
- **Betriebsstundenzähler**: remanenter `DInt` im Global-DB, zyklisch hochgezählt.
- **Analogwert-Skalierung**: `Int` aus `%IW` → `Real` in physikalischer Einheit.
- **Störmeldungen**: `Word` als Sammelmeldung, Einzelbits über Bitzugriff.
- **Rezeptdaten**: Global-DB mit `Real`/`Int`-Sollwerten, remanent.

## Clean-Code-Empfehlungen

- Niemals Absolutadressen im Code – immer Symbole aus der PLC-Variablentabelle.
- Sprechende Namen in Anlagensprache: `q_xPumpeVorlaufEin` statt `M1`.
- Pro Baustein **eine** Aufgabe; Deklarationsteil kommentiert, Einheit dazuschreiben (`// bar`, `// ms`).
- `VAR CONSTANT` statt Zahlenliteral im Code (`MAX_DRUCK` statt `6.0`).
- `VAR_TEMP` für Zwischenergebnisse – spart Platz im Instanz-DB und macht klar, dass nichts gemerkt wird.
- Remanenz bewusst setzen, nicht pauschal alles remanent machen (kostet Speicher und verfälscht Tests).

## Häufige Fehler

```pascal
// FALSCH: Temp-Variable als Gedächtnis benutzen
VAR_TEMP tZaehler : Int; END_VAR
tZaehler := tZaehler + 1;           // Startwert ist undefiniert!
// RICHTIG: statische Variable im FB
VAR sZaehler : Int; END_VAR
sZaehler := sZaehler + 1;

// FALSCH: Real ohne Dezimalpunkt
rDruck := 5;                        // Typkonflikt Int → Real
// RICHTIG
rDruck := 5.0;

// FALSCH: String mit doppelten Anführungszeichen
sMeldung := "Stoerung";             // " ist für Bausteinnamen reserviert
// RICHTIG
sMeldung := 'Stoerung';

// FALSCH: Zeit als Zahl
tWartezeit := 5000;                 // Int ist kein Time
// RICHTIG
tWartezeit := T#5s;

// FALSCH: Überlauf unbemerkt
VAR iStueck : Int; END_VAR
iStueck := iStueck + 1;             // bei 32767 → -32768
// RICHTIG: Zählbereich großzügig wählen
VAR diStueck : DInt; END_VAR

// FALSCH: Ausgang mehrfach beschrieben
q_xMotor := TRUE;
q_xMotor := i_xStart;               // letzte Zuweisung gewinnt – Doppelzuweisung
// RICHTIG: genau eine Zuweisungsstelle pro Ausgang
```

## Interview-relevante Details

- **Prozessabbild**: Eingänge werden einmal am Zyklusanfang eingelesen. Ändert sich ein Signal mitten im Zyklus, siehst du es erst im nächsten Zyklus – deshalb ist der Wert innerhalb eines Zyklus konsistent.
- `VAR_IN_OUT` wird als **Zeiger** übergeben. Große Strukturen und Arrays gehören dorthin, nicht nach `VAR_INPUT` (das kopiert).
- `Real` hat ca. 7 signifikante Stellen – für Geld/Stückzahlen `DInt` nehmen, nie `Real`.
- `Time` ist intern ein `DInt` in Millisekunden, deshalb max. ca. 24 Tage.
- Nur ein **FB** hat statische Variablen (Instanz-DB). Eine **FC** hat keinerlei Gedächtnis.
- Optimierte Bausteine liegen nicht byteweise adressierbar im Speicher – das ist schneller, verbietet aber Pointer-Tricks wie `AT`-Sicht oder `ANY`.
- `Bool` belegt in optimierten Bausteinen trotzdem intern ein Byte; Arrays von `Bool` sind kein Bitfeld.

## Zusammenfassung

- SCL läuft **zyklisch**: Gedächtnis gibt es nur über `VAR` (Instanz-DB) oder Global-DBs.
- Deklarationsbereiche: `VAR_INPUT`, `VAR_OUTPUT`, `VAR_IN_OUT`, `VAR`, `VAR_TEMP`, `VAR CONSTANT`.
- Elementare Typen: `Bool`, `Byte`, `Word`, `Int`, `DInt`, `Real`, `LReal`, `Time`, `String`, `Char` – Wertebereiche kennen.
- Literale: `16#FF`, `2#1010`, `1.5`, `T#5s`, `'Text'`.
- Remanenz nur für echten Anlagenzustand.
- Symbolisch programmieren, Präfix-Konventionen nutzen, keine Absolutadressen.
