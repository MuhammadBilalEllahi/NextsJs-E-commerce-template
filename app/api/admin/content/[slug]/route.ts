import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import ContentPage from "@/models/ContentPage";

// GET - Fetch single content page
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

    return NextResponse.json(contentPage);
  } catch (error: any) {
    console.error("Error fetching content page:", error);
    return NextResponse.json(
      { error: "Failed to fetch content page", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update content page
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log("PUT request received for slug:", params.slug);

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session || session.user.role !== "admin") {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const { title, content, metaTitle, metaDescription, isActive } = body;

    if (!title || !content) {
      console.log("Missing required fields:", {
        title: !!title,
        content: !!content,
      });
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("Database connected");

    const contentPage = await ContentPage.findOneAndUpdate(
      { slug: params.slug },
      {
        title,
        content,
        metaTitle,
        metaDescription,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true }
    );

    console.log("Updated content page:", contentPage);

    if (!contentPage) {
      console.log("Content page not found for slug:", params.slug);
      return NextResponse.json(
        { error: "Content page not found" },
        { status: 404 }
      );
    }

    console.log("Successfully updated content page");
    return NextResponse.json({
      message: "Content page updated successfully",
      contentPage,
    });
  } catch (error: any) {
    console.error("Error updating content page:", error);
    return NextResponse.json(
      { error: "Failed to update content page", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete content page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const contentPage = await ContentPage.findOneAndDelete({
      slug: params.slug,
    });

    if (!contentPage) {
      return NextResponse.json(
        { error: "Content page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Content page deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting content page:", error);
    return NextResponse.json(
      { error: "Failed to delete content page", details: error.message },
      { status: 500 }
    );
  }
}
