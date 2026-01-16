import { CustomersQuery } from "@/types";

const API_URL_ADMIN_CUSTOMERS = "/api/admin/customers";

export async function listCustomers({
  page = 1,
  limit = 20,
  q = "",
}: CustomersQuery) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) params.set("q", q);
  const res = await fetch(`${API_URL_ADMIN_CUSTOMERS}?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

export async function getCustomerOrdersByEmail(email: string) {
  const res = await fetch(
    `${API_URL_ADMIN_CUSTOMERS}/orders/${encodeURIComponent(email)}/orders`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load customer orders");
  return res.json();
}

export async function getCustomerCart(userId: string) {
  const res = await fetch(`${API_URL_ADMIN_CUSTOMERS}/cart/${userId}/cart`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load customer cart");
  return res.json();
}
