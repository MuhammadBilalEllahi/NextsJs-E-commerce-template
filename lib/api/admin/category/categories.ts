import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "@/types/types";

export const API_URL_CATEGORY_ADMIN = "/api/admin/category";

// fetch all categories
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(API_URL_CATEGORY_ADMIN);
  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error ||
      data?.details ||
      data?.errors ||
      "Failed to fetch categories";
    throw new Error(message);
  }
  const categories = (data.categories || []).map((c: any) => ({
    ...c,
    id: c.id || c._id || c?.id,
    parent:
      typeof c.parent === "object" && c.parent !== null
        ? c.parent.id || c.parent._id
        : c.parent,
  }));
  return categories;
};

// create a new category
export const createCategory = async (
  categoryData: CreateCategoryData
): Promise<Category> => {
  if (!categoryData.name) {
    throw new Error("Category name is required");
  }

  const fd = new FormData();
  fd.append("name", categoryData.name);
  if (categoryData.parent !== undefined)
    fd.append("parent", categoryData.parent);
  if (categoryData.description)
    fd.append("description", categoryData.description);
  if (categoryData.isActive !== undefined)
    fd.append("isActive", categoryData.isActive.toString());

  if (categoryData.image && categoryData.image instanceof File) {
    fd.append("image", categoryData.image);
  }

  const res = await fetch(API_URL_CATEGORY_ADMIN, {
    method: "POST",
    body: fd,
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error ||
      data?.details ||
      data?.errors ||
      "Failed to create category";
    throw new Error(message);
  }
  const c = data.category || {};
  return { ...c, id: c.id || c._id };
};

export const updateCategory = async (
  categoryData: UpdateCategoryData
): Promise<Category> => {
  if (!categoryData.id || !categoryData.name) {
    throw new Error("Category ID and name are required");
  }

  const fd = new FormData();
  fd.append("id", categoryData.id);
  fd.append("name", categoryData.name);
  if (categoryData.parent !== undefined)
    fd.append("parent", categoryData.parent);
  if (categoryData.description)
    fd.append("description", categoryData.description);
  if (categoryData.isActive !== undefined)
    fd.append("isActive", categoryData.isActive.toString());

  if (categoryData.image && categoryData.image instanceof File) {
    fd.append("image", categoryData.image);
  }

  const res = await fetch(API_URL_CATEGORY_ADMIN, {
    method: "PUT",
    body: fd,
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.error ||
      data?.details ||
      data?.errors ||
      "Failed to update category";
    throw new Error(message);
  }
  const c = data.category || {};
  return { ...c, id: c.id || c._id };
};
