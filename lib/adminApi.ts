// Backwards-compatible wrapper around lib/api.ts for admin requests.
import { API_URL, adminApiFetch } from "./api";

export const API = API_URL;
export { adminApiFetch };

// Raw fetch helper kept for any admin pages not yet migrated to adminApiFetch.
export const adminFetch = (path: string, init: RequestInit = {}) =>
  fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "sammatham-admin",
      ...(init.headers ?? {}),
    },
  });
