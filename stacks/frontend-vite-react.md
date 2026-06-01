# Stack preset — Frontend: Vite + React

Web SPA, deploy to Vercel. Often a **port of an existing Expo app** sharing the same backend + Firebase project — so the reuse policy below is the core of this preset. Shared conventions: `../knowledge/conventions.md`, `integrations.md`, `gotchas.md`.

## ⚠️ Hard constraint — CORS port
The backend CORS allowlist is usually fixed. Consequences (see `gotchas.md` + `integrations.md`):
1. **Dev server MUST run on the allowlisted port** (typically 5173). Pin it: `vite.config.ts` → `server: { port: 5173, host: true }`. A Vite fallback port breaks CORS.
2. **Production Vercel project name must match the backend's CORS regex** (e.g. `<your-app>-*.vercel.app`). Verify the name is free early; if taken, the backend regex must change — flag to the user before deploying.
3. Env vars use the **`VITE_`** prefix via `import.meta.env` — never `process.env`/`EXPO_PUBLIC_*`.

## Scaffold + deps
```bash
npm create vite@latest <app> -- --template react-ts
cd <app> && codegraph init -i
npm i firebase axios @tanstack/react-query zustand react-router-dom react-hook-form zod
npm i -D vitest @testing-library/react @testing-library/jest-dom cypress
npx shadcn@latest init     # Tailwind + shadcn/ui
```

## Reuse policy (porting from Expo) — copy / adapt / rebuild
- **COPY VERBATIM** (pure TS, zero RN): `types/api.ts`, `utils/{errors,format,queryKeys,validation,smartLists,taskSort}.ts`, `services/*`, `hooks/*`, `lib/queryClient.ts`, `stores/authStore.ts`. If a "copy" file imports something RN-specific, it belongs in ADAPT — stop, don't silently edit.
- **ADAPT** (logic identical, swap glue): `config/env.ts` → `import.meta.env.VITE_*`; `lib/firebase.ts` → `getAuth(app)`, web auto-persists via `browserLocalPersistence` (delete all AsyncStorage/`getReactNativePersistence`/`initializeAuth`); `lib/http.ts` → identical instance+bridge, only base-url source changes; `themeStore` → `createJSONStorage(() => localStorage)` + toggle `.dark` on `documentElement`.
- **REBUILD for DOM:** everything in `components/` (RN+Gluestack → HTML+Tailwind+shadcn); screens `app/` (expo-router) → `routes/*` (React Router `createBrowserRouter`); nav → sidebar/topbar shell; no-web-analog interactions (swipe→`⋯` menu, haptics→none) **keep the optimistic cache update behind them**.

## Structure
`src/{types,utils,lib,config,services,hooks,stores,components,routes,app}` + `main.tsx` (providers + `RouterProvider`). `<ProtectedRoute>` reads `authStore().status` (`init`→splash, `guest`→`/login`, `authed`→render). Drop in `../templates/` http/errors/queryClient/authStore.

## Verification gates
```bash
npx tsc --noEmit && npm run build      # clean
# browser spot-check at localhost:5173 (the allowlisted port)
npm run test       # Vitest + RTL
npx cypress run    # E2E: baseUrl http://localhost:5173, live backend; login→nav→CRUD→search→logout + an error path
```
Prefer semantic queries (`getByRole`/`getByText`); `data-testid` (`btn-`,`input-`,`txt-`,`card-`) as fallback.

## Deploy (Vercel)
Project name satisfies the CORS regex; set the same `VITE_*` vars in Project Settings; public deploy. Never commit `.env`/real keys (CI logs + PR body included).
