import mongoose from "mongoose";
import { MODELS, RESERVATION_STATUS } from "@/models/constants/constants";
import { z } from "zod";

export interface ReservationDocument extends mongoose.Document {
  variant: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | null;
  uuidv4?: string | null;
  quantity: number;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new mongoose.Schema<ReservationDocument>({
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.VARIANT,
    required: true,
  },
  // One actor: either user or session
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    default: null,
  },
  uuidv4: { type: String, default: null },

  quantity: { type: Number, required: true, min: 1 },

  // lifecycle: active -> consumed (order placed) | cancelled (remove from cart) | expired (TTL)
  status: {
    type: String,
    enum: [
      RESERVATION_STATUS.ACTIVE,
      RESERVATION_STATUS.CANCELLED,
      RESERVATION_STATUS.CONSUMED,
    ],
    default: RESERVATION_STATUS.ACTIVE,
  },

  // TTL field; extended (refreshed) when cart is updated
  expiresAt: { type: Date, required: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// One active reservation per actor+variant to keep counts simple
ReservationSchema.index(
  { variant: 1, user: 1, uuidv4: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

// TTL: Mongo will auto-delete expired docs
ReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Analytics helpers
ReservationSchema.index({ variant: 1, status: 1 });

export default mongoose.models[MODELS.RESERVATION] ||
  mongoose.model(MODELS.RESERVATION, ReservationSchema);

export const reservationZodSchema = z.object({
  variant: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Variant ID"),
  user: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid User ID")
    .nullable()
    .optional(),
  uuidv4: z.string().nullable().optional(),
  quantity: z.number().int().min(1),
  status: z
    .enum([
      RESERVATION_STATUS.ACTIVE,
      RESERVATION_STATUS.CANCELLED,
      RESERVATION_STATUS.CONSUMED,
    ])
    .default(RESERVATION_STATUS.ACTIVE),
  expiresAt: z.date(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
