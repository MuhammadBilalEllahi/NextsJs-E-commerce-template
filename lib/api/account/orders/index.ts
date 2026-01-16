const API_URL_ORDERS = "/api/user/orders";
export async function getMyOrders() {
  const res = await fetch(API_URL_ORDERS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}
