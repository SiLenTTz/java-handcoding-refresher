# Kapitel 24 – Architekturübung

## Aufgabe

Baue eine kleine Product API.

## Funktionen

```text
createProduct
getProduct
getProducts
updateProduct
deleteProduct
```

## Anforderungen

- DTO Mapping
- Validation
- Exception Handling
- Pagination
- Sorting
- Filtering
- Tests

## Zielstruktur

```text
controller
dto
mapper
service
repository
entity
exception
```

## Zusatz

Implementiere:

```java
Slice<ProductResponse>
```

für eine "Load more"-API.

Implementiere zusätzlich:

```java
Page<ProductResponse>
```

für klassische Pagination.

Erkläre, warum du wann welche Variante nutzt.
