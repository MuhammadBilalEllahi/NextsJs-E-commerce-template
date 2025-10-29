export async function getTrackingByRefId(refId: string) {
  const res = await fetch(`/api/tcs-tracking?refId=${encodeURIComponent(refId)}`, { cache: "no-store" });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || "Failed to fetch tracking information");
  return j;
}

