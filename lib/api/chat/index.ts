const API_URL_CHAT = "/api/chat";
export async function getChatHistory(sessionId: string) {
  const res = await fetch(
    `${API_URL_CHAT}?sessionId=${encodeURIComponent(sessionId)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load chat history");
  return res.json();
}

export async function postChatMessage(payload: {
  sessionId: string;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
}) {
  const res = await fetch(API_URL_CHAT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to send message");
  return j;
}

export async function updateChatUser(payload: {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
}) {
  const res = await fetch(API_URL_CHAT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update chat");
  return j;
}
