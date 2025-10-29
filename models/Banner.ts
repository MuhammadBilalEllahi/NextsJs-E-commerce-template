import { MODELS } from "@/models/constants/constants";
import mongoose from "mongoose";
import { z } from "zod";

const Schema = mongoose.Schema;

export interface BannerDocument extends mongoose.Document {
  title?: string;
  description?: string;
  image?: string;
  link?: string;
  isActive: boolean;
  expiresAt?: Date;
  showTitle: boolean;
  showLink: boolean;
  showDescription: boolean;
  mimeType: string;
  timeout: number | null;
}

const BannerSchema = new Schema<BannerDocument>({
  title: { type: String },
  description: { type: String },
  image: { type: String },
  link: { type: String },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  showTitle: { type: Boolean, default: true },
  showLink: { type: Boolean, default: true },
  showDescription: { type: Boolean, default: true },
  mimeType: { type: String, default: "" },
  timeout: { type: Number, default: null }, // Individual banner timeout in milliseconds
});

export const zodBannerSchema = z.object({
  title: z.string().optional(), //.min(1, "Title is required"),
  description: z.string().optional(), //.min(1, "Description is required"),
  image: z.string().min(1, "Image is required"),
  link: z.string().optional(),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(), //.default(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  showTitle: z.boolean().default(false),
  showDescription: z.boolean().default(false),
  showLink: z.boolean().default(false),
  mimeType: z.string().optional(),
  timeout: z.number().optional(), // Individual banner timeout in milliseconds
});

BannerSchema.pre("save", function (next) {
  // if (!this.expiresAt) {
  //     this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  // }
  next();
});

export default mongoose.models[MODELS.BANNER] ||
  mongoose.model(MODELS.BANNER.toString(), BannerSchema);
