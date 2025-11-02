import { NextRequest, NextResponse } from "next/server";
import { getAllGroceryProducts } from "@/database/data-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");

    const data = await getAllGroceryProducts(limit, page);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching grocery products:", error);
    return NextResponse.json(
      { error: "Failed to fetch grocery products" },
      { status: 500 }
    );
  }
}
