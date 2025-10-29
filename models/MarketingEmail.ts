import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "./constants/constants";

export interface MarketingEmailDocument extends mongoose.Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  unsubscribeToken: string;
  campaigns: {
    campaignId: mongoose.Types.ObjectId;
    campaignName: string;
    sent: boolean;
    sentAt?: Date;
    opened?: boolean;
    openedAt?: Date;
    clicked?: boolean;
    clickedAt?: Date;
    bounced?: boolean;
    bouncedAt?: Date;
    bouncedReason?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MarketingEmailSchema = new Schema<MarketingEmailDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
    },
    campaigns: [
      {
        campaignId: {
          type: Schema.Types.ObjectId,
          ref: MODELS.MARKETING_CAMPAIGN,
          required: true,
        },
        campaignName: { type: String, required: true },
        sent: { type: Boolean, default: false },
        sentAt: { type: Date },
        opened: { type: Boolean, default: false },
        openedAt: { type: Date },
        clicked: { type: Boolean, default: false },
        clickedAt: { type: Date },
        bounced: { type: Boolean, default: false },
        bouncedAt: { type: Date },
        bouncedReason: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
MarketingEmailSchema.index({ isActive: 1 });
MarketingEmailSchema.index({ "campaigns.campaignId": 1 });

const MarketingEmail: Model<MarketingEmailDocument> =
  mongoose.models[MODELS.MARKETING_EMAIL] ||
  mongoose.model<MarketingEmailDocument>(
    MODELS.MARKETING_EMAIL,
    MarketingEmailSchema
  );

export default MarketingEmail;
