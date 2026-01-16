const API_URL_AUTH = "/api/auth";
const API_URL_AUTH_ME = `${API_URL_AUTH}/me`;
const API_URL_AUTH_LOGIN = `${API_URL_AUTH}/login`;
const API_URL_AUTH_LOGOUT = `${API_URL_AUTH}/logout`;
const API_URL_AUTH_SIGNUP = `${API_URL_AUTH}/signup`;
export async function getMe() {
  const res = await fetch(API_URL_AUTH_ME, { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to load session");
  return j;
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(API_URL_AUTH_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || "Login failed");
  return j;
}

export async function logoutApi() {
  const res = await fetch(API_URL_AUTH_LOGOUT, { method: "POST" });
  if (!res.ok) throw new Error("Logout failed");
  return true;
}

export async function signupApi(payload: {
  email: string;
  password: string;
  name?: string;
}) {
  const res = await fetch(API_URL_AUTH_SIGNUP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || "Register failed");
  return j;
}
