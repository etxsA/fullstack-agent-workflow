# Verification gates

A phase is done only when its gates pass. Pick what applies.

## Frontend (TypeScript)
```bash
npx tsc --noEmit                       # type-check (clean)
# build / bundle:
npx expo export --platform ios         # Expo
npm run build                          # Vite / Next
```
- Expo: regenerate typed routes via the dev server before `tsc` (see gotchas).
- Exclude test files from the `tsc` build.

## Live API smoke test (frontend ↔ backend)
The most valuable gate: prove auth + the exact endpoints the client calls, end-to-end, with real data. No UI automation needed.
```bash
API_KEY=...            # Firebase web apiKey
BACKEND=https://.../   # deployed base URL
TOKEN=$(curl -s -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"<test>","password":"<pw>","returnSecureToken":true}' | jq -r .idToken)

curl -s "$BACKEND/<endpoint>" -H "Authorization: Bearer $TOKEN" | jq   # assert shape
```
Do create→update→delete cycles for mutations and assert the expected status codes / final 404. (Full recipe with SQL snapshots: the `test-endpoints` skill, modeled on the backend's `SKILLS.md`.)

## Backend (Quarkus)
```bash
./mvnw test                         # unit (Mockito, no Quarkus boot)
./mvnw verify                       # integration (@QuarkusTest, H2 MySQL-compat)
./mvnw package                      # builds target/quarkus-app
./mvnw quarkus:dev                  # local dev (http://localhost:8080, /q/dev, /q/swagger-ui)
```
- Two test philosophies: **Unit** (`*Test.java`, `@ExtendWith(MockitoExtension.class)`) and **Integration** (`*IntegrationTest.java`, `@QuarkusTest` + H2). Integration profiles: `H2TestProfile` (REST, recreate schema per run) and `UseCaseIntegrationTestProfile` (persists across classes → meticulous `@BeforeEach` cleanup in FK order; no `import.sql`, set up via Panache).
- Messaging: `%test` uses `smallrye-in-memory`; assert producer → consumer → stats without brokers.

## Runtime sanity (milestones)
- Mobile: boot the simulator, screenshot the screen (no redbox). Hard-reload Expo Go to view latest.
- Web: open `localhost:5173`, check the flow in the browser.

## Before every commit
- **Secret-guard**: `git diff --cached --name-only | grep -iE '\.env$|CLAUDE|IMPLEMENTATION_PLAN|service-account|firebase.*\.json'` must be empty.
- Update the task list (mark phase done) before opening the PR.
