import mongoose from 'mongoose';
import { z } from "zod";
import { MODELS } from '@/models/constants';

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.PRODUCT, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.USER, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  isVerified: { type: Boolean, default: false }, // Verified purchase
  isHelpful: { type: Number, default: 0 }, // Helpful votes count
  images: [String], // Optional review images
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1 });

// Zod validation schema
export const reviewZodSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  user: z.string().min(1, "User ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().min(1, "Review title is required").max(100, "Title too long"),
  comment: z.string().min(1, "Review comment is required").max(1000, "Comment too long"),
  isVerified: z.boolean().optional(),
  isHelpful: z.number().optional(),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional()
});

export default mongoose.models[MODELS.REVIEW] || mongoose.model(MODELS.REVIEW, ReviewSchema);





