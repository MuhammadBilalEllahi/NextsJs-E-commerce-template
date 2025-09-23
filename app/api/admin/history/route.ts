import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import AnalyticsLog from "@/models/AnalyticsLog";

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
    const type = searchParams.get("type");
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");

    const query: any = {};
    if (type) query.type = type;
    if (action) query.action = action;
    if (entity) query.entity = entity;

    const skip = (page - 1) * limit;
    const logs = await AnalyticsLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await AnalyticsLog.countDocuments(query);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Failed to fetch analytics history:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics history", details: error.message },
      { status: 500 }
    );
  }
}
