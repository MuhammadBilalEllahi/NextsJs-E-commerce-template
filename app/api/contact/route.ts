import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, phone } = await request.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Generate HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission - Dehli Mirch</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%); padding: 32px 24px; text-align: center;">
            <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #ffffff;">Dehli</span> <span style="color: #ffffff;">Mirch</span>
            </div>
            <div style="color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Heat you can taste, tradition you can trust.</div>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px 24px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">New Contact Form Submission 🔥</h1>
            
            <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">Contact Details</h3>
                
                <div style="margin-bottom: 12px;">
                    <strong style="color: #dc2626;">Name:</strong> ${name}
                </div>
                
                <div style="margin-bottom: 12px;">
                    <strong style="color: #dc2626;">Email:</strong> ${email}
                </div>
                
                ${
                  phone
                    ? `<div style="margin-bottom: 12px;">
                    <strong style="color: #dc2626;">Phone:</strong> ${phone}
                </div>`
                    : ""
                }
                
                <div style="margin-bottom: 12px;">
                    <strong style="color: #dc2626;">Subject:</strong> ${subject}
                </div>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="font-size: 18px; font-weight: 600; color: #92400e; margin-bottom: 12px;">Message</h3>
                <p style="font-size: 16px; color: #92400e; margin: 0; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="font-size: 14px; color: #0c4a6e; margin: 0; line-height: 1.5;">
                    <strong>📧 Reply directly to:</strong> ${email}<br>
                    <strong>⏰ Received:</strong> ${new Date().toLocaleString(
                      "en-US",
                      {
                        timeZone: "Asia/Karachi",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">
                <span style="color: #dc2626;">Dehli</span> <span style="color: #16a34a;">Mirch</span>
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Authentic Spices, Pickles, Snacks</div>
            <div style="font-size: 12px; color: #9ca3af;">
                This email was sent from the contact form on your website.
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Send email to admin
    await resend.emails.send({
      from: "Dehli Mirch Contact Form <contact@socian.app>",
      to: process.env.ADMIN_EMAIL || "admin@dehlimirchmasalajaat.com",
      subject: `🔥 New Contact: ${subject} - Dehli Mirch`,
      html: emailHtml,
      replyTo: email, // Allow admin to reply directly to the customer
    });

    return NextResponse.json({
      message: "Thank you for contacting us! We'll get back to you soon.",
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
