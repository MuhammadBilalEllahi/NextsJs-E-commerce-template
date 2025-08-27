"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Product } from "@/lib/mock-data"
import { FiltersSidebar } from "./filters-sidebar"
import { MobileFiltersSheet } from "./mobile-filters-sheet"
import { ViewControls } from "./view-controls"

import { Button } from "@/components/ui/button"
import { Filter } from 'lucide-react'
import { ProductGrid } from "./product/product-grid"

const spiceLabelToRange: Record<string, [number, number]> = {
  mild: [1, 2],
  medium: [2, 3],
  hot: [3, 4],
  "extra-hot": [4, 5],
}

export function CategoryClient({
  slug,
  allProducts = [],
}: {
  slug: string
  allProducts?: Product[]
}) {
  const router = useRouter()
  const sp = useSearchParams()
  const [view, setView] = useState<"list" | "grid-2" | "grid-3" | "grid-4">((sp.get("view") as "list" | "grid-2" | "grid-3" | "grid-4") || "grid-3")
  const [itemsPerPage, setItemsPerPage] = useState<number>(Number(sp.get("itemsPerPage")) || 12)

  useEffect(() => {
    const v = sp.get("view")
    if (v === "list" || v === "grid-2" || v === "grid-3" || v === "grid-4") setView(v)
    
    const items = Number(sp.get("itemsPerPage"))
    if (items && [12, 20, 24, 36, 48].includes(items)) setItemsPerPage(items)
  }, [sp])

  const productsInCategory = useMemo(() => {
    const lower = slug.toLowerCase()
    if (lower === "all") return allProducts
    return allProducts.filter((p) => p.category && p.category.toLowerCase() === lower)
  }, [slug, allProducts])

  const filtered = useMemo(() => {
    const q = (sp.get("q") || "").toLowerCase()
    const pmin = Number(sp.get("pmin") ?? 0)
    const pmax = Number(sp.get("pmax") ?? 9999)
    const type = sp.get("type") || ""
    const brands = (sp.get("brands") || "").split(",").filter(Boolean)
    const spice = (sp.get("spice") || "").split(",").filter(Boolean)

    let list = productsInCategory.slice()

    if (q) {
      const keys = ["title", "description", "brand", "type", "tags"]
      list = list.filter((p) =>
        keys.some((k) => {
          const val = Array.isArray((p as any)[k]) ? (p as any)[k].join(" ") : String((p as any)[k] ?? "")
          return val.toLowerCase().includes(q)
        }),
      )
    }

    list = list.filter((p) => p.price >= pmin && p.price <= pmax)

    if (type) {
      list = list.filter((p) => p.type && p.type.toLowerCase() === type.toLowerCase())
    }

    if (brands.length) {
      const set = new Set(brands.map((b) => b.toLowerCase()))
      list = list.filter((p) => p.brand && set.has(p.brand.toLowerCase()))
    }

    if (spice.length) {
      list = list.filter((p) => {
        return spice.some((label) => {
          const range = spiceLabelToRange[label]
          if (!range) return false
          return p.spiceLevel && p.spiceLevel >= range[0] && p.spiceLevel <= range[1]
        })
      })
    }

    const sort = sp.get("sort") || ""
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list.sort((a, b) => b.price - a.price)
        break
      case "popularity":
        list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
        break
      case "newest":
        list.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        )
        break
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
    }

    return list
  }, [sp, productsInCategory])

  const updateParam = (key: string, value?: string | number | null) => {
    const params = new URLSearchParams(sp?.toString())
    if (value === undefined || value === null || value === "" || value === "all") {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    router.replace(`?${params.toString()}`)
  }

  const setParams = (entries: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(sp?.toString())
    Object.entries(entries).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "all") params.delete(k)
      else params.set(k, String(v))
    })
    router.replace(`?${params.toString()}`)
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mt-4 flex items-center gap-2 md:hidden">
        <MobileFiltersSheet
          slug={slug}
          onApply={setParams}
          initial={{
            pmin: Number(sp.get("pmin") ?? 0),
            pmax: Number(sp.get("pmax") ?? 9999),
            type: sp.get("type") || "",
            brands: (sp.get("brands") || "").split(",").filter(Boolean),
            spice: (sp.get("spice") || "").split(",").filter(Boolean),
          }}
          allProducts={productsInCategory}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const ev = new CustomEvent("open-filters")
            window.dispatchEvent(ev)
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const ev = new CustomEvent("reset-filters")
            window.dispatchEvent(ev)
          }}
        >
          Reset
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="hidden md:block">
          <FiltersSidebar
            slug={slug}
            allProducts={productsInCategory}
            initial={{
              pmin: Number(sp.get("pmin") ?? 0),
              pmax: Number(sp.get("pmax") ?? 9999),
              type: sp.get("type") || "",
              brands: (sp.get("brands") || "").split(",").filter(Boolean),
              spice: (sp.get("spice") || "").split(",").filter(Boolean),
            }}
            onApply={setParams}
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-4">
            <ViewControls
              view={view}
              onViewChange={(newView) => {
                setView(newView)
                updateParam("view", newView)
              }}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage)
                updateParam("itemsPerPage", newItemsPerPage)
              }}
              sortValue={(sp.get("sort") as any) || "popularity"}
              onSortChange={(v) => updateParam("sort", v)}
            />
          </div>
          
          <ProductGrid
            products={filtered}
            view={view}
            pageSize={itemsPerPage}
            enableInfinite={true}
          />
        </section>
      </div>
    </main>
  )
}
