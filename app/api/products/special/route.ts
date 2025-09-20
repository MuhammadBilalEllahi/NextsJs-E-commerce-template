import { NextRequest, NextResponse } from "next/server";
import { getAllSpecialProducts } from "@/database/data-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    const data = await getAllSpecialProducts(limit, page);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching special products:", error);
    return NextResponse.json(
      { error: "Failed to fetch special products" },
      { status: 500 }
    );
  }
}
