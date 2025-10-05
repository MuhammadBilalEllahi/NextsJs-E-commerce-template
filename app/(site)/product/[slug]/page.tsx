import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { getAllProducts, getProductBySlug } from "@/database/data-service";
import { Product, Review } from "@/types";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildCanonical,
} from "@/lib/seo";

export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = `${product.name}`;
  const description =
    product.description || "Premium spice product from Dehli Mirch.";
  const url = absoluteUrl(`/product/${slug}`);
  const images = (product.images || []).map((i: string) =>
    i.startsWith("http") ? i : absoluteUrl(i)
  );

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      url,
      images: images.length ? images : ["/dehli-mirch-og-banner.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? images : ["/dehli-mirch-og-banner.png"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  // Ensure review data is properly formatted
  const fixedProduct = {
    ...product,
    reviews:
      product.reviews?.map((review: Review) => ({
        ...review,
        id: String(review.id), // Keep as string to match interface
      })) ?? [],
  };

  const canonical = buildCanonical(`/product/${slug}`);
  const productJsonLd = buildProductJsonLd({
    name: fixedProduct.name,
    description: fixedProduct.description,
    images: fixedProduct.images,
    price: fixedProduct.price,
    currency: "PKR",
    inStock: !fixedProduct.stock,
    aggregateRating:
      fixedProduct.reviews.length > 0
        ? {
            ratingValue: fixedProduct.rating || 0,
            reviewCount: fixedProduct.reviews.length,
          }
        : null,
    url: absoluteUrl(`/product/${slug}`),
  });

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Product", item: absoluteUrl("/shop") },
    { name: fixedProduct.name, item: absoluteUrl(`/product/${slug}`) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ProductDetailClient product={fixedProduct as unknown as Product} />
    </>
  );
}
