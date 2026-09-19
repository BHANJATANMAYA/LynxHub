import { Types } from 'mongoose';
import { ClickEvent } from '../models/ClickEvent';
import { ShortLink } from '../models/ShortLink';
import { AppError } from '../utils/AppError';
import { AnalyticsPeriod } from '../types';

export interface AnalyticsResult {
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    topDevice: string;
    topReferrer: string;
    latestClickAt: Date | null;
  };
  clicksOverTime: Array<{
    date: string;
    clicks: number;
  }>;
  deviceDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topReferrers: Array<{
    domain: string;
    count: number;
    percentage: number;
  }>;
  recentClicks: Array<{
    id: string;
    timestamp: Date;
    referrer: string;
    referrerDomain: string;
    deviceType: string;
  }>;
}

export class AnalyticsService {
  /**
   * Helper to compute date threshold based on requested period.
   */
  private static getDateCutoff(period: AnalyticsPeriod): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'all':
      default:
        return new Date(0); // Epoch start
    }
  }

  /**
   * Generates a continuous daily array of dates between start and today
   * to ensure charts have no discontinuous gaps.
   */
  private static fillDateGaps(
    aggregatedData: Array<{ _id: string; count: number }>,
    startDate: Date,
    endDate: Date = new Date()
  ): Array<{ date: string; clicks: number }> {
    const map = new Map<string, number>();
    aggregatedData.forEach((item) => {
      map.set(item._id, item.count);
    });

    const result: Array<{ date: string; clicks: number }> = [];
    const current = new Date(startDate);
    // Normalize to YYYY-MM-DD
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // If start date is epoch 0, start from 30 days ago or earliest data point
    if (startDate.getTime() === 0) {
      if (aggregatedData.length > 0) {
        current.setTime(new Date(aggregatedData[0]._id).getTime());
      } else {
        current.setTime(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    while (current <= end) {
      const dateStr = current.toISOString().slice(0, 10);
      result.push({
        date: dateStr,
        clicks: map.get(dateStr) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  /**
   * Detailed analytics for a specific short link owned by the user.
   */
  static async getLinkAnalytics(
    userId: string,
    linkId: string,
    period: AnalyticsPeriod = '30d'
  ): Promise<AnalyticsResult & { link: any }> {
    const linkObjectId = new Types.ObjectId(linkId);
    const userObjectId = new Types.ObjectId(userId);

    // Verify ownership
    const link = await ShortLink.findOne({ _id: linkObjectId, userId: userObjectId });
    if (!link) {
      throw AppError.notFound('Short link not found or access denied.', 'LINK_NOT_FOUND');
    }

    const dateCutoff = this.getDateCutoff(period);
    const matchCriteria = {
      shortLinkId: linkObjectId,
      timestamp: { $gte: dateCutoff },
    };

    const analytics = await this.runAnalyticsAggregation(matchCriteria, dateCutoff);

    return {
      link: {
        id: link._id.toString(),
        shortCode: link.shortCode,
        destinationUrl: link.destinationUrl,
        title: link.title,
        clickCount: link.clickCount,
        createdAt: link.createdAt,
      },
      ...analytics,
    };
  }

  /**
   * Account-wide aggregate analytics across all links owned by the user.
   */
  static async getOverviewAnalytics(
    userId: string,
    period: AnalyticsPeriod = '30d'
  ): Promise<AnalyticsResult & { totalLinks: number }> {
    const userObjectId = new Types.ObjectId(userId);
    const dateCutoff = this.getDateCutoff(period);

    const totalLinks = await ShortLink.countDocuments({ userId: userObjectId });

    const matchCriteria = {
      userId: userObjectId,
      timestamp: { $gte: dateCutoff },
    };

    const analytics = await this.runAnalyticsAggregation(matchCriteria, dateCutoff);

    return {
      totalLinks,
      ...analytics,
    };
  }

  /**
   * Shared MongoDB aggregation pipeline execution.
   */
  private static async runAnalyticsAggregation(
    matchCriteria: any,
    dateCutoff: Date
  ): Promise<AnalyticsResult> {
    const [
      summaryResult,
      clicksOverTimeResult,
      deviceDistributionResult,
      topReferrersResult,
      recentClicksResult,
    ] = await Promise.all([
      // 1. Overall Summary & Unique IPs
      ClickEvent.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: null,
            totalClicks: { $sum: 1 },
            uniqueIps: { $addToSet: '$ipHash' },
            latestClickAt: { $max: '$timestamp' },
          },
        },
        {
          $project: {
            _id: 0,
            totalClicks: 1,
            uniqueVisitors: { $size: '$uniqueIps' },
            latestClickAt: 1,
          },
        },
      ]),

      // 2. Clicks over time (grouped by YYYY-MM-DD)
      ClickEvent.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 3. Device breakdown
      ClickEvent.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: '$deviceType',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 4. Top referrers
      ClickEvent.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: '$referrerDomain',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 5. Recent Clicks
      ClickEvent.find(matchCriteria)
        .sort({ timestamp: -1 })
        .limit(15)
        .lean(),
    ]);

    const totalClicks = summaryResult[0]?.totalClicks || 0;
    const uniqueVisitors = summaryResult[0]?.uniqueVisitors || 0;
    const latestClickAt = summaryResult[0]?.latestClickAt || null;

    // Format Device Distribution with percentages
    const deviceDistribution = (['Desktop', 'Mobile', 'Tablet', 'Unknown'] as const).map((device) => {
      const found = deviceDistributionResult.find((d: any) => d._id === device);
      const count = found ? found.count : 0;
      const percentage = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
      return {
        name: device,
        count,
        percentage,
      };
    });

    const topDevice =
      deviceDistributionResult.length > 0 ? deviceDistributionResult[0]._id : 'None';

    // Format Top Referrers with percentages
    const topReferrers = topReferrersResult.map((r: any) => ({
      domain: r._id || 'Direct',
      count: r.count,
      percentage: totalClicks > 0 ? Math.round((r.count / totalClicks) * 100) : 0,
    }));

    const topReferrer = topReferrers.length > 0 ? topReferrers[0].domain : 'Direct / None';

    // Fill gaps for smooth charting
    const clicksOverTime = this.fillDateGaps(
      clicksOverTimeResult,
      dateCutoff.getTime() === 0 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : dateCutoff
    );

    const formattedRecentClicks = recentClicksResult.map((item: any) => ({
      id: item._id.toString(),
      timestamp: item.timestamp,
      referrer: item.referrer,
      referrerDomain: item.referrerDomain,
      deviceType: item.deviceType,
    }));

    return {
      summary: {
        totalClicks,
        uniqueVisitors,
        topDevice,
        topReferrer,
        latestClickAt,
      },
      clicksOverTime,
      deviceDistribution,
      topReferrers,
      recentClicks: formattedRecentClicks,
    };
  }
}
