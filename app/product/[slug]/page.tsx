import { notFound } from "next/navigation"
import { getAllProducts, getProductBySlug } from "@/lib/data-service"
import { ProductDetailClient } from "@/components/product/product-detail-client"

export async function generateStaticParams() {
  const products = await getAllProducts();
  console.log("products", products);
  return products.map((p) => ({ slug: p.slug }))
}

export default async function Page({ params }: { params: { slug: string } }) {
  const {slug}  = await params;
  const product = await getProductBySlug(slug)

  if (!product) {
    return notFound()
  }

  return <ProductDetailClient product={product} />
}
