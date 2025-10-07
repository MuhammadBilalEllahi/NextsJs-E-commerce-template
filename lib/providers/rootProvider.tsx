"use client";

import { AuthProvider } from "@/lib/providers/authProvider";
import { CartProvider } from "@/lib/providers/cartContext";
import { WishlistProvider } from "@/lib/providers/wishlistProvider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./themeProvider";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function RootProviders({ children }: { children: ReactNode }) {
  // Provider hierarchy: Session -> Auth -> Cart -> Wishlist
  // Cart depends on Auth for user identification
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeProvider>
          <AppProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>{children}</WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </AppProvider>
        </ThemeProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
