const API_URL_NEWSLETTER = "/api/newsletter";
const API_URL_UNSUBSCRIBE = "/api/unsubscribe";


export async function subscribeNewsletter(email: string) {
  const res = await fetch(API_URL_NEWSLETTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || "Failed to subscribe");
  return j;
}

export async function unsubscribeNewsletter(token: string) {
  const res = await fetch(API_URL_UNSUBSCRIBE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to unsubscribe");
  return j;
}
