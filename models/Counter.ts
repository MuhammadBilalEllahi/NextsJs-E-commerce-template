import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}, { _id: false });

export default (mongoose.models.Counter as any) || mongoose.model("Counter", CounterSchema);
