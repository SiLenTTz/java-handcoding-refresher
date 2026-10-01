# Kapitel 09 – OOP

## Mental Model

Ein Objekt = **Zustand + Verhalten + Invarianten**. Die Klasse garantiert, dass ihr Zustand nie ungültig wird – von außen gibt es nur Operationen, keine Felder.

Die vier Säulen:

| Konzept | Kernfrage | Java-Werkzeug |
|---|---|---|
| Encapsulation | Wer darf den Zustand ändern? | `private`, Methoden mit Validierung |
| Abstraction | Was muss der Aufrufer wissen? | `interface`, `abstract class` |
| Inheritance | Ist B wirklich ein A? | `extends`, `sealed` |
| Polymorphism | Welche Implementierung läuft? | Dynamic Dispatch, `@Override` |

Faustregel: **Tell, don't ask** – sag dem Objekt, was es tun soll, statt seine Daten herauszuholen und außen zu entscheiden.

## Encapsulation

```java
class BankAccount {
    private final String iban;          // unveränderlich
    private BigDecimal balance = BigDecimal.ZERO;

    BankAccount(String iban) {
        this.iban = Objects.requireNonNull(iban, "iban");
    }

    void deposit(BigDecimal amount) {
        requirePositive(amount);
        balance = balance.add(amount);
    }

    void withdraw(BigDecimal amount) {
        requirePositive(amount);
        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }
        balance = balance.subtract(amount);
    }

    BigDecimal balance() { return balance; }   // kein Setter!

    private static void requirePositive(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}
```

- Felder `private`, möglichst `final`.
- Kein Setter pro Feld – stattdessen fachliche Methoden (`deposit`, `changePrice`, `deactivate`).
- Mutable Collections nie direkt herausgeben: `return List.copyOf(items);`

## Interface vs. abstract class

```java
interface PaymentMethod {
    PaymentResult pay(BigDecimal amount);

    default boolean supportsRefund() { return false; }   // default method
    static PaymentMethod noop() { return a -> PaymentResult.ok(); }
}

abstract class AbstractExporter {
    private final Clock clock;                 // Zustand erlaubt
    protected AbstractExporter(Clock clock) { this.clock = clock; }
    abstract String format(Report report);     // Subklasse füllt Lücke
}
```

| | `interface` | `abstract class` |
|---|---|---|
| Mehrfach implementierbar | ja | nein (nur ein `extends`) |
| Instanzfelder | nein (nur `static final`) | ja |
| Konstruktor | nein | ja |
| Typischer Einsatz | Rolle/Fähigkeit, Vertrag | gemeinsame Basis mit Zustand |

## Inheritance & Polymorphism

```java
abstract class Shape {
    abstract double area();
    @Override public String toString() { return getClass().getSimpleName() + "(" + area() + ")"; }
}

class Circle extends Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    @Override double area() { return Math.PI * r * r; }
}

Shape s = new Circle(2);   // statischer Typ Shape, dynamischer Typ Circle
s.area();                  // Circle.area() – Dynamic Dispatch zur Laufzeit
```

- **Overriding** (Laufzeit): gleiche Signatur in Subklasse. Immer `@Override` schreiben.
- **Overloading** (Compilezeit): gleicher Name, andere Parameter. Auswahl nach **statischem** Typ.
- `super(...)` muss (bis Java 21) die erste Anweisung im Konstruktor sein.
- `static`- und `private`-Methoden werden nicht überschrieben, sondern verdeckt.
- Felder sind nicht polymorph.

## Sealed Types + Pattern Matching (Java 17/21)

Geschlossene Hierarchien, die der Compiler kennt:

```java
sealed interface Shape permits Circle, Rectangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}

static double area(Shape shape) {
    return switch (shape) {                       // exhaustive, kein default nötig
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle(double w, double h) -> w * h;   // Record Pattern
    };
}
```

Subtypen einer `sealed`-Hierarchie müssen `final`, `sealed` oder `non-sealed` sein (Records sind implizit `final`).

## Composition over Inheritance

