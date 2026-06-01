# Stack preset — Frontend: Expo (React Native)

Mobile-first app, iOS-simulator demo target. Consumes a REST backend; Firebase identity. The default mobile preset. Shared conventions: `../knowledge/conventions.md`, `integrations.md`, `gotchas.md`.

## Scaffold
```bash
npx create-expo-app@latest <app> --template default        # pin SDK if needed: default@sdk-56
cd <app> && codegraph init -i
```
Confirm SDK/dep versions via `npx expo install` + Context7 — never guess. Recent line: Expo SDK ~56, RN 0.85, React 19, TS strict, expo-router ~6 (typedRoutes + reactCompiler on), `src/app/` layout, alias `@/* → ./src/*`.

## Deps (decided defaults)
```bash
npx expo install firebase @react-native-async-storage/async-storage
npx expo install axios @tanstack/react-query zustand
npx expo install nativewind tailwindcss@^3.4 @gluestack-ui/core tailwind-variants
npx expo install react-hook-form zod @react-native-community/datetimepicker
npx expo install react-native-gesture-handler react-native-reanimated expo-haptics
npx expo install -D jest jest-expo @testing-library/react-native @testing-library/jest-native
```
NativeWind v4 pairs with **Tailwind v3.4** (not v4). Gluestack via `npx gluestack-ui add <name>` (auto-targets `src/components/ui`). **Not used:** Detox, i18n, Redux, Storybook, Vitest.

## Structure
`src/app/` (expo-router routes) · `src/lib/{firebase,http}.ts` · `src/stores/` (zustand) · `src/services/*.service.ts` · `src/hooks/` (TanStack Query) · `src/types/api.ts` · `src/components/{ui,feedback,lists,tasks,common}` · `global.css`. **Screens never call axios directly:** screen → query hook → service → http. Drop in templates: `errors.ts`, `http.ts`, `queryClient.ts`, `authStore.ts` (see `../templates/`).

## Platform glue
- **Firebase RN persistence (v12 gotcha):** `getReactNativePersistence` is gone from the `firebase/auth` umbrella — import from scoped `@firebase/auth` via a typed indirection, wire `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`. See `gotchas.md`.
- Env: `EXPO_PUBLIC_*` via `process.env`, inlined into bundle (public by design).
- Icons: `expo-symbols` (SF Symbols) + `@expo/vector-icons` fallback; map from backend `Icon.iosName`/`androidName`.

## Verification gates
```bash
npx tsc --noEmit            # clean (regenerate typed routes from dev server FIRST — see below)
npx expo export --platform ios   # bundles clean
```
- **Typed routes** regenerate `.expo/types/router.d.ts` only from the **dev server** (`expo start`), NOT `expo export`. After adding/removing a route, boot the dev server a few seconds until it appears, then `tsc`. Don't `href:null` a route you still `router.push()` to.
- Simulator reload: `xcrun simctl terminate booted host.exp.Exponent` then `xcrun simctl openurl booted "exp://127.0.0.1:8081"`; screenshot `xcrun simctl io booted screenshot /tmp/x.png`.
- Exclude test files from the `tsc` build. Jest: stay on the jest-29 ecosystem (jest 30 breaks jest-expo); `react-test-renderer` must match React exactly.

## Deploy
iOS simulator / Expo Go for the demo; EAS build for store distribution when needed.
