"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Mail,
  Phone,
  Filter,
  Search,
  Send,
  Loader2,
} from "lucide-react";
import {
  listChatInquiries,
  sendChatReply,
  updateChatInquiry,
} from "@/lib/api/admin/chat-inquiries";

interface ChatMessage {
  id?: string;
  sender: "user" | "admin" | "system";
  message: string;
  timestamp: Date;
  isRead?: boolean;
}

interface ChatInquiry {
  id: string;
  sessionId: string;
  userId?: {
    id: string;
    name: string;
    email: string;
  };
  name?: string;
  email?: string;
  phone?: string;
  status: "open" | "closed" | "pending" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  category: "general" | "order" | "product" | "technical" | "billing" | "other";
  messages: ChatMessage[];
  lastMessageAt: Date;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Stats {
  total: number;
  open: number;
  pending: number;
  closed: number;
  resolved: number;
  high: number;
  urgent: number;
}

export default function ChatInquiriesAdminPage() {
  const [inquiries, setInquiries] = useState<ChatInquiry[]>([]);
  const [selected, setSelected] = useState<ChatInquiry | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    pending: 0,
    closed: 0,
    resolved: 0,
    high: 0,
    urgent: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    search: "",
  });

  useEffect(() => {
    fetchInquiries();
  }, [filters]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await listChatInquiries({
        status: filters.status,
        priority: filters.priority,
        category: filters.category,
      });
      if (data.success) {
        setInquiries(data.inquiries);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;

    try {
      setSending(true);
      const data = await sendChatReply(selected.id, reply);

      if (data.success) {
        setReply("");
        // Update the selected inquiry with new message
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, data.message],
                lastMessageAt: new Date(data.inquiry.lastMessageAt),
              }
            : null
        );
        // Refresh the list
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSending(false);
    }
  };

  const updateInquiry = async (field: string, value: any) => {
    if (!selected) return;

    try {
      const data = await updateChatInquiry(selected.id, field, value);

      if (data.success) {
        // Update the selected inquiry
        setSelected((prev) => (prev ? { ...prev, [field]: value } : null));
        // Refresh the list
        fetchInquiries();
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "destructive",
      pending: "secondary",
      resolved: "default",
      closed: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      urgent: "destructive",
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || "default"}>
        {priority}
      </Badge>
    );
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        inquiry.name?.toLowerCase().includes(search) ||
        inquiry.email?.toLowerCase().includes(search) ||
        inquiry.sessionId.toLowerCase().includes(search) ||
        inquiry.messages.some((msg) =>
          msg.message.toLowerCase().includes(search)
        )
      );
    }
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat Inquiries</h1>
          <p className="text-gray-600">Manage customer support conversations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <div className="text-sm text-muted-foreground">Open</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">
              {stats.closed}
            </div>
            <div className="text-sm text-muted-foreground">Closed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.high}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.urgent}
            </div>
            <div className="text-sm text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  priority: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  category: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Inquiries List */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiries</CardTitle>
            <CardDescription>
              {filteredInquiries.length} of {inquiries.length} inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="max-h-[600px] overflow-auto">
                {filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selected?.id === inquiry.id
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                    onClick={() => setSelected(inquiry)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(inquiry.status)}
                        <div className="font-medium">
                          {inquiry.name || inquiry.userId?.name || "Anonymous"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusBadge(inquiry.status)}
                        {getPriorityBadge(inquiry.priority)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {inquiry.email || inquiry.userId?.email || "No email"}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {inquiry.messages.length > 0
                        ? inquiry.messages[
                            inquiry.messages.length - 1
                          ]?.message.substring(0, 100) + "..."
                        : "No messages"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(inquiry.lastMessageAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {filteredInquiries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No inquiries found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            {selected ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle>
                      {selected.name ||
                        selected.userId?.name ||
                        "Anonymous User"}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selected.status}
                      onValueChange={(value) => updateInquiry("status", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={selected.priority}
                      onValueChange={(value) =>
                        updateInquiry("priority", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selected.email || selected.userId?.email || "No email"}
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selected.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {selected.category}
                  </div>
                </div>
              </div>
            ) : (
              <CardTitle>Select an inquiry to start chatting</CardTitle>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                {/* Messages */}
                <div className="h-80 overflow-auto border rounded-lg p-4 space-y-3">
                  {selected.messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        message.sender === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.sender === "admin"
                            ? "bg-blue-600 text-white"
                            : message.sender === "user"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <div>{message.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selected.messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>

                {/* Reply Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Session: {selected.sessionId}
                    </div>
                    <Button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  Select an inquiry from the list to view and respond to
                  messages
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
