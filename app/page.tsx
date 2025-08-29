import { HomeHero } from "@/components/home/home-hero"
import { HomeFeaturedProducts } from "@/components/home/home-featured-products"
import { HomeCategories } from "@/components/home/home-categories"
import { HomeBlogPreview } from "@/components/home/home-blog-preview"
import { HomeTestimonials } from "@/components/home/home-testimonials"
import {  getFeaturedBlogs, getCategories, shopLocations,  } from "@/mock_data/mock-data"
import { HomeShopLocations } from "@/components/home/home-shops-preview"
import { HomeNewsletter } from "@/components/home/home-newsletter"
import { getAllBanners, getAllNewArrivalsProducts, getAllTopSellingProducts, getGlobalSettings, getAllBranches } from "@/database/data-service"
import { HeaderWithCategories } from "@/components/main_comp/header-with-categories"
import { Navbar } from "@/components/main_comp/navbar"


// interface Banner {
//   _id: string;
//   title: string;
//   description: string;
//   image: string;
//   link: string;
// }

// interface GlobalSettings {
//   _id: string;
//   bannerScrollTime: number;
// }


export default async function HomePage() {
  // Server Component fetching placeholder data. Interactive sections are client components.
  const [fetchedBanners, fetchedSettings,newArrivals, topSelling, blogs, categories, branches] = await Promise.all([
    
    getAllBanners(),
    getGlobalSettings(),
    getAllNewArrivalsProducts(),
    getAllTopSellingProducts(), 
    getFeaturedBlogs(),
    getCategories(),
    getAllBranches(),
  ])


  console.log("Fetched banners:", fetchedBanners)
  console.log("Fetched global settings:", fetchedSettings)

  return (
    <div>
      <HeaderWithCategories categories={categories} />
      <Navbar />
      <HomeHero banners={fetchedBanners as any} globalSettings={fetchedSettings as any} />

      <section className="container mx-auto px-4 py-10 md:py-14">
       
        <HomeFeaturedProducts bestSellings={topSelling} newArrivals={newArrivals} />
      </section>

      <HomeShopLocations shopLocation={branches}/>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <HomeCategories categories={categories} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeBlogPreview blogs={blogs} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeTestimonials />
      </section>

      <section className="bg-neutral-50 dark:bg-neutral-900/40">
        <div className="container mx-auto px-4 py-12">
          <HomeNewsletter />
        </div>
      </section>
    </div>
  )
}
