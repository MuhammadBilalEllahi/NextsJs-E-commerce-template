import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface CareerDocument extends mongoose.Document {
  title: string;
  location: string;
  type: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema = new Schema<CareerDocument>(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Career: Model<CareerDocument> =
  mongoose.models[MODELS.CAREER] ||
  mongoose.model<CareerDocument>(MODELS.CAREER, CareerSchema);

export default Career;

export const careerZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
