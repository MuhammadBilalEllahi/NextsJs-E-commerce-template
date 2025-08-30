"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const categories = [
  { slug: "all", label: "All" },
  { slug: "powder", label: "Ground Spices" },
  { slug: "whole", label: "Whole Spices" },
  { slug: "mixes", label: "Masala Mixes" },
  { slug: "pickle", label: "Pickles" },
  { slug: "snack", label: "Snacks" },
]

export function CategorySearchBar({
  currentCategory,
  onSearch,
  initialQuery = "",
}: {
  currentCategory: string
  onSearch: (q: string) => void
  initialQuery?: string
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const [cat, setCat] = useState(currentCategory || "all")

  const go = () => {
    router.replace(`/category/${cat}?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="w-full rounded-2xl border bg-white dark:bg-neutral-950 p-3 md:p-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-2">
        <select
          aria-label="Category"
          className="rounded-xl border bg-transparent p-2"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <Input
          placeholder="Search within category (e.g., chili, cumin, achar)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch(q)
          }}
          className="rounded-xl"
        />
        <div className="flex gap-2">
          <Button className="bg-red-600 hover:bg-red-700 rounded-xl" onClick={() => onSearch(q)}>
            Search
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={go}>
            Go
          </Button>
        </div>
      </div>
    </div>
  )
}
