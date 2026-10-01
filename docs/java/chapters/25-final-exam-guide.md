# Kapitel 25 – Final Exam Guide

## Mental Model

Die Abschlussprüfung simuliert ein technisches Interview bzw. eine Handcoding-Prüfung: **90 Minuten, keine KI, keine Doku, kein Google** – nur IDE, Java und dein Wissen. Bewertet wird nicht nur, ob Code läuft, sondern ob er **korrekt, lesbar und begründet** ist.

Im Lern-Agenten startest du sie mit `START FINAL EXAM`. Ab dann: kein Teaching, keine Hints (außer ausdrücklich angefordert).

## Ablauf und Zeitmanagement

| Teil | Inhalt | Punkte | Zeit (Richtwert) |
|---|---|---|---|
| 1 | Java Fundamentals – 20 Fragen (Collections, Generics, Optional, Records, Enums, Exceptions, equals/hashCode, BigDecimal, Immutability) | 20 | 15 min |
| 2 | Streams – 10 Coding-Aufgaben (filter, map, flatMap, groupingBy, toMap, reduce, sorted, distinct, anyMatch, findFirst) | 20 | 25 min |
| 3 | Backend-Architektur – Order Management REST API | 15 | 25 min |
| 4 | Refactoring – 80–150 Zeilen Legacy-Code | 10 | 15 min |
| 5 | Debugging – Streams, Optional, Generics, equals/hashCode, Collections, JPA, Transactions | 10 | 10 min |

Gesamtbewertung:

```text
Java Fundamentals     /20
Collections           /15
Streams               /20
Architecture          /15
Clean Code            /10
Spring/JPA            /10
Testing                /5
Problem Solving        /5
--------------------------
TOTAL                /100
```

Zeitregeln:

- **Erst alles überfliegen** (2 min), dann leichte Punkte zuerst holen.
- **Timebox pro Aufgabe**: hängst du > 5 min, Skizze/Pseudocode hinschreiben und weiter.
- Teil 3 **nicht perfektionieren**: lieber alle Schichten solide als eine Schicht brillant.
- **5 min Puffer** am Ende für Compile-Check und Edge Cases.

## Vorgehen pro Aufgabentyp

### Fragen (Teil 1)

Antwort in einem Satz + **Warum**. Beispiel: "`HashSet` findet das Objekt nicht, weil `hashCode` nicht überschrieben ist – gleiche Objekte landen in verschiedenen Buckets."

### Stream-Aufgaben (Teil 2)

```text
1. Input-Typ und Output-Typ hinschreiben (List<Order> → Map<String, BigDecimal>)
2. Operation übersetzen: "nur" → filter, "pro" → groupingBy, "Lookup" → toMap
3. Edge Cases: leer, null, Duplikate (toMap-Merge!), Sortierung stabil?
4. Collector wählen: toList, toSet, groupingBy(k, downstream), toMap(k, v, merge, TreeMap::new)
```

### Architektur (Teil 3)

Reihenfolge: Entity → DTOs → Mapper → Repository → Service → Controller → Exception Handler → (Test). Checkliste aus Kapitel 24 im Kopf abhaken.

### Refactoring (Teil 4)

```text
1. Smells auflisten (Stichpunkte, mit Zeilenbezug)
2. Bugs markieren (getrennt von Smells!)
3. Refactoring in kleinen Moves: Rename, Guard Clause, Extract Method, Konstanten, enum/Strategy
4. Kurz begründen, welches Prinzip (SRP, OCP, DRY, ...) verbessert wurde
```

### Debugging (Teil 5)

Systematisch fragen: Was **erwarte** ich? Was **passiert**? Welche Zeile erklärt die Differenz? Typische Kandidaten siehe unten.

## Typische Fallen (Bug-Radar)

