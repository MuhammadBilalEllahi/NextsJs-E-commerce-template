import { ContactFormData } from "@/types/types";

export async function submitContact(formData: ContactFormData) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to send message");
  return j;
}
