import { GUEST_CART_ID_STORAGE_KEY } from "@/lib/cacheConstants";

// Generate a UUID v4 for guest cart identification
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get or create guest UUID from localStorage
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";

  
  let guestId = localStorage.getItem(GUEST_CART_ID_STORAGE_KEY);

  if (!guestId) {
    guestId = generateUUID();
    console.debug("GUEST ID", guestId);
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, guestId);
  }

  return guestId;
}

// Clear guest UUID (useful when user logs in)
export function clearGuestId(): void {
  if (typeof window === "undefined") return;

  
  localStorage.removeItem(GUEST_CART_ID_STORAGE_KEY);
}
