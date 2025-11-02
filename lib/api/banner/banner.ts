export const API_URL_BANNER = "/api/admin/banner";

export const fetchBanners = async () => {
  try {
    const res = await fetch(API_URL_BANNER);

    if (!res.ok) {
      throw new Error("Failed to fetch banners");
    }

    const data = await res.json();
    return data.banners || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};
