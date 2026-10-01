# Kapitel 13 – Exceptions

## Mental Model

Eine Exception ist ein **zweiter Rückgabeweg** für den Fall, dass der normale Weg unmöglich ist. Sie beantwortet drei Fragen: *Was ist passiert?* (Typ), *Mit welchen Daten?* (Message/Felder), *Woher kam es?* (Cause + Stacktrace).

```text
Throwable
 ├── Error              ✘ nicht fangen  (OutOfMemoryError, StackOverflowError)
 └── Exception
      ├── RuntimeException   → unchecked: Programmierfehler, Vertragsbruch
      │     IllegalArgumentException, IllegalStateException, NPE,
      │     NoSuchElementException, eigene Domain-Exceptions
      └── alle anderen       → checked: erwartbare Umweltprobleme
            IOException, SQLException, InterruptedException
```

Leitfrage: **Kann der Aufrufer sinnvoll reagieren?** Ja → checked (oder bewusst unchecked mit dokumentiertem Vertrag). Nein, es ist ein Bug → unchecked. In Spring-Backends dominieren unchecked Exceptions, weil `@Transactional` bei `RuntimeException` automatisch zurückrollt und `@ControllerAdvice` zentral übersetzt.

## Syntax / API

### try / catch / finally

```java
try {
    return parse(input);
} catch (NumberFormatException e) {
    log.warn("Ungültige Eingabe: {}", input, e);
    return 0;
} finally {
    meter.increment();    // läuft (fast) immer: auch bei return, auch bei Exception
}
```

**Gefährlich:** Ein `return` im `finally`-Block verwirft das Ergebnis *und* eine fliegende Exception.

### Multi-Catch

```java
try {
    load(url);
} catch (IOException | InterruptedException e) {      // e ist effektiv final
    throw new ImportFailedException("Import fehlgeschlagen: " + url, e);
}
```

Die Alternativen dürfen **nicht** in Vererbungsbeziehung stehen (`IOException | FileNotFoundException` ist ein Compilefehler). Reihenfolge bei mehreren `catch`-Blöcken: **spezifisch vor allgemein**, sonst „exception has already been caught“.

### try-with-resources und AutoCloseable

```java
try (var connection = dataSource.getConnection();
     var statement  = connection.prepareStatement(SQL)) {     // umgekehrte Reihenfolge beim Schließen
    return statement.executeQuery();
} catch (SQLException e) {
    throw new DataAccessException("Query fehlgeschlagen", e);
}
```

Eigene Ressource: `class Report implements AutoCloseable { public void close() { … } }`. Seit Java 9 darf auch eine bereits effektiv finale Variable in den Kopf: `try (scanner) { … }`.

### Suppressed Exceptions

Wirft der `try`-Block *und* `close()`, gewinnt die Exception aus dem `try`-Block; die aus `close()` hängt als **suppressed** daran:

```java
try {
    doWork();
} catch (Exception e) {
    for (Throwable suppressed : e.getSuppressed()) {
        log.warn("Beim Schließen: {}", suppressed.getMessage());
    }
}
```

Genau deshalb ist try-with-resources besser als manuelles `finally { close(); }` – dort verschluckt die `close()`-Exception die eigentliche Ursache.

### Eigene Exceptions und Chaining

```java
class UserNotFoundException extends RuntimeException {
    private final Long userId;

    UserNotFoundException(Long userId) {
        super("User nicht gefunden: " + userId);
        this.userId = userId;
    }

    Long userId() { return userId; }
}

class ImportFailedException extends RuntimeException {
    ImportFailedException(String message, Throwable cause) {
        super(message, cause);                 // ← cause NIE weglassen
    }
}
```

Faustregeln: Endung `Exception`, Message enthält die relevanten Werte (aber **keine** Passwörter/Tokens), fachliche Daten als Felder statt im String-Parsing.

### Fail Fast: IllegalArgument vs. IllegalState

```java
void transfer(Account from, Account to, BigDecimal amount) {
    Objects.requireNonNull(from, "from");
    if (amount.signum() <= 0) {
        throw new IllegalArgumentException("amount muss > 0 sein, war: " + amount);
    }
    if (!from.isOpen()) {
        throw new IllegalStateException("Konto ist geschlossen: " + from.iban());
    }
    ...
}
```

- `IllegalArgumentException` – **das Argument** ist falsch (Schuld des Aufrufers).
- `IllegalStateException` – das **Objekt** ist im falschen Zustand für diesen Aufruf.
- `NullPointerException` bewusst über `Objects.requireNonNull(x, "name")` – dann mit Namen statt „null“.

### Optional vs. Exception

```java
Optional<User> findById(Long id);        // „kann legitim fehlen“ – Suchen
User getById(Long id);                   // „muss existieren“ – wirft UserNotFoundException

User user = repository.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));
```

Regel: Erwarteter Normalfall → `Optional`. Vertragsbruch oder Ausnahmesituation → Exception. Exceptions sind teuer (Stacktrace-Erzeugung) und nicht für Kontrollfluss gedacht.
### Übersetzung an der Schicht-Grenze (Spring)

```java
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    ProblemDetail handleNotFound(UserNotFoundException e) {
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        problem.setTitle("User nicht gefunden");
        problem.setProperty("userId", e.userId());
        return problem;
    }
}
```

