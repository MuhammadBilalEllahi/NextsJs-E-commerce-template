import Link from "next/link";
import { getContentPage } from "@/database/data-service";
import { notFound } from "next/navigation";
import { ContentPage } from "@/types/types";

interface DynamicContentPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicContentPage({
  params,
}: DynamicContentPageProps) {
  const { slug } = await params;

  const contentPage = (await getContentPage(slug)) as ContentPage | null;

  if (!contentPage || !contentPage.isActive) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            {contentPage.title}
          </h1>
          {contentPage.metaDescription && (
            <p className="text-neutral-600 dark:text-neutral-400">
              {contentPage.metaDescription}
            </p>
          )}
        </div>

        {/* Dynamic Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border shadow-sm">
          <div
            className="content-prose prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto max-w-none"
            dangerouslySetInnerHTML={{ __html: contentPage.content }}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-red-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Generate static params for known content pages
export async function generateStaticParams() {
  // This will be populated with actual content page slugs
  // For now, return empty array to allow dynamic generation
  return [];
}

