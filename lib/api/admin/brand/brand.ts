import { Brand, CreateBrandData } from "@/types";

export const API_URL_BRAND_ADMIN = "/api/admin/brand";

export const createBrand = async (brand: CreateBrandData) => {
  if (!brand.name) return;
  const fd = new FormData();
  fd.append("name", brand.name);
  if (brand.description) fd.append("description", brand.description);
  if (brand.logo) fd.append("logo", brand.logo);

  const res = await fetch(API_URL_BRAND_ADMIN, { method: "POST", body: fd });
  const data = await res.json();

  if (!res.ok) throw new Error("Failed to create brand");
  return data.brand;
};

// fetch all brands
export const fetchBrands = async () => {
  const res = await fetch(API_URL_BRAND_ADMIN);
  if (!res.ok) throw new Error("Failed to fetch brands");
  const data = await res.json();
  return data.brands;
};

// update brand
export const updateBrand = async (id: string, brand: Brand) => {
  if (!brand.name) return;
  const fd = new FormData();
  fd.append("id", id);
  fd.append("name", brand.name);
  if (brand.description) fd.append("description", brand.description);
  if (brand.logo) fd.append("logo", brand.logo);

  const res = await fetch(API_URL_BRAND_ADMIN, { method: "PUT", body: fd });
  const data = await res.json();

  if (!res.ok) throw new Error("Failed to update brand");
  return data.brand;
};

// delete brand
export const deleteBrand = async (id: string) => {
  const res = await fetch(API_URL_BRAND_ADMIN, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error("Failed to delete brand");
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

  if (!res.ok) throw new Error("Failed to toggle brand status");
  return data.brand;
};
