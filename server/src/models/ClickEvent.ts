import mongoose, { Document, Schema, Types } from 'mongoose';
import { DeviceType } from '../types';

export interface IClickEvent extends Document {
  _id: Types.ObjectId;
  shortLinkId: Types.ObjectId;
  userId: Types.ObjectId;
  timestamp: Date;
  referrer: string;
  referrerDomain: string;
  deviceType: DeviceType;
  ipHash: string;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    shortLinkId: {
      type: Schema.Types.ObjectId,
      ref: 'ShortLink',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    referrer: {
      type: String,
      default: 'Direct / None',
      trim: true,
    },
    referrerDomain: {
      type: String,
      default: 'Direct',
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Desktop',
      index: true,
    },
    ipHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes for high-throughput analytics queries
ClickEventSchema.index({ shortLinkId: 1, timestamp: -1 });
ClickEventSchema.index({ userId: 1, timestamp: -1 });
ClickEventSchema.index({ shortLinkId: 1, deviceType: 1 });
ClickEventSchema.index({ shortLinkId: 1, referrerDomain: 1 });

export const ClickEvent = mongoose.model<IClickEvent>('ClickEvent', ClickEventSchema);
