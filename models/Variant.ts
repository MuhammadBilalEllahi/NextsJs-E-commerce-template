
import mongoose from "mongoose";
import { MODELS } from "@/models/constants";
import { z } from "zod";

// Variant Schema
const VariantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.PRODUCT, required: true },
  sku: { type: String, unique: true },
  label: String, // "500g", "1kg", "2kg"
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [String],

  isActive: {
    type: Boolean,
    default: false
  },
  isOutOfStock: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Zod Validation
export const variantZodSchema = z.object({
  product: z.string().min(1, "Product ID is required"), // ObjectId as string
  sku: z.string().min(1, "SKU is required"),
  label: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
  isOutOfStock: z.boolean().optional(),
  images: z.array(z.string().url()).optional()
});


export default mongoose.models[MODELS.VARIANT] || mongoose.model(MODELS.VARIANT, VariantSchema);