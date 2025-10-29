import { Category } from "@/types";

export const API_URL_CATEGORY_ADMIN = "/api/admin/category";

// fetch all categories
export const fetchCategories = async () => {
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
export const createCategory = async (category: Category) => {
  // console.debug("[createCategory]", category)

  const formData = new FormData();
  // formData.append("id", category.id);
  if (category.name) formData.append("name", category.name);
  if (category.parent !== undefined) formData.append("parent", category.parent);
  if (category.description)
    formData.append("description", category.description);
  if (category.isActive !== undefined)
    formData.append("isActive", category.isActive.toString());

  if (category.image && (category.image as any) instanceof File) {
    formData.append("image", category.image);
  }

  // console.debug("[createCategory]", formData)
  const res = await fetch(`${API_URL_CATEGORY_ADMIN}`, {
    method: "POST",
    body: formData,
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
  return { ...c, id: c.id || c._id } as any;
};

export const updateCategory = async (category: Category) => {
  const formData = new FormData();
  formData.append("id", category.id);
  if (category.name) formData.append("name", category.name);
  if (category.parent !== undefined) formData.append("parent", category.parent);
  if (category.description)
    formData.append("description", category.description);
  if (category.isActive !== undefined)
    formData.append("isActive", category.isActive.toString());

  // If the image is a File, append it, otherwise skip (keep old URL)
  if (category.image && (category.image as any) instanceof File) {
    formData.append("image", category.image);
  }

  // console.debug("[updateCategory]", formData)
  const res = await fetch(`${API_URL_CATEGORY_ADMIN}`, {
    method: "PUT",
    body: formData,
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
  return { ...c, id: c.id || c._id } as any;
};
