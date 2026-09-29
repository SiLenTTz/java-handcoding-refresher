# Kapitel 22 – Testing

## Arrange / Act / Assert

```java
@Test
void shouldReturnActiveUsers() {

    // Arrange
    User user = createActiveUser();

    // Act
    boolean result = user.isActive();

    // Assert
    assertThat(result).isTrue();
}
```

## Mockito

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @Mock
    private UserMapper mapper;

    @InjectMocks
    private UserService service;
}
```

## Was testen?

Vor allem:

- Business Logic
- Edge Cases
- Validation
- Error Handling
- relevante Mappings

Nicht zwanghaft triviale Getter testen.
