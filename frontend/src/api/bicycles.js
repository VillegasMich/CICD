import { apiFetch } from "./client";

const BASE = "/api/v1/bicycles";

export async function fetchBicycles() {
  const res = await apiFetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch bicycles");
  return res.json();
}

export async function fetchBicycle(id) {
  const res = await apiFetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch bicycle");
  return res.json();
}

export async function createBicycle(data) {
  const res = await apiFetch(BASE, { method: "POST", body: data });
  if (!res.ok) throw new Error("Failed to create bicycle");
  return res.json();
}

export async function updateBicycle(id, data) {
  const res = await apiFetch(`${BASE}/${id}`, { method: "PUT", body: data });
  if (!res.ok) throw new Error("Failed to update bicycle");
  return res.json();
}

export async function deleteBicycle(id) {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bicycle");
}
