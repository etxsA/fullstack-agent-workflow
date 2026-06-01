// templates/errors.ts → copy to `src/utils/errors.ts`
// Normalizes every failure (axios, network, validation) into one typed shape the UI can trust.
// Pair with http.ts (its response interceptor calls normalizeError).

import axios from "axios";

/** A single Bean-Validation violation from the backend (400 body). */
export interface ApiViolation {
  field?: string;
  message: string;
}

/** The ONE error shape the app handles. Never surface raw axios errors to the UI. */
export interface ApiError {
  status: number; // HTTP status, or 0 for network/unknown
  message: string; // user-displayable
  violations?: ApiViolation[]; // present on 400 validation failures
  isNetworkError: boolean;
}

export function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "isNetworkError" in e;
}

/**
 * Convert any thrown value into an ApiError.
 * Rule: show `violations[].message` when present — never hard-code field paths,
 * because JSON-B omits null keys and the backend owns the field names.
 */
export function normalizeError(err: unknown): ApiError {
  if (isApiError(err)) return err;

  if (axios.isAxiosError(err)) {
    // No response object => the request never reached the server.
    if (!err.response) {
      return {
        status: 0,
        message: "No connection. Check your network and try again.",
        isNetworkError: true,
      };
    }

    const { status, data } = err.response;
    const violations: ApiViolation[] | undefined = Array.isArray(
      (data as { violations?: ApiViolation[] })?.violations,
    )
      ? (data as { violations: ApiViolation[] }).violations
      : undefined;

    const serverMsg =
      (data as { message?: string; error?: string })?.message ??
      (data as { error?: string })?.error;

    return {
      status,
      message: serverMsg ?? defaultMessageFor(status),
      violations,
      isNetworkError: false,
    };
  }

  return {
    status: 0,
    message: err instanceof Error ? err.message : "Something went wrong.",
    isNetworkError: false,
  };
}

function defaultMessageFor(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Your session expired. Please sign in again.";
    case 403:
      return "You don't have access to this.";
    case 404:
      return "Not found.";
    case 500:
      return "Server error. Try again later.";
    default:
      return "Something went wrong.";
  }
}
