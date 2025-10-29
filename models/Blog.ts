import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface BlogDocument extends mongoose.Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<BlogDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    image: { type: String },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Blog: Model<BlogDocument> =
  mongoose.models[MODELS.BLOG] ||
  mongoose.model<BlogDocument>(MODELS.BLOG, BlogSchema);

export default Blog;

export const blogZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  image: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
