export type AdminWishlistQuery = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  productId?: string;
};

export async function listAdminWishlist(query: AdminWishlistQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.userId) params.set("userId", query.userId);
  if (query.productId) params.set("productId", query.productId);
  const res = await fetch(`/api/admin/wishlist?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load wishlist");
  return res.json();
}

export async function deleteAdminWishlistItem(id: string) {
  const res = await fetch(`/api/admin/wishlist?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete item");
  return j;
}
