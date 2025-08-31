"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SortDropdown } from "@/components/shop/sort-dropdown"
import { List, Grid2X2, Grid3X3, Grid, Menu, SlidersHorizontal, Filter } from 'lucide-react'

interface ViewControlsProps {
  view: "list" | "grid-2" | "grid-3" | "grid-4" | "single"
  onViewChange: (view: "list" | "grid-2" | "grid-3" | "grid-4" | "single") => void
  itemsPerPage: number
  onItemsPerPageChange: (items: number) => void
  sortValue: string
  onSortChange: (sort: string) => void
}

export function ViewControls({
  view,
  onViewChange,
  itemsPerPage,
  onItemsPerPageChange,
  sortValue,
  onSortChange,
}: ViewControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border">
      {/* VIEW AS */}
      <div
          
          className="flex md:hidden"
          onClick={() => {
            const ev = new CustomEvent("open-filters")
            window.dispatchEvent(ev)
          }}
        >
          <Filter className="h-5 w-5 " />
          <p className="text-sm">filters</p>
        </div>
      <div className="flex items-center justify-center  gap-3 w-full sm:w-auto">
        <span className="hidden md:block text-sm font-semibold text-neutral-700 dark:text-neutral-300">VIEW AS</span>
        <div className="flex items-center  gap-1">
        <Button
            variant={view === "single" ?  "outline": "ghost" }
            size="sm"
            className={` h-8  w-5 p-0 border-[1.9px] rounded-none transition-all duration-200 ${
              view === "single" 
                ? "border-black" 
                : "border-gray-300 dark:border-gray-600 opacity-50"
            }`}
            onClick={() => onViewChange("single")}
          >
            <img 
              src="/bars/three-lines-vert.svg" 
              className={`h-8 w-8 ml-3 object-cover transition-all duration-200 ${
                view === "single" 
                  ? "opacity-100" 
                  : "opacity-40 grayscale"
              }`} 
              style={{
                clipPath: "inset(0 62.666% 0 0)" 
              }} 
            />
          </Button>
          <Button
            variant={view === "list" ?  "outline": "ghost" }
            size="sm"
            className={`hidden md:block h-8 w-8 p-0 border-[1.9px] rounded-none transition-all duration-200 ${
              view === "list" 
                ? "border-black" 
                : "border-gray-300 dark:border-gray-600 opacity-50"
            }`}
            onClick={() => onViewChange("list")}
          >
            <img 
              src="/bars/three-lines-horz.svg" 
              className={`h-8 w-8 object-contain transition-all duration-200 ${
                view === "list" 
                  ? "opacity-100" 
                  : "opacity-40 grayscale"
              }`} 
            />
          </Button>
          <Button
            variant={view === "grid-2" ?  "outline": "ghost" }
            size="sm"
            className={`h-8 w-5 p-0 border-[1.9px] rounded-none transition-all duration-200 ${
              view === "grid-2" 
                ? "border-black" 
                : "border-gray-300 dark:border-gray-600 opacity-50"
            }`}
            onClick={() => onViewChange("grid-2")}
          >
            <img 
              src="/bars/three-lines-vert.svg" 
              className={`h-8 ml-2 w-8 object-cover transition-all duration-200 ${
                view === "grid-2" 
                  ? "opacity-100" 
                  : "opacity-40 grayscale"
              }`} 
              style={{
                clipPath: "inset(0 33.333% 0 0)" 
              }} 
            />
          </Button>
          <Button
            variant={view === "grid-3" ?  "outline": "ghost" }
            size="sm"
            className={`hidden md:block h-8 w-8 p-0 border-[1.9px] rounded-none transition-all duration-200 ${
              view === "grid-3" 
                ? "border-black" 
                : "border-gray-300 dark:border-gray-600 opacity-50"
            }`}
            onClick={() => onViewChange("grid-3")}
          >
            <img 
              src="/bars/three-lines-vert.svg" 
              className={`h-8 w-8 object-contain transition-all duration-200 ${
                view === "grid-3" 
                  ? "opacity-100" 
                  : "opacity-40 grayscale"
              }`} 
            />
          </Button>
          <Button
            variant={view === "grid-4" ?  "outline": "ghost" }
            size="sm"
            className={`hidden md:block h-8 w-8 p-0 border-[1.9px] rounded-none transition-all duration-200 ${
              view === "grid-4" 
                ? "border-black" 
                : "border-gray-300 dark:border-gray-600 opacity-50"
            }`}
            onClick={() => onViewChange("grid-4")}
          >
            <img 
              src="/bars/four-lines-horz.svg" 
              className={`h-8 w-8 p-1 object-contain rotate-90 transition-all duration-200 ${
                view === "grid-4" 
                  ? "opacity-100" 
                  : "opacity-40 grayscale"
              }`} 
            />
          </Button>
        </div>
      </div>

      {/* ITEMS PER PAGE */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">ITEMS PER PAGE</span>
        <Select value={String(itemsPerPage)} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="36">36</SelectItem>
            <SelectItem value="48">48</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* SORT BY */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <span className="hidden md:block text-xs md:text-sm font-semibold text-neutral-700 dark:text-neutral-300">SORT BY</span>
        <SortDropdown value={sortValue} onChange={onSortChange} />
      </div>
    </div>
  )
}
