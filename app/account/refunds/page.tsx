"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/providers/authProvider";
import { formatCurrency } from "@/lib/constants/currency";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Package,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface Refund {
  _id: string;
  order: {
    _id: string;
    orderId: string;
    refId: string;
    createdAt: string;
    status: string;
  };
  product: {
    _id: string;
    name: string;
    images: string[];
    slug: string;
  };
  variant?: {
    _id: string;
    label: string;
    sku: string;
  };
  quantity: number;
  amount: number;
  reason: string;
  status: string;
  customerNotes?: string;
  adminNotes?: string;
  refundMethod: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  refundDurationLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // Fetch refunds
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/refunds?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRefunds(data.refunds || []);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [filters, fetchRefunds]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const getRefundMethodText = (method: string) => {
    switch (method) {
      case "original_payment":
        return "Original Payment Method";
      case "store_credit":
        return "Store Credit";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Refunds...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch your refund requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Refunds</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Track and manage your refund requests
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by reason or order ID..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: "all", search: "" })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refunds List */}
      {refunds.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">No refund requests</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              You haven&apos;t submitted any refund requests yet.
            </p>
            <Link href="/account/orders">
              <Button variant="outline">View Order History</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <Card key={refund._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(refund.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Refund #{refund._id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Order: {refund.order.orderId}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(refund.status)}>
                      {refund.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatCurrency(refund.amount)}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Refund Details */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Refund Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Product:</span>
                        <span>{refund.product.name}</span>
                      </div>
                      {refund.variant && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Variant:</span>
                          <span>
                            {refund.variant.label} ({refund.variant.sku})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Quantity:</span>
                        <span>{refund.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Reason:</span>
                        <span className="capitalize">
                          {refund.reason.replace(/_/g, " ")}
                        </span>
                      </div>
                      {refund.customerNotes && (
                        <div>
                          <span className="font-medium">Your Notes:</span>
                          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                            {refund.customerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Processing Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Refund Method:</span>
                        <span>{getRefundMethodText(refund.refundMethod)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Order Status:</span>
                        <Badge variant="outline" className="text-xs">
                          {refund.order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Order Date:</span>
                        <span>
                          {new Date(
                            refund.order.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {refund.processedBy && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Processed By:</span>
                          <span>{refund.processedBy.name}</span>
                        </div>
                      )}
                      {refund.processedAt && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Processed At:</span>
                          <span>
                            {new Date(refund.processedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {refund.refundDurationLimit && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Refund Period:</span>
                          <span>{refund.refundDurationLimit} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {refund.adminNotes && (
                  <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Admin Response:
                    </h5>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {refund.adminNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Link href={`/account/orders`}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Order
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
