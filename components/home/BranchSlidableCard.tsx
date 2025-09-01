// "use client"

// import React from "react"
// import { Branch } from "@/lib/api/admin/branches/branches"
// import { ExternalLink,  PhoneIcon } from "lucide-react"
// import Link from "next/link"

// const cards = [
//   { id: 1, title: "Card One", color: "bg-red-400" },
//   { id: 2, title: "Card Two", color: "bg-blue-400" },
//   { id: 3, title: "Card Three", color: "bg-green-400" },
//   { id: 4, title: "Card Four", color: "bg-purple-400" },
// ]

// export default function StackedCards({branches}: {branches: Branch[]}) {
//   return (
//     <div className="w-full">
//       {/* Stacked cards section */}
//       <div className="relative h-[200vh]">
//         {branches.map((card, i) => (

// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-10 my-8">
// {branches.map((c) => (
// <div key={c._id}
// className="sticky top-[5px]   group rounded-2xl border bg-white dark:bg-neutral-900 p-6 hover:shadow-xl transition-all duration-200"

//             style={{
//               zIndex: cards.length + i, // ensure the latest card is on top
//             }}>
//     <img
//       src={c.logo || "/placeholder.svg"}
//       alt={c.name}
//       className="mx-auto h-24 w-24 object-contain rounded-xl ring-1 ring-black/5"
//     />
//     <div className="absolute top-4 right-4 z-10">
//          <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
//            Branch {c.branchNumber}
//          </span>
//        </div>
//     <div className="mt-4 text-center font-semibold text-lg group-hover:text-red-600">
//       {c.name} 
//     </div>
//     <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center px-3">
//       {c.address}  
//       <Link
//         className="inline-flex items-center text-red-600 hover:text-red-800 pt-1"
//     href={c.location}
//     target="_blank"
//     rel="noopener noreferrer" >
//       <ExternalLink size={15} className="mx-0.5 inline-block"/>
//   </Link>
//     </p>
//     <a href={`tel:${c.phoneNumber}`} className="flex mt-2 text-sm text-gray-800 dark:text-gray-300 justify-center">
//       <PhoneIcon size={15} className="m-0.5 inline-block"/> {c.phoneNumber}
//     </a>
      
//   </div>
// ))}
// </div>
//         ))}
//       </div>

      
//     </div>
//   )
// }

"use client"

import React from "react"
import { Branch } from "@/lib/api/admin/branches/branches"
import { ExternalLink, PhoneIcon } from "lucide-react"
import Link from "next/link"

export default function StackedCards({ branches }: { branches: Branch[] }) {
  return (
    <div className="w-full ">
      {/* Stacked cards section */}
      <div className="relative h-[200vh]">
        {branches.map((c, i) => (
          <div
            key={c._id}
            className="sticky  mx-4 my-2 rounded-2xl border bg-white dark:bg-neutral-900 p-6 shadow-lg transition-all duration-200"
            style={{
              top: `${20 + (i * 7)}%`,
              zIndex: branches.length + i, // last one on top
            }}
          >
            {/* Logo */}
            <img
              src={c.logo || "/placeholder.svg"}
              alt={c.name}
              className="mx-auto h-24 w-24 object-contain rounded-xl ring-1 ring-black/5"
            />

            {/* Branch badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                Branch {c.branchNumber}
              </span>
            </div>

            {/* Title */}
            <div className="mt-4 text-center font-semibold text-lg group-hover:text-red-600">
              {c.name}
            </div>

            {/* Address + link */}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center px-3">
              {c.address}
              <Link
                className="inline-flex items-center text-red-600 hover:text-red-800 pt-1"
                href={c.location}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={15} className="mx-0.5 inline-block" />
              </Link>
            </p>

            {/* Phone */}
            <a
              href={`tel:${c.phoneNumber}`}
              className="flex mt-2 text-sm text-gray-800 dark:text-gray-300 justify-center"
            >
              <PhoneIcon size={15} className="m-0.5 inline-block" />{" "}
              {c.phoneNumber}
            </a>
          </div>
        ))}
      </div>

     
    </div>
  )
}
