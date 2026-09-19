import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  ipHash?: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
}

const RefreshSessionSchema = new Schema<IRefreshSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipHash: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL index to automatically purge expired sessions from MongoDB
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for fast lookup of active sessions by user
RefreshSessionSchema.index({ userId: 1, revokedAt: 1 });

export const RefreshSession = mongoose.model<IRefreshSession>('RefreshSession', RefreshSessionSchema);
