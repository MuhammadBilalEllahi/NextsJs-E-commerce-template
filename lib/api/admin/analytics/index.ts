const API_URL_ADMIN_ANALYTICS = "/api/admin/analytics";
export async function getAdminAnalytics() {
  const res = await fetch(API_URL_ADMIN_ANALYTICS, { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to load analytics");
  return j;
}
