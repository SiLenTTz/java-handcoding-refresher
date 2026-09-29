# Kapitel 17 – Controller / Service / Repository

## Controller

Controller bleibt dünn:

```java
@PostMapping
public UserDto create(
        @RequestBody CreateUserRequest request) {

    return userService.create(request);
}
```

## Service

```java
@Service
public class UserService {

    public UserDto create(CreateUserRequest request) {

        UserEntity entity =
            mapper.toEntity(request);

        UserEntity saved =
            repository.save(entity);

        return mapper.toDto(saved);
    }
}
```

## Verantwortlichkeiten

### Controller

- HTTP
- Request / Response
- Status Codes

### Service

- Business Logic
- Transaktionen
- Orchestrierung

### Repository

- Persistence
- Queries

### Mapper

- Objekttransformation
