import mongoose from 'mongoose';
import { z } from "zod";
import { MODELS, UserTypes } from '@/models/constants';



const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: [UserTypes.CUSTOMER, UserTypes.ADMIN], default: UserTypes.CUSTOMER },
  phone: { type: String },
  addresses: [
    {
      label: { type: String }, // Home, Office, etc
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      isDefault: { type: Boolean, default: false }
    }
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: MODELS.PRODUCT }],
  cart: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.CART, default: null },
  // cart: [
  //   {
  //     product: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.PRODUCT },
  //     quantity: { type: Number, default: 1 },
  //     variant: { type: mongoose.Schema.Types.ObjectId, ref: MODELS.VARIANT} // size/color SKU
  //   }
  // ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// ZOD
// Address schema
const AddressSchema = z.object({
  label: z.string().optional(), // Home, Office, etc
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Cart schema
// const CartItemSchema = z.object({
//   product: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"), // Mongo ObjectId
//   quantity: z.number().int().positive().default(1),
//   variant: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId").optional(),
// });

// Main User schema
export const UserZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  passwordHash: z.string().min(6, "Password hash required"), // keeping min but actual hashed
  role: z.enum([UserTypes.CUSTOMER, UserTypes.ADMIN]).default(UserTypes.CUSTOMER),
  phone: z.string().optional(),
  addresses: z.array(AddressSchema).optional(),
  wishlist: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId")).optional(),
  // cart: z.array(CartItemSchema).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

// Type inference (for TS safety)
export type UserType = z.infer<typeof UserZodSchema>;




export default mongoose.models[MODELS.USER] || mongoose.model(MODELS.USER, UserSchema);
