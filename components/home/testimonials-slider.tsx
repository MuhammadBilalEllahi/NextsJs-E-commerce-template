"use client"

import { useEffect, useState } from "react"
import { getTestimonials } from "@/mock_data/data"

export function TestimonialsSlider() {
  const [index, setIndex] = useState(0)
  const t = getTestimonials()
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % t.length), 3000)
    return () => clearInterval(id)
  }, [t.length])

  const item = t[index]
  return (
    <div className="rounded-xl border bg-white p-6 shadow">
      <div className="text-sm text-neutral-600 dark:text-neutral-300">What our customers say</div>
      <blockquote className="mt-2 text-lg font-medium">“{item.quote}”</blockquote>
      <div className="mt-2 text-sm">— {item.author}</div>
    </div>
  )
}
