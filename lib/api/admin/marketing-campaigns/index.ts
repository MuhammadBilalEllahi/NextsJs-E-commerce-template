export async function listCampaigns() {
  const res = await fetch("/api/admin/marketing-campaigns", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load campaigns");
  return res.json();
}

export async function saveCampaign(payload: any, isEdit: boolean) {
  const res = await fetch("/api/admin/marketing-campaigns", {
    method: isEdit ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to save campaign");
  return j;
}

export async function deleteCampaign(id: string) {
  const res = await fetch(
    `/api/admin/marketing-campaigns?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete campaign");
  return j;
}
