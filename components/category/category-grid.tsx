import Link from "next/link"
import { CherryIcon as Chili, Soup, Croissant, CupSoda } from 'lucide-react'

const categories = [
  { slug: "spices", label: "Spices", Icon: Chili },
  { slug: "pickles", label: "Pickles", Icon: CupSoda },
  { slug: "snacks", label: "Snacks", Icon: Croissant },
  { slug: "masalas", label: "Masalas", Icon: Soup },
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {categories.map(({ slug, label, Icon }) => (
        <Link key={slug} href={`/category/${slug}`} className="group rounded-lg border p-4 text-center hover:shadow bg-white">
          <Icon className="mx-auto h-7 w-7 text-red-600 group-hover:scale-110 transition-transform" />
          <div className="mt-2 font-medium">{label}</div>
        </Link>
      ))}
    </div>
  )
}
