"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product/product-card"
import { getAllProducts } from "@/database/data-service"

export function YouMayAlsoLike({ currentId }: { currentId: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const all = await getAllProducts()
        if (Array.isArray(all)) {
          const picks = all.filter((p: any) => p.id !== currentId).slice(0, 4)
          setProducts(picks)
        } else {
          console.error("Invalid products data:", all)
          setProducts([])
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentId])

  if (loading) {
    return (
      <div className="container mx-auto px-0">
        <h2 className="text-xl font-semibold mb-4">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-0">
        <h2 className="text-xl font-semibold mb-4">You may also like</h2>
        <div className="text-center text-neutral-500 py-8">
          No similar products found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0">
      <h2 className="text-xl font-semibold mb-4">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
