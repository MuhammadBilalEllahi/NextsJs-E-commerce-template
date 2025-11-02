import Link from "next/link";

interface AccountNavigationProps {
  children: React.ReactNode;
}

export function AccountNavigation({ children }: AccountNavigationProps) {
  const links = [
    { href: "/account/profile", label: "Profile" },
    { href: "/account/orders", label: "Order History" },
    { href: "/account/refunds", label: "My Refunds" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/reviews", label: "My Reviews" },
    { href: "/account/loyalty", label: "Loyalty Coins" },
    { href: "/account/notifications", label: "Notifications" },
    { href: "/account/addresses", label: "Addresses" },
  ];

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <aside className="rounded-lg border p-4 h-fit bg-card">
        <h2 className="font-semibold mb-3 text-foreground">My Account</h2>
        <nav className="space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-sm text-foreground hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
