import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/jwt.middleware';

const router = Router();

router.get('/', authenticateJWT, getAnalytics);

export default router;
