"use client";

/**
 * Personalized User Dashboard
 * Shows AI-powered recommendations and user activity
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Search,
  ShoppingBag,
  TrendingUp,
  Package,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import mcpTools from "@/lib/tools";

export default function UserDashboardPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [recentSearches] = useState<string[]>([
    "red chili powder",
    "garam masala",
    "organic turmeric",
  ]);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in production, get from auth
  const userId = "user123";

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [recsResult, ordersResult] = await Promise.all([
          mcpTools.getRecommendations(userId),
          mcpTools.getOrderDetails(userId),
        ]);

        setRecommendations(recsResult.recommendations || []);
        setOrders(ordersResult.orders || []);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">My Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Personalized insights powered by AI
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {orders.filter((o) => o.status === "delivered").length} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Searches
            </CardTitle>
            <Search className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentSearches.length}</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recommendations
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-gray-600 mt-1">AI-powered picks</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Searches */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                {search}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-600" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((product) => (
              <div
                key={product.productId}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{product.reason}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-red-600">
                    Rs. {product.price}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {(product.confidence * 100).toFixed(0)}% match
                  </span>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700" size="sm">
                  View Product
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{order.orderId}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.orderDate).toLocaleDateString()} •{" "}
                    {order.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">Rs. {order.total}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No orders yet. Start shopping!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

