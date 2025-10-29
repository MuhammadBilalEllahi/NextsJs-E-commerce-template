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
  AlertCircle,
  Heart,
  User,
  Package,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { WishlistItem, Pagination } from "@/types/types";
import Image from "next/image";
import {
  listAdminWishlist,
  deleteAdminWishlistItem,
} from "@/lib/api/admin/wishlist";

export default function AdminWishlistPage() {
  const [wishlistData, setWishlistData] = useState<WishlistItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterProductId, setFilterProductId] = useState("");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  const fetchWishlistData = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await listAdminWishlist({
        page,
        limit: pagination.limit,
        search: searchTerm,
        userId: filterUserId,
        productId: filterProductId,
      });
      if (data.success) {
        let filteredData = data.wishlist;

        // Apply client-side filters
        if (showOutOfStockOnly) {
          filteredData = filteredData.filter(
            (item: WishlistItem) => item.isOutOfStock
          );
        }

        setWishlistData(filteredData);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching wishlist data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData(1);
  }, [searchTerm, filterUserId, filterProductId, showOutOfStockOnly]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await deleteAdminWishlistItem(itemId);
      fetchWishlistData(pagination.page);
    } catch (error) {
      console.error("Error removing wishlist item:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchWishlistData(newPage);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wishlist Management</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage customer wishlists and monitor product popularity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {pagination.total} Total Items
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
              <Label htmlFor="productId">Filter by Product ID</Label>
              <Input
                id="productId"
                placeholder="Product ID..."
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOutOfStockOnly}
                onChange={(e) => setShowOutOfStockOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show out of stock items only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      <Card>
        <CardHeader>
          <CardTitle>Wishlist Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏳</div>
              <p>Loading wishlist data...</p>
            </div>
          ) : wishlistData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💝</div>
              <p>No wishlist items found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistData.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                >
                  <div className="flex items-start gap-4">
                    <Image
                      width={128}
                      height={128}
                      src={item.productImage || ""}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-1">
                            {item.productName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.userName} ({item.userEmail})
                              {item.type === "guest" && (
                                <Badge
                                  variant="secondary"
                                  className="ml-1 text-xs"
                                >
                                  Guest
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Rs. {item.productPrice.toFixed(2)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.addedAt)}
                            </div>
                          </div>
                          {item.variantLabel && (
                            <Badge variant="secondary" className="mt-1">
                              {item.variantLabel}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {item.isOutOfStock && (
                            <Badge
                              variant="destructive"
                              className="flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Out of Stock
                            </Badge>
                          )}
                          <div className="flex items-center gap-2">
                            <Link href={`/product/${item.productSlug}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
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
