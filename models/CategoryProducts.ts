import mongoose from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface CategoryProductsDocument extends mongoose.Document {
  id: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  productCount: number;
  updatedAt: Date;
}

const CategoryProductsSchema = new mongoose.Schema<CategoryProductsDocument>({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.CATEGORY,
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
CategoryProductsSchema.pre("save", function (next) {
  this.productCount = this.products.length;
  this.updatedAt = new Date();
  next();
});

export default mongoose.models[MODELS.CATEGORY_PRODUCTS] ||
  mongoose.model(MODELS.CATEGORY_PRODUCTS.toString(), CategoryProductsSchema);

export const categoryProductsZodSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Category ID"),
  products: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid Product ID"))
    .default([]),
  productCount: z.number().int().nonnegative().default(0),
  updatedAt: z.date().default(() => new Date()),
});
