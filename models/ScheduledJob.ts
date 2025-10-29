import mongoose, { Schema, Document } from "mongoose";
import { MODELS } from "@/models/constants/constants";

export const SCHEDULE_TYPES = {
  CHECKOUT_COMPLETE: "sendCheckoutCompleteEmail",
};

export interface ScheduledJobDoc extends Document {
  type: string; // e.g. "sendFollowupEmail"
  payload: any; // custom data (orderId, user info, etc.)
  runAt: Date; // when to run
  status: "pending" | "done" | "failed";
}

const ScheduledJobSchema = new Schema(
  {
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    runAt: { type: Date, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models[MODELS.SCHEDULED_JOBS] ||
  mongoose.model<ScheduledJobDoc>(MODELS.SCHEDULED_JOBS, ScheduledJobSchema);
