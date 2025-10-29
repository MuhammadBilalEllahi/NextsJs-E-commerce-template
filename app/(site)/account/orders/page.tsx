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
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AccountNavigation } from "@/components/account/account-navigation";
import { formatCurrency } from "@/lib/constants/currency";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  CreditCard,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order, OrderItem, Address, Refund } from "@/types/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const [refundForm, setRefundForm] = useState({
    reason: "",
    customerNotes: "",
    quantity: 1,
  });

  // Fetch orders and refunds
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, refundsResponse] = await Promise.all([
        fetch("/api/user/orders"),
        fetch("/api/refunds"),
      ]);

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }

      if (refundsResponse.ok) {
        const refundsData = await refundsResponse.json();
        setRefunds(refundsData.refunds || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleRefundRequest = (order: Order, item: OrderItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setRefundForm({
      reason: "",
      customerNotes: "",
      quantity: 1,
    });
    setShowRefundForm(true);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem) return;

    setIsSubmittingRefund(true);

    try {
      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: selectedOrder.id,
          product: selectedItem.productSlug, // This should be product ID, but using slug for now
          quantity: refundForm.quantity,
          amount: selectedItem.price * refundForm.quantity,
          reason: refundForm.reason,
          customerNotes: refundForm.customerNotes,
        }),
      });

      if (response.ok) {
        alert("Refund request submitted successfully!");
        setShowRefundForm(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit refund request");
      }
    } catch (error) {
      console.error("Error submitting refund:", error);
      alert("Failed to submit refund request. Please try again.");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const getRefundStatus = (orderId: string, productSlug: string) => {
    const refund = refunds.find(
      (r) => (r.order as any).id === orderId && r.product.slug === productSlug
    );
    return refund;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Orders...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch your order history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AccountNavigation>
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track your orders and manage refunds
            </p>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Start shopping to see your orders here.
                </p>
                <Link href="/shop/all">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <div>
                            <CardTitle className="text-lg">
                              Order #{order.orderId}
                            </CardTitle>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              Ref: {order.refId}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {order.date}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Items ({order.itemsCount})
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => {
                            const refund = getRefundStatus(
                              order.id,
                              item.productSlug
                            );
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 border rounded-lg"
                              >
                                <Image
                                  src={item.image}
                                  alt={item.productName}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 rounded object-cover"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">
                                    {item.productName}
                                  </h5>
                                  {item.variantLabel && (
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                      {item.variantLabel}
                                    </p>
                                  )}
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Qty: {item.quantity} ×{" "}
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">
                                    {formatCurrency(item.totalPrice)}
                                  </p>
                                  {refund ? (
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1"
                                    >
                                      Refund {refund.status}
                                    </Badge>
                                  ) : (
                                    order.status === "delivered" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleRefundRequest(order, item)
                                        }
                                        className="mt-1 text-xs"
                                      >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Refund
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Order Details
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-neutral-500" />
                            <span>Shipping: {order.shippingMethod}</span>
                            {order.shippingFee > 0 && (
                              <span className="text-neutral-600 dark:text-neutral-400">
                                ({formatCurrency(order.shippingFee)})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-neutral-500" />
                            <span>Payment: {order.payment}</span>
                            <Badge variant="outline" className="text-xs">
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          {order.tracking && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-neutral-500" />
                              <span>Tracking: {order.tracking}</span>
                            </div>
                          )}
                          {order.cancellationReason && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-600 dark:text-red-400">
                                Cancelled: {order.cancellationReason}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-4">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Shipping Address
                          </h5>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            <p>
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </p>
                            <p>{order.shippingAddress.address}</p>
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p>{order.contact.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Refund Request Modal */}
          {showRefundForm && selectedOrder && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Request Refund</CardTitle>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedItem.productName} - Order #{selectedOrder.orderId}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRefundSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for Refund</Label>
                      <Select
                        value={refundForm.reason}
                        onValueChange={(value) =>
                          setRefundForm((prev) => ({ ...prev, reason: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defective">
                            Product is defective
                          </SelectItem>
                          <SelectItem value="wrong_item">
                            Wrong item received
                          </SelectItem>
                          <SelectItem value="not_as_described">
                            Not as described
                          </SelectItem>
                          <SelectItem value="damaged">
                            Item arrived damaged
                          </SelectItem>
                          <SelectItem value="changed_mind">
                            Changed my mind
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Quantity to Refund</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedItem.quantity}
                        value={refundForm.quantity}
                        onChange={(e) =>
                          setRefundForm((prev) => ({
                            ...prev,
                            quantity: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Please provide any additional details..."
                        value={refundForm.customerNotes}
                        onChange={(e) =>
                          setRefundForm((prev) => ({
                            ...prev,
                            customerNotes: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Refund Amount:</strong>{" "}
                        {formatCurrency(
                          selectedItem.price * refundForm.quantity
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmittingRefund || !refundForm.reason}
                        className="flex-1"
                      >
                        {isSubmittingRefund
                          ? "Submitting..."
                          : "Submit Refund Request"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowRefundForm(false)}
                        disabled={isSubmittingRefund}
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
      </AccountNavigation>
    </ProtectedRoute>
  );
}
