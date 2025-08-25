import { NextRequest, NextResponse } from "next/server";
import Review from "@/models/Review";
import { reviewZodSchema } from "@/models/Review";
import dbConnect from "@/lib/mongodb";


export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    
    let query: any = { isActive: true };
    
    if (productId) {
      query.product = productId;
    }
    
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find(query)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Review.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate input
    const validatedData = reviewZodSchema.parse(body);
    
    // Create review
    const review = new Review(validatedData);
    await review.save();
    
    // Populate user info for response
    await review.populate("user", "name");
    
    return NextResponse.json({
      success: true,
      review,
      message: "Review submitted successfully"
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);
    
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

