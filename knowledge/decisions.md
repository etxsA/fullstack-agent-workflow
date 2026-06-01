# Decisions (and why)

Every significant choice from the source projects, with rationale. These are the **defaults** the intake proposes.

## Frontend
| Concern | Decision | Why |
|---|---|---|
| Mobile framework | **Expo** (managed) | required by spec; fast iteration, OTA, EAS when needed |
| Web build | **Vite + React** | dev server on **5173 matches backend CORS**; fast; simple Vercel deploy |
| Routing | expo-router (mobile) / React Router (web) | file-based typed routes; standard |
| Server state | **TanStack Query** | caching, refetch, optimistic updates, loading/error built-in |
| Client state | **Zustand** | minimal, no Provider, selective subscriptions; persisted for auth/theme |
| Styling | NativeWind + Gluestack (mobile) / Tailwind + shadcn (web) | Tailwind tokens map cleanly from Figma; reusable primitives |
| Forms | react-hook-form + **zod** | declarative validation; shared schemas |
| Networking | **axios** custom instance + interceptors | required; token bridge, 401 refresh, error normalization |
| Auth | **Firebase** (email/pw) + backend user row | spec; two-system model |
| Tests | Jest + RNTL (mobile) / Vitest + RTL (web) | unit/integration; Cypress for web e2e (optional) |

## Backend (Quarkus hexagonal)
| Concern | Basic (to-do) | Advanced (plaguie) |
|---|---|---|
| REST/JSON | RESTEasy + JSON-B (Yasson) | Quarkus REST + **Jackson** |
| Auth | Firebase filter, public `/user`+`/status` | + soft-delete→403, manual role checks |
| Mapping | static mappers, FK stubs | + `application/mapper` (domain↔DTO), two-tier |
| N+1 | `findByIds` bulk | + `@NamedEntityGraph` |
| Persistence | MySQL/H2, `drop-and-create`+import.sql | + spatial (JTS), profile-based schema |
| OpenAPI | enabled | **explicit annotations mandatory** |
| Testing | unit/integration | two profiles, FK-ordered cleanup, native build |
| Extras | — | spatial, AI/LLM, reports (POI/PDFBox), messaging |

## Cross-cutting
- **Gitflow + PR per phase + gh** (no web UI). Never AI co-author.
- **Public-repo security**: gitignore secrets + docs; secret-guard; backend secrets in Secret Manager.
- **Spec-driven**: plan + CLAUDE.md before building; verification gates per phase.
- **Deploy**: GCP Cloud Run (backend), Vercel (web), Expo (mobile).

## Notable closed decisions (backend)
- `userId` is always **UUID**; domain enums are **String**; owner is never a member row (no duplicates); updates via `em.merge()` with full-field stubs; DELETE returns the deleted DTO (not 204); validation only in DTO annotations + resource params (never procedural in use cases); pagination 1-indexed, size 20.
