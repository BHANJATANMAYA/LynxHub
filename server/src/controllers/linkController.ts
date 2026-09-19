import { Response, NextFunction } from 'express';
import { LinkService } from '../services/linkService';
import { apiSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class LinkController {
  static async createLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destinationUrl, customSlug, title } = req.body;
      const link = await LinkService.createLink({
        userId: req.user!.id,
        destinationUrl,
        customSlug,
        title,
      });

      apiSuccess(res, { link }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUserLinks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search ? (req.query.search as string) : undefined;

      const result = await LinkService.getUserLinks({
        userId: req.user!.id,
        page,
        limit,
        search,
      });

      apiSuccess(res, result.links, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  static async getLinkById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await LinkService.getLinkById(req.user!.id, req.params.id);
      apiSuccess(res, { link }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await LinkService.deleteLink(req.user!.id, req.params.id);
      apiSuccess(res, { message: 'Short link deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }
}
