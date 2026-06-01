# Module — Robust testing + GraalVM native

The full test matrix (unit + two integration profiles) and native-image build. Model: the `back-plaguie` test suite + `docs/test-structure-guide.md`.

## Two test philosophies
- **Unit** (`*Test.java`): `@ExtendWith(MockitoExtension.class)` — no Quarkus CDI boot, all deps `@Mock`/`@InjectMocks`. Fast; one per use case.
- **Integration** (`*IntegrationTest.java`): `@QuarkusTest` + H2 in MySQL-compat mode, Firebase mocked via `@InjectMock`, `FirebaseConfig` skipped (`@UnlessBuildProfile("test")`).

## Two integration profiles (the key distinction)
| Profile | Used by | Schema | Setup |
|---|---|---|---|
| `H2TestProfile` | REST-layer tests (`*ResourceIntegrationTest`) | recreate per run | drops/recreates each run |
| `UseCaseIntegrationTestProfile` | use-case tests | **persists across classes** | `@BeforeEach` `@Transactional` via Panache, NOT `import.sql` |

When a test method itself mutates the DB (e.g. `deleteAll()` in the body), annotate that method `@Transactional` too.

## ⚠️ Cross-test contamination rule (learned the hard way)
The `UseCaseIntegrationTestProfile` DB is shared across classes with no auto schema reset between them — only each class's `@BeforeEach` teardown. So **any class whose `@BeforeEach` deletes a parent table (e.g. `Usuario`) must first delete every child table ANY other class in the same profile could have populated**, in FK order. Maintain one canonical delete chain, e.g.:
```
OrderDetail → Order → OrderStatus
→ Product → Category → Provider → Unit → Status → Color
→ Farmer → TechnicalSeller → User
→ Location → Locality → Municipality → Property → State
```
Skipping this = flaky FK-violation failures when test execution order changes. (See the project `handoff.md`.)

## Coverage expectation per new module/feature
Add BOTH: unit tests for use cases (Mockito) AND integration tests for REST resources (`@QuarkusTest` + `H2TestProfile`, Firebase mocks). Cross-check against the project's existing-coverage table in `CLAUDE.md`.

## GraalVM native
```bash
./mvnw package -Dnative                                   # needs GraalVM
./mvnw package -Dnative -Dquarkus.native.container-build=true   # no local GraalVM
```
Native build is slow → gate it in CI, not every local phase. Watch for reflection/serialization registration gaps (register reflection for DTOs (de)serialized at runtime).

## Verification gates
```bash
./mvnw test                          # unit
./mvnw verify -DskipITs=false        # integration (both profiles)
./mvnw verify -DskipITs=false -Dit.test=<OneIntegrationTest>   # single
```
