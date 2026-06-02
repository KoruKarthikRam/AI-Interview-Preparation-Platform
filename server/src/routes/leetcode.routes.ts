import { Router } from 'express';
import {
  createSession,
  submitExplanation,
  listSessions,
  getSession,
} from '../controllers/leetcode.controller';
import { authenticateJWT } from '../middleware/jwt.middleware';

const router = Router();

// Protect all routes
router.use(authenticateJWT);

router.post('/session', createSession);
router.get('/session', listSessions);
router.get('/session/:id', getSession);
router.post('/session/:id/explain', submitExplanation);

export default router;
