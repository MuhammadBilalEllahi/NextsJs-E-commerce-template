import { CartIdentifier, CartItem } from "@/types/types";

const API_URL_CART = "/api/cart";


export async function getCart(params: CartIdentifier) {
  const search = new URLSearchParams();
  if (params.userId) search.set("userId", params.userId);
  if (params.sessionId) search.set("sessionId", params.sessionId);
  const res = await fetch(`${API_URL_CART}?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
}

export async function syncCart(
  items: CartItem[],
  params: CartIdentifier,
  operation: "add" | "update" | "remove" | "clear"
) {
  const search = new URLSearchParams();
  if (params.userId) search.set("userId", params.userId);
  if (params.sessionId) search.set("sessionId", params.sessionId);
  const res = await fetch(`${API_URL_CART}?${search.toString()}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.qty,
        priceSnapshot: item.price,
        label: item.variantLabel || null,
        slug: item.slug,
        sku: item.sku || null,
        name: item.name,
        image: item.image,
      })),
      ...params,
      operation,
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to sync cart");
  return j;
}
