# fullstack-agent-workflow

A reusable **Claude Code workflow** to spin up tailored fullstack projects following one fixed architecture, set of conventions, verification gates, and gotchas — distilled from real projects (an Expo mobile app, a Vite+React web app, and two Quarkus hexagonal backends).

Drop it into a new session, run **`/new-fullstack`**, answer a short interview, and it generates the project's plan + `CLAUDE.md` + structure and (optionally) drives the build phase by phase.

---

## Why

Every new project re-derives the same decisions: state management, networking + interceptors, auth, styling, testing, deploy, gitflow, security. This repo captures those decisions **once**, as:

- a **decision engine** (interactive intake that asks what to include, with sensible defaults);
- a **knowledge base** (every choice + why, conventions, gotchas, verification, integrations);
- **templates** (portable building blocks: axios instance, error normalizer, query client, auth store, CLAUDE.md, …);
- **stack presets** (Expo / Vite-React / Next.js-stub; Quarkus backend basic/advanced + optional modules);
- **skills** (`/new-fullstack`, `scaffold-*`, `add-feature`, `add-optional`, `verify-phase`, `ship-release`).

## Quick start (in a target project)

```bash
# make the workflow available (sibling clone or copy its .claude/ into the project)
git clone https://github.com/etxsA/fullstack-agent-workflow
# in the Claude Code session for your new project:
/new-fullstack
```

### Multi-repo workspace in one run
Want separate backend + frontend (and maybe mobile) repos? Run **`/init-workspace`** once from a parent folder: it creates a folder per repo, seeds each with `.claude/` + git `develop` + a GitHub remote + a `START_HERE.md`, and writes a top-level `WORKSPACE.md` (repo map + build order + CORS facts). Then open a Claude session in each folder — it reads `START_HERE.md` and runs `/new-fullstack` on rails. (Skip Expo = just don't select mobile.)

### What a single-repo session looks like
1. `/new-fullstack` interviews you per concern (project type → frontend state/cache/styling/auth/tests → backend tier/modules/deploy), defaulting from `knowledge/tech-matrix.md`.
2. It gathers assets (backend URL, Firebase config, Figma key, test users) and generates `IMPLEMENTATION_PLAN.md` + `CLAUDE.md` + the structure + the `templates/` building blocks.
3. On your approval it drives the build **phase by phase**: `scaffold-frontend`/`scaffold-backend` (Phase 0), then one `feature/*` branch + PR per phase, each gated by `verify-phase` and **created + merged by the agent** (never co-authored). `add-feature` / `add-optional` extend it; `ship-release` cuts the tagged release.
4. The `secret-guard` hook blocks any commit that stages `.env`, `CLAUDE.md`, service-account/Firebase JSON, or secret-looking values.

## Structure

```
PLAYBOOK.md          # master methodology (phases, gitflow, gates, security, tooling)
knowledge/           # decisions · tech-matrix · optionals · conventions · verification
                     # · integrations · gotchas · tooling · deploy-gcp
templates/           # CLAUDE.template.md · IMPLEMENTATION_PLAN.template.md · gitignore.template
                     # · .env.example · http.ts · errors.ts · queryClient.ts · authStore.ts
stacks/
  frontend-expo.md · frontend-vite-react.md · frontend-nextjs.md
  backend-quarkus/   basic.md · advanced.md · modules/{spatial,ai-llm,reports,testing-native,messaging}.md
.claude/
  skills/            init-workspace · new-fullstack · scaffold-frontend · scaffold-backend
                     · add-feature · add-optional · verify-phase · ship-release
  hooks/             secret-guard.sh   # blocks commits that stage secrets/private docs
  settings.json      # PreToolUse(Bash) → secret-guard pre-commit hook
```

## Stacks covered

- **Frontend:** Expo (React Native) · Vite + React · Next.js (extension stub).
- **Backend:** Quarkus hexagonal — **basic** (RESTEasy-JSONB, Firebase, CRUD) and **advanced** (Quarkus-REST + Jackson, OpenAPI, named entity graphs, role/soft-delete auth), with optional modules: **spatial** (JTS/GPS), **AI/LLM provider**, **report export** (POI/PDFBox), **robust testing + native**, **messaging** (Kafka + RabbitMQ via SmallRye).
- **Deploy:** GCP (Cloud Build → Artifact Registry → Cloud Run + Secret Manager + Cloud SQL); Vercel (web); Expo (mobile).

## Conventions baked in

Gitflow (`main`/`develop`/`feature/*`, PRs via `gh`), spec-driven phased builds (one PR per phase), verification gates (`tsc`, build, live API smoke tests), public-repo security (gitignored secrets, secret-guard), and tooling rules (codegraph, Context7, Figma MCP). See `PLAYBOOK.md`.

> Built incrementally on `develop` via one PR per phase (each created + merged by the agent). All five build areas — `knowledge/`, `templates/`, `stacks/`, `.claude/skills/`, `.claude/` hooks — are in place. See the repo's merged PRs for history.
