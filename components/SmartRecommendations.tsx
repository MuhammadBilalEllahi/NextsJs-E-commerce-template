"use client";

/**
 * Smart Recommendations Component
 * Shows complementary products using MCP tools
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";
import mcpTools from "@/lib/tools";

interface RecommendationProps {
  productId: string;
  userId?: string;
}

export default function SmartRecommendations({
  productId,
  userId,
}: RecommendationProps) {
  const [complementary, setComplementary] = useState<any[]>([]);
  const [personalized, setPersonalized] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const [compResults, personalResults] = await Promise.all([
          mcpTools.findComplementaryProducts(productId),
          userId ? mcpTools.getRecommendations(userId) : Promise.resolve(null),
        ]);

        setComplementary(compResults.complementaryProducts || []);
        setPersonalized(personalResults?.recommendations || []);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [productId, userId]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (complementary.length === 0 && personalized.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 mt-12">
      {/* Complementary Products */}
      {complementary.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold">Frequently Bought Together</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {complementary.slice(0, 3).map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🌶️</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {product.reason}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-red-600">
                      Rs. {product.price}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {(product.matchScore * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Recommendations */}
      {personalized.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-red-600" />
            <h2 className="text-2xl font-bold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {personalized.slice(0, 4).map((product) => (
              <Card
                key={product.productId}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{product.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-600">
                      Rs. {product.price}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(product.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Button
                    className="w-full mt-3 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