`ProblemDetail` (RFC 7807) ist seit Spring 6 der Standard. Technische Details (SQL, Stacktrace) gehören ins Log, **nicht** in die Response.

### Exceptions in Streams und Lambdas

```java
// Wrapping: im Lambda fangen und in unchecked übersetzen
List<String> contents = paths.stream()
    .map(path -> {
        try { return Files.readString(path); }
        catch (IOException e) { throw new UncheckedIOException(e); }
    })
    .toList();

// Sauberer: eigene Methode mit dem try/catch, Stream bleibt lesbar
List<String> contents2 = paths.stream().map(this::readSafely).toList();
```

## Typische Use Cases

- Repository liefert `Optional`, Service übersetzt in `XyzNotFoundException`.
- Validierung an der API-Grenze: `@Valid` + `MethodArgumentNotValidException` → 400.
- Externe Systeme: `IOException`/`RestClientException` in eine eigene `IntegrationException` mit `cause` übersetzen.
- Transaktionen: unchecked werfen, damit `@Transactional` zurückrollt (checked nur mit `rollbackFor`).
- Ressourcen (Stream, Connection, Lock) über try-with-resources.

## Clean-Code-Empfehlungen

- **Nie schlucken**: kein leerer `catch`-Block, kein `e.printStackTrace()`. Entweder behandeln, übersetzen oder weiterwerfen.
- Beim Loggen: `log.error("msg", e)` – die Exception als **letztes Argument**, nicht `e.getMessage()` allein.
- Nicht loggen **und** werfen (doppelte Einträge). Wer wirft, loggt nicht; wer final behandelt, loggt.
- `catch (Exception e)` nur ganz außen (Framework-Grenze), nie als Bequemlichkeit.
- Exceptions nicht für Kontrollfluss (`catch (NoSuchElementException)` statt `isEmpty()`).
- Eigene Exception erst, wenn sie anders behandelt wird als eine bestehende.
- Message soll im Log helfen: „Betrag muss > 0 sein, war: -5“ statt „invalid“ – aber ohne Passwörter/Tokens.

## Häufige Fehler

```java
// FALSCH: Cause verloren → Stacktrace endet im Nichts
catch (SQLException e) { throw new DataAccessException("DB-Fehler"); }
// RICHTIG
catch (SQLException e) { throw new DataAccessException("DB-Fehler", e); }
```

```java
// FALSCH: verschluckt alles, inklusive Bugs
try { process(); } catch (Exception e) { }
// RICHTIG
try { process(); } catch (IOException e) { throw new ImportFailedException("Import", e); }
```

```java
// FALSCH: return im finally verwirft Ergebnis UND Exception
int f() {
    try { throw new IllegalStateException("boom"); }
    finally { return 42; }                 // liefert 42, Exception ist weg
}
// RICHTIG: finally nur zum Aufräumen
```

```java
// FALSCH: manuelles close verschluckt die Ursache
InputStream in = open();
try { use(in); } finally { in.close(); }   // close()-Exception überschreibt die echte
// RICHTIG
try (InputStream in = open()) { use(in); }
```

```java
// FALSCH: InterruptedException schlucken
catch (InterruptedException e) { }
// RICHTIG: Interrupt-Flag wiederherstellen
catch (InterruptedException e) { Thread.currentThread().interrupt(); throw new IllegalStateException(e); }
```

## Interview-relevante Details

- **Checked vs. unchecked**: Checked erzwingt `throws` oder `catch` zur Compilezeit; unchecked erbt von `RuntimeException`. `Error` signalisiert JVM-Probleme und wird nicht gefangen.
- **Warum bevorzugen moderne Frameworks unchecked?** Checked Exceptions verschmutzen Signaturen über viele Schichten und sind in Lambdas nicht durchreichbar. Spring übersetzt `SQLException` in `DataAccessException`.
- **`@Transactional` Rollback-Regel**: Standardmäßig nur bei unchecked; checked brauchen `@Transactional(rollbackFor = …)`.
- **try-with-resources vs. finally**: Schließen in umgekehrter Deklarationsreihenfolge, Exceptions aus `close()` werden **suppressed** statt zu überschreiben.
- **Exception-Chaining**: Konstruktor mit `cause` bzw. `initCause`; im Stacktrace erscheint „Caused by:“.
- **Kosten**: Der Stacktrace wird beim Erzeugen (`fillInStackTrace`) gefüllt – teuer, deshalb kein Kontrollfluss.
- **Überschreiben**: Eine überschreibende Methode darf keine **breiteren** checked Exceptions deklarieren, nur gleiche, engere oder gar keine. Unchecked immer.

## Zusammenfassung

```text
Error       → nicht fangen
Checked     → Umwelt, Aufrufer kann reagieren
Unchecked   → Bug / Vertragsbruch (Standard im Spring-Backend)

Fail Fast:  requireNonNull, IllegalArgument (Argument), IllegalState (Objektzustand)
Optional    für "darf fehlen", Exception für "darf nicht passieren"
try-with-resources statt finally-close (suppressed statt verschluckt)
Immer mit cause weiterwerfen, nie leer fangen, nie loggen UND werfen
@RestControllerAdvice + ProblemDetail übersetzt Domain → HTTP
```
