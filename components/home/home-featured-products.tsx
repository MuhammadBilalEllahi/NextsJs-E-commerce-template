"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Product } from "@/mock_data/mock-data"
import { ProductCard } from "@/components/product/product-card"

export function HomeFeaturedProducts({
  bestSellings,
  newArrivals,
}: {
  bestSellings: Product[]
  newArrivals: Product[]
}) {
  const [activeTab, setActiveTab] = useState<"best" | "new">("best")
  const scroller = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: "left" | "right") => {
    const el = scroller.current
    if (!el) return
    const amount = el.clientWidth * 0.9
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  // Pick products based on active tab
  const products = activeTab === "best" ? bestSellings : newArrivals

  return (
    <div className="relative my-12">
      {/* Section heading */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-[1px] flex-1 bg-gray-300" />
        <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
          Trending Now
        </h2>
        <div className="h-[1px] flex-1 bg-gray-300" />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-3 mb-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("best")}
          className={`px-3 py-1 rounded transition ${
            activeTab === "best"
              ? "bg-red-500 text-white"
              : "hover:text-red-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          Best Sellings
        </button>
        <span className="text-gray-400">/</span>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-3 py-1 rounded transition ${
            activeTab === "new"
              ? "bg-red-500 text-white"
              : "hover:text-red-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          New Arrivals
        </button>
      </div>

      {/* Product Scroller */}
      <div
        key={activeTab} // forces remount for lazy-load effect
        ref={scroller}
        className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 "
      >
        {products.map((p) => (
          <div
            key={p.id}
            className=" snap-start animate-fadeIn "
          >
            <ProductCard product={p} className="w-72 "  />
          </div>
        ))}
      </div>

      {/* Scroll Controls */}
      <div className="hidden md:block">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
        >
          <ChevronLeft className="h-5 w-5 dark:text-black" />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
        >
          <ChevronRight className="h-5 w-5 dark:text-black" />
        </button>
      </div>
    </div>
  )
}

// "use client"

// import { useRef } from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"
// import { Product } from "@/lib/mock-data"
// import { ProductCard } from "@/components/product-card"
// import Link from "next/link"

// export function HomeFeaturedProducts({ products }: { products: Product[] }) {
//   const scroller = useRef<HTMLDivElement>(null)
//   const scrollBy = (dir: "left" | "right") => {
//     const el = scroller.current
//     if (!el) return
//     const amount = el.clientWidth * 0.9
//     el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
//   }

//   return (
//     <div className="relative my-12">
//       {/* Section heading */}
//       <div className="flex items-center justify-center gap-4 mb-6">
//         <div className="h-[1px] flex-1 bg-gray-300" />
//         <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
//           Trending Now
//         </h2>
//         <div className="h-[1px] flex-1 bg-gray-300" />
//       </div>

//       {/* Category Tabs */}
//       <div className="flex items-center justify-center gap-3 mb-8 text-sm font-semibold">
//         <button className="hover:text-red-600">Best Sellings</button>
//         <span className="text-gray-400">/</span>
//         <button className="bg-gray-100 px-2 py-1 rounded dark:hover:text-gray-900 dark:hover:bg-red-400 dark:bg-red-500">
//           New Arrivals
//         </button>
//       </div>

//       {/* Product Scroller */}
//       <div
//         ref={scroller}
//         className="hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
//       >
//         {products.map((p) => (
//           <div key={p.id} className="min-w-[260px] md:min-w-[280px] snap-start">
//             <ProductCard product={p} />
//           </div>
//         ))}
//       </div>

//       {/* Scroll Controls */}
//       <div className="hidden md:block">
//         <button
//           aria-label="Scroll left"
//           onClick={() => scrollBy("left")}
//           className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
//         >
//           <ChevronLeft className="h-5 w-5 dark:text-black" />
//         </button>
//         <button
//           aria-label="Scroll right"
//           onClick={() => scrollBy("right")}
//           className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
//         >
//           <ChevronRight className="h-5 w-5 dark:text-black" />
//         </button>
//       </div>
//     </div>
//   )
// }

// // "use client"

// // import { useRef } from "react"
// // import { ChevronLeft, ChevronRight } from 'lucide-react'
// // import { Product } from "@/lib/mock-data"
// // import { ProductCard } from "@/components/product-card"

// // export function HomeFeaturedProducts({ products }: { products: Product[] }) {
// //   const scroller = useRef<HTMLDivElement>(null)
// //   const scrollBy = (dir: "left" | "right") => {
// //     const el = scroller.current
// //     if (!el) return
// //     const amount = el.clientWidth * 0.9
// //     el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
// //   }

// //   return (
// //     <div className="relative">
// //        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
// //       <div
// //         ref={scroller}
// //         className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
// //       >
// //         {products.map((p) => (
// //           <div key={p.id} className="min-w-[260px] md:min-w-[280px] snap-start">
// //             <ProductCard product={p} />
// //           </div>
// //         ))}
// //       </div>
// //       <div className="hidden md:block">
// //         <button
// //           aria-label="Scroll left"
// //           onClick={() => scrollBy("left")}
// //           className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
// //         >
// //           <ChevronLeft className="h-5 w-5" />
// //         </button>
// //         <button
// //           aria-label="Scroll right"
// //           onClick={() => scrollBy("right")}
// //           className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border bg-white p-2 shadow"
// //         >
// //           <ChevronRight className="h-5 w-5" />
// //         </button>
// //       </div>
// //     </div>
// //   )
// // }
