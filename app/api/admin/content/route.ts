import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import ContentPage from "@/models/ContentPage";

// GET - Fetch all content pages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const contentPages = await ContentPage.find()
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(contentPages);
  } catch (error: any) {
    console.error("Error fetching content pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch content pages", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new content page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      isActive,
      parentSlug,
      sortOrder,
      showInFooter,
      showInHeader,
    } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if slug already exists
    const existingPage = await ContentPage.findOne({ slug });
    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    const contentPage = await ContentPage.create({
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      isActive: isActive !== undefined ? isActive : true,
      parentSlug: parentSlug || null,
      sortOrder: sortOrder || 0,
      showInFooter: showInFooter || false,
      showInHeader: showInHeader || false,
    });

    return NextResponse.json({
      message: "Content page created successfully",
      contentPage,
    });
  } catch (error: any) {
    console.error("Error creating content page:", error);
    return NextResponse.json(
      { error: "Failed to create content page", details: error.message },
      { status: 500 }
    );
  }
}
