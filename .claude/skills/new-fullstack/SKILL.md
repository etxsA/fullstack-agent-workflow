---
name: new-fullstack
description: Interactive entry point to spin up a tailored fullstack project (Expo/Vite/Next frontend + Quarkus backend) following this workflow's conventions, gates, and gotchas. Interviews the user per concern, then generates IMPLEMENTATION_PLAN.md + CLAUDE.md + structure, and optionally drives the phased build. Trigger: /new-fullstack, "start a new project with the workflow", "scaffold a fullstack app".
---

# new-fullstack — the decision engine

Turns this workflow repo (`knowledge/`, `templates/`, `stacks/`, sibling skills) into a tailored project: an approved `IMPLEMENTATION_PLAN.md`, a `CLAUDE.md`, the directory structure, and the portable building blocks — then (optionally) builds it phase by phase under the workflow's gitflow + gates.

**Read first:** `PLAYBOOK.md` (master methodology) and `knowledge/decisions.md` + `knowledge/tech-matrix.md` (the defaults this interview proposes).

## 0. Preconditions
- Confirm the workflow is available to the session (this repo as a sibling, or its `.claude/` copied in). If not, stop and tell the user to clone it.
- Confirm the target directory (new empty dir, or an existing repo to extend). Confirm a GitHub remote exists (PRs go through `gh`).
- **The agent owns the full PR lifecycle** (creates AND merges every phase PR via `gh`; never co-authors). See `knowledge/conventions.md`.

## 1. Interview (per concern — use AskUserQuestion; recommended option first, labeled "(Recommended)")
Walk the decision tree from `knowledge/tech-matrix.md`. Only ask what changes the build; for everything else take the documented default and state it. Order:

1. **Project type** — mobile · web · both · backend-only.
2. **Frontend** (if any):
   - Framework: Expo *(Recommended for mobile)* · Vite+React *(Recommended for web)* · Next.js (only for SSR/SEO/edge).
   - Server cache: TanStack Query *(Rec)* · SWR · RTK Query.
   - Client state: Zustand *(Rec)* · Redux Toolkit · Jotai · Context.
   - Styling: NativeWind+Gluestack (mobile) / Tailwind+shadcn (web) *(Rec)* · StyleSheet.
   - Forms: react-hook-form+zod *(Rec)*.
   - Auth: Firebase *(Rec)* · Auth0 · custom JWT.
   - Testing depth: unit/integration only *(Rec)* · + E2E (Detox/Cypress/Playwright).
   - Optionals: i18n? Storybook? CI/CD? (default all off — see `knowledge/optionals.md`).
3. **Backend** (if any):
   - Tier: basic *(Rec for plain CRUD)* · advanced (roles/spatial/AI/reports/strict-OpenAPI/native).
   - Modules (advanced): spatial · ai-llm · reports · messaging-kafka · testing-native (default none).
   - Auth: Firebase Admin filter *(Rec)* · own JWT.
   - Deploy: GCP Cloud Run *(Rec)* · other.
4. **Deploy targets** — backend→Cloud Run, web→Vercel (mind the CORS port/hostname, `knowledge/integrations.md`), mobile→Expo/EAS.

Record every answer (and every defaulted choice) — they become §0 of the plan.

## 2. Gather assets (don't build without them)
Ask for / confirm: backend contract (API.md or "this repo"), backend base URL (verify `/status`), Firebase config, Figma fileKey (if design-driven), test users. List RECEIVED vs BLOCKING. A blocking asset pauses the build.

## 3. Generate the project skeleton
From `templates/` + the chosen `stacks/*` preset:
- `CLAUDE.md` ← `templates/CLAUDE.template.md`, filled from the interview (gitignored in target).
- `IMPLEMENTATION_PLAN.md` ← `templates/IMPLEMENTATION_PLAN.template.md`, with the §0 decisions table and the §10 phase plan filled (gitignored in target).
- `.gitignore` ← `templates/gitignore.template`; `.env.example` ← `templates/.env.example` (trim to the chosen stack).
- `AGENTS.md` (tracked, no secrets) — short pointer to CLAUDE.md conventions.
- Frontend building blocks: copy `templates/{errors,http,queryClient,authStore}.ts` into the structure from the chosen frontend preset, adapt per its notes (Expo vs Vite env prefix + persistence).
- Backend: lay out `domain/application/infrastructure/interfaces` per `stacks/backend-quarkus/<tier>.md`.

## 4. Plan approval gate
Present `IMPLEMENTATION_PLAN.md` for explicit approval. **No app code until approved.** (Use ExitPlanMode/EnterPlanMode if in plan mode.)

## 5. Optional phased build
On approval, drive the build per `PLAYBOOK.md §2` and the phase table in the plan:
- Phase 0 bootstrap (`scaffold-frontend` / `scaffold-backend`) → then one feature branch + PR per phase.
- After each merge: branch first, build, gate (`verify-phase`), agent creates **and merges** the PR, report.
- Add optionals with `add-optional`; add features with `add-feature`; cut releases with `ship-release`.

## Hand-offs
`scaffold-frontend` · `scaffold-backend` · `add-feature` · `add-optional` · `verify-phase` · `ship-release`. Conventions: `knowledge/conventions.md`. Gotchas to pre-empt: `knowledge/gotchas.md`.
