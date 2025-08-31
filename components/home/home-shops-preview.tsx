import Link from "next/link"
import { ShopLocations } from "@/mock_data/mock-data"
import { ExternalLink, PhoneIcon } from "lucide-react"

export function HomeShopLocations({ shopLocation }: { shopLocation: ShopLocations[] }) {
  // console.log("shopLocation",shopLocation);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-10 my-8">
      {shopLocation.map((c) => (
      <div key={c._id}
      className="relative group rounded-2xl border bg-white dark:bg-neutral-900 p-6 hover:shadow-xl transition-all duration-200">
          <img
            src={c.logo || "/placeholder.svg"}
            alt={c.name}
            className="mx-auto h-24 w-24 object-contain rounded-xl ring-1 ring-black/5"
          />
          <div className="absolute top-4 right-4 z-10">
               <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                 Branch {c.branchNumber}
               </span>
             </div>
          <div className="mt-4 text-center font-semibold text-lg group-hover:text-red-600">
            {c.name} 
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center px-3">
            {c.address}  
            <Link
              className="inline-flex items-center text-red-600 hover:text-red-800 pt-1"
          href={c.location}
          target="_blank"
          rel="noopener noreferrer" >
            <ExternalLink size={15} className="mx-0.5 inline-block"/>
        </Link>
          </p>
          <a href={`tel:${c.phoneNumber}`} className="flex mt-2 text-sm text-gray-800 dark:text-gray-300 justify-center">
            <PhoneIcon size={15} className="m-0.5 inline-block"/> {c.phoneNumber}
          </a>
            
        </div>
      ))}
    </div>
  )
}

