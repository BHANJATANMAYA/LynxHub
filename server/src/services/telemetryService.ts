import { Types } from 'mongoose';
import { ClickEvent } from '../models/ClickEvent';
import { ShortLink } from '../models/ShortLink';
import { ClickTelemetryData } from '../types';

export class TelemetryService {
  /**
   * Records click telemetry completely asynchronously without blocking
   * the client redirect response.
   */
  static recordClickAsync(data: ClickTelemetryData): void {
    setImmediate(async () => {
      try {
        const shortObjectId = new Types.ObjectId(data.shortLinkId);
        const userObjectId = new Types.ObjectId(data.userId);

        // 1. Create ClickEvent record
        await ClickEvent.create({
          shortLinkId: shortObjectId,
          userId: userObjectId,
          timestamp: data.timestamp,
          referrer: data.referrer,
          referrerDomain: data.referrerDomain,
          deviceType: data.deviceType,
          ipHash: data.ipHash,
        });

        // 2. Increment ShortLink click count atomically
        await ShortLink.findByIdAndUpdate(shortObjectId, {
          $inc: { clickCount: 1 },
        });
      } catch (err) {
        // Silently log background telemetry failures to avoid crashing worker
        console.error('❌ [Telemetry Service] Error recording asynchronous click event:', err);
      }
    });
  }
}
