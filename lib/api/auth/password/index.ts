export async function requestPasswordReset(email: string) {
  const res = await fetch("/api/auth/reset-password/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to send reset email");
  return j;
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const res = await fetch("/api/auth/reset-password/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to reset password");
  return j;
}