```java
// Schlecht: erbt 30 Methoden, die die Invariante brechen (add, remove ohne Zählung)
class CountingList<E> extends ArrayList<E> { ... }

// Gut: Komposition + Delegation
class CheckoutService {
    private final PaymentMethod payment;
    private final InventoryService inventory;

    CheckoutService(PaymentMethod payment, InventoryService inventory) {
        this.payment = payment;
        this.inventory = inventory;
    }
}
```

Vererbung nur bei echter **is-a**-Beziehung, die auch das Verhalten (LSP) erfüllt. Sonst: **has-a**.

## equals / hashCode / toString

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Money other)) return false;     // Pattern Matching instanceof
    return amount.compareTo(other.amount) == 0 && currency.equals(other.currency);
}

@Override
public int hashCode() {
    return Objects.hash(amount.stripTrailingZeros(), currency);
}
```

Vertrag: `a.equals(b)` ⇒ `a.hashCode() == b.hashCode()`. Wer `equals` überschreibt, muss `hashCode` überschreiben. Records generieren beides.

## Typische Use Cases

- Domain-Objekte mit Invarianten (`Order`, `Account`, `Product`).
- Interfaces als Nahtstellen für austauschbare Implementierungen (Payment, Notification, Storage).
- `sealed interface` + Records für fachliche Varianten (Zahlungsarten, Events, Ergebnisse).
- Abstract class für Template Method (gemeinsamer Ablauf, variable Schritte).

## Clean-Code-Empfehlungen

- Felder `private final`, Konstruktor validiert.
- Fachliche Methoden statt Setter; Methoden nach Absicht benennen.
- Interfaces klein und nach Rolle benennen (`PaymentMethod`, nicht `IPaymentService`).
- Vererbungstiefe flach halten (max. 1–2 Ebenen).
- `instanceof`-Kaskaden über offene Hierarchien meiden → Polymorphie oder `sealed` + `switch`.
- Klassen, die nicht für Vererbung gedacht sind: `final` (oder Record).

## Häufige Fehler

```java
// FALSCH: Getter gibt interne Liste heraus
List<Item> items() { return items; }
// RICHTIG
List<Item> items() { return List.copyOf(items); }
```

```java
// FALSCH: Overload statt Override (Parameter-Typ Object vergessen)
public boolean equals(Money other) { ... }
// RICHTIG
@Override public boolean equals(Object o) { ... }
```

```java
// FALSCH: überschreibbare Methode im Konstruktor aufrufen
abstract class Base { Base() { init(); } abstract void init(); }
// Subklasse sieht ihre Felder noch uninitialisiert (null/0)!
```

```java
// FALSCH: Anemic Model + Logik außerhalb
if (account.getBalance().compareTo(x) >= 0) account.setBalance(account.getBalance().subtract(x));
// RICHTIG
account.withdraw(x);
```

## Interview-relevante Details

- **Overloading vs. Overriding**: Compilezeit (statischer Typ der Argumente) vs. Laufzeit (dynamischer Typ des Empfängers).
- **Access Modifier**: `private` < package-private (kein Modifier) < `protected` (Package + Subklassen) < `public`.
- Overriding darf Sichtbarkeit nicht einschränken und keine breiteren checked Exceptions werfen; Rückgabetyp darf kovariant (spezieller) sein.
- **Diamond Problem** bei Default Methods: Implementiert eine Klasse zwei Interfaces mit gleicher Default-Methode, muss sie überschreiben (`A.super.m()` zum Delegieren).
- `final` Klasse: keine Subklasse; `final` Methode: kein Override; `final` Feld: einmal zuweisen.
- **Immutability**: `final` Klasse, `private final` Felder, keine Setter, defensive Kopien.
- Warum Composition over Inheritance? Vererbung koppelt an Implementierungsdetails der Basisklasse (Fragile Base Class).

## Zusammenfassung

- Objekt schützt seine Invarianten: private Felder, validierende fachliche Methoden.
- Interfaces für Rollen, abstract class für gemeinsame Basis mit Zustand.
- Polymorphie ersetzt `if/instanceof`-Ketten; `sealed` + Pattern Matching für geschlossene Varianten.
- Komposition bevorzugen; Vererbung nur bei echtem is-a inkl. Verhaltensvertrag.
- `equals` und `hashCode` immer gemeinsam – oder Record verwenden.
