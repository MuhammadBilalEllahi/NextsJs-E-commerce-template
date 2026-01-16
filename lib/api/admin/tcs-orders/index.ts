import { TcsOrdersQuery } from "@/types";
const API_URL_ADMIN_TCS_ORDERS = "/api/admin/tcs-orders";


export async function listTcsOrders({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}: TcsOrdersQuery) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const res = await fetch(`${API_URL_ADMIN_TCS_ORDERS}?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load TCS orders");
  return res.json();
}

export async function actOnTcsOrder(
  orderId: string,
  action: string,
  actionData?: Record<string, unknown>
) {
  const res = await fetch(`${API_URL_ADMIN_TCS_ORDERS}/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...(actionData || {}) }),
  });
  if (!res.ok) throw new Error(`Failed to ${action} TCS order`);
  return res.json();
}
