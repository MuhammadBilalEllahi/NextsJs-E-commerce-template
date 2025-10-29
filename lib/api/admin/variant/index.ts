export async function updateVariant(fd: FormData) {
  const res = await fetch("/api/admin/variant", { method: "PUT", body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to update variant");
  return j;
}

export async function createVariant(fd: FormData) {
  const res = await fetch("/api/admin/variant", { method: "POST", body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to create variant");
  return j;
}

export async function deleteVariantApi(id: string) {
  const fd = new FormData();
  fd.append("id", id);
  const res = await fetch("/api/admin/variant", { method: "DELETE", body: fd });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to delete variant");
  return j;
}
