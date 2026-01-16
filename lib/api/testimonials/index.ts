const API_URL_TESTIMONIALS = "/api/testimonials";
export async function listPublicTestimonials() {
  const res = await fetch(API_URL_TESTIMONIALS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load testimonials");
  return res.json();
}
