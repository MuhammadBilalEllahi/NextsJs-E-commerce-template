import Link from "next/link"
import { NewsletterInline } from "@/components/home/home-newsletter"

export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-extrabold text-lg tracking-tight mb-2">
            <span className="text-red-600">Dehli</span> <span className="text-green-600">Mirch</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Heat you can taste, tradition you can trust.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/category/spices" className="hover:underline">Spices</Link></li>
            <li><Link href="/category/masalas" className="hover:underline">Masalas</Link></li>
            <li><Link href="/category/pickles" className="hover:underline">Pickles</Link></li>
            <li><Link href="/category/snacks" className="hover:underline">Snacks</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/faqs" className="hover:underline">FAQs</Link></li>
            <li><Link href="/careers" className="hover:underline">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/shipping" className="hover:underline">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:underline">Return & Refund</Link></li>
            <li><Link href="/disclaimers" className="hover:underline">Disclaimers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Stay in the loop</h4>
          <NewsletterInline />
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} Dehli Mirch. All rights reserved.
      </div>
    </footer>
  )
}
