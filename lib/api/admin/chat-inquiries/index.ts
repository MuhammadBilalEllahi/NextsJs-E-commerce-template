import { ChatFilters } from "@/types";

const API_URL_ADMIN_CHAT_INQUIRIES = "/api/admin/chat-inquiries";

export async function listChatInquiries(filters: ChatFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  const res = await fetch(`${API_URL_ADMIN_CHAT_INQUIRIES}?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load inquiries");
  return res.json();
}

export async function sendChatReply(inquiryId: string, message: string) {
  const res = await fetch(API_URL_ADMIN_CHAT_INQUIRIES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inquiryId, message }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || "Failed to send reply");
  return j;
}

export async function updateChatInquiry(
  inquiryId: string,
  field: string,
  value: any
) {
  const res = await fetch(API_URL_ADMIN_CHAT_INQUIRIES, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inquiryId, [field]: value }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update inquiry");
  return j;
}
