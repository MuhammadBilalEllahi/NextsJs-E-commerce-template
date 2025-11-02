"use client";

/**
 * AI-Powered Admin Analytics Dashboard
 * Uses MCP tools for analytics, low stock, and price optimization
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import mcpTools from "@/lib/tools";

export default function AdminAnalyticsPage() {
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [priceOptimization, setPriceOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [sales, inventory, orders, lowStock] = await Promise.all([
          mcpTools.getAnalytics("sales"),
          mcpTools.getAnalytics("inventory"),
          mcpTools.getAnalytics("orders"),
          mcpTools.getLowStockItems(10),
        ]);

        setSalesData(sales.data);
        setInventoryData(inventory.data);
        setOrdersData(orders.data);
        setLowStockItems(lowStock.items);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const handlePriceOptimization = async (productId: string) => {
    try {
      const result = await mcpTools.suggestPriceChange(productId);
      setPriceOptimization(result);
    } catch (error) {
      console.error("Error with price optimization:", error);
    }
  };

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
          <Sparkles className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">AI-Powered Analytics</h1>
        </div>
        <p className="text-gray-600">
          Real-time insights powered by MCP tools and AI analysis
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              Rs. {salesData?.today?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4" />
              {salesData?.growth || "+0%"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This Month: Rs. {salesData?.thisMonth?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inventoryData?.totalProducts || 0}
            </div>
            <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
              <AlertTriangle className="h-4 w-4" />
              {inventoryData?.lowStock || 0} low stock
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Out of Stock: {inventoryData?.outOfStock || 0}
            </p>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {ordersData?.pending || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Shipped Today: {ordersData?.shipped || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Delivered: {ordersData?.delivered || 0}
            </p>
          </CardContent>
        </Card>

        {/* Avg Order Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              Rs. {ordersData?.avgOrderValue || 0}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Total Orders: {ordersData?.pending + ordersData?.shipped || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
            <span className="text-sm text-gray-600">
              {lowStockItems.filter((i) => i.urgency === "high").length}{" "}
              critical
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {item.currentStock} (Reorder at: {item.reorderLevel})
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      item.urgency === "high"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.urgency}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handlePriceOptimization(item.productId)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Optimize Price
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Optimization Result */}
      {priceOptimization && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-600" />
              AI Price Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-2xl font-bold">
                  Rs. {priceOptimization.currentPrice}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Suggested Price</p>
                <p className="text-2xl font-bold text-green-600">
                  Rs. {priceOptimization.suggestedPrice}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Change</p>
                <p
                  className={`text-2xl font-bold ${
                    priceOptimization.changePercent > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {priceOptimization.changePercent > 0 ? "+" : ""}
                  {priceOptimization.changePercent}%
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">AI Analysis</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Market Trend: {priceOptimization.reasoning.marketTrend}</li>
                <li>• Demand Level: {priceOptimization.reasoning.demandLevel}</li>
                <li>• Stock Level: {priceOptimization.reasoning.stockLevel}</li>
              </ul>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-semibold text-green-700">
                  Projected Impact:
                </p>
                <ul className="text-sm space-y-1 text-gray-700 mt-1">
                  <li>
                    • Revenue: {priceOptimization.projectedImpact.revenueIncrease}
                  </li>
                  <li>
                    • Volume: {priceOptimization.projectedImpact.salesVolumeChange}
                  </li>
                  <li>
                    • Margin:{" "}
                    {priceOptimization.projectedImpact.profitMarginIncrease}
                  </li>
                </ul>
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">
              Apply Price Change
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {salesData?.topProducts?.map((product: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border-b"
              >
                <span className="font-medium">{product}</span>
                <span className="text-sm text-gray-600">#{index + 1}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

