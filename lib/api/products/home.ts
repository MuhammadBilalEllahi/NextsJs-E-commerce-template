const API_URL_PRODUCTS = "/api/products";
const API_URL_PRODUCTS_GROCERY = `${API_URL_PRODUCTS}/grocery`;
const API_URL_PRODUCTS_FEATURED = `${API_URL_PRODUCTS}/featured`;
const API_URL_PRODUCTS_SPECIAL = `${API_URL_PRODUCTS}/special`;
const API_URL_PRODUCTS_TOP_SELLING = `${API_URL_PRODUCTS}/top-selling`;
const API_URL_PRODUCTS_NEW_ARRIVALS = `${API_URL_PRODUCTS}/new-arrivals`;

async function get(path: string) {
  const res = await fetch(path);
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Request failed");
  return j;
}

export async function listGroceryProducts(page = 1, limit = 6) {
  return get(
    `${API_URL_PRODUCTS_GROCERY}?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listFeaturedProducts(page = 1, limit = 6) {
  return get(
    `${API_URL_PRODUCTS_FEATURED}?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listSpecialProducts(page = 1, limit = 6) {
  return get(
    `${API_URL_PRODUCTS_SPECIAL}?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listTopSellingProducts(page = 1, limit = 6) {
  return get(
    `${API_URL_PRODUCTS_TOP_SELLING}?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}

export async function listNewArrivalProducts(page = 1, limit = 6) {
  return get(
    `${API_URL_PRODUCTS_NEW_ARRIVALS}?page=${encodeURIComponent(
      String(page)
    )}&limit=${encodeURIComponent(String(limit))}`
  );
}
