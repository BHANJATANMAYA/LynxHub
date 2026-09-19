import mongoose, { Document, Schema, Types } from 'mongoose';
import { SocialLinkItem, BioTheme } from '../types';

export interface IBioProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: BioTheme;
  socialLinks: SocialLinkItem[];
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<SocialLinkItem>(
  {
    id: { type: String, required: true },
    platform: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const BioProfileSchema = new Schema<IBioProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      default: '',
      trim: true,
      maxlength: [60, 'Display name cannot exceed 60 characters'],
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
    theme: {
      type: String,
      enum: ['minimal-light', 'dark-slate', 'vibrant-gradient'],
      default: 'minimal-light',
    },
    socialLinks: {
      type: [SocialLinkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const BioProfile = mongoose.model<IBioProfile>('BioProfile', BioProfileSchema);
