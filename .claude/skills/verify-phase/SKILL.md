---
name: verify-phase
description: Run the verification gates for a phase before opening its PR — type-check/build/export for frontend, mvnw test/verify for backend, and the live API smoke test (Firebase token -> curl -> SQL snapshot). Trigger: /verify-phase, "verify this phase", "run the gates", "test the endpoints".
---

# verify-phase — the gate before every PR

A phase isn't done until its gates pass. Pick the gates that apply (`knowledge/verification.md`). Run them, fix failures, only then let the agent open + merge the PR.

## Frontend gates
```bash
npx tsc --noEmit                    # clean
# Expo: regenerate typed routes from the DEV SERVER first, then:
npx expo export --platform ios
# Vite/Next:
npm run build
```
Exclude test files from the `tsc` build. Milestone runtime check: boot the simulator / open `localhost:5173` and eyeball it (no redbox / console errors).

## Backend gates
```bash
./mvnw test                         # unit (Mockito)
./mvnw verify -DskipITs=false       # integration (@QuarkusTest, H2)
./mvnw package                      # builds target/quarkus-app
```

## Live API smoke test (the most valuable gate — token → curl → SQL)
Prove auth + the exact endpoints the client calls, end-to-end, against real data. Modeled on the source project's `SKILLS.md`. Run steps 1→5 automatically; only ask in step 1 if an input is missing.

1. **Token** (read creds from `.env`, never hardcode):
   ```bash
   API_KEY=$(grep '^FIREBASE_API_KEY=' .env | cut -d= -f2)
   TOKEN=$(curl -s -X POST \
     "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"email":"<EMAIL>","password":"<PW>","returnSecureToken":true}' | jq -r .idToken)
   ```
   Token expires in 1h; re-generate on 401.
2. **SQL snapshot (pre)** — only for state-changing tests; scope by id/user_id, never `SELECT *` without WHERE.
3. **Call the endpoint** with `-w "\n%{http_code}\n"` and `Authorization: Bearer $TOKEN`.
4. **SQL snapshot (post)** — same query; diff before/after.
5. **Report** compact: `Endpoint · Status · Response · DB before/after · Verdict ✅/❌`. Results only, no narrative.

Do create→update→delete cycles for mutations; assert the status codes and the final 404. Don't restart the server or touch `.env`; if env is broken, report and stop.

## Before the PR
- **Secret-guard:** `git diff --cached --name-only | grep -iE '\.env$|CLAUDE|IMPLEMENTATION_PLAN|service-account|firebase.*\.json'` must be empty.
- Update the phase tracker. Then the agent creates + merges the PR (`knowledge/conventions.md`).
