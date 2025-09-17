import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Review from "@/models/Review";
import dbConnect from "@/database/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    const userId = session.user.id;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: userId, isActive: true })
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ user: userId, isActive: true });

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
        id: review._id,
        product: {
          id: review.product._id,
          name: review.product.name,
          slug: review.product.slug,
          images: review.product.images,
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        isVerified: review.isVerified,
        isEdited: review.isEdited,
        editedAt: review.editedAt,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
