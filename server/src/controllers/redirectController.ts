import { Request, Response, NextFunction } from 'express';
import { LinkService } from '../services/linkService';
import { TelemetryService } from '../services/telemetryService';
import { parseDeviceType, parseReferrerDomain } from '../utils/uaParser';
import { hashIp } from '../utils/hash';
import { AppError } from '../utils/AppError';

export class RedirectController {
  static async handleRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shortCode } = req.params;

      if (!shortCode || !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
        throw AppError.notFound('Invalid or malformed short link.', 'INVALID_SHORT_CODE');
      }

      // 1. Indexed lookup
      const link = await LinkService.resolveShortCode(shortCode);

      if (!link) {
        // Return 404
        throw AppError.notFound(
          `The short link "/r/${shortCode}" does not exist or has been removed.`,
          'LINK_NOT_FOUND'
        );
      }

      // 2. Dispatch telemetry logging asynchronously (DO NOT await - non-blocking!)
      const userAgent = req.headers['user-agent'] as string | undefined;
      const rawReferrer = (req.headers['referer'] || req.headers['referrer']) as string | undefined;
      const { referrer, referrerDomain } = parseReferrerDomain(rawReferrer);
      const deviceType = parseDeviceType(userAgent);
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
      const ipHash = hashIp(clientIp);

      TelemetryService.recordClickAsync({
        shortLinkId: link._id.toString(),
        userId: link.userId.toString(),
        timestamp: new Date(),
        referrer,
        referrerDomain,
        deviceType,
        ipHash,
      });

      // 3. Perform immediate HTTP 302 Found redirect
      res.redirect(302, link.destinationUrl);
    } catch (error) {
      next(error);
    }
  }
}
