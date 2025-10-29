import mongoose from "mongoose";
import { MODELS, ORDER_TYPE } from "@/models/constants/constants";
import { z } from "zod";

export interface ShippingMethodLocation {
  city: string;
  state: string;
  country: string;
  shippingFee: number;
  tcsFee: number;
  estimatedDays: number;
  isAvailable: boolean;
}

export interface ShippingMethodDocument extends mongoose.Document {
  name: string;
  type: string;
  isActive: boolean;
  locations: ShippingMethodLocation[];
  defaultShippingFee: number;
  defaultTcsFee: number;
  defaultEstimatedDays: number;
  freeShippingThreshold: number;
  description?: string;
  restrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShippingMethodSchema = new mongoose.Schema<ShippingMethodDocument>({
  name: { type: String, required: true }, // e.g., "Home Delivery", "TCS"
  type: {
    type: String,
    enum: [ORDER_TYPE.HOME_DELIVERY, ORDER_TYPE.TCS, ORDER_TYPE.PICKUP],
    required: true,
  },
  isActive: { type: Boolean, default: true },

  // Location-based pricing
  locations: [
    {
      city: { type: String, required: true }, // e.g., "Lahore", "Karachi"
      state: { type: String, default: "Punjab" },
      country: { type: String, default: "Pakistan" },
      shippingFee: { type: Number, required: true, default: 0 },
      tcsFee: { type: Number, default: 0 }, // TCS courier charges
      estimatedDays: { type: Number, default: 1 }, // Estimated delivery days
      isAvailable: { type: Boolean, default: true },
    },
  ],

  // Default pricing for unspecified locations
  defaultShippingFee: { type: Number, default: 0 },
  defaultTcsFee: { type: Number, default: 0 },
  defaultEstimatedDays: { type: Number, default: 3 },

  // Minimum order amount for free shipping
  freeShippingThreshold: { type: Number, default: 0 },

  // Additional settings
  description: { type: String },
  restrictions: [String], // e.g., ["No delivery on Sundays", "Cash only"]

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
ShippingMethodSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient location-based queries
ShippingMethodSchema.index({
  "locations.city": 1,
  "locations.state": 1,
  "locations.country": 1,
});
ShippingMethodSchema.index({ type: 1, isActive: 1 });

export default (mongoose.models[MODELS.SHIPPING_METHOD] as any) ||
  mongoose.model(MODELS.SHIPPING_METHOD, ShippingMethodSchema);

export const shippingMethodLocationZod = z.object({
  city: z.string().min(1),
  state: z.string().default("Punjab"),
  country: z.string().default("Pakistan"),
  shippingFee: z.number().nonnegative(),
  tcsFee: z.number().nonnegative().default(0),
  estimatedDays: z.number().int().positive().default(1),
  isAvailable: z.boolean().default(true),
});

export const shippingMethodZodSchema = z.object({
  name: z.string().min(1),
  type: z.enum([ORDER_TYPE.HOME_DELIVERY, ORDER_TYPE.TCS, ORDER_TYPE.PICKUP]),
  isActive: z.boolean().default(true),
  locations: z.array(shippingMethodLocationZod).default([]),
  defaultShippingFee: z.number().nonnegative().default(0),
  defaultTcsFee: z.number().nonnegative().default(0),
  defaultEstimatedDays: z.number().int().positive().default(3),
  freeShippingThreshold: z.number().nonnegative().default(0),
  description: z.string().optional(),
  restrictions: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
