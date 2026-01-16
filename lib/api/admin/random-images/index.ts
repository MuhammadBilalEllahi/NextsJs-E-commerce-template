import { API_URL_ADMIN_PRODUCT } from "../product/import";

const API_URL_ADMIN_RANDOM_IMAGES = "/api/admin/random-images";
const API_URL_ADMIN_PRODUCT_BULK_IMAGES = `${API_URL_ADMIN_PRODUCT}/bulk-images`;
export async function listRandomImages(category: string, limit = 50) {
  const res = await fetch(
    `${API_URL_ADMIN_RANDOM_IMAGES}?category=${encodeURIComponent(
      category
    )}&limit=${encodeURIComponent(String(limit))}`,
    { cache: "no-store" }
  );
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to fetch images");
  return j;
}

export async function uploadRandomImages(formData: FormData) {
  const res = await fetch(API_URL_ADMIN_RANDOM_IMAGES, {
    method: "POST",
    body: formData,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to upload images");
  return j;
}

export async function deleteRandomImage(id: string) {
  const res = await fetch(
    `${API_URL_ADMIN_RANDOM_IMAGES}?id=${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete image");
  return true;
}

export async function applyBulkImages(payload: {
  productIds: string[];
  variantIds: string[];
  imageUrls: string[] | null;
  operation: "random" | "replace" | "add";
  category: string | null;
  randomCount: number | null;
}) {
  const res = await fetch(API_URL_ADMIN_PRODUCT_BULK_IMAGES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to apply images");
  return j;
}
