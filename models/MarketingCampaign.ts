import mongoose, { Schema, Model } from "mongoose";

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
      ref: "User",
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
  mongoose.models.MarketingCampaign ||
  mongoose.model<MarketingCampaignDocument>(
    "MarketingCampaign",
    MarketingCampaignSchema
  );

export default MarketingCampaign;

