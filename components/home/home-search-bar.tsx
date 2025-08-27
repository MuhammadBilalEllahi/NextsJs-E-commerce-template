"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/mock_data/mock-data"

export function HomeSearchBar({ categories }: { categories: Category[] }) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<string>("all")
  const router = useRouter()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams()
    if (q) searchParams.set("q", q)
    const href = `/category/${cat}?${searchParams.toString()}`
    router.push(href)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="w-full md:w-48">
        <Select value={cat} onValueChange={(v) => setCat(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search spices, pickles, snacks…"
          className="pl-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-medium"
      >
        Search
      </button>
    </form>
  )
}
