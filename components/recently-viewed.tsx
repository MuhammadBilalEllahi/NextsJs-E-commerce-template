"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "./product/product-card"
import { products } from "@/lib/mock-data"
import type { Product } from "@/lib/mock-data"

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dm-viewed") ?? "[]"
      const viewedIds = JSON.parse(raw) as string[]
      
      // Filter out current product and get unique products
      const uniqueIds = viewedIds.filter(id => id !== currentId)
      const uniqueRecentIds = [...new Set(uniqueIds)].slice(0, 8) // Get up to 8 unique products
      
      const recent = products.filter(product => uniqueRecentIds.includes(product.id))
      setRecentProducts(recent)
    } catch (error) {
      console.error("Error loading recently viewed products:", error)
      setRecentProducts([])
    }
  }, [currentId])

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Recently Viewed Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  )
}
