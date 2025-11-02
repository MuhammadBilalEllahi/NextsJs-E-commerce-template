export async function getMyRefunds() {
  const res = await fetch("/api/refunds", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load refunds");
  return res.json();
}

export type CreateRefundPayload = {
  order: string;
  product: string;
  quantity: number;
  amount: number;
  reason: string;
  customerNotes?: string;
};

export async function createRefund(payload: CreateRefundPayload) {
  const res = await fetch("/api/refunds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Failed to submit refund");
  }
  return res.json();
}
