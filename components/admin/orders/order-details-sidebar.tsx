"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Copy,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Truck,
  Package,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  FileText,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/constants/currency";
import { OrderDetails } from "@/types";

interface OrderDetailsSidebarProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsSidebar({
  orderId,
  isOpen,
  onClose,
}: OrderDetailsSidebarProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails();
    }
  }, [orderId, isOpen]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        console.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    if (order?.orderId) {
      navigator.clipboard.writeText(order.orderId);
      // You could add a toast notification here
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "pending":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTimelineIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "confirmed":
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  #{order.orderId}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOrderId}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Order details
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Order Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Created at</div>
                    <div className="font-medium text-foreground">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Payment</div>
                    <Badge
                      variant="secondary"
                      className={getPaymentStatusColor(order.payment.status)}
                    >
                      {order.payment.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Status</div>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Customer</h3>
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">
                      Full name:
                    </div>
                    <div className="font-medium text-foreground">
                      {order.shippingAddress.firstName}{" "}
                      {order.shippingAddress.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">
                      Email:
                    </div>
                    <div className="font-medium text-foreground">
                      {order.contact.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">
                      Phone Number:
                    </div>
                    <div className="font-medium text-foreground">
                      {order.contact.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm mb-1">
                      Shipping Address:
                    </div>
                    <div className="font-medium text-foreground">
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.postalCode},{" "}
                      {order.shippingAddress.country}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Timeline</h3>
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="space-y-4">
                {order.history.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {getTimelineIcon(event.status)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {event.reason}
                      </div>
                      {event.status === "shipped" && order.tracking && (
                        <div className="text-sm text-primary mt-1">
                          Shipped via FedEx, TN# {order.tracking}
                        </div>
                      )}
                      {event.status === "confirmed" && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Confirmed by {event.changedBy}
                        </div>
                      )}
                      {event.status === "paid" && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Confirmed by Payment Gateway
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(event.changedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Items {order.items.length}
                </h3>
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">
                            {item.productTitle}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.variantLabel}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {formatCurrency(item.totalPrice)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Payment</h3>
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-foreground">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Invoice
              </Button>
              <Button variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refund
              </Button>
              <Button variant="outline" className="flex-1">
                <Package className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Order not found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
