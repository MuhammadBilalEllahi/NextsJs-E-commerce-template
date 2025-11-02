import { NextRequest, NextResponse } from "next/server";
import { getAllTopSellingProducts } from "@/database/data-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    const data = await getAllTopSellingProducts(limit, page);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching top selling products:", error);
    return NextResponse.json(
      { error: "Failed to fetch top selling products" },
      { status: 500 }
    );
  }
}
