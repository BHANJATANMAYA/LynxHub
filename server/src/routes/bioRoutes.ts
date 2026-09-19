import { Router } from 'express';
import { BioController } from '../controllers/bioController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateBioSchema,
  bioUsernameParamSchema,
} from '../validators/bioValidators';

const router = Router();

// Public route to view creator bio profiles
router.get('/:username', validate(bioUsernameParamSchema), BioController.getPublicBio);

// Authenticated routes to view and update user's own profile
router.get('/me', authenticateToken, BioController.getMyBio);
router.put('/me', authenticateToken, validate(updateBioSchema), BioController.updateMyBio);

export default router;
