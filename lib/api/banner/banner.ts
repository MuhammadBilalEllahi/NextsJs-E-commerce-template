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

export type Banner = {
    _id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    isActive: boolean;
    expiresAt: string;
    showTitle: boolean;
    showLink: boolean;
    showDescription: boolean;
    mimeType: string;
    createdAt: string;
    updatedAt: string;
};
