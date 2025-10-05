// Centralized SEO helpers for canonical URLs, site metadata, and JSON-LD builders

export const getSiteUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;
  // Default fallback for local/dev
  return "http://localhost:3000";
};

export const absoluteUrl = (path: string): string => {
  const base = getSiteUrl();
  if (!path) return base;
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};

export const buildCanonical = (pathname: string): string => {
  return absoluteUrl(pathname);
};

export const defaultOpenGraph = {
  type: "website" as const,
  siteName: "Dehli Mirch",
  images: [
    {
      url: "/dehli-mirch-og-banner.png",
      width: 1200,
      height: 630,
      alt: "Dehli Mirch — Authentic Spices, Pickles, Snacks",
    },
  ],
};

export const defaultTwitter = {
  card: "summary_large_image" as const,
  creator: "@dehlimirch",
};

// JSON-LD builders
export type ProductSeoInput = {
  name: string;
  description?: string | null;
  images?: string[] | null;
  sku?: string | null;
  brandName?: string | null;
  price: number;
  currency?: string;
  inStock?: boolean;
  aggregateRating?: { ratingValue: number; reviewCount: number } | null;
  url: string; // absolute
};

export function buildProductJsonLd(input: ProductSeoInput) {
  const {
    name,
    description,
    images,
    sku,
    brandName,
    price,
    currency = "USD",
    inStock = true,
    aggregateRating,
    url,
  } = input;

  const data: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images && images.length > 0 ? images : undefined,
    sku: sku || undefined,
    brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
    },
  };

  if (aggregateRating && aggregateRating.reviewCount > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
    };
  }

  return data;
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dehli Mirch",
    url: getSiteUrl(),
    logo: absoluteUrl("/placeholder-logo.png"),
  };
}

export function buildWebSiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dehli Mirch",
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; item: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((b, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: b.name,
      item: b.item,
    })),
  };
}

export function buildBlogPostingJsonLd(input: {
  headline: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  url: string; // absolute
}) {
  const { headline, description, image, datePublished, dateModified, url } =
    input;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description: description || undefined,
    image: image ? [image] : undefined,
    datePublished: datePublished || undefined,
    dateModified: dateModified || undefined,
    mainEntityOfPage: url,
  };
}

export function buildFaqPageJsonLd(
  questions: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function buildCollectionPageJsonLd(input: {
  name: string;
  url: string; // absolute
  breadcrumb: Array<{ name: string; item: string }>;
}) {
  const { name, url, breadcrumb } = input;
  return {
    collection: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      url,
    },
    breadcrumb: buildBreadcrumbJsonLd(breadcrumb),
  } as const;
}
