export async function listImportHistories(limit = 20) {
  const res = await fetch(
    `/api/admin/product/undo?limit=${encodeURIComponent(String(limit))}`,
    { cache: "no-store" }
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to fetch import history");
  return j;
}

export async function undoImport(payload: {
  importId: string;
  productId?: string;
  variantId?: string;
}) {
  const res = await fetch("/api/admin/product/undo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to undo");
  return j;
}
