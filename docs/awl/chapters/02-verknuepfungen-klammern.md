# Kapitel 02 – Verknüpfungen & Klammern

## Mental Model

```text
      U  x        VKE := VKE UND x            (Reihenschaltung)
      O  x        VKE := VKE ODER x           (Parallelschaltung)
      X  x        VKE := VKE XOR x            (Antivalenz)
      N vorweg    das abgefragte Bit wird invertiert:  UN / ON / XN

      U( … )      "Klammer auf": VKE und /ER werden auf den Klammerstack gelegt,
                  innen beginnt eine NEUE Erstabfrage, ) verknüpft das Ergebnis.
```

In AWL gibt es keine Ausdrücke mit Operatorrangfolge wie in SCL. Es gibt nur eine lineare Kette –
plus genau ein Hilfsmittel, um Teilausdrücke zu bilden: die **Klammer**.

## Syntax / API

### Die Grundoperationen

```text
      U     E 0.0        // UND mit E 0.0
      UN    E 0.1        // UND mit NICHT E 0.1
      O     E 0.2        // ODER mit E 0.2
      ON    E 0.3        // ODER mit NICHT E 0.3
      X     E 0.4        // Exklusiv-ODER mit E 0.4
      XN    E 0.5        // Exklusiv-ODER mit NICHT E 0.5
      =     A 4.0        // Zuweisung, beendet die Kette
```

### Reihe (UND) und Parallel (ODER)

```text
NETZWERK 1: Band läuft nur bei allen Freigaben     // Reihenschaltung
      U     "Start"
      U     "Schutztuer_zu"
      UN    "Stoerung"
      =     "Motor_Band"

NETZWERK 2: Sammelstörung                           // Parallelschaltung
      O     "Motorschutz_ausgeloest"
      O     "Ueberdruck"
      O     "Not_Halt_betaetigt"
      =     "Sammelstoerung"
```

### UND-vor-ODER: die implizite Vorrangregel

AWL kennt **eine** eingebaute Rangfolge: Eine ununterbrochene Folge von `U`-Anweisungen bildet ein
UND-Glied, das danach mit `O` verodert wird. Das entspricht `(a AND b) OR (c AND d)`.

```text
// Ampel: Freigabe, wenn (Automatik UND Sensor) ODER (Hand UND Tipptaste)
      U     "Automatik"
      U     "Sensor"
      O                       // O ohne Operand: schließt das UND-Glied ab
      U     "Hand"
      U     "Tipptaste"
      =     "Freigabe"
```

Das operandenlose `O` ist der Trenner zwischen zwei UND-Gliedern. Es ist korrekt, aber schlecht
lesbar – in der Praxis schreibt man dieselbe Logik lieber mit Klammern.

### Klammern

Mit Klammern erzwingst du **ODER vor UND** und bildest beliebige Teilausdrücke:

```text
// Freigabe, wenn (Hand ODER Automatik) UND Schutztür zu
      U(
      O     "Hand"
      O     "Automatik"
      )
      U     "Schutztuer_zu"
      =     "Freigabe"
```

Verfügbar sind `U(`, `UN(`, `O(`, `ON(`, `X(`, `XN(` und die schließende `)`.
Was `U(` tut: aktuelles VKE und `/ER` auf den Klammerstack retten, `/ER := 0` setzen (innen
beginnt also eine neue Erstabfrage) und bei `)` das innere Ergebnis mit dem geretteten VKE
UND-verknüpfen.

```text
// geschachtelt: ((A ODER B) UND C) ODER (D UND E)
      U(
      U(
      O     "A"
      O     "B"
      )
      U     "C"
      )
      O(
      U     "D"
      U     "E"
      )
      =     "Ergebnis"
```

Der Klammerstack ist begrenzt (bei S7-300/400 auf **7** Ebenen). Mehr als zwei bis drei Ebenen
sind ohnehin nicht mehr lesbar.

### NOT, SET und CLR

```text
      U     "Freigabe"
      NOT                 // invertiert das VKE (ohne Operand)
      =     "Sperre"

      SET                 // VKE := 1, unabhängig von allem davor
      =     "Dauer_Ein"

      CLR                 // VKE := 0
      =     "Dauer_Aus"
```

`SET`/`CLR` sind nützlich für Initialisierungen und zum gezielten Vorbesetzen vor `S`/`R`
(Kapitel 03). `NOT` wirkt auf das **VKE**, `UN`/`ON` dagegen auf den **Operanden** – das ist
nicht dasselbe.

```text
// NOT invertiert das Gesamtergebnis
      U     "A"
      U     "B"
      NOT               // = NICHT (A UND B)

// UN invertiert nur den einen Operanden
      U     "A"
      UN    "B"         // = A UND NICHT B
```

