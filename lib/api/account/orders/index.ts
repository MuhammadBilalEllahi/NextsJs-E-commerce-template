export async function getMyOrders() {
  const res = await fetch("/api/user/orders", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}
