import mongoose from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface CounterDocument extends mongoose.Document {
  id: string;
  seq: number;
}

const CounterSchema = new mongoose.Schema<CounterDocument>(
  {
    id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { id: false }
);

export default (mongoose.models[MODELS.COUNTER] as any) ||
  mongoose.model(MODELS.COUNTER, CounterSchema);

export const counterZodSchema = z.object({
  id: z.string().min(1),
  seq: z.number().int().nonnegative().default(0),
});
