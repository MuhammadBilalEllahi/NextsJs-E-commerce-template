import {
  Testimonial,
  CreateTestimonialData,
  UpdateTestimonialData,
} from "@/types/types";

export const API_URL_TESTIMONIALS_ADMIN = "/api/admin/testimonials";

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(API_URL_TESTIMONIALS_ADMIN, { cache: "no-store" });
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch testimonials" }));
    throw new Error(error.error || "Failed to fetch testimonials");
  }
  const data = await res.json();
  return data.testimonials || [];
}

export async function createTestimonial(
  testimonialData: CreateTestimonialData
): Promise<Testimonial> {
  if (!testimonialData.author || !testimonialData.quote) {
    throw new Error("Author and quote are required");
  }

  const fd = new FormData();
  fd.append("author", testimonialData.author);
  fd.append("quote", testimonialData.quote);
  fd.append("rating", testimonialData.rating.toString());
  if (testimonialData.position) fd.append("position", testimonialData.position);
  if (testimonialData.company) fd.append("company", testimonialData.company);
  if (testimonialData.avatar) fd.append("avatar", testimonialData.avatar);
  if (testimonialData.isActive !== undefined)
    fd.append("isActive", testimonialData.isActive.toString());

  const res = await fetch(API_URL_TESTIMONIALS_ADMIN, {
    method: "POST",
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create testimonial");
  }
  return data.testimonial;
}

export async function updateTestimonial(
  testimonialData: UpdateTestimonialData
): Promise<Testimonial> {
  if (
    !testimonialData.id ||
    !testimonialData.author ||
    !testimonialData.quote
  ) {
    throw new Error("ID, author, and quote are required");
  }

  const fd = new FormData();
  fd.append("id", testimonialData.id);
  fd.append("author", testimonialData.author);
  fd.append("quote", testimonialData.quote);
  fd.append("rating", testimonialData.rating.toString());
  if (testimonialData.position) fd.append("position", testimonialData.position);
  if (testimonialData.company) fd.append("company", testimonialData.company);
  if (testimonialData.avatar && testimonialData.avatar instanceof File)
    fd.append("avatar", testimonialData.avatar);
  if (testimonialData.isActive !== undefined)
    fd.append("isActive", testimonialData.isActive.toString());

  const res = await fetch(API_URL_TESTIMONIALS_ADMIN, {
    method: "PUT",
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update testimonial");
  }
  return data.testimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(API_URL_TESTIMONIALS_ADMIN, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete testimonial");
  }
}

export async function toggleTestimonialStatus(
  id: string,
  isActive: boolean
): Promise<Testimonial> {
  const res = await fetch(API_URL_TESTIMONIALS_ADMIN, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update testimonial status");
  }
  return data.testimonial;
}
