import mongoose, { Document, Schema } from "mongoose";

export interface ImportHistoryDocument extends Document {
  importId: string;
  fileName: string;
  importedBy: mongoose.Types.ObjectId;
  importedAt: Date;
  totalRows: number;
  productsCreated: number;
  variantsCreated: number;
  successCount: number;
  errorCount: number;
  errorDetails: string[];
  products: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    productSlug: string;
    variants: {
      variantId: mongoose.Types.ObjectId;
      variantSku: string;
      variantLabel: string;
    }[];
  }[];
  isUndone: boolean;
  undoneAt?: Date;
  undoneBy?: mongoose.Types.ObjectId;
}

const ImportHistorySchema = new Schema<ImportHistoryDocument>(
  {
    importId: {
      type: String,
      required: true,
      unique: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    importedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
    totalRows: {
      type: Number,
      required: true,
    },
    productsCreated: {
      type: Number,
      required: true,
    },
    variantsCreated: {
      type: Number,
      required: true,
    },
    successCount: {
      type: Number,
      required: true,
    },
    errorCount: {
      type: Number,
      required: true,
    },
    errorDetails: [String],
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        productSlug: {
          type: String,
          required: true,
        },
        variants: [
          {
            variantId: {
              type: Schema.Types.ObjectId,
              ref: "Variant",
              required: true,
            },
            variantSku: {
              type: String,
              required: true,
            },
            variantLabel: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    isUndone: {
      type: Boolean,
      default: false,
    },
    undoneAt: Date,
    undoneBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ImportHistorySchema.index({ importedBy: 1, importedAt: -1 });
ImportHistorySchema.index({ isUndone: 1 });

export default mongoose.models.ImportHistory ||
  mongoose.model<ImportHistoryDocument>("ImportHistory", ImportHistorySchema);
