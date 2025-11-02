"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, User, Calendar, DollarSign } from "lucide-react";
import { listPayments, updatePayment } from "@/lib/api/admin/payments";

interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  date: string;
  customerEmail: string;
  customerName: string;
  orderStatus: string;
  transactionId: string;
  createdAt: string;
}

export default function PaymentsAdminPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await listPayments();
      if (data.success) {
        setPayments(data.payments);
      } else {
        setError(data.error || "Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const data = await updatePayment(orderId, newStatus);
      if (data.success) {
        await fetchPayments();
        setSuccess("Payment status updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setError("Failed to update payment status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge
        className={
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payments & Refunds</h1>
        <p className="text-gray-600">
          View payment logs and manage payment statuses
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            All payment transactions from orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900/40">
                  <tr>
                    <th className="p-3 text-left">Payment ID</th>
                    <th className="p-3 text-left">Order ID</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Payment Status</th>
                    <th className="p-3 text-left">Order Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="font-mono text-xs">
                            {payment.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs">
                          {payment.orderId}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">
                            {payment.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {payment.method.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">
                            Rs. {payment.amount.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {payment.date}
                        </div>
                      </td>
                      <td className="p-3">{getStatusBadge(payment.status)}</td>
                      <td className="p-3">
                        {getOrderStatusBadge(payment.orderStatus)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {payment.status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updatePaymentStatus(payment.id, "refunded")
                              }
                            >
                              Mark Refunded
                            </Button>
                          )}
                          {payment.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updatePaymentStatus(payment.id, "paid")
                              }
                            >
                              Mark Paid
                            </Button>
                          )}
                          {payment.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updatePaymentStatus(payment.id, "pending")
                              }
                            >
                              Retry Payment
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!payments.length && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-8 text-center text-neutral-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-gray-400" />
                          <p>No payment records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter((p) => p.status === "paid").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rs. {payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
