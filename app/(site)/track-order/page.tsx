"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/constants/currency";
import { OrderData, TCSOrderData, TrackingData } from "@/types";
import { useSearchParams } from "next/navigation";

export default function TrackOrderPage() {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const searchParams = useSearchParams();

  // Get tracking number from URL params if available
  useEffect(() => {
    const refId = searchParams.get("refId");
    if (refId) {
      setTrackingNumber(refId);
      handleTrack(refId);
    }
  }, [searchParams]);

  const handleTrack = useCallback(
    async (refId?: string) => {
      const orderRef = refId || trackingNumber;
      if (!orderRef.trim()) {
        setError("Please enter a tracking number");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/track-order?refId=${encodeURIComponent(orderRef)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tracking information");
        }

        setTrackingData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while tracking your order"
        );
        setTrackingData(null);
      } finally {
        setLoading(false);
      }
    },
    [trackingNumber]
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "shipped":
      case "in_transit":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "pending":
      case "confirmed":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "shipped":
      case "in_transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            Track Your Order
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enter your order reference number to track your package
          </p>
        </div>

        {/* Tracking Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter order reference number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                className="flex-1"
              />
              <Button onClick={() => handleTrack()} disabled={loading}>
                {loading ? "Tracking..." : "Track Order"}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Order ID
                    </p>
                    <p className="font-semibold">
                      {trackingData.order.orderId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Reference ID
                    </p>
                    <p className="font-semibold">{trackingData.order.refId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(trackingData.order.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          trackingData.order.status
                        )}`}
                      >
                        {trackingData.order.status.charAt(0).toUpperCase() +
                          trackingData.order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Amount
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(trackingData.order.total)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">
                    {trackingData.order.shippingAddress.firstName}{" "}
                    {trackingData.order.shippingAddress.lastName}
                  </p>
                  <p>{trackingData.order.shippingAddress.address}</p>
                  <p>
                    {trackingData.order.shippingAddress.city},{" "}
                    {trackingData.order.shippingAddress.country}
                  </p>
                  <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Phone className="h-4 w-4" />
                    {trackingData.order.shippingAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingData.order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.productName}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {item.variantLabel} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          SKU: {item.variantSku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(trackingData.order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span>
                      {formatCurrency(trackingData.order.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(trackingData.order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TCS Tracking (if available) */}
            {trackingData.tcsOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    TCS Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Consignment Number
                      </p>
                      <p className="font-semibold">
                        {trackingData.tcsOrder.consignmentNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(trackingData.tcsOrder.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            trackingData.tcsOrder.status
                          )}`}
                        >
                          {trackingData.tcsOrder.status
                            .charAt(0)
                            .toUpperCase() +
                            trackingData.tcsOrder.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Estimated Delivery
                      </p>
                      <p className="font-semibold">
                        {new Date(
                          trackingData.tcsOrder.estimatedDelivery
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Weight
                      </p>
                      <p className="font-semibold">
                        {trackingData.tcsOrder.weight} kg
                      </p>
                    </div>
                  </div>

                  {/* Tracking History */}
                  {trackingData.tcsOrder.trackingHistory.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-4">Tracking History</h4>
                      <div className="space-y-3">
                        {trackingData.tcsOrder.trackingHistory.map(
                          (entry, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">
                                    {entry.status}
                                  </span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {entry.description}
                                </p>
                                {entry.location && (
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    📍 {entry.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trackingData.order.history.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{entry.status}</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(entry.changedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {entry.reason}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Updated by: {entry.changedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="font-semibold">Phone Support</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {trackingData.order.contact.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="font-semibold">Email Support</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {trackingData.order.contact.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
