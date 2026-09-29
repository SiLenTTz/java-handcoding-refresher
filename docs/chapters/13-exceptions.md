# Kapitel 13 – Exceptions

## Custom Exception

```java
public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(Long id) {
        super("User not found: " + id);
    }
}
```

## Verwendung

```java
return repository.findById(id)
    .orElseThrow(() ->
        new UserNotFoundException(id)
    );
```

## Global Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handle(
            UserNotFoundException exception) {

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(exception.getMessage());
    }
}
```

## Nicht machen

```java
try {

} catch (Exception e) {

}
```

Exceptions nicht verschlucken.
