# Kapitel 08 – DTO / Entity / Mapper

## Typische Struktur

```text
Controller
   ↓
DTO
   ↓
Service
   ↓
Domain / Entity
   ↓
Repository
   ↓
Database
```

## Entity

```java
@Entity
public class UserEntity {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String email;
}
```

## DTO

```java
public record UserDto(
    Long id,
    String name,
    String email
) {}
```

## Request DTO

```java
public record CreateUserRequest(
    String name,
    String email
) {}
```

## Response DTO

```java
public record UserResponse(
    Long id,
    String name
) {}
```

## Mapper

```java
@Component
public class UserMapper {

    public UserDto toDto(UserEntity entity) {
        return new UserDto(
            entity.getId(),
            entity.getName(),
            entity.getEmail()
        );
    }
}
```

## Warum Entity nicht direkt zurückgeben?

- API und DB werden gekoppelt
- sensible Felder können geleakt werden
- Lazy-Loading-Probleme
- Versionierung wird schwieriger
- Persistence-Modell wird nach außen sichtbar
