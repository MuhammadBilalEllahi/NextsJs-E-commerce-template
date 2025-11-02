import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import MarketingEmail from "@/models/MarketingEmail";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unsubscribe token is required" },
        { status: 400 }
      );
    }

    // Find the marketing email by unsubscribe token
    const marketingEmail = await MarketingEmail.findOne({
      unsubscribeToken: token,
    });

    if (!marketingEmail) {
      return NextResponse.json(
        { success: false, error: "Invalid unsubscribe token" },
        { status: 404 }
      );
    }

    if (!marketingEmail.isActive) {
      return NextResponse.json(
        { success: false, error: "Email is already unsubscribed" },
        { status: 400 }
      );
    }

    // Mark as unsubscribed
    await MarketingEmail.findByIdAndUpdate(marketingEmail.id, {
      isActive: false,
      unsubscribedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
