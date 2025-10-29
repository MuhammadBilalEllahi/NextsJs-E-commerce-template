export async function getWishlist(sessionId?: string) {
  const url = sessionId
    ? `/api/wishlist?sessionId=${encodeURIComponent(sessionId)}`
    : "/api/wishlist";
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
  const res = await fetch("/api/wishlist", {
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
    ? `/api/wishlist?productId=${encodeURIComponent(
        productId
      )}&sessionId=${encodeURIComponent(sessionId)}`
    : `/api/wishlist?productId=${encodeURIComponent(productId)}`;
  const res = await fetch(url, { method: "DELETE" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to remove from wishlist");
  return j;
}
