import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import whatsappService from "@/lib/api/whatsapp/whatsappService";

// POST - Send WhatsApp notification for an existing order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId } = await params;

    const { type } = await request.json();

    // Find the order and populate necessary fields
    const order = await Order.findById(orderId)
      .populate("items.product", "name")
      .populate("items.variant", "label");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderDataForWhatsApp = {
      orderId: order.orderId,
      refId: order.refId,
      contact: order.contact,
      shippingAddress: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      shippingMethod: order.shippingMethod,
    };

    let success = false;
    let message = "";

    if (type === "confirmation") {
      success = await whatsappService.sendOrderConfirmation(
        orderDataForWhatsApp
      );
      message = success
        ? "Order confirmation sent via WhatsApp successfully"
        : "Failed to send order confirmation via WhatsApp";
    } else if (type === "status") {
      success = await whatsappService.sendOrderStatusUpdate(
        orderDataForWhatsApp,
        order.status
      );
      message = success
        ? "Order status update sent via WhatsApp successfully"
        : "Failed to send order status update via WhatsApp";
    } else {
      return NextResponse.json(
        { error: "Invalid notification type. Use 'confirmation' or 'status'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success,
      message,
      orderId: order.orderId,
      phone: order.contact.phone,
      type,
    });
  } catch (error: any) {
    console.error("Error sending WhatsApp notification:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp notification", details: error.message },
      { status: 500 }
    );
  }
}

