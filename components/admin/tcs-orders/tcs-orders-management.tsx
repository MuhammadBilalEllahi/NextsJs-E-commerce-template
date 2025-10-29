"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { formatCurrency } from "@/lib/constants/currency";
import { TCS_STATUS } from "@/models/constants/constants";
import { TCSTrackingHistory } from "@/types/types";

export default function TCSOrdersManagement() {
  const [tcsOrders, setTcsOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TCSTrackingHistory[]>(
    []
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const statusColors = {
    [TCS_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
    [TCS_STATUS.CREATED]: "bg-blue-100 text-blue-800",
    [TCS_STATUS.PICKED_UP]: "bg-purple-100 text-purple-800",
    [TCS_STATUS.IN_TRANSIT]: "bg-indigo-100 text-indigo-800",
    [TCS_STATUS.OUT_FOR_DELIVERY]: "bg-orange-100 text-orange-800",
    [TCS_STATUS.DELIVERED]: "bg-green-100 text-green-800",
    [TCS_STATUS.FAILED]: "bg-red-100 text-red-800",
    [TCS_STATUS.CANCELLED]: "bg-gray-100 text-gray-800",
  };

  const fetchTCSOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/tcs-orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setTcsOrders(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch TCS orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    orderId: string,
    action: string,
    actionData?: any
  ) => {
    try {
      setActionLoading(orderId);
      const response = await fetch(`/api/admin/tcs-orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...actionData }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTCSOrders();
        if (action === "track" && data.data?.courier?.trackingHistory) {
          setTrackingHistory(data.data.courier.trackingHistory);
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} TCS order:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt("Please provide cancellation reason:");
    if (reason) {
      await handleAction(orderId, "cancel", { reason });
    }
  };

  const handleUpdateStatus = async (orderId: string) => {
    const status = prompt(
      "Enter new status (pending, created, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled):"
    );
    const location = prompt("Enter location (optional):");
    const reason = prompt("Enter reason for status change:");

    if (status && Object.values(TCS_STATUS).includes(status)) {
      await handleAction(orderId, "update_status", {
        status,
        location,
        reason,
      });
    }
  };

  useEffect(() => {
    fetchTCSOrders();
  }, [page, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case TCS_STATUS.DELIVERED:
        return <CheckCircle className="h-4 w-4" />;
      case TCS_STATUS.FAILED:
        return <AlertCircle className="h-4 w-4" />;
      case TCS_STATUS.CANCELLED:
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">TCS Orders Management</h1>
        <Button onClick={fetchTCSOrders} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by CN, Ref ID, Name, or Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {Object.values(TCS_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* TCS Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>TCS Orders ({tcsOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CN Number</TableHead>
                <TableHead>Order Ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tcsOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-mono">
                    {order.courier?.consignmentNumber || "N/A"}
                  </TableCell>
                  <TableCell className="font-mono">{order.refId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.courier?.consigneeName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.courier?.consigneeMobNo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {order.courier?.destinationCityName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[
                          (order.courier?.status ||
                            TCS_STATUS.PENDING) as keyof typeof statusColors
                        ]
                      }
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.courier?.status)}
                        {(order.courier?.status || "")
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(
                      parseFloat(order.courier?.codAmount || "0")
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>TCS Order Details</DialogTitle>
                            <DialogDescription>
                              Order #{order.orderId} - CN:{" "}
                              {order.courier?.consignmentNumber}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold">
                                  Customer Information
                                </h4>
                                <p>
                                  <strong>Name:</strong>{" "}
                                  {order.courier?.consigneeName}
                                </p>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  {order.courier?.consigneeMobNo}
                                </p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {order.courier?.consigneeEmail}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  Package Details
                                </h4>
                                <p>
                                  <strong>Weight:</strong>{" "}
                                  {order.courier?.weight} kg
                                </p>
                                <p>
                                  <strong>Pieces:</strong>{" "}
                                  {order.courier?.pieces}
                                </p>
                                <p>
                                  <strong>COD Amount:</strong>{" "}
                                  {formatCurrency(
                                    parseFloat(order.courier?.codAmount || "0")
                                  )}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                Tracking History
                              </h4>
                              <div className="space-y-2">
                                {(order.courier?.trackingHistory || []).map(
                                  (entry: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                    >
                                      <div className="p-1 rounded-full bg-blue-100">
                                        <Package className="h-3 w-3 text-blue-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">
                                            {entry.status}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(
                                              entry.timestamp
                                            ).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                          {entry.description}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handleAction(order._id, "track")}
                              disabled={actionLoading === order._id}
                            >
                              {actionLoading === order._id ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Track Order
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(order._id, "track")}
                        disabled={actionLoading === order._id}
                      >
                        {actionLoading === order._id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAction(order._id, "get_pickup_status")
                        }
                        disabled={actionLoading === order._id}
                      >
                        <Truck className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {order.courier?.status !== TCS_STATUS.CANCELLED &&
                        order.courier?.status !== TCS_STATUS.DELIVERED && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
