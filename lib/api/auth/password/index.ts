const API_URL_AUTH_PASSWORD = "/api/auth";
const API_URL_AUTH_PASSWORD_RESET_REQUEST = `${API_URL_AUTH_PASSWORD}/reset-password/request`;
const API_URL_AUTH_PASSWORD_RESET_CONFIRM = `${API_URL_AUTH_PASSWORD}/reset-password/confirm`;
export async function requestPasswordReset(email: string) {
  const res = await fetch(API_URL_AUTH_PASSWORD_RESET_REQUEST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to send reset email");
  return j;
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const res = await fetch(API_URL_AUTH_PASSWORD_RESET_CONFIRM, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to reset password");
  return j;
}
