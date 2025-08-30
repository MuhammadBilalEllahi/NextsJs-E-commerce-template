// "use client"

// import { useEffect, useState } from "react"
// import { Star } from 'lucide-react'
// import { testimonials } from "@/lib/mock-data"

// export function HomeTestimonials() {
//   const [index, setIndex] = useState(0)
//   useEffect(() => {
//     const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 3500)
//     return () => clearInterval(id)
//   }, [])
//   const t = testimonials[index]

//   return (
//     <div className="rounded-2xl border bg-white dark:bg-neutral-900 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
//       <img
//         src={t.avatar || "/placeholder.svg?height=64&width=64&query=avatar"}
//         alt={t.name}
//         className="h-16 w-16 rounded-full object-cover ring-2 ring-orange-500/40"
//       />
//       <div className="flex-1">
//         <div className="flex items-center gap-1 text-yellow-500">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-yellow-400" : "opacity-30"}`} />
//           ))}
//         </div>
//         <blockquote className="mt-2 text-lg font-medium">{'“'}{t.quote}{'”'}</blockquote>
//         <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">— {t.name}</div>
//       </div>
//     </div>
//   )
// }
