"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTrendingProducts } from "@/database/data-service";
import { formatCurrency } from "@/lib/constants/currency";
import { Category, Product, ProductListItem } from "@/types/types";

export function HomeSearchBar({ categories }: { categories: Category[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<ProductListItem[]>(
    []
  );
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Load trending products when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && trendingProducts.length === 0) {
      setIsLoadingTrending(true);
      getTrendingProducts(6)
        .then((products: ProductListItem[]) => {
          setTrendingProducts(products);
          setIsLoadingTrending(false);
        })
        .catch(() => {
          setIsLoadingTrending(false);
        });
    }
  }, [isDropdownOpen, trendingProducts.length]);

  // Search products with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (q.trim().length > 0) {
      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(q)}&limit=6`
          );
          const data = await response.json();
          console.debug("search results", data.products);
          setSearchResults(data.products || []);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [q]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    const searchParams = new URLSearchParams();
    if (q) searchParams.set("q", q);
    const href = `/search?${searchParams.toString()}`;
    router.push(href);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQ(e.target.value);
  };

  const clearSearch = () => {
    setQ("");
    setSearchResults([]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-3 w-3 fill-foreground text-foreground/80" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="h-3 w-3 fill-foreground/70 text-foreground/80"
        />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-3 w-3 text-foreground/50" />
      );
    }

    return stars;
  };

  return (
    <div ref={searchRef} className="relative flex-1">
      <form onSubmit={onSubmit} className="flex items-center gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spices, pickles, snacks…"
            className="pl-10 pr-10 h-10 text-sm"
            value={q}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          {q && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isDropdownOpen && (
        <Card className="absolute top-12 z-50 left-0 right-0 shadow-lg border">
          <CardContent className="p-0">
            {q.trim().length > 0 ? (
              // Search Results
              <div className="p-4 pt-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-foreground">
                    PRODUCT RESULTS
                  </h3>
                  {searchResults.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:bg-primary/10"
                      onClick={onSubmit}
                    >
                      VIEW ALL RESULTS ({searchResults.length})
                    </Button>
                  )}
                </div>

                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="space-y-2">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                            {product?.images ? (
                              <Image
                                src={product.images[0] as string}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                                <span className="text-primary/50 text-xs">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-primary/90 hover:text-primary hover:underline underline-offset-2 line-clamp-2">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex items-center">
                                {renderStars(product.ratingAvg)}
                              </div>
                              <span className="text-xs text-foreground/50">
                                {product.reviewCount} reviews
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground mt-1">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No products found for "{q}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Trending Products
              <div className="pt-0 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-foreground">
                    TRENDING NOW
                  </h3>
                </div>

                {isLoadingTrending ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Trending Search Terms */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* map only 10 categories only */}
                      {categories.slice(0, 10).map((term: Category) => (
                        <Button
                          key={term.slug}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 px-3 rounded-full hover:text-primary"
                          onClick={() => {
                            setQ(term.slug);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <Search className="h-3 w-3 mr-1 " />
                          {term.name}
                        </Button>
                      ))}
                    </div>

                    {/* Trending Products */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {trendingProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          className="group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="space-y-2">
                            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                              {product.images ? (
                                <Image
                                  src={product.images[0] as string}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                                  <span className="text-muted-foreground text-xs">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-primary/90 hover:text-primary hover:underline underline-offset-2 line-clamp-2">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex items-center">
                                  {renderStars(product.rating)}
                                </div>
                                <span className="text-xs text-foreground/50">
                                  {product.reviewCount} reviews
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-foreground mt-1">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
