import { Blog, CreateBlogData, UpdateBlogData } from "@/types/types";

export const API_URL_BLOGS_ADMIN = "/api/admin/blogs";

export async function fetchBlogs(): Promise<Blog[]> {
  const res = await fetch(API_URL_BLOGS_ADMIN, { cache: "no-store" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch blogs" }));
    throw new Error(error.error || "Failed to fetch blogs");
  }
  const data = await res.json();
  return data.blogs || [];
}

export async function createBlog(blogData: CreateBlogData): Promise<Blog> {
  if (!blogData.title || !blogData.content || !blogData.image) {
    throw new Error("Title, content, and image are required");
  }

  const fd = new FormData();
  fd.append("title", blogData.title);
  fd.append("excerpt", blogData.excerpt);
  fd.append("content", blogData.content);
  fd.append("image", blogData.image);
  fd.append("tags", JSON.stringify(blogData.tags));
  if (blogData.isActive !== undefined)
    fd.append("isActive", blogData.isActive.toString());

  const res = await fetch(API_URL_BLOGS_ADMIN, {
    method: "POST",
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create blog");
  }
  return data.blog;
}

export async function updateBlog(blogData: UpdateBlogData): Promise<Blog> {
  if (!blogData.id || !blogData.title || !blogData.content) {
    throw new Error("ID, title, and content are required");
  }

  const fd = new FormData();
  fd.append("id", blogData.id);
  fd.append("title", blogData.title);
  fd.append("excerpt", blogData.excerpt);
  fd.append("content", blogData.content);
  fd.append("tags", JSON.stringify(blogData.tags));
  if (blogData.isActive !== undefined)
    fd.append("isActive", blogData.isActive.toString());

  if (blogData.image && blogData.image instanceof File) {
    fd.append("image", blogData.image);
  }

  const res = await fetch(API_URL_BLOGS_ADMIN, {
    method: "PUT",
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update blog");
  }
  return data.blog;
}

export async function deleteBlog(id: string): Promise<void> {
  const res = await fetch(API_URL_BLOGS_ADMIN, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete blog");
  }
}

export async function toggleBlogStatus(id: string, isActive: boolean): Promise<Blog> {
  const res = await fetch(API_URL_BLOGS_ADMIN, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update blog status");
  }
  return data.blog;
}
