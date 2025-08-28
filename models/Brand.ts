import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { MODELS } from "@/models/constants";
import {z} from "zod";

const brandSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false
    }
})

export  const brandZodSchema = z.object({
    name: z.string().min(1,"Brand name is required"),
    // logo: z.string(),
    description: z.string()
})


export default mongoose.models[MODELS.BRAND] || mongoose.model(MODELS.BRAND.toString(), brandSchema)