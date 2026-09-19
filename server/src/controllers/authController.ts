import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { apiSuccess } from '../utils/apiResponse';
import {
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
} from '../utils/token';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, username } = req.body;
      const result = await AuthService.signup({ email, password, username });

      // Automatically log the user in upon signup for seamless UX
      const loginResult = await AuthService.login({
        email,
        password,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      setAuthCookies(res, loginResult.accessToken, loginResult.refreshToken);

      apiSuccess(
        res,
        {
          user: loginResult.user,
          simulatedVerificationUrl: result.simulatedVerificationUrl,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({
        email,
        password,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);

      apiSuccess(res, { user: result.user }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Look for refresh token in httpOnly cookie first, then fallback to body
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

      const result = await AuthService.refresh({
        refreshToken,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      setAuthCookies(res, result.accessToken, result.refreshToken);

      apiSuccess(res, { user: result.user }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      await AuthService.logout(refreshToken);
      clearAuthCookies(res);
      apiSuccess(res, { message: 'Logged out successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      apiSuccess(res, { user }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query.token as string;
      const user = await AuthService.verifyEmail(token);
      apiSuccess(
        res,
        {
          message: 'Email successfully verified!',
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            isEmailVerified: user.isEmailVerified,
          },
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      apiSuccess(
        res,
        {
          message: 'If an account exists with this email, a password reset link has been dispatched.',
          simulatedResetUrl: result.simulatedResetUrl,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);
      apiSuccess(
        res,
        {
          message: 'Password has been successfully updated. You may now log in with your new password.',
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
