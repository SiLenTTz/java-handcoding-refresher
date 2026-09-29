# Kapitel 16 – Spring Dependency Injection

## Constructor Injection

Bevorzugt:

```java
@Service
public class UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    public UserService(
        UserRepository repository,
        UserMapper mapper
    ) {
        this.repository = repository;
        this.mapper = mapper;
    }
}
```

## Field Injection vermeiden

```java
@Autowired
private UserRepository repository;
```

Nachteile:

- versteckte Dependencies
- schlechter testbar
- `final` nicht möglich
- Objekt kann ohne gültige Dependencies erzeugt werden
