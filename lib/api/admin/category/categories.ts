import { Category } from "@/types";

export const API_URL_CATEGORY_ADMIN = "/api/admin/category";

// fetch all categories
export const fetchCategories = async () => {
  const res = await fetch(API_URL_CATEGORY_ADMIN);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.categories;
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

  if (!res.ok) throw new Error("Failed to create category");
  const data = await res.json();
  return data.category;
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

  if (!res.ok) throw new Error("Failed to update category");

  const data = await res.json();
  return data.category;
};
