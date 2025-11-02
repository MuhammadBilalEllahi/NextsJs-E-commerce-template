import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import MarketingCampaign from "@/models/MarketingCampaign";
import MarketingEmail from "@/models/MarketingEmail";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const campaigns = await MarketingCampaign.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();

    const { name, subject, content, template, scheduledAt } = body;

    if (!name || !subject || !content) {
      return NextResponse.json(
        { success: false, error: "Name, subject, and content are required" },
        { status: 400 }
      );
    }

    // Get total recipients count
    const totalRecipients = await MarketingEmail.countDocuments({
      isActive: true,
    });

    const campaign = new MarketingCampaign({
      name,
      subject,
      content,
      template: template || "default",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      status: scheduledAt ? "scheduled" : "draft",
      totalRecipients,
      createdBy: session.user.id,
    });

    await campaign.save();

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const campaign = await MarketingCampaign.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("createdBy", "name email");

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const campaign = await MarketingCampaign.findByIdAndDelete(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 400 }
    );
  }
}
