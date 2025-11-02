export type FAQQuery = { category?: string; search?: string };

export async function listFaqs({ category, search }: FAQQuery = {}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const res = await fetch(`/api/faqs?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load FAQs");
  return res.json();
}
