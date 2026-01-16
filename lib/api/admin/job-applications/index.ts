const API_URL_ADMIN_JOB_APPLICATIONS = "/api/admin/job-applications";
const API_URL_ADMIN_SEND_APPLICATION_EMAIL = "/api/admin/send-application-email";

export async function listJobApplications() {
  const res = await fetch(API_URL_ADMIN_JOB_APPLICATIONS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json();
}

export async function deleteJobApplication(id: string) {
  const res = await fetch(API_URL_ADMIN_JOB_APPLICATIONS, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to delete application");
  return j;
}

export async function updateJobApplicationStatus(id: string, status: string) {
  const res = await fetch(API_URL_ADMIN_JOB_APPLICATIONS, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success)
    throw new Error(j.error || "Failed to update status");
  return j;
}

export async function sendApplicationEmail(payload: {
  applicantEmail: string;
  applicantName: string;
  jobTitle: string;
  templateType: string;
  customMessage?: string;
  nextSteps?: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const res = await fetch(API_URL_ADMIN_SEND_APPLICATION_EMAIL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.success) throw new Error(j.error || "Failed to send email");
  return j;
}
