import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import Refund from "@/models/Refund";
import { RefundZodSchema } from "@/models/Refund";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth";

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
