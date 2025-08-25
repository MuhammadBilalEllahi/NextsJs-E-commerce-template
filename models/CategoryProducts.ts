import mongoose from "mongoose";
import { MODELS } from "./constants";

const CategoryProductsSchema = new mongoose.Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: MODELS.CATEGORY, 
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
CategoryProductsSchema.pre('save', function(next) {
  this.productCount = this.products.length;
  this.updatedAt = new Date();
  next();
});

export default mongoose.models[MODELS.CATEGORY_PRODUCTS] || mongoose.model(MODELS.CATEGORY_PRODUCTS, CategoryProductsSchema);
