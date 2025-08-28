export const API_URL_BANNER_ADMIN = "/api/admin/banner";

export const createBanner = async (banner: { title: string; description: string; image: File }) => {
    if (!banner.title) return
    const fd = new FormData()
    fd.append("title", banner.title)
    if (banner.description) fd.append("description", banner.description)
    if (banner.image) fd.append("image", banner.image)

    const res = await fetch(API_URL_BANNER_ADMIN, { method: "POST", body: fd })
    const data = await res.json()


    if (!res.ok) throw new Error("Failed to create banner");
    return data.banners;

}
