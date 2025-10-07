import { Geist_Mono, Poppins } from "next/font/google";
import "@/app/(site)/globals.css";

import type { Metadata } from "next";
import {
  absoluteUrl,
  buildWebSiteJsonLd,
  defaultOpenGraph,
  defaultTwitter,
} from "@/lib/seo";
import { Header } from "@/components/main_comp/header";
import { Navbar } from "@/components/main_comp/navbar";
import { Footer } from "@/components/main_comp/footer";
import { RootProviders } from "@/lib/providers/rootProvider";
import { HeaderWithCategories } from "@/components/main_comp/header-with-categories";
import CartSheetWrapper from "@/components/cart/CartSheetWrapper";
import { BottomNav } from "@/components/main_comp/bottom-nav";
import { ChatWidget } from "@/components/chat/chat-widget";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: `${SITE_NAME} — Authentic Spices, Pickles, Snacks`,
    template: "%s | ${SITE_NAME}",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    ...defaultOpenGraph,
    title: `${SITE_NAME} — Authentic Spices, Pickles, Snacks`,
    description:
      "Premium South Asian spices and snacks with a modern, spicy aesthetic.",
    url: absoluteUrl("/"),
  },
  twitter: {
    ...defaultTwitter,
    title: `${SITE_NAME} — Authentic Spices, Pickles, Snacks`,
    description:
      "Premium South Asian spices and snacks with a modern, spicy aesthetic.",
    images: ["/dehli-mirch-og-banner.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

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
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // Organization + WebSite
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildWebSiteJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              logo: "/placeholder-logo.png",
              sameAs: [
                "https://www.facebook.com/",
                "https://www.instagram.com/",
                "https://x.com/",
              ],
            }),
          }}
        />
      </head>
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        {/* <AppProviderWrapper> */}
        <div className="min-h-screen flex flex-col bg-background">
          <RootProviders>
            {/* <Header /> */}
            <HeaderWithCategories />
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <ChatWidget />
            <CartSheetWrapper />
            <Footer />
            <BottomNav />
          </RootProviders>
        </div>
        {/* </AppProviderWrapper> */}
      </body>
    </html>
  );
}
