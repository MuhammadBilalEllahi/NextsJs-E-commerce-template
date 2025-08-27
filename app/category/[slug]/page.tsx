import { RootProviders } from "@/lib/providers/rootProvider"
import { CategoryClient } from "@/components/category/category-client"
import { getAllProducts } from "@/database/data-service"


export const dynamic = "force-dynamic"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const allProducts = await getAllProducts()

  return (
    <RootProviders>
      <CategoryClient slug={slug} allProducts={allProducts} />
    </RootProviders>
  )
}
