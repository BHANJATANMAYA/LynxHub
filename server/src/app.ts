import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { generalApiLimiter } from './middleware/rateLimiter';
import { AppError } from './utils/AppError';

import authRoutes from './routes/authRoutes';
import linkRoutes from './routes/linkRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import bioRoutes from './routes/bioRoutes';
import redirectRoutes from './routes/redirectRoutes';

export const app = express();

// Trust proxy for secure cookies and accurate IP determination behind proxies
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for flexible API and dev tooling
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development, strict check in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Root health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Short URL Redirection Route: /r/:shortCode
app.use('/r', redirectRoutes);

// 2. API Routes
app.use('/api', generalApiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bio', bioRoutes);

// Catch-all 404 for undefined routes
app.use('*', (req: Request, _res: Response, next) => {
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`, 'ENDPOINT_NOT_FOUND'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);
