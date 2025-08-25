export const API_URL_BRAND_ADMIN = "/api/admin/brand";

export const createBrand = async (brand: { name: string; description: string; logo: File }) => {
    if (!brand.name) return
    const fd = new FormData()
    fd.append("name", brand.name)
    if (brand.description) fd.append("description", brand.description)
    if (brand.logo) fd.append("logo", brand.logo)

    const res = await fetch(API_URL_BRAND_ADMIN, { method: "POST", body: fd })
    const data = await res.json()


    if (!res.ok) throw new Error("Failed to create category");
    return data.brands;

}




// fetch all categories
export const fetchBrands = async () => {
    const res = await fetch(API_URL_BRAND_ADMIN);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.brands;
};
