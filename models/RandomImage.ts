import mongoose, { Document, Schema } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface RandomImageDocument extends Document {
  name: string;
  url: string;
  category: string;
  tags: string[];
  isActive: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

const RandomImageSchema = new Schema<RandomImageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "spices",
        "cooking-essentials",
        "health-products",
        "rice",
        "staples",
        "lentils",
        "masala-blends",
        "dairy",
        "beverages",
        "flour",
        "south-indian",
        "sweeteners",
        "general",
      ],
      default: "general",
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: MODELS.USER,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
RandomImageSchema.index({ category: 1, isActive: 1 });
RandomImageSchema.index({ tags: 1 });
RandomImageSchema.index({ uploadedBy: 1 });

export default mongoose.models[MODELS.RANDOM_IMAGE] ||
  mongoose.model<RandomImageDocument>(MODELS.RANDOM_IMAGE, RandomImageSchema);

export const randomImageZodSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  category: z
    .enum([
      "spices",
      "cooking-essentials",
      "health-products",
      "rice",
      "staples",
      "lentils",
      "masala-blends",
      "dairy",
      "beverages",
      "flour",
      "south-indian",
      "sweeteners",
      "general",
    ])
    .default("general"),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  uploadedBy: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  uploadedAt: z.date().default(() => new Date()),
});
