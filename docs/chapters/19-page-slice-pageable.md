# Kapitel 19 – Page / Slice / Pageable

## Page

```java
Page<UserEntity> users =
    repository.findAll(pageable);
```

Eine `Page` kennt typischerweise:

- Content
- Page Number
- Page Size
- Total Elements
- Total Pages

Oft ist dafür ein zusätzlicher `COUNT(*)` nötig.

## Slice

```java
Slice<UserEntity> users =
    repository.findByActiveTrue(pageable);
```

Eine `Slice` kennt:

- Content
- `hasNext`
- `hasPrevious`
- Seitennummer

Aber typischerweise nicht:

- `totalElements`
- `totalPages`

## Wann Slice?

Gut für:

- Load More
- Infinite Scroll
- Batch Processing
- große Datenmengen

## Wann Page?

Gut für:

- "Seite 2 von 30"
- Gesamtanzahl Ergebnisse
- klassische Pagination

## Pageable

```java
Pageable pageable =
    PageRequest.of(
        0,
        20,
        Sort.by("createdAt").descending()
    );
```

## Mapping

```java
Slice<UserDto> result =
    repository.findByActiveTrue(pageable)
        .map(userMapper::toDto);
```

## Wichtiges Mental Model

```text
Container<A>.map(A -> B)
=
Container<B>
```

Das gilt konzeptionell ähnlich für:

- `Stream`
- `Optional`
- `Page`
- `Slice`
