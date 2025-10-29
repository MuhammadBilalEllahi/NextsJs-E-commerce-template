"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/types";
import { ProductCard } from "@/components/product/product-card";

export function HomeGroceryProducts({
  groceryProducts: initialProducts,
}: {
  groceryProducts: Product[];
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
        `/api/products/grocery?page=${currentPage + 1}&limit=6`
      );
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setCurrentPage((prev) => prev + 1);
        setHasMore(data.products.length === 6);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more grocery products:", error);
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

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-gray-300" />
        <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
          Fast Grocery
        </h2>
        <div className="h-[1px] flex-1 bg-gray-300" />
      </div>

      {/* Mobile: 2x2 mini grid */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        {products.slice(0, 4).map((product: Product) => (
          <ProductCard key={product.id} product={product} variant="mini" />
        ))}
      </div>

      {/* Show more button for mobile if there are more than 4 products */}
      {products.length > 4 && (
        <div className="md:hidden text-center">
          <button
            className="text-red-600 hover:text-red-700 text-sm font-medium"
            onClick={loadMoreProducts}
            disabled={loading || !hasMore}
          >
            {loading
              ? "Loading..."
              : `View All Grocery Products (${products.length})`}
          </button>
        </div>
      )}

      {/* Desktop: Scrollable horizontal layout */}
      <div className="hidden md:block relative">
        <div
          ref={scroller}
          className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
        >
          {products.map((product: Product) => (
            <div key={product.id} className="snap-start animate-fadeIn">
              <ProductCard product={product} className="w-72" />
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
    </div>
  );
}
