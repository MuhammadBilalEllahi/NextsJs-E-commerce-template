"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddToWishlistButton } from "@/components/wishlist/wishlist-button";
import { useCart } from "@/lib/providers/cartContext";
import type { Product } from "@/mock_data/mock-data";
import { ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { useState, useRef, useEffect } from "react";

export function ProductCard({
  product,
  variant = "grid",
  className,
}: {
  product: Product;
  variant?: "grid" | "list" | "single";
  className?: string;
}) {
  const { add, isAdding } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Get the first available image: variant image -> product images -> product image -> placeholder
  const getDisplayImage = () => {
    if (
      product.variants &&
      product.variants.length > 0 &&
      product.variants[0].images &&
      product.variants[0].images.length > 0
    ) {
      return product.variants[0].images[0];
    }
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return "/placeholder.svg?height=176&width=320&query=grid product";
  };

  // Get display price - use first variant price if variants exist, otherwise product price
  const getDisplayPrice = () => {
    if (product.variants && product.variants.length > 0) {
      const firstVariant = getFirstVariant();
      return firstVariant ? firstVariant.price : product.price;
    }
    return product.price;
  };

  // Get variant labels for display
  const getVariantLabels = () => {
    if (!product.variants || product.variants.length === 0) return [];
    return product.variants.map((v) => v.label).slice(0, 3); // Show max 3 labels
  };

  // Helper function to find first available variant with stock
  const getFirstAvailableVariant = () => {
    if (!product.variants || product.variants.length === 0) return null;

    // Find first variant that has stock and is active
    return (
      product.variants.find(
        (variant) =>
          typeof variant.stock === "number" &&
          variant.stock > 0 &&
          !variant.isOutOfStock &&
          variant.isActive !== false
      ) || null
    );
  };

  // Helper function to get first variant (for cart addition, regardless of stock)
  const getFirstVariant = () => {
    if (!product.variants || product.variants.length === 0) return null;
    return product.variants[0]; // Return first variant
  };

  // Helper function to check if product is available for purchase
  const isProductAvailable = () => {
    if (product.variants && product.variants.length > 0) {
      // If variants exist, check if any variant has stock
      return getFirstAvailableVariant() !== null;
    } else {
      // If no variants, check product stock
      return product.stock && product.stock > 0 && !product.isOutOfStock;
    }
  };

  const handleAddToCart = () => {
    if (isAdding) return; // Prevent duplicate clicks

    if (product.variants && product.variants.length > 0) {
      // Use first variant for cart addition
      const firstVariant = getFirstVariant();

      if (!firstVariant) {
        alert("No variants available for this product");
        return;
      }

      // Check if any variant has stock (for availability check)
      const availableVariant = getFirstAvailableVariant();

      if (!availableVariant) {
        alert("This product is currently out of stock");
        return;
      }
      console.log("firstVariant", firstVariant);
      console.log("firstVariant.label", firstVariant.label);
      console.log("firstVariant.label type:", typeof firstVariant.label);

      const cartItem = {
        id: product.id,
        title: product.title,
        price: firstVariant.price as number,
        image: getDisplayImage(),
        productId: product.id,
        variantId: firstVariant._id,
        variantLabel: firstVariant.label,
        slug: product.slug,
      };
      console.log("Adding to cart:", cartItem);
      console.log("variantLabel being sent:", cartItem.variantLabel);
      add(cartItem, 1);
    } else {
      // No variants, use product stock
      if ((product.stock && product.stock <= 0) || product.isOutOfStock) {
        alert("This product is currently out of stock");
        return;
      }

      add(
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: getDisplayImage(),
          productId: product.id,
          slug: product.slug,
        },
        1
      );
    }
  };

  // Check if description text overflows 3 lines
  useEffect(() => {
    if (descriptionRef.current) {
      const element = descriptionRef.current;
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * 3; // 3 lines
      setShowReadMore(element.scrollHeight > maxHeight);
    }
  }, [product.description]);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  if (variant === "list") {
    return (
      <div
        className={cn(
          "rounded-xl border overflow-hidden bg-white dark:bg-neutral-950 flex",
          className
        )}
      >
        <Link href={`/product/${product.slug}`} className="block">
          <img
            src={getDisplayImage()}
            alt={product.title}
            className=" w-52 object-cover h-10 lg:h-full"
          />
        </Link>
        <div className="flex-1 p-4">
          <div className="flex justify-between gap-2">
            <div className="flex flex-col">
              <Link
                href={`/product/${product.slug}`}
                className="font-semibold hover:text-red-600"
              >
                {product.title}
              </Link>
              <div className="flex items-center gap-2 text-[#121212] dark:text-white">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-3 w-3 fill-[#121212] dark:fill-white"
                  />
                ))}
                <span className="text-sm text-black dark:text-white">
                  {product.rating?.toFixed(1) ?? "4.5"}
                </span>
              </div>
            </div>
            <AddToWishlistButton productId={product.id} />
          </div>
          <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            <div
              ref={descriptionRef}
              className={cn(
                "font-mono text-xs text-neutral-600 dark:text-neutral-400",
                !isExpanded && "line-clamp-2"
              )}
            >
              {product.description}
            </div>
            {showReadMore && (
              <button
                onClick={toggleReadMore}
                className="text-red-600 hover:text-red-700 text-xs mt-1"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>

          <div className="font-bold text-red-600">Rs.{getDisplayPrice()}</div>
          <div className="mt-3 flex items-center justify-between">
            <a
              className="w-full rounded-sm px-2 py-2 md:px-4 md:py-2 text-sm text-center  md:text-sm lg:text-md  font-semibold border-[#727272] hover:border-black bg-white dark:bg-black dark:hover:bg-white dark:text-white dark:hover:text-black hover:bg-black hover:text-white transition-colors duration-400 dark:border-gray-400 dark:hover:border-gray-500 border-1"
              aria-label="View Product"
              title="View Product"
              href={`/product/${product.slug}`}
            >
              View Product
            </a>

            <Button
              size="sm"
              className="ml-2 rounded-sm w-10 h-10"
              variant="gradient"
              onClick={handleAddToCart}
              disabled={isAdding || !isProductAvailable()}
            >
              <ShoppingCart size={16} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-1  mb-auto group rounded-md border overflow-hidden bg-white dark:bg-neutral-950 hover:shadow-md transition relative",
        className
      )}
    >
      {/* Variant labels overlay - shown on hover */}
      {product.variants && product.variants.length > 0 && (
        <div className="absolute top-2 left-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-wrap gap-1">
            {getVariantLabels().map((label, index) => (
              <span
                key={`${product.id}-variant-${index}`}
                className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link href={`/product/${product.slug}`} className="block ">
        <img
          src={getDisplayImage()}
          alt={product.title}
          className="h-44 w-full rounded-sm object-contain dark:bg-neutral-900 bg-neutral-100 group-hover:scale-[1.01] transition-transform"
        />
      </Link>
      <div className="p-1">
        <div className="flex items-end justify-between gap-2">
          <Link
            href={`/product/${product.slug}`}
            className="font-semibold text-lg line-clamp-1 hover:text-black dark:hover:text-white hover:underline hover:underline-offset-4 hover:decoration-red-600"
          >
            {product.title}
          </Link>
          <AddToWishlistButton productId={product.id} small />
        </div>
        <div className="flex items-center gap-2 text-[#121212]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="h-3 w-3 fill-[#121212] dark:fill-white"
            />
          ))}
          <span className="text-sm dark:text-white text-black">
            {product.rating?.toFixed(1) ?? "4.5"}
          </span>
        </div>

        <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
          <div
            ref={descriptionRef}
            className={cn(
              "font-mono text-xs text-neutral-600 dark:text-neutral-400",
              !isExpanded && "line-clamp-2"
            )}
          >
            {product.description}
          </div>
          {showReadMore && (
            <button
              onClick={toggleReadMore}
              className="text-red-600 hover:text-red-700 text-xs "
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>
        <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          Brand: {product?.brand ? product?.brand : <i>dehli mirch</i>}
        </div>
        {/* {product?.brand && <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          Brand: {product.brand}
        </div>} */}

        <div className="font-bold text-red-600 mt-auto">
          Rs.{getDisplayPrice()}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <a
            className="w-full rounded-sm px-2 py-2 md:px-4 md:py-2 text-sm text-center  md:text-sm lg:text-md font-semibold border-[#727272] hover:border-black bg-white dark:bg-black dark:hover:bg-white dark:text-white dark:hover:text-black hover:bg-black hover:text-white transition-colors duration-400 dark:border-gray-400 dark:hover:border-gray-500 border-1"
            aria-label="View Product"
            title="View Product"
            href={`/product/${product.slug}`}
          >
            View Product
          </a>
          {/* <a
  className={cn(
    "w-full rounded-md px-4 py-2 text-center font-semibold border transition-colors duration-300",
    // Light mode
    "bg-gradient-to-r from-[#2b2b2b] to-[#1a1a1a] text-white border-black/30 hover:from-[#3b3b3b] hover:to-[#2a2a2a]",
    // Dark mode
    "dark:bg-gradient-to-r dark:from-[#f5f5f5] dark:to-[#d9d9d9] dark:text-black dark:border-gray-400 dark:hover:from-[#e8e8e8] dark:hover:to-[#cfcfcf]"
  )} 
  aria-label="View Product"
  title="View Product"
  href={`/product/${product.slug}`}
>
  {isAdding ? "Adding..." : "View Product"}
</a> */}

          <Button
            size="sm"
            className="ml-2 rounded-sm w-10 h-10"
            variant="gradient"
            onClick={handleAddToCart}
            disabled={isAdding || !isProductAvailable()}
          >
            <ShoppingCart size={16} className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
