import mongoose from "mongoose";
import { z } from "zod";
import { MODELS } from "@/models/constants/constants";

const RefundSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.ORDER,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PRODUCT,
    required: true,
  },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.VARIANT },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "processing", "completed"],
    default: "pending",
  },
  adminNotes: { type: String },
  customerNotes: { type: String },
  refundMethod: {
    type: String,
    enum: ["original_payment", "store_credit", "bank_transfer"],
    default: "original_payment",
  },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.USER },
  processedAt: { type: Date },
  refundDurationLimit: { type: Number }, // Days for refund eligibility for this product
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RefundSchema.index({ user: 1, order: 1, product: 1 });
RefundSchema.index({ status: 1, createdAt: -1 });

// ZOD Schema
export const RefundZodSchema = z.object({
  order: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Order ID"),
  user: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  product: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Product ID"),
  variant: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Variant ID")
    .optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  amount: z.number().min(0, "Amount must be positive"),
  reason: z.string().min(1, "Reason is required"),
  status: z
    .enum(["pending", "approved", "rejected", "processing", "completed"])
    .default("pending"),
  adminNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  refundMethod: z
    .enum(["original_payment", "store_credit", "bank_transfer"])
    .default("original_payment"),
  processedBy: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid User ID")
    .optional(),
  processedAt: z.date().optional(),
  refundDurationLimit: z.number().int().min(0).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type RefundType = z.infer<typeof RefundZodSchema>;

export default mongoose.models[MODELS.REFUND] ||
  mongoose.model(MODELS.REFUND, RefundSchema);
