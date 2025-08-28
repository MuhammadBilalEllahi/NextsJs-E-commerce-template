import { MODELS } from "@/models/constants";
import mongoose from "mongoose";
import { z } from "zod"


const Schema = mongoose.Schema;

const BannerSchema = new Schema({
    title: { type: String },
    description: { type: String },
    image: { type: String },
    link: { type: String },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    showTitle: { type: Boolean, default: true },
    showLink: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    mimeType: { type: String, default: "" }
});

export const zodBannerSchema = z.object({
    title: z.string(),//.min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    // image: z.string().min(1, "Image is required"),
    link: z.string(),//.min(1, "Link is required"),
    isActive: z.boolean().default(true),
    expiresAt: z.date().optional(),//.default(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    showTitle: z.boolean().default(false),
    showDescription: z.boolean().default(false),
    showLink: z.boolean().default(false),
    mimeType: z.string().optional()
})

BannerSchema.pre("save", function (next) {
    // if (!this.expiresAt) {
    //     this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    // }
    next();
});

export default mongoose.models[MODELS.BANNER] || mongoose.model(MODELS.BANNER.toString(), BannerSchema)

