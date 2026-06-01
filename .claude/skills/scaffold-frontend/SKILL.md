---
name: scaffold-frontend
description: Bootstrap the frontend (Phase 0) for a workflow project — Expo, Vite+React, or Next.js — with deps, structure, env, codegraph, and the portable building blocks wired. Trigger: /scaffold-frontend, "bootstrap the Expo/Vite frontend", "set up the frontend phase 0".
---

# scaffold-frontend — Phase 0 (frontend)

Stand up a clean, buildable frontend shell following the chosen preset. This is Phase 0 of a frontend build; feature phases come after.

**Read the chosen preset first:** `stacks/frontend-expo.md` · `stacks/frontend-vite-react.md` · `stacks/frontend-nextjs.md`. They carry the exact scaffold command, deps, structure, and gotchas. This skill is the procedure around them.

## Steps
1. **Branch:** `git checkout -b feature/bootstrap develop` (create `develop` first if missing).
2. **Scaffold** with the preset's command. Confirm tool/SDK/dep versions via `npx expo install` / Context7 — never guess.
3. **Deps:** install the preset's decided set (state, server-cache, styling, forms, auth, tests). Use the platform installer (`npx expo install` pins SDK-correct versions).
4. **Structure:** create the preset's `src/` layout. Drop in the building blocks from `templates/`:
   - `errors.ts` → `src/utils/errors.ts`
   - `http.ts` → `src/lib/http.ts`
   - `queryClient.ts` → `src/lib/queryClient.ts`
   - `authStore.ts` → `src/stores/authStore.ts`
   - Adapt per preset (Expo `EXPO_PUBLIC_*` + AsyncStorage persistence vs Vite `VITE_*` + `browserLocalPersistence`; Next `NEXT_PUBLIC_*` + `"use client"`).
5. **Env:** `.gitignore` from `templates/gitignore.template`; `.env.example` from `templates/.env.example` (trim to stack). Put REAL values only in `.env` + `CLAUDE.md` (both gitignored).
6. **Codegraph:** `codegraph init -i`.
7. **Gate (Phase 0):** the preset's build gate must pass clean —
   - Expo: `npx tsc --noEmit` + `npx expo export --platform ios` (regenerate typed routes from the dev server first).
   - Vite/Next: `npx tsc --noEmit` + `npm run build`.
8. **Secret-guard** (`knowledge/verification.md`) then **agent creates AND merges** PR #1 → `develop`. Branch first for Phase 1.

## Gotchas to pre-empt (see `knowledge/gotchas.md`)
NativeWind v4 ↔ Tailwind v3.4 · typed-routes regen only from the dev server · Firebase v12 RN persistence import quirk · jest-expo on the jest-29 ecosystem · Vite must pin the CORS-allowlisted port · Next dev on :3000 vs a :5173 allowlist.

Next: `add-feature` per the plan's phase table; `verify-phase` for each gate; `add-optional` for i18n/e2e/storybook/ci.
