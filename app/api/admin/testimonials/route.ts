import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Testimonial from "@/models/Testimonial";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all testimonials (admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, testimonials });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { author, quote, isActive } = body;

    await dbConnect();

    const testimonial = await Testimonial.create({
      author,
      quote,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, author, quote, isActive } = body;

    await dbConnect();

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    testimonial.author = author;
    testimonial.quote = quote;
    testimonial.isActive =
      isActive !== undefined ? isActive : testimonial.isActive;

    await testimonial.save();

    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    await dbConnect();

    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial", details: error.message },
      { status: 500 }
    );
  }
}
