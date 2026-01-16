const API_URL_ADMIN_WHATSAPP_CONFIG = "/api/admin/whatsapp/config";
export async function getWhatsAppConfigStatus() {
  const res = await fetch(API_URL_ADMIN_WHATSAPP_CONFIG, { cache: "no-store" });
  if (!res.ok)
    return { isConfigured: false, errors: ["Failed to check configuration"] };
  return res.json();
}
