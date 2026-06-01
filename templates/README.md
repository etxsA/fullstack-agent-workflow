# templates/ — portable building blocks

Drop-in files distilled from the source projects. Copy into a target project and rename/fill as noted. Code templates use the `@/*` path alias and the canonical patterns from `../knowledge/` (`integrations.md`, `conventions.md`, `gotchas.md`).

| Template | Copy to | Notes |
|---|---|---|
| `gitignore.template` | `.gitignore` | Public-repo secret baseline (ignores `.env`, `CLAUDE.md`, `IMPLEMENTATION_PLAN.md`, native creds). |
| `.env.example` | `.env.example` (tracked) | Placeholders only. Pick the EXPO_PUBLIC_ or VITE_ set for your stack. |
| `CLAUDE.template.md` | `CLAUDE.md` (**gitignored**) | Project context skeleton. Real creds go here only because it's gitignored. |
| `IMPLEMENTATION_PLAN.template.md` | `IMPLEMENTATION_PLAN.md` (**gitignored**) | Phased build plan; produced + approved before code. |
| `errors.ts` | `src/utils/errors.ts` | `ApiError` shape + `normalizeError()`. |
| `http.ts` | `src/lib/http.ts` | axios instance + interceptors + auth bridge (`configureHttpAuth`). Depends on `errors.ts`. |
| `queryClient.ts` | `src/lib/queryClient.ts` | TanStack Query client + central `queryKeys` factory. |
| `authStore.ts` | `src/stores/authStore.ts` | Zustand auth store; wires the http auth bridge at `bootstrap()`. |

**Why `.template.md` suffixes** on CLAUDE / IMPLEMENTATION_PLAN: the literal filenames are gitignored in target projects AND match the secret-guard grep — the suffix lets the workflow repo track them as templates without collision, and signals "copy + rename me."

**Code templates are starting points, not frozen.** Adapt the `queryKeys` domain, the env-var prefix (Expo vs Vite — keep one), and the Firebase persistence wiring (RN `getReactNativePersistence` vs web `browserLocalPersistence`) per target. Confirm library APIs via Context7 at scaffold time.
