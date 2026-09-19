import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  analyticsQuerySchema,
  linkIdParamSchema,
} from '../validators/linkValidators';

const router = Router();

// Enforce authentication for analytics routes
router.use(authenticateToken);

router.get('/overview', validate(analyticsQuerySchema), AnalyticsController.getOverviewAnalytics);
router.get('/links/:id', validate(linkIdParamSchema), validate(analyticsQuerySchema), AnalyticsController.getLinkAnalytics);

export default router;
