import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "@/models/constants/constants";
import { z } from "zod";

export interface JobApplicationDocument extends mongoose.Document {
  job: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status?: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<JobApplicationDocument>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: MODELS.CAREER,
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const JobApplication: Model<JobApplicationDocument> =
  mongoose.models[MODELS.JOB_APPLICATION] ||
  mongoose.model<JobApplicationDocument>(
    MODELS.JOB_APPLICATION,
    JobApplicationSchema
  );

export default JobApplication;

export const jobApplicationZodSchema = z.object({
  job: z.string().regex(/^[a-f\d]{24}$/i, "Invalid Career ID"),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  coverLetter: z.string().optional(),
  status: z
    .enum(["pending", "reviewed", "shortlisted", "rejected", "hired"])
    .default("pending"),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
