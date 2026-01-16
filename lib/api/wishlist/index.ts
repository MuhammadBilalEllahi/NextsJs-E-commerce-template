const API_URL_WISHLIST = "/api/wishlist"; 

export async function getWishlist(sessionId?: string) {
  const url = sessionId
    ? `${API_URL_WISHLIST}?sessionId=${encodeURIComponent(sessionId)}`
    : API_URL_WISHLIST;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load wishlist");
  return res.json();
}

export async function addToWishlist(
  productId: string,
  variantId?: string,
  sessionId?: string
) {
  const body: any = { productId };
  if (variantId) body.variantId = variantId;
  if (sessionId) body.sessionId = sessionId;
  const res = await fetch(API_URL_WISHLIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to add to wishlist");
  return j;
}

export async function removeFromWishlist(
  productId: string,
  sessionId?: string
) {
  const url = sessionId
    ? `${API_URL_WISHLIST}?productId=${encodeURIComponent(
        productId
      )}&sessionId=${encodeURIComponent(sessionId)}`
    : `${API_URL_WISHLIST}?productId=${encodeURIComponent(productId)}`;
  const res = await fetch(url, { method: "DELETE" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to remove from wishlist");
  return j;
}
