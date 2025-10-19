import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/database/mongodb";
import Blog from "@/models/Blog";
import {
  absoluteUrl,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
import Image from "next/image";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    await dbConnect();
    const post = await Blog.findOne({ slug, isActive: true }).lean();
    if (!post) return notFound();

    const related = await Blog.find({
      slug: { $ne: slug },
      isActive: true,
    })
      .limit(3)
      .lean();

    const jsonLd = buildBlogPostingJsonLd({
      headline: post.title,
      description: post.excerpt || undefined,
      image: post.image || undefined,
      datePublished: post.createdAt
        ? new Date(post.createdAt).toISOString()
        : undefined,
      dateModified: post.updatedAt
        ? new Date(post.updatedAt).toISOString()
        : undefined,
      url: absoluteUrl(`/blog/${slug}`),
    });

    const breadcrumb = buildBreadcrumbJsonLd([
      { name: "Home", item: absoluteUrl("/") },
      { name: "Blog", item: absoluteUrl("/blog") },
      { name: post.title, item: absoluteUrl(`/blog/${slug}`) },
    ]);

    return (
      <div className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
        />
        <Link href="/blog" className="text-primary underline">
          ← Back to Blog
        </Link>
        <div className="mt-4 grid lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            {post.image && (
              <Image
                width={128}
                height={128}
                src={post.image || ""}
                alt={post.title}
                className="w-full max-h-[420px] object-cover rounded-lg"
              />
            )}
            <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-1 text-sm text-primary">
                {post.tags.join(" • ")}
              </div>
            )}
            <div className="prose dark:prose-invert mt-4">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
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
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="flex gap-3 rounded border p-2 hover:shadow"
                >
                  {r.image && (
                    <Image
                      width={128}
                      height={128}
                      src={r.image || ""}
                      alt={r.title}
                      className="h-16 w-24 object-cover rounded"
                    />
                  )}
                  <div>
                    {r.tags && r.tags.length > 0 && (
                      <div className="text-xs text-primary">
                        {r.tags.join(" • ")}
                      </div>
                    )}
                    <div className="font-medium line-clamp-2">{r.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return notFound();
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const post = await Blog.findOne({ slug, isActive: true }).lean();
  if (!post) return {};

  const title = post.title;
  const description = post.excerpt || undefined;
  const url = absoluteUrl(`/blog/${slug}`);
  const image =
    post.image &&
    (post.image.startsWith("http") ? post.image : absoluteUrl(post.image));

  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      url,
      images: image ? [image] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
