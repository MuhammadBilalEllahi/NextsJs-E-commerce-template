import {
  ContentPage,
  CreateContentPageData,
  UpdateContentPageData,
} from "@/types/types";

export const API_URL_CONTENT_PAGES_ADMIN = "/api/admin/content";

export async function fetchContentPages(): Promise<ContentPage[]> {
  const res = await fetch(API_URL_CONTENT_PAGES_ADMIN, { cache: "no-store" });
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch content pages" }));
    throw new Error(error.error || "Failed to fetch content pages");
  }
  const data = await res.json();
  return data.pages || [];
}

export async function fetchContentPageBySlug(slug: string): Promise<ContentPage> {
  const res = await fetch(
    `${API_URL_CONTENT_PAGES_ADMIN}/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch content page" }));
    throw new Error(error.error || "Failed to fetch content page");
  }
  const data = await res.json();
  return data.page;
}

export async function createContentPage(
  pageData: CreateContentPageData
): Promise<ContentPage> {
  if (!pageData.slug || !pageData.title || !pageData.content) {
    throw new Error("Slug, title, and content are required");
  }

  const res = await fetch(API_URL_CONTENT_PAGES_ADMIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pageData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to create content page");
  }
  return data.page;
}

export async function updateContentPage(
  slug: string,
  pageData: UpdateContentPageData
): Promise<ContentPage> {
  if (!pageData.title || !pageData.content) {
    throw new Error("Title and content are required");
  }

  const res = await fetch(
    `${API_URL_CONTENT_PAGES_ADMIN}/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pageData),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to update content page");
  }
  return data.page;
}

export async function deleteContentPage(slug: string): Promise<void> {
  const res = await fetch(
    `${API_URL_CONTENT_PAGES_ADMIN}/${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete content page");
  }
}

export async function seedContentPages(): Promise<void> {
  const res = await fetch(`${API_URL_CONTENT_PAGES_ADMIN}/seed`, {
    method: "POST",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to seed content pages");
  }
}
