# Kapitel 14 – Clean Code

## Mental Model

Clean Code optimiert nicht auf Kürze, sondern auf **geringe kognitive Last** beim Lesen. Code wird ungefähr zehnmal öfter gelesen als geschrieben – der Leser ist die Zielgruppe, nicht der Compiler.

```text
Frage bei jeder Zeile:  Wie viel muss ich im Kopf behalten, um sie zu verstehen?

  Name sagt WAS         → kein Nachschlagen nötig
  Funktion tut EINS     → kein Kontextwechsel mitten drin
  eine Abstraktionsebene→ kein Zoomen zwischen Fachlogik und Bit-Fummelei
  früh raus (Guards)    → keine Klammer-Pyramide im Kopf
  unveränderlich        → kein "wer ändert das wann?"
```

Clean Code bedeutet **nicht**: möglichst wenige Zeichen, möglichst clevere Streams, möglichst viele Interfaces.

## Naming

```java
List<User> l = getD(1);      // FALSCH
int d;                       // elapsed days? discount?

List<User> activeUsers = findActiveUsers(tenantId);   // RICHTIG
int elapsedDays;
boolean eligibleForDiscount;
```

Regeln:

- Klassen = **Substantive** (`PriceCalculator`), Methoden = **Verben** (`calculateTotal`).
- Booleans als Frage: `isActive()`, `hasPermission()`, `canDelete()`, `shouldRetry()`.
- Länge des Namens ∝ Größe des Scopes: `i` in einer 3-Zeilen-Schleife ist okay, `d` als Feld nicht.
- Keine Typ-Suffixe (`userList` → `users`), keine Abkürzungen außer etablierten (`id`, `url`, `dto`).
- Ein Begriff pro Konzept: nicht `fetch`, `get`, `retrieve`, `load` gemischt für dasselbe.

## Funktionen

### Größe und ein Zweck

```java
public void processOrder(Order order) {
    validate(order);
    calculatePrice(order);
    reserveInventory(order);
    persist(order);
    notifyCustomer(order);
}
```

