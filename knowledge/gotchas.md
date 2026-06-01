# Gotchas (learned the hard way)

Cross-cutting traps from the real builds. Check these before debugging blind.

## Expo / React Native
- **Stale Expo Go bundle.** `expo start --clear` restarts the server but the app keeps the old JS. To see edits: `xcrun simctl terminate booted host.exp.Exponent` then `xcrun simctl openurl booted "exp://127.0.0.1:8081"`. Screenshot: `xcrun simctl io booted screenshot /tmp/x.png`.
- **Typed routes (`typedRoutes: true`)** regenerate `.expo/types/router.d.ts` **only from the dev server** (`expo start`), NOT from `expo export`. After adding/removing routes, boot the dev server a few seconds (until the route appears in the file) before `tsc`, or `tsc` flags the new route as an invalid `Href`. Don't use `href:null` for a route you still `router.push()` to (it's excluded from the Href union) — hide it via a custom tab bar instead.
- **Firebase v12 RN persistence.** `getReactNativePersistence` is gone from the `firebase/auth` umbrella (dropped the `react-native` export condition); import auth from the scoped **`@firebase/auth`** package, and reach `getReactNativePersistence` via a typed indirection (the package's top-level `types` entry hides it from TS even though the RN build ships it).
- **NativeWind v4** pairs with Tailwind v3.4 (not v4). Gluestack CLI (`gluestack-ui add`) auto-targets `src/components/ui`. Theme via CSS variables in the provider config so brand chrome flips with mode.
- **Jest**: jest-expo needs the jest 29 ecosystem (jest 30 breaks with `clearMocksOnScope`) + `@react-native/jest-preset` peer dep; `react-test-renderer` must match React exactly; exclude test files from the `tsc` build.

## Web (Vite/React)
- **CORS is bound to origin.** If the backend allowlist is fixed (e.g. `localhost:5173` + a Vercel name regex), the web app **must** run on that dev port (Vite's 5173) and deploy to a Vercel project whose name matches the regex. Next.js dev on :3000 would be blocked unless the backend CORS is changed.

## Backend (Quarkus)
- **`import.sql` (Hibernate 6):** `INSERT` must name columns explicitly (`INSERT INTO T (c1,c2) VALUES …`) due to DDL column-order drift; escape reserved words (`` `long` ``).
- **Messaging `@Blocking`:** an `@Incoming` handler that blocks (`Thread.sleep`, JDBC, blocking HTTP) freezes the poll loop and SmallRye closes the channel — annotate `@Blocking` to run on a worker thread.
- **RabbitMQ consumers receive `JsonObject`**, not your POJO (no typed deserializer concept in AMQP) — use `json.mapTo(Pojo.class)`. Kafka uses a typed `value.deserializer` (subclass `JsonbDeserializer` with a no-arg ctor to fix the target type).
- **Register a batch in stats before sending** the messages, so an immediate `GET /status/{batchId}` doesn't 404.
- **Schema strategy by profile**: prod `update`, dev `drop-and-create`, test `update`/H2; `%test` messaging uses `smallrye-in-memory` (no brokers).

## Backend-as-data (when consuming a backend you don't control)
- It may have **no per-resource ownership checks** — the client must only ever act on the signed-in user's own data.
- A `PATCH` may be a **full replace** — send every field, not a partial.
- JSON-B **omits null fields** — every nullable field is optional in client types; boolean getters drop the `is` prefix (`isCompleted` → `completed`).
- The **DB may reset on reboot** (drop-and-create + import.sql) — re-verify seed data before a demo.

## General
- Don't trust "it compiled" for runtime — run a **live API smoke test** and (for UI) a simulator/browser screenshot at milestones.
