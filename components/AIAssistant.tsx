"use client";

/**
 * AI Assistant Chat Component
 * Frontend interface for interacting with the AI assistant
 */

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolInvocations?: any[];
  ragResults?: any;
  metadata?: any;
}

interface AIAssistantProps {
  userId?: string;
  sessionId?: string;
  defaultMinimized?: boolean;
}

export default function AIAssistant({
  userId = "guest",
  sessionId,
  defaultMinimized = false,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content:
        '👋 Hi! I\'m your AI shopping assistant. Ask me about products, orders, or use commands like \'/tool searchProducts {"query":"spices"}\'',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [isVisible, setIsVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId,
          sessionId,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "Sorry, I couldn't process that request.",
        timestamp: new Date(),
        toolInvocations: data.toolInvocations,
        ragResults: data.ragResults,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 shadow-2xl transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs opacity-90">
              {isLoading ? "Thinking..." : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[450px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role !== "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-red-600 text-white"
                      : message.role === "system"
                      ? "bg-gray-100 text-gray-800 border border-gray-200"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Tool Invocations */}
                  {message.toolInvocations &&
                    message.toolInvocations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs font-semibold mb-1">
                          Tools Used:
                        </p>
                        {message.toolInvocations.map((tool, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-gray-50 p-2 rounded mb-1"
                          >
                            <span className="font-mono">{tool.tool}</span>
                            {tool.error && (
                              <span className="text-red-600 ml-2">
                                ❌ {tool.error}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* RAG Results Indicator */}
                  {message.ragResults && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600">
                        📚 Found {message.ragResults.totalFound} relevant
                        results
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  {message.metadata && (
                    <p className="text-xs text-gray-500 mt-1">
                      {message.metadata.processingTime}ms
                      {message.metadata.ragUsed && " • RAG"}
                    </p>
                  )}

                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-red-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Try: &quot;What spices do you have?&quot; or use /tool commands
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
