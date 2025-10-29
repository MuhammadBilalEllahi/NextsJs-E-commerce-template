export async function listContentPages() {
  const res = await fetch("/api/admin/content", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load content pages");
  return res.json();
}

export async function getContentPage(slug: string) {
  const res = await fetch(`/api/admin/content/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load content page");
  return res.json();
}

export async function createContentPage(payload: any) {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to create content page");
  return j;
}

export async function updateContentPage(slug: string, payload: any) {
  const res = await fetch(`/api/admin/content/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to update content page");
  return j;
}

export async function deleteContentPage(slug: string) {
  const res = await fetch(`/api/admin/content/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to delete content page");
  return j;
}

export async function seedContentPages() {
  const res = await fetch("/api/admin/content/seed", { method: "POST" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to seed content pages");
  return j;
}
