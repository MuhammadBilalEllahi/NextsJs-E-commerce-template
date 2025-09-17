import mongoose from "mongoose";
import { z } from "zod";
import { MODELS, UserTypes } from "@/models/constants";
import { AddressSubSchema, AddressSubZodSchema } from "@/models/Address";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: [UserTypes.CUSTOMER, UserTypes.ADMIN],
    default: UserTypes.CUSTOMER,
  },
  phone: { type: String },
  city: { type: String },
  addresses: [AddressSubSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.PRODUCT }], // have to make this seperate schema
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODELS.CART,
    default: null,
  },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Main User schema
export const UserZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  passwordHash: z.string().min(6, "Password hash required"), // keeping min but actual hashed
  role: z
    .enum([UserTypes.CUSTOMER, UserTypes.ADMIN])
    .default(UserTypes.CUSTOMER),
  phone: z.string().optional(),
  city: z.string().optional(),
  addresses: z.array(AddressSubZodSchema).optional(),
  wishlist: z
    .array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"))
    .optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

// Type inference (for TS safety)
export type UserType = z.infer<typeof UserZodSchema>;

export default mongoose.models[MODELS.USER] ||
  mongoose.model(MODELS.USER, UserSchema);
