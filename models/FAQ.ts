import mongoose from 'mongoose';
import { z } from "zod";
import { MODELS } from '@/models/constants';

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true, maxlength: 500 },
  answer: { type: String, required: true, maxlength: 2000 },
  category: { type: String, required: true, enum: ['general', 'products', 'shipping', 'returns', 'payment', 'account'] },
  tags: [String], // For search and filtering
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For custom ordering
  viewCount: { type: Number, default: 0 }, // Track popularity
  helpfulCount: { type: Number, default: 0 }, // Track helpfulness // use map?
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance and search
FAQSchema.index({ category: 1, order: 1 });
FAQSchema.index({ tags: 1 });
FAQSchema.index({ isActive: 1 });
FAQSchema.index({ question: 'text', answer: 'text' }); // Text search index

// Zod validation schema
export const faqZodSchema = z.object({
  question: z.string().min(1, "Question is required").max(500, "Question too long"),
  answer: z.string().min(1, "Answer is required").max(2000, "Answer too long"),
  category: z.enum(['general', 'products', 'shipping', 'returns', 'payment', 'account']),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
  viewCount: z.number().optional(),
  helpfulCount: z.number().optional()
});

export default mongoose.models[MODELS.FAQ] || mongoose.model(MODELS.FAQ, FAQSchema);



