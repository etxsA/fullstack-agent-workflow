# Integrations

How the pieces connect: auth, networking, CORS, env, deploy.

## Two-system auth (Firebase + backend user row)
Identity and app data live in two places:
1. **Firebase Auth** = identity provider. Client signs up/in directly (email/password) → ID token (JWT).
2. **Backend `users` table** = app-level record (role, profile…), linked by `firebaseUuid`.

A user is usable only when **both** exist. After Firebase sign-up the client must `POST /user`; otherwise every protected endpoint returns 401 (no auto-provisioning). Flow:
```
createUserWithEmailAndPassword → uid + idToken
GET /user?firebaseUuid=uid   (exists?)
if 404 → POST /user { fullName, email, role, description, firebaseUuid: uid }
store session; send Authorization: Bearer <idToken> on every protected call
```
Backend verifies the token with the Firebase Admin SDK in a request filter, looks up the user by uid, and populates a request-scoped `CurrentUser`. (Advanced tier: soft-deleted users → 403; manual role checks per resource.)

## Networking (axios instance + interceptors)
A single custom instance (`src/lib/http.ts`):
- **Request interceptor** attaches the token: `getAuth().currentUser?.getIdToken()` per request (auto-refreshes).
- **Response interceptor**: on 401, force-refresh once + retry; if still 401 → logout + route to login. Normalize all errors to a typed `ApiError { status, message, violations?, isNetworkError }` (`utils/errors.ts`) — show `violations[].message`, never hard-code field paths.
- Decoupled via an **auth bridge** (`configureHttpAuth({ getToken, onAuthExpired })`) so the networking layer doesn't import Firebase directly (testable).
- TanStack Query consumes services; mutations invalidate the right query keys; toggles use optimistic updates with rollback.

Storage of session: AsyncStorage (RN) / `browserLocalPersistence` (web, automatic).

## CORS (critical for web)
The backend keeps a fixed allowlist (`quarkus.http.cors.origins`). Real example: `http://localhost:5173,http://127.0.0.1:5173, https://<vercel-name>.*.vercel.app`. Consequences:
- Web dev server **must** use the allowlisted port (Vite → 5173).
- Production web **must** deploy to a Vercel project whose hostname matches the regex.
- Native mobile is unaffected by CORS.
If you can change the backend, update `cors.origins`; if not, conform the frontend.

## Environment
- Frontend public env: `EXPO_PUBLIC_*` (Expo, `process.env`) / `VITE_*` (Vite, `import.meta.env`). Inlined into the bundle — public by design (the Firebase web apiKey is not a secret). `.env` gitignored; `.env.example` placeholders.
- Backend env via `${VAR:default}` fallbacks; profiles `%dev`/`%test`/prod; secrets (Firebase service-account JSON, DB password) injected at runtime, never in the repo/image.

## Deploy targets
- **Backend → GCP**: Cloud Build → Artifact Registry → Cloud Run; Firebase JSON + DB password from **Secret Manager** (mounted volume / `--set-secrets`); Cloud SQL via `DB_JDBC_URL` socketFactory. See `deploy-gcp.md`.
- **Web → Vercel**: project name must satisfy the backend CORS regex; set `VITE_*` env in Vercel; public deploy required for any "extra points".
- **Mobile → Expo**: demoed in the iOS simulator / Expo Go; EAS for store builds when needed.
