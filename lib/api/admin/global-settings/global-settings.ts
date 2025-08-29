export const API_URL_GLOBAL_SETTINGS = "/api/admin/global-settings";

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

export const updateGlobalSettings = async (settings: { bannerScrollTime: number }) => {
    try {
        const res = await fetch(API_URL_GLOBAL_SETTINGS, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings)
        });
        
        if (!res.ok) {
            throw new Error("Failed to update global settings");
        }
        
        const data = await res.json();
        return data.settings;
    } catch (error) {
        console.error("Error updating global settings:", error);
        throw error;
    }
};

export type GlobalSettings = {
    _id: string;
    bannerScrollTime: number;
    updatedAt: string;
};
