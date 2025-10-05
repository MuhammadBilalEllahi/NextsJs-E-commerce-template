import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import {
  getAllProducts,
  getAllCategories,
  getFeaturedBlogs,
} from "@/database/data-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/return-refund",
    "/shipping-policy",
    "/faqs",
    "/blog",
    "/shop/spices",
  ].map((p) => ({ url: absoluteUrl(p), lastModified: new Date() }));

  const [products, categories, blogs] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getFeaturedBlogs(),
  ]);

  const productEntries = (products || []).map((p: any) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryEntries = (categories || []).map((c: any) => ({
    url: `${base}/shop/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const blogEntries = (blogs || []).map((b: any) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productEntries,
    ...categoryEntries,
    ...blogEntries,
  ];
}
