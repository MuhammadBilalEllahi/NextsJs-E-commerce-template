import mongoose from "mongoose";
import { MODELS } from "@/models/constants";

const TCSTrackingHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  description: { type: String, default: "" },
  updatedBy: { type: String, default: "TCS" } // "TCS", "admin", "system"
}, { _id: false });

const TCSOrderSchema = new mongoose.Schema({
  // Reference to main order
  order: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.ORDER, required: true },
  
  // TCS specific fields
  consignmentNumber: { type: String, unique: true, sparse: true }, // TCS CN
  customerReferenceNo: { type: String, required: true }, // Our order ref
  
  // TCS API credentials (encrypted in production)
  userName: { type: String, required: true },
  password: { type: String, required: true },
  costCenterCode: { type: String, required: true },
  tcsAccountNo: { type: String, default: "" },
  
  // Order details for TCS
  consigneeName: { type: String, required: true },
  consigneeAddress: { type: String, required: true },
  consigneeMobNo: { type: String, required: true },
  consigneeEmail: { type: String, required: true },
  consigneeLandLine: { type: String, default: "" },
  
  // Origin and destination
  originCityName: { type: String, required: true, default: "Lahore" },
  destinationCityName: { type: String, required: true },
  
  // Package details
  weight: { type: Number, required: true, default: 1 },
  pieces: { type: Number, required: true, default: 1 },
  codAmount: { type: String, required: true },
  productDetails: { type: String, default: "" },
  fragile: { type: String, required: true, default: "No" },
  remarks: { type: String, default: "" },
  insuranceValue: { type: Number, default: 0 },
  
  // Service details
  services: { type: String, required: true, default: "O" }, // O = Overnight
  transactionType: { type: Number, required: true, default: 1 }, // 1 = booking
  
  // Vendor details (our shop details)
  vendorName: { type: String, default: "Dehli Mirch" },
  vendorAddressName: { type: String, default: "" },
  vendorAddressDistrict: { type: String, default: "" },
  vendorAddressCity: { type: String, default: "" },
  vendorAddressArea: { type: String, default: "" },
  vendorContactNo: { type: String, default: "" },
  
  // Additional TCS fields
  bookingInfo: { type: String, default: "" },
  shippingType: { type: String, default: "Warehouse" },
  dsFlag: { type: String, default: "CB" },
  carrierSlug: { type: String, default: "" },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ["pending", "created", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed", "cancelled"],
    default: "pending"
  },
  
  // TCS API responses
  tcsResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  lastApiCall: { type: Date, default: Date.now },
  apiErrors: [{ type: String }],
  
  // Tracking information
  trackingHistory: [TCSTrackingHistorySchema],
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  
  // Payment details
  paymentStatus: { 
    type: String, 
    enum: ["pending", "collected", "failed", "refunded"],
    default: "pending"
  },
  paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Pickup details
  pickupStatus: { 
    type: String, 
    enum: ["pending", "scheduled", "picked_up", "failed"],
    default: "pending"
  },
  pickupDate: { type: Date },
  pickupTime: { type: String },
  
}, { timestamps: true });

// Indexes for better query performance
TCSOrderSchema.index({ order: 1 });
TCSOrderSchema.index({ consignmentNumber: 1 });
TCSOrderSchema.index({ customerReferenceNo: 1 });
TCSOrderSchema.index({ status: 1 });
TCSOrderSchema.index({ createdAt: -1 });

export default (mongoose.models[MODELS.TCS_ORDER] as any) || mongoose.model(MODELS.TCS_ORDER, TCSOrderSchema);

