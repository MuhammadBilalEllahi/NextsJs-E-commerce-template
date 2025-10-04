"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "not-found"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link");
      return;
    }

    unsubscribe();
  }, [token]);

  const unsubscribe = async () => {
    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(
          "You have been successfully unsubscribed from our newsletter."
        );
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to unsubscribe");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while processing your request.");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>
          <CardTitle className="text-xl">
            {status === "loading" && "Processing..."}
            {status === "success" && "Unsubscribed"}
            {status === "error" && "Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                We're sorry to see you go! You can always resubscribe by
                visiting our website.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Visit Our Website
              </Button>
            </div>
          )}

          {status === "error" && (
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full"
            >
              Go to Homepage
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

