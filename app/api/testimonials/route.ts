import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Testimonial from "@/models/Testimonial";

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to load testimonials",
      },
      { status: 500 }
    );
  }
}
