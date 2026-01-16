const API_URL_CHECKOUT = "/api/checkout";
export async function createCheckout(orderData: any) {
  const res = await fetch(API_URL_CHECKOUT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Checkout failed");
  return j;
}
