"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  total: number;
  blocked?: boolean;
  tags: string[];
  type: "registered" | "guest";
  lastOrder?: string | null;
};

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [modalOrders, setModalOrders] = useState<any[]>([]);
  const [modalCart, setModalCart] = useState<{
    items: any[];
    currency: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (q) params.set("q", q);
    fetch(`/api/admin/customers?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(j.error || "Failed to load customers");
        }
        return res.json();
      })
      .then((j) => {
        setCustomers(j.customers || []);
        setTotal(j.pagination?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, limit, q]);

  const filtered = useMemo(() => customers, [customers]);

  const toggleBlock = (id: string) =>
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c))
    );
  const setTags = (id: string, tagsStr: string) =>
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, tags: tagsStr.split("|").filter(Boolean) } : c
      )
    );

  const pages = Math.max(1, Math.ceil(total / limit));

  const openCustomerModal = async (c: Customer) => {
    setModalCustomer(c);
    setModalOrders([]);
    setModalCart(null);
    setModalOpen(true);
    try {
      // Fetch orders by email
      const ordersRes = await fetch(
        `/api/admin/customers/orders/${encodeURIComponent(c.email)}/orders`,
        { cache: "no-store" }
      );
      if (ordersRes.ok) {
        const j = await ordersRes.json();
        setModalOrders(j.orders || []);
      }
      // Fetch cart only for registered users
      if (c.type === "registered") {
        const cartRes = await fetch(`/api/admin/customers/cart/${c.id}/cart`, {
          cache: "no-store",
        });
        if (cartRes.ok) {
          const j = await cartRes.json();
          setModalCart({ items: j.items || [], currency: j.currency || "PKR" });
        }
      }
    } catch (e) {
      // noop; modal shows whatever loaded
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            Registered and guest customers (by order email)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search customers..."
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
            />
            <div className="text-sm text-neutral-600">
              {loading
                ? "Loading..."
                : `${total} result${total === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Orders</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Last Order</th>
                  <th className="p-3 text-left">Tags</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3 capitalize">{c.type}</td>
                    <td className="p-3">{c.orders}</td>
                    <td className="p-3">Rs. {c.total.toFixed(2)}</td>
                    <td className="p-3">
                      {c.lastOrder
                        ? new Date(c.lastOrder).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3">
                      <Input
                        className="h-8 w-56"
                        defaultValue={c.tags.join("|")}
                        onBlur={(e) => setTags(c.id, e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        className={
                          c.blocked ? "border-red-600 text-red-600" : ""
                        }
                        onClick={() => toggleBlock(c.id)}
                      >
                        {c.blocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={() => openCustomerModal(c)}
                      >
                        View Cart & Orders
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-4 text-center text-neutral-500"
                    >
                      {loading ? "Loading..." : "No customers found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Page {page} of {pages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {modalOpen && modalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-4 shadow-lg dark:bg-neutral-950">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <div className="text-lg font-semibold">
                  {modalCustomer.name}
                </div>
                <div className="text-sm text-neutral-500">
                  {modalCustomer.email} · {modalCustomer.type}
                </div>
              </div>
              <button
                className="rounded border px-2 py-1 text-sm"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="rounded border p-3">
                <div className="mb-2 font-medium">Current Cart</div>
                {modalCart?.items?.length ? (
                  <ul className="text-sm">
                    {modalCart.items.map((it: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between border-b py-2"
                      >
                        <span className="truncate pr-2">
                          {it.title}
                          {it.label ? ` (${it.label})` : ""}
                        </span>
                        <span className="font-medium">
                          x{it.quantity} · Rs. {it.priceSnapshot.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-neutral-500">No active cart</div>
                )}
              </div>
              <div className="rounded border p-3">
                <div className="mb-2 font-medium">Recent Orders</div>
                {modalOrders.length ? (
                  <ul className="text-sm">
                    {modalOrders.slice(0, 10).map((o: any) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between border-b py-2"
                      >
                        <div>
                          <div className="font-medium">{o.orderId}</div>
                          <div className="text-xs text-neutral-500">
                            {o.date} · {o.status}
                          </div>
                        </div>
                        <div className="text-right">
                          <div>Rs. {o.total.toFixed(2)}</div>
                          <div className="text-xs text-neutral-500">
                            {o.itemsCount} items
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-neutral-500">
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
