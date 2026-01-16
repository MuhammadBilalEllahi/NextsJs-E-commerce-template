import { API_URL_ADMIN_ORDERS } from "./index";


export async function getOrderDetails(orderId: string) {
  const res = await fetch(`${API_URL_ADMIN_ORDERS}/${encodeURIComponent(orderId)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load order details");
  return res.json();
}
