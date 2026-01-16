import mongoose from "mongoose";
import { z } from "zod";
import { MODELS } from "@/models/constants/constants";
import { DEFAULT_COUNTRY, DEFAULT_PHONE_CODE, DEFAULT_STATE } from "@/lib/constants/site";

// Address sub-schema for embedded use (like in User model and Order model)
export const AddressSubSchema = new mongoose.Schema(
  {
    label: { type: String }, // Home, Office, etc
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String }, // Using 'address' to match checkout structure
    city: { type: String },
    state: { type: String },
    country: { type: String, default: DEFAULT_COUNTRY },
    postalCode: { type: String },
    phone: { type: String },
    countryCode: { type: String, default: DEFAULT_PHONE_CODE },
    isDefault: { type: Boolean, default: false },
  },
  { id: false }
);

export interface AddressDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
  countryCode: string;
  isDefault: boolean;
  isBilling: boolean;
  isShipping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Full Address schema for separate collection (for address management)
const AddressSchema = new mongoose.Schema<AddressDocument>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.USER,
    required: true,
  },
  label: { type: String, required: true }, // Home, Office, Billing, Shipping, etc
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true }, // Using 'address' to match checkout structure
  city: { type: String, required: true },
  state: { type: String, default: DEFAULT_STATE },
  country: { type: String, default: DEFAULT_COUNTRY },
  postalCode: { type: String },
  phone: { type: String, required: true },
  countryCode: { type: String, default: DEFAULT_PHONE_CODE },
  isDefault: { type: Boolean, default: false },
  isBilling: { type: Boolean, default: false },
  isShipping: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AddressSchema.index(
  { user: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);
AddressSchema.index({ user: 1, label: 1 }, { unique: true });

// ZOD Schema for embedded addresses (used in User model)
export const AddressSubZodSchema = z.object({
  label: z.string().optional(), // Home, Office, etc
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address: z.string().optional(), // Using 'address' to match checkout structure
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// ZOD Schema for full address documents (used in address management)
export const AddressZodSchema = z.object({
  user: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  label: z.string().min(1, "Label is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().default(DEFAULT_STATE),
  country: z.string().default(DEFAULT_COUNTRY),
  postalCode: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  countryCode: z.string().default(DEFAULT_PHONE_CODE),
  isDefault: z.boolean().default(false),
  isBilling: z.boolean().default(false),
  isShipping: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type AddressType = z.infer<typeof AddressZodSchema>;
export type AddressSubType = z.infer<typeof AddressSubZodSchema>;

export default mongoose.models[MODELS.ADDRESS] ||
  mongoose.model(MODELS.ADDRESS, AddressSchema);
