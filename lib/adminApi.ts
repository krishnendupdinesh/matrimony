// lib/adminApi.ts
export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const adminFetch = (path: string, init: RequestInit = {}) =>
  fetch(API + path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "sammatham-admin",
      ...(init.headers ?? {}),
    },
  });
