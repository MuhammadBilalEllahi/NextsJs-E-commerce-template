import { CreateBannerData, GlobalSettings } from "@/types";

export const API_URL_BANNER_ADMIN = "/api/admin/banner";
export const API_URL_GLOBAL_SETTINGS = "/api/admin/global-settings";

export const createBanner = async (banner: CreateBannerData) => {
  if (!banner.title || !banner.description || !banner.image || !banner.link) {
    throw new Error("Missing required fields");
  }

  const fd = new FormData();
  fd.append("title", banner.title);
  fd.append("description", banner.description);
  fd.append("image", banner.image);
  fd.append("link", banner.link);
  fd.append("isActive", banner.isActive.toString());
  fd.append("expiresAt", banner.expiresAt);
  fd.append("showTitle", banner.showTitle.toString());
  fd.append("showLink", banner.showLink.toString());
  fd.append("showDescription", banner.showDescription.toString());
  if (banner.timeout) {
    fd.append("timeout", banner.timeout.toString());
  }

  const res = await fetch(API_URL_BANNER_ADMIN, { method: "POST", body: fd });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Failed to create banner");
  }

  const data = await res.json();
  return data.banner || data;
};

export const updateBanner = async (
  bannerId: string,
  bannerData: CreateBannerData
) => {
  const fd = new FormData();
  fd.append("id", bannerId);
  fd.append("title", bannerData.title);
  fd.append("description", bannerData.description);
  fd.append("link", bannerData.link);
  fd.append("isActive", bannerData.isActive.toString());
  fd.append("expiresAt", bannerData.expiresAt);
  fd.append("showTitle", bannerData.showTitle.toString());
  fd.append("showLink", bannerData.showLink.toString());
  fd.append("showDescription", bannerData.showDescription.toString());
  if (bannerData.timeout) {
    fd.append("timeout", bannerData.timeout.toString());
  }

  if (bannerData.image) {
    fd.append("image", bannerData.image);
  }

  const res = await fetch(API_URL_BANNER_ADMIN, { method: "PUT", body: fd });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Failed to update banner");
  }

  const data = await res.json();
  return data;
};

export const deleteBanner = async (bannerId: string) => {
  const res = await fetch(API_URL_BANNER_ADMIN, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: bannerId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Failed to delete banner");
  }

  const data = await res.json();
  return data;
};

export const fetchBanners = async () => {
  const res = await fetch(API_URL_BANNER_ADMIN);

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Failed to fetch banners");
  }

  const data = await res.json();
  return data.banners || [];
};

export const fetchGlobalSettings = async () => {
  try {
    const res = await fetch(API_URL_GLOBAL_SETTINGS);

    if (!res.ok) {
      throw new Error("Failed to fetch global settings");
    }

    const data = await res.json();
    return data.settings;
  } catch (error) {
    console.error("Error fetching global settings:", error);
    return null;
  }
};

export const purgeRedisCache = async () => {
  const res = await fetch(API_URL_BANNER_ADMIN, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "purge" }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || "Failed to purge Redis cache");
  }

  const data = await res.json();
  return data;
};
