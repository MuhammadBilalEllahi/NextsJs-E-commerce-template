"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { Search, X, TrendingUp } from "lucide-react";
import { getAllProducts } from "@/database/data-service";
import { Product } from "@/types/types";

interface SearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchSheet({ isOpen, onClose }: SearchSheetProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load trending products when sheet opens
  useEffect(() => {
    if (isOpen && trendingProducts.length === 0) {
      loadTrendingProducts();
    }
  }, [isOpen, trendingProducts.length]);

  // Search products when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchProducts(searchQuery);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadTrendingProducts = async () => {
    setIsLoading(true);
    try {
      const products = await getAllProducts();
      // Get trending products (you can modify this logic based on your trending criteria)
      // For now, we'll take the first 8 products as trending
      const trending = products.slice(0, 8);
      setTrendingProducts(trending as Product[]);
    } catch (error) {
      console.error("Error loading trending products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    setIsSearching(true);
    try {
      const products = await getAllProducts();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()) ||
          (typeof product.brand === "string"
            ? product.brand.toLowerCase().includes(query.toLowerCase())
            : product.brand?.name?.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered as Product[]);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleProductClick = () => {
    // Close sheet when product is clicked
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Search</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-12 pr-12 h-14 text-lg"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Search Results or Trending Products */}
        <div className="space-y-3">
          {searchQuery ? (
            // Search Results
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-5 w-5 text-neutral-600" />
                <h3 className="font-semibold text-xl">
                  {isSearching
                    ? "Searching..."
                    : `Search Results (${searchResults.length})`}
                </h3>
              </div>

              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {searchResults.map((product: Product) => (
                    <div key={product.id} onClick={handleProductClick}>
                      <ProductCard product={product} variant="mini" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Search className="h-16 w-16 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    No products found for "{searchQuery}"
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-500 mt-1">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Trending Products
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-xl">TRENDING NOW</h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
              ) : trendingProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {trendingProducts.map((product: Product) => (
                    <div key={product.id} onClick={handleProductClick}>
                      <ProductCard product={product} variant="mini" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="h-16 w-16 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                    No trending products available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View All Results Button (only show when there are search results) */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              onClick={() => {
                // Navigate to search page with query
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                onClose(); // Close the sheet
              }}
            >
              VIEW ALL RESULTS ({searchResults.length})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
