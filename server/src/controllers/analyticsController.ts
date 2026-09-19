import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { apiSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest, AnalyticsPeriod } from '../types';

export class AnalyticsController {
  static async getLinkAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const linkId = req.params.id;
      const period = (req.query.period as AnalyticsPeriod) || '30d';

      const data = await AnalyticsService.getLinkAnalytics(req.user!.id, linkId, period);
      apiSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getOverviewAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as AnalyticsPeriod) || '30d';
      const data = await AnalyticsService.getOverviewAnalytics(req.user!.id, period);
      apiSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}
