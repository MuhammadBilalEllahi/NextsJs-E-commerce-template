import { CreateRefundPayload } from "@/types";

const API_URL_REFUNDS = "/api/refunds";
export async function getMyRefunds() {
  const res = await fetch(API_URL_REFUNDS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load refunds");
  return res.json();
}


export async function createRefund(payload: CreateRefundPayload) {
  const res = await fetch(API_URL_REFUNDS, {
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
