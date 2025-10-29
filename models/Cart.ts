// models/Cart.ts
import mongoose from "mongoose";
import { MODELS } from "@/models/constants";
import { CURRENCY } from "@/lib/constants";

const CartItemSchema = new mongoose.Schema(
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

const CartSchema = new mongoose.Schema({
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
  mongoose.model(MODELS.CART, CartSchema);
