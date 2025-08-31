"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sun, Moon, ShoppingBag, Menu, Search } from 'lucide-react'
import { useEffect, useState } from "react"
import { CartSheet } from "../cart/cart-sheet"
import { useCart } from "@/lib/providers/cartProvider"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet"

export function Navbar() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("dm-theme")) as "light" | "dark" | null
    const initial =
      stored ?? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    setTheme(initial)
    if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", initial === "dark")
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const val = 60
      setScrolled(window.scrollY > val ? true : window.scrollY < val && false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    if (typeof window !== "undefined") localStorage.setItem("dm-theme", next)
    if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", next === "dark")
  }

  const { count, isAdding } = useCart()
  const nav = [
    { href: "/", label: "Home" },
    { href: "/category/all", label: "Shop" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white/95 dark:bg-neutral-950/95 backdrop-blur">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          {/* Mobile Hamburger Menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xl tracking-tight">
                      <span className="text-red-600">Dehli</span> <span className="text-green-600">Mirch</span>
                    </span>
                  </div>
                </SheetHeader>
                <div className="mt-6">
                  <nav className="flex flex-col space-y-4">
                    {nav.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`font-poppins text-lg font-medium hover:text-red-600 transition-colors py-2 ${
                          pathname === n.href || pathname?.startsWith(n.href) 
                            ? "text-red-600 font-semibold" 
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {n.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - Show on mobile when not scrolled */}
          {!scrolled && (
            <Link href="/" className="font-extrabold text-xl tracking-tight flex-shrink-0 lg:hidden">
              <span className="text-red-600">Dehli</span> <span className="text-green-600">Mirch</span>
            </Link>
          )}

          {/* Desktop Logo - Show when scrolled */}
          {scrolled && (
            <Link href="/" className="font-extrabold text-xl tracking-tight flex-shrink-0 hidden lg:block">
              <span className="text-red-600">Dehli</span> <span className="text-green-600">Mirch</span>
            </Link>
          )}

          {/* Desktop Navigation Routes */}
          <div className="hidden lg:flex items-center gap-6">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`font-poppins leading-none text-sm font-medium hover:text-red-600 transition-colors ${
                  pathname === n.href || pathname?.startsWith(n.href) 
                    ? "text-red-600 font-medium" 
                    : ""
                }`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon - Mobile only */}
            {/* <Link href="/search" className="lg:hidden h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Search className="h-5 w-5" />
            </Link> */}

            {/* Cart */}
            {scrolled && (
              <CartSheet>
                <button
                  className={`relative flex flex-row items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                    isAdding ? 'bg-green-100 dark:bg-green-900' : ''
                  }`}
                  aria-label="Cart"
                  title="View Cart"
                  disabled={isAdding}
                >
                  
                  <ShoppingBag className="h-6 w-6 text-black dark:text-gray-300" />
                  {/* Cart count badge - positioned on top for mobile */}
                  <div className="md:flex md:flex-col md:items-start">
                  {count > 0 && (
                    <span className={window.innerWidth > 768 ? "h-5 min-w-[1.7rem] rounded-full bg-black dark:bg-gray-300 text-white dark:text-gray-900 text-[10px] grid place-items-center px-1" :"absolute -top-0 -right-0 h-5 min-w-[1.25rem] rounded-full bg-red-600 text-white text-xs font-medium grid place-items-center px-1"}>
                      {count}
                    </span>
                  )}
                  {/* Desktop cart text */}
                  <div className="hidden sm:flex flex-col items-start">
                    <p className="text-sm font-medium text-black dark:text-gray-300 tracking-wide">Cart</p>
                  </div>
                  </div>
                </button>
              </CartSheet>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
