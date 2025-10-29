async function get(path: string) {
  const res = await fetch(path);
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Request failed");
  return j;
}

export async function listGroceryProducts(page = 1, limit = 6) {
  return get(
    `/api/products/grocery?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listFeaturedProducts(page = 1, limit = 6) {
  return get(
    `/api/products/featured?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listSpecialProducts(page = 1, limit = 6) {
  return get(
    `/api/products/special?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listTopSellingProducts(page = 1, limit = 6) {
  return get(
    `/api/products/top-selling?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listNewArrivalProducts(page = 1, limit = 6) {
  return get(
    `/api/products/new-arrivals?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}
