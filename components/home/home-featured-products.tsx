"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/types";
import { ProductCard } from "@/components/product/product-card";

export function HomeFeaturedProducts({
  featuredProducts: initialProducts,
}: {
  featuredProducts: Product[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/products/featured?page=${currentPage + 1}&limit=6`
      );
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setCurrentPage((prev) => prev + 1);
        setHasMore(data.products.length === 6); // If we get less than 6, we've reached the end
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more featured products:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const scrollBy = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;

    const amount = el.clientWidth * 0.9;
    const currentScroll = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;

    // If scrolling right and near the end, load more products
    if (
      dir === "right" &&
      currentScroll + amount >= maxScroll - 100 &&
      hasMore &&
      !loading
    ) {
      loadMoreProducts();
    }

    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative ">
      {/* Section heading */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-gray-300" />
        <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
          Featured Products
        </h2>
        <div className="h-[1px] flex-1 bg-gray-300" />
      </div>

      {/* Product Scroller */}
      <div
        ref={scroller}
        className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
      >
        {products.map((p: Product) => (
          <div key={p.id} className="snap-start animate-fadeIn">
            <ProductCard product={p} className="w-72" />
          </div>
        ))}
        {loading && (
          <div className="flex items-center justify-center w-72">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>

      {/* Scroll Controls */}
      <div className="hidden md:block">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
        >
          <ChevronLeft className="h-5 w-5 dark:text-black" />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
        >
          <ChevronRight className="h-5 w-5 dark:text-black" />
        </button>
      </div>
    </div>
  );
}
