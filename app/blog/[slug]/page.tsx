import { getAllBlogs } from "@/mock_data/data"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const posts = await getAllBlogs()
  const post = posts.find((p) => p.slug === slug)
  if (!post) return notFound()

  const related = posts.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/blog" className="text-red-600 underline">
        ← Back to Blog
      </Link>
      <div className="mt-4 grid lg:grid-cols-4 gap-8">
        <article className="lg:col-span-3">
          <img
            src={post.image || "/placeholder.svg?height=420&width=720&query=blog detail hero"}
            alt={post.title}
            className="w-full max-h-[420px] object-cover rounded-lg"
          />
          <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>
          <div className="mt-1 text-sm text-red-600">{post.tags.join(" • ")}</div>
          <div className="prose dark:prose-invert mt-4">
            <p>{post.content}</p>
          </div>
          {/* Simple local comment box (placeholder for CMS) */}
          <section className="mt-10">
            <h2 className="font-semibold mb-2">Comments</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Comments are powered by your CMS integration.
            </p>
          </section>
        </article>
        <aside>
          <h3 className="font-semibold">Featured</h3>
          <div className="mt-3 space-y-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="flex gap-3 rounded border p-2 hover:shadow">
                <img
                  src={r.image || "/placeholder.svg?height=64&width=96&query=blog card"}
                  alt={r.title}
                  className="h-16 w-24 object-cover rounded"
                />
                <div>
                  <div className="text-xs text-red-600">{r.tags.join(" • ")}</div>
                  <div className="font-medium line-clamp-2">{r.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
