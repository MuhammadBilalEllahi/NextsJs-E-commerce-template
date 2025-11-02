import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all orders with payment information
    const orders = await Order.find({})
      .populate("user", "email firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    // Transform orders into payment records
    const payments = orders.map((order: any) => ({
      id: order.id.toString(),
      orderId: order.orderId || order.id.toString().slice(-8).toUpperCase(),
      method: order.payment.method || "cod",
      status: order.payment.status || "pending",
      amount: order.total || 0,
      date: new Date(order.createdAt).toLocaleDateString(),
      customerEmail: order.contact?.email || order.user?.email || "N/A",
      customerName: order.user
        ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() ||
          order.user.email
        : `${order.shippingAddress?.firstName || ""} ${
            order.shippingAddress?.lastName || ""
          }`.trim() || "Guest",
      orderStatus: order.status,
      transactionId: order.payment.transactionId || "",
      createdAt: order.createdAt,
    }));

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { orderId, paymentStatus, transactionId } = body;

    if (!orderId || !paymentStatus) {
      return NextResponse.json(
        { error: "Order ID and payment status are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      "payment.status": paymentStatus,
    };

    if (transactionId) {
      updateData["payment.transactionId"] = transactionId;
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      order: {
        id: order.id.toString(),
        paymentStatus: order.payment.status,
        transactionId: order.payment.transactionId,
      },
    });
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status", details: error.message },
      { status: 500 }
    );
  }
}
