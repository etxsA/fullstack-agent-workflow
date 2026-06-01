# stacks/ — opinionated presets

Per-stack scaffold + deps + structure + gotchas + gates. The `/new-fullstack` intake picks one frontend + (optionally) one backend tier + any modules. Shared conventions live in `../knowledge/`; these files are the stack-specific deltas + scaffold commands.

## Frontend
| Preset | Use when |
|---|---|
| [`frontend-expo.md`](frontend-expo.md) | **default mobile** — React Native, iOS-sim demo |
| [`frontend-vite-react.md`](frontend-vite-react.md) | **default web** — SPA on Vercel; mind the CORS port |
| [`frontend-nextjs.md`](frontend-nextjs.md) | stub — pick only for SSR/SEO/edge |

## Backend (Quarkus hexagonal)
| Preset | Use when |
|---|---|
| [`backend-quarkus/basic.md`](backend-quarkus/basic.md) | CRUD + Firebase, RESTEasy-JSONB |
| [`backend-quarkus/advanced.md`](backend-quarkus/advanced.md) | roles, soft-delete, Jackson, entity graphs, OpenAPI, CI/CD |

### Optional modules (advanced tier)
| Module | Adds |
|---|---|
| [`messaging.md`](backend-quarkus/modules/messaging.md) | Kafka + RabbitMQ (SmallRye) — built from real source |
| [`spatial.md`](backend-quarkus/modules/spatial.md) | JTS/GPS geometry — built from real source |
| [`testing-native.md`](backend-quarkus/modules/testing-native.md) | full test matrix + GraalVM native — built from real source |
| [`ai-llm.md`](backend-quarkus/modules/ai-llm.md) | LLM provider port — stub/extension point |
| [`reports.md`](backend-quarkus/modules/reports.md) | XLSX/PDF export — stub/extension point |

Each module is usually its own phase + PR (`../knowledge/optionals.md`).
