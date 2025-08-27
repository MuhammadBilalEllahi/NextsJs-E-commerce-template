"use client"

import { useWishlist } from "@/lib/providers/wishlistProvider"
import { Heart } from 'lucide-react'

export function AddToWishlistButton({ productId, small = false }: { productId: string; small?: boolean }) {
  const { has, toggle } = useWishlist()
  const active = has(productId)
  return (
    <button
      aria-label="Add to wishlist"
      onClick={() => toggle(productId)}
      className={`inline-flex items-center justify-center rounded ${small ? "h-8 w-8 border" : "h-9 w-9 border"} hover:bg-red-50 dark:hover:bg-neutral-900`}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`h-4 w-4 ${active ? "text-red-600 fill-red-600" : ""}`} />
    </button>
  )
}
