import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import Order from "@/models/Order";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { email } = await params;
    const norm = decodeURIComponent(email).trim().toLowerCase();

    const orders = await Order.find({
      "contact.email": new RegExp(`^${norm}$`, "i"),
    })
      .sort({ createdAt: -1 })
      .select(
        "orderId refId createdAt total items shippingMethod shippingFee status payment tracking"
      )
      .lean();

    const formatted = orders.map((o: any) => ({
      id: String(o.id),
      orderId: o.orderId || String(o.id).slice(-8).toUpperCase(),
      refId: o.refId || String(o.id).slice(-8).toUpperCase(),
      date: new Date(o.createdAt).toLocaleDateString(),
      total: o.total,
      itemsCount: (o.items || []).length,
      shippingMethod: o.shippingMethod,
      shippingFee: o.shippingFee,
      status: o.status,
      payment: o.payment?.method,
      paymentStatus: o.payment?.status,
      tracking: o.tracking || "",
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error: any) {
    console.error("Failed to fetch customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders", details: error.message },
      { status: 500 }
    );
  }
}
