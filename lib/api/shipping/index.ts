export type ShippingQuery = {
  city: string;
  state: string;
  country: string;
  subtotal: number | string;
};

export async function getShippingMethods(params: ShippingQuery) {
  const search = new URLSearchParams({
    city: params.city,
    state: params.state,
    country: params.country,
    subtotal: String(params.subtotal),
  });
  const res = await fetch(`/api/shipping-methods?${search.toString()}`);
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to fetch shipping methods");
  return j;
}
