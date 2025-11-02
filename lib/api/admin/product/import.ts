export async function importProductsCSV(formData: FormData) {
  const res = await fetch("/api/admin/product/import", {
    method: "POST",
    body: formData,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Upload failed");
  return j;
}
