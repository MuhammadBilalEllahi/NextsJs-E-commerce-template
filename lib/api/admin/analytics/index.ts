export async function getAdminAnalytics() {
  const res = await fetch("/api/admin/analytics", { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to load analytics");
  return j;
}
