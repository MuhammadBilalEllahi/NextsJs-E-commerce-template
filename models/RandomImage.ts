import mongoose, { Document, Schema } from "mongoose";

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
      ref: "User",
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

export default mongoose.models.RandomImage ||
  mongoose.model<RandomImageDocument>("RandomImage", RandomImageSchema);
