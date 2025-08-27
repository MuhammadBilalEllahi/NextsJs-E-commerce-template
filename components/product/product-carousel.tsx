"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/mock_data/data"

export function ProductCarousel({ products = [] as Product[] }) {
  const [index, setIndex] = useState(0)
  const visible = 4

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % Math.max(1, products.length - (visible - 1))),
      3500
    )
    return () => clearInterval(t)
  }, [products.length])

  const start = index
  const end = Math.min(products.length, start + visible)
  const slide = products.slice(start, end)

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {slide.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <button
        aria-label="Previous"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        aria-label="Next"
        onClick={() => setIndex((i) => Math.min(products.length - visible, i + 1))}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
