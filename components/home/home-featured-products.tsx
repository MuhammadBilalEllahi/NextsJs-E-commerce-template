"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/mock_data/mock-data";
import { ProductCard } from "@/components/product/product-card";

export function HomeFeaturedProducts({
  featuredProducts,
}: {
  featuredProducts: Product[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative my-12">
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
        className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 "
      >
        {featuredProducts.map((p) => (
          <div key={p.id} className=" snap-start animate-fadeIn ">
            <ProductCard product={p} className="w-72 " />
          </div>
        ))}
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
