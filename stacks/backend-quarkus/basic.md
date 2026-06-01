# Stack preset — Backend: Quarkus hexagonal (BASIC)

CRUD REST API, Firebase-verified, MySQL/H2. Clean/hexagonal architecture. Model: the `to-do` project. Full conventions in `../../knowledge/conventions.md` (Backend structure) — this preset is the scaffold + the deltas from advanced.

## When to pick basic
Straight CRUD + Firebase auth, no spatial/AI/reports/strict-OpenAPI/native. Upgrade to `advanced.md` when any of those appear.

## Scaffold + deps
```bash
quarkus create app com.itesm:<app> --extension='resteasy-jsonb,hibernate-orm-panache,jdbc-mysql,smallrye-openapi'
cd <app> && codegraph init -i
# Firebase Admin SDK added manually to pom.xml: com.google.firebase:firebase-admin
```
REST/JSON: **RESTEasy + JSON-B (Yasson)**. Confirm extension versions via Context7.

## Architecture (strict dependency direction)
`interfaces → application → domain ← infrastructure`. Layout under `com.itesm`:
```
domain/         models/ (plain POJOs — relations by id, enums as String, no inverse collections) · repository/ (interfaces)
application/    dto/ (Bean Validation) · usecase/<feature>/ (one per file, @ApplicationScoped) · security/ (CurrentUser)
infrastructure/ persistence/entity/ (@Entity) · persistence/repository/ (Panache impls) · mapper/ (static, no null-checks) · security/ (Firebase filter) · firebase/
interfaces/rest/  JAX-RS resources (no business logic)
```
Canonical rules (see `conventions.md`): domain models plain POJOs (`ownerId: UUID`, `iconId: Long`, enums String); mappers static + self-contained FK stubs (no cascade); use cases don't validate input/auth (DTO annotations + filter do) but DO throw `NotFoundException`/`ForbiddenException` (→404/403) and **return DTOs**; repos minimal, `em.merge()` writes, `findByIds` bulk to dodge N+1; pagination 1-indexed size 20 `{items,count,hasMore}`; singular paths (`/task`,`/user`); POST→201, DELETE returns the deleted DTO.

## Auth (Firebase filter)
`FirebaseAuthFilter` (`@Priority(AUTHENTICATION)`) verifies the Bearer ID token via Firebase Admin SDK, looks up the user by `firebaseUuid`, populates request-scoped `CurrentUser`. Public endpoints: `GET /status`, `POST /user`, `GET /user?firebaseUuid=`.

## Config / env
`${VAR:default}` fallbacks; profiles `%dev` (drop-and-create + `import.sql`), `%test` (H2), prod (`update`). Secrets (Firebase service-account JSON, DB password) injected at runtime, never in repo/image. See `../../knowledge/deploy-gcp.md`.
- **`import.sql` (Hibernate 6):** name columns explicitly (`INSERT INTO T (c1,c2) VALUES …`); escape reserved words (`` `long` ``).

## Verification gates
```bash
./mvnw test        # unit (Mockito, no Quarkus boot)
./mvnw verify      # integration (@QuarkusTest, H2 MySQL-compat)
./mvnw package     # builds target/quarkus-app
./mvnw quarkus:dev # http://localhost:8080, /q/dev, /q/swagger-ui
```
Live API smoke test recipe (Firebase token → curl → SQL snapshot): the endpoint-testing skill / `to-do/SKILLS.md` pattern. Deploy: `../../knowledge/deploy-gcp.md`.
