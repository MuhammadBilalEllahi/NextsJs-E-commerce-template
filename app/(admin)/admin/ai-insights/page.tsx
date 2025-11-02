"use client";

/**
 * Enhanced Admin AI Dashboard with AI Suggestions
 * Comprehensive store health and AI-powered insights
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Package,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import mcpTools from "@/lib/tools";

interface AIInsight {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [storeHealth, setStoreHealth] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [priceOptimizations, setPriceOptimizations] = useState<any[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  useEffect(() => {
    loadAIDashboard();
  }, []);

  async function loadAIDashboard() {
    try {
      // Load all analytics
      const [sales, inventory, orders, lowStock] = await Promise.all([
        mcpTools.getAnalytics("sales"),
        mcpTools.getAnalytics("inventory"),
        mcpTools.getAnalytics("orders"),
        mcpTools.getLowStockItems(20),
      ]);

      // Calculate store health score
      const health = calculateStoreHealth(sales.data, inventory.data, orders.data);
      setStoreHealth(health);

      // Generate AI insights
      const insights = generateAIInsights(sales.data, inventory.data, orders.data, lowStock.items);
      setAiInsights(insights);

      // Get price optimization suggestions
      const priceOps = await generatePriceOptimizations(lowStock.items.slice(0, 5));
      setPriceOptimizations(priceOps);

      // Mock trending searches
      setTrendingSearches([
        "organic spices",
        "red chili powder",
        "pickle varieties",
        "garam masala bundle",
        "turmeric benefits",
      ]);
    } catch (error) {
      console.error("Error loading AI dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStoreHealth(sales: any, inventory: any, orders: any) {
    let score = 100;
    const issues = [];

    // Sales health
    const growthNum = parseFloat(sales.growth.replace("+", "").replace("%", ""));
    if (growthNum < 5) {
      score -= 15;
      issues.push("Sales growth below target");
    }

    // Inventory health
    if (inventory.lowStock > 10) {
      score -= 20;
      issues.push("High number of low stock items");
    }
    if (inventory.outOfStock > 5) {
      score -= 15;
      issues.push("Too many out-of-stock products");
    }

    // Order health
    if (orders.pending > 50) {
      score -= 10;
      issues.push("High pending order backlog");
    }

    const status = score >= 80 ? "excellent" : score >= 60 ? "good" : score >= 40 ? "fair" : "poor";

    return {
      score: Math.max(0, score),
      status,
      issues,
      strengths: [
        growthNum >= 10 && "Strong sales growth",
        inventory.totalProducts > 200 && "Good product variety",
        orders.avgOrderValue > 1000 && "High order value",
      ].filter(Boolean),
    };
  }

  function generateAIInsights(sales: any, inventory: any, orders: any, lowStock: any[]): AIInsight[] {
    const insights: AIInsight[] = [];

    // Critical low stock
    const criticalItems = lowStock.filter((item) => item.urgency === "high");
    if (criticalItems.length > 0) {
      insights.push({
        type: "warning",
        title: "⚠️ Critical Stock Alert",
        description: `${criticalItems.length} products need immediate restocking`,
        action: "Review and reorder now",
        priority: "high",
      });
    }

    // Sales growth
    const growthNum = parseFloat(sales.growth.replace("+", "").replace("%", ""));
    if (growthNum > 15) {
      insights.push({
        type: "success",
        title: "📈 Excellent Sales Growth",
        description: `${sales.growth} increase - Consider expanding inventory`,
        action: "Stock up on top sellers",
        priority: "medium",
      });
    }

    // High pending orders
    if (orders.pending > 30) {
      insights.push({
        type: "info",
        title: "📦 High Order Volume",
        description: `${orders.pending} orders pending fulfillment`,
        action: "Increase warehouse capacity",
        priority: "high",
      });
    }

    // Price optimization opportunity
    if (lowStock.length > 10) {
      insights.push({
        type: "info",
        title: "💰 Price Optimization Available",
        description: "AI suggests price adjustments for 15 products",
        action: "View recommendations",
        priority: "medium",
      });
    }

    // Category performance
    insights.push({
      type: "success",
      title: "🎯 Top Category: Spices",
      description: "Spices category performing 23% above average",
      action: "Expand spice inventory",
      priority: "low",
    });

    return insights;
  }

  async function generatePriceOptimizations(products: any[]) {
    const optimizations = await Promise.all(
      products.map(async (product) => {
        const suggestion = await mcpTools.suggestPriceChange(product.productId);
        return {
          ...product,
          suggestion,
        };
      })
    );
    return optimizations;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">AI Insights Dashboard</h1>
        </div>
        <p className="text-gray-600">
          AI-powered store health monitoring and optimization
        </p>
      </div>

      {/* Store Health Score */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏥 Store Health Score</span>
            <span
              className={`text-4xl font-bold ${
                storeHealth.status === "excellent"
                  ? "text-green-600"
                  : storeHealth.status === "good"
                  ? "text-blue-600"
                  : storeHealth.status === "fair"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {storeHealth.score}/100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  storeHealth.status === "excellent"
                    ? "bg-green-500"
                    : storeHealth.status === "good"
                    ? "bg-blue-500"
                    : storeHealth.status === "fair"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${storeHealth.score}%` }}
              ></div>
            </div>
            <span
              className={`font-semibold capitalize ${
                storeHealth.status === "excellent"
                  ? "text-green-600"
                  : storeHealth.status === "good"
                  ? "text-blue-600"
                  : storeHealth.status === "fair"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {storeHealth.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">⚠️ Issues</h4>
              <ul className="text-sm space-y-1">
                {storeHealth.issues.map((issue: string, i: number) => (
                  <li key={i} className="text-red-600">
                    • {issue}
                  </li>
                ))}
                {storeHealth.issues.length === 0 && (
                  <li className="text-green-600">• No critical issues</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">✨ Strengths</h4>
              <ul className="text-sm space-y-1">
                {storeHealth.strengths.map((strength: string, i: number) => (
                  <li key={i} className="text-green-600">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiInsights.map((insight, index) => (
          <Card
            key={index}
            className={`${
              insight.type === "warning"
                ? "border-red-200 bg-red-50"
                : insight.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button size="sm" variant="outline" className="text-xs">
                      {insight.action}
                    </Button>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold ${
                    insight.priority === "high"
                      ? "bg-red-200 text-red-800"
                      : insight.priority === "medium"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {insight.priority}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            AI Price Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priceOptimizations.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Current: Rs. {item.suggestion.currentPrice} → Suggested: Rs.{" "}
                    {item.suggestion.suggestedPrice}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-bold ${
                      item.suggestion.changePercent > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.suggestion.changePercent > 0 ? "+" : ""}
                    {item.suggestion.changePercent}%
                  </span>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Trending Searches (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
              >
                #{index + 1} {search}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

