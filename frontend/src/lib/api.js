// Empty in production (same origin as Express); in dev Vite proxies `/api` to the backend.
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * fetch wrapper for our Express API.
 * Pass `token` (a Clerk session token) for routes that need a signed-in user.
 */
export async function apiFetch(path, { token, body, headers, ...init } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? res.statusText, data);
  }

  return data;
}
