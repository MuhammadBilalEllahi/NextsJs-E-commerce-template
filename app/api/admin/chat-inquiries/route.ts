import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import ChatInquiry from "@/models/ChatInquiry";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import chatBus from "@/lib/realtime/chatBus";

// GET - Fetch all chat inquiries for admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const assignedTo = searchParams.get("assignedTo");

    const query: any = { isActive: true };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    const total = await ChatInquiry.countDocuments(query);
    const inquiries = await ChatInquiry.find(query)
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get statistics
    const stats = await ChatInquiry.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        total: 0,
        open: 0,
        pending: 0,
        closed: 0,
        resolved: 0,
        high: 0,
        urgent: 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching chat inquiries:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// POST - Send admin reply
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { inquiryId, message, status, priority, assignedTo, tags } = body;

    if (!inquiryId || !message) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID and message are required" },
        { status: 400 }
      );
    }

    const inquiry = await ChatInquiry.findById(inquiryId);
    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Add admin message
    const newMessage = {
      sender: "admin" as const,
      message,
      timestamp: new Date(),
      isRead: true,
      metadata: {
        adminId: session.user.id,
        adminName: session.user.name,
      },
    };

    inquiry.messages.push(newMessage);
    inquiry.lastMessageAt = new Date();

    // Update inquiry fields if provided
    if (status) inquiry.status = status;
    if (priority) inquiry.priority = priority;
    if (assignedTo) inquiry.assignedTo = assignedTo;
    if (tags) inquiry.tags = tags;

    await inquiry.save();

    // Broadcast admin reply to the user's session via SSE
    if (inquiry.sessionId) {
      chatBus.emitMessage(inquiry.sessionId, {
        type: "admin_reply",
        message: newMessage,
        meta: {
          status: inquiry.status,
          lastMessageAt: inquiry.lastMessageAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      inquiry: {
        id: inquiry.id,
        status: inquiry.status,
        priority: inquiry.priority,
        lastMessageAt: inquiry.lastMessageAt,
      },
    });
  } catch (error: any) {
    console.error("Error sending admin reply:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to send reply" },
      { status: 500 }
    );
  }
}

// PUT - Update inquiry status/priority/assignment
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { inquiryId, status, priority, assignedTo, tags } = body;

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const inquiry = await ChatInquiry.findById(inquiryId);
    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (status) inquiry.status = status;
    if (priority) inquiry.priority = priority;
    if (assignedTo !== undefined) inquiry.assignedTo = assignedTo;
    if (tags) inquiry.tags = tags;

    await inquiry.save();

    // Optional: broadcast status/priority updates
    if (inquiry.sessionId) {
      chatBus.emitMessage(inquiry.sessionId, {
        type: "inquiry_update",
        meta: {
          status: inquiry.status,
          priority: inquiry.priority,
          lastMessageAt: inquiry.lastMessageAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        status: inquiry.status,
        priority: inquiry.priority,
        assignedTo: inquiry.assignedTo,
        tags: inquiry.tags,
      },
    });
  } catch (error: any) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}

// DELETE - Close/archive inquiry
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const inquiryId = searchParams.get("id");

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const inquiry = await ChatInquiry.findById(inquiryId);
    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    inquiry.isActive = false;
    inquiry.status = "closed";
    await inquiry.save();

    return NextResponse.json({
      success: true,
      message: "Inquiry closed successfully",
    });
  } catch (error: any) {
    console.error("Error closing inquiry:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to close inquiry" },
      { status: 500 }
    );
  }
}
