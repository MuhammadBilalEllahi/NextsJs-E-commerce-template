import mongoose from "mongoose";
import { z } from "zod";
import { MODELS } from "@/models/constants";

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "order_status",
      "order_shipped",
      "order_delivered",
      "order_cancelled",
      "refund_approved",
      "refund_rejected",
      "promotion",
      "general",
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.ORDER },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date },
});

// ZOD Schema
export const NotificationZodSchema = z.object({
  user: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  type: z.enum([
    "order_status",
    "order_shipped",
    "order_delivered",
    "order_cancelled",
    "refund_approved",
    "refund_rejected",
    "promotion",
    "general",
  ]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  isRead: z.boolean().default(false),
  orderId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Order ID")
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  readAt: z.date().optional(),
});

export type NotificationType = z.infer<typeof NotificationZodSchema>;

export default mongoose.models[MODELS.NOTIFICATION] ||
  mongoose.model(MODELS.NOTIFICATION, NotificationSchema);
