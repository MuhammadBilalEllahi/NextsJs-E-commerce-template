import Link from "next/link"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/account/profile", label: "Profile" },
    { href: "/account/orders", label: "Order History" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/loyalty", label: "Loyalty Coins" },
    { href: "/account/notifications", label: "Notifications" },
    { href: "/account/addresses", label: "Addresses" },
  ]
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="rounded-lg border p-4 h-fit">
          <h2 className="font-semibold mb-3">My Account</h2>
          <nav className="space-y-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm hover:text-red-600">
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  )
}
