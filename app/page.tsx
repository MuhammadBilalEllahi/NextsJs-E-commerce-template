// "use client"
import { HomeHero } from "@/components/home/home-hero"
import { HomeFeaturedProducts } from "@/components/home/home-featured-products"
import { HomeCategories } from "@/components/home/home-categories"
import { HomeBlogPreview } from "@/components/home/home-blog-preview"
// import { HomeTestimonials } from "@/components/home/home-testimonials"
import {  getFeaturedBlogs, getCategories,   } from "@/mock_data/mock-data"
import { HomeShopLocations } from "@/components/home/home-shops-preview"
import { HomeNewsletter } from "@/components/home/home-newsletter"
import { getAllBanners, getAllNewArrivalsProducts, getAllTopSellingProducts, getGlobalSettings, getAllBranches } from "@/database/data-service"
import { HeaderWithCategories } from "@/components/main_comp/header-with-categories"
import {Navbar}  from "@/components/main_comp/navbar"
import StackedCards from "@/components/home/BranchSlidableCard"
import { HomeDeliveryInfo } from "@/components/home/HomeDeliveryInfo"

// import { useEffect, useState } from "react"


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


  //  const [fetchedBanners, setFetchedBanners] = useState<any[]>([])
  // const [fetchedSettings, setFetchedSettings] = useState<any>(null)
  // const [newArrivals, setNewArrivals] = useState<any[]>([])
  // const [topSelling, setTopSelling] = useState<any[]>([])
  // const [blogs, setBlogs] = useState<any[]>([])
  // const [categories, setCategories] = useState<any[]>([])
  // const [branches, setBranches] = useState<any[]>([])
  // const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const [
  //         bannersRes,
  //         settingsRes,
  //         newArrivalsRes,
  //         topSellingRes,
  //         blogsRes,
  //         categoriesRes,
  //         branchesRes,
  //       ] = await Promise.all([
  //         getAllBanners(),
  //         getGlobalSettings(),
  //         getAllNewArrivalsProducts(),
  //         getAllTopSellingProducts(),
  //         getFeaturedBlogs(),
  //         getCategories(),
  //         getAllBranches(),
  //       ])

  //       setFetchedBanners(bannersRes)
  //       setFetchedSettings(settingsRes)
  //       setNewArrivals(newArrivalsRes)
  //       setTopSelling(topSellingRes)
  //       setBlogs(blogsRes)
  //       setCategories(categoriesRes)
  //       setBranches(branchesRes)
  //     } catch (err) {
  //       console.error("Error fetching data:", err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchData()
  // }, [])

  // console.log("Fetched banners:", fetchedBanners)
  // console.log("Fetched global settings:", fetchedSettings)

  // if (loading) {
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
  //       <div className="flex flex-col items-center">
  //         {/* Logo / Title */}
  //         <h1 className="text-2xl font-bold mb-4">My Store</h1>
          
  //         {/* Spinner */}
  //         <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div>
      <HomeHero banners={fetchedBanners as any} globalSettings={fetchedSettings as any} />

      <section className="container mx-auto px-4 py-10 md:py-14">
       
        <HomeFeaturedProducts bestSellings={topSelling} newArrivals={newArrivals} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">About Us</h2>
      <div className="hidden md:block">
      <HomeShopLocations shopLocation={branches}/>
      </div>
      <div className="md:hidden">
        <StackedCards branches={branches}/>
      </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <HomeCategories categories={categories} />
      </section>

       <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">Our Special</h2>
        
      </section>

      
       <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">Grocery</h2>
        
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeBlogPreview blogs={blogs} />
      </section>

      <HomeDeliveryInfo/>
       <section className="container mx-auto px-4 py-10 md:py-14">
        {/* <h2 className="text-2xl font-bold mb-6">We Deliver To Your Door Step (Lahore)</h2>
        <div>
          <p> We deliver in all Lahore from all our 4 branches</p>
          <p> For out of Lahore booking we send via TCS</p>
        </div> */}
      </section>
    
      {/* <section className="container mx-auto px-4 py-10 md:py-14 pt-28">
         <HomeTestimonials /> 
        
      </section> */}

      <section className="bg-neutral-50 dark:bg-neutral-900/40">
        <div className="container mx-auto px-4 py-12">
          <HomeNewsletter />
        </div>
      </section>
    </div>
  )
}
