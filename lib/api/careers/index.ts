export async function listCareersPublic() {
  const res = await fetch("/api/careers", { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to load careers");
  return j;
}

export async function submitJobApplication(formData: FormData) {
  const res = await fetch("/api/applications", {
    method: "POST",
    body: formData,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to submit application");
  return j;
}
