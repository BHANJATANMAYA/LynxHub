import { z } from 'zod';
import { isReservedSlug } from '../utils/reservedSlugs';

export const createLinkSchema = z.object({
  body: z.object({
    destinationUrl: z
      .string({ required_error: 'Destination URL is required' })
      .trim()
      .url('Please provide a valid URL (including http:// or https://)')
      .max(2048, 'URL is too long (maximum 2048 characters)'),
    title: z.string().trim().max(120, 'Title cannot exceed 120 characters').optional(),
    customSlug: z
      .string()
      .trim()
      .min(3, 'Custom slug must be at least 3 characters')
      .max(50, 'Custom slug cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Custom slug can only contain letters, numbers, hyphens and underscores')
      .refine((val) => !isReservedSlug(val), {
        message: 'This custom slug is reserved and cannot be used',
      })
      .optional()
      .or(z.literal('')),
  }),
});

export const getLinksQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    search: z.string().trim().optional(),
  }),
});

export const linkIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid link ID format'),
  }),
});

export const analyticsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['7d', '30d', '90d', 'all']).optional().default('30d'),
  }),
});
