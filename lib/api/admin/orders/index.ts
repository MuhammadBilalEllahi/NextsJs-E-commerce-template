export type OrdersQuery = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export async function listOrders({
  page = 1,
  limit = 50,
  status = "",
  search = "",
}: OrdersQuery) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const res = await fetch(`/api/admin/orders?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  cancellationReason?: string
) {
  const payload: any = { orderId, status, changedBy: "admin" };
  if (status === "cancelled" && cancellationReason)
    payload.cancellationReason = cancellationReason;
  const res = await fetch("/api/admin/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update order status");
  return res.json();
}

export async function updateOrderTracking(orderId: string, tracking: string) {
  const res = await fetch("/api/admin/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, tracking }),
  });
  if (!res.ok) throw new Error("Failed to update tracking");
  return res.json();
}
