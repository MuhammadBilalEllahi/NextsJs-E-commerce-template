import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import User from "@/models/User";
import PasswordResetToken, {
  PasswordResetTokenModel,
} from "@/models/PasswordResetToken";
import { Resend } from "resend";
import { generatePasswordResetEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Create password reset token
    const resetToken = await (
      PasswordResetToken as PasswordResetTokenModel
    ).createForUser(user.id);

    // Generate reset URL
    const baseUrl = process.env.WEBSITE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/account/reset-password?token=${resetToken.token}`;

    // Send password reset email
    try {
      await resend.emails.send({
        from: "Dehli Mirch <noreply@socian.app>",
        to: email,
        subject: "Reset Your Password - Dehli Mirch",
        html: generatePasswordResetEmail({
          userName: user.name,
          resetUrl,
          expiresIn: "5 minutes",
        }),
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Still return success to not reveal email issues
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
