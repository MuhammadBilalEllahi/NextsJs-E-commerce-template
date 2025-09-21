"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowLeft } from "lucide-react";
import { getAllProducts } from "@/database/data-service";
import type { Product } from "@/mock_data/mock-data";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search products when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        searchProducts(searchQuery);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Load initial search if query exists
  useEffect(() => {
    if (searchParams.get("q")) {
      searchProducts(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const searchProducts = async (query: string) => {
    setIsSearching(true);
    try {
      const products = await getAllProducts();
      const filtered = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()) ||
          product.brand?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Update URL without page reload
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value)}`, { scroll: false });
    } else {
      router.push("/search", { scroll: false });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    router.push("/search", { scroll: false });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-10 w-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-12 pr-12 h-12 text-lg"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        {searchQuery ? (
          // Search Results
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-neutral-600" />
              <h1 className="text-2xl font-semibold">
                {isSearching
                  ? "Searching..."
                  : `Search Results (${searchResults.length})`}
              </h1>
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-20 w-20 text-neutral-400 mx-auto mb-3" />
                <h2 className="text-2xl font-semibold mb-2">
                  No products found
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2 text-lg">
                  No products found for "{searchQuery}"
                </p>
                <p className="text-neutral-500 dark:text-neutral-500">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        ) : (
          // No search query - show empty state
          <div className="text-center py-8">
            <Search className="h-20 w-20 text-neutral-400 mx-auto mb-3" />
            <h2 className="text-2xl font-semibold mb-2">Search Products</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Enter a search term to find products
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
