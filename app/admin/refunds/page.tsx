"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertCircle,
  Eye,
  Package,
  User,
  Calendar,
} from "lucide-react";

interface Refund {
  _id: string;
  order: {
    _id: string;
    orderId: string;
    refId: string;
    createdAt: string;
    status: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
    images: string[];
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
  refundDurationLimit?: number;
  refundMethod: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRefundsPage() {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    refundMethod: "",
    refundDurationLimit: 0,
  });

  // Fetch refunds
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/refunds?${params}`);
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
  }, [filters]);

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

  const handleUpdateRefund = (refund: Refund) => {
    setSelectedRefund(refund);
    setUpdateForm({
      status: refund.status,
      adminNotes: refund.adminNotes || "",
      refundMethod: refund.refundMethod,
      refundDurationLimit: refund.refundDurationLimit || 0,
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefund) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/refunds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRefund._id,
          ...updateForm,
          refundDurationLimit: updateForm.refundDurationLimit,
        }),
      });

      if (response.ok) {
        alert("Refund updated successfully!");
        setShowUpdateModal(false);
        fetchRefunds();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update refund");
      }
    } catch (error) {
      console.error("Error updating refund:", error);
      alert("Failed to update refund. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Refunds...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch refund requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Refund Management</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage customer refund requests and process refunds
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
                placeholder="Search by reason, notes, or customer..."
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
            <p className="text-neutral-600 dark:text-neutral-400">
              No refund requests match your current filters.
            </p>
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
                          <span className="font-medium">Customer Notes:</span>
                          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                            {refund.customerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer & Order Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer & Order Info
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Customer:</span>
                        <span>{refund.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <span>{refund.user.email}</span>
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
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {refund.adminNotes && (
                  <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Admin Notes:</h5>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {refund.adminNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => handleUpdateRefund(refund)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Refund Status</CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Refund #{selectedRefund._id.slice(-8).toUpperCase()}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={updateForm.status}
                    onValueChange={(value) =>
                      setUpdateForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="refundMethod">Refund Method</Label>
                  <Select
                    value={updateForm.refundMethod}
                    onValueChange={(value) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        refundMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original_payment">
                        Original Payment Method
                      </SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add notes about this refund decision..."
                    value={updateForm.adminNotes}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        adminNotes: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="refundDurationLimit">
                    Refund Duration Limit (Days)
                  </Label>
                  <Input
                    id="refundDurationLimit"
                    type="number"
                    min="0"
                    placeholder="Enter days (0 = unlimited)"
                    value={updateForm.refundDurationLimit.toString()}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        refundDurationLimit: parseInt(e.target.value),
                      }))
                    }
                  />
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Set the refund period for this product. Leave empty for
                    default settings.
                  </p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Refund Amount:</strong>{" "}
                    {formatCurrency(selectedRefund.amount)}
                  </p>
                  <p className="text-sm">
                    <strong>Customer:</strong> {selectedRefund.user.name} (
                    {selectedRefund.user.email})
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !updateForm.status}
                    className="flex-1"
                  >
                    {isSubmitting ? "Updating..." : "Update Refund"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
