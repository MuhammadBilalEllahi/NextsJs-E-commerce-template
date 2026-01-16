const API_URL_PROFILE = "/api/user/profile";
export async function getProfile() {
  const res = await fetch(API_URL_PROFILE, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateProfile(payload: any) {
  const res = await fetch(API_URL_PROFILE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to update profile");
  return j;
}
