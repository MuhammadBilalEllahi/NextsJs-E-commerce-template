"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Category, Product } from "@/mock_data/mock-data"
import { Loader2 } from "lucide-react"
import { formatPriceRange } from "@/lib/constants/currency"

export function FiltersSidebar({
  slug,
  initial,
  onApply,
  categories,
  availableTypes,
  availableBrands,
}: {
  slug: string
  initial: { pmin: number; pmax: number; type: string; brands: string[]; category: string[] }
  onApply: (entries: Record<string, string | number | undefined | null>) => void
  categories: Category[]
  availableTypes: string[]
  availableBrands: string[]
}) {
  const [pmin, setPmin] = useState(initial.pmin)
  const [pmax, setPmax] = useState(initial.pmax)
  const [type, setType] = useState(initial.type)
  const [brands, setBrands] = useState<string[]>(initial.brands || [])
  const [category, setCategory] = useState<string[]>(initial.category || [])

  // Auto-apply timer ref
  const autoApplyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isAutoApplying, setIsAutoApplying] = useState(false)

  console.log("categories", categories)
  console.log("availableTypes", availableTypes)
  console.log("availableBrands", availableBrands)

  useEffect(() => {
    setPmin(initial.pmin)
    setPmax(initial.pmax)
    setType(initial.type)
    setBrands(initial.brands || [])
    setCategory(initial.category || [])
  }, [initial.pmin, initial.pmax, initial.type, JSON.stringify(initial.brands), JSON.stringify(initial.category)])

  // Function to schedule auto-apply
  // const scheduleAutoApply = () => {
  //   // Clear existing timer
  //   if (autoApplyTimerRef.current) {
  //     clearTimeout(autoApplyTimerRef.current)
  //   }

  //   // Show auto-applying state
  //   setIsAutoApplying(true)

  //   // Set new timer for 1 second
  //   autoApplyTimerRef.current = setTimeout(() => {
  //     apply()
  //   }, 1000)
  // }

  // // Function to apply filters
  // const apply = () => {
  //   // Clear any pending auto-apply timer
  //   if (autoApplyTimerRef.current) {
  //     clearTimeout(autoApplyTimerRef.current)
  //     autoApplyTimerRef.current = null
  //   }

  //   // Hide auto-applying state
  //   setIsAutoApplying(false)

  //   // Apply filters immediately
  //   onApply({
  //     pmin,
  //     pmax: pmax === 9999 ? undefined : pmax,
  //     type,
  //     brands: brands.length ? brands.join(",") : undefined,
  //     category: category.length ? category.join(",") : undefined,
  //     page: undefined, // reset pagination
  //   })
  // }

  const scheduleAutoApply = (nextFilters: {
    pmin?: number
    pmax?: number
    type?: string
    brands?: string[]
    category?: string[]
  }) => {
    if (autoApplyTimerRef.current) {
      clearTimeout(autoApplyTimerRef.current)
    }

    setIsAutoApplying(true)

    autoApplyTimerRef.current = setTimeout(() => {
      apply(nextFilters)
    }, 1000)
  }

  const apply = (overrides: Partial<{
    pmin: number
    pmax: number
    type: string
    brands: string[]
    category: string[]
  }> = {}) => {
    if (autoApplyTimerRef.current) {
      clearTimeout(autoApplyTimerRef.current)
      autoApplyTimerRef.current = null
    }

    setIsAutoApplying(false)

    const filters = {
      pmin,
      pmax: pmax === 9999 ? undefined : pmax,
      type,
      brands: brands.length ? brands.join(",") : undefined,
      category: category.length ? category.join(",") : undefined,
      ...overrides, // override with the latest change
    }

    onApply(filters)
  }


  const reset = () => {
    setPmin(0)
    setPmax(9999)
    setType("")
    setBrands([])
    setCategory([])

    // Clear auto-apply timer and apply immediately
    if (autoApplyTimerRef.current) {
      clearTimeout(autoApplyTimerRef.current)
      autoApplyTimerRef.current = null
    }

    // Hide auto-applying state
    setIsAutoApplying(false)

    onApply({ pmin: undefined, pmax: undefined, type: undefined, brands: undefined, category: undefined, page: undefined })
  }


  // const toggleBrand = (b: string) => {

  //   const newBrands = brands.includes(b ?? "") 
  //     ? brands.filter((x) => x !== b) 
  //     : [...brands, b]

  //   setBrands(newBrands)
  //   scheduleAutoApply()
  // }

  // const toggleCategory = (s: string) => {

  //   const newCategories = category.includes(s) 
  //     ? category.filter((x) => x !== s) 
  //     : [...category, s]

  //   setCategory(newCategories)
  //   scheduleAutoApply()
  // }

  const toggleBrand = (b: string) => {
    const newBrands = brands.includes(b)
      ? brands.filter((x) => x !== b)
      : [...brands, b]

    setBrands(newBrands)
    scheduleAutoApply({ brands: newBrands })
  }

  const toggleCategory = (s: string) => {
    const newCategories = category.includes(s)
      ? category.filter((x) => x !== s)
      : [...category, s]

    setCategory(newCategories)
    scheduleAutoApply({ category: newCategories })
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoApplyTimerRef.current) {
        clearTimeout(autoApplyTimerRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Full screen loader with 20% opacity background */}
      {isAutoApplying && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-950 p-4 sticky top-4 h-fit">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          
        </div>

        <Accordion type="multiple" defaultValue={["price", "type", "brand", "category"]} className="w-full">
          <AccordionItem value="category">
            <AccordionTrigger>Category</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((s: Category) => (
                  <label key={s.name} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${s.name}`}
                      checked={category.includes(s.name)}
                      onCheckedChange={() => toggleCategory(s.name)}
                    />
                    <Label htmlFor={`category-${s.name}`} className="text-sm">
                      {s.name}
                    </Label>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="type">
            <AccordionTrigger>Product Type</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value=""
                    checked={type === ""}
                    onChange={() => {
                      setType("")
                      scheduleAutoApply()
                    }}
                  />
                  <span className="text-sm">All</span>
                </label>
                {availableTypes.map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={type === t}
                      onChange={() => {
                        setType(t ?? "")
                        scheduleAutoApply()
                      }}
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="brand">
            <AccordionTrigger>Brand</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-2">
                {availableBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${b}`}
                      checked={brands.includes(b ?? "")}
                      onCheckedChange={() => toggleBrand(b ?? "")}
                    />
                    <Label htmlFor={`brand-${b}`} className="text-sm">
                      {b}
                    </Label>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger>Price</AccordionTrigger>
            <AccordionContent>
              <div className="px-1 py-2">
                <Slider
                  defaultValue={[Math.min(0, pmin), Math.max(10, Math.min(9999, pmax))]}
                  min={0}
                  max={5000}
                  step={10}
                  onValueChange={(v) => {
                    setPmin(v[0] ?? 0)
                    setPmax(v[1] ?? 5000)
                    scheduleAutoApply()
                  }}
                />
                <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{formatPriceRange(pmin, pmax === 9999 ? "Max" : pmax)}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-4 flex gap-2">
          <Button
            className={`w-full transition-all duration-200 ${isAutoApplying
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-black hover:bg-gray-800'
              }`}
            onClick={apply}
          >
            {isAutoApplying ? 'Auto-applying...' : 'Apply Filters'}
          </Button>
        </div>
      </div>
    </>
  )
}
