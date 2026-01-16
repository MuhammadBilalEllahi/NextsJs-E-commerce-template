import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/database/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
      .select("-passwordHash")
      .lean();

    if (!user || Array.isArray(user)) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userDoc = user as unknown as {
      _id: mongoose.Types.ObjectId;
      email: string;
      name: string;
      role: string;
    };

    return NextResponse.json({
      success: true,
      user: {
        id: userDoc._id.toString(),
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}