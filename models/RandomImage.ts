import mongoose, { Document, Schema } from "mongoose";
import { MODELS } from "@/models/constants/constants";

export interface RandomImageDocument extends Document {
  name: string;
  url: string;
  category: string;
  tags: string[];
  isActive: boolean;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

const RandomImageSchema = new Schema<RandomImageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "spices",
        "cooking-essentials",
        "health-products",
        "rice",
        "staples",
        "lentils",
        "masala-blends",
        "dairy",
        "beverages",
        "flour",
        "south-indian",
        "sweeteners",
        "general",
      ],
      default: "general",
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: MODELS.USER,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
RandomImageSchema.index({ category: 1, isActive: 1 });
RandomImageSchema.index({ tags: 1 });
RandomImageSchema.index({ uploadedBy: 1 });

export default mongoose.models[MODELS.RANDOM_IMAGE] ||
  mongoose.model<RandomImageDocument>(MODELS.RANDOM_IMAGE, RandomImageSchema);
