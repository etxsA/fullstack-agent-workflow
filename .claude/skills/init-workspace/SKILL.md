---
name: init-workspace
description: Bootstrap a multi-repo workspace in one run — creates a folder per repo (backend, web frontend, mobile), each seeded with the workflow's .claude/, git + develop, optional GitHub remote, and a START_HERE.md so you just open a Claude session in each and run /new-fullstack. Trigger: /init-workspace, "set up the backend + frontend repos", "scaffold the whole workspace", "create the project folders".
---

# init-workspace — one run, all the repos ready

Turns a single Claude session into the **whole project workspace**: separate sibling repos (e.g. backend + web frontend, optionally mobile), each pre-seeded so the per-repo sessions can start immediately. You run this once; then open one Claude session per folder.

> A skill can't open new Claude sessions for you. What it CAN do: create + seed every repo folder and leave each a `START_HERE.md` with the exact `/new-fullstack` answers. You open a session in each folder; the first thing it does is read `START_HERE.md` and run `/new-fullstack`.

## 0. Locate the workflow library
The skills read `knowledge/`, `templates/`, `stacks/` from this workflow repo. Capture its absolute path (the repo you're running from, or where it's cloned) as `WF`. Each `START_HERE.md` records it so the per-repo sessions can find the library.

## 1. Interview (AskUserQuestion)
- **Workspace dir** — parent folder to create the repos under (default: current dir's parent + project name).
- **Project name** — used for folder + GitHub repo names (e.g. `myapp` → `myapp-backend`, `myapp-web`).
- **Which repos** (multiSelect): **backend** (Quarkus) · **web frontend** (Vite+React) · **mobile** (Expo). Default backend + web.
- **Backend tier** — basic · advanced (if backend chosen).
- **GitHub remotes?** — create private repos via `gh repo create` per repo (recommended, so the agent can open+merge PRs) · skip (local only).

## 2. Create + seed every repo
Run the bootstrap helper (creates folders, copies `.claude/`, inits git + `develop`):
```bash
bash "$WF/.claude/skills/init-workspace/bootstrap.sh" "<WORKSPACE_DIR>" "$WF" <repo1> <repo2> [repo3]
# e.g. ... "/Users/me/dev/myapp" "$WF" myapp-backend myapp-web
```
Then, per repo, if GitHub remotes were chosen:
```bash
cd <WORKSPACE_DIR>/<repo> && gh repo create <owner>/<repo> --private --source=. --remote=origin
```

## 3. Write each repo's START_HERE.md
For every repo, drop a `START_HERE.md` at its root with the pre-decided answers so the per-repo session runs on rails. Template:
```markdown
# START HERE — <repo name>
Run this in a Claude Code session opened in THIS folder.

1. Workflow library: `<WF absolute path>` (knowledge/templates/stacks live there).
2. Run: **/new-fullstack**
3. Answers to give it:
   - Project type: <backend-only | web | mobile>
   - <backend: tier = basic|advanced> / <frontend: Vite+React, SKIP Expo>
   - Accept all other recommended defaults  → identical reference stack.
4. Cross-repo contract:
   - Backend repo: <path>  ·  Frontend repo: <path>
   - Frontend needs the backend's API.md + base URL → build/define the backend contract FIRST.
   - CORS: backend `quarkus.http.cors.origins` MUST include `http://localhost:5173,http://127.0.0.1:5173,https://<vercel-name>.vercel.app`; web dev server stays on 5173.
5. The agent owns the full PR lifecycle (creates AND merges every phase PR; never co-authors).
```
Tailor each: the backend's START_HERE omits frontend bits and notes "you produce API.md"; the frontend's points at the backend folder + contract.

## 4. Write the top-level WORKSPACE.md
At `<WORKSPACE_DIR>/WORKSPACE.md`: the repo map, the **build order** (backend → contract → frontend), the shared CORS/port facts, and the workflow library path. This is the human index of the workspace.

## 5. Hand off
Report the created folders and tell the user, literally:
> Open a Claude Code session in each folder and it'll pick up `START_HERE.md`. Suggested order: backend first (it produces the API contract), then the frontend.

## Notes
- **Skip Expo** = just don't select "mobile"; pick web frontend only.
- The copied `.claude/` carries the secret-guard hook (`settings.json` → `$CLAUDE_PROJECT_DIR/.claude/hooks/secret-guard.sh`) so each repo guards its own commits.
- Re-running `bootstrap.sh` refreshes `.claude/` without clobbering existing git history.
- Each repo builds independently via `new-fullstack` → `scaffold-*` → `verify-phase` → `ship-release`.
