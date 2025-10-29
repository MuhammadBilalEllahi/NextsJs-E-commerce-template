export async function listTestimonials() {
  const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load testimonials");
  return res.json();
}

export async function saveTestimonial(payload: any, isEdit: boolean) {
  const res = await fetch("/api/admin/testimonials", {
    method: isEdit ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to save testimonial");
  return j;
}

export async function deleteTestimonial(id: string) {
  const res = await fetch("/api/admin/testimonials", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete testimonial");
  return j;
}

export async function toggleTestimonialStatus(id: string, isActive: boolean) {
  const res = await fetch("/api/admin/testimonials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update testimonial status");
  return j;
}
