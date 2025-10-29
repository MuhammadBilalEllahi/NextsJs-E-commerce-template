import mongoose, { Schema, Model } from "mongoose";
import { MODELS } from "@/models/constants/constants";

export interface ChatMessage {
  id?: string;
  sender: "user" | "admin" | "system";
  message: string;
  timestamp: Date;
  isRead?: boolean;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    adminId?: string;
    adminName?: string;
  };
}

export interface ChatInquiryDocument extends mongoose.Document {
  sessionId: string; // For unauthenticated users
  userId?: mongoose.Types.ObjectId; // For authenticated users
  name?: string;
  email?: string;
  phone?: string;
  status: "open" | "closed" | "pending" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  category: "general" | "order" | "product" | "technical" | "billing" | "other";
  messages: ChatMessage[];
  lastMessageAt: Date;
  assignedTo?: mongoose.Types.ObjectId; // Admin assigned to handle
  tags: string[];
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    currentPage?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<ChatMessage>(
  {
    sender: {
      type: String,
      enum: ["user", "admin", "system"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      sessionId: String,
      adminId: String,
      adminName: String,
    },
  },
  { id: true }
);

const ChatInquirySchema = new Schema<ChatInquiryDocument>(
  {
    sessionId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "closed", "pending", "resolved"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["general", "order", "product", "technical", "billing", "other"],
      default: "general",
    },
    messages: [ChatMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [String],
    metadata: {
      userAgent: String,
      ipAddress: String,
      referrer: String,
      currentPage: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
ChatInquirySchema.index({ sessionId: 1, isActive: 1 });
ChatInquirySchema.index({ userId: 1, isActive: 1 });
ChatInquirySchema.index({ status: 1, lastMessageAt: -1 });
ChatInquirySchema.index({ assignedTo: 1, status: 1 });

const ChatInquiry: Model<ChatInquiryDocument> =
  mongoose.models[MODELS.CHAT_INQUIRY] ||
  mongoose.model<ChatInquiryDocument>(MODELS.CHAT_INQUIRY, ChatInquirySchema);

export default ChatInquiry;
