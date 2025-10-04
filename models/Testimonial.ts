import mongoose, { Schema, Model } from "mongoose";

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

