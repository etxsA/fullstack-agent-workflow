# Conventions

The house style. Applies to every project built with this workflow.

## Gitflow & process
- `main` (releases) ← `develop` (integration) ← `feature/*`. `release/x.y.z`, `hotfix/x.y.z` as in standard gitflow.
- **One PR per phase.** The **agent owns the full PR lifecycle**: it creates the PR via `gh` **and merges it itself** into `develop` (`gh pr merge --merge --delete-branch`), then reports. The user never has to touch GitHub. (Pause for approval only on phases the user explicitly names.)
- **Branch first** after every merge (you land on `develop`). Never commit on `develop`/`main`.
- **Never** add an AI co-author (no `Co-Authored-By` trailer, no "Generated with" line). Commit/push per the agreed phase cadence.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). Subject ≤ ~72 chars; body explains the "why".

## Frontend (TS) structure
`src/`-based; path alias `@/* → ./src/*`.
```
src/
  app|routes|pages/   # screens (expo-router / react-router)
  config/env.ts       # typed env access
  lib/                # http (axios), firebase, queryClient
  stores/             # zustand (auth, theme/ui)
  services/           # one file per API call group; typed; no `any`
  hooks/              # TanStack Query hooks wrapping services
  types/api.ts        # API DTO types (from the backend contract)
  utils/              # errors, format, queryKeys, validation
  components/         # ui/ + feature folders + feedback/ (Loading/Error/Empty)
```
**Rule:** screens never call the HTTP client directly. Always **screen → query hook → service → http instance**. Request DTOs and response types are separate.

## Backend (Quarkus hexagonal) structure
`domain ← application ← infrastructure/interfaces` (domain knows no JPA).
```
domain/        models/ (plain POJOs; relations by id, enums as String) · repository/ (interfaces)
application/   dto/ (Bean Validation) · usecase/<feature>/ (one per file, @ApplicationScoped) · security/ (CurrentUser)
infrastructure/ persistence/entity/ (@Entity, @NamedEntityGraph) · persistence/repository/ (Panache impls)
                mapper/ (static, no null-checks) · security/ (auth filter) · firebase/
interfaces/rest/   JAX-RS resources (no business logic)
```
Canonical backend rules (from the reference projects):
- **Domain models are plain POJOs** — relations by id (`ownerId: UUID`, `iconId: Long`), enums as `String`, no inverse collections (avoid N+1/lazy outside tx).
- **Mappers are static, no null-checks** ("if caller passes null → NPE; the repo handles not-found"); `toEntity` builds FK stubs with only the id.
- **Use cases don't validate input or auth** — validation lives in DTO annotations + `@Valid`/`@Min` on resource params; auth is assumed populated by the filter. They DO enforce domain rules (`NotFoundException`/`ForbiddenException` → 404/403) and **return DTOs**.
- **Repositories minimal** — no business logic; writes use `em.merge()` with mapper stubs; bulk `findByIds` to avoid N+1; direct PK lookups for point checks (not paginated scans).
- **Pagination 1-indexed**, page size 20 constant; convert `pageIndex = page-1` in the use case; response `{ items, count, hasMore }` with `hasMore = (long)(pageIndex+1)*size < count`.
- **Resources:** singular paths (`/task`, `/user`), `@Valid` on bodies, status codes (POST→201, others→200, DELETE returns the deleted DTO).
- **OpenAPI explicit** in the advanced tier (`@Tag`/`@Operation`/`@APIResponses`/`@Schema` per endpoint).

## Naming / testIDs
- Frontend testIDs by intent: `btn-`, `input-`, `txt-`, `card-`, `row-`, `screen-`.
- Query keys via a central factory (`utils/queryKeys.ts`).

## Security (public repos)
See `PLAYBOOK.md §5` and `integrations.md`. Secrets gitignored; `.env.example` placeholders; secret-guard before commit; backend secrets in Secret Manager.
