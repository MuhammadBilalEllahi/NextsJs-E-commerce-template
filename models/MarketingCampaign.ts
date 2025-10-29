import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface MarketingCampaignDocument extends mongoose.Document {
  name: string;
  subject: string;
  content: string;
  template: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "cancelled";
  scheduledAt?: Date;
  sentAt?: Date;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<MarketingCampaignDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      default: "default",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "paused", "cancelled"],
      default: "draft",
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    bouncedCount: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: MODELS.USER,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
MarketingCampaignSchema.index({ status: 1 });
MarketingCampaignSchema.index({ scheduledAt: 1 });
MarketingCampaignSchema.index({ createdBy: 1 });
MarketingCampaignSchema.index({ createdAt: -1 });

const MarketingCampaign: Model<MarketingCampaignDocument> =
  mongoose.models[MODELS.MARKETING_CAMPAIGN] ||
  mongoose.model<MarketingCampaignDocument>(
    MODELS.MARKETING_CAMPAIGN,
    MarketingCampaignSchema
  );

export default MarketingCampaign;

export const marketingCampaignZodSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  template: z.string().default("default"),
  status: z
    .enum(["draft", "scheduled", "sending", "sent", "paused", "cancelled"])
    .default("draft"),
  scheduledAt: z.date().optional(),
  sentAt: z.date().optional(),
  totalRecipients: z.number().int().nonnegative().default(0),
  sentCount: z.number().int().nonnegative().default(0),
  openedCount: z.number().int().nonnegative().default(0),
  clickedCount: z.number().int().nonnegative().default(0),
  bouncedCount: z.number().int().nonnegative().default(0),
  createdBy: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
