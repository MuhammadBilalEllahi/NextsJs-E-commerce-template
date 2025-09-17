import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import RandomImage from "@/models/RandomImage";
import Product from "@/models/Product";
import Variant from "@/models/Variant";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";

// GET - Fetch all random images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const query: any = { isActive: true };
    if (category && category !== "all") {
      query.category = category;
    }

    console.log("Random images query:", query);

    const images = await RandomImage.find(query)
      .populate("uploadedBy", "name email")
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RandomImage.countDocuments(query);

    console.log(`Found ${images.length} random images (total: ${total})`);

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching random images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Upload new random images
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("images") as File[];
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    await dbConnect();

    const uploadedImages = [];
    const errors = [];

    for (const file of files) {
      try {
        // Upload to AWS S3
        const uploadResults = await uploaderFiles(
          "random-images",
          file,
          session.user.id
        );

        if (uploadResults.length > 0) {
          const imageData = {
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            url: uploadResults[0].url,
            category: category || "general",
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
            uploadedBy: session.user.id,
          };

          const randomImage = await RandomImage.create(imageData);
          uploadedImages.push(randomImage);
        }
      } catch (error: any) {
        errors.push(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: "Images uploaded successfully",
      uploaded: uploadedImages.length,
      errors: errors.length,
      images: uploadedImages,
      errorDetails: errors,
    });
  } catch (error: any) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete random image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const image = await RandomImage.findById(imageId);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await RandomImage.findByIdAndDelete(imageId);

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image", details: error.message },
      { status: 500 }
    );
  }
}
