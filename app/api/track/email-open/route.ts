import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import MarketingEmail from "@/models/MarketingEmail";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaign");
    const emailId = searchParams.get("email");

    if (!campaignId || !emailId) {
      return new Response("Missing parameters", { status: 400 });
    }

    await dbConnect();

    // Update the email tracking for this campaign
    await MarketingEmail.findOneAndUpdate(
      {
        id: emailId,
        "campaigns.campaignId": campaignId,
      },
      {
        $set: {
          "campaigns.$.opened": true,
          "campaigns.$.openedAt": new Date(),
        },
      }
    );

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    return new Response(pixel, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Email open tracking error:", error);
    return new Response("Error", { status: 500 });
  }
}
