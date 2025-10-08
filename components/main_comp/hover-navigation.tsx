"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { usePreloadedData } from "@/lib/hooks/use-preloaded-data";
import { CURRENCY } from "@/lib/constants";
import { Category, Product } from "@/types";

interface HoverNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function HoverNavigation({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: HoverNavigationProps) {
  const { categories, isLoaded } = usePreloadedData();
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    if (hoveredCategory) {
      setShowProducts(true);
    } else {
      setShowProducts(false);
    }
  }, [hoveredCategory]);

  // Get products for the hovered category from preloaded data
  const getCategoryProducts = (categorySlug: string): Product[] => {
    const category = categories.find((cat: any) => cat.slug === categorySlug);
    return category?.products || [];
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-8 left-0 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex">
        {/* Categories Column */}
        <div className="w-fit bg-popover text-popover-foreground border border-border shadow-md">
          <div className="p-0 py-1">
            {categories.map((category, index) => (
              <div key={category.id}>
                <div
                  className="flex items-center justify-between py-2 px-4 hover:underline cursor-pointer group transition-all"
                  onMouseEnter={() => {
                    setHoveredCategory(category);
                    setShowProducts(true);
                  }}
                >
                  <span className="text-xs font-medium hover:text-primary hover:underline w-28">
                    {category.name}
                  </span>
                  <ChevronRight className="ml-2 h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                {index < categories.length - 1 && (
                  <div className="border-b border-border mx-4"></div>
                )}
              </div>
            ))}
          </div>
          <div className="border-b border-border mx-4"></div>
        </div>

        {/* Products Column */}
        {showProducts && hoveredCategory && (
          <div className="bg-popover text-popover-foreground border border-border shadow-md">
            <div className="p-0 py-1">
              {(() => {
                const categoryProducts = getCategoryProducts(
                  hoveredCategory.slug
                );
                return (
                  <>
                    {categoryProducts.map((product, index) => (
                      <div key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          className="flex items-center justify-between py-2 px-4 hover:underline cursor-pointer group transition-all"
                          onClick={onClose}
                        >
                          <span className="text-xs font-medium hover:text-primary hover:underline w-28">
                            {product.name}
                          </span>
                        </Link>
                        {index < categoryProducts.length - 1 && (
                          <div className="border-b border-border mx-4"></div>
                        )}
                      </div>
                    ))}

                    {/* More link */}
                    {categoryProducts.length > 0 && (
                      <div>
                        <div className="border-b border-border mx-4"></div>
                        <Link
                          href={`/category/${hoveredCategory.slug}`}
                          className="flex items-center justify-between py-2 px-4 hover:underline cursor-pointer group transition-all"
                          onClick={onClose}
                        >
                          <span className="text-xs font-medium hover:text-primary hover:underline">
                            More
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Link>
                      </div>
                    )}
                  </>
                );
              })()}
              {getCategoryProducts(hoveredCategory.slug).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground hover:text-primary hover:underline">
                    No products found
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
