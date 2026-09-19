import { Request } from 'express';

export interface AuthUserPayload {
  id: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';

export interface ClickTelemetryData {
  shortLinkId: string;
  userId: string;
  timestamp: Date;
  referrer: string;
  referrerDomain: string;
  deviceType: DeviceType;
  ipHash: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export type BioTheme = 'minimal-light' | 'dark-slate' | 'vibrant-gradient';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';
