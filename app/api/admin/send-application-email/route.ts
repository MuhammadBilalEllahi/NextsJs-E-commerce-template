import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import { getJobApplicationEmailTemplate } from "@/lib/email-templates/job-application";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      applicantEmail,
      applicantName,
      jobTitle,
      templateType,
      customMessage,
      nextSteps,
      contactEmail,
      contactPhone,
    } = body;

    if (!applicantEmail || !applicantName || !jobTitle || !templateType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailData = {
      applicantName,
      jobTitle,
      companyName: "Dehli Mirch",
      status: templateType,
      customMessage,
      nextSteps,
      contactEmail: contactEmail || "hr@dehlimirch.com",
      contactPhone: contactPhone || "+92-XXX-XXXXXXX",
    };

    const template = getJobApplicationEmailTemplate(emailData, templateType);

    const { data, error } = await resend.emails.send({
      from: "Dehli Mirch <noreply@dehlimirch.com>",
      to: [applicantEmail],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error("Error sending application email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}

