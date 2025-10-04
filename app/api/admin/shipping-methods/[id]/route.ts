import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import ShippingMethod from "@/models/ShippingMethod";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const method = await ShippingMethod.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!method) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      method: method.id,
    });
  } catch (error) {
    console.error("Error updating shipping method:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update shipping method", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const method = await ShippingMethod.findByIdAndDelete(id);

    if (!method) {
      return NextResponse.json(
        { error: "Shipping method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipping method deleted",
    });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete shipping method", details: errorMessage },
      { status: 500 }
    );
  }
}
