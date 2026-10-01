# Kapitel 06 – Optional

## Mental Model

```text
Optional<T>  =  Container mit 0 oder 1 Element

Optional.of(x)          → [x]        (NPE, wenn x null ist)
Optional.ofNullable(x)  → [x] | []   (null-tolerant)
Optional.empty()        → []

map(f)      [x] → [f(x)]        [] → []
flatMap(f)  [x] → f(x)          [] → []      (f liefert selbst Optional)
filter(p)   [x] → [x] | []      [] → []
orElse..    [x] → x             [] → Fallback / Exception
```

`Optional` ist ein **Rückgabetyp**, der sagt: „hier kann legitim nichts sein“. Es ist kein
Null-Ersatz für alles und keine Universal-NPE-Bremse. Solange der Wert im Container bleibt, muss
niemand `null` prüfen – gerechnet wird mit `map`/`flatMap`, ausgepackt wird ganz am Ende.

## Syntax / API

### Erzeugen

```java
Optional<User> a = Optional.of(user);          // user darf NICHT null sein → sonst NPE
Optional<User> b = Optional.ofNullable(user);  // null → Optional.empty()
Optional<User> c = Optional.empty();

// Faustregel: kommt der Wert aus fremdem/altem Code → ofNullable
Optional<String> header = Optional.ofNullable(request.getHeader("X-Trace-Id"));
```

`Optional.of(null)` ist eine sofortige `NullPointerException` – das ist Absicht, es dokumentiert
„hier darf nie null stehen“.

### map, flatMap, filter

```java
Optional<String> name = repository.findById(id)
    .map(User::name);                       // Function<User, String>      → Optional<String>

Optional<String> street = repository.findById(id)
    .flatMap(User::address)                 // Function<User, Optional<Address>>
    .map(Address::street);

Optional<User> activeAdult = repository.findById(id)
    .filter(User::active)
    .filter(user -> user.age() >= 18);      // Predicate nicht erfüllt → empty
```

Merksatz: liefert die Funktion selbst ein `Optional`, brauchst du `flatMap` – sonst bekommst du
`Optional<Optional<Address>>`.

`map` ist zusätzlich null-tolerant: Gibt der Mapper `null` zurück, ist das Ergebnis `empty`.

```java
Optional<String> nick = Optional.of(user).map(User::nickname);  // nickname == null → empty
```

### Auspacken: orElse / orElseGet / orElseThrow

```java
String name = maybeName.orElse("Unbekannt");                 // Fallback IMMER ausgewertet
String name = maybeName.orElseGet(() -> loadDefaultName());  // Supplier, nur bei empty
User user  = maybeUser.orElseThrow(() -> new UserNotFoundException(id));
User user  = maybeUser.orElseThrow();                        // NoSuchElementException (Java 10)
```

Der wichtigste Unterschied:

```java
// orElse wertet den Ausdruck IMMER aus – auch wenn ein Wert da ist
return maybeUser.orElse(expensiveDefault());         // expensiveDefault() läuft immer
return maybeUser.orElseGet(this::expensiveDefault);  // läuft nur bei empty
```

`orElse` nur für **billige Konstanten** (`""`, `0`, `List.of()`), sonst `orElseGet`.

### ifPresent / ifPresentOrElse

```java
maybeUser.ifPresent(user -> mailer.sendWelcome(user));
maybeUser.ifPresent(mailer::sendWelcome);

maybeUser.ifPresentOrElse(
    mailer::sendWelcome,                                   // Consumer<User>
    () -> log.warn("Kein User mit id {}", id));            // Runnable
```

Beides sind **Seiteneffekt**-Methoden (Rückgabetyp `void`). Willst du einen Wert berechnen, nimm
`map` + `orElse…`.

### or, stream, isPresent / isEmpty

```java
Optional<Config> config = fromEnv()
    .or(() -> fromFile())            // Supplier<Optional<Config>>, erst bei empty (Java 9)
    .or(() -> Optional.of(Config.defaults()));

List<Address> addresses = users.stream()
    .map(User::address)              // Stream<Optional<Address>>
    .flatMap(Optional::stream)       // leere fallen raus (Java 9)
    .toList();

if (maybeUser.isEmpty()) { ... }     // Java 11, lesbarer als !isPresent()
```

`Optional::stream` ist der saubere Weg, „alle vorhandenen Werte“ aus einem Stream von Optionals zu
holen – ohne `filter(Optional::isPresent).map(Optional::get)`.

### Typisches Service-Muster mit Spring Data

```java
public UserResponse getUser(Long id) {
    return userRepository.findById(id)          // Optional<UserEntity>
        .map(mapper::toResponse)
        .orElseThrow(() -> new UserNotFoundException(id));
}

@Transactional
public void deactivate(Long id) {
    userRepository.findById(id)
        .ifPresentOrElse(
            UserEntity::deactivate,
            () -> { throw new UserNotFoundException(id); });
}
```

Spring Data unterstützt `Optional` direkt als Rückgabetyp von Derived Queries:

```java
Optional<UserEntity> findByEmail(String email);      // gut
UserEntity findByEmail(String email);                // liefert null – vermeiden
List<UserEntity> findAllByStatus(Status status);     // Collections NIE in Optional wrappen
```

### Primitive Varianten

```java
OptionalInt    max = IntStream.of(1, 2, 3).max();
OptionalDouble avg = users.stream().mapToInt(User::age).average();

double value = avg.orElse(0.0);
```

