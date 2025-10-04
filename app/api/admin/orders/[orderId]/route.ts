import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/database/mongodb";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Await the params promise
    const { orderId } = await context.params;

    await dbConnect();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find order with populated product and variant details
    const order = await Order.findById(orderId)
      .populate("user", "firstName lastName email phone")
      .populate("items.product", "name images slug description price")
      .populate("items.variant", "label sku price stock images")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order for detailed display
    const formattedOrder = {
      id: order.id.toString(),
      orderId: order.orderId || order.id.toString().slice(-8).toUpperCase(),
      refId: order.refId || order.id.toString().slice(-8).toUpperCase(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      status: order.status,
      payment: {
        method: order.payment.method,
        status: order.payment.status,
        transactionId: order.payment.transactionId || "",
      },
      contact: {
        email: order.contact.email,
        phone: order.contact.phone,
      },
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map((item: any) => ({
        productTitle: item.product?.name || "Unknown Product",
        variantLabel: item.variant?.label || "",
        quantity: item.quantity,
        price: item.priceAtPurchase,
        image: item.product?.images?.[0] || "/placeholder.svg",
        productSlug: item.product?.slug || "",
        variantSku: item.variant?.sku || "",
        totalPrice: item.priceAtPurchase * item.quantity,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      tracking: order.tracking || "",
      cancellationReason: order.cancellationReason || "",
      history: order.history || [],
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
