# Stack preset — Frontend: Next.js (extension stub)

> **Stub.** Not used in the source projects; included as an extension point. The `Vite+React` preset is the default web choice. Pick Next.js only when you need SSR/SEO/edge rendering or server actions. Confirm all APIs via Context7 (Next.js App Router) before building.

## When to pick Next.js over Vite+React
- Need SSR/SSG/ISR, SEO-critical pages, or React Server Components.
- Edge middleware / server actions / route handlers as a BFF.
- Otherwise prefer Vite+React (simpler, the proven path here).

## ⚠️ The CORS-port trap is different
Next.js dev runs on **:3000**, not :5173. If the backend CORS allowlist is fixed to `:5173`, Next.js dev is **blocked** unless you either change the backend `quarkus.http.cors.origins` or run Next on 5173 (`next dev -p 5173`). Decide this BEFORE scaffolding. See `../knowledge/gotchas.md` (CORS).

## Scaffold + deps
```bash
npx create-next-app@latest <app> --ts --app --tailwind --eslint
cd <app> && codegraph init -i
npm i firebase axios @tanstack/react-query zustand react-hook-form zod
npx shadcn@latest init
```

## Reuse + adaptation notes
- **COPY VERBATIM** the same pure-TS core as the Vite preset (`types`, `utils`, `services`, `hooks`, `lib/queryClient`, `stores/authStore`).
- **Client vs server boundary:** the axios instance + Firebase client SDK + Zustand stores are **client-only** — mark those modules/components `"use client"`. Don't call the Firebase client SDK in Server Components.
- Env: public vars need the `NEXT_PUBLIC_` prefix (`process.env.NEXT_PUBLIC_*`), inlined client-side. Adapt `config/env.ts`.
- Auth bridge / http interceptors / two-system model: identical design (`../templates/http.ts`, `authStore.ts`), wired in a client root provider.
- Routing: App Router `app/` directory; protect route groups via a client guard or middleware.

## Verification gates
```bash
npx tsc --noEmit && npm run build      # next build clean
```
Then a browser spot-check. Add Vitest/RTL + Playwright if the rubric requires E2E.

## Deploy (Vercel)
First-class Vercel target. Set `NEXT_PUBLIC_*` env in Project Settings; mind the CORS hostname/regex as with Vite.
