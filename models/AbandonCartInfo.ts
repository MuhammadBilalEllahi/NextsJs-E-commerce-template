import mongoose, { Schema, Document } from "mongoose";
import { MODELS } from "./constants";

const ABANDONED_CART_STATUS = {
    PENDING: "pending",
    ABANDONED: "abandoned",
    CONVERTED: "converted",
    EXPIRED: "expired"
}

const abandonedCartSchema = new mongoose.Schema(
    {
        uuidv4: { type: String, required: true, unique: true },
        userId: { type: Schema.Types.ObjectId, ref: MODELS.USER },
        email: { type: String, required: true },
        phone: { type: String },
        shippingAddress: {
            fullName: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        cartItems: [
            {
                productVariantId: { type: Schema.Types.ObjectId, ref: MODELS.VARIANT },
                name: String,
                price: Number,
                qty: Number,
            },
        ],
        status: {
            type: String,
            enum: [ABANDONED_CART_STATUS.PENDING, ABANDONED_CART_STATUS.ABANDONED, ABANDONED_CART_STATUS.CONVERTED, ABANDONED_CART_STATUS.EXPIRED],
            default: ABANDONED_CART_STATUS.PENDING.toString(),
        },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models[MODELS.ABANDONED_CART] || mongoose.model(MODELS.ABANDONED_CART, abandonedCartSchema);
