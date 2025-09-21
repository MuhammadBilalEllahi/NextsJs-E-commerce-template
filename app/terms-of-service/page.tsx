import Link from "next/link";
import { getContentPage } from "@/database/data-service";
import { notFound } from "next/navigation";

interface ContentPage {
  _id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default async function TermsOfServicePage() {
  const contentPage = (await getContentPage(
    "terms-of-service"
  )) as ContentPage | null;

  if (!contentPage) {
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
        <div className="">
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
