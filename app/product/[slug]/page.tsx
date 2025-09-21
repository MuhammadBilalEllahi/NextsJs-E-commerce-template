import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { getAllProducts, getProductBySlug } from "@/database/data-service";

export async function generateStaticParams() {
  const products = await getAllProducts();
  // console.log("products", products);
  return products.map((p) => ({ slug: p.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // console.log("product", product);
  if (!product) {
    return notFound();
  }

  // Ensure review data is properly formatted
  const fixedProduct = {
    ...product,
    reviews:
      product.reviews?.map((review: any) => ({
        ...review,
        id: String(review.id), // Keep as string to match interface
      })) ?? [],
  };

  return <ProductDetailClient product={fixedProduct} />;
}
