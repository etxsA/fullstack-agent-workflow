---
name: ship-release
description: Cut a release following gitflow — release branch off develop, version bump, final gates, merge to main + tag, deploy, back-merge — all PRs created and merged by the agent via gh. Trigger: /ship-release, "cut a release", "ship vX.Y.Z", "promote develop to main".
---

# ship-release — gitflow release

Promote `develop` to a tagged `main` release. The agent creates AND merges every PR; never co-authors. Conventions: `knowledge/conventions.md`; deploy: `knowledge/deploy-gcp.md`.

## Steps
1. **Confirm `develop` is green** — all phase PRs merged, `verify-phase` gates pass on `develop`.
2. **Branch** `release/x.y.z` off `develop`.
3. **Version bump** — `package.json` (frontend) / `pom.xml` `<version>` (backend); update CHANGELOG/README version if present.
4. **Final gates** (`verify-phase`): frontend `tsc` + build/export; backend `./mvnw verify` + `package`; live API smoke test against the deployed/staged backend.
5. **Secret-guard** (`git diff --cached --name-only | grep -iE '\.env$|CLAUDE|IMPLEMENTATION_PLAN|service-account|firebase.*\.json'` empty).
6. **PR `release/x.y.z` → `main`**, agent merges. Then **tag**:
   ```bash
   git checkout main && git pull
   git tag -a vX.Y.Z -m "Release vX.Y.Z" && git push origin vX.Y.Z
   ```
7. **Deploy** — backend: the tag triggers Cloud Build → Cloud Run (or `gcloud builds submit` per `knowledge/deploy-gcp.md`); web: Vercel prod (name must satisfy the CORS regex); mobile: EAS build if distributing.
8. **Back-merge `main` → `develop`** (PR, agent merges) so the version bump + any release fixes return to integration.
9. **Verify live** — `curl $SERVICE_URL/status` (backend), open the web prod URL, smoke the critical flow.

## Hotfix variant
`hotfix/x.y.z` off `main` → fix + gate → PR to `main` (agent merges) + tag → back-merge to `develop`.

## Delivery checklist (graded projects)
Source (zip + GitHub) · demo video (login/nav/CRUD/search/logout/errors-loading) · README (description, tech, install, `.env.example`, run steps, deploy links, test emails) · backend live during eval. **Remind the user to hand the real test password to the evaluator out-of-band** — it is never in the repo.
