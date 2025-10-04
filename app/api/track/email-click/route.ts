import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import MarketingEmail from "@/models/MarketingEmail";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaign");
    const emailId = searchParams.get("email");
    const url = searchParams.get("url");

    if (!campaignId || !emailId || !url) {
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
          "campaigns.$.clicked": true,
          "campaigns.$.clickedAt": new Date(),
        },
      }
    );

    // Decode the URL and redirect
    const decodedUrl = decodeURIComponent(url);

    return NextResponse.redirect(decodedUrl);
  } catch (error) {
    console.error("Email click tracking error:", error);
    return new Response("Error", { status: 500 });
  }
}
