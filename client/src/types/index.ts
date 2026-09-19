export interface User {
  id: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
}

export interface ShortLink {
  _id: string;
  userId: string;
  shortCode: string;
  destinationUrl: string;
  title?: string;
  isCustomSlug: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export type BioTheme = 'minimal-light' | 'dark-slate' | 'vibrant-gradient';

export interface BioProfile {
  _id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: BioTheme;
  socialLinks: SocialLink[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicBioProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: BioTheme;
  socialLinks: SocialLink[];
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  topDevice: string;
  topReferrer: string;
  latestClickAt: string | null;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  clicksOverTime: Array<{
    date: string;
    clicks: number;
  }>;
  deviceDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topReferrers: Array<{
    domain: string;
    count: number;
    percentage: number;
  }>;
  recentClicks: Array<{
    id: string;
    timestamp: string;
    referrer: string;
    referrerDomain: string;
    deviceType: string;
  }>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
