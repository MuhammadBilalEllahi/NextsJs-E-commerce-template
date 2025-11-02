// models/Cart.ts
import mongoose from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { CURRENCY } from "@/lib/constants";
import { z } from "zod";

export interface CartItemDocument extends mongoose.Document {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
  label?: string;
  sku?: string;
  title: string;
  slug: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new mongoose.Schema<CartItemDocument>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PRODUCT,
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.VARIANT,
      required: false,
    }, // Optional for products without variants
    quantity: { type: Number, required: true, min: 1 },
    // Snapshot for UX: price shown in cart UI (not final)
    priceSnapshot: { type: Number, required: true }, // according to qty
    label: String, // e.g. "1kg" - for variants only
    sku: String, // for variants only
    title: { type: String, required: true }, // Product title (with variant info if applicable)
    slug: { type: String, required: true }, // Product slug
    image: String, // Product or variant image
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { id: false }
);

export interface CartDocument extends mongoose.Document {
  user?: mongoose.Types.ObjectId | null;
  uuidv4?: string | null;
  items: Array<CartItemDocument>;
  currency: string;
  updatedAt: Date;
  version: number;
}

const CartSchema = new mongoose.Schema<CartDocument>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    default: null,
  },
  uuidv4: { type: String, default: null }, // for guests
  items: [CartItemSchema],
  currency: { type: String, default: CURRENCY.SYMBOL },
  updatedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }, // For optimistic concurrency control
});

// Unique either on user or on session
CartSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);
CartSchema.index(
  { uuidv4: 1 },
  { unique: true, partialFilterExpression: { uuidv4: { $type: "string" } } }
);

export default mongoose.models[MODELS.CART] ||
  mongoose.model<CartDocument>(MODELS.CART, CartSchema);

export const cartItemZodSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Product ID"),
  variantId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Variant ID")
    .optional(),
  quantity: z.number().int().min(1),
  priceSnapshot: z.number(),
  label: z.string().optional(),
  sku: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const cartZodSchema = z.object({
  user: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid User ID")
    .nullable()
    .optional(),
  uuidv4: z.string().nullable().optional(),
  items: z.array(cartItemZodSchema).default([]),
  currency: z.string().default(CURRENCY.SYMBOL),
  updatedAt: z.date().default(() => new Date()),
  version: z.number().int().default(1),
});
