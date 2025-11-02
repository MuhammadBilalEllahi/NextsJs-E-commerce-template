/**
 * Hybrid Search API
 * Combines MongoDB keyword search with RAG semantic search
 */

import { NextRequest, NextResponse } from "next/server";
import mcpTools from "@/lib/tools";
import { ragSearch } from "@/lib/rag";
import { logUserBehavior } from "@/lib/logging/userBehavior";

export const runtime = "nodejs";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  description: string;
  relevanceScore: number;
  source: "keyword" | "semantic" | "hybrid";
  image?: string;
}

/**
 * Merge and rank results from keyword and semantic search
 */
function mergeResults(
  keywordResults: any[],
  semanticResults: any[]
): SearchResult[] {
  const merged = new Map<string, SearchResult>();

  // Add keyword results
  keywordResults.forEach((result, index) => {
    merged.set(result.id, {
      id: result.id,
      name: result.name || "Product",
      price: result.price || 0,
      description: result.description || "",
      relevanceScore: 1 - index / keywordResults.length, // Higher for top results
      source: "keyword",
      image: result.image,
    });
  });

  // Merge semantic results
  semanticResults.forEach((result) => {
    const doc = result.document;
    const existingResult = merged.get(doc.productId || doc.id);

    if (existingResult) {
      // Boost score for items found in both searches
      existingResult.relevanceScore =
        (existingResult.relevanceScore + result.score) / 2 + 0.2;
      existingResult.source = "hybrid";
    } else {
      merged.set(doc.productId || doc.id, {
        id: doc.productId || doc.id,
        name: doc.metadata?.name || "Product",
        price: doc.metadata?.price || 0,
        description: doc.content,
        relevanceScore: result.score,
        source: "semantic",
      });
    }
  });

  // Convert to array and sort by relevance
  return Array.from(merged.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20); // Return top 20 results
}

/**
 * POST /api/search
 * Hybrid search combining keyword and semantic search
 */
export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid query" },
        { status: 400 }
      );
    }

    console.log(`[Hybrid Search] Query: "${query}"`);

    // Run keyword and semantic search in parallel
    const [keywordResults, ragResults] = await Promise.all([
      mcpTools.searchProducts(query),
      ragSearch(query, 10, "products"),
    ]);

    // Merge and rank results
    const products = mergeResults(
      keywordResults,
      ragResults.results
    );

    // Log search behavior
    if (userId) {
      logUserBehavior(userId, "search", {
        query,
        resultsCount: products.length,
        hasKeywordResults: keywordResults.length > 0,
        hasSemanticResults: ragResults.results.length > 0,
      });
    }

    return NextResponse.json({
      success: true,
      products,
      ragResults: {
        topResult: ragResults.topResult,
        totalFound: ragResults.totalFound,
      },
      metadata: {
        keywordMatches: keywordResults.length,
        semanticMatches: ragResults.results.length,
        hybridResults: products.filter((p) => p.source === "hybrid").length,
        searchTime: ragResults.searchTime,
      },
    });
  } catch (error: any) {
    console.error("[Hybrid Search] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search
 * Get popular searches or suggestions
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    suggestions: [
      "red chili powder",
      "garam masala",
      "pickle",
      "organic spices",
      "turmeric",
    ],
    popularSearches: [
      "spicy products",
      "cooking essentials",
      "traditional spices",
    ],
  });
}