```text
Collections   List.of(...) ist unmodifiable → add() wirft UnsupportedOperationException
              ConcurrentModificationException beim remove in for-each → removeIf
              Arrays.asList: feste Größe
              TreeMap/TreeSet nutzen compareTo, nicht equals
Map           toMap ohne Merge-Funktion → IllegalStateException bei Duplicate Key
              map.get(k) + 1 → NPE bei fehlendem Key → merge/getOrDefault
equals/hash   equals ohne hashCode → HashSet/HashMap finden Objekt nicht
              mutable Felder im hashCode → Objekt "verschwindet" nach Änderung
              == statt equals bei String/Integer (Integer-Cache -128..127)
Streams       Stream zweimal benutzt → IllegalStateException
              peek/map mit Seiteneffekten; forEach auf parallelStream + ArrayList
              findFirst().get() auf leerem Stream
              sorted(comparing(...)).reversed() an falscher Stelle
Optional      Optional.of(null) → NPE; get() ohne Prüfung
              orElse(expensive()) wird IMMER ausgewertet → orElseGet
BigDecimal    new BigDecimal(0.1) → ungenau → new BigDecimal("0.1") / valueOf
              equals vergleicht Skala (2.0 ≠ 2.00) → compareTo
              divide ohne RoundingMode → ArithmeticException
              BigDecimal ist immutable: total.add(x) ohne Zuweisung tut nichts
Generics      List<Object> ist KEIN Supertyp von List<String>
              ? extends = lesen (Producer), ? super = schreiben (Consumer)
Records       Array/List-Feld → nicht wirklich immutable → List.copyOf im Compact Constructor
Spring        @Transactional auf private/self-invocation → kein Proxy
              Field Injection → schwer testbar
              Checked Exception → standardmäßig kein Rollback
JPA           N+1 bei LAZY-Collections in Schleifen → join fetch / EntityGraph
              LazyInitializationException außerhalb Transaktion
              Entity als JSON → Endlosrekursion bei bidirektionalen Beziehungen
              @Enumerated(ORDINAL)
```

## Checkliste vor Abgabe

```text
[ ] Kompiliert es? (Semikolons, Generics, Imports, return in allen Pfaden)
[ ] Leere Eingaben, null, Duplikate, Grenzwerte bedacht?
[ ] Geld in BigDecimal, Vergleich mit compareTo, Rundung explizit?
[ ] Keine Entity an der API-Grenze?
[ ] Exceptions sprechend und passend gemappt (404/400/409)?
[ ] Namen sprechend, Methoden kurz, keine Magic Numbers?
[ ] Unveränderliche Rückgaben (toList(), List.copyOf)?
[ ] Entscheidungen in 1–2 Sätzen begründet?
```

## Self-Assessment-Raster

Bewerte dich pro Bereich von 1–4 **vor** und **nach** der Prüfung:

| Stufe | Bedeutung |
|---|---|
| 1 | Ich brauche Doku/IDE-Autocomplete für Grundlegendes |
| 2 | Ich kann es mit ein paar Syntaxfehlern und Nachdenken |
| 3 | Ich schreibe es fehlerfrei von Hand und erkläre es |
| 4 | Ich kenne Fallstricke, Alternativen und kann Trade-offs begründen |

```text
Bereich                         vorher  nachher
Collections & Map API            _       _
Streams & Collectors             _       _
Optional                         _       _
Records / equals / hashCode      _       _
Generics                         _       _
BigDecimal                       _       _
Exceptions                       _       _
OOP / SOLID / Patterns           _       _
Clean Code / Refactoring         _       _
Spring DI / Layering             _       _
Spring Data / Pagination         _       _
JPA / Transaktionen              _       _
Testing (JUnit/Mockito/AssertJ)  _       _
```

Interpretation: Alles < 3 ist ein Wiederholungskandidat. Nach der Prüfung liefert der Agent **strongest areas, weakest areas, recurring mistakes, recommended next exercises** – übernimm die weakest areas als nächste Übungsrunde.

## Häufige Fehler in der Prüfung selbst

- Sofort losschreiben, ohne Input/Output zu klären.
- Bei einer Aufgabe festbeißen und Teil 3–5 nicht mehr schaffen.
- Refactoring, das Verhalten ändert – ohne es zu sagen.
- Smells nennen, aber nicht erklären, **warum** sie schaden.
- Überengineering (Generic Base Service, 5 Interfaces) statt klarer, direkter Lösung.
- Keine Edge Cases erwähnen, obwohl man sie kennt.

## Interview-Details

- **Laut denken**: Interviewer bewerten den Weg. "Ich nehme `groupingBy` mit `reducing`, weil ..." ist Gold wert.
- **Trade-offs nennen**: Stream vs Schleife, Page vs Slice, enum vs Strategy, Fake vs Mock.
- **Bekannte Lücken offen benennen**: "Die genaue Signatur weiß ich nicht, aber ich brauche einen Collector, der ... "
- **Erst korrekt, dann schön**: Lauffähige einfache Lösung, dann refactoren.

## Zusammenfassung

```text
90 min, 5 Teile, 100 Punkte
Überfliegen → leichte Punkte → Timebox → Puffer
Stream-Aufgaben: Typen hinschreiben, Operation übersetzen, Edge Cases
Architektur: Entity → DTO → Mapper → Repo → Service → Controller → Advice
Refactoring: Smells vs Bugs trennen, kleine Moves, begründen
Debugging: Bug-Radar im Kopf durchgehen
```
