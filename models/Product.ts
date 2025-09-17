// models/Item.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { z } from "zod";
import { MODELS } from "@/models/constants";

const ProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  ingredients: String, // New field for ingredients and nutritional info
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  discount: { type: Number, default: 0 }, // percentage
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.CATEGORY }],
  images: [String],

  isFeatured: { type: Boolean, default: false },
  isTopSelling: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSelling: { type: Boolean, default: false },
  isSpecial: { type: Boolean, default: false },

  brand: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.BRAND },

  variants: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.VARIANT }],

  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.REVIEW }],

  ratingAvg: { type: Number, default: 0 }, // aggregate
  reviewCount: { type: Number, default: 0 },

  isActive: {
    type: Boolean,
    default: false,
  },

  isOutOfStock: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Schema validation with Zod
export const productZodSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().optional(),
    description: z.string().optional(),
    ingredients: z.string().optional(), // New field for ingredients
    price: z.number().positive("Price must be greater than 0"),
    stock: z.number().int().nonnegative().optional(), // Made optional - will be validated conditionally
    discount: z.number().min(0).max(100).optional(),
    categories: z.array(z.string()).optional(), // ObjectIds as strings
    images: z.array(z.string().url()).optional(),
    brand: z.string().optional(),
    variants: z
      .array(
        z.object({
          sku: z.string(),
          slug: z.string().optional(),
          label: z.string().optional(),
          price: z.number(),
          stock: z.number().int().nonnegative(),
          discount: z.number().optional(),
        })
      )
      .optional(), // list of Variant objects
    isActive: z.boolean().optional(),
    isOutOfStock: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isTopSelling: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isBestSelling: z.boolean().optional(),
    isSpecial: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If no variants exist, stock is required
      if (!data.variants || data.variants.length === 0) {
        return data.stock !== undefined && data.stock >= 0;
      }
      // If variants exist, stock is optional (variants handle their own stock)
      return true;
    },
    {
      message: "Stock is required when no variants are provided",
      path: ["stock"],
    }
  );

export default mongoose.models[MODELS.PRODUCT] ||
  mongoose.model(MODELS.PRODUCT.toString(), ProductSchema);
