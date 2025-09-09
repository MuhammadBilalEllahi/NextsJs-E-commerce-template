import dbConnect from "@/database/mongodb";
import ScheduledJob, { SCHEDULE_TYPES } from "@/models/ScheduledJob";
import { Resend } from 'resend'
import { generateOrderConfirmationEmail, OrderEmailData } from "@/lib/email-templates";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse(JSON.stringify("Unauthorized"), { status: 401 });
  }

  await dbConnect();

  const now = new Date();

  // Find pending jobs whose time has come
  const jobs = await ScheduledJob.find({
    status: "pending",
    runAt: { $lte: now },
  });

  for (const job of jobs) {
    try {
      switch (job.type) {
        case SCHEDULE_TYPES.CHECKOUT_COMPLETE:
          const emailData: OrderEmailData = job.payload;
          await resend.emails.send({
            from: "Dehli Mirch <orders@socian.app>",
            to: emailData.email,
            subject: `Order Confirmation #${emailData.orderId} - Dehli Mirch`,
            html: generateOrderConfirmationEmail(emailData)
          });
          console.log("Sending checkout complete email for", emailData.orderId);
          break;
      
        default:
          break;
      }
     

      job.status = "done";
      await job.save();
    } catch (err) {
      job.status = "failed";
      await job.save();
    }
  }

  return NextResponse.json({ processed: jobs.length });
}
