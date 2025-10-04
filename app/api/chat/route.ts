import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import ChatInquiry from "@/models/ChatInquiry";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import chatBus from "@/lib/realtime/chatBus";

// GET - Fetch chat history for a session
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Find or create chat inquiry
    let inquiry = await ChatInquiry.findOne({
      sessionId,
      isActive: true,
    }).populate("userId", "name email");

    if (!inquiry) {
      // Create new inquiry for this session
      inquiry = await ChatInquiry.create({
        sessionId,
        status: "open",
        priority: "medium",
        category: "general",
        messages: [],
        lastMessageAt: new Date(),
        tags: [],
        metadata: {
          userAgent: req.headers.get("user-agent") || "",
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "",
        },
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        sessionId: inquiry.sessionId,
        userId: inquiry.userId,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        status: inquiry.status,
        priority: inquiry.priority,
        category: inquiry.category,
        messages: inquiry.messages,
        lastMessageAt: inquiry.lastMessageAt,
        assignedTo: inquiry.assignedTo,
        tags: inquiry.tags,
        isActive: inquiry.isActive,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching chat inquiry:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { sessionId, message, name, email, phone, category } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { success: false, error: "Session ID and message are required" },
        { status: 400 }
      );
    }

    // Find existing inquiry or create new one
    let inquiry = await ChatInquiry.findOne({
      sessionId,
      isActive: true,
    });

    if (!inquiry) {
      // Create new inquiry
      inquiry = await ChatInquiry.create({
        sessionId,
        userId: session?.user?.id as any,
        name: name || session?.user?.name,
        email: email || session?.user?.email,
        phone,
        status: "open",
        priority: "medium",
        category: category || "general",
        messages: [],
        lastMessageAt: new Date(),
        tags: [],
        metadata: {
          userAgent: req.headers.get("user-agent") || "",
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "",
          currentPage: req.headers.get("referer") || "",
        },
        isActive: true,
      });
    } else {
      // Update user info if provided and not already set
      if (name && !inquiry.name) inquiry.name = name;
      if (email && !inquiry.email) inquiry.email = email;
      if (phone && !inquiry.phone) inquiry.phone = phone;
      if (session?.user?.id && !inquiry.userId)
        inquiry.userId = session.user.id as any;
    }

    // Add new message
    const newMessage = {
      sender: "user" as const,
      message,
      timestamp: new Date(),
      isRead: false,
      metadata: {
        userAgent: req.headers.get("user-agent") || "",
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "",
        sessionId,
      },
    };

    inquiry.messages.push(newMessage);
    inquiry.lastMessageAt = new Date();

    if (inquiry.status === "closed") {
      inquiry.status = "open"; // Reopen if user sends a new message
    }

    await inquiry.save();

    // Push real-time update to subscribers (SSE)
    chatBus.emitMessage(sessionId, {
      type: "user_message",
      message: newMessage,
      meta: {
        status: inquiry.status,
        lastMessageAt: inquiry.lastMessageAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      inquiry: {
        id: inquiry.id,
        sessionId: inquiry.sessionId,
        status: inquiry.status,
        lastMessageAt: inquiry.lastMessageAt,
      },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

// PUT - Update inquiry (for authenticated users to update their info)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    const body = await req.json();
    const { sessionId, name, email, phone, category } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    const inquiry = await ChatInquiry.findOne({
      sessionId,
      isActive: true,
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: "Chat inquiry not found" },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (name) inquiry.name = name;
    if (email) inquiry.email = email;
    if (phone) inquiry.phone = phone;
    if (category) inquiry.category = category;
    if (session?.user?.id) inquiry.userId = session.user.id as any;

    await inquiry.save();

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        sessionId: inquiry.sessionId,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        category: inquiry.category,
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
