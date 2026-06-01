# Tech matrix

For each concern: options, the default, and when to pick an alternative. The `/new-fullstack` intake walks this.

## Frontend
| Concern | Options | Default | Pick alternative when… |
|---|---|---|---|
| Project type | mobile / web / both / backend-only | (ask) | — |
| Mobile | Expo · React Native CLI | **Expo** | you need custom native modules not in Expo / bare workflow |
| Web | Vite+React · Next.js | **Vite+React** | you need SSR/SEO/edge → Next (but mind the CORS port: Next dev is :3000) |
| Routing | expo-router · React Router · TanStack Router | file-based default | heavy data-loading routers → TanStack Router |
| Server cache | TanStack Query · SWR · RTK Query | **TanStack Query** | already on Redux → RTK Query |
| Client state | Zustand · Redux Toolkit · Jotai · Context | **Zustand** | enterprise/time-travel → Redux; atomic granularity → Jotai; trivial → Context |
| Styling | NativeWind/Gluestack · Tailwind/shadcn · StyleSheet | Tailwind-based | design system constraints; team familiarity |
| Forms | react-hook-form+zod · Formik+yup | **rhf+zod** | — |
| HTTP | axios+interceptors · fetch wrapper | **axios** | tiny app with no interceptor needs → fetch wrapper |
| Auth | Firebase · Auth0 · custom JWT | **Firebase** | backend issues its own JWT → custom; enterprise SSO → Auth0 |
| Unit tests | Jest/RNTL · Vitest/RTL | per platform | — |
| E2E | Detox (mobile) · Cypress/Playwright (web) | **optional** | critical flows need full coverage |
| i18n | i18next/react-i18next · expo-localization | **optional** | multi-locale requirement |

## Backend
| Concern | Options | Default | Pick alternative when… |
|---|---|---|---|
| Tier | basic · advanced | **basic** | spatial/AI/reports/strict-OpenAPI/native needed → advanced |
| REST/JSON | RESTEasy-JSONB · Quarkus-REST+Jackson | jsonb (basic) | Jackson features / custom serializers → advanced |
| DB | MySQL · Postgres · H2(test) | MySQL | — |
| Schema | drop-and-create(dev) · update(prod) | per profile | — |
| Auth | Firebase Admin filter · own JWT | **Firebase** | non-Firebase identity |
| Modules | spatial · ai-llm · reports · messaging(kafka/rabbit) · testing-native | none | per feature need (see `optionals.md`/`stacks/backend-quarkus/modules`) |
| Deploy | GCP Cloud Run · other | **Cloud Run** | existing infra elsewhere |
