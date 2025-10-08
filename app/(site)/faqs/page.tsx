import Link from "next/link";
import { getContentPage } from "@/database/data-service";
import { notFound } from "next/navigation";
import { ContentPage } from "@/types/types";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
} from "@/lib/seo";

export default async function FAQsPage() {
  const contentPage = (await getContentPage("faqs")) as ContentPage | null;

  if (!contentPage) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildFaqPageJsonLd(
              // naive extraction: convert headings + paragraphs into Q/A when possible
              // assuming content contains HTML with <h3>Question</h3><p>Answer</p>
              []
            )
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "Home", item: absoluteUrl("/") },
              { name: "FAQs", item: absoluteUrl("/faqs") },
            ])
          ),
        }}
      />
      <div className="max-w-4xl mx-auto">
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
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
