import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Career from "@/models/Career";

export async function GET() {
  try {
    await dbConnect();
    const careers = await Career.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, careers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load careers" },
      { status: 500 }
    );
  }
}

