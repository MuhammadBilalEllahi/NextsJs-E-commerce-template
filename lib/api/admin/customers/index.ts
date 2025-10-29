export type CustomersQuery = {
  page?: number;
  limit?: number;
  q?: string;
};

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
  const res = await fetch(`/api/admin/customers?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

export async function getCustomerOrdersByEmail(email: string) {
  const res = await fetch(
    `/api/admin/customers/orders/${encodeURIComponent(email)}/orders`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load customer orders");
  return res.json();
}

export async function getCustomerCart(userId: string) {
  const res = await fetch(`/api/admin/customers/cart/${userId}/cart`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load customer cart");
  return res.json();
}
