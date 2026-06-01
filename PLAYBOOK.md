# PLAYBOOK — Fullstack Agent Workflow

The master methodology. Any Claude Code session that builds a project with this workflow follows this playbook. It is distilled from real projects (an Expo mobile app, a Vite+React web app, and two Quarkus hexagonal backends) and encodes their decisions, conventions, gates, and gotchas.

---

## 1. What this is / how to use it

A reusable **operating manual + decision engine + knowledge base + templates + skills**. In a new (or existing) project you:

1. Make this repo available to the session (clone it as a sibling, or copy its `.claude/` into the target project).
2. Run **`/new-fullstack`** — it interviews you (project type + per-concern stack choices, with defaults from this architecture), then generates the target project's `IMPLEMENTATION_PLAN.md` + `CLAUDE.md` + structure.
3. Optionally let it drive the build **phase by phase** with the gates below.

It is NOT a frozen template: it adapts to the chosen stack and surfaces the optionals that were skipped in the source projects (i18n, e2e, Storybook, CI/CD, spatial, AI, reports, messaging).

---

## 2. Build methodology (spec-driven, phased)

1. **Plan first, build on approval.** Before code: produce a thorough `IMPLEMENTATION_PLAN.md` + a `CLAUDE.md` for the target project. Wait for explicit approval.
2. **Phases.** Slice the work into numbered phases (bootstrap → core infra → auth → … → tests → docs/release). One phase = one deliverable.
3. **One PR per phase** via the GitHub CLI (`gh`). The **agent creates AND merges** the PR itself (`gh pr merge --merge --delete-branch`) — the user never has to merge. Report after each phase; the user can interrupt. (Pause for approval only on phases the user explicitly names.)
4. **Branch FIRST.** After each merge you land on `develop` — immediately `git checkout -b feature/<next>` before editing. Never commit on `develop`/`main`.
5. **Decisions via `AskUserQuestion`** when a choice changes what you build; otherwise pick the documented default and state it.
6. **Cite docs, don't guess.** Use Context7 for any library/framework/CLI/API; use Figma MCP for design.

See `knowledge/conventions.md` for the full set.

---

## 3. Gitflow

- `main` = releases only (never commit directly). `develop` = integration. `feature/*` off `develop`.
- `release/x.y.z` off `develop` → merge `main` + tag. `hotfix/x.y.z` off `main` → merge `main` + `develop`.
- **All PRs created + merged by the agent via `gh`** (no GitHub web UI, no human merge step assumed).
- **Never add an AI co-author** to commits (no `Co-Authored-By`, no "Generated with" line).
- Commit/push per the agreed phase cadence.

---

## 4. Verification gates (per phase)

Pick the gates that apply to the stack. A phase isn't done until its gates pass.

| Stack | Gates |
|---|---|
| TS frontend (Expo/Vite/Next) | `tsc --noEmit` clean · build/export (`expo export` / `vite build` / `next build`) clean |
| Expo specifically | regenerate typed routes via dev server before `tsc`; hard-reload Expo Go to view changes (see `knowledge/gotchas.md`) |
| Any frontend ↔ backend | **live API smoke test**: get a real auth token (Firebase REST `signInWithPassword`) and `curl` the exact endpoints the client calls; assert shapes |
| Quarkus backend | `./mvnw test` (unit, Mockito) and/or `./mvnw verify` (integration, H2); `./mvnw package` builds |
| Messaging module | `%test` uses `smallrye-in-memory`; assert producer→consumer→stats without brokers |
| Anything | secret-guard before commit (§5); update task list |

Full detail + commands: `knowledge/verification.md`. Endpoint-testing recipe: the `verify-phase`/`test-endpoints` skills.

---

## 5. Security (assume public repos)

- **No credentials in tracked files, ever.** `.env`, `CLAUDE.md`, plan docs, and reference docs are gitignored. `.env.example` ships placeholders only.
- READMEs show test passwords/secrets as placeholders ("provided with the submission"); never the real value.
- Backend secrets (Firebase service-account JSON, DB password) live in **Secret Manager** / mounted volumes, never in the image or repo.
- **Secret-guard before every commit:** `git diff --cached --name-only | grep -iE '\.env$|CLAUDE|IMPLEMENTATION_PLAN|service-account|firebase.*\.json'` must be empty. (A pre-commit hook ships in `.claude/settings.json`.)

---

## 6. Tooling rules

- **Codegraph** — after scaffolding run `codegraph init -i`; use `codegraph search`/MCP to locate code before editing. Don't grep-loop when codegraph answers.
- **Context7** — for ANY library/framework/SDK/CLI/cloud docs (even well-known). Never guess API syntax.
- **Figma MCP** — for design-to-code; pull tokens/frames; it is rate-limited on Starter, so pull a few frames at a time.
- **AskUserQuestion** — for genuine decisions only; recommended option first, labeled "(Recommended)".

Detail: `knowledge/tooling.md`.

---

## 7. Repo map

```
PLAYBOOK.md                  # this file
knowledge/                   # the distilled context (decisions, conventions, gotchas, …)
templates/                   # portable building blocks (CLAUDE.md, http.ts, .gitignore, …)
stacks/                      # opinionated presets (frontend + backend basic/advanced + modules)
.claude/
  ├── skills/                # /new-fullstack, scaffold-*, add-feature, add-optional, verify-phase, ship-release
  └── settings.json          # hooks (secret-guard) + reminders
```

Start at `knowledge/` to understand the conventions, `stacks/` to pick a preset, `templates/` for the building blocks, and `.claude/skills/new-fullstack` for the interactive entry point.
