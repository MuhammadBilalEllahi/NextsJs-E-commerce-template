import mongoose from "mongoose";
import {z} from "zod";
import { MODELS } from "@/models/constants";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true }, // SEO friendly URL
  parent: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.CATEGORY, default: null },
  description: String,
  image: String,
  isActive: {
        type: Boolean,
        default: false
    },
  createdAt: { type: Date, default: Date.now }
});


// Zod validation
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
  parent: z.string().optional().nullable(),
  description: z.string().optional(),
  image: z.string().optional()
});

export default mongoose.models[MODELS.CATEGORY] || mongoose.model(MODELS.CATEGORY, CategorySchema)