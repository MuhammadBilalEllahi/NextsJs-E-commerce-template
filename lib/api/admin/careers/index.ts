export async function listCareers() {
  const res = await fetch("/api/admin/careers", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load careers");
  return res.json();
}

export async function saveCareer(payload: any) {
  const isEdit = Boolean(payload?.id);
  const res = await fetch("/api/admin/careers", {
    method: isEdit ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to save career");
  return j;
}

export async function deleteCareer(id: string) {
  const res = await fetch(`/api/admin/careers?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete career");
  return j;
}

export async function toggleCareerStatus(id: string, isActive: boolean) {
  const res = await fetch("/api/admin/careers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update status");
  return j;
}