### Antivalenz / Äquivalenz

```text
// XOR: genau einer von beiden
      U     "Schalter_1"
      X     "Schalter_2"
      =     "Licht"           // klassische Wechselschaltung

// Äquivalenz: beide gleich → XOR invertieren
      U     "Soll"
      X     "Ist"
      NOT
      =     "Werte_gleich"
```

## Typische Use Cases

- **Verriegelung**: UND-Kette aus Freigaben, Schutzeinrichtungen und "keine Störung".
- **Sammelmeldung**: ODER-Kette aus Einzelstörungen.
- **Betriebsartenwahl**: `U( O Hand O Automatik )` gefolgt von den gemeinsamen Bedingungen.
- **Wechselschaltung / Richtungserkennung**: `X`.
- **Soll-Ist-Vergleich auf Bitebene**: `X` + `NOT`.
- **Zweihandbedienung** (beide Taster): simple UND-Kette, zeitliche Bedingung kommt in Kapitel 06.

## Clean-Code-Empfehlungen

- Klammern statt operandenlosem `O` – auch wenn es eine Zeile mehr kostet.
- Innenblöcke von Klammern einrücken, `U(` und `)` untereinander.
- Pro Netzwerk ein Ergebnis. Lange Ausdrücke in Zwischenmerker zerlegen:
  `"Freigabe_Antrieb"`, `"Freigabe_Hydraulik"`, dann die Kombination.
- Positiv formulieren: `"Schutztuer_zu"` statt `UN "Schutztuer_offen"`.
- Nie mehr als zwei Klammerebenen; tiefer verschachtelte Logik gehört in einen eigenen FC.
- Jede Zeile kommentieren, wenn das Symbol nicht selbsterklärend ist.

## Häufige Fehler

```text
// FALSCH: ODER soll zuerst gelten, Klammer fehlt
      O     "Hand"
      O     "Automatik"
      U     "Tuer_zu"
      =     "Freigabe"            // ergibt Hand ODER (Automatik UND Tuer_zu)
// RICHTIG
      U(
      O     "Hand"
      O     "Automatik"
      )
      U     "Tuer_zu"
      =     "Freigabe"

// FALSCH: Klammer nicht geschlossen → Übersetzungsfehler
      U(
      O     "A"
      O     "B"
      U     "C"

// FALSCH: NOT und UN verwechselt
      U     "A"
      U     "B"
      NOT
      =     "X"                   // NICHT (A UND B)
// RICHTIG, wenn A UND NICHT B gemeint war
      U     "A"
      UN    "B"
      =     "X"

// FALSCH: SET mitten in der Kette zerstört das VKE
      U     "Start"
      SET                          // VKE := 1, "Start" ist wirkungslos
      =     "Motor"

// FALSCH: doppelte Negation aus Bequemlichkeit
      UN    "Nicht_Bereit"
// RICHTIG: Symbol positiv benennen
      U     "Bereit"
```

## Interview-relevante Details

- AWL hat **keine** allgemeine Operatorrangfolge. Es gilt nur: zusammenhängende `U`-Folgen bilden
  ein UND-Glied, getrennt durch `O` ohne Operand.
- `U(` legt VKE **und** `/ER` auf den Klammerstack; innen startet eine neue Erstabfrage.
- Klammerstack-Tiefe bei S7-300/400: 7 Ebenen.
- Das `OR`-Bit im Statuswort ist genau der Mechanismus hinter "UND vor ODER".
- `NOT` wirkt auf das VKE, `UN` auf den Operanden – im Interview ein beliebter Stolperstein.
- `SET`/`CLR` setzen das VKE **und** `/ER := 1`, damit danach normal weiterverknüpft wird.
- Dieselbe Logik in SCL: `Freigabe := (Hand OR Automatik) AND Tuer_zu;` – eine Zeile statt sieben.
  Das ist der Hauptgrund, warum AWL für neue Projekte nicht mehr empfohlen wird.

## Zusammenfassung

- `U`, `UN`, `O`, `ON`, `X`, `XN` verknüpfen das VKE mit einem Operanden.
- Reihe = UND, Parallel = ODER; das operandenlose `O` trennt UND-Glieder.
- `U( … )` und `O( … )` erzwingen die gewünschte Rangfolge und retten VKE/`/ER` auf den Stack.
- `NOT` invertiert das VKE, `SET`/`CLR` setzen es hart auf 1 bzw. 0.
- `=` schließt die Kette ab und löst die nächste Erstabfrage aus.
- Lesbarkeit entsteht durch Klammern, Einrückung, positive Symbolnamen und Zwischenmerker.
