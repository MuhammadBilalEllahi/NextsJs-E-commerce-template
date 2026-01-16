import { API_URL_ADMIN_ORDERS } from "./index";

export async function sendOrderWhatsApp(
  orderId: string,
  type: "confirmation" | "status"
) {
  const res = await fetch(
    `${API_URL_ADMIN_ORDERS}/${encodeURIComponent(orderId)}/whatsapp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    }
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(
      j.error || j.message || "Failed to send WhatsApp notification"
    );
  return j;
}
