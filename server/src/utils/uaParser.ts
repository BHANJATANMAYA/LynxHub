import { UAParser } from 'ua-parser-js';
import { DeviceType } from '../types';

export function parseDeviceType(userAgentString?: string): DeviceType {
  if (!userAgentString) return 'Unknown';

  const parser = new UAParser(userAgentString);
  const device = parser.getDevice();
  const deviceType = device.type?.toLowerCase();

  if (deviceType === 'mobile') {
    return 'Mobile';
  }
  if (deviceType === 'tablet') {
    return 'Tablet';
  }

  // Check fallback heuristic for devices or user agent flags
  const lowerUa = userAgentString.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lowerUa)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle/i.test(lowerUa)) {
    return 'Mobile';
  }

  return 'Desktop';
}

export function parseReferrerDomain(referrerHeader?: string): { referrer: string; referrerDomain: string } {
  if (!referrerHeader || referrerHeader.trim() === '') {
    return {
      referrer: 'Direct / None',
      referrerDomain: 'Direct',
    };
  }

  try {
    const parsedUrl = new URL(referrerHeader);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    return {
      referrer: referrerHeader,
      referrerDomain: hostname || 'Unknown',
    };
  } catch {
    return {
      referrer: referrerHeader,
      referrerDomain: 'Direct',
    };
  }
}
