import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";


import type { Metadata } from "next"
import { Header } from "@/components/main_comp/header"
import { Footer } from "@/components/main_comp/footer"
import { RootProviders } from "@/lib/providers/rootProvider"
import { AppProviderWrapper } from "@/components/app-provider-wrapper";

export const metadata: Metadata = {
  title: "Delhi Mirch — Authentic Spices, Pickles, Snacks",
  description:
    "Delhi Mirch brings authentic South Asian flavors: premium spices, masalas, pickles, and snacks. Heat you can taste, tradition you can trust.",
  openGraph: {
    title: "Delhi Mirch — Authentic Spices, Pickles, Snacks",
    description:
      "Premium South Asian spices and snacks with a modern, spicy aesthetic.",
    images: ["/delhi-mirch-og-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delhi Mirch — Authentic Spices, Pickles, Snacks",
    description:
      "Premium South Asian spices and snacks with a modern, spicy aesthetic.",
    images: ["/delhi-mirch-og-banner.png"],
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviderWrapper>
          <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <RootProviders>
              <Header />
              <main className="flex-1">{children}</main>
            </RootProviders>
            <Footer />
          </div>
        </AppProviderWrapper>
      </body>
    </html>
  );
}

