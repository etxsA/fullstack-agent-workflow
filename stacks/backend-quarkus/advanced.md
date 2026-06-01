# Stack preset — Backend: Quarkus hexagonal (ADVANCED)

Everything in `basic.md` plus: role-based authz, soft-delete, two-tier mapping, named entity graphs, mandatory OpenAPI, CI/CD, robust testing. Model: the `back-plaguie` project (Quarkus 3.34, Java 17).

## When to pick advanced
Roles/permissions, spatial data, AI, report export, strict OpenAPI contract, native build, or a real CI/CD pipeline. Pulls in modules from `modules/`.

## Deltas from basic
- **REST/JSON:** Quarkus REST + **Jackson** (custom serializers, e.g. `JtsPointSerializer`) instead of RESTEasy-JSONB.
- **Two-tier mapping:** `infrastructure/mapper/` (domain↔entity) AND `application/mapper/` (domain→DTO). Basic has only the first.
- **N+1:** `@NamedEntityGraph` on entities + `getEntityManager().createQuery(...).setHint("jakarta.persistence.loadgraph", graph)` (Panache `find()`/`findById()` can't take graph hints). Name graph methods to avoid Panache clashes (`findAllStatuses()`, not `findAll()`). See `../../knowledge/` + the project's `docs/entity-graph-guide.md`.
- **Authz:** roles as int constants (`RoleConstants`: ADMIN=1, FARMER=2, SELLER=3), each with a sub-entity table referencing the user. Resources check `authenticatedUserContext.getRoleId()` **manually** — no declarative security. Soft-delete: `isActive=false` → filter rejects with **403**; `LoginUseCase` also re-checks (login is excluded from the filter) → **401**.
- **OpenAPI mandatory:** every endpoint annotated `@Tag`/`@Operation`/`@APIResponses`/`@APIResponse`/`@RequestBody`/`@Parameter`/`@Schema`. Validate in Swagger UI when contracts change.
- **Registration flow:** create in Firebase first → save local DB → create role sub-entity (+location). Roll back the Firebase user if the DB save fails.

## CI/CD (Cloud Build → Cloud Run)
Keep `cloudbuild.yaml` + `Dockerfile` + `docs/ci-cd.md` in sync. Flow: feature → PR → `develop` → tag → `main`/prod. Image version precedence `TAG_NAME → SHORT_SHA → dev`. Triggers: push `develop` (build/push), push `main` (build/push/deploy), tag `v*` (release deploy). DB password + Firebase JSON via **Cloud Run Secrets**, never `cloudbuild.yaml`. Full deploy: `../../knowledge/deploy-gcp.md`.

## Testing (two profiles — see `modules/testing-native.md`)
- **Unit** (`*Test.java`): `@ExtendWith(MockitoExtension.class)`, all deps mocked.
- **Integration** (`*IntegrationTest.java`): `@QuarkusTest` + H2 (MySQL mode), Firebase mocked via `@InjectMock`, `FirebaseConfig` skipped (`@UnlessBuildProfile("test")`). Two profiles: `H2TestProfile` (REST tests, recreate schema per run) and `UseCaseIntegrationTestProfile` (use-case tests, persists across classes → meticulous FK-ordered `@BeforeEach` cleanup, set up via Panache not `import.sql`).
- **Cross-test contamination rule:** any class whose `@BeforeEach` deletes a parent table must first delete every child table ANY other class in the same profile could have populated (fixed FK-ordered delete chain). See the project `handoff.md`.
- **H2 vs MySQL geo:** drop `columnDefinition="POINT"` from spatial columns — H2 rejects `POINT` DDL; MySQL `update` strategy is unaffected. (See `modules/spatial.md`.)

## Optional modules
`modules/spatial.md` · `modules/ai-llm.md` · `modules/reports.md` · `modules/messaging-kafka.md` · `modules/testing-native.md`. Each is usually its own phase + PR (`../../knowledge/optionals.md`).

## Verification gates
```bash
./mvnw test
./mvnw verify -DskipITs=false
./mvnw package           # (-Dnative for GraalVM native — see modules/testing-native.md)
```