Diese Typen haben **kein** `map`/`flatMap` – bei Bedarf `.stream().boxed()` oder direkt auspacken.

## Typische Use Cases

- Repository-Lookups: `findById`, `findByEmail` → `Optional<Entity>`.
- Konfiguration mit Fallback-Kette: `.or(() -> …).orElseGet(…)`.
- Optionale Beziehungen im Domain-Modell: `Optional<Address> address()` als **Methode**, nicht als Feld.
- Parsen/Konvertieren, das fehlschlagen darf: `Optional<Integer> parseInt(String s)`.
- Header, Query-Parameter, Umgebungsvariablen aus fremden APIs: `Optional.ofNullable(...)`.

## Clean-Code-Empfehlungen

- `Optional` als **Rückgabetyp**, nicht als Feld, Parameter oder Collection-Element.
- Kein `get()`. Wenn wirklich nötig: `orElseThrow()` – dieselbe Semantik, aber ehrlich benannt.
- Kein `isPresent()` + `get()`-Doppel. Das ist nur ein umständliches `if (x != null)`.
- Nie `Optional<List<T>>` zurückgeben – eine leere Liste ist bereits „nichts“.
- Nie `null` statt `Optional.empty()` zurückgeben. Ein `null`-Optional ist der schlimmste Fall.
- `orElse` für Konstanten, `orElseGet` für alles, was Arbeit kostet.
- Kette flach halten: mehr als 3–4 Glieder → Methode extrahieren oder umbauen.
- Bei `orElseThrow` eine **fachliche** Exception werfen, nicht `RuntimeException`.

## Häufige Fehler

```java
// FALSCH: isPresent + get
if (maybeUser.isPresent()) {
    return maybeUser.get().name();
}
return "Unbekannt";
// RICHTIG
return maybeUser.map(User::name).orElse("Unbekannt");

// FALSCH: orElse mit teurem Aufruf – läuft IMMER
User user = maybeUser.orElse(repository.createDefault());
// RICHTIG
User user = maybeUser.orElseGet(repository::createDefault);

// FALSCH: of statt ofNullable bei potentiell null
return Optional.of(map.get(key));            // NPE, wenn key fehlt
// RICHTIG
return Optional.ofNullable(map.get(key));

// FALSCH: map liefert Optional → verschachtelt
Optional<Optional<Address>> nested = maybeUser.map(User::address);
// RICHTIG
Optional<Address> address = maybeUser.flatMap(User::address);

// FALSCH: Optional als Feld / Parameter
record User(Long id, Optional<String> nickname) {}     // nicht serialisierbar, umständlich
void createUser(String name, Optional<String> nickname) {}
// RICHTIG: nullable Feld + Optional-Accessor bzw. Überladung
record User(Long id, String nickname) {
    Optional<String> nickname() { return Optional.ofNullable(nickname); }
}

// FALSCH: Optional um eine Collection
Optional<List<User>> findActive();
// RICHTIG
List<User> findActive();                     // leere Liste = kein Treffer

// FALSCH: null zurückgeben
Optional<User> find(Long id) { return null; }
// RICHTIG
Optional<User> find(Long id) { return Optional.empty(); }

// FALSCH: umständlich Optionals aus Stream filtern
users.stream().map(User::address).filter(Optional::isPresent).map(Optional::get).toList();
// RICHTIG
users.stream().map(User::address).flatMap(Optional::stream).toList();
```

## Interview-relevante Details

- `Optional` ist **nicht** `Serializable` – deshalb kein Entity-/DTO-Feld.
- `Optional.of(null)` wirft sofort `NullPointerException`; `ofNullable` ist die tolerante Variante.
- `orElse(x)` wertet `x` immer aus, `orElseGet(sup)` nur bei `empty` – klassische Fangfrage.
- `map` gibt `empty` zurück, wenn der Mapper `null` liefert – `flatMap` erwartet zwingend ein `Optional`.
- `get()` ist seit Java 10 faktisch abgelöst; `orElseThrow()` ist die empfohlene Form.
- `Optional::stream` (Java 9), `or` (Java 9), `ifPresentOrElse` (Java 9), `isEmpty` (Java 11).
- `equals` auf `Optional` vergleicht die Inhalte: `Optional.of("a").equals(Optional.of("a"))` → `true`.
- Optional ist **kein** Ersatz für Validierung und kein Kontrollfluss-Ersatz für Exceptions.
- Spring Data erlaubt `Optional<T>`, `T` und `List<T>` als Query-Rückgabetypen – `Optional<T>` ist der explizite.

## Zusammenfassung

- `Optional` modelliert „0 oder 1“ als Rückgabetyp – nicht als Feld, Parameter oder Collection-Element.
- Erzeugen: `of` (nie null), `ofNullable` (null-tolerant), `empty`.
- Rechnen im Container: `map`, `flatMap` (Mapper liefert Optional), `filter`.
- Auspacken: `orElse` (Konstante), `orElseGet` (teuer), `orElseThrow` (fachliche Exception).
- Seiteneffekte: `ifPresent`, `ifPresentOrElse`. Fallback-Ketten: `or`.
- `Optional::stream` statt `filter(isPresent).map(get)`.
- `get()` und `isPresent()+get()` vermeiden; `Optional<List<T>>` und `return null` sind Anti-Patterns.
