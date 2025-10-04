import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Blog from "@/models/Blog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploaderFiles } from "@/lib/utils/imageUploader/awsImageUploader";

// GET - Fetch all blogs (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, blogs });
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new blog
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const tags = formData.get("tags") as string;
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File;

    await dbConnect();

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: "Blog with this slug already exists" },
        { status: 400 }
      );
    }

    let imageUrl = "";

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadResults = await uploaderFiles(
          "blogs",
          imageFile,
          slug || Date.now().toString()
        );
        if (uploadResults.length > 0) {
          imageUrl = uploadResults[0].url;
        }
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      image: imageUrl,
      tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
      isActive,
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update blog
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const tags = formData.get("tags") as string;
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File;

    await dbConnect();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if slug already exists (excluding current blog)
    if (slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug, id: { $ne: id } });
      if (existingBlog) {
        return NextResponse.json(
          { error: "Blog with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle image upload if new image provided
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadResults = await uploaderFiles(
          "blogs",
          imageFile,
          slug || blog.id.toString()
        );
        if (uploadResults.length > 0) {
          blog.image = uploadResults[0].url;
        }
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    blog.title = title;
    blog.slug = slug;
    blog.excerpt = excerpt;
    blog.content = content;
    blog.tags = tags ? tags.split(",").map((tag: string) => tag.trim()) : [];
    blog.isActive = isActive;

    await blog.save();

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    await dbConnect();

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog", details: error.message },
      { status: 500 }
    );
  }
}
