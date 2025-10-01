"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/providers/authProvider";
import {
  Bell,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  Gift,
  Eye,
} from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  orderId?: {
    _id: string;
    orderId: string;
    refId: string;
    status: string;
  };
  metadata: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: "",
    isRead: "",
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.isRead !== "") params.append("isRead", filters.isRead);

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_status":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "order_shipped":
        return <Truck className="h-4 w-4 text-green-600" />;
      case "order_delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "order_cancelled":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "refund_approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "refund_rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "promotion":
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order_status":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "order_shipped":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "order_delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "order_cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "refund_approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "refund_rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "promotion":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading Notifications...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we fetch your notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Stay updated with your orders and account activity
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {unreadCount} unread
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  <SelectItem value="order_status">Order Status</SelectItem>
                  <SelectItem value="order_shipped">Order Shipped</SelectItem>
                  <SelectItem value="order_delivered">
                    Order Delivered
                  </SelectItem>
                  <SelectItem value="order_cancelled">
                    Order Cancelled
                  </SelectItem>
                  <SelectItem value="refund_approved">
                    Refund Approved
                  </SelectItem>
                  <SelectItem value="refund_rejected">
                    Refund Rejected
                  </SelectItem>
                  <SelectItem value="promotion">Promotions</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="isRead">Status</Label>
              <Select
                value={filters.isRead}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, isRead: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All notifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_notifications">
                    All Notifications
                  </SelectItem>
                  <SelectItem value="false">Unread Only</SelectItem>
                  <SelectItem value="true">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              You&apos;re all caught up! We&apos;ll notify you when there&apos;s
              something new.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-colors ${
                !notification.isRead
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">
                          {notification.title}
                        </h3>
                        <Badge
                          className={`text-xs ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type.replace(/_/g, " ")}
                        </Badge>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead([notification._id])}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {notification.message}
                    </p>
                    {notification.orderId && (
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium">Order:</span>
                          <span>{notification.orderId.orderId}</span>
                          <Badge variant="outline" className="text-xs">
                            {notification.orderId.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                    {notification.readAt && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        Read on{" "}
                        {new Date(notification.readAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
