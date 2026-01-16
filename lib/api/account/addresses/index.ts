const API_URL_ADDRESSES = "/api/addresses";
export async function listAddresses() {
  const res = await fetch(API_URL_ADDRESSES, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load addresses");
  return res.json();
}

export async function saveAddress(payload: any) {
  const hasId = Boolean(payload?.id);
  const res = await fetch(API_URL_ADDRESSES, {
    method: hasId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to save address");
  return j;
}

export async function deleteAddress(id: string) {
  const res = await fetch(`${API_URL_ADDRESSES}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to delete address");
  return j;
}
