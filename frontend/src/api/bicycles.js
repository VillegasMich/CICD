const BASE = "/api/v1/bicycles";

export async function fetchBicycles() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch bicycles");
  return res.json();
}

export async function createBicycle(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create bicycle");
  return res.json();
}

export async function updateBicycle(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update bicycle");
  return res.json();
}

export async function deleteBicycle(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bicycle");
}
