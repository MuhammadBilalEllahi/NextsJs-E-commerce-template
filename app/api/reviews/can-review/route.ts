import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import Review from "@/models/Review";
import dbConnect from "@/database/mongodb";
import { ORDER_STATUS } from "@/models/constants";

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
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
      isActive: true,
    });

    if (existingReview) {
      return NextResponse.json({
        success: true,
        canReview: true,
        hasReviewed: true,
        existingReview: {
          id: existingReview._id,
          rating: existingReview.rating,
          title: existingReview.title,
          comment: existingReview.comment,
          images: existingReview.images,
          isEdited: existingReview.isEdited,
          editedAt: existingReview.editedAt,
          createdAt: existingReview.createdAt,
        },
      });
    }

    // Check if user has completed purchase of this product
    const completedOrder = await Order.findOne({
      user: userId,
      status: ORDER_STATUS.DELIVERED,
      "items.product": productId,
    });

    const canReview = !!completedOrder;

    return NextResponse.json({
      success: true,
      canReview,
      hasReviewed: false,
      hasCompletedPurchase: canReview,
    });
  } catch (error: any) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}
