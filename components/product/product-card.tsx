"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AddToWishlistButton } from "@/components/wishlist/wishlist-button"
import { useCart } from "@/lib/providers/cartProvider"
import type { Product } from "@/mock_data/mock-data"
import { Star } from 'lucide-react'

export function ProductCard({
  product,
  variant = "grid",
}: {
  product: Product
  variant?: "grid" | "list"
}) {
  const { add, isAdding } = useCart()

  const handleAddToCart = () => {
    if (isAdding) return // Prevent duplicate clicks
    add({ id: product.id, title: product.title, price: product.price, image: product.image }, 1)
  }

  if (variant === "list") {
    return (
      <div className="rounded-xl border overflow-hidden bg-white dark:bg-neutral-950 flex">
        <Link href={`/product/${product.slug}`} className="block">
          <img
            src={product.image || "/placeholder.svg?height=160&width=200&query=list product"}
            alt={product.title}
            className="h-40 w-52 object-cover"
          />
        </Link>
        <div className="flex-1 p-4">
          <div className="flex justify-between gap-2">
            <Link href={`/product/${product.slug}`} className="font-semibold hover:text-red-600">
              {product.title}
            </Link>
            <AddToWishlistButton productId={product.id} />
          </div>
          <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {product.description}
          </div>
          <div className="mt-2 flex items-center gap-2 text-amber-500">
            <Star className="h-4 w-4 fill-amber-500" />
            <span className="text-sm">{product.rating?.toFixed(1) ?? "4.5"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="font-semibold text-red-600">${product.price.toFixed(2)}</div>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group rounded-2xl border overflow-hidden bg-white dark:bg-neutral-950 hover:shadow-md transition">
      <Link href={`/product/${product.slug}`} className="block">
        <img
          src={product.image || "/placeholder.svg?height=176&width=320&query=grid product"}
          alt={product.title}
          className="h-44 w-full object-cover group-hover:scale-[1.01] transition-transform"
        />
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="font-medium line-clamp-1 hover:text-red-600">
            {product.title}
          </Link>
          <AddToWishlistButton productId={product.id} small />
        </div>
        <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          {product.brand} • Spice {product.spiceLevel}/5
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="font-semibold text-red-600">${product.price.toFixed(2)}</div>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  )
}
