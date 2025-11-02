import { NextRequest, NextResponse } from "next/server";
import FAQ from "@/models/FAQ";
import dbConnect from "@/database/mongodb";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    
    let query: any = { isActive: true };
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      faqs
    });
  } catch (error: any) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}


