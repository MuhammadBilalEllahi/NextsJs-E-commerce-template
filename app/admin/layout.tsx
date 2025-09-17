"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Megaphone,
  FileText,
  MessageCircle,
  CreditCard,
  Shield,
  LogOut,
  Building2,
  Truck,
  Heart,
} from "lucide-react";
import { RootProviders } from "@/lib/providers/rootProvider";
import LogOutButton from "./components/buttons/LogOutButton";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/banner", label: "Banners", icon: Megaphone },
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/cart", label: "Carts", icon: ShoppingCart },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/wishlist", label: "Wishlist", icon: Heart },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/chat", label: "Chat & Inquiries", icon: MessageCircle },
  { href: "/admin/payments", label: "Payments & Refunds", icon: CreditCard },
  { href: "/admin/access", label: "Access Control", icon: Shield },
  { href: "/admin/testpage", label: "Test", icon: Package },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-white dark:bg-background">
      <div className="border-b bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold tracking-wide">
            Dehli Mirch Admin
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {nav.slice(0, 6).map((n) => (
              <Link key={n.href} href={n.href} className="hover:underline">
                {n.label}
              </Link>
            ))}
          </nav>
          <LogOutButton />
        </div>
      </div>
      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-lg border p-3">
          <ul className="grid gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  )}
                >
                  <n.icon className="size-4 text-red-600" />
                  <span>{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
