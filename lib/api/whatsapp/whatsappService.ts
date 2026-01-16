import { Resend } from "resend";
import {
  getWhatsAppConfig,
  validateWhatsAppConfig,
} from "@/lib/utils/whatsappConfig";
import { DEFAULT_PHONE_CODE } from "@/lib/constants/site";

// WhatsApp Business API service for sending order notifications
class WhatsAppService {
  private resend: Resend;
  private config: ReturnType<typeof getWhatsAppConfig>;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.config = getWhatsAppConfig();
  }

  /**
   * Send WhatsApp message using WhatsApp Business API
   */
  async sendMessage(to: string, message: any): Promise<boolean> {
    try {
      if (!this.config.isConfigured) {
        console.warn(
          "WhatsApp credentials not configured, falling back to email notification"
        );
        return false;
      }

      // Clean phone number (remove + and spaces, ensure it starts with country code)
      const cleanPhone = this.cleanPhoneNumber(to);

      const response = await fetch(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "template",
            // template: "order_confirmation",
            template: {
              name: "order_confirmation",
              language: {
                code: "en",
              },
              components: [
                {
                  type: "body",
                  parameters: [
                    {
                      type: "text",
                      text: message.customerName,
                    },
                    {
                      type: "text",
                      text: message.orderId,
                    },
                    {
                      type: "text",
                      text: message.total,
                    },
                    {
                      type: "text",
                      text: message.deliveryMethod,
                    },
                    {
                      type: "text",
                      text: message.estimatedDelivery,
                    },
                  ],
                },
                {
                  type: "button",
                  sub_type: "url",
                  index: 0,
                  parameters: [
                    {
                      type: "text",
                      text: message.orderId,
                    },
                  ],
                },
              ],
            },
            // text: {
            //   body: message,
            // },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("WhatsApp API error:", errorData);
        return false;
      }

      const result = await response.json();
      console.debug("WhatsApp message sent successfully:", result);
      return true;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return false;
    }
  }

  /**
   * Send order confirmation via WhatsApp
   */
  async sendOrderConfirmation(orderData: any): Promise<boolean> {
    try {
      const message = this.generateOrderConfirmationMessage(orderData);
      return await this.sendMessage(orderData.contact.phone, message);
    } catch (error) {
      console.error("Error sending order confirmation via WhatsApp:", error);
      return false;
    }
  }

  private generateOrderConfirmationMessage(orderData: any): any {
    const {
      orderId,
      refId,
      contact,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      total,
      shippingMethod,
    } = orderData;

    const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
    const orderDate = new Date().toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format items list
    const itemsList = items
      .map((item: any, index: number) => {
        const itemName = item.product?.name || `Product ${index + 1}`;
        const variant = item.variant?.label ? ` (${item.variant.label})` : "";
        const price = item.priceAtPurchase * item.quantity;
        return `• ${itemName}${variant} - Qty: ${
          item.quantity
        } - Rs. ${price.toLocaleString()}`;
      })
      .join("\n");

    // Determine delivery method
    const deliveryMethod =
      shippingMethod === "tcs" ? "TCS Express" : "Home Delivery";
    const estimatedDelivery =
      shippingMethod === "tcs" ? "2-5 business days" : "6-24 hours";
    return {
      customerName,

      orderId,
      total,
      deliveryMethod,
      estimatedDelivery,
    };
  }

  /**
   * Generate formatted order confirmation message
   */
  //   private generateOrderConfirmationMessage(orderData: any): string {
  //     const {
  //       orderId,
  //       refId,
  //       contact,
  //       shippingAddress,
  //       items,
  //       subtotal,
  //       shippingFee,
  //       total,
  //       shippingMethod,
  //     } = orderData;

  //     const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
  //     const orderDate = new Date().toLocaleDateString("en-PK", {
  //       year: "numeric",
  //       month: "long",
  //       day: "numeric",
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });

  //     // Format items list
  //     const itemsList = items
  //       .map((item: any, index: number) => {
  //         const itemName = item.product?.name || `Product ${index + 1}`;
  //         const variant = item.variant?.label ? ` (${item.variant.label})` : "";
  //         const price = item.priceAtPurchase * item.quantity;
  //         return `• ${itemName}${variant} - Qty: ${
  //           item.quantity
  //         } - Rs. ${price.toLocaleString()}`;
  //       })
  //       .join("\n");

  //     // Determine delivery method
  //     const deliveryMethod =
  //       shippingMethod === "tcs" ? "TCS Express" : "Home Delivery";
  //     const estimatedDelivery =
  //       shippingMethod === "tcs" ? "2-5 business days" : "6-24 hours";
  //     return `Hello *${customerName}*,

  // Your *order ${orderId}* has been confirmed.
  // Total: *Rs. ${total}*.
  // Delivery Method: *${deliveryMethod}*.
  // Estimated Delivery: *${estimatedDelivery}*.

  // Thank you for shopping with Dehli Mirch! 🌶️`;

  //     //     return `🛍️ *Order Confirmed - Dehli Mirch*

  //     // Hello ${customerName}! 👋

  //     // Your order has been successfully placed and confirmed.

  //     // 📋 *Order Details:*
  //     // • Order ID: #${orderId}
  //     // • Reference ID: ${refId}
  //     // • Order Date: ${orderDate}
  //     // • Delivery Method: ${deliveryMethod}
  //     // • Estimated Delivery: ${estimatedDelivery}

  //     // 📦 *Items Ordered:*
  //     // ${itemsList}

  //     // 💰 *Order Summary:*
  //     // • Subtotal: Rs. ${subtotal.toLocaleString()}
  //     // • Shipping Fee: Rs. ${shippingFee.toLocaleString()}
  //     // • *Total Amount: Rs. ${total.toLocaleString()}*

  //     // 📍 *Delivery Address:*
  //     // ${shippingAddress.address}
  //     // ${shippingAddress.city}, Pakistan

  //     // 💳 *Payment Method:* Cash on Delivery (COD)

  //     // 📞 *Need Help?*
  //     // Contact us at +92 321 4375872 or WhatsApp us for any queries.

  //     // Thank you for choosing Dehli Mirch! 🌶️
  //     // *Heat you can taste, tradition you can trust.*`;
  //   }

  /**
   * Clean and format phone number for WhatsApp API
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, "");

    // If it doesn't start with country code, add Pakistan code
    if (!cleanPhone.startsWith(DEFAULT_PHONE_CODE)) {
      if (cleanPhone.startsWith("0")) {
        // Remove leading 0 and add 92
        cleanPhone = DEFAULT_PHONE_CODE + cleanPhone.substring(1);
      } else {
        // Add 92 prefix
        cleanPhone = DEFAULT_PHONE_CODE + cleanPhone;
      }
    }

    return cleanPhone;
  }

  /**
   * Send order status update via WhatsApp
   */
  async sendOrderStatusUpdate(
    orderData: any,
    newStatus: string
  ): Promise<boolean> {
    try {
      const message = this.generateOrderStatusMessage(orderData, newStatus);
      return await this.sendMessage(orderData.contact.phone, message);
    } catch (error) {
      console.error("Error sending order status update via WhatsApp:", error);
      return false;
    }
  }

  /**
   * Generate order status update message
   */
  private generateOrderStatusMessage(
    orderData: any,
    newStatus: string
  ): string {
    const { orderId, shippingAddress } = orderData;
    const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;

    let statusEmoji = "📦";
    let statusMessage = "";

    switch (newStatus.toLowerCase()) {
      case "confirmed":
        statusEmoji = "✅";
        statusMessage = "Your order has been confirmed and is being prepared.";
        break;
      case "shipped":
        statusEmoji = "🚚";
        statusMessage = "Your order has been shipped and is on its way!";
        break;
      case "delivered":
        statusEmoji = "🎉";
        statusMessage = "Your order has been delivered successfully!";
        break;
      case "cancelled":
        statusEmoji = "❌";
        statusMessage = "Your order has been cancelled.";
        break;
      default:
        statusEmoji = "📋";
        statusMessage = `Your order status has been updated to: ${newStatus}`;
    }

    return `${statusEmoji} *Order Update - Dehli Mirch*

Hello ${customerName}!

${statusMessage}

📋 *Order Details:*
• Order ID: #${orderId}
• Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}

📞 *Need Help?*
Contact us at +92 321 4375872

Thank you for choosing Dehli Mirch! 🌶️`;
  }
}

// Export singleton instance
export default new WhatsAppService();
