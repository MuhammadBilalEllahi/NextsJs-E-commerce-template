import Link from "next/link"
import { getAllBlogs } from "@/mock_data/data"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Dehli Mirch Blog",
  description: "Recipes, tips, and spice stories.",
}

export default async function BlogListPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const posts = await getAllBlogs()
  const filtered = q ? posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())) : posts

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h1 className="text-2xl font-bold">Blog</h1>
        <form action="" className="ml-auto">
          <Input name="q" placeholder="Search blog" defaultValue={q ?? ""} />
        </form>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-lg border overflow-hidden hover:shadow">
            <img
              src={p.image || "/placeholder.svg?height=160&width=320&query=blog cover"}
              alt={p.title}
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <div className="text-xs text-red-600 font-semibold">{p.tags.join(" • ")}</div>
              <h3 className="mt-1 font-semibold line-clamp-2">{p.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
