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

// Embedded courier tracking history (generic for any provider)
const CourierTrackingHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    location: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    description: { type: String, default: "" },
    updatedBy: { type: String, default: "system" },
  },
  { id: false }
);

// Embedded courier/shipping provider data (unifies TCS/Leopard/Trax/DHL/etc.)
const CourierSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "" }, // e.g. "tcs", "leopard", "trax", "dhl"
    consignmentNumber: { type: String, default: "" },
    customerReferenceNo: { type: String, default: "" },

    // Credentials/config used for API calls when applicable
    credentials: {
      userName: { type: String, default: "" },
      password: { type: String, default: "" },
      costCenterCode: { type: String, default: "" },
      accountNo: { type: String, default: "" },
    },

    // Package and consignee details at the time of booking
    consigneeName: { type: String, default: "" },
    consigneeAddress: { type: String, default: "" },
    consigneeMobNo: { type: String, default: "" },
    consigneeEmail: { type: String, default: "" },
    consigneeLandLine: { type: String, default: "" },
    originCityName: { type: String, default: "" },
    destinationCityName: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    pieces: { type: Number, default: 0 },
    codAmount: { type: String, default: "" },
    productDetails: { type: String, default: "" },
    fragile: { type: String, default: "No" },
    remarks: { type: String, default: "" },
    insuranceValue: { type: Number, default: 0 },
    services: { type: String, default: "" },
    transactionType: { type: Number, default: 1 },

    // Status and API response caches
    status: {
      type: String,
      enum: [
        "pending",
        "created",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "cancelled",
      ],
      default: "pending",
    },
    apiResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastApiCall: { type: Date },
    apiErrors: [{ type: String }],

    // Tracking and dates
    trackingHistory: [CourierTrackingHistorySchema],
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },

    // Pickup and payment status (for COD remittance when courier provides it)
    pickupStatus: {
      type: String,
      enum: ["pending", "scheduled", "picked_up", "failed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "collected", "failed", "refunded"],
      default: "pending",
    },
    paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
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

    // Dynamic shipping method slug: e.g. "home_delivery", "tcs", "leopard", "trax", "dhl"
    shippingMethod: {
      type: String,
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

    // Unified courier info (null/undefined when not using a courier)
    courier: { type: CourierSchema, default: undefined },
  },
  { timestamps: true }
);

OrderSchema.index({ "contact.email": 1, createdAt: -1 });

export default (mongoose.models[MODELS.ORDER] as any) ||
  mongoose.model(MODELS.ORDER, OrderSchema);
