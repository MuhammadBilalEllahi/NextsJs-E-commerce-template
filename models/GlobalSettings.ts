import { MODELS } from "@/models/constants/constants";
import mongoose from "mongoose";
import { z } from "zod";

const Schema = mongoose.Schema;

export interface GlobalSettingsDocument extends mongoose.Document {
  bannerScrollTime: number;
  refundSettings?: {
    defaultRefundDurationDays: number;
    maxRefundDurationDays: number;
    allowUnlimitedRefunds: boolean;
  };
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema<GlobalSettingsDocument>({
  bannerScrollTime: { type: Number, default: 5000 }, // Overall banner scroll time in milliseconds
  refundSettings: {
    defaultRefundDurationDays: { type: Number, default: 30 }, // Default refund period in days
    maxRefundDurationDays: { type: Number, default: 90 }, // Maximum refund period allowed
    allowUnlimitedRefunds: { type: Boolean, default: false }, // Allow unlimited refund period
  },
  updatedAt: { type: Date, default: Date.now },
});

export const zodGlobalSettingsSchema = z.object({
  bannerScrollTime: z.number().min(1000).max(30000).default(5000), // Between 1-30 seconds
  refundSettings: z
    .object({
      defaultRefundDurationDays: z.number().min(1).max(365).default(30),
      maxRefundDurationDays: z.number().min(1).max(365).default(90),
      allowUnlimitedRefunds: z.boolean().default(false),
    })
    .optional(),
});

GlobalSettingsSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models[MODELS.GLOBAL_SETTINGS] ||
  mongoose.model(MODELS.GLOBAL_SETTINGS, GlobalSettingsSchema);
