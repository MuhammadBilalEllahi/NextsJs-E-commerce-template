import Link from "next/link";
import { NewsletterInline } from "@/components/home/home-newsletter";
import { getAllCategories } from "@/database/data-service";
import { Category } from "@/types/types";
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
            {SITE_NAME ? (
              <span className="text-primary">{SITE_NAME}</span>
            ) : (
              <>
                <span className="text-primary">{SITE_NAME_FIRST}</span>{" "}
                <span className="text-foreground">{SITE_NAME_SECOND}</span>
              </>
            )}
          </div>
          <p className="text-sm text-foreground dark:text-foreground/40">
            Heat you can taste, tradition you can trust.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/shop/all"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                All Products
              </Link>
            </li>
            {topCategories.map((category: Category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/all?category=${category.slug}`}
                  className="hover:decoration-primary hover:text-primary hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">Company</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/about"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/faqs"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/careers"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Careers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/terms-of-service"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/shipping-policy"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                href="/return-refund"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Return & Refund
              </Link>
            </li>
            <li>
              <Link
                href="/disclaimers"
                className="hover:decoration-primary hover:text-primary hover:underline"
              >
                Disclaimers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">Stay in the loop</h4>
          <NewsletterInline />
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-foreground dark:text-foreground/40">
        © {new Date().getFullYear()}{" "}
        {SITE_NAME ? (
          <span className="text-primary">{SITE_NAME}</span>
        ) : (
          <>
            <span className="text-primary">{SITE_NAME_FIRST}</span>{" "}
            <span className="text-foreground">{SITE_NAME_SECOND}</span>
          </>
        )}
        . All rights reserved.
      </div>
    </footer>
  );
}
