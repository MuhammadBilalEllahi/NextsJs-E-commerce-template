export async function getOrderDetails(orderId: string) {
  const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load order details");
  return res.json();
}
