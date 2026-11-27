// Central API fetch wrapper for all member and admin backend requests.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

// Custom error class carrying the HTTP status code and backend message.
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

// Sends a credentialed request to the backend, unwraps { success, data }, and throws ApiError on failure.
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: "include",
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server. Please check your connection and try again.", 0);
  }

  let payload: { success?: boolean; data?: T; message?: string; error?: string } | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.message ||
      payload?.error ||
      (response.status === 401
        ? "Please sign in to continue."
        : "Something went wrong. Please try again.");
    throw new ApiError(message, response.status);
  }

  return (payload?.data ?? payload) as T;
}

// Sends a credentialed admin request with the required CSRF header and unwraps { success, data }.
export async function adminApiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const mergedHeaders: Record<string, string> = {
    "X-Requested-With": "sammatham-admin",
    ...(options.headers as Record<string, string> | undefined),
  };
  return apiFetch<T>(path, { ...options, headers: mergedHeaders });
}
