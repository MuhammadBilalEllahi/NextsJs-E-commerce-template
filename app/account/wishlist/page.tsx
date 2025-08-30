"use client"

import { useWishlist } from "@/lib/providers/wishlistProvider"
import { useCart } from "@/lib/providers/cartProvider"
import { Button } from "@/components/ui/button"
import { Heart, Trash2 } from 'lucide-react'
import Link from "next/link"
import { products } from "@/mock_data/mock-data"

export default function WishlistPage() {
  const { ids, remove } = useWishlist()
  const { add, isAdding } = useCart()

  // Get wishlisted products from the products array
  const wishlistedProducts = products.filter(product => ids.has(product.id))

  const handleAddToCart = (product: any) => {
    if (isAdding) return
    add(
      { 
        id: product.id, 
        title: product.title, 
        price: product.price, 
        image: product.image 
      }, 
      1
    )
  }

  if (wishlistedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">💝</div>
          <h1 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Start adding products to your wishlist to save them for later!
          </p>
          <Link href="/category/all">
            <Button className="bg-green-600 hover:bg-green-700">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => wishlistedProducts.forEach(product => remove(product.id))}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistedProducts.map((product) => (
          <div key={product.id} className="group rounded-2xl border overflow-hidden bg-white dark:bg-neutral-950 hover:shadow-md transition">
            <Link href={`/product/${product.slug}`} className="block">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                className="h-44 w-full object-cover group-hover:scale-[1.01] transition-transform"
              />
            </Link>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/product/${product.slug}`} className="font-medium line-clamp-1 hover:text-red-600">
                  {product.title}
                </Link>
                <button 
                  onClick={() => remove(product.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Heart className="h-4 w-4 fill-red-600" />
                </button>
              </div>
              <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                {product.brand} • Spice {product.spiceLevel}/5
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="font-semibold text-red-600">Rs. {product.price.toFixed(2)}</div>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
