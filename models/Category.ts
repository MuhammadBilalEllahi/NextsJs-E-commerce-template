import mongoose from "mongoose";
import { z } from "zod";
import { MODELS } from "@/models/constants/constants";

export interface CategoryDocument extends mongoose.Document {
  name: string;
  slug?: string;
  parent?: mongoose.Types.ObjectId | null;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

const CategorySchema = new mongoose.Schema<CategoryDocument>({
  name: { type: String, required: true },
  slug: { type: String, unique: true }, // SEO friendly URL
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.CATEGORY,
    default: null,
  },
  description: String,
  image: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

// Zod validation
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
  parent: z.string().optional().nullable(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export default mongoose.models[MODELS.CATEGORY] ||
  mongoose.model(MODELS.CATEGORY, CategorySchema);
