"use client"

import { useMemo, useState } from "react"

export function ProductImages({ images = [] as string[], title = "Product" }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = images[index] ?? "/modern-tech-product.png"
  const cursor = useMemo(() => (zoom ? "cursor-zoom-out" : "cursor-zoom-in"), [zoom])

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border">
        <img
          src={current || "/placeholder.svg"}
          alt={title}
          className={`w-full object-cover transition-transform duration-300 ${cursor} ${
            zoom ? "scale-125" : "scale-100"
          }`}
          onClick={() => setZoom((z) => !z)}
        />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => {
              setIndex(i)
              setZoom(false)
            }}
            className={`rounded border overflow-hidden ${i === index ? "ring-2 ring-red-600" : ""}`}
          >
            <img
              src={src || "/placeholder.svg?height=64&width=64&query=thumb"}
              alt={`${title} ${i + 1}`}
              className="h-16 w-full object-cover"
            />
          </button>
        ))}
      </div>
      {/* Sticky add-to-cart bar is in AddToCartSection */}
    </div>
  )
}
