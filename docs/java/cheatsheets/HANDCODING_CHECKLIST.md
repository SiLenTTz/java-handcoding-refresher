# Handcoding Mental Checklist

Bevor du anfängst:

1. Was ist der Input?
2. Was ist der Output?
3. Welche Edge Cases gibt es?
4. Welche Datenstruktur passt?
5. Muss ich transformieren?
6. Muss ich filtern?
7. Muss ich gruppieren?
8. Muss ich sortieren?
9. Muss ich deduplizieren?
10. Muss ich Fehlerfälle behandeln?

Dann entscheiden:

```text
Loop?
Stream?
Map?
Set?
Optional?
```

## Stream Shortcut

```text
nur die ...          → filter
wandle um            → map
verschachtelte Liste → flatMap
gruppiere nach       → groupingBy
Lookup               → toMap
mindestens eins      → anyMatch
alle                 → allMatch
finde eins           → findFirst
summiere             → reduce
```
