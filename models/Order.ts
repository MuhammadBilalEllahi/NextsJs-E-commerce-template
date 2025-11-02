import mongoose from "mongoose";
import { AddressSubSchema } from "@/models/Address";
import {
  MODELS,
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  ORDER_TYPE,
  PAYMENT_TYPE,
} from "@/models/constants/constants";
import { z } from "zod";
const ORDER_TYPE_VALUES = [
  ORDER_TYPE.HOME_DELIVERY,
  ORDER_TYPE.TCS,
  ORDER_TYPE.PICKUP,
] as const;
const PAYMENT_TYPE_VALUES = [PAYMENT_TYPE.COD] as const;
const ORDER_PAYMENT_STATUS_VALUES = [
  ORDER_PAYMENT_STATUS.FAILED,
  ORDER_PAYMENT_STATUS.PAID,
  ORDER_PAYMENT_STATUS.PENDING,
] as const;
const ORDER_STATUS_VALUES = [
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.PENDING,
  ORDER_STATUS.SHIPPED,
] as const;

export interface OrderItemDocument extends mongoose.Document {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  label: string;
}

const OrderItemSchema = new mongoose.Schema<OrderItemDocument>(
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

export interface OrderHistoryDocument extends mongoose.Document {
  status: string;
  changedAt: Date;
  changedBy: string;
  reason: string;
}

const OrderHistorySchema = new mongoose.Schema<OrderHistoryDocument>(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, required: true }, // "system", "userId", "adminId"
    reason: { type: String, default: "" }, // For cancellation reasons
  },
  { id: false }
);

// Embedded courier tracking history (generic for any provider)
export interface CourierTrackingHistoryDocument extends mongoose.Document {
  status: string;
  location: string;
  timestamp: Date;
  description: string;
  updatedBy: string;
}

const CourierTrackingHistorySchema =
  new mongoose.Schema<CourierTrackingHistoryDocument>(
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
export interface CourierDocument extends mongoose.Document {
  provider: string;
  consignmentNumber: string;
  customerReferenceNo: string;
  credentials: {
    userName: string;
    password: string;
    costCenterCode: string;
    accountNo: string;
  };
  consigneeName: string;
  consigneeAddress: string;
  consigneeMobNo: string;
  consigneeEmail: string;
  consigneeLandLine: string;
  originCityName: string;
  destinationCityName: string;
  weight: number;
  pieces: number;
  codAmount: string;
  productDetails: string;
  fragile: string;
  remarks: string;
  insuranceValue: number;
  services: string;
  transactionType: number;
  status: string;
  apiResponse: Record<string, any>;
  lastApiCall?: Date;
  apiErrors: string[];
  trackingHistory: Array<CourierTrackingHistoryDocument>;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  pickupStatus: string;
  paymentStatus: string;
  paymentDetails: Record<string, any>;
}

const CourierSchema = new mongoose.Schema<CourierDocument>(
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

export interface OrderDocument extends mongoose.Document {
  orderId?: string;
  refId?: string;
  tracking: string;
  user?: mongoose.Types.ObjectId | null;
  contact: { email: string; phone: string; marketingOptIn: boolean };
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod: string;
  payment: { method: string; status: string; transactionId: string };
  items: Array<OrderItemDocument>;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  cancellationReason: string;
  history: Array<OrderHistoryDocument>;
  courier?: CourierDocument;
}

const OrderSchema = new mongoose.Schema<OrderDocument>(
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

export const orderItemZodSchema = z.object({
  product: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Product ID"),
  variant: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid Variant ID")
    .optional(),
  quantity: z.number().int().min(1),
  priceAtPurchase: z.number(),
  label: z.string().default(""),
});

export const orderZodSchema = z.object({
  orderId: z.string().optional(),
  refId: z.string().optional(),
  tracking: z.string().default(""),
  user: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid User ID")
    .nullable()
    .optional(),
  contact: z.object({
    email: z.string().email().default(""),
    phone: z.string().default(""),
    marketingOptIn: z.boolean().default(false),
  }),
  shippingAddress: z.record(z.string(), z.any()),
  billingAddress: z.record(z.string(), z.any()).optional(),
  shippingMethod: z.enum(ORDER_TYPE_VALUES).default(ORDER_TYPE.HOME_DELIVERY),
  payment: z.object({
    method: z.enum(PAYMENT_TYPE_VALUES).default(PAYMENT_TYPE.COD),
    status: z
      .enum(ORDER_PAYMENT_STATUS_VALUES)
      .default(ORDER_PAYMENT_STATUS.PENDING),
    transactionId: z.string().default(""),
  }),
  items: z.array(orderItemZodSchema).default([]),
  subtotal: z.number().nonnegative(),
  shippingFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(ORDER_STATUS_VALUES).default(ORDER_STATUS.PENDING),
  cancellationReason: z.string().default(""),
  history: z
    .array(
      z.object({
        status: z.string(),
        changedAt: z.date().default(() => new Date()),
        changedBy: z.string(),
        reason: z.string().default(""),
      })
    )
    .default([]),
  courier: z.record(z.string(), z.any()).optional(),
});
