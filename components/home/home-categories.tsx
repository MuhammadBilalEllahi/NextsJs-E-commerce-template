import Link from "next/link"
import { Category } from "@/mock_data/mock-data"

export function HomeCategories({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/category/${c.slug}`}
          className="group rounded-2xl border bg-white dark:bg-neutral-900 p-4 hover:shadow-md transition-shadow"
        >
          <img
            src={c.image || "/placeholder.svg"}
            alt={c.name}
            className="mx-auto h-24 w-24 object-cover rounded-xl ring-1 ring-black/5"
          />
          <div className="mt-3 text-center font-medium group-hover:text-red-600">{c.name}</div>
        </Link>
      ))}
    </div>
  )
}
