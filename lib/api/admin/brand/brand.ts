import { Brand, CreateBrandData, UpdateBrandData } from "@/types/types";

export const API_URL_BRAND_ADMIN = "/api/admin/brand";

export const createBrand = async (
  brandData: CreateBrandData
): Promise<Brand> => {
  if (!brandData.name) {
    throw new Error("Brand name is required");
  }

  const fd = new FormData();
  fd.append("name", brandData.name);
  if (brandData.description) fd.append("description", brandData.description);
  if (brandData.logo) fd.append("logo", brandData.logo);

  const res = await fetch(API_URL_BRAND_ADMIN, { method: "POST", body: fd });
  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error || data?.details || data?.errors || "Failed to create brand";
    throw new Error(message);
  }
  const b = data.brand || {};
  return { ...b, id: b.id || b._id };
};

// fetch all brands
export const fetchBrands = async (): Promise<Brand[]> => {
  const res = await fetch(API_URL_BRAND_ADMIN);
  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error || data?.details || data?.errors || "Failed to fetch brands";
    throw new Error(message);
  }
  return (data.brands || []).map((b: any) => ({ ...b, id: b.id || b._id }));
};

// update brand
export const updateBrand = async (
  brandData: UpdateBrandData
): Promise<Brand> => {
  if (!brandData.id || !brandData.name) {
    throw new Error("Brand ID and name are required");
  }

  const fd = new FormData();
  fd.append("id", brandData.id);
  fd.append("name", brandData.name);
  if (brandData.description) fd.append("description", brandData.description);
  if (brandData.logo && brandData.logo instanceof File)
    fd.append("logo", brandData.logo);

  const res = await fetch(API_URL_BRAND_ADMIN, { method: "PUT", body: fd });
  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error || data?.details || data?.errors || "Failed to update brand";
    throw new Error(message);
  }
  const b = data.brand || {};
  return { ...b, id: b.id || b._id };
};

// delete brand
export const deleteBrand = async (id: string) => {
  const res = await fetch(API_URL_BRAND_ADMIN, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error || data?.details || data?.errors || "Failed to delete brand";
    throw new Error(message);
  }
  return data.brand;
};

// toggle brand status (active/inactive)
export const toggleBrandStatus = async (id: string, isActive: boolean) => {
  const res = await fetch(API_URL_BRAND_ADMIN, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const data = await res.json();

  if (!res.ok) {
    const message =
      data?.error ||
      data?.details ||
      data?.errors ||
      "Failed to toggle brand status";
    throw new Error(message);
  }
  const b = data.brand || {};
  return { ...b, id: b.id || b._id } as any;
};
