"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Star } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { getProductsByBrand } from "@/database/data-service";
import { Brand } from "@/types";

interface HomeBrandShowcaseProps {
  brands: Brand[];
}

export function HomeBrandShowcase({ brands }: HomeBrandShowcaseProps) {
  const [activeBrand, setActiveBrand] = useState<Brand | null>(
    brands[0] || null
  );
  const [brandProducts, setBrandProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Fetch products for the active brand
  const fetchBrandProducts = async (brand: Brand) => {
    if (!brand) return;

    setLoading(true);
    try {
      const products = await getProductsByBrand(brand.name, 6);
      setBrandProducts(products);
    } catch (error) {
      console.error("Error fetching brand products:", error);
      setBrandProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle brand selection
  const handleBrandSelect = (brand: Brand) => {
    setActiveBrand(brand);
    fetchBrandProducts(brand);
  };

  // Scroll functionality for product carousel
  const scrollBy = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Load products for the first brand on mount
  React.useEffect(() => {
    if (activeBrand) {
      fetchBrandProducts(activeBrand);
    }
  }, []);

  if (brands.length === 0) {
    return null;
  }

  return (
    <div className="relative ">
      {/* Section Header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
            Our Brands
          </h2>
          <Star className="h-5 w-5 text-primary" />
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Brand Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {brands.slice(0, 6).map((brand) => (
          <button
            key={brand.id}
            onClick={() => handleBrandSelect(brand)}
            className={`group relative px-4 py-3 rounded-2xl border transition-all duration-300 ${
              activeBrand?.id === brand.id
                ? "bg-primary text-white border-primary shadow-lg scale-105"
                : "bg-white dark:bg-neutral-900 border-gray-200 hover:border-red-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-3">
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`h-8 w-8 object-contain transition-all duration-300 ${
                    activeBrand?.id === brand.id
                      ? "ring-2 ring-white/50"
                      : "ring-1 ring-gray-200 group-hover:ring-primary"
                  }`}
                />
              )}
              <span className="font-medium text-sm whitespace-nowrap">
                {brand.name}
              </span>
            </div>

            {/* Active indicator */}
            {activeBrand?.id === brand.id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Brand Content */}
      {activeBrand && (
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-800 rounded-2xl p-6 md:p-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/shop/all?brands=${encodeURIComponent(activeBrand.name)}`}
              className="group flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <span className="font-medium text-sm flex-end">View All</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Carousel */}
          <div className="relative">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : brandProducts.length > 0 ? (
              <>
                <div
                  ref={scroller}
                  className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
                >
                  {brandProducts.map((product) => (
                    <div
                      key={product.id}
                      className="snap-start min-w-[200px] md:min-w-[220px]"
                    >
                      <ProductCard product={product} className="w-72" />
                    </div>
                  ))}
                </div>

                {/* Scroll Controls */}
                <div className="hidden md:block">
                  <button
                    aria-label="Scroll left"
                    onClick={() => scrollBy("left")}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full border bg-white dark:bg-neutral-800 p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    aria-label="Scroll right"
                    onClick={() => scrollBy("right")}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full border bg-white dark:bg-neutral-800 p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 mb-4">
                  <Star className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">
                    Check back later for new items from this brand
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Brand Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {brands.slice(6).map((brand) => (
          <Link
            key={brand.id}
            href={`/shop/all?brands=${encodeURIComponent(brand.name)}`}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
