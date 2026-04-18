import { apiFetch } from "./client";

const BASE = "/api/v1/auth";

export async function register(data) {
  const res = await apiFetch(`${BASE}/register`, { method: "POST", body: data });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to register");
  }
  return res.json();
}

export async function login(data) {
  const res = await apiFetch(`${BASE}/login`, { method: "POST", body: data });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid credentials");
  }
  return res.json();
}

export async function fetchMe() {
  const res = await apiFetch(`${BASE}/me`);
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}
