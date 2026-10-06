# Kapitel 04 – Laden, Transferieren & Akkus

## Mental Model

```text
        L  MW 10          L  MW 12          +I                T  MW 14
      ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
AKKU 1│  MW 10   │      │  MW 12   │      │ Summe    │      │ Summe    │
      ├──────────┤      ├──────────┤      ├──────────┤      ├──────────┤
AKKU 2│    –     │      │  MW 10   │      │  MW 10   │      │  MW 10   │
      └──────────┘      └──────────┘      └──────────┘      └──────────┘

  L schiebt:  Akku 1 → Akku 2,  neuer Wert → Akku 1
  T kopiert:  Akku 1 → Ziel,    Akku 1 bleibt unverändert
```

Wortverarbeitung in AWL ist eine **Stapelmaschine mit zwei Registern**. Du lädst Operanden,
rechnest, und transferierst das Ergebnis. Es gibt keine Variablenzuweisung wie `x := a + b` –
du musst die Reihenfolge im Kopf haben.

## Syntax / API

### Laden und Transferieren

```text
      L     MW 10          // Akku 1 := MW 10, alter Inhalt rutscht nach Akku 2
      T     MW 20          // MW 20 := Akku 1 (Akku 1 bleibt erhalten)

      L     EB 0           // Byte: landet RECHTSBÜNDIG, Rest wird mit 0 gefüllt
      L     EW 0           // Wort: unteres Wort von Akku 1, oberes Wort = 0
      L     ED 0           // Doppelwort: füllt Akku 1 komplett
```

Breiten beim Transfer:

```text
      L     MW 10
      T     MB 20          // nur das UNTERSTE Byte von Akku 1 wird geschrieben
      T     MW 20          // unteres Wort
      T     MD 20          // alle 32 Bit
```

**Wichtig:** `L` und `T` werden **unbedingt** ausgeführt – sie hängen nicht vom VKE ab.
Wer sie bedingt ausführen will, braucht einen Sprung (Kapitel 05).

### Konstanten

```text
      L     25                  // Dezimal, INT
      L     L#250000            // DINT (32 Bit)
      L     16#FF               // Hexadezimal
      L     2#1010_1010         // Binär, Unterstriche nur zur Lesbarkeit
      L     B#16#7F             // Byte-Konstante
      L     W#16#00FF           // Wort-Konstante
      L     DW#16#0001_0000     // Doppelwort-Konstante
      L     1.5e1               // REAL (32 Bit Gleitpunkt)
      L     'AB'                // zwei Zeichen als Wort
      L     S5T#5S              // S5-Zeitwert für S7-Timer
      L     T#5S                // IEC-Zeit (TIME, 32 Bit, Millisekunden)
      L     C#100               // Zählwert für S7-Zähler (BCD)
```

### Rechenbefehle

```text
// INT (16 Bit)
      L     MW 10
      L     MW 12
      +I                      // Akku 1 := Akku 2 + Akku 1
      T     MW 14

      -I                      // Akku 1 := Akku 2 - Akku 1   ← Reihenfolge beachten!
      *I                      // Akku 1 := Akku 2 * Akku 1
      /I                      // Akku 1 := Akku 2 / Akku 1, Rest im oberen Wort

// DINT (32 Bit):  +D  -D  *D  /D  MOD
// REAL (32 Bit):  +R  -R  *R  /R
      + 100                   // Konstante direkt auf Akku 1 addieren
```

Merksatz für `-I` und `/I`: **Der zuerst geladene Wert steht links vom Operator.**

```text
// Differenz Soll - Ist
      L     "Sollwert"        // Akku 2 nach dem nächsten L
      L     "Istwert"         // Akku 1
      -I                      // Soll - Ist
      T     "Regelabweichung"
```

### Vergleichsbefehle

```text
      L     "Fuellstand"
      L     800
      >I                      // VKE := 1, wenn Akku 2 > Akku 1, also Fuellstand > 800
      =     "Voll_Meldung"
```

Verfügbar sind `==I`, `<>I`, `>I`, `<I`, `>=I`, `<=I` sowie die Varianten für DINT (`==D` …)
und REAL (`==R` …). Vergleiche **setzen das VKE** – sie sind die Brücke zwischen Wort- und
Bitverarbeitung. Außerdem setzen sie die Anzeigenbits `A1`/`A0`.

```text
// Bereichsprüfung: 200 <= Druck <= 800
      U(
      L     "Druck"
      L     200
      >=I
      )
      U(
      L     "Druck"
      L     800
      <=I
      )
      =     "Druck_im_Band"
```

### TAK, PUSH, POP

```text
      TAK                     // tauscht Akku 1 und Akku 2
      PUSH                    // Akku 1 → Akku 2 (Akku 1 bleibt)
      POP                     // Akku 2 → Akku 1
```

`TAK` rettet dich, wenn du die Operanden in der falschen Reihenfolge geladen hast:

```text
      L     "Istwert"
      L     "Sollwert"
      TAK                     // jetzt: Akku 2 = Sollwert, Akku 1 = Istwert
      -I                      // Soll - Ist
```

### Typumwandlung

```text
      ITD                     // INT → DINT
      DTR                     // DINT → REAL
      RND                     // REAL → DINT (kaufmännisch gerundet)
      TRUNC                   // REAL → DINT (abgeschnitten)
      BTI                     // BCD → INT
      ITB                     // INT → BCD
```

