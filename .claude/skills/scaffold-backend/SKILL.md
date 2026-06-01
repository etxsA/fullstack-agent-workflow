---
name: scaffold-backend
description: Bootstrap the Quarkus hexagonal backend (Phase 0) for a workflow project — basic or advanced tier + optional modules — with the layer structure, Firebase filter, persistence, env, and build gate. Trigger: /scaffold-backend, "bootstrap the Quarkus backend", "set up the backend phase 0".
---

# scaffold-backend — Phase 0 (backend)

Stand up a clean, buildable Quarkus hexagonal backend following the chosen tier.

**Read the chosen preset first:** `stacks/backend-quarkus/basic.md` or `advanced.md`, plus any `modules/*.md`. Canonical layer rules: `knowledge/conventions.md` (Backend structure).

## Steps
1. **Branch:** `git checkout -b feature/bootstrap develop`.
2. **Scaffold** with the preset's `quarkus create app` command (basic: `resteasy-jsonb,hibernate-orm-panache,jdbc-mysql,smallrye-openapi`; advanced: Quarkus-REST + Jackson + the module extensions). Add `firebase-admin` to `pom.xml`. Confirm extension versions via Context7.
3. **Layer skeleton** (strict `interfaces → application → domain ← infrastructure`):
   ```
   domain/{models,repository}
   application/{dto,usecase,security,mapper(advanced)}
   infrastructure/{persistence/{entity,repository},mapper,security,firebase}
   interfaces/rest
   ```
4. **Auth filter:** `FirebaseAuthFilter` (`@Priority(AUTHENTICATION)`) — verify Bearer ID token via Firebase Admin SDK, look up user by `firebaseUuid`, populate request-scoped `CurrentUser`. Public: `GET /status`, `POST /user`, `GET /user?firebaseUuid=`.
5. **Persistence/config:** `application.properties` with `${VAR:default}` fallbacks; profiles `%dev` (drop-and-create + `import.sql`), `%test` (H2 MySQL-mode), prod (`update`). `import.sql`: name columns explicitly, escape reserved words (`` `long` ``).
6. **Env/secrets:** `.gitignore` from `templates/gitignore.template`; ignore `firebase-*.json` + `.env`. Secrets at runtime only (Secret Manager). `codegraph init -i`.
7. **Gate (Phase 0):** `./mvnw package` builds `target/quarkus-app`; `./mvnw quarkus:dev` boots clean (no `import.sql` FK errors); `/q/swagger-ui` renders.
8. **Secret-guard** then **agent creates AND merges** PR #1 → `develop`. Branch first for Phase 1.

## Tier deltas (advanced — see `stacks/backend-quarkus/advanced.md`)
Quarkus-REST+Jackson · two-tier mapping (`infrastructure/mapper` + `application/mapper`) · `@NamedEntityGraph` for N+1 · role authz (manual `getRoleId()`) + soft-delete→403 · **OpenAPI annotations mandatory** · CI/CD (`cloudbuild.yaml`+`Dockerfile`+`docs/ci-cd.md`) · two test profiles (see `modules/testing-native.md`).

## Add a feature (the canonical 8-step backend pattern → `add-feature`)
domain model → domain repo interface → JPA entity → static mapper → Panache repo impl → DTO (Bean Validation) → use case (`@ApplicationScoped`) → JAX-RS resource (`@Valid`, status codes). Plus unit (Mockito) + integration (`@QuarkusTest` H2) tests.

Deploy: `knowledge/deploy-gcp.md`. Endpoint smoke tests: `verify-phase` (token→curl→SQL).
