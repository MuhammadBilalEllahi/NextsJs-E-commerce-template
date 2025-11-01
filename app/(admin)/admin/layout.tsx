"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Bell,
  Moon,
  Sun,
  Palette,
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
import { SITE_NAME } from "@/lib/constants/site";
import { AuthButton } from "@/components/auth/auth-button";
import { AdminNavbar } from "@/components/admin/sidebar/AdminNavbar";

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
  const [collapsed, setCollapsed] = useState(true);

  const isContentEditPage =
    pathname.includes("/admin/content/edit") ||
    pathname.includes("/admin/content/create");

  const gridCols = useMemo(() => {
    if (isContentEditPage)
      return collapsed ? "lg:grid-cols-[60px_1fr]" : "lg:grid-cols-[60px_1fr]";
    return collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[240px_1fr]";
  }, [collapsed, isContentEditPage]);

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col bg-background">
          <RootProviders>
            <div className="min-h-svh bg-background">
              <div className={` grid   ${gridCols}`}>
                <aside
                  className={`sticky top-0 self-start  border bg-background shadow-sm `}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Link href="/" className="font-semibold tracking-wide">
                        {collapsed ? "" : `${SITE_NAME} Admin`}
                      </Link>
                    </div>
                    <button
                      type="button"
                      aria-label={
                        collapsed ? "Expand sidebar" : "Collapse sidebar"
                      }
                      className="inline-flex items-center justify-center rounded-md hover:bg-muted p-1 text-muted-foreground"
                      onClick={() => setCollapsed((v) => !v)}
                    >
                      {collapsed ? (
                        <ChevronRight className="size-4" />
                      ) : (
                        <ChevronLeft className="size-4" />
                      )}
                    </button>
                  </div>

                  <ul
                    className={`grid gap-1 sticky top-0  max-h-svh overflow-y-auto scrollbar-hide ${
                      isContentEditPage ? "p-1" : "p-3"
                    }`}
                  >
                    {nav.map((n) => (
                      <li key={n.href}>
                        <Link
                          href={n.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted",
                            (isContentEditPage || collapsed) && "justify-center"
                          )}
                          title={isContentEditPage ? n.label : undefined}
                        >
                          <n.icon className="size-4 text-red-600" />
                          {!isContentEditPage && !collapsed && (
                            <span>{n.label}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>

                <div className="flex flex-col ">
                  <AdminNavbar collapsed={collapsed} />

                  <main className="min-w-0 pl-2">{children}</main>
                </div>
              </div>
            </div>
          </RootProviders>
        </div>
      </body>
    </html>
  );
}
