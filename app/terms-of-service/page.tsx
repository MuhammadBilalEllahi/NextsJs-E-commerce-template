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
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .content-prose {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
              }
              .content-prose h1 { 
                font-size: 2.5rem; 
                font-weight: 700; 
                margin: 2rem 0 1.5rem 0; 
                line-height: 1.2; 
                color: #1a1a1a; 
                letter-spacing: -0.025em;
              }
              .content-prose h2 { 
                font-size: 1.75rem; 
                font-weight: 600; 
                margin: 1.5rem 0 1rem 0; 
                line-height: 1.3; 
                color: #1a1a1a; 
                letter-spacing: -0.025em;
              }
              .content-prose h3 { 
                font-size: 1.375rem; 
                font-weight: 600; 
                margin: 1.25rem 0 0.75rem 0; 
                line-height: 1.4; 
                color: #1a1a1a; 
              }
              .content-prose h4 { 
                font-size: 1.125rem; 
                font-weight: 600; 
                margin: 1rem 0 0.5rem 0; 
                line-height: 1.4; 
                color: #1a1a1a; 
              }
              .content-prose h5 { 
                font-size: 1rem; 
                font-weight: 600; 
                margin: 0.875rem 0 0.5rem 0; 
                line-height: 1.5; 
                color: #1a1a1a; 
              }
              .content-prose h6 { 
                font-size: 0.875rem; 
                font-weight: 600; 
                margin: 0.75rem 0 0.5rem 0; 
                line-height: 1.5; 
                color: #1a1a1a; 
              }
              .content-prose p { 
                margin: 0.875rem 0; 
                line-height: 1.7; 
                color: #374151; 
                font-size: 1rem;
              }
              .content-prose ul { 
                list-style-type: disc; 
                padding-left: 1.5rem; 
                margin: 0.875rem 0; 
              }
              .content-prose ol { 
                list-style-type: decimal; 
                padding-left: 1.5rem; 
                margin: 0.875rem 0; 
              }
              .content-prose li { 
                margin: 0.375rem 0; 
                line-height: 1.6;
              }
              .content-prose strong { 
                font-weight: 600; 
                color: #1a1a1a;
              }
              .content-prose em { 
                font-style: italic; 
              }
              .content-prose a { 
                color: #dc2626; 
                text-decoration: underline; 
                font-weight: 500;
              }
              .content-prose a:hover { 
                color: #b91c1c; 
              }
              @media (prefers-color-scheme: dark) {
                .content-prose h1, .content-prose h2, .content-prose h3, .content-prose h4, .content-prose h5, .content-prose h6 { 
                  color: #f9fafb; 
                }
                .content-prose p { 
                  color: #d1d5db; 
                }
                .content-prose strong {
                  color: #f9fafb;
                }
              }
            `,
            }}
          />
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
