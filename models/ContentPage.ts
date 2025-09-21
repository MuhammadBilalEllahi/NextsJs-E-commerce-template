import mongoose, { Document, Schema } from "mongoose";
import { MODELS } from "./constants";

export interface IContentPage extends Document {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContentPageSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

// Ensure slug is unique
ContentPageSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models[MODELS.CONTENT_PAGE] ||
  mongoose.model<IContentPage>(MODELS.CONTENT_PAGE, ContentPageSchema);
