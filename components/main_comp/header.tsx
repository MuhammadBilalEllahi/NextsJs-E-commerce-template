// "use client"

import Link from "next/link";
import { ShoppingCart, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/providers/cartContext";
import { useWishlist } from "@/lib/providers/wishlistProvider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { HomeSearchBar } from "@/components/home/home-search-bar";
import { AuthButton } from "@/components/auth/auth-button";
import { Category } from "@/types/types";
import { useAuth } from "@/lib/providers/authProvider";
// import { useEffect, useState } from "react"

export function Header({ categories }: { categories?: Category[] }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(); // Destructure isLoading as well
  const { count, isAdding, refreshCart, isHydrated } = useCart();
  const { ids: wishlistIds } = useWishlist();

  return (
    <header className="border-b bg-background/85 backdrop-blur md:flex hidden z-30">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-6">
        {/* Website Name */}
        <Link
          href="/"
          className="font-extrabold text-xl tracking-tight flex-shrink-0"
        >
          <span className="text-primary">Dehli</span>{" "}
          <span className="text-foreground">Mirch</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 max-w-2xl">
          {categories ? (
            <HomeSearchBar categories={categories as Category[]} />
          ) : (
            <div className="flex-1 max-w-2xl h-10 bg-primary/10 dark:bg-primary/90 rounded-md flex items-center justify-center text-primary/50 text-sm">
              Search functionality loading...
            </div>
          )}
        </div>

        {/* Cart, Wishlist, and Auth - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <CartSheet>
            <button
              className={`relative flex flex-row items-center gap-2 px-3 py-2 rounded-full  text-foreground hover:text-primary  transition-colors ${
                isAdding ? "bg-primary/10 dark:bg-primary/90" : ""
              }`}
              aria-label="Cart"
              title="View Cart"
              disabled={isAdding}
            >
              <ShoppingBag className="h-6 w-6 " />
              <div className="flex flex-col items-start">
                {isHydrated && count > 0 && (
                  <span className="h-5 min-w-[1.7rem] rounded-full bg-primary text-foreground text-[10px] grid place-items-center px-1">
                    {count}
                  </span>
                )}
                <p className="text-sm font-medium  tracking-wide">Cart</p>
              </div>
            </button>
          </CartSheet>

          <Link href="/account/wishlist">
            <button
              className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-primary/10  transition-colors"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="h-5 w-5 text-primary hover:text-primary" />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full bg-primary text-white text-[10px] grid place-items-center px-1">
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
  );
}
