import { notFound } from "next/navigation"
import { ProductDetailClient } from "@/components/product/product-detail-client"
import { getAllProducts, getProductBySlug } from "@/database/data-service";

export async function generateStaticParams() {
  const products = await getAllProducts();
  // console.log("products", products);
  return products.map((p) => ({ slug: p.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const {slug}  = await params;
  const product = await getProductBySlug(slug)
  // console.log("product", product);
  if (!product) {
    return notFound()
  }

  // Convert review id from string to number
  const fixedProduct = {
    ...product,
    reviews: product.reviews?.map((review: any) => ({
      ...review,
      id: typeof review.id === "string" ? Number(review.id) : review.id,
    })) ?? [],
  };

  return <ProductDetailClient product={fixedProduct} />
}
