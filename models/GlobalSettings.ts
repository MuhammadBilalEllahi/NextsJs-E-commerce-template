import { MODELS } from "@/models/constants";
import mongoose from "mongoose";
import { z } from "zod"

const Schema = mongoose.Schema;

const GlobalSettingsSchema = new Schema({
    bannerScrollTime: { type: Number, default: 5000 }, // Overall banner scroll time in milliseconds
    updatedAt: { type: Date, default: Date.now }
});

export const zodGlobalSettingsSchema = z.object({
    bannerScrollTime: z.number().min(1000).max(30000).default(5000) // Between 1-30 seconds
});

GlobalSettingsSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models[MODELS.GLOBAL_SETTINGS] || mongoose.model(MODELS.GLOBAL_SETTINGS.toString(), GlobalSettingsSchema)
