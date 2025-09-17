import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import GlobalSettings from "@/models/GlobalSettings";
import { zodGlobalSettingsSchema } from "@/models/GlobalSettings";
import { authOptions } from "@/lib/auth";

// GET - Get global settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let settings = await GlobalSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new GlobalSettings({
        bannerScrollTime: 5000,
        refundSettings: {
          defaultRefundDurationDays: 30,
          maxRefundDurationDays: 90,
          allowUnlimitedRefunds: false,
        },
      });
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Error fetching global settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update global settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Validate the settings data
    const validatedData = zodGlobalSettingsSchema.parse(body);

    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings(validatedData);
    } else {
      Object.assign(settings, validatedData);
    }

    await settings.save();

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Error updating global settings:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