Richtwert: eine Methode passt auf den Bildschirm (≈ 5–20 Zeilen). Wenn du einen Kommentar über einen Block schreiben willst („// Preis berechnen“), ist das die Einladung zu **Extract Method**.

### Single Level of Abstraction

```java
// FALSCH: mischt Use-Case-Sprache und Byte-Fummelei
void export(Report report) {
    validate(report);
    var buffer = new StringBuilder();
    for (int i = 0; i < report.rows().size(); i++) {
        buffer.append(report.rows().get(i).join(";")).append('\n');
    }
    writer.write(buffer.toString());
}

// RICHTIG: eine Ebene pro Methode
void export(Report report) {
    validate(report);
    write(toCsv(report));   // toCsv kapselt die Schleife
}
```

### Command-Query-Separation

Eine Methode **tut etwas** (Command, `void`) oder **beantwortet etwas** (Query, ohne Seiteneffekt) – nicht beides.

```java
boolean setIfValid(String name);   // FALSCH: prüft und ändert

boolean isValid(String name);      // RICHTIG
void rename(String name);
```

### Parameter

```java
report.render(true, false);          // FALSCH: Boolean-Trap, am Aufrufort unlesbar

report.renderDetailed();             // RICHTIG: getrennte Methoden …
report.render(RenderMode.DETAILED);  // … oder ein Enum
```

Ab drei zusammengehörigen Parametern: **Introduce Parameter Object** (`record OrderSearchCriteria(...)`). Keine `null`-Parameter als „nicht gesetzt“.

### Guard Clauses statt Verschachtelung

```java
// FALSCH
if (user != null) {
    if (user.isActive()) {
        if (user.hasPermission(DELETE)) {
            execute();
        }
    }
}

// RICHTIG
Objects.requireNonNull(user, "user");
if (!user.isActive()) return;
if (!user.hasPermission(DELETE)) return;
execute();
```

Sonderfälle zuerst und raus – der Rest der Methode beschreibt den Normalfall auf Einrückungsebene 1.

## Magic Numbers und Konstanten

```java
if (order.total() > 100) fee = order.total() * 0.1;    // FALSCH
if (status == 3) { ... }

private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("100.00");
private static final BigDecimal SERVICE_FEE_RATE = new BigDecimal("0.10");
if (status == OrderStatus.SHIPPED) { ... }             // RICHTIG
```

`0`, `1` und `""` als offensichtliche Basiswerte sind okay. Alles mit fachlicher Bedeutung bekommt einen Namen – am besten ein Enum statt eines int-Codes.

## Kommentare

```java
// FALSCH: erklärt WAS (steht schon da) oder lügt nach dem nächsten Refactoring
// erhöhe counter um 1
counter++;

// RICHTIG: erklärt WARUM
// Fachbereich verlangt kaufmännische Rundung, nicht HALF_EVEN (siehe TICKET-4711)
return amount.setScale(2, RoundingMode.HALF_UP);
```

Gut: Begründungen, Verweise auf Spezifikationen/Tickets, Warnungen vor Fallstricken, `@param`/`@return` in öffentlichen APIs. Schlecht: auskommentierter Code (dafür gibt es Git), Changelogs im Header, Redundanz.

## Null-Handling

```java
// FALSCH
List<Order> orders() { return orders == null ? null : orders; }
User find(Long id) { ...; return null; }

// RICHTIG
List<Order> orders() { return List.copyOf(orders); }   // nie null
Optional<User> findById(Long id) { ... }               // "darf fehlen"
```

- Collections: leere Collection statt `null`.
- „Kann fehlen“: `Optional` als **Rückgabetyp** – nicht als Feld, Parameter oder in Collections.
- Eingaben früh prüfen: `Objects.requireNonNull(x, "x")`.

## Unveränderlichkeit und Sichtbarkeit

```java
record Money(BigDecimal amount, Currency currency) {
    Money { Objects.requireNonNull(amount, "amount"); }
    Money plus(Money other) { return new Money(amount.add(other.amount), currency); }
}

class OrderService {
    private final OrderRepository repository;      // final, private
    OrderService(OrderRepository repository) { this.repository = repository; }
}
```

- Felder `private final`, Konstruktor-Injection statt Setter; defensive Kopien bei mutierbaren Collections (`List.copyOf`).
- Methoden so eng wie möglich sichtbar: `private` → package-private → `public`. `public` ist eine Zusage.

## Struktur und Formatierung

```text
com.example.shop
 ├── order      OrderController, OrderService, OrderRepository, Order, OrderDto
 ├── payment
 └── shipping                 ← nach Fachlichkeit schneiden
```

Nicht nach technischen Schichten (`controller/`, `service/`, `dto/`) über die ganze App – das streut jedes Feature über fünf Pakete. Weiter: Reihenfolge in der Klasse Konstanten → Felder → Konstruktor → öffentliche Methoden → private Helfer („Zeitungsartikel“), Helfer direkt unter dem Aufrufer, Formatierung per Formatter/Spotless im Build, eine Datei = ein Konzept.

## Prinzipien im Alltag

- **Boy-Scout-Rule**: Die Stelle, die du anfasst, etwas sauberer hinterlassen – nicht den ganzen Wald umgraben.
- **DRY**: Wissen nicht duplizieren. Zwei ähnlich *aussehende* Stellen mit verschiedenen Änderungsgründen sind **keine** Duplikation – erst beim dritten echten Vorkommen abstrahieren.
- **YAGNI**: Keine Flexibilität für hypothetische Anforderungen (kein Interface mit einer Implementierung „für später“).
- **KISS**: Die einfachste Lösung, die das Problem löst – eine Schleife ist manchmal lesbarer als ein Stream mit drei `flatMap`.
- **Least Astonishment**: `getX()` darf keine DB abfragen, `equals` keine Exception werfen.

## Code-Smell-Katalog

| Smell | Symptom | Gegenmittel |
|---|---|---|
| Long Method | > 20 Zeilen, Blockkommentare | Extract Method |
| Long Parameter List | > 3 Parameter | Parameter Object |
| God Class | „Manager“, „Util“, 1000 Zeilen | Extract Class nach Verantwortung |
| Feature Envy | Methode nutzt nur fremde Daten | Move Method |
| Primitive Obsession | `String status`, `double price` | Enum, Value Object, `BigDecimal` |
| Data Clump | dieselben 3 Parameter überall | Record |
| Speculative Generality | Interface mit einer Impl | YAGNI, inline |
| Boolean Trap | `render(true, false)` | Enum / getrennte Methoden |
| Magic Number | `if (x > 100)` | benannte Konstante |
| Nested Conditionals | 4 Ebenen Einrückung | Guard Clauses |

## Häufige Fehler

```java
// FALSCH: Kommentar statt Name, Query mit Seiteneffekt, null als "nichts gefunden"
// prüft, ob der User löschen darf
if (u.getR() == 2 && u.getS()) { ... }
boolean isValid(Order order) { order.setChecked(true); return order.total() != null; }
List<Order> findAll() { return null; }

// RICHTIG
if (user.canDelete()) { ... }
boolean isValid(Order order) { return order.total() != null; }
List<Order> findAll() { return List.of(); }
```

```java
// FALSCH: "clever"
return u.getO().stream().filter(o -> o.getS() == 1).map(o -> o.getT()).reduce(BigDecimal.ZERO, BigDecimal::add);
// RICHTIG: benannte Methode, benannte Schritte
BigDecimal openTotal(User user) {
    return user.orders().stream()
        .filter(Order::isOpen)
        .map(Order::total)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
}
```

## Interview-relevante Details

- **Was ist Clean Code für dich?** Antwort mit Kriterium, nicht mit Gefühl: „Ein neuer Kollege versteht die Methode ohne Rückfrage und kann sie ändern, ohne Angst zu haben.“
- **Wann ist ein Kommentar gut?** Wenn er ein *Warum* erklärt, das aus dem Code nicht hervorgeht.
- **DRY vs. voreilige Abstraktion**: Duplikation ist billiger als die falsche Abstraktion – Rule of Three.
- **Command-Query-Separation** mit Beispiel (`boolean setIfValid`) erklären.
- **Warum Boolean-Parameter vermeiden?** Am Aufrufort verliert das Argument seine Bedeutung; meist stecken zwei Methoden darin.
- **Warum `final` und Immutability?** Weniger Zustände = weniger Fälle im Kopf; thread-safe ohne Synchronisation.
- **Wie misst man Clean Code?** Nicht per Tool allein: Code-Review, Änderungsaufwand, Bug-Rate. Metriken sind Indikatoren, kein Ziel.

## Zusammenfassung

```text
Namen  : Klasse=Substantiv, Methode=Verb, Boolean=Frage, Länge ∝ Scope
Methode: eine Aufgabe, eine Abstraktionsebene, Guard Clauses, ≤ 3 Parameter
CQS    : ändern ODER antworten – nie beides
Werte  : Konstanten statt Magic Numbers, Enum statt int-Code, BigDecimal für Geld
Null   : leere Collection statt null, Optional nur als Rückgabetyp
Zustand: private final, Konstruktor-Injection, Records, defensive Kopien
Struktur: nach Fachlichkeit paketieren, Helfer unter dem Aufrufer
Haltung: Boy-Scout-Rule, KISS, YAGNI, Rule of Three vor jeder Abstraktion
```
