/**
 * Full Checkout AI - Chat-based buying flow
 * Allows completing entire purchase through chat
 */

import { NextRequest, NextResponse } from "next/server";
import mcpTools from "@/lib/tools";
import { logCheckoutStart, logPurchase } from "@/lib/logging/userBehavior";

export const runtime = "nodejs";

interface CheckoutStep {
  step: "cart" | "coupon" | "confirm" | "complete";
  message: string;
  data?: any;
  actions?: string[];
}

/**
 * POST /api/assistant/checkout
 * Handle chat-based checkout flow
 */
export async function POST(request: NextRequest) {
  try {
    const { command, userId, productId, quantity } = await request.json();

    console.log(`[Checkout AI] Command: ${command}, User: ${userId}`);

    // Parse command
    if (command.includes("add") && command.includes("cart")) {
      // Add to cart
      const result = await mcpTools.addToCart(userId, productId || "prod_001", quantity || 1);
      
      return NextResponse.json({
        success: true,
        step: "cart",
        message: `✅ Added to cart! You now have ${result.cart.itemCount} items (Rs. ${result.cart.subtotal}).`,
        data: result.cart,
        actions: ["Apply coupon", "Checkout now", "Continue shopping"],
      });
    }

    if (command.includes("coupon") || command.includes("discount")) {
      // Apply best coupon
      const cartTotal = 1000; // Get from session/cart
      const couponResult = await mcpTools.applyBestCoupon(userId, cartTotal);

      if (couponResult.success) {
        return NextResponse.json({
          success: true,
          step: "coupon",
          message: `🎉 Great news! I found a coupon for you: "${couponResult.coupon.code}" - Save Rs. ${couponResult.discountAmount}! Your new total is Rs. ${couponResult.newTotal}.`,
          data: couponResult,
          actions: ["Checkout with coupon", "Skip coupon"],
        });
      } else {
        return NextResponse.json({
          success: true,
          step: "coupon",
          message: "No coupons available for your cart, but you can still checkout!",
          actions: ["Checkout now"],
        });
      }
    }

    if (command.includes("checkout") || command.includes("buy")) {
      // Log checkout start
      logCheckoutStart(userId, 850, 2);

      // Process checkout
      const checkoutResult = await mcpTools.checkout(userId);

      // Log purchase
      logPurchase(userId, checkoutResult.order.orderId, checkoutResult.order.total, 2);

      return NextResponse.json({
        success: true,
        step: "complete",
        message: `🎊 Order placed successfully! Your order ID is ${checkoutResult.order.orderId}. Total: Rs. ${checkoutResult.order.total}. Estimated delivery: ${new Date(checkoutResult.estimatedDelivery).toLocaleDateString()}.`,
        data: checkoutResult.order,
        actions: ["Track order", "View order details"],
      });
    }

    if (command.includes("confirm") || command.includes("yes")) {
      // Confirm and complete
      const checkoutResult = await mcpTools.checkout(userId);
      
      return NextResponse.json({
        success: true,
        step: "complete",
        message: `✅ Payment confirmed! Order ${checkoutResult.order.orderId} is being processed. You'll receive a confirmation email shortly.`,
        data: checkoutResult.order,
      });
    }

    // Default help message
    return NextResponse.json({
      success: true,
      step: "cart",
      message: "I can help you complete your purchase! Try saying:\n• 'Add this to cart'\n• 'Apply coupon'\n• 'Checkout now'\n• 'Buy this for me'",
      actions: ["Start shopping", "View cart"],
    });

  } catch (error: any) {
    console.error("[Checkout AI] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assistant/checkout
 * Get checkout status
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId required" },
      { status: 400 }
    );
  }

  // Mock cart status
  return NextResponse.json({
    success: true,
    cart: {
      items: 2,
      total: 850,
      canCheckout: true,
    },
  });
}

