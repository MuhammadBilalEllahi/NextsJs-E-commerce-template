"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  PhoneCall,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/providers/authProvider";

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
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  status: string;
  priority: string;
  category: string;
  messages: ChatMessage[];
  lastMessageAt: Date;
  isActive: boolean;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [inquiry, setInquiry] = useState<ChatInquiry | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
  });
  const [sessionId, setSessionId] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();

  // Initialize session ID
  useEffect(() => {
    let existingSessionId = localStorage.getItem("chat-session-id");
    if (!existingSessionId) {
      existingSessionId = `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("chat-session-id", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  // Load chat history when widget opens
  useEffect(() => {
    if (open && sessionId) {
      loadChatHistory();
      // Subscribe to SSE stream for real-time updates
      const es = new EventSource(`/api/chat/stream?sessionId=${sessionId}`);
      es.addEventListener("message", (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload?.type === "admin_reply" ||
            payload?.type === "user_message"
          ) {
            const incoming = payload.message as ChatMessage;
            setMessages((prev) => [...prev, incoming]);
          } else if (payload?.type === "inquiry_update") {
            setInquiry((prev) =>
              prev
                ? { ...prev, status: payload.meta?.status ?? prev.status }
                : prev
            );
          }
        } catch {}
      });
      es.addEventListener("ping", () => {});
      return () => es.close();
    }
  }, [open, sessionId]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success && data.inquiry) {
        setInquiry(data.inquiry);
        setMessages(data.inquiry.messages || []);

        // Set user info if available
        if (data.inquiry.name || data.inquiry.email || data.inquiry.phone) {
          setUserInfo({
            name: data.inquiry.name || "",
            email: data.inquiry.email || "",
            phone: data.inquiry.phone || "",
            category: data.inquiry.category || "general",
          });
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const message = input.trim();
    setInput("");

    // Add user message to local state immediately
    const userMessage: ChatMessage = {
      sender: "user",
      message,
      timestamp: new Date(),
      isRead: false,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message,
          ...userInfo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update inquiry if provided
        if (data.inquiry) {
          setInquiry((prev) =>
            prev ? { ...prev, ...data.inquiry } : data.inquiry
          );
        }
      } else {
        // Remove the message if sending failed
        setMessages((prev) => prev.slice(0, -1));
        console.error("Failed to send message:", data.error);
      }
    } catch (error) {
      // Remove the message if sending failed
      setMessages((prev) => prev.slice(0, -1));
      console.error("Error sending message:", error);
    }
  };

  const updateUserInfo = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...userInfo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowUserForm(false);
        if (data.inquiry) {
          setInquiry((prev) =>
            prev ? { ...prev, ...data.inquiry } : data.inquiry
          );
        }
      }
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "default",
      pending: "secondary",
      closed: "outline",
      resolved: "default",
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

  return (
    <>
      {open && (
        <Card className="fixed bottom-20 right-4 z-50 w-96 h-[500px] shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Live Chat Support</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {inquiry && (
              <div className="flex items-center gap-2 text-sm">
                {getStatusBadge(inquiry.status)}
                {getPriorityBadge(inquiry.priority)}
                <span className="text-muted-foreground">
                  {inquiry.category}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex flex-col h-[400px] p-0">
            {showUserForm ? (
              <div className="p-4 space-y-3">
                <h3 className="font-medium">Contact Information</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Your name"
                    value={userInfo.name}
                    onChange={(e) =>
                      setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Phone number"
                    value={userInfo.phone}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                  <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={userInfo.category}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="product">Product Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={updateUserInfo} className="flex-1">
                    Save & Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUserForm(false)}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div ref={ref} className="flex-1 overflow-auto p-4 space-y-3">
                  {loading ? (
                    <div className="text-center text-muted-foreground">
                      Loading chat history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Start a conversation with our support team!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.sender === "user"
                              ? "bg-primary text-white"
                              : msg.sender === "admin"
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div>{msg.message}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* User info button */}
                  {!userInfo.name && !userInfo.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUserForm(true)}
                      className="w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Add Contact Information
                    </Button>
                  )}

                  {/* Support links */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <a
                      href={`https://wa.me/923001234567?text=${encodeURIComponent(
                        "Hello Dehli Mirch! I need help."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="tel:+923001234567"
                      className="text-primary hover:underline"
                    >
                      Call Us
                    </a>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat button */}
      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  );
}
