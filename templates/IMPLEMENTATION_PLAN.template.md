<!--
  TEMPLATE — copy to the target project root as `IMPLEMENTATION_PLAN.md`, then fill <PLACEHOLDERS>.
  The real IMPLEMENTATION_PLAN.md is GITIGNORED (may reference creds/URLs). Placeholders only here.
  Produced BEFORE any code, then approved. One phase = one feature branch = one PR (agent creates + merges).
-->

# Implementation Plan — <PROJECT_NAME> (<STACK>)

> **Status:** DRAFT — awaiting approval. No app code until approved.
> **Scope:** <what's in / out of this iteration>.
> **Backend:** <existing contract in API.md / this repo>. **Captured:** <YYYY-MM-DD>.

## 0. Approved decisions
| Topic | Decision |
|---|---|
| Global state | <Zustand / —> |
| Server cache | <TanStack Query / —> |
| UI / styling | <NativeWind+Gluestack / Tailwind+shadcn / —> |
| Tests | <Jest+RNTL / Vitest+RTL / mvnw> |
| Gitflow | `develop` + `feature/*`; **agent creates AND merges PRs via gh**; `main` = releases |
| Co-author | **Never** add an AI co-author |
| Optionals included | <i18n? e2e? messaging? spatial? — default: none> |

## 0.0 Security (repo is PUBLIC)
- No credentials in any tracked file. Real values only in `.env` + `CLAUDE.md` + this file (all gitignored).
- `.env.example` placeholders only. README: test emails only; password as `<provided separately to evaluator>`.
- Final docs phase: remind user to hand the test password to the evaluator out-of-band.

## 0.1 Assets needed before build
<Figma fileKey · Firebase config · backend URL (verify /status) · test users. List what's RECEIVED vs BLOCKING.>

## 1. Architecture overview
<data domains + layering diagram. Frontend key principle: screens → query hook → service → http instance.>

## 2. Tech stack (target versions)
<table; "confirm via Context7 / expo install at scaffold — not guessed".>

## 3. Project structure (target)
<tree>

## 4. Screen → endpoint mapping  (frontend)   /   Module → endpoint table (backend)
| Screen / Module | Route / Path | Endpoints | Notes |
|---|---|---|---|

## 5. Networking / 6. Auth / 7. Components / 8. Error-loading / 9. Testing
<per-concern detail — see knowledge/integrations.md + conventions.md for the canonical patterns.>

## 10. Gitflow + delivery plan (phased)
`main` ← `develop` ← `feature/*`. Each phase = one branch + PR (agent creates + merges). Fill the table:

| # | Branch | Deliverable | Gate |
|---|---|---|---|
| 0 | `feature/bootstrap` | scaffold, deps, env, `codegraph init -i`, structure | builds clean |
| 1 | `feature/<...>` | <networking / core infra> | <tsc + build / mvnw test> |
| 2 | `feature/<...>` | <auth> | live API smoke test |
| … | … | … | … |
| N | `feature/tests` | unit/integration suites | suites green |
| N+1 | `feature/docs-release` | README, .env.example, polish | secret-guard clean |

Each PR: descriptive body, no AI co-author, verified building before the agent merges.

## 11. Key gotchas baked into the plan
<pull the stack-specific traps from knowledge/gotchas.md that THIS project will hit.>

## 12. Out of scope (this iteration)
<deferred items.>
