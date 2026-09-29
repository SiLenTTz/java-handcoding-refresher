# ☕ Java Handcoding Refresher

Eine lokale Lern-Web-App, um modernes Java (21) und Spring Boot wieder **sicher von Hand** zu schreiben.

```text
READ → RECALL → CODE → REVIEW → QUIZ → REPEAT
```

> Code nicht nur lesen. Schreib ihn regelmäßig komplett aus dem Kopf.

## Starten

Voraussetzungen: Node 20+ und ein JDK 21 im `PATH` (`java -version`).

```bash
npm install
npm run dev
```

Die App öffnet sich unter <http://127.0.0.1:5173>.

## Was die App kann

| Bereich | Inhalt |
|---|---|
| **Dashboard** | 25 Kapitel in 4 Modulen, Status pro Kapitel (UNKNOWN → MASTERED), Streak, „Heute dran“ |
| **Kapitel** | Theorie · Karteikarten · Quiz (mit Erklärungen) · Katas |
| **Katas** | Editor **ohne Autocomplete**, echte Tests gegen dein lokales JDK (`⌘↵`), Hints in Stufen, Lösung erst nach dem ersten Versuch |
| **Wiederholen** | Karteikarten mit Leitner-System (Intervalle 0/1/2/4/8/16 Tage) |
| **Prüfung** | Zufällige Fragen über alle/ausgewählte Module, 1 min pro Frage, Auswertung nach Kapitel |
| **Fehlerlog** | Falsche Antworten landen automatisch hier, eigene Einträge mit Kategorie (SYNTAX, API, CONCEPT, …) |
| **Playground** | Freies Java ausführen |
| **Cheatsheets** | Master-Cheatsheet & Handcoding-Checkliste |

Der Fortschritt liegt im `localStorage` des Browsers. Über **Export/Import** in der Sidebar lässt er sich als JSON sichern.

## Empfohlener Tagesablauf

1. Fällige Karten wiederholen (5–10 min)
2. Nächstes Kapitel lesen → Karteikarten → Quiz
3. Katas des Kapitels lösen – erst ohne Hints
4. Fehler notieren, am nächsten Tag wiederholen
5. Jede Woche: Prüfung + 3 Level-4/5-Katas ohne Hilfe

Coding-Regel für Katas: keine KI, kein Copilot, kein Google. Erst selbst versuchen, dann vergleichen.

## Projektstruktur

```text
docs/chapters/          Theorie pro Kapitel (Markdown, wird in der App gerendert)
docs/cheatsheets/       Cheatsheets
src/content/chapters/   Karteikarten, Quiz, Katas pro Kapitel (NN.ts)
src/content/types.ts    Content-Schema
src/                    React-App (pages, components, lib)
server/runJava.ts       Kompiliert & testet Java (Single-File Source Launcher)
scripts/check-katas.ts  Prüft, dass jede Musterlösung ihre Tests besteht
agent/                  System-Prompt, um zusätzlich einen KI-Tutor zu nutzen
```

## Inhalte erweitern

Eine neue Kata in `src/content/chapters/NN.ts` ergänzen:

- `given` – vorgegebene Typen (read-only)
- `starter` – Startcode mit `// TODO`
- `solution` – Referenzlösung
- `tests` – Body einer `main`-Methode mit `check(name, expected, actual)`, `checkTrue(name, cond)`, `checkThrows(name, Ex.class, () -> …)`

Danach prüfen:

```bash
npm run check:katas
npm run typecheck
```

> Sicherheitshinweis: Der Runner führt beliebigen Java-Code auf deinem Rechner aus und lauscht deshalb nur auf `127.0.0.1`. Nicht öffentlich deployen.
