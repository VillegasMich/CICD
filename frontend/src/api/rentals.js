import { apiFetch } from "./client";

const BASE = "/api/v1/rentals";

export async function fetchRentals() {
  const res = await apiFetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch rentals");
  return res.json();
}

export async function createRental(data) {
  const res = await apiFetch(BASE, { method: "POST", body: data });
  if (!res.ok) throw new Error("Failed to start rental");
  return res.json();
}

export async function completeRental(id) {
  const res = await apiFetch(`${BASE}/${id}/complete`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to complete rental");
  return res.json();
}
