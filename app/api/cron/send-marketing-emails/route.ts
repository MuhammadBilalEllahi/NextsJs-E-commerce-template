import { NextResponse } from "next/server";
import dbConnect from "@/database/mongodb";
import MarketingCampaign from "@/models/MarketingCampaign";
import MarketingEmail from "@/models/MarketingEmail";
import { Resend } from "resend";
import { renderTemplate } from "@/lib/email-templates";

// Resend configuration
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    await dbConnect();

    // Find campaigns that are scheduled and ready to send
    const campaignsToSend = await MarketingCampaign.find({
      status: "scheduled",
      scheduledAt: { $lte: new Date() },
    });

    if (campaignsToSend.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No campaigns to send",
        processed: 0,
      });
    }

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const campaign of campaignsToSend) {
      try {
        // Update campaign status to sending
        await MarketingCampaign.findByIdAndUpdate(campaign.id, {
          status: "sending",
        });

        // Get all active marketing emails
        const marketingEmails = await MarketingEmail.find({ isActive: true });

        // Filter out emails that have already received this campaign
        const emailsToSend = marketingEmails.filter(
          (email) =>
            !email.campaigns.some(
              (c) => c.campaignId.toString() === (campaign as any).id.toString()
            )
        );

        console.debug(
          `Sending campaign "${campaign.name}" to ${emailsToSend.length} recipients`
        );

        let sentCount = 0;
        let errorCount = 0;

        // Send emails in batches to avoid overwhelming the SMTP server
        const batchSize = 10;
        for (let i = 0; i < emailsToSend.length; i += batchSize) {
          const batch = emailsToSend.slice(i, i + batchSize);

          const emailPromises = batch.map(async (marketingEmail) => {
            try {
              const emailContent = generateEmailContent(
                campaign,
                marketingEmail
              );

              await resend.emails.send({
                from: "Dehli Mirch <noreply@socian.app>",
                to: marketingEmail.email,
                subject: campaign.subject,
                html: emailContent.html,
                text: emailContent.text,
                headers: {
                  "List-Unsubscribe": `<${
                    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
                  }/unsubscribe?token=${marketingEmail.unsubscribeToken}>`,
                  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                },
              });

              // Update marketing email with campaign tracking
              await MarketingEmail.findByIdAndUpdate(marketingEmail.id, {
                $push: {
                  campaigns: {
                    campaignId: (campaign as any).id,
                    campaignName: campaign.name,
                    sent: true,
                    sentAt: new Date(),
                  },
                },
              });

              sentCount++;
              return { success: true, email: marketingEmail.email };
            } catch (error) {
              console.error(
                `Error sending email to ${marketingEmail.email}:`,
                error
              );
              errorCount++;

              // Mark as bounced
              await MarketingEmail.findByIdAndUpdate(marketingEmail.id, {
                $push: {
                  campaigns: {
                    campaignId: (campaign as any).id,
                    campaignName: campaign.name,
                    sent: false,
                    bounced: true,
                    bouncedAt: new Date(),
                    bouncedReason:
                      error instanceof Error ? error.message : "Unknown error",
                  },
                },
              });

              return {
                success: false,
                email: marketingEmail.email,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }
          });

          await Promise.all(emailPromises);

          // Add delay between batches to avoid rate limiting
          if (i + batchSize < emailsToSend.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // Update campaign with final stats
        await MarketingCampaign.findByIdAndUpdate(campaign.id, {
          status: "sent",
          sentAt: new Date(),
          sentCount: sentCount,
          bouncedCount: errorCount,
        });

        totalProcessed += sentCount;
        totalErrors += errorCount;

        console.debug(
          `Campaign "${campaign.name}" completed: ${sentCount} sent, ${errorCount} errors`
        );
      } catch (error) {
        console.error(`Error processing campaign ${campaign.id}:`, error);

        // Mark campaign as failed
        await MarketingCampaign.findByIdAndUpdate(campaign.id, {
          status: "cancelled",
        });

        totalErrors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} emails with ${totalErrors} errors`,
      processed: totalProcessed,
      errors: totalErrors,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process marketing emails" },
      { status: 500 }
    );
  }
}

function generateEmailContent(campaign: any, marketingEmail: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${marketingEmail.unsubscribeToken}`;

  // Add tracking pixel for opens
  const trackingPixel = `<img src="${baseUrl}/api/track/email-open?campaign=${campaign.id}&email=${marketingEmail.id}" width="1" height="1" style="display:none;" />`;

  // Wrap links for click tracking
  const contentWithTracking = campaign.content.replace(
    /<a\s+href="([^"]+)"/g,
    `<a href="${baseUrl}/api/track/email-click?campaign=${campaign.id}&email=${marketingEmail.id}&url=$1"`
  );

  // Use the email template system
  const html =
    renderTemplate(campaign.template || "default", {
      content: contentWithTracking,
      unsubscribeUrl,
      baseUrl,
      year: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString(),
    }) + trackingPixel;

  // Generate plain text version
  const text = campaign.content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

  return { html, text };
}
