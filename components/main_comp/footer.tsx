import Link from "next/link";
import { NewsletterInline } from "@/components/home/home-newsletter";
import { getAllCategories } from "@/database/data-service";
import { Category } from "@/types";
import {
  SITE_NAME,
  SITE_NAME_FIRST,
  SITE_NAME_SECOND,
} from "@/lib/constants/site";

export async function Footer() {
  // Fetch categories from cache
  const categories = await getAllCategories();

  // Get top-level categories (no parent) and limit to 4 for display
  const topCategories = categories
    .filter((cat: Category) => !cat.parent)
    .slice(0, 4);
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-extrabold text-lg tracking-tight mb-2">
            <span className="text-red-600">{SITE_NAME_FIRST}</span>{" "}
            <span className="text-green-600">{SITE_NAME_SECOND}</span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Heat you can taste, tradition you can trust.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop/all" className="hover:underline">
                All Products
              </Link>
            </li>
            {topCategories.map((category: Category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/all?category=${category.slug}`}
                  className="hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:underline">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:underline">
                Careers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/terms-of-service" className="hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:underline">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/return-refund" className="hover:underline">
                Return & Refund
              </Link>
            </li>
            <li>
              <Link href="/disclaimers" className="hover:underline">
                Disclaimers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Stay in the loop</h4>
          <NewsletterInline />
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
