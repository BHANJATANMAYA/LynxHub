import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../utils/AppError';
import { verifyAccessToken, ACCESS_COOKIE_NAME } from '../utils/token';

export function authenticateToken(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    // Check httpOnly cookie first, then Bearer token in Authorization header
    let token = req.cookies?.[ACCESS_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      throw AppError.unauthorized('Authentication token missing. Please log in.', 'AUTH_TOKEN_MISSING');
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Access token has expired. Please refresh your session.', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid authentication token.', 'INVALID_TOKEN');
    }
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.[ACCESS_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      } catch {
        // Silently ignore expired/invalid token in optional auth
      }
    }
    next();
  } catch {
    next();
  }
}
