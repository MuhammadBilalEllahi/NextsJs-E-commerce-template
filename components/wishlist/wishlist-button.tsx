"use client";

import { useWishlist } from "@/lib/providers/wishlistProvider";
import { Heart } from "lucide-react";

export function AddToWishlistButton({
  productId,
  variantId,
  small = false,
}: {
  productId: string;
  variantId?: string;
  small?: boolean;
}) {
  const { has, toggle, isLoading } = useWishlist();
  const active = has(productId);

  return (
    <button
      aria-label="Add to wishlist"
      onClick={() => toggle(productId, variantId)}
      disabled={isLoading}
      className={`inline-flex items-center justify-center rounded ${
        small ? "h-8 w-8 " : "h-9 w-9 "
      } hover:bg-primary dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed`}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-4 w-4 ${active ? "text-primary fill-primary" : ""}`}
      />
    </button>
  );
}
