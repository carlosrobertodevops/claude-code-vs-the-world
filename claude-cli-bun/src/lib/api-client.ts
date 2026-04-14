"use client";

const TOKEN_KEY = "lavaflow_token";

export const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `lavaflow_token=${token}; path=/; max-age=604800; samesite=lax`;
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "lavaflow_token=; path=/; max-age=0";
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(path.startsWith("http") ? path : `/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "Request failed");
  return json.data as T;
}
