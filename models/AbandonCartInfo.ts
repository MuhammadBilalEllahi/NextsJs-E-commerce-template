import mongoose, { Schema, Document } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

const ABANDONED_CART_STATUS = {
  PENDING: "pending",
  ABANDONED: "abandoned",
  CONVERTED: "converted",
  EXPIRED: "expired",
};

export interface AbandonedCartDocument extends mongoose.Document {
  uuidv4: string;
  userId?: mongoose.Types.ObjectId;
  email: string;
  phone?: string;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  cartItems: Array<{
    productVariantId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    qty: number;
  }>;
  status: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const abandonedCartSchema = new mongoose.Schema<AbandonedCartDocument>(
  {
    uuidv4: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: MODELS.USER },
    email: { type: String, required: true },
    phone: { type: String },
    shippingAddress: {
      fullName: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    cartItems: [
      {
        productVariantId: { type: Schema.Types.ObjectId, ref: MODELS.VARIANT },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    status: {
      type: String,
      enum: [
        ABANDONED_CART_STATUS.PENDING,
        ABANDONED_CART_STATUS.ABANDONED,
        ABANDONED_CART_STATUS.CONVERTED,
        ABANDONED_CART_STATUS.EXPIRED,
      ],
      default: ABANDONED_CART_STATUS.PENDING.toString(),
    },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models[MODELS.ABANDONED_CART] ||
  mongoose.model(MODELS.ABANDONED_CART.toString(), abandonedCartSchema);

export const abandonedCartZodSchema = z.object({
  uuidv4: z.string().uuid(),
  userId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid User ID")
    .optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: z
    .object({
      fullName: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  cartItems: z
    .array(
      z.object({
        productVariantId: z
          .string()
          .regex(/^[a-f\d]{24}$/i, "Invalid Variant ID"),
        name: z.string(),
        price: z.number(),
        qty: z.number().int().min(1),
      })
    )
    .default([]),
  status: z
    .enum(["pending", "abandoned", "converted", "expired"])
    .default("pending"),
  expiresAt: z.date().optional(),
  createdAt: z
    .date()
    .default(() => new Date())
    .optional(),
  updatedAt: z
    .date()
    .default(() => new Date())
    .optional(),
});
