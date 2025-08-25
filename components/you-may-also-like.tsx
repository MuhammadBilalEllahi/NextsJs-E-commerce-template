import { getAllProducts } from "@/lib/data"
import { ProductCard } from "./product/product-card"

export async function YouMayAlsoLike({ currentId }: { currentId: string }) {
  const all = await getAllProducts()
  const picks = all.filter((p) => p.id !== currentId).slice(0, 4)
  return (
    <div className="container mx-auto px-0">
      <h2 className="text-xl font-semibold mb-4">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
