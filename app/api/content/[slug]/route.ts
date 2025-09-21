import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import ContentPage from "@/models/ContentPage";

// GET - Fetch single content page (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();

    const contentPage = await ContentPage.findOne({
      slug: params.slug,
      isActive: true,
    }).lean();

    if (!contentPage) {
      return NextResponse.json(
        { error: "Content page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contentPage });
  } catch (error: any) {
    console.error("Error fetching content page:", error);
    return NextResponse.json(
      { error: "Failed to fetch content page", details: error.message },
      { status: 500 }
    );
  }
}
