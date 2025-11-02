import { Career, CreateCareerData, UpdateCareerData } from "@/types/types";

export const API_URL_CAREERS_ADMIN = "/api/admin/careers";

export async function fetchCareers(): Promise<Career[]> {
  const res = await fetch(API_URL_CAREERS_ADMIN, { cache: "no-store" });
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: "Failed to fetch careers" }));
    throw new Error(error.error || "Failed to fetch careers");
  }
  const data = await res.json();
  return data.careers || [];
}

export async function createCareer(
  careerData: CreateCareerData
): Promise<Career> {
  if (!careerData.title || !careerData.department || !careerData.location) {
    throw new Error("Title, department, and location are required");
  }

  const res = await fetch(API_URL_CAREERS_ADMIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(careerData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to create career");
  }
  return data.career;
}

export async function updateCareer(
  careerData: UpdateCareerData
): Promise<Career> {
  if (
    !careerData.id ||
    !careerData.title ||
    !careerData.department ||
    !careerData.location
  ) {
    throw new Error("ID, title, department, and location are required");
  }

  const res = await fetch(API_URL_CAREERS_ADMIN, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(careerData),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update career");
  }
  return data.career;
}

export async function deleteCareer(id: string): Promise<void> {
  const res = await fetch(
    `${API_URL_CAREERS_ADMIN}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to delete career");
  }
}

export async function toggleCareerStatus(
  id: string,
  isActive: boolean
): Promise<Career> {
  const res = await fetch(API_URL_CAREERS_ADMIN, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isActive }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update career status");
  }
  return data.career;
}
