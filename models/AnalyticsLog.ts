import mongoose from "mongoose";
import { MODELS } from "@/models/constants";

const AnalyticsLogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // refund, order, inventory, user
    action: { type: String, required: true }, // created, updated, approved, rejected, completed, status_changed
    entity: { type: String, required: true }, // Refund, Order, Product, Variant, User
    entityId: { type: String, required: true },
    actor: { type: String, default: "system" }, // userId/adminId/system
    amount: { type: Number, default: 0 },
    meta: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AnalyticsLogSchema.index({ type: 1, createdAt: -1 });
AnalyticsLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

export default mongoose.models["AnalyticsLog"] ||
  mongoose.model("AnalyticsLog", AnalyticsLogSchema);
