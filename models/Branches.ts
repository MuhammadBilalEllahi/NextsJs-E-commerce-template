import mongoose from "mongoose"
import { MODELS } from "@/models/constants";
import { z } from "zod";
const Schema = mongoose.Schema

const BranchSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    logo: { type: String, required: true },
    branchNumber: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    
    // Additional fields for better management
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "India" },
    postalCode: { type: String, required: true },
    manager: { type: String },
    openingHours: { type: String },
    description: { type: String },
    
    // Coordinates for mapping (optional)
    coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    
    // Social media and contact
    website: { type: String },
    whatsapp: { type: String },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
BranchSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const zodBranchSchema = z.object({
    name: z.string().min(1, "Branch name is required"),
    address: z.string().min(1, "Address is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    email: z.string().email("Invalid email format"),
    isActive: z.boolean().default(true),
    logo: z.string().url("Invalid logo URL"),
    branchNumber: z.string().min(1, "Branch number is required"),
    location: z.string().min(1, "Location is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().default("India"),
    postalCode: z.string().min(1, "Postal code is required"),
    manager: z.string().optional(),
    openingHours: z.string().optional(),
    description: z.string().optional(),
    coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional()
    }).optional(),
    website: z.string().url().optional().or(z.literal("")),
    whatsapp: z.string().optional()
});

export const zodBranchUpdateSchema = zodBranchSchema.partial().extend({
    id: z.string().min(1, "Branch ID is required")
});

export default mongoose.models[MODELS.BRANCH] || mongoose.model(MODELS.BRANCH, BranchSchema)