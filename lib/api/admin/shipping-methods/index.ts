const API_URL_ADMIN_SHIPPING_METHODS = "/api/admin/shipping-methods";
export async function listShippingMethods() {
  const res = await fetch(API_URL_ADMIN_SHIPPING_METHODS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load shipping methods");
  return res.json();
}

export async function saveShippingMethod(method: any) {
  const hasId = Boolean((method as any).id);
  const res = await fetch(
    hasId
      ? `${API_URL_ADMIN_SHIPPING_METHODS}/${(method as any).id}`
      : API_URL_ADMIN_SHIPPING_METHODS,
    {
      method: hasId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(method),
    }
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to save shipping method");
  return j;
}

export async function deleteShippingMethod(id: string) {
  const res = await fetch(`${API_URL_ADMIN_SHIPPING_METHODS}/${id}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to delete shipping method");
  return j;
}
