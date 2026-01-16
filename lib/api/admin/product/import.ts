export const API_URL_ADMIN_PRODUCT = "/api/admin/product";
const API_URL_ADMIN_PRODUCT_IMPORT = `${API_URL_ADMIN_PRODUCT}/import`;
export async function importProductsCSV(formData: FormData) {
  const res = await fetch(API_URL_ADMIN_PRODUCT_IMPORT, {
    method: "POST",
    body: formData,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Upload failed");
  return j;
}
