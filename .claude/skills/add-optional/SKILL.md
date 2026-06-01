---
name: add-optional
description: Add an optional feature/module that the core build skipped — i18n, E2E, Storybook, CI/CD, observability (frontend) or spatial, ai-llm, reports, messaging-kafka, testing-native (backend) — as its own phase + PR. Trigger: /add-optional, "add i18n/e2e/storybook/ci", "add the kafka/spatial/reports module".
---

# add-optional — turn on a skipped feature

Each optional is real surface area: add it deliberately, as its own phase + PR, only when a concrete need exists. Catalog + decision rules: `knowledge/optionals.md`. Backend module presets: `stacks/backend-quarkus/modules/`.

## Procedure
1. **Branch** `feature/<optional>` off `develop`.
2. **Read the preset/source** for the optional (below). Confirm library APIs via Context7.
3. **Wire it** following the preset; keep the hexagonal/clean boundaries (ports for external services, secrets in Secret Manager).
4. **Add its verification gate** (each optional brings one).
5. **Gate via `verify-phase`**, secret-guard, then the agent creates + merges the PR.

## Frontend optionals (`knowledge/optionals.md`)
- **i18n** — i18next/react-i18next (+ expo-localization on mobile); namespace per feature; typed keys.
- **E2E** — Detox (mobile) / Cypress (web, CORS-allowlisted port) / Playwright; cover login→nav→CRUD→search→logout + an error path.
- **Storybook** — component catalog over `components/ui` + Tailwind tokens.
- **CI/CD** — GitHub Actions mirroring the per-phase gates (lint + tsc + test + build on PR; deploy on merge); secret-guard in CI too.
- **Observability** — Sentry; DSN via public env; scrub PII.

## Backend modules (`stacks/backend-quarkus/modules/*.md`)
- **messaging-kafka** — Kafka + RabbitMQ (SmallRye). `@Blocking` consumers, Rabbit `JsonObject.mapTo`, Kafka typed deserializer subclass, register-before-send, `%test` → `smallrye-in-memory`. Built from real source.
- **spatial** — JTS `Point` + Hibernate Spatial; `JtsPointSerializer` `{longitude,latitude}`; **drop `columnDefinition="POINT"` for H2 tests**. Built from real source.
- **testing-native** — full unit+integration matrix (two profiles, FK-ordered cleanup) + GraalVM native. Built from real source.
- **ai-llm** — LLM provider behind a domain port; key in Secret Manager; mock in unit tests. Upgrade source: back-plaguie `GeminiHttpClient`.
- **reports** — POI (XLSX) / PDFBox (PDF); stream output, explicit columns. Upgrade source: back-plaguie `ReporteExporter`.

Update `CLAUDE.md` + the plan's phase table when an optional lands.
