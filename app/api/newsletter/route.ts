import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import MarketingEmail from "@/models/MarketingEmail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingEmail = await MarketingEmail.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      if (existingEmail.isActive) {
        return NextResponse.json(
          { success: false, error: "Email already subscribed" },
          { status: 400 }
        );
      } else {
        // Reactivate the email
        existingEmail.isActive = true;
        existingEmail.subscribedAt = new Date();
        existingEmail.unsubscribedAt = undefined;
        await existingEmail.save();

        return NextResponse.json({
          success: true,
          message: "Email resubscribed successfully",
        });
      }
    }

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    // Create new marketing email
    const marketingEmail = new MarketingEmail({
      email: normalizedEmail,
      unsubscribeToken,
      isActive: true,
      subscribedAt: new Date(),
    });

    await marketingEmail.save();

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}

