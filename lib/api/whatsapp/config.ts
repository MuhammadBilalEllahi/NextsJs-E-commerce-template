export async function getWhatsAppConfigStatus() {
  const res = await fetch("/api/admin/whatsapp/config", { cache: "no-store" });
  if (!res.ok)
    return { isConfigured: false, errors: ["Failed to check configuration"] };
  return res.json();
}
