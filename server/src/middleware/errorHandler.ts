import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { apiError } from '../utils/apiResponse';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return _next(err);
  }

  // 1. Custom operational AppError
  if (err instanceof AppError) {
    apiError(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  // 2. Mongoose unique constraint violation (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    const field = keys[0] || 'resource';
    const message = `A record with this ${field} already exists.`;
    apiError(res, message, 409, 'DUPLICATE_KEY_ERROR', { field });
    return;
  }

  // 3. Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    apiError(res, message, 400, 'INVALID_RESOURCE_ID');
    return;
  }

  // 4. Unexpected server error
  console.error('💥 [Unhandled Exception]', err);
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  apiError(
    res,
    message,
    500,
    'INTERNAL_SERVER_ERROR',
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
}
