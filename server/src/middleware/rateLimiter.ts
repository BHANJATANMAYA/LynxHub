import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { env } from '../config/env';
import { apiError } from '../utils/apiResponse';

export const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
  max: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    return apiError(
      res,
      'Too many authentication attempts. Please try again in 15 minutes.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

export const linkCreateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_LINK_CREATE_WINDOW_MS,
  max: env.RATE_LIMIT_LINK_CREATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    return apiError(
      res,
      'Link creation rate limit reached. Please wait before creating more links.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

export const redirectLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_REDIRECT_WINDOW_MS,
  max: env.RATE_LIMIT_REDIRECT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    return apiError(
      res,
      'Too many redirects requested. Please try again shortly.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    return apiError(
      res,
      'Too many requests sent to the API. Please slow down.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});