Rechnen mit gemischten Typen gibt es nicht: Du musst **vorher** umwandeln. Für indirekte
Adressierung (`LAR1`, `U E [AR1,P#0.0]`) gilt dasselbe wie für Sprungkonstrukte: mächtig, aber
in neuen Programmen besser als Array mit `FOR`-Schleife in SCL.

## Typische Use Cases

- Analogwert skalieren: Rohwert `PEW 256` laden, umrechnen, in `MW` ablegen.
- Grenzwertüberwachung: laden, vergleichen, Meldebit setzen.
- Stückzahlen aufaddieren und in einen DB schreiben.
- Betriebsstundenzähler: Sekundenimpuls addieren, bei 3600 zurücksetzen.
- Rezeptwerte aus einem DB in Merkerworte kopieren.
- Sollwertdifferenz für eine einfache Zweipunktregelung bilden.

## Clean-Code-Empfehlungen

- Pro Netzwerk **eine** Rechnung, danach sofort transferieren.
- Lade-Reihenfolge im Kommentar festhalten: `// Akku2=Soll, Akku1=Ist, -I ergibt Soll-Ist`.
- Zwischenergebnisse in benannte Lokaldaten (`#Zwischenwert`) statt in anonyme Merkerworte.
- Keine Rechenkette über mehr als zwei Operanden ohne Zwischen-`T` – sonst verlierst du den Überblick.
- Bereichsprüfungen in einen eigenen FC auslagern und symbolisch benennen.
- Für alles, was nach Formel aussieht: **SCL nehmen.** `#Diff := #Soll - #Ist;` ist unschlagbar.

## Häufige Fehler

```text
// FALSCH: Reihenfolge bei -I vertauscht
      L     "Istwert"
      L     "Sollwert"
      -I                       // ergibt Ist - Soll
// RICHTIG
      L     "Sollwert"
      L     "Istwert"
      -I                       // ergibt Soll - Ist

// FALSCH: Transfer in zu schmales Ziel
      L     MW 10              // z. B. 300
      T     MB 20              // nur das untere Byte -> 44, der Rest ist weg
// RICHTIG
      T     MW 20

// FALSCH: angenommen, T sei vom VKE abhängig
      U     "Freigabe"
      L     100
      T     "Sollwert"         // wird IMMER transferiert, Freigabe ist wirkungslos
// RICHTIG: bedingt über einen Sprung
      U     "Freigabe"
      SPBN  M001
      L     100
      T     "Sollwert"
M001: NOP   0

// FALSCH: INT und REAL gemischt
      L     MW 10              // INT
      L     2.5e0              // REAL
      *I                       // Unsinn, Bitmuster wird als INT interpretiert
// RICHTIG
      L     MW 10
      ITD
      DTR
      L     2.5e0
      *R

// FALSCH: INT-Überlauf ignoriert
      L     30000
      L     10000
      +I                       // > 32767, OV/OS werden gesetzt, Ergebnis ist negativ
// RICHTIG: in DINT rechnen
      L     30000
      ITD
      L     L#10000
      +D
```

## Interview-relevante Details

- S7-300 hat **2** Akkus, S7-400 hat **4**. Code, der nur mit zwei Akkus gedacht ist, läuft auf
  der S7-400 zwar, nutzt aber Akku 3/4 nicht – umgekehrt ist Portierung heikel.
- `L` schiebt den alten Akku-1-Inhalt nach Akku 2; `T` schiebt **nichts**, Akku 1 bleibt stehen.
- Laden von Byte/Wort füllt rechtsbündig und nullt die oberen Bits – deshalb ist
  `L MB 10` nie negativ, auch wenn Bit 7 gesetzt ist.
- `L` und `T` sind **VKE-unabhängig** und setzen `/ER` nicht zurück: Eine Verknüpfungskette läuft
  über ein dazwischenliegendes `L`/`T` hinweg weiter.
- Vergleichsbefehle setzen das VKE **und** `/ER := 1`, wirken also wie eine Erstabfrage mit Ergebnis.
- `/I` liefert den Quotienten im unteren und den **Rest im oberen Wort** von Akku 1.
- `OV` zeigt den Überlauf der letzten Operation, `OS` bleibt bis zum expliziten Rücksetzen stehen –
  praktisch zum Prüfen einer ganzen Rechenkette.
- `TAK` ist in Prüfungen beliebt: Es ist die einzige einfache Möglichkeit, die Operandenreihenfolge
  nachträglich zu korrigieren.

## Zusammenfassung

- `L` lädt nach Akku 1 und schiebt den Vorgänger nach Akku 2; `T` kopiert Akku 1 ins Ziel.
- Konstanten brauchen Präfixe: `16#`, `2#`, `B#16#`, `W#16#`, `L#`, `S5T#`, `T#`, `C#`.
- `+I`/`-I`/`*I`/`/I` rechnen `Akku 2 (op) Akku 1` – die Ladereihenfolge entscheidet.
- Vergleichsbefehle (`==I`, `>I`, `<I` …) setzen das VKE und verbinden Wort- mit Bitlogik.
- `TAK` tauscht die Akkus, `ITD`/`DTR`/`RND` wandeln Typen um.
- `L`/`T` laufen unbedingt – bedingtes Transferieren geht nur über Sprünge.
- Sobald es nach Formel aussieht, ist SCL die bessere Sprache.
