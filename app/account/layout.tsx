export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is now public - no protection here
  // Individual pages will handle their own protection
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}
