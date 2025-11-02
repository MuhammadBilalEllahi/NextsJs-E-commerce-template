"use client";

/**
 * AI-Powered Product Search Page
 * Combines RAG semantic search with MCP tools
 */

import { useState } from "react";
import { Search, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  relevanceScore: number;
  description: string;
  image?: string;
}

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [ragResults, setRagResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const startTime = performance.now();

    try {
      // Call hybrid search API
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const endTime = performance.now();

      setResults(data.products || []);
      setRagResults(data.ragResults || null);
      setSearchTime(Math.round(endTime - startTime));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-red-600" />
          <h1 className="text-4xl font-bold">AI-Powered Search</h1>
        </div>
        <p className="text-gray-600">
          Advanced semantic search powered by RAG and MCP tools
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Try: 'spicy chili powder' or 'organic pickles'"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-red-600 hover:bg-red-700 px-8"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Metrics */}
      {searchTime > 0 && (
        <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Search completed in {searchTime}ms</span>
          </div>
          <span>•</span>
          <span>{results.length} results found</span>
          {ragResults && (
            <>
              <span>•</span>
              <span className="text-red-600 font-semibold">
                RAG Score: {(ragResults.topResult?.score * 100).toFixed(1)}%
              </span>
            </>
          )}
        </div>
      )}

      {/* RAG Insight */}
      {ragResults && ragResults.topResult && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-600" />
              AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              {ragResults.topResult.document.content}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Relevance: {(ragResults.topResult.score * 100).toFixed(1)}% •
              Source: RAG System
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                {product.image && (
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-red-600">
                    Rs. {product.price}
                  </span>
                  {product.relevanceScore && (
                    <span className="text-xs text-gray-500">
                      {(product.relevanceScore * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
                <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !loading &&
        query && (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No results found for &quot;{query}&quot;</p>
            <p className="text-sm mt-2">Try different keywords or variations</p>
          </div>
        )
      )}

      {/* Empty State */}
      {!query && !loading && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-red-300" />
          <h3 className="text-xl font-semibold mb-2">Start Your AI Search</h3>
          <p className="text-gray-600 mb-4">
            Use natural language to find exactly what you need
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["red chili powder", "organic pickles", "garam masala"].map(
              (suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  onClick={() => {
                    setQuery(suggestion);
                    setTimeout(handleSearch, 100);
                  }}
                  className="text-sm"
                >
                  {suggestion}
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
