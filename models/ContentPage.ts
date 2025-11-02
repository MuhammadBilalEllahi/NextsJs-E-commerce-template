import mongoose, { Document, Schema } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface IContentPage extends Document {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  parentSlug?: string; // For hierarchical navigation
  sortOrder: number; // For ordering within parent
  showInFooter: boolean; // Whether to show in footer navigation
  showInHeader: boolean; // Whether to show in header navigation
  createdAt: Date;
  updatedAt: Date;
}

const ContentPageSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentSlug: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    showInFooter: {
      type: Boolean,
      default: false,
    },
    showInHeader: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure slug is unique
// ContentPageSchema.index({ slug: 1 }, { unique: true }); // Removed - already unique in schema

export default mongoose.models[MODELS.CONTENT_PAGE] ||
  mongoose.model<IContentPage>(MODELS.CONTENT_PAGE, ContentPageSchema);

export const contentPageZodSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  parentSlug: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  showInFooter: z.boolean().default(false),
  showInHeader: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
