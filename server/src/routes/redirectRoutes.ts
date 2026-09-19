import { Router } from 'express';
import { RedirectController } from '../controllers/redirectController';
import { redirectLimiter } from '../middleware/rateLimiter';

const router = Router();

// 302 Redirection route: GET /r/:shortCode
router.get('/:shortCode', redirectLimiter, RedirectController.handleRedirect);

export default router;
