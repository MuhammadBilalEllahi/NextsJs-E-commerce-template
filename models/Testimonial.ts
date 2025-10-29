import mongoose, { Schema, Model } from "mongoose";
import { z } from "zod";

export interface TestimonialDocument extends mongoose.Document {
  author: string;
  quote: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<TestimonialDocument>(
  {
    author: { type: String, required: true, trim: true },
    quote: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Testimonial: Model<TestimonialDocument> =
  mongoose.models.Testimonial ||
  mongoose.model<TestimonialDocument>("Testimonial", TestimonialSchema);

export default Testimonial;

export const testimonialZodSchema = z.object({
  author: z.string().min(1),
  quote: z.string().min(1),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
