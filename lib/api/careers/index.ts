const API_URL_CAREERS = "/api/careers";
const API_URL_APPLICATIONS = "/api/applications";
export async function listCareersPublic() {
  const res = await fetch(API_URL_CAREERS, { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to load careers");
  return j;
}

export async function submitJobApplication(formData: FormData) {
  const res = await fetch(API_URL_APPLICATIONS, {
    method: "POST",
    body: formData,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to submit application");
  return j;
}
