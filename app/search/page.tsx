"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // TODO: Implement actual search functionality
    // For now, just simulate search
    setTimeout(() => {
      setIsSearching(false);
      setSearchResults([]);
    }, 1000);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find your favorite spices, pickles, and snacks
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          disabled={!searchQuery.trim() || isSearching}
          className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search terms or browse our categories
          </p>
          <Link href="/shop/all">
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Browse All Products
            </Button>
          </Link>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results ({searchResults.length})
          </h2>
          {/* TODO: Add search results display */}
        </div>
      )}

      {/* Popular Categories */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              name: "Spices",
              href: "/category/spices",
              color: "bg-red-100 text-red-800",
            },
            {
              name: "Pickles",
              href: "/category/pickles",
              color: "bg-green-100 text-green-800",
            },
            {
              name: "Snacks",
              href: "/category/snacks",
              color: "bg-yellow-100 text-yellow-800",
            },
            {
              name: "Masalas",
              href: "/category/masalas",
              color: "bg-blue-100 text-blue-800",
            },
          ].map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className={`p-4 rounded-lg ${category.color} hover:opacity-80 transition-opacity text-center font-medium`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
