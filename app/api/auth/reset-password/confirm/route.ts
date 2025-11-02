import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/database/mongodb";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";

// POST - Confirm password reset
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the reset token
    const resetToken = await PasswordResetToken.findOne({ token }).populate(
      "userId"
    );

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is valid and not expired
    if (!resetToken.isValid()) {
      return NextResponse.json(
        { error: "Reset token has expired or has already been used" },
        { status: 400 }
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    await User.findByIdAndUpdate(resetToken.userId, {
      passwordHash: hashedPassword,
    });

    // Mark token as used
    await resetToken.markAsUsed();

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
