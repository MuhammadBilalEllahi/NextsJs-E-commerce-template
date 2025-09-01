"use client"

import { AuthProvider } from "@/lib/providers/authProvider"
import { CartProvider } from "@/lib/providers/cartProvider"
import { WishlistProvider } from "@/lib/providers/wishlistProvider"
import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

export function RootProviders({ children }: { children: ReactNode }) {
  // Provider hierarchy: Session -> Auth -> Cart -> Wishlist
  // Cart depends on Auth for user identification
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
