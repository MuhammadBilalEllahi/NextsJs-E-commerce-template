"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  title: string
  subtitle: string
  cta?: { label: string; href: string }
  image: string
}

const slides: Slide[] = [
  {
    title: "Summer Heat Sale",
    subtitle: "Up to 30% off select spices & masalas",
    cta: { label: "Shop Now", href: "/category/all" },
    image: "/spice-banner-red.png",
  },
  {
    title: "Pickle Perfection",
    subtitle: "Tangy, spicy, homemade-style pickles",
    cta: { label: "Explore Pickles", href: "/category/pickles" },
    image: "/dehli-mirch-ecommerce-banner.png",
  },
  {
    title: "Snack Attack",
    subtitle: "Crunchy namkeen for your chai breaks",
    cta: { label: "Browse Snacks", href: "/category/snacks" },
    image: "/snacks-banner-orange.png",
  },
]

export function HomeHero() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [])
  const current = slides[index]

  return (
    <section className="relative">
      <div className="relative isolate overflow-hidden rounded-none ">
        <img
          src={current.image || "/placeholder.svg"}
          alt={current.title}
          className="w-full h-[360px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="ml-10 px-6 md:px-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{current.title}</h1>
            <p className="mt-2 text-white/90 md:text-lg">{current.subtitle}</p>
            {current.cta && (
              <Link
                href={current.cta.href}
                className="inline-block mt-5 rounded-md bg-white text-neutral-900 font-medium px-5 py-2.5 shadow hover:opacity-90"
              >
                {current.cta.label}
              </Link>
            )}
          </div>
        </div>

        <button
          aria-label="Previous slide"
          onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 p-2"
        >
          <ChevronLeft className="h-5 w-5 dark:text-black" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white/90 p-2"
        >
          <ChevronRight className="h-5 w-5 dark:text-black" />
        </button>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 w-2 rounded-full ${
                i === index ? "bg-red-600" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
