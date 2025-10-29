export type NotificationFilters = { type?: string; isRead?: string };

export async function listNotifications(filters: NotificationFilters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.isRead !== undefined && filters.isRead !== "")
    params.set("isRead", String(filters.isRead));
  const res = await fetch(`/api/notifications?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export async function markNotificationsRead(notificationIds: string[]) {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationIds }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to mark as read");
  return j;
}

export async function markAllNotificationsRead() {
  const res = await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markAllAsRead: true }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to mark all as read");
  return j;
}
