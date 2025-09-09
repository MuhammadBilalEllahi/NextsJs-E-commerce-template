import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import { generateOrderIds } from "@/lib/utils/orderIds";
import {
  ORDER_STATUS,
  ORDER_PAYMENT_STATUS,
  PAYMENT_TYPE,
  ORDER_TYPE,
} from "@/models/constants";
import {
  checkStockAvailability,
  decreaseStockForOrder,
} from "@/lib/utils/stockManager";
import { Resend } from "resend";
import ScheduledJob, { SCHEDULE_TYPES } from "@/models/ScheduledJob";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      contact,
      shippingAddress,
      billingAddress,
      items,
      subtotal,
      shippingFee,
      total,
      userId,
      sessionId,
      shippingMethod,
    } = body;

    console.log("items", items);

    // Check stock availability before creating order
    const stockCheck = await checkStockAvailability(
      items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.qty,
      }))
    );

    if (!stockCheck.available) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          details: stockCheck.errors,
        },
        { status: 400 }
      );
    }

    // Generate sequential order ID and ref ID using counters
    const { orderId, refId } = await generateOrderIds();

    // Create order
    const order = new Order({
      orderId,
      refId,
      user: userId || null,
      contact: {
        email: contact.email,
        phone: contact.phone,
        marketingOptIn: contact.marketingOptIn || false,
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethod,
      payment: {
        method: PAYMENT_TYPE.COD,
        status: ORDER_PAYMENT_STATUS.PENDING,
        transactionId: "",
      },
      items: items.map((item: any) => ({
        product: item.productId,
        variant: item.variantId || null,
        quantity: item.qty,
        priceAtPurchase: item.price,
        label: item.variantLabel || "",
        image: item.image || "",
      })),
      subtotal,
      shippingFee,
      total,
      status: ORDER_STATUS.PENDING,
      history: [
        {
          status: ORDER_STATUS.PENDING,
          changedAt: new Date(),
          changedBy: userId ? userId : "system",
          reason: "Order created",
        },
      ],
    });

    await order.save();

    // Decrease stock for all items in the order
    // Note: Stock is decreased immediately when order is created (status: pending)
    // This ensures inventory consistency and prevents overselling
    try {
      await decreaseStockForOrder(order._id.toString());
      console.log(`Stock decreased for order ${orderId}`);
    } catch (error) {
      console.error("Failed to decrease stock for order:", error);
      // Note: Stock decrease failed, but order was created
      // This could lead to inventory inconsistency - consider handling this case
      // In production, you might want to rollback the order creation if stock decrease fails
    }

    // Create scheduled job with complete order information
    await ScheduledJob.create({
      type: SCHEDULE_TYPES.CHECKOUT_COMPLETE,
      payload: {
        orderId: order.orderId,
        refId: order.refId,
        email: contact.email,
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        items: items.map((item: any) => ({
          title: item.title || "Product",
          variantLabel: item.variantLabel || "",
          quantity: item.qty,
          priceAtPurchase: item.price,
          image: item.image || "/placeholder.svg",
        })),
        subtotal,
        shippingFee,
        tcsFee: shippingMethod === ORDER_TYPE.TCS ? 0 : 0, // Add TCS fee logic if needed
        total,
        shippingAddress,
        shippingMethod: shippingMethod,
        paymentMethod: "Cash on Delivery",
        orderDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedDelivery:
          shippingMethod === "home_delivery"
            ? "Today"
            : "3-5 business days",
        status: ORDER_STATUS.PENDING,
      },
      runAt: new Date(Date.now()),
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      orderId,
      refId,
      order: order._id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Checkout failed", details: errorMessage },
      { status: 500 }
    );
  }
}
