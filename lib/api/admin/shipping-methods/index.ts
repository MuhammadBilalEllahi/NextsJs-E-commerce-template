export async function listShippingMethods() {
  const res = await fetch("/api/admin/shipping-methods", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load shipping methods");
  return res.json();
}

export async function saveShippingMethod(method: any) {
  const hasId = Boolean((method as any).id);
  const res = await fetch(
    hasId
      ? `/api/admin/shipping-methods/${(method as any).id}`
      : "/api/admin/shipping-methods",
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
  const res = await fetch(`/api/admin/shipping-methods/${id}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to delete shipping method");
  return j;
}
