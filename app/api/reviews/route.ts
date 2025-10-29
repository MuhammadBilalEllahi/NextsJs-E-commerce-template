import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { reviewZodSchema } from "@/models/Review";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";
import dbConnect from "@/database/mongodb";
import { ORDER_STATUS } from "@/lib/constants";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

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
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const formData = await req.formData();

    const productId = formData.get("product") as string;
    const rating = parseInt(formData.get("rating") as string);
    const title = formData.get("title") as string;
    const comment = formData.get("comment") as string;
    const reviewId = formData.get("reviewId") as string; // For editing existing review
    const imageFiles = formData.getAll("images") as File[];

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verify user has completed purchase of this product
    const completedOrder = await Order.findOne({
      user: userId,
      status: ORDER_STATUS.DELIVERED,
      "items.product": productId,
    });

    if (!completedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "You must complete a purchase before reviewing this product",
        },
        { status: 403 }
      );
    }

    // Handle image uploads
    let uploadedImages: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      try {
        const uploadResults = await uploaderFiles(
          "reviews",
          imageFiles,
          `${userId}-${productId}`
        );
        uploadedImages = uploadResults.map((result) => result.url);
      } catch (error) {
        console.error("Error uploading images:", error);
        return NextResponse.json(
          { success: false, error: "Failed to upload images" },
          { status: 500 }
        );
      }
    }

    let review;

    if (reviewId) {
      // Update existing review
      const existingReview = await Review.findOne({
        id: reviewId,
        user: userId,
        product: productId,
      });

      if (!existingReview) {
        return NextResponse.json(
          { success: false, error: "Review not found" },
          { status: 404 }
        );
      }

      // Update review
      existingReview.rating = rating;
      existingReview.title = title;
      existingReview.comment = comment;
      existingReview.isEdited = true;
      existingReview.editedAt = new Date();
      existingReview.updatedAt = new Date();

      // Add new images to existing ones
      if (uploadedImages.length > 0) {
        existingReview.images = [
          ...(existingReview.images || []),
          ...uploadedImages,
        ];
      }

      await existingReview.save();
      review = existingReview;
    } else {
      // Check if user already reviewed this product
      const existingReview = await Review.findOne({
        product: productId,
        user: userId,
        isActive: true,
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: "You have already reviewed this product" },
          { status: 400 }
        );
      }

      // Create new review
      const reviewData = {
        product: productId,
        user: userId,
        rating,
        title,
        comment,
        isVerified: true, // Mark as verified since we checked purchase
        images: uploadedImages,
      };

      review = new Review(reviewData);
      await review.save();
    }

    // Populate user info for response
    await review.populate("user", "name");

    return NextResponse.json(
      {
        success: true,
        review: {
          id: review.id,
          user: review.user?.name || "Anonymous",
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images: review.images,
          isVerified: review.isVerified,
          isEdited: review.isEdited,
          editedAt: review.editedAt,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
        message: reviewId
          ? "Review updated successfully"
          : "Review submitted successfully",
      },
      { status: reviewId ? 200 : 201 }
    );
  } catch (error: any) {
    console.error("Error creating/updating review:", error);

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
