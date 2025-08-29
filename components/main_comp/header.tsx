"use client"

import Link from "next/link"
import { ShoppingCart, Heart } from 'lucide-react'
import { useCart } from "@/lib/providers/cartProvider"
import { useWishlist } from "@/lib/providers/wishlistProvider"
import { CartSheet } from "@/components/cart/cart-sheet"
import { HomeSearchBar } from "@/components/home/home-search-bar"
import type { Category } from "@/mock_data/mock-data"

export function Header({ categories }: { categories?: Category[] }) {
  const { count, isAdding } = useCart()
  const { ids: wishlistIds } = useWishlist()

  return (
    <header className=" border-b bg-white/85 dark:bg-neutral-950/85 backdrop-blur">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        {/* Website Name */}
        <Link href="/" className="font-extrabold text-xl tracking-tight flex-shrink-0">
          <span className="text-red-600">Dehli</span> <span className="text-green-600">Mirch</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          {categories ? (
            <HomeSearchBar categories={categories} />
          ) : (
            <div className="flex-1 max-w-2xl h-10 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-500 text-sm">
              Search functionality loading...
            </div>
          )}
        </div>

        {/* Cart and Wishlist Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/account/wishlist">
            <button
              className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="h-5 w-5 text-red-600" />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full bg-red-600 text-white text-[10px] grid place-items-center px-1">
                  {wishlistIds.size}
                </span>
              )}
            </button>
          </Link>
          
          <CartSheet>
            <button
              className={`relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                isAdding ? 'bg-green-100 dark:bg-green-900' : ''
              }`}
              aria-label="Cart"
              title="View Cart"
              disabled={isAdding}
            >
              <ShoppingCart className={`h-5 w-5 ${isAdding ? 'text-green-600' : 'text-green-700'}`} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full bg-green-600 text-white text-[10px] grid place-items-center px-1">
                  {count}
                </span>
              )}
              {isAdding && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3 w-3 animate-spin rounded-full border border-green-600 border-t-transparent"></div>
                </div>
              )}
            </button>
          </CartSheet>
        </div>
      </div>
    </header>
  )
}
