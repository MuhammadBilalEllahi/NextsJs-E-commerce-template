import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Blog from "@/models/Blog";

export async function GET() {
  try {
    await dbConnect();
    const blogs = await Blog.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load blogs" },
      { status: 500 }
    );
  }
}

