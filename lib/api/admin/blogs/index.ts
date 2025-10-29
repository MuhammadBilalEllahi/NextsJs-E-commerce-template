export async function listBlogs() {
  const res = await fetch("/api/admin/blogs", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load blogs");
  return res.json();
}

export async function saveBlog(formData: FormData, isEdit: boolean) {
  const res = await fetch("/api/admin/blogs", {
    method: isEdit ? "PUT" : "POST",
    body: formData,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || "Failed to save blog");
  return j;
}

export async function deleteBlog(id: string) {
  const res = await fetch("/api/admin/blogs", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete blog");
  return j;
}

export async function toggleBlogStatus(id: string, isActive: boolean) {
  const res = await fetch("/api/admin/blogs", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update blog status");
  return j;
}
