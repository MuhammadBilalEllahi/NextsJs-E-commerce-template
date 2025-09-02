"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "./input"
import { Label } from "./label"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { Button } from "./button"
import { PAKISTAN_CITIES, MAJOR_CITIES } from "@/lib/constants/cities"

interface CitySelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  className?: string
}

export function CitySelect({
  value,
  onChange,
  label = "City",
  placeholder = "Select a city...",
  required = false,
  className
}: CitySelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCities(MAJOR_CITIES)
    } else {
      const filtered = PAKISTAN_CITIES.filter(city =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCities(filtered)
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCitySelect = (city: string) => {
    onChange(city)
    setOpen(false)
    setSearchQuery("")
  }

  const handleTriggerClick = () => {
    setOpen(!open)
    if (!open) {
      setSearchQuery("")
      setFilteredCities(MAJOR_CITIES)
    }
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </Label>
      )}
      
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between h-10 px-3 py-2 text-sm"
        onClick={handleTriggerClick}
      >
        <span className={cn("block truncate", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg max-h-60 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 focus:outline-none",
                    value === city && "bg-neutral-100 dark:bg-neutral-700"
                  )}
                  onClick={() => handleCitySelect(city)}
                >
                  <span className="block truncate">{city}</span>
                  {value === city && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                No cities found.
              </div>
            )}
          </div>

          {/* Show total count */}
          <div className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700">
            {searchQuery ? `${filteredCities.length} of ${PAKISTAN_CITIES.length} cities` : `${PAKISTAN_CITIES.length} cities available`}
          </div>
        </div>
      )}
    </div>
  )
}
