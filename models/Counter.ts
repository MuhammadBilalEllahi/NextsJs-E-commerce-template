import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { id: false }
);

export default (mongoose.models.Counter as any) ||
  mongoose.model("Counter", CounterSchema);
