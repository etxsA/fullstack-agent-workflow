# Optionals (skipped in the source projects, available on demand)

The reference builds (Expo mobile, Vite+React web, two Quarkus backends) shipped a lean core. These are the features they **deliberately left out** but that the workflow can add. The `/new-fullstack` intake offers each; `add-optional` wires one into an existing project. Backend modules have full presets in `stacks/backend-quarkus/modules/`.

## Frontend optionals
| Optional | What it adds | Pick it when… | Notes / wiring |
|---|---|---|---|
| **i18n** | `i18next`/`react-i18next` (+ `expo-localization` on mobile) | multi-locale requirement; user-facing copy must translate | namespace per feature; keep keys typed; detect device locale |
| **E2E tests** | Detox (mobile) · Cypress/Playwright (web) | critical flows need full-stack coverage beyond unit/integration | web Cypress assumes the CORS-allowlisted dev port; mobile Detox needs a dev build |
| **Storybook** | component explorer / visual catalog | a design system or many reusable primitives to document | maps cleanly onto the `components/ui` layer + Tailwind tokens |
| **CI/CD** | GitHub Actions: lint + `tsc` + test + build on PR; deploy on merge | team workflow / protected `main`; reproducible release | mirror the per-phase gates (`knowledge/verification.md`); secret-guard runs in CI too |
| **Observability** | Sentry / crash + error reporting | production rollout where silent failures cost | DSN via public env (`EXPO_PUBLIC_*` / `VITE_*`); scrub PII |

## Backend optionals (Quarkus modules)
Each has a preset in `stacks/backend-quarkus/modules/`. Advanced tier only unless noted.

| Module | What it adds | Pick it when… | Key gotchas |
|---|---|---|---|
| **spatial** | JTS geometry, GPS/lat-lng columns, distance queries | location features (maps, nearby, geofencing) | Hibernate Spatial + the DB's geo type; profile-based schema; JTS `Point` ↔ DTO mapping |
| **ai-llm** | a pluggable LLM provider client (chat/completion/embeddings) | AI features (summaries, classification, semantic search) | provider key in **Secret Manager**, never the repo; stream responses; budget/rate-limit |
| **reports** | export to XLSX (Apache POI) / PDF (PDFBox) | users need downloadable documents | stream large exports; column order is explicit; fonts bundled for PDF |
| **messaging** | Kafka + RabbitMQ via SmallRye Reactive Messaging | async pipelines / fanout notifications / high-throughput batch | `@Blocking` for blocking handlers; Rabbit consumers get `JsonObject` (`.mapTo`); Kafka typed `value.deserializer`; register batch in stats before send; `%test` → `smallrye-in-memory`. Source: `_context-docs/backend-messaging-kafka-rabbitmq.html` |
| **testing-native** | richer test matrix + GraalVM native build/verify | strict quality bar; native-image deploy target | two integration profiles (recreate vs persist); FK-ordered cleanup; native build is slow — gate in CI |

## Decision rule
Start with the **core** (auth + CRUD + tests + deploy). Add an optional only when a concrete feature demands it — each one is real surface area to maintain, secure, and test. The intake defaults every optional to **off**; turning one on pulls in its module preset and its verification gate.

See also: `tech-matrix.md` (the per-concern options table) and `PLAYBOOK.md §2` (phased build — an optional is usually its own phase + PR).
