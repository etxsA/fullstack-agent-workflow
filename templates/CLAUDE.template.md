<!--
  TEMPLATE — copy to the target project root as `CLAUDE.md`, then fill the <PLACEHOLDERS>.
  The real CLAUDE.md is GITIGNORED (it holds config + test creds). The tracked agent note is AGENTS.md.
  NEVER put real secrets in a tracked file. Placeholders only here.
-->

# CLAUDE.md — <PROJECT_NAME>

Context for any Claude Code instance working on this repo. Read fully before coding.
(This file is **gitignored** — holds config/test creds. Tracked agent note: `AGENTS.md`.)

## 1. What this is
<One paragraph: app purpose, platform (Expo / Vite-React / Quarkus), what it consumes, grading/spec context if any.>

## 2. Two-system model (if Firebase + backend)
```
Identity      → Firebase Auth   (email/pw, ID token JWT, session)
Business data → <BACKEND> REST API (Bearer = Firebase ID token)
```
A user is usable only when BOTH exist: Firebase account + backend user row (`POST /user` after sign-up). Valid token + no row → 401 everywhere. No auto-provisioning.

## 3. Tech stack (ACTUAL — from scaffold)
| Concern | Package / Version |
|---|---|
| Toolchain | <expo ~XX / vite / quarkus X.Y, language version> |
| Routing | <expo-router / react-router / JAX-RS> |
| Server state | <TanStack Query / —> |
| Client state | <Zustand / —> |
| Styling | <NativeWind+Gluestack / Tailwind+shadcn / —> |
| Auth | <firebase / firebase-admin> |
| Networking | <axios instance + interceptors / —> |
| Tests | <jest+RNTL / vitest+RTL / mvnw test+verify> |
> Confirm exact versions via `expo install` / Context7 — never guess.

## 4. Tools & workflow
- **Codegraph:** `codegraph init -i` after scaffold; locate code before editing.
- **Context7:** for ANY library/framework/API/CLI docs.
- **Figma MCP:** design file `<NAME>` fileKey `<KEY>` — pull tokens/frames.

## 5. Gitflow (strict)
- `main` = releases only · `develop` = integration · `feature/*` off develop.
- **The agent creates AND merges every PR via `gh`** (`gh pr merge --merge --delete-branch`). User never merges.
- **NEVER add an AI co-author** (no `Co-Authored-By`, no "Generated with" line).
- Branch FIRST after each merge (you land on develop).

## 5.1 Security — git repo is PUBLIC
- No credentials in any tracked file, ever. Real values live in `.env` + this `CLAUDE.md` + `IMPLEMENTATION_PLAN.md` (all gitignored).
- `.env.example` = placeholders only. README = test emails only; password as `<password — provided separately to evaluator>`.
- Secret-guard before every commit: `git diff --cached --name-only | grep -iE '\.env$|CLAUDE|IMPLEMENTATION_PLAN|service-account|firebase.*\.json'` must be empty.

## 6. Project structure
<Paste the target layout. Frontend rule: screens → query hook → service → http instance (screens never call the client directly). Backend rule: domain ← application ← infrastructure/interfaces.>

## 7. Backend API — essentials
<Base URL from env, auth header, endpoint quick-map table. Full contract in API.md.>

## 8. Backend gotchas (MUST honor)
<Numbered list of the real traps: ownership checks, full-replace PATCH, case-sensitive enums, null-omitting JSON, pagination shape, DB-reset-on-reboot, etc.>

## 9. Error & loading conventions
<loading/error/empty/content states; ApiError normalization; 401 refresh-once-then-logout; 403 hide-edit.>

## 10. Spec — required screens & rubric
<If graded: required screens + rubric weights + delivery checklist.>

## 11. Commands
```bash
<run / install / test / lint commands>
# gitflow
git checkout -b feature/<name> develop
gh pr create --base develop --head feature/<name> ...
gh pr merge <n> --merge --delete-branch   # agent merges
```

## 12. Env / config — REAL VALUES (file gitignored)
<Real env values go HERE only because this file is gitignored. Mirror keys in .env.example as placeholders.>

## 13. Source-of-truth docs in repo
- `IMPLEMENTATION_PLAN.md` — phased build + branch map (gitignored).
- `API.md` — backend contract.
- `AGENTS.md` — tracked agent note (no secrets).
