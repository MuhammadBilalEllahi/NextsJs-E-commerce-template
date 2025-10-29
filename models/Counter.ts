import mongoose from "mongoose";
import { MODELS } from "@/models/constants/constants";

const CounterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { id: false }
);

export default (mongoose.models[MODELS.COUNTER] as any) ||
  mongoose.model(MODELS.COUNTER, CounterSchema);
