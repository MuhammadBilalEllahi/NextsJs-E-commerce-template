import { FAQQuery } from "@/types";

const API_URL_FAQS = "/api/faqs";

export async function listFaqs({ category, search }: FAQQuery = {}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const res = await fetch(`${API_URL_FAQS}?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load FAQs");
  return res.json();
}
