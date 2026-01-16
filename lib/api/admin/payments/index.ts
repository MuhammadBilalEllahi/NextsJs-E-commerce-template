const API_URL_ADMIN_PAYMENTS = "/api/admin/payments";
export async function listPayments() {
  const res = await fetch(API_URL_ADMIN_PAYMENTS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load payments");
  return res.json();
}

export async function updatePayment(orderId: string, paymentStatus: string) {
  const res = await fetch(API_URL_ADMIN_PAYMENTS, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, paymentStatus }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update payment");
  return j;
}
