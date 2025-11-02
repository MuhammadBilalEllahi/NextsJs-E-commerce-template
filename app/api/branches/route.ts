import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import Branch from "@/models/Branches";

// GET - Fetch all active branches for public use
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    // Build query for active branches only
    let query: any = { isActive: true };

    // Filter by city if provided
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    // Filter by state if provided
    if (state) {
      query.state = { $regex: state, $options: "i" };
    }

    const branches = await Branch.find(query).sort({ branchNumber: 1 }).lean();

    return NextResponse.json(branches);
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches", details: error.message },
      { status: 500 }
    );
  }
}

