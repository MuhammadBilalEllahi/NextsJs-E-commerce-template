"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Search, User, ShoppingBag, MapPin } from "lucide-react";
import { SearchSheet } from "@/components/search/search-sheet";

export function BottomNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search, isButton: true },
    { href: "/branches", label: "Branches", icon: MapPin },
    { href: "/account", label: "Account", icon: User },
    { href: "/shop/all", label: "Shop", icon: ShoppingBag },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 lg:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/account" && pathname?.startsWith("/account")) ||
              (item.href === "/shop/all" && pathname?.startsWith("/shop")) ||
              (item.href === "/branches" && pathname?.startsWith("/branches"));

            // Handle search button differently
            if (item.isButton) {
              return (
                <button
                  key={item.href}
                  onClick={() => setIsSearchOpen(true)}
                  className={`flex flex-col items-center py-3 px-4 min-w-0 flex-1 transition-colors ${
                    isActive
                      ? "text-red-600 dark:text-red-400"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mb-1 ${
                      isActive ? "text-red-600 dark:text-red-400" : ""
                    }`}
                  />
                  <span className="text-xs font-medium truncate">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-3 px-4 min-w-0 flex-1 transition-colors ${
                  isActive
                    ? "text-red-600 dark:text-red-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mb-1 ${
                    isActive ? "text-red-600 dark:text-red-400" : ""
                  }`}
                />
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Search Sheet */}
      <SearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
