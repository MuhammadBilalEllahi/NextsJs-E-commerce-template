"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils/utils"
import type { Product } from "@/mock_data/mock-data"

export function ProductGrid({
  products = [],
  view = "grid-3",
  pageSize = 12,
  enableInfinite = true,
}: {
  products?: Product[]
  view?: "list" | "grid-2" | "grid-3" | "grid-4" | "single"
  pageSize?: number
  enableInfinite?: boolean
}) {
  const [page, setPage] = useState(1)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setPage(1)
  }, [JSON.stringify(products)])

  useEffect(() => {
    if (!enableInfinite) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setPage((p) => p + 1)
        }
      })
    })
    io.observe(el)
    return () => io.disconnect()
  }, [enableInfinite, sentinelRef])

  const paged = useMemo(() => {
    return products.slice(0, page * pageSize)
  }, [products, page, pageSize])

  return (
    <div>
      {view === "list" ? (
        <div className="space-y-3">
          {paged.map((p) => (
            <ProductCard key={p.id} product={p} variant="list" />
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          view === "grid-2" ? "grid-cols-2" :
          view === "grid-3" ? "grid-cols-2 sm:grid-cols-3" :
          view === "single" ? "grid-cols-1" :
          "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        }`}>
          {paged.map((p) => (
            <ProductCard key={p.id} product={p} variant="grid" />
          ))}
        </div>
      )}

      {paged.length < products.length && (
        <div className={cn("mt-6 flex items-center justify-center", enableInfinite ? "opacity-70" : "")}>
          {enableInfinite ? (
            <div ref={sentinelRef} className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          ) : (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  )
}
