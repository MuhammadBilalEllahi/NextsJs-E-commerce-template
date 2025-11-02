import mongoose from "mongoose";
import { z } from "zod";
import { MODELS } from "@/models/constants/constants";

export interface WishlistDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  sessionId: string;
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  addedAt: Date;
  isActive: boolean;
}
const WishlistSchema = new mongoose.Schema<WishlistDocument>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    default: null,
  },
  sessionId: { type: String, default: null }, // for guest users
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.PRODUCT,
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.VARIANT,
    default: null,
  },
  addedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

// Ensure unique combination of user/session and product
WishlistSchema.index(
  { user: 1, product: 1 },
  { unique: true, partialFilterExpression: { user: { $type: "objectId" } } }
);
WishlistSchema.index(
  { sessionId: 1, product: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $type: "string" } } }
);

// Zod validation schema
export const wishlistZodSchema = z.object({
  user: z.string().optional(),
  sessionId: z.string().optional(),
  product: z.string().min(1, "Product ID is required"),
  variant: z.string().optional(),
  isActive: z.boolean().optional(),
});

export default mongoose.models[MODELS.WISHLIST] ||
  mongoose.model<WishlistDocument>(MODELS.WISHLIST, WishlistSchema);
