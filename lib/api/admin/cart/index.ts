export type AdminCartQuery = {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  sessionId?: string;
};

export async function listAdminCarts(query: AdminCartQuery) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.userId) params.set("userId", query.userId);
  if (query.sessionId) params.set("sessionId", query.sessionId);
  const res = await fetch(`/api/admin/cart?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load carts");
  return res.json();
}

export async function deleteAdminCart(id: string) {
  const res = await fetch(`/api/admin/cart?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete cart");
  return j;
}
