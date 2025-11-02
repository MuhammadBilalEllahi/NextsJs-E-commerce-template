import mongoose from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface BrandProductsDocument extends mongoose.Document {
  id: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  productCount: number;
  updatedAt: Date;
}

const BrandProductsSchema = new mongoose.Schema<BrandProductsDocument>({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.BRAND,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PRODUCT,
    },
  ],
  productCount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update productCount when products array changes
BrandProductsSchema.pre("save", function (next) {
  this.productCount = this.products.length;
  this.updatedAt = new Date();
  next();
});

export default mongoose.models[MODELS.BRAND_PRODUCTS] ||
  mongoose.model(MODELS.BRAND_PRODUCTS, BrandProductsSchema);

export const brandProductsZodSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Brand ID"),
  products: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid Product ID"))
    .default([]),
  productCount: z.number().int().nonnegative().default(0),
  updatedAt: z.date().default(() => new Date()),
});
