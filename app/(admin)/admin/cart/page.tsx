"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  ShoppingCart,
  User,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type CartItem = {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  priceSnapshot: number;
  addedAt: string;
};

type Cart = {
  id: string;
  type: "registered" | "guest";
  userId?: string;
  sessionId?: string;
  userName: string;
  userEmail: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
  updatedAt: string;
  daysSinceUpdate: number;
  hasOrder: boolean;
  version: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export default function AdminCartPage() {
  const [cartData, setCartData] = useState<Cart[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterSessionId, setFilterSessionId] = useState("");
  const [showConvertedOnly, setShowConvertedOnly] = useState(false);
  const [showOldCartsOnly, setShowOldCartsOnly] = useState(false);

  const fetchCartData = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterUserId) params.append("userId", filterUserId);
      if (filterSessionId) params.append("sessionId", filterSessionId);

      const response = await fetch(`/api/admin/cart?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          let filteredData = data.carts;

          // Apply client-side filters
          if (showConvertedOnly) {
            filteredData = filteredData.filter((cart: Cart) => cart.hasOrder);
          }

          if (showOldCartsOnly) {
            filteredData = filteredData.filter(
              (cart: Cart) => cart.daysSinceUpdate > 7
            );
          }

          setCartData(filteredData);
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData(1);
  }, [
    searchTerm,
    filterUserId,
    filterSessionId,
    showConvertedOnly,
    showOldCartsOnly,
  ]);

  const handleRemoveCart = async (cartId: string) => {
    try {
      const response = await fetch(`/api/admin/cart?id=${cartId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the data
        fetchCartData(pagination.page);
      }
    } catch (error) {
      console.error("Error removing cart:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchCartData(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cart Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Monitor customer carts and track conversion rates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            {pagination.total} Total Carts
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="search"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="userId">Filter by User ID</Label>
              <Input
                id="userId"
                placeholder="User ID..."
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sessionId">Filter by Session ID</Label>
              <Input
                id="sessionId"
                placeholder="Session ID..."
                value={filterSessionId}
                onChange={(e) => setFilterSessionId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showConvertedOnly}
                onChange={(e) => setShowConvertedOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show converted carts only</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOldCartsOnly}
                onChange={(e) => setShowOldCartsOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show old carts (7+ days)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
      <Card>
        <CardHeader>
          <CardTitle>Carts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏳</div>
              <p>Loading cart data...</p>
            </div>
          ) : cartData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🛒</div>
              <p>No carts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartData.map((cart) => (
                <div
                  key={cart.id}
                  className="border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          Cart #{cart.id.slice(-8)}
                        </h3>
                        {cart.type === "guest" && (
                          <Badge variant="secondary" className="text-xs">
                            Guest
                          </Badge>
                        )}
                        {cart.hasOrder && (
                          <Badge
                            variant="default"
                            className="text-xs flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Converted
                          </Badge>
                        )}
                        {cart.daysSinceUpdate > 7 && (
                          <Badge
                            variant="destructive"
                            className="text-xs flex items-center gap-1"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Old Cart
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {cart.userName} ({cart.userEmail})
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {cart.itemCount} items
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Updated {cart.daysSinceUpdate} days ago
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {formatCurrency(cart.subtotal)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveCart(cart.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Items in Cart:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cart.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-800 rounded"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {item.productName}
                            </div>
                            {item.variantLabel && (
                              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                {item.variantLabel}
                              </div>
                            )}
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                              Qty: {item.quantity} ×{" "}
                              {formatCurrency(item.priceSnapshot)}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(item.priceSnapshot * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
