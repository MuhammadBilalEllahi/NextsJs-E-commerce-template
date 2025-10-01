import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Refund from "@/models/Refund";
import { RefundZodSchema } from "@/models/Refund";
import Order from "@/models/Order";
import Product from "@/models/Product";
import GlobalSettings from "@/models/GlobalSettings";
import { authOptions } from "@/lib/auth";

// GET - Get user refunds
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

    const refunds = await Refund.find(query)
      .populate("order", "orderId refId createdAt")
      .populate("product", "name images")
      .populate("variant", "label sku")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Refund.countDocuments(query);

    return NextResponse.json({
      success: true,
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

// POST - Create refund request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const refundData = {
      ...body,
      user: session.user.id,
    };

    // Validate the refund request
    const parsed = RefundZodSchema.safeParse(refundData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.message },
        { status: 400 }
      );
    }

    // Check if order belongs to user
    const order = await Order.findOne({
      _id: parsed.data.order,
      user: session.user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is eligible for refund (not cancelled, delivered within refund period, etc.)
    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot refund a cancelled order" },
        { status: 400 }
      );
    }

    // Check if refund already exists for this order item
    const existingRefund = await Refund.findOne({
      order: parsed.data.order,
      product: parsed.data.product,
      variant: parsed.data.variant,
    });

    if (existingRefund) {
      return NextResponse.json(
        { error: "Refund request already exists for this item" },
        { status: 400 }
      );
    }

    // Check refund period using global settings
    const globalSettings = await GlobalSettings.findOne();
    const refundSettings = globalSettings?.refundSettings || {
      defaultRefundDurationDays: 30,
      maxRefundDurationDays: 90,
      allowUnlimitedRefunds: false,
    };

    const orderDate = new Date(order.createdAt);
    const refundPeriodDays = refundSettings.defaultRefundDurationDays;
    const refundDeadline = new Date(
      orderDate.getTime() + refundPeriodDays * 24 * 60 * 60 * 1000
    );

    if (!refundSettings.allowUnlimitedRefunds && new Date() > refundDeadline) {
      return NextResponse.json(
        {
          error: `Refund period has expired. Refunds must be requested within ${refundPeriodDays} days of delivery.`,
        },
        { status: 400 }
      );
    }

    const refund = await Refund.create(parsed.data);

    return NextResponse.json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error("Error creating refund:", error);
    return NextResponse.json(
      { error: "Failed to create refund request" },
      { status: 500 }
    );
  }
}
