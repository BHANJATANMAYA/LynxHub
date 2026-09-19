import { z } from 'zod';

const socialLinkItemSchema = z.object({
  id: z.string().min(1),
  platform: z.string().trim().min(1, 'Platform is required'),
  label: z.string().trim().min(1, 'Label is required').max(50, 'Label cannot exceed 50 characters'),
  url: z.string().trim().url('Social link must be a valid URL'),
  icon: z.string().optional().default(''),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateBioSchema = z.object({
  body: z.object({
    displayName: z.string().trim().max(60, 'Display name cannot exceed 60 characters').optional(),
    bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
    avatarUrl: z.string().trim().url('Avatar must be a valid URL').optional().or(z.literal('')),
    theme: z.enum(['minimal-light', 'dark-slate', 'vibrant-gradient']).optional(),
    socialLinks: z.array(socialLinkItemSchema).max(25, 'Maximum of 25 links allowed').optional(),
  }),
});

export const bioUsernameParamSchema = z.object({
  params: z.object({
    username: z.string().trim().toLowerCase().min(3).max(30),
  }),
});
