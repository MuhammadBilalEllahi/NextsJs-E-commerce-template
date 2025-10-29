import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "@/models/constants/constants";

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
