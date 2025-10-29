"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { sendOrderWhatsApp } from "@/lib/api/admin/orders/whatsapp";

interface WhatsAppNotificationButtonProps {
  orderId: string;
  phone: string;
  orderNumber: string;
}

export function WhatsAppNotificationButton({
  orderId,
  phone,
  orderNumber,
}: WhatsAppNotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const sendWhatsAppNotification = async (type: "confirmation" | "status") => {
    setIsLoading(true);
    try {
      const data = await sendOrderWhatsApp(orderId, type);
      alert(data.message || "WhatsApp notification sent");
    } catch (error) {
      console.error("Error sending WhatsApp notification:", error);
      alert("Failed to send WhatsApp notification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => sendWhatsAppNotification("confirmation")}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        Send Confirmation
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => sendWhatsAppNotification("status")}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
        Send Status Update
      </Button>
    </div>
  );
}
