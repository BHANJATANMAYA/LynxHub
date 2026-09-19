import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_key_at_least_32_chars_long_12345',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_key_at_least_32_chars_long_12345',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  IP_HASH_SALT: process.env.IP_HASH_SALT || 'dev_salt_lynxhub_privacy_sha256',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '30', 10),
  RATE_LIMIT_AUTH_WINDOW_MS: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000', 10),
  RATE_LIMIT_LINK_CREATE_MAX: parseInt(process.env.RATE_LIMIT_LINK_CREATE_MAX || '60', 10),
  RATE_LIMIT_LINK_CREATE_WINDOW_MS: parseInt(process.env.RATE_LIMIT_LINK_CREATE_WINDOW_MS || '60000', 10),
  RATE_LIMIT_REDIRECT_MAX: parseInt(process.env.RATE_LIMIT_REDIRECT_MAX || '500', 10),
  RATE_LIMIT_REDIRECT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_REDIRECT_WINDOW_MS || '60000', 10),
};
