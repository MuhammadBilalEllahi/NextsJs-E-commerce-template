import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/database/mongodb";
import User from "@/models/User";
import { UserZodSchema } from "@/models/User";
import { authOptions } from "@/lib/auth";

// GET - Get user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { firstName, lastName, phone, city } = body;

    // Validate the update data
    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;

    // Update name field if firstName or lastName is provided
    if (firstName || lastName) {
      const currentUser = await User.findById(session.user.id);
      const currentFirstName = currentUser?.firstName || "";
      const currentLastName = currentUser?.lastName || "";

      const newFirstName =
        firstName !== undefined ? firstName : currentFirstName;
      const newLastName = lastName !== undefined ? lastName : currentLastName;

      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }

    const user = await User.findByIdAndUpdate(session.user.id, updateData, {
      new: true,
    }).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
