import mongoose from "mongoose";
import { AddressSubSchema } from "@/models/Address";
import {
  MODELS,
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  ORDER_TYPE,
  PAYMENT_TYPE,
} from "@/models/constants";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.PRODUCT,
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.VARIANT,
      required: false,
    }, // Optional for products without variants
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
    label: { type: String, default: "" },
  },
  { id: false }
);

const OrderHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, required: true }, // "system", "userId", "adminId"
    reason: { type: String, default: "" }, // For cancellation reasons
  },
  { id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    refId: { type: String, unique: true },
    tracking: { type: String, default: "" },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MODELS.USER,
      default: null,
    },

    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      marketingOptIn: { type: Boolean, default: false },
    },

    shippingAddress: { type: AddressSubSchema, required: true },
    billingAddress: { type: AddressSubSchema },

    shippingMethod: {
      type: String,
      enum: [ORDER_TYPE.HOME_DELIVERY, ORDER_TYPE.TCS],
      required: true,
      default: ORDER_TYPE.HOME_DELIVERY,
    },
    payment: {
      method: {
        type: String,
        enum: [PAYMENT_TYPE.COD],
        default: PAYMENT_TYPE.COD,
      },
      status: {
        type: String,
        enum: [
          ORDER_PAYMENT_STATUS.FAILED,
          ORDER_PAYMENT_STATUS.PAID,
          ORDER_PAYMENT_STATUS.PENDING,
        ],
        default: ORDER_PAYMENT_STATUS.PENDING,
      },
      transactionId: { type: String, default: "" },
    },

    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        ORDER_STATUS.CANCELLED,
        ORDER_STATUS.CONFIRMED,
        ORDER_STATUS.DELIVERED,
        ORDER_STATUS.PENDING,
        ORDER_STATUS.SHIPPED,
      ],
      default: ORDER_STATUS.PENDING,
    },

    cancellationReason: { type: String, default: "" },
    history: [OrderHistorySchema],
  },
  { timestamps: true }
);

OrderSchema.index({ "contact.email": 1, createdAt: -1 });

export default (mongoose.models[MODELS.ORDER] as any) ||
  mongoose.model(MODELS.ORDER, OrderSchema);
