import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import { ORDER_STATUS } from "@/models/constants/constants";
import whatsappService from "@/lib/api/whatsapp/whatsappService";

// PUT - Update order status and send WhatsApp notification
export async function PUT(
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

    const { status, reason } = await request.json();

    if (!status || !Object.values(ORDER_STATUS).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    // Find the order and populate necessary fields
    const order = await Order.findById(orderId)
      .populate("items.product", "name")
      .populate("items.variant", "label");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const previousStatus = order.status;
    order.status = status;

    // Add to history
    order.history.push({
      status,
      changedAt: new Date(),
      changedBy: session.user.id,
      reason: reason || `Status changed from ${previousStatus} to ${status}`,
    });

    await order.save();

    // Send WhatsApp notification for status update
    try {
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

      await whatsappService.sendOrderStatusUpdate(orderDataForWhatsApp, status);
      console.debug(`WhatsApp status update sent for order ${order.orderId}`);
    } catch (whatsappError) {
      console.error("Failed to send WhatsApp status update:", whatsappError);
      // Don't fail the status update if WhatsApp fails
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        orderId: order.orderId,
        refId: order.refId,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status", details: error.message },
      { status: 500 }
    );
  }
}
