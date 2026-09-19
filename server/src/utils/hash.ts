import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function hashIp(ip: string): string {
  const normalizedIp = ip.trim().replace(/^::ffff:/, ''); // normalize IPv4-mapped IPv6
  return crypto.createHash('sha256').update(`${normalizedIp}:${env.IP_HASH_SALT}`).digest('hex');
}

export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}
