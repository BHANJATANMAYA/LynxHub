import { Types } from 'mongoose';
import { User, IUser } from '../models/User';
import { RefreshSession } from '../models/RefreshSession';
import { BioProfile } from '../models/BioProfile';
import { AppError } from '../utils/AppError';
import {
  hashPassword,
  comparePassword,
  hashToken,
  generateRandomToken,
  hashIp,
} from '../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/token';
import { env } from '../config/env';
import { AuthUserPayload } from '../types';

export class AuthService {
  /**
   * Register a new user account, initialize their default BioProfile,
   * generate an email verification token and simulate email delivery.
   */
  static async signup(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<{
    user: AuthUserPayload;
    simulatedVerificationUrl?: string;
  }> {
    const email = data.email.toLowerCase().trim();
    const username = data.username.toLowerCase().trim();

    // Check for existing user with this email or username
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw AppError.conflict('An account with this email already exists.', 'EMAIL_EXISTS');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw AppError.conflict('This username is already taken. Please choose another.', 'USERNAME_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate simulated email verification token (24-hour expiration)
    const verificationRawToken = generateRandomToken(32);
    const emailVerificationTokenHash = hashToken(verificationRawToken);
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user document
    const user = await User.create({
      email,
      passwordHash,
      username,
      isEmailVerified: false,
      emailVerificationTokenHash,
      emailVerificationExpiresAt,
    });

    // Automatically initialize default BioProfile
    await BioProfile.create({
      userId: user._id,
      username: user.username,
      displayName: user.username,
      bio: `Hello! I'm ${user.username}. Welcome to my LynxHub link-in-bio page.`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
      theme: 'minimal-light',
      socialLinks: [],
    });

    // Simulate email delivery by printing URL to backend console
    const simulatedVerificationUrl = `${env.CLIENT_URL}/verify-email?token=${verificationRawToken}`;
    console.log('\n======================================================');
    console.log('📧 [SIMULATED EMAIL SERVICE] Verification Email Sent:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Verify your LynxHub account`);
    console.log(`Click URL: ${simulatedVerificationUrl}`);
    console.log('======================================================\n');

    const authPayload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    };

    return {
      user: authPayload,
      simulatedVerificationUrl,
    };
  }

  /**
   * Authenticate user credentials, create a new RefreshSession,
   * and issue new access & refresh tokens.
   */
  static async login(data: {
    email: string;
    password: string;
    userAgent?: string;
    ip?: string;
  }): Promise<{
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
  }> {
    const email = data.email.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password credentials.', 'INVALID_CREDENTIALS');
    }

    const authPayload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    };

    const accessToken = generateAccessToken(authPayload);
    const refreshToken = generateRefreshToken();

    // Store hashed refresh token in RefreshSession
    const tokenHash = hashToken(refreshToken);
    const ipHash = data.ip ? hashIp(data.ip) : '';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshSession.create({
      userId: user._id,
      tokenHash,
      userAgent: data.userAgent || '',
      ipHash,
      expiresAt,
      revokedAt: null,
    });

    return {
      user: authPayload,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate refresh token: validate active session, revoke it,
   * and issue a fresh access & refresh token pair.
   */
  static async refresh(data: {
    refreshToken: string;
    userAgent?: string;
    ip?: string;
  }): Promise<{
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
  }> {
    if (!data.refreshToken) {
      throw AppError.unauthorized('Refresh token is required.', 'TOKEN_MISSING');
    }

    const tokenHash = hashToken(data.refreshToken);

    // Look for matching session
    const session = await RefreshSession.findOne({ tokenHash });

    if (!session) {
      throw AppError.unauthorized('Invalid refresh session. Please log in again.', 'SESSION_INVALID');
    }

    // Breach detection: if token is already revoked, potential token theft!
    if (session.revokedAt) {
      console.warn(`🚨 [Security Alert] Attempted reuse of revoked refresh token for user ${session.userId}. Revoking all sessions.`);
      await RefreshSession.updateMany({ userId: session.userId }, { revokedAt: new Date() });
      throw AppError.unauthorized('Session compromised. All sessions revoked for security.', 'SESSION_REVOKED');
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token expired. Please log in again.', 'SESSION_EXPIRED');
    }

    const user = await User.findById(session.userId);
    if (!user) {
      throw AppError.unauthorized('User not found.', 'USER_NOT_FOUND');
    }

    // Invalidate/revoke previous session (Token Rotation)
    session.revokedAt = new Date();
    await session.save();

    // Issue new pair
    const authPayload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    };

    const newAccessToken = generateAccessToken(authPayload);
    const newRefreshToken = generateRefreshToken();

    const newTokenHash = hashToken(newRefreshToken);
    const ipHash = data.ip ? hashIp(data.ip) : '';
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshSession.create({
      userId: user._id,
      tokenHash: newTokenHash,
      userAgent: data.userAgent || session.userAgent,
      ipHash,
      expiresAt: newExpiresAt,
      revokedAt: null,
    });

    return {
      user: authPayload,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Invalidate the current refresh session and clear authentication.
   */
  static async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await RefreshSession.findOneAndUpdate(
      { tokenHash, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  /**
   * Verify account email address using the simulated token.
   */
  static async verifyEmail(token: string): Promise<IUser> {
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token.', 'INVALID_VERIFICATION_TOKEN');
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return user;
  }

  /**
   * Initiate forgot password flow: generate token, store hash,
   * simulate email delivery.
   */
  static async forgotPassword(emailInput: string): Promise<{ simulatedResetUrl?: string }> {
    const email = emailInput.toLowerCase().trim();
    const user = await User.findOne({ email });

    // Anti-enumeration: always return success even if email not registered
    if (!user) {
      return {};
    }

    const rawResetToken = generateRandomToken(32);
    user.passwordResetTokenHash = hashToken(rawResetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const simulatedResetUrl = `${env.CLIENT_URL}/reset-password?token=${rawResetToken}`;
    console.log('\n======================================================');
    console.log('🔑 [SIMULATED EMAIL SERVICE] Password Reset Requested:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Reset your LynxHub password`);
    console.log(`Reset URL: ${simulatedResetUrl}`);
    console.log('======================================================\n');

    return { simulatedResetUrl };
  }

  /**
   * Complete password reset using token and revoke existing sessions.
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired password reset token.', 'INVALID_RESET_TOKEN');
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    // Revoke all existing refresh sessions for security
    await RefreshSession.updateMany({ userId: user._id }, { revokedAt: new Date() });
  }

  /**
   * Get current authenticated user profile.
   */
  static async getCurrentUser(userId: string): Promise<AuthUserPayload> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.', 'USER_NOT_FOUND');
    }
    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
    };
  }
}
