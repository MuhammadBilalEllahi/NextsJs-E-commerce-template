import mongoose, { Document, Schema } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

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
      ref: MODELS.USER,
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
          ref: MODELS.PRODUCT,
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
              ref: MODELS.VARIANT,
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
      ref: MODELS.USER,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ImportHistorySchema.index({ importedBy: 1, importedAt: -1 });
ImportHistorySchema.index({ isUndone: 1 });

export default mongoose.models[MODELS.IMPORT_HISTORY] ||
  mongoose.model<ImportHistoryDocument>(
    MODELS.IMPORT_HISTORY,
    ImportHistorySchema
  );

export const importHistoryZodSchema = z.object({
  importId: z.string().min(1),
  fileName: z.string().min(1),
  importedBy: z.string().regex(/^[a-f\d]{24}$/i, "Invalid User ID"),
  importedAt: z.date().default(() => new Date()),
  totalRows: z.number().int().nonnegative(),
  productsCreated: z.number().int().nonnegative(),
  variantsCreated: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  errorDetails: z.array(z.string()).default([]),
  products: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Product ID"),
        productName: z.string(),
        productSlug: z.string(),
        variants: z
          .array(
            z.object({
              variantId: z
                .string()
                .regex(/^[a-f\d]{24}$/i, "Invalid Variant ID"),
              variantSku: z.string(),
              variantLabel: z.string(),
            })
          )
          .default([]),
      })
    )
    .default([]),
  isUndone: z.boolean().default(false),
  undoneAt: z.date().optional(),
  undoneBy: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid User ID")
    .optional(),
});
