import { Request, Response, NextFunction } from 'express';
import { BioService } from '../services/bioService';
import { apiSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../types';

export class BioController {
  static async getMyBio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await BioService.getProfileByUserId(req.user!.id);
      apiSuccess(res, { profile }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateMyBio(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedProfile = await BioService.updateProfile(req.user!.id, req.body);
      apiSuccess(res, { profile: updatedProfile }, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicBio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const publicProfile = await BioService.getPublicProfile(req.params.username);
      apiSuccess(res, { profile: publicProfile }, 200);
    } catch (error) {
      next(error);
    }
  }
}
