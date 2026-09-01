import type { ApiEnvelope } from "../types";

const TOKEN_KEY = "farmdirect.token";
const USER_KEY = "farmdirect.user";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getCachedUser(): unknown | null {
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
export function setCachedUser(u: unknown) {
  localStorage.setItem(USER_KEY, u ? JSON.stringify(u) : "");
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 500, code = "ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const base = path.startsWith("/") ? path : "/" + path;
  const res = await fetch(base, { ...init, headers });
  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new ApiError(
      json?.error?.message || `Request failed ${res.status}`,
      res.status,
      json?.error?.code || "HTTP"
    );
  }
  if (json && json.success === false) {
    throw new ApiError(
      json.error?.message || "Error",
      res.status,
      json.error?.code || "ERROR"
    );
  }
  return (json?.data as T) ?? (null as unknown as T);
}
