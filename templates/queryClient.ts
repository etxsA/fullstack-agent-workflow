// templates/queryClient.ts → copy to `src/lib/queryClient.ts`
// One TanStack Query client + a central query-key factory. Mutations invalidate by key, so
// keep ALL keys here — never inline string arrays at call sites (typos silently break caching).

import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/utils/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s: avoid refetch storms on fast navigation
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        // Don't retry auth/permission/not-found; do retry transient network/5xx (up to 2x).
        if (isApiError(error) && [401, 403, 404, 400].includes(error.status)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

/**
 * Central query-key factory. Example domain (todo app) — adapt per project.
 * Pattern: `all` → list/detail builders. Invalidate the broadest key that covers a mutation.
 */
export const queryKeys = {
  user: {
    all: ["user"] as const,
    byFirebaseUuid: (uuid: string) => ["user", "firebaseUuid", uuid] as const,
  },
  taskLists: {
    all: ["taskLists"] as const,
    list: (page: number) => ["taskLists", "list", page] as const,
    withOldestPending: (page: number) =>
      ["taskLists", "withOldestPending", page] as const,
    detail: (id: number | string) => ["taskLists", "detail", id] as const,
    tasks: (id: number | string) => ["taskLists", id, "tasks"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    today: ["tasks", "today"] as const,
    detail: (id: number | string) => ["tasks", "detail", id] as const,
  },
  search: (q: string) => ["search", q] as const,
} as const;
