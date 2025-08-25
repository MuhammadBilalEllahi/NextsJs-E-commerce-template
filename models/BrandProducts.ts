import mongoose from "mongoose";
import { MODELS } from "./constants";

const BrandProductsSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: MODELS.BRAND, 
    required: true 
  },
  products: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: MODELS.PRODUCT 
  }],
  productCount: {
    type: Number,
    default: 0
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update productCount when products array changes
BrandProductsSchema.pre('save', function(next) {
  this.productCount = this.products.length;
  this.updatedAt = new Date();
  next();
});

export default mongoose.models[MODELS.BRAND_PRODUCTS] || mongoose.model(MODELS.BRAND_PRODUCTS, BrandProductsSchema);
