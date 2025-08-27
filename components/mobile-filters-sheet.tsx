"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FiltersSidebar } from "@/components/filters-sidebar"
import type { Product } from "@/mock_data/mock-data"

export function MobileFiltersSheet({
  slug,
  initial,
  onApply,
  allProducts,
}: {
  slug: string
  initial: { pmin: number; pmax: number; type: string; brands: string[]; spice: string[] }
  onApply: (entries: Record<string, string | number | undefined | null>) => void
  allProducts: Product[]
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const openListener = () => setOpen(true)
    const resetListener = () => onApply({ pmin: undefined, pmax: undefined, type: undefined, brands: undefined, spice: undefined, page: undefined })
    window.addEventListener("open-filters", openListener as any)
    window.addEventListener("reset-filters", resetListener as any)
    return () => {
      window.removeEventListener("open-filters", openListener as any)
      window.removeEventListener("reset-filters", resetListener as any)
    }
  }, [onApply])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          Open Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[90vw] sm:w-[420px] p-0">
        <SheetHeader className="p-4">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <FiltersSidebar
            slug={slug}
            initial={initial}
            onApply={(e) => {
              onApply(e)
              setOpen(false)
            }}
            allProducts={allProducts}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
