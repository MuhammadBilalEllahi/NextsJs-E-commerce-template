import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Refund from "@/models/Refund";
import { RefundZodSchema } from "@/models/Refund";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";
import AnalyticsLog from "@/models/AnalyticsLog";
import Variant from "@/models/Variant";
import Product from "@/models/Product";

// GET - Get all refunds (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: "i" } },
        { customerNotes: { $regex: search, $options: "i" } },
        { adminNotes: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const refunds = await Refund.find(query)
      .populate("order", "orderId refId createdAt status")
      .populate("user", "name email")
      .populate("product", "name images")
      .populate("variant", "label sku")
      .populate("processedBy", "name email")
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

// PUT - Update refund status (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { id, status, adminNotes, refundMethod, refundDurationLimit } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Refund ID and status are required" },
        { status: 400 }
      );
    }

    const refund = await Refund.findById(id);
    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    // Enforce reason for terminal decisions
    const requiresReason = ["approved", "rejected", "completed"].includes(
      String(status || "").toLowerCase()
    );
    if (
      requiresReason &&
      (!adminNotes || String(adminNotes).trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "A reason (admin notes) is required to process this status." },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      processedBy: session.user.id,
      processedAt: new Date(),
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (refundMethod) {
      updateData.refundMethod = refundMethod;
    }

    if (refundDurationLimit !== undefined) {
      updateData.refundDurationLimit = refundDurationLimit;
    }

    const updatedRefund = await Refund.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("order", "orderId refId")
      .populate("user", "name email")
      .populate("product", "name images")
      .populate("variant", "label sku");

    // If approved or completed, restock returned quantity
    if (["approved", "completed"].includes(updateData.status)) {
      try {
        if (refund.variant) {
          await Variant.findByIdAndUpdate(refund.variant, {
            $inc: { stock: refund.quantity },
            $set: { isOutOfStock: false, updatedAt: new Date() },
          });
        }
        // Optionally: if product-level stock exists, handle similarly
      } catch (e) {
        console.error("Failed to restock for refund:", e);
      }
    }

    // Write analytics log
    try {
      await AnalyticsLog.create({
        type: "refund",
        action: updateData.status,
        entity: "Refund",
        entityId: id,
        actor: session.user.id,
        amount: refund.amount,
        meta: {
          order: String(refund.order),
          user: String(refund.user),
          product: String(refund.product),
          variant: refund.variant ? String(refund.variant) : null,
          quantity: refund.quantity,
          refundMethod: updateData.refundMethod || refund.refundMethod,
        },
      });
    } catch (e) {
      console.error("Failed to log analytics for refund update:", e);
    }

    return NextResponse.json({
      success: true,
      refund: updatedRefund,
    });
  } catch (error) {
    console.error("Error updating refund:", error);
    return NextResponse.json(
      { error: "Failed to update refund" },
      { status: 500 }
    );
  }
}

// POST - Create refund (admin can generate refunds)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const parsed = RefundZodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.message },
        { status: 400 }
      );
    }

    // Optional: verify order/product/variant relations
    const order = await Order.findById(parsed.data.order).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const created = await (
      await Refund.create(parsed.data)
    ).populate([
      { path: "order", select: "orderId refId" },
      { path: "user", select: "name email" },
      { path: "product", select: "name images" },
      { path: "variant", select: "label sku" },
    ]);

    // If status is approved or completed at creation, restock now
    if (["approved", "completed"].includes((created as any).status)) {
      try {
        if ((created as any).variant) {
          await Variant.findByIdAndUpdate((created as any).variant, {
            $inc: { stock: (created as any).quantity },
            $set: { isOutOfStock: false, updatedAt: new Date() },
          });
        } else if ((created as any).product) {
          await Product.findByIdAndUpdate((created as any).product, {
            $inc: { stock: (created as any).quantity },
            $set: { isOutOfStock: false, updatedAt: new Date() },
          });
        }
      } catch (e) {
        console.error("Failed to restock for created refund:", e);
      }
    }

    // Log analytics for admin-created refund
    try {
      await AnalyticsLog.create({
        type: "refund",
        action: "created",
        entity: "Refund",
        entityId: String((created as any)._id),
        actor: session.user.id,
        amount: (created as any).amount,
        meta: {
          order: String((created as any).order?._id || parsed.data.order),
          user: String((created as any).user?._id || parsed.data.user),
          product: String((created as any).product?._id || parsed.data.product),
          variant: (created as any).variant
            ? String((created as any).variant._id)
            : null,
          quantity: (created as any).quantity,
          status: (created as any).status,
          reason: (created as any).reason,
        },
      });
    } catch (e) {
      console.error("Failed to log analytics for admin-created refund:", e);
    }

    return NextResponse.json({ success: true, refund: created });
  } catch (error) {
    console.error("Error creating refund:", error);
    return NextResponse.json(
      { error: "Failed to create refund" },
      { status: 500 }
    );
  }
}
