"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  RotateCcw,
  Mail,
  BookOpen,
  Briefcase,
  Star,
} from "lucide-react";
import LogOutButton from "./components/buttons/LogOutButton";
// import { Metadata } from "next";

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
  {
    href: "/admin/marketing-campaigns",
    label: "Marketing Campaigns",
    icon: Mail,
  },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/careers", label: "Job Postings", icon: Briefcase },
  {
    href: "/admin/job-applications",
    label: "Job Applications",
    icon: Users,
  },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/chat", label: "Chat Inquiries", icon: MessageCircle },
  { href: "/admin/payments", label: "Payments & Refunds", icon: CreditCard },
  { href: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/admin/access", label: "Access Control", icon: Shield },
  { href: "/admin/testpage", label: "Test", icon: Package },
];

import { Geist_Mono, Poppins } from "next/font/google";
import "@/app/(site)/globals.css";

import { RootProviders } from "@/lib/providers/rootProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isContentEditPage =
    pathname.includes("/admin/content/edit") ||
    pathname.includes("/admin/content/create");

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        {/* <AppProviderWrapper> */}
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
          <RootProviders>
            <div className="min-h-svh bg-white dark:bg-background">
              <div className="border-b bg-gradient-to-r from-red-600 via-orange-500 to-green-600 text-white">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                  <Link href="/" className="font-bold tracking-wide">
                    Dehli Mirch Admin
                  </Link>
                  <nav className="hidden md:flex items-center gap-6 text-sm">
                    {nav.slice(0, 7).map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        className="hover:underline"
                      >
                        {n.label}
                      </Link>
                    ))}
                  </nav>
                  <LogOutButton />
                </div>
              </div>
              <div
                className={`container mx-auto grid gap-6  ${
                  isContentEditPage
                    ? "lg:grid-cols-[60px_1fr]"
                    : "lg:grid-cols-[240px_1fr]"
                }`}
              >
                <aside
                  className={`h-fit rounded-lg border ${
                    isContentEditPage ? "p-1" : "p-3"
                  }`}
                >
                  <ul className="grid gap-1">
                    {nav.map((n) => (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900",
                            isContentEditPage && "justify-center"
                          )}
                          title={isContentEditPage ? n.label : undefined}
                        >
                          <n.icon className="size-4 text-red-600" />
                          {!isContentEditPage && <span>{n.label}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
                <main className="min-w-0">{children}</main>
              </div>
            </div>
          </RootProviders>
        </div>
        {/* </AppProviderWrapper> */}
      </body>
    </html>
  );
}
