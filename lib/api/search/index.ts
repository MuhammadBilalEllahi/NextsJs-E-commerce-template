const API_URL_SEARCH = "/api/search";
export async function searchProducts(q: string, limit = 6) {
  const res = await fetch(
    `${API_URL_SEARCH}?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(
      String(limit)
    )}`
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Search failed");
  return j;
}
