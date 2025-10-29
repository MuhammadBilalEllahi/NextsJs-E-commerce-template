import mongoose, { Document, Schema } from "mongoose";
import crypto from "crypto";
import { MODELS } from "./constants/constants";

export interface PasswordResetTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  isValid(): boolean;
  markAsUsed(): Promise<void>;
}

export interface PasswordResetTokenModel
  extends mongoose.Model<PasswordResetTokenDocument> {
  generateToken(): string;
  createForUser(
    userId: mongoose.Types.ObjectId
  ): Promise<PasswordResetTokenDocument>;
}

const PasswordResetTokenSchema = new Schema<PasswordResetTokenDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: MODELS.USER,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
PasswordResetTokenSchema.index({ token: 1 });
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to generate a secure token
PasswordResetTokenSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(32).toString("hex");
};

// Static method to create a reset token for a user
PasswordResetTokenSchema.statics.createForUser = async function (
  userId: mongoose.Types.ObjectId
) {
  // Remove any existing unused tokens for this user
  await this.deleteMany({ userId, used: false });

  const token = crypto.randomBytes(32).toString("hex");
  const resetToken = new this({
    userId,
    token,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  await resetToken.save();
  return resetToken;
};

// Method to check if token is valid
PasswordResetTokenSchema.methods.isValid = function (): boolean {
  return !this.used && this.expiresAt > new Date();
};

// Method to mark token as used
PasswordResetTokenSchema.methods.markAsUsed = async function () {
  this.used = true;
  await this.save();
};

export default mongoose.models[MODELS.PASSWORD_RESET_TOKEN] ||
  mongoose.model<PasswordResetTokenDocument, PasswordResetTokenModel>(
    MODELS.PASSWORD_RESET_TOKEN,
    PasswordResetTokenSchema
  );
