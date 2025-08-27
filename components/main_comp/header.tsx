"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Sun, Moon, Heart } from 'lucide-react'
import { useEffect, useState } from "react"
import { useCart } from "@/lib/providers/cartProvider"
import { useWishlist } from "@/lib/providers/wishlistProvider"
import { CartSheet } from "@/components/cart/cart-sheet"

export function Header() {
  const pathname = usePathname()
  const { count, isAdding } = useCart()
  const { ids: wishlistIds } = useWishlist()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("dm-theme")) as "light" | "dark" | null
    const initial =
      stored ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(initial)
    if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    if (typeof window !== "undefined") localStorage.setItem("dm-theme", next)
    if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", next === "dark")
  }

  const nav = [
    { href: "/", label: "Home" },
    { href: "/category/all", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 dark:bg-neutral-950/85 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-extrabold text-lg tracking-tight">
          <span className="text-red-600">Delhi</span> <span className="text-green-600">Mirch</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm hover:text-red-600 ${
                pathname === n.href || pathname?.startsWith(n.href) ? "text-red-600 font-medium" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/account/wishlist">
            <button
              className="relative h-9 w-9 inline-flex items-center justify-center rounded border"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="h-4 w-4 text-red-600" />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] rounded-full bg-red-600 text-white text-[10px] grid place-items-center px-1">
                  {wishlistIds.size}
                </span>
              )}
            </button>
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 inline-flex items-center justify-center rounded border"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <CartSheet>
            <button
              className={`relative h-9 w-9 inline-flex items-center justify-center rounded border transition-colors ${
                isAdding ? 'bg-green-100 dark:bg-green-900' : ''
              }`}
              aria-label="Cart"
              title="View Cart"
              disabled={isAdding}
            >
              <ShoppingCart className={`h-4 w-4 ${isAdding ? 'text-green-600' : 'text-green-700'}`} />
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
