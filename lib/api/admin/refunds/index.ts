export type RefundsQuery = {
  status?: string;
  search?: string;
};

export async function listRefunds({ status = "", search = "" }: RefundsQuery) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  const res = await fetch(`/api/admin/refunds?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load refunds");
  return res.json();
}

export async function updateRefund(payload: any) {
  const res = await fetch("/api/admin/refunds", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Failed to update refund");
  }
  return res.json();
}
