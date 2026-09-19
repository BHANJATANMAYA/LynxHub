import { Router } from 'express';
import { LinkController } from '../controllers/linkController';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { linkCreateLimiter } from '../middleware/rateLimiter';
import {
  createLinkSchema,
  getLinksQuerySchema,
  linkIdParamSchema,
  analyticsQuerySchema,
} from '../validators/linkValidators';

const router = Router();

// Enforce authentication for all link routes
router.use(authenticateToken);

router.post('/', linkCreateLimiter, validate(createLinkSchema), LinkController.createLink);
router.get('/', validate(getLinksQuerySchema), LinkController.getUserLinks);
router.get('/:id', validate(linkIdParamSchema), LinkController.getLinkById);
router.delete('/:id', validate(linkIdParamSchema), LinkController.deleteLink);
router.get('/:id/analytics', validate(linkIdParamSchema), validate(analyticsQuerySchema), AnalyticsController.getLinkAnalytics);

export default router;
