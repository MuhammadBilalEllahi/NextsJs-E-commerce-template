import Link from "next/link";
import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import dbConnect from "@/database/mongodb";
import Blog from "@/models/Blog";

export const metadata: Metadata = {
  title: "Dehli Mirch Blog",
  description: "Recipes, tips, and spice stories.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Dehli Mirch Blog",
    description: "Recipes, tips, and spice stories.",
    url: "/blog",
  },
};

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  try {
    await dbConnect();
    const posts = await Blog.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const filtered = q
      ? posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
      : posts;

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
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="rounded-lg border overflow-hidden hover:shadow"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4">
                {p.tags && p.tags.length > 0 && (
                  <div className="text-xs text-primary font-semibold">
                    {p.tags.join(" • ")}
                  </div>
                )}
                <h3 className="mt-1 font-semibold line-clamp-2">{p.title}</h3>
                {p.excerpt && (
                  <p className="mt-1 text-sm text-foreground dark:text-foreground/40 line-clamp-2">
                    {p.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Blog</h1>
        <p className="text-foreground dark:text-foreground/40">
          Error loading blog posts. Please try again later.
        </p>
      </div>
    );
  }
}
