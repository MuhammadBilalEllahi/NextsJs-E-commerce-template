import { ShippingQuery } from "@/types";


const API_URL_SHIPPING_METHODS = "/api/shipping-methods";

export async function getShippingMethods(params: ShippingQuery) {
  const search = new URLSearchParams({
    city: params.city,
    state: params.state,
    country: params.country,
    subtotal: String(params.subtotal),
  });
  const res = await fetch(`${API_URL_SHIPPING_METHODS}?${search.toString()}`);
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to fetch shipping methods");
  return j;
}
