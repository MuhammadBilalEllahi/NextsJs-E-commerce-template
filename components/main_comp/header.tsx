"use client"

import Link from "next/link"
import { ShoppingCart, Heart, ShoppingBag } from 'lucide-react'
import { useCart } from "@/lib/providers/cartProvider"
import { useWishlist } from "@/lib/providers/wishlistProvider"
import { CartSheet } from "@/components/cart/cart-sheet"
import { HomeSearchBar } from "@/components/home/home-search-bar"
import { AuthButton } from "@/components/auth/auth-button"
import type { Category } from "@/mock_data/mock-data"

export function Header({ categories }: { categories?: Category[] }) {
  const { count, isAdding } = useCart()
  const { ids: wishlistIds } = useWishlist()

  return (
    <header className="border-b bg-white/85 dark:bg-neutral-950/85 backdrop-blur md:flex hidden">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        {/* Website Name */}
        <Link href="/" className="font-extrabold text-xl tracking-tight flex-shrink-0">
          <span className="text-red-600">Dehli</span> <span className="text-green-600">Mirch</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 max-w-2xl">
          {categories ? (
            <HomeSearchBar categories={categories} />
          ) : (
            <div className="flex-1 max-w-2xl h-10 bg-neutral-100 dark:bg-neutral-800 rounded-md flex items-center justify-center text-neutral-500 text-sm">
              Search functionality loading...
            </div>
          )}
        </div>

        {/* Cart, Wishlist, and Auth - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <CartSheet>
            <button
              className={`relative flex flex-row items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${isAdding ? 'bg-green-100 dark:bg-green-900' : ''
                }`}
              aria-label="Cart"
              title="View Cart"
              disabled={isAdding}
            >
              <ShoppingBag className="h-6 w-6 text-black dark:text-gray-300" />
              <div className="flex flex-col items-start">
                {count > 0 && (
                  <span className="h-5 min-w-[1.7rem] rounded-full bg-black dark:bg-gray-300 text-white dark:text-gray-900 text-[10px] grid place-items-center px-1">
                    {count}
                  </span>
                )}
                <p className="text-sm font-medium text-black dark:text-gray-300 tracking-wide">Cart</p>
              </div>
            </button>
          </CartSheet>

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

          {/* Auth Button */}
          <AuthButton variant="outline" size="sm" />
        </div>
      </div>
    </header>
  )
}
