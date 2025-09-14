"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { getAllProducts } from "@/database/data-service";
import type { Product } from "@/mock_data/data";

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentProducts = async () => {
      try {
        // Get recently viewed product IDs from localStorage
        const raw = localStorage.getItem("dm-viewed") ?? "[]";
        const viewedIds = JSON.parse(raw) as string[];

        // Filter out current product and get unique products
        const uniqueIds = viewedIds.filter((id) => id !== currentId);
        const uniqueRecentIds = [...new Set(uniqueIds)].slice(0, 8); // Get up to 8 unique products

        if (uniqueRecentIds.length === 0) {
          setRecentProducts([]);
          setLoading(false);
          return;
        }

        // Fetch all products and filter by recently viewed IDs
        const allProducts = await getAllProducts();
        const recent = allProducts.filter((product) =>
          uniqueRecentIds.includes(product.id)
        );
        setRecentProducts(recent);
      } catch (error) {
        console.error("Error loading recently viewed products:", error);
        setRecentProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentProducts();
  }, [currentId]);

  // Track current product as viewed
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dm-viewed") ?? "[]";
      const viewedIds = JSON.parse(raw) as string[];

      // Add current product to the beginning if not already there
      const updatedIds = [
        currentId,
        ...viewedIds.filter((id) => id !== currentId),
      ];

      // Keep only the last 20 viewed products
      const limitedIds = updatedIds.slice(0, 20);

      localStorage.setItem("dm-viewed", JSON.stringify(limitedIds));
    } catch (error) {
      console.error("Error tracking viewed product:", error);
    }
  }, [currentId]);

  if (loading) {
    return (
      <section className="mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Recently Viewed Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-44 bg-neutral-200 rounded-sm mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                <div className="h-6 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <ProductCard
              key={String(product.id)}
              product={{ ...product, id: String(product.id) }}
              variant="grid"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
