"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { Category } from "@/mock_data/mock-data";
import { ProductCard } from "@/components/product/product-card";
import { getProductsByCategory } from "@/database/data-service";

interface HomeCategoryShowcaseProps {
  categories: Category[];
}

export function HomeCategoryShowcase({
  categories,
}: HomeCategoryShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(
    categories[0] || null
  );
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Fetch products for the active category
  const fetchCategoryProducts = async (category: Category) => {
    if (!category) return;

    setLoading(true);
    try {
      const products = await getProductsByCategory(category.slug, 6);
      setCategoryProducts(products);
    } catch (error) {
      console.error("Error fetching category products:", error);
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setActiveCategory(category);
    fetchCategoryProducts(category);
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

  // Load products for the first category on mount
  React.useEffect(() => {
    if (activeCategory) {
      fetchCategoryProducts(activeCategory);
    }
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative my-12">
      {/* Section Header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-red-500" />
          <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
            Shop by Category
          </h2>
          <Sparkles className="h-5 w-5 text-red-500" />
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.slice(0, 8).map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`group relative px-4 py-2 rounded-full border transition-all duration-300 ${
              activeCategory?.id === category.id
                ? "bg-red-500 text-white border-red-500 shadow-lg scale-105"
                : "bg-white dark:bg-neutral-900 border-gray-200 hover:border-red-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-2">
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className={`h-5 w-5 object-cover rounded-full transition-all duration-300 ${
                    activeCategory?.id === category.id
                      ? "ring-2 ring-white/50"
                      : "ring-1 ring-gray-200 group-hover:ring-red-300"
                  }`}
                />
              )}
              <span className="font-medium text-sm whitespace-nowrap">
                {category.name}
              </span>
            </div>

            {/* Active indicator */}
            {activeCategory?.id === category.id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Category Content */}
      {activeCategory && (
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-800 rounded-2xl p-6 md:p-8">
          {/* Category Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {activeCategory.name}
              </h3>
              {activeCategory.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base max-w-2xl">
                  {activeCategory.description}
                </p>
              )}
            </div>
            <Link
              href={`/shop/${activeCategory.slug}`}
              className="group flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 hover:scale-105"
            >
              <span className="font-medium text-sm">View All</span>
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
            ) : categoryProducts.length > 0 ? (
              <>
                <div
                  ref={scroller}
                  className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
                >
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="snap-start min-w-[200px] md:min-w-[220px]"
                    >
                      <ProductCard product={product} className="w-full" />
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
                  <Sparkles className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">
                    Check back later for new items in this category
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Category Links */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {categories.slice(8).map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
