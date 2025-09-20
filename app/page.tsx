// "use client"
import { HomeHero } from "@/components/home/home-hero";
import { HomeFeaturedProducts } from "@/components/home/home-featured-products";
import { HomeBestSellingAndNewArrivalProducts } from "@/components/home/home-best-selling-new-arrival-products";
import { HomeSpecialProducts } from "@/components/home/home-special-products";
import { HomeGroceryProducts } from "@/components/home/home-grocery-products";
import { HomeCategories } from "@/components/home/home-categories";
import { HomeBrandShowcase } from "@/components/home/home-brand-showcase";
import { HomeBlogPreview } from "@/components/home/home-blog-preview";
// import { HomeTestimonials } from "@/components/home/home-testimonials"
import { getFeaturedBlogs } from "@/mock_data/mock-data";
import { HomeShopLocations } from "@/components/home/home-shops-preview";
import { HomeNewsletter } from "@/components/home/home-newsletter";
import {
  getAllBanners,
  getAllNewArrivalsProducts,
  getAllTopSellingProducts,
  getAllSpecialProducts,
  getAllGroceryProducts,
  getAllActiveBrands,
  getGlobalSettings,
  getAllBranches,
  getAllCategories,
  getAllFeaturedProducts,
} from "@/database/data-service";
import { HeaderWithCategories } from "@/components/main_comp/header-with-categories";
import { Navbar } from "@/components/main_comp/navbar";
import StackedCards from "@/components/home/BranchSlidableCard";
import { HomeDeliveryInfo } from "@/components/home/HomeDeliveryInfo";

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
  const [
    fetchedBanners,
    fetchedSettings,
    newArrivalsData,
    topSellingData,
    specialProductsData,
    groceryProductsData,
    activeBrands,
    blogs,
    categories,
    branches,
    featuredProductsData,
  ] = await Promise.all([
    getAllBanners(),
    getGlobalSettings(),
    getAllNewArrivalsProducts(6, 1), // Limit to 6 products for home page
    getAllTopSellingProducts(6, 1), // Limit to 6 products for home page
    getAllSpecialProducts(6, 1), // Limit to 6 products for home page
    getAllGroceryProducts(6, 1), // Limit to 6 products for home page
    getAllActiveBrands(),
    getFeaturedBlogs(),
    getAllCategories(),
    getAllBranches(),
    getAllFeaturedProducts(6, 1), // Limit to 6 products for home page
  ]);

  // Extract products from paginated data
  const newArrivals = newArrivalsData.products || [];
  const topSelling = topSellingData.products || [];
  const specialProducts = specialProductsData.products || [];
  const groceryProducts = groceryProductsData.products || [];
  const featuredProducts = featuredProductsData.products || [];
  return (
    <div>
      <HomeHero
        banners={fetchedBanners as any}
        globalSettings={fetchedSettings as any}
      />

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeBestSellingAndNewArrivalProducts
          bestSellings={topSelling}
          newArrivals={newArrivals}
        />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">About Us</h2>
        <div className="hidden md:block">
          <HomeShopLocations shopLocation={branches} />
        </div>
        <div className="md:hidden">
          <StackedCards branches={branches} />
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <HomeCategories categories={categories} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeFeaturedProducts featuredProducts={featuredProducts} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeBrandShowcase brands={activeBrands} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeSpecialProducts specialProducts={specialProducts} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeGroceryProducts groceryProducts={groceryProducts} />
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <HomeBlogPreview blogs={blogs} />
      </section>

      <HomeDeliveryInfo />
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
  );
}
