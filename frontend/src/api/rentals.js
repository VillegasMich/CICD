const BASE = "/api/v1/rentals";

export async function fetchRentals() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch rentals");
  return res.json();
}

export async function createRental(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to start rental");
  return res.json();
}

export async function completeRental(id) {
  const res = await fetch(`${BASE}/${id}/complete`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to complete rental");
  return res.json();
}
