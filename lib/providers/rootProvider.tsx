"use client";

import { AuthProvider } from "@/lib/providers/authProvider";
import { CartProvider } from "@/lib/providers/cartContext";
import { WishlistProvider } from "@/lib/providers/wishlistProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AppProvider } from "./context/AppContext";

export function RootProviders({ children }: { children: ReactNode }) {
  // Provider hierarchy: Session -> Auth -> Cart -> Wishlist
  // Cart depends on Auth for user identification
  return (
    <SessionProvider>
      <AppProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </AppProvider>
    </SessionProvider>
  );
}
