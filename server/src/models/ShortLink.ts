import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IShortLink extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  shortCode: string;
  destinationUrl: string;
  title?: string;
  isCustomSlug: boolean;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ShortLinkSchema = new Schema<IShortLink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    shortCode: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    destinationUrl: {
      type: String,
      required: [true, 'Destination URL is required'],
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    isCustomSlug: {
      type: Boolean,
      default: false,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user link pagination and search sorting
ShortLinkSchema.index({ userId: 1, createdAt: -1 });
ShortLinkSchema.index({ userId: 1, shortCode: 1 });

export const ShortLink = mongoose.model<IShortLink>('ShortLink', ShortLinkSchema);
