import { Geist, Geist_Mono,Poppins } from "next/font/google";
import "@/app/globals.css";


import type { Metadata } from "next"
import { Header } from "@/components/main_comp/header"
import { Navbar } from "@/components/main_comp/navbar"
import { Footer } from "@/components/main_comp/footer"
import { RootProviders } from "@/lib/providers/rootProvider"
import { AppProviderWrapper } from "@/lib/providers/AppProvider";
import { HeaderWithCategories } from "@/components/main_comp/header-with-categories";
import { ChatWidget } from "@/components/chat-widget";


export const metadata: Metadata = {
  title: "Dehli Mirch — Authentic Spices, Pickles, Snacks",
  description:
    "Dehli Mirch brings authentic South Asian flavors: premium spices, masalas, pickles, and snacks. Heat you can taste, tradition you can trust.",
  openGraph: {
    title: "Dehli Mirch — Authentic Spices, Pickles, Snacks",
    description:
      "Premium South Asian spices and snacks with a modern, spicy aesthetic.",
    images: ["/dehli-mirch-og-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dehli Mirch — Authentic Spices, Pickles, Snacks",
    description:
      "Premium South Asian spices and snacks with a modern, spicy aesthetic.",
    images: ["/dehli-mirch-og-banner.png"],
  },
}

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
        className={`${poppins.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviderWrapper>
          <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <RootProviders>
              {/* <Header /> */}
              
      <HeaderWithCategories  />
      <Navbar />
              
              <main className="flex-1">{children}</main>
              {/* <ChatWidget/> */}
            </RootProviders>
            <Footer />
          </div>
        </AppProviderWrapper>
      </body>
    </html>
  );
}

