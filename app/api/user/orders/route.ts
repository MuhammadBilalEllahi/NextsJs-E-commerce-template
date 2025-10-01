import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

// GET - Get user orders
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    let query: any = { user: session.user.id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("items.product", "name images slug")
      .populate("items.variant", "label sku")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(query);

    // Format orders for display
    const formattedOrders = orders.map((order: any) => ({
      id: order._id.toString(),
      orderId: order.orderId || order._id.toString().slice(-8).toUpperCase(),
      refId: order.refId || order._id.toString().slice(-8).toUpperCase(),
      date: new Date(order.createdAt).toLocaleDateString(),
      status: order.status,
      total: order.total,
      itemsCount: order.items.length,
      shippingMethod: order.shippingMethod,
      shippingFee: order.shippingFee,
      tcsFee: order.tcsFee || 0,
      payment: order.payment.method,
      paymentStatus: order.payment.status,
      tracking: order.tracking || "",
      cancellationReason: order.cancellationReason || "",
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
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      contact: order.contact,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
