"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from 'lucide-react'

export function SortDropdown({
  value = "popularity",
  onChange,
}: {
  value?: string
  onChange: (val: string) => void
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Rating" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ]

  const handleSortChange = (newValue: string) => {
    onChange(newValue)
    if (isMobile) {
      setIsOpen(false)
    }
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 transition hover:opacity-80"
            onClick={() => setIsOpen(true)}
          >
            <span className="truncate">Sort By</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[220px] rounded-t-xl p-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800"
        >
          <SheetHeader className="px-4 pt-4 pb-1">
            <SheetTitle className="text-left text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Sort By
            </SheetTitle>
          </SheetHeader>
          <div className="mt-1 px-1 space-y-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-md border transition-colors text-xs
                  ${
                    value === option.value
                      ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[170px] text-xs md:text-sm">
        <SelectValue placeholder="Sort By"  />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popularity">Popularity</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="rating">Rating</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  )
}
