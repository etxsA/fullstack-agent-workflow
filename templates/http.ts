// templates/http.ts → copy to `src/lib/http.ts`
// Single axios instance + interceptors. REQUIRED pattern: screens never import this directly —
// screen → query hook → service → http. Services import `http`; the auth layer wires the bridge once.
//
// Decoupled from Firebase via an auth bridge (configureHttpAuth) so this file is testable and
// the networking layer doesn't import the auth SDK. Call configureHttpAuth() once at app boot
// (in authStore bootstrap / firebase init).

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { normalizeError } from "@/utils/errors";

// --- env (Expo: process.env.EXPO_PUBLIC_* · Vite: import.meta.env.VITE_*) ---
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  // @ts-expect-error vite-only global; remove the branch you don't use
  (typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : undefined) ??
  "http://localhost:8080";

// ---------------- Auth bridge ----------------
// The auth layer injects these so http.ts never imports Firebase.
type AuthBridge = {
  getToken: (forceRefresh?: boolean) => Promise<string | null>;
  onAuthExpired: () => void;
};

let authBridge: AuthBridge = {
  getToken: async () => null,
  onAuthExpired: () => {},
};

export function configureHttpAuth(bridge: AuthBridge): void {
  authBridge = bridge;
}

// ---------------- Instance ----------------
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Request: attach a fresh token per request (Firebase auto-refreshes inside getToken).
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await authBridge.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: one 401 retry with a force-refreshed token; then logout. Normalize all errors.
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const fresh = await authBridge.getToken(true); // force refresh
      if (fresh) {
        original.headers.Authorization = `Bearer ${fresh}`;
        return http(original);
      }
      authBridge.onAuthExpired(); // refresh failed → logout + route to login
    }

    return Promise.reject(normalizeError(error));
  },
);
