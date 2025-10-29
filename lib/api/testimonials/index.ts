export async function listPublicTestimonials() {
  const res = await fetch("/api/testimonials", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load testimonials");
  return res.json();
}
